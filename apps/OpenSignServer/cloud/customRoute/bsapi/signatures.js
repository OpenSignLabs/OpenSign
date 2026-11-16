// POST /documents/:id/signatures: a signer's PDF, signed on the desktop.
//
// The desktop app downloads the current file (GET /documents/:id/file, with
// X-Content-SHA256), adds a signature field and its PAdES signature as
// incremental updates (lopdf + bs-pades), and uploads the result with a
// bs-docsign statement signed by the identity's /keys/primary. We accept it
// only if it is the current file with a signature appended that covers it
// all, from the signer whose turn it is, vouched for by the verifier. From
// then on the document is append-only (utils/appendOnlyPdf.js): online
// signers and OpenSign's seal append too, so this signature keeps verifying.
//
// Body (JSON): { pdf: <base64>, statement | message: <b64url>, signature: <b64url Multisig> }
// `statement` is the bs-docsign CBOR; `message` the full canonical signed
// message carrying it (statement.js buildSignedMessage).

import crypto from 'node:crypto';
import {
  appendedSignatureCoveringFile,
  extendsPdf,
  readDocumentPdf,
} from '../../../utils/appendOnlyPdf.js';
import { finishSigning } from '../../parsefunction/pdf/PDF.js';
import { notifyNextSigner } from './notify.js';
import { apiError, checkSignedFields, config, notConfigured } from './auth.js';
import { findAccessibleDocument, signerState, toPublicDocument } from './documents.js';
import { ensureReceiverVlad } from './receiverVlad.js';
import { parseStatement, signedMessageFrom } from './statement.js';
import { verifySignature } from './verifier.js';

const STATEMENT_SKEW_S = 120;
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_STATEMENT_BYTES = 8192;
const B64_RE = /^[A-Za-z0-9+/_-]+={0,2}$/;

const sha256 = b => crypto.createHash('sha256').update(b).digest();

function log(event, fields) {
  console.log(JSON.stringify({ event: `bsapi_${event}`, ...fields }));
}

export async function uploadSignature(req, res) {
  const { vlad, user } = req.bs;
  await ensureReceiverVlad();
  const c = config();
  if (!c.receiverVlad) return notConfigured(res);
  const { pdf, signature } = req.body || {};
  if (typeof pdf !== 'string' || !B64_RE.test(pdf)) {
    return apiError(res, 400, 'invalid_request', 'pdf must be the signed PDF in base64.');
  }
  const bad = checkSignedFields(req.body, MAX_STATEMENT_BYTES);
  if (bad) return apiError(res, 400, 'invalid_request', bad);
  const pdfBytes = Buffer.from(pdf, 'base64');
  if (pdfBytes.length > MAX_PDF_BYTES || pdfBytes.subarray(0, 5).toString() !== '%PDF-') {
    return apiError(res, 400, 'invalid_pdf', 'pdf is not a PDF, or is too large.');
  }

  // 1. The document, and this caller's turn to sign it.
  const found = await findAccessibleDocument(req.params.id, user.id);
  if (!found) return apiError(res, 404, 'not_found', 'No such document, or no access to it.');
  const doc = await loadForSigning(found.id);
  const state = signerState(doc, user.id);
  if (!state.canSign) return apiError(res, 409, state.reason, state.message);

  // 2. The statement: this identity, this site, this document, these bytes.
  // Signed as the canonical message from this identity to us.
  let signed;
  let s;
  try {
    signed = signedMessageFrom(req.body, {
      senderVlad: Buffer.from(vlad, 'hex'),
      receiverVlad: Buffer.from(c.receiverVlad, 'hex'),
      type: 'bs-docsign',
    });
    s = parseStatement(signed.statementBytes, 'bs-docsign');
  } catch (e) {
    return apiError(res, 400, 'invalid_statement', e.message);
  }
  const deny = (message, reason) => {
    log('upload_denied', { vlad: vlad.slice(0, 16), docId: doc.id, reason });
    return apiError(res, 401, 'access_denied', message);
  };
  if (Buffer.from(s.vlad).toString('hex') !== vlad) {
    return deny('The statement is for another identity.', 'vlad');
  }
  if (s.origin !== c.origin) return deny('The statement is for another site.', 'origin');
  if (s.rp !== c.rp) return deny('The statement is for another application.', 'rp');
  if (s.docId !== doc.id) return deny('The statement is for another document.', 'docId');
  if (Math.abs(Math.floor(Date.now() / 1000) - s.iat) > STATEMENT_SKEW_S) {
    return deny('The statement is too old (check the clock).', 'iat');
  }
  if (!sha256(pdfBytes).equals(Buffer.from(s.file))) {
    return deny('The statement is for a different file.', 'file');
  }

  // 3. The upload is the current file with a signature appended over all of it.
  // The file and the revision come from the same read of the document, so a
  // commit at this revision is a commit on top of this file (finishSigning).
  const baseRevision = doc.get('SignRevision') || 0;
  let current;
  try {
    current = await readDocumentPdf(doc.get('SignedUrl') || doc.get('URL'));
  } catch (e) {
    console.log('bsapi: base download failed', doc.id, e?.message);
    return apiError(res, 502, 'file_unavailable', "Couldn't read the document's file.");
  }
  if (!sha256(current).equals(Buffer.from(s.base))) {
    return apiError(
      res,
      409,
      'stale_base',
      'The document changed since you downloaded it. Download it again and re-sign.'
    );
  }
  if (!extendsPdf(current, pdfBytes)) {
    return apiError(
      res,
      400,
      'not_appended',
      'The signed PDF must be the downloaded file with the signature appended (an incremental update).'
    );
  }
  const appended = appendedSignatureCoveringFile(current, pdfBytes);
  if (!appended) {
    return apiError(
      res,
      400,
      'no_signature',
      'No signature in the appended bytes covers the whole file.'
    );
  }

  // 4. The identity's /keys/primary signed the statement.
  const v = await verifySignature({
    vladHex: vlad,
    messageHex: signed.message.toString('hex'),
    signatureHex: Buffer.from(signature, 'base64url').toString('hex'),
    rp: c.rp,
  });
  if (!v.ok) {
    log('upload_verify_failed', { vlad: vlad.slice(0, 16), docId: doc.id, code: v.code });
    if (v.misconfigured) {
      console.error('bsapi: the verifier refused BS_VERIFIER_SECRET (wrong or not set)');
      return apiError(
        res,
        502,
        'verifier_misconfigured',
        "This server's BetterSign verifier secret is wrong or not set. Ask the administrator.",
        { code: v.code }
      );
    }
    if (v.unavailable) {
      return apiError(
        res,
        503,
        'verifier_unavailable',
        "Couldn't check the signature right now. Try again.",
        { code: v.code }
      );
    }
    return apiError(res, 401, 'access_denied', "The identity's signature didn't verify.", {
      code: v.code,
    });
  }

  // 5. Record it, exactly as an online signature, but append-only.
  const fileSha256 = sha256(pdfBytes).toString('hex');
  const entry = {
    vlad,
    signerId: state.contact.id,
    fileSha256,
    baseSha256: sha256(current).toString('hex'),
    byteRange: appended.byteRange,
    reqId: Buffer.from(s.reqId).toString('hex'),
    signedAt: new Date().toISOString(),
  };
  const _resDoc = doc.toJSON();
  const tenant = _resDoc?.ExtUserPtr?.TenantId;
  try {
    await finishSigning({
      docId: doc.id,
      _resDoc,
      signUser: _resDoc.Signers.find(x => x.objectId === state.contact.id),
      className: 'contracts_Contactbook',
      pdfBuffer: pdfBytes,
      userIP: req.headers['x-real-ip'] || '',
      isCustomMail: !!(tenant?.CompletionBody && tenant?.CompletionSubject),
      // The website, for links in emails (public_url is this API's host).
      publicUrl: c.origin,
      appendOnly: true,
      baseRevision,
      auditExtra: { Vlad: vlad, SignedWith: 'BetterSign', SignedSha256: fileSha256 },
      docExtra: { VladSignatures: { __op: 'Add', objects: [entry] } },
    });
  } catch (e) {
    if (e?.stale) {
      return apiError(
        res,
        409,
        'stale_base',
        'The document changed since you downloaded it. Download it again and re-sign.'
      );
    }
    throw e;
  }
  log('signed', { vlad: vlad.slice(0, 16), docId: doc.id, userId: user.id, fileSha256 });

  const updated = await findAccessibleDocument(doc.id, user.id);
  if (!updated.get('IsCompleted')) {
    // The browser emails the next signer itself; there's no browser here.
    await notifyNextSigner(_resDoc, state.contact.id, c.origin);
  }
  return res.status(201).json({ ...toPublicDocument(updated, user.id), signedSha256: fileSha256 });
}

// The document with everything finishSigning needs (as signPdf loads it).
async function loadForSigning(id) {
  const q = new Parse.Query('contracts_Document');
  q.include('ExtUserPtr,Signers,ExtUserPtr.TenantId,Bcc,Cc,CreatedBy');
  return q.get(id, { useMasterKey: true });
}
