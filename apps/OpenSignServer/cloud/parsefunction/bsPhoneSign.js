// "Sign on phone": the signer approves a signature or initials field in their
// BetterSign phone app instead of drawing it. Only for a session from "Sign in
// with BetterSign" (utils/bsWebSession.js): that gives us the signer's VLAD,
// so there is nothing to type, no phone number.
//
//   1. bsphonesignstart { docId, fieldId, kind }
//      We push a request to the identity through the BetterSign relay
//      (customRoute/bsapi/relay.js): straight to the app if it's open,
//      otherwise the relay wakes the phone with FCM.
//      -> { requestId, delivery, expiresAt }
//   2. bsphonesignpoll { requestId, delivery }   (repeat while pending)
//      Long-polls the relay for the app's answer. The app signs a
//      bs-docsign-field statement (statement.js) with /keys/primary in
//      bs-message's canonical form; we check it names this document, field,
//      challenge, site and the image it sent, and the verifier checks the
//      signature.
//      -> { status: pending, delivery } | { status: signed, image }
//       | { status: denied | expired | failed, message? }
//
// The approved image goes into the field through the normal signing path.
// Protocol: docs/BetterSignPhoneSign.md (repo root).

import crypto from 'node:crypto';
import { bsIdSessionVlad } from '../../utils/bsWebSession.js';
import { config } from '../customRoute/bsapi/auth.js';
import { findAccessibleDocument, signerState } from '../customRoute/bsapi/documents.js';
import { ensureReceiverVlad } from '../customRoute/bsapi/receiverVlad.js';
import {
  buildRequestEnvelope,
  newX25519,
  openEnvelope,
  relayCall,
  relayKey,
  RESPONSE_CT,
  sha256,
} from '../customRoute/bsapi/relay.js';
import { buildSignedMessage, decodeCbor, parseStatement } from '../customRoute/bsapi/statement.js';
import { verifySignature } from '../customRoute/bsapi/verifier.js';

const CLASS = 'bs_PhoneSignRequest';
// How long the phone has to answer. The relay allows at most 300 s.
const REQUEST_TTL_S = 180;
const POLL_WAIT_S = 20;
// Clock difference allowed between the phone and us.
const CLOCK_SKEW_S = 60;
// Unsigned rows are deleted this long after they expire.
const SWEEP_AFTER_MS = 10 * 60 * 1000;
const MAX_IMAGE_BYTES = 512 * 1024;
const KINDS = ['signature', 'initials'];
const ID_RE = /^[A-Za-z0-9]{1,32}$/;
const FIELD_RE = /^[A-Za-z0-9_.:-]{1,128}$/;
const DELIVERY = ['live', 'seen', 'pushed', 'queued'];
const PNG_MAGIC = Buffer.from('89504e470d0a1a0a', 'hex');

const b64u = b => Buffer.from(b).toString('base64url');
const nowSec = () => Math.floor(Date.now() / 1000);
const err = (code, msg) => new Parse.Error(code, msg);

function log(event, fields) {
  console.log(JSON.stringify({ event: `bsphonesign_${event}`, ...fields }));
}

// The request's one-time X25519 secret is kept encrypted under a key derived
// from the master key, bound to the request id, until the request settles.
const secretKey = () =>
  Buffer.from(
    crypto.hkdfSync(
      'sha256',
      String(process.env.MASTER_KEY || ''),
      '',
      'bs-phonesign/eph-secret/v1',
      32
    )
  );

export function sealEphSecret(secret, reqIdHex) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  c.setAAD(Buffer.from(reqIdHex));
  return b64u(Buffer.concat([iv, c.update(secret), c.final(), c.getAuthTag()]));
}

export function openEphSecret(sealed, reqIdHex) {
  const b = Buffer.from(sealed, 'base64url');
  const d = crypto.createDecipheriv('aes-256-gcm', secretKey(), b.subarray(0, 12));
  d.setAAD(Buffer.from(reqIdHex));
  d.setAuthTag(b.subarray(b.length - 16));
  return Buffer.concat([d.update(b.subarray(12, b.length - 16)), d.final()]);
}

async function signerVlad(request) {
  if (!request.user) throw err(Parse.Error.INVALID_SESSION_TOKEN, 'Please sign in again.');
  const vlad = await bsIdSessionVlad(request);
  if (!vlad) {
    throw err(
      Parse.Error.OPERATION_FORBIDDEN,
      'Sign on phone needs a Sign in with BetterSign session.'
    );
  }
  return vlad;
}

async function siteConfig() {
  await ensureReceiverVlad();
  const c = config();
  if (!c.receiverVlad) {
    throw err(Parse.Error.INTERNAL_SERVER_ERROR, 'Sign on phone is not set up on this server.');
  }
  return c;
}

// Can this user sign this document now? null if so, else why not. A document
// you sign yourself has no signer contacts: its owner signs it until it's
// finished. Everything else follows signerState (a pending signer, their turn).
export function cannotSign(doc, userId, now = new Date()) {
  if (doc.get('IsSignyourself')) {
    if (doc.get('CreatedBy')?.id !== userId) return "You can't sign this document.";
    if (doc.get('IsArchive')) return 'This document was deleted.';
    if (doc.get('IsCompleted')) return 'This document is already signed.';
    const expiry = doc.get('ExpiryDate');
    if (expiry && expiry < now) return 'This document has expired.';
    return null;
  }
  const state = signerState(doc, userId, now);
  return state.canSign ? null : state.message;
}

export async function bsphonesignstart(request) {
  const { docId, kind = 'signature' } = request.params || {};
  // Widget keys are numbers in the web app; the protocol carries text.
  const fieldId = request.params?.fieldId == null ? '' : String(request.params.fieldId);
  if (!ID_RE.test(String(docId || '')) || !FIELD_RE.test(fieldId) || !KINDS.includes(kind)) {
    throw err(Parse.Error.INVALID_QUERY, 'Missing or malformed document or field.');
  }
  const vlad = await signerVlad(request);
  const user = request.user;
  const c = await siteConfig();
  const doc = await findAccessibleDocument(docId, user.id);
  if (!doc) throw err(Parse.Error.OBJECT_NOT_FOUND, 'No such document, or no access to it.');
  const why = cannotSign(doc, user.id);
  if (why) throw err(Parse.Error.OPERATION_FORBIDDEN, why);

  const key = await relayKey();
  const reqId = crypto.randomBytes(16);
  const challenge = crypto.randomBytes(32);
  const eph = newX25519();
  const iat = nowSec();
  const exp = iat + REQUEST_TTL_S;
  const to = sha256(Buffer.from(vlad, 'hex'));

  // The row first, so the phone never gets a request we can't finish.
  const row = new Parse.Object(CLASS);
  row.set('ReqId', reqId.toString('hex'));
  row.set('UserId', { __type: 'Pointer', className: '_User', objectId: user.id });
  row.set('vlad', vlad);
  row.set('DocId', docId);
  row.set('FieldId', fieldId);
  row.set('Kind', kind);
  row.set('Challenge', challenge.toString('hex'));
  row.set('EphSecret', sealEphSecret(eph.secret, reqId.toString('hex')));
  row.set('Status', 'pending');
  row.set('IssuedAt', new Date(iat * 1000));
  row.set('ExpiresAt', new Date(exp * 1000));
  row.setACL(new Parse.ACL());
  await row.save(null, { useMasterKey: true });
  sweep();

  // No document title: the request isn't sealed, and whoever holds the relay
  // binding for this identity reads it. The app looks the document up itself.
  const env = buildRequestEnvelope({
    key,
    to,
    reqId,
    iat,
    exp,
    request: {
      v: 1,
      reqId,
      origin: c.origin,
      rp: c.rp,
      receiverVlad: Buffer.from(c.receiverVlad, 'hex'),
      docId,
      fieldId,
      kind,
      challenge,
      ephPub: eph.pub,
      iat,
      exp,
    },
  });

  const unsent = async (error, msg, logFields) => {
    log(logFields.event, { vlad: vlad.slice(0, 16), ...logFields.fields });
    await row.destroy({ useMasterKey: true }).catch(() => {});
    throw err(error, msg);
  };
  let res;
  try {
    res = await relayCall(key, 'POST', '/v1/req', {
      body: { env: b64u(env), to: b64u(to), reqId: b64u(reqId), exp },
    });
  } catch (e) {
    return unsent(
      Parse.Error.CONNECTION_FAILED,
      "Couldn't reach the BetterSign relay. Try again.",
      {
        event: 'relay_unreachable',
        fields: { error: e.message },
      }
    );
  }
  if (res.status !== 202) {
    const refused = {
      event: 'relay_refused',
      fields: { status: res.status, error: res.body.error },
    };
    if (res.body.error === 'unknown-recipient') {
      return unsent(
        Parse.Error.OBJECT_NOT_FOUND,
        "Your BetterSign app hasn't connected yet. Open the app on your phone, then try again.",
        refused
      );
    }
    if (res.status === 429) {
      return unsent(
        Parse.Error.REQUEST_LIMIT_EXCEEDED,
        'Too many requests to your phone. Wait a little and try again.',
        refused
      );
    }
    return unsent(
      Parse.Error.CONNECTION_FAILED,
      "Couldn't send the request to your phone. Try again.",
      refused
    );
  }

  const delivery = DELIVERY.includes(res.body.delivery) ? res.body.delivery : 'queued';
  log('sent', { vlad: vlad.slice(0, 16), userId: user.id, docId, delivery });
  return { requestId: row.id, delivery, expiresAt: new Date(exp * 1000).toISOString() };
}

export async function bsphonesignpoll(request) {
  const { requestId, delivery } = request.params || {};
  if (!ID_RE.test(String(requestId || '')))
    throw err(Parse.Error.INVALID_QUERY, 'Missing request.');
  const vlad = await signerVlad(request);
  const row = await new Parse.Query(CLASS).get(requestId, { useMasterKey: true }).catch(() => null);
  if (!row || row.get('UserId')?.id !== request.user.id || row.get('vlad') !== vlad) {
    throw err(Parse.Error.OBJECT_NOT_FOUND, 'No such request.');
  }
  const status = row.get('Status');
  if (status === 'signed') return { status, image: row.get('Image') };
  if (status !== 'pending') return { status };
  if (row.get('ExpiresAt') < new Date()) return finish(row, 'expired');

  const key = await relayKey();
  const reqId = Buffer.from(row.get('ReqId'), 'hex');
  const known = DELIVERY.includes(delivery) ? delivery : undefined;
  let res;
  try {
    res = await relayCall(key, 'GET', `/v1/resp/${b64u(reqId)}`, {
      query: { wait: POLL_WAIT_S, ...(known && { delivery: known }) },
      timeout: (POLL_WAIT_S + 10) * 1000,
    });
  } catch {
    return { status: 'pending', delivery: known, retry: true };
  }
  if (res.status === 202 || res.status === 204) {
    return {
      status: 'pending',
      delivery: DELIVERY.includes(res.body.delivery) ? res.body.delivery : known,
    };
  }
  if (res.status === 410) return finish(row, 'expired');
  if (res.status !== 200 || typeof res.body.env !== 'string') {
    log('relay_poll_failed', { status: res.status, error: res.body.error });
    return { status: 'pending', delivery: known, retry: true };
  }
  return answer(row, vlad, Buffer.from(res.body.env, 'base64url'));
}

// The app's answer: open it, check it, verify the VLAD's signature.
async function answer(row, vlad, envBytes) {
  const c = await siteConfig();
  const reqIdHex = row.get('ReqId');
  const reqId = Buffer.from(reqIdHex, 'hex');
  const reject = (reason, extra = {}) => {
    log('rejected', { vlad: vlad.slice(0, 16), reason, ...extra });
    return finish(row, 'failed', "Your phone's answer couldn't be verified.");
  };

  let r;
  try {
    const opened = openEnvelope(envBytes, {
      ct: RESPONSE_CT,
      recipientSecret: openEphSecret(row.get('EphSecret'), reqIdHex),
      reqId,
    });
    r = decodeCbor(opened.plaintext);
  } catch (e) {
    return reject('envelope', { error: e.message });
  }
  if (!(r instanceof Map) || r.get('v') !== 1 || !Buffer.from(r.get('reqId') || []).equals(reqId)) {
    return reject('response');
  }
  const result = r.get('result');
  if (result === 'denied') return finish(row, 'denied');
  if (result !== 'ok') return reject('result', { result, reason: r.get('reason') });

  const statement = r.get('statement');
  const vladSig = r.get('vladSig');
  const image = r.get('image');
  if (![statement, vladSig, image].every(b => b instanceof Uint8Array)) return reject('fields');
  if (image.length > MAX_IMAGE_BYTES || !Buffer.from(image.subarray(0, 8)).equals(PNG_MAGIC)) {
    return reject('image');
  }
  let s;
  try {
    s = parseStatement(statement, 'bs-docsign-field');
  } catch (e) {
    return reject('statement', { error: e.message });
  }
  // Signed while the request was open: judged against the request, not the
  // time of this poll, so a verifier outage can't age a good answer out.
  const issued = Math.floor(row.get('IssuedAt').getTime() / 1000);
  const expires = Math.floor(row.get('ExpiresAt').getTime() / 1000);
  const checks = {
    vlad: Buffer.from(s.vlad).toString('hex') === vlad,
    origin: s.origin === c.origin,
    rp: s.rp === c.rp,
    docId: s.docId === row.get('DocId'),
    fieldId: s.fieldId === row.get('FieldId'),
    challenge: Buffer.from(s.challenge).toString('hex') === row.get('Challenge'),
    reqId: Buffer.from(s.reqId).equals(reqId),
    imageHash: Buffer.from(s.imageHash).equals(sha256(image)),
    iat: s.iat >= issued - CLOCK_SKEW_S && s.iat <= expires + CLOCK_SKEW_S,
  };
  const wrong = Object.keys(checks).find(k => !checks[k]);
  if (wrong) return reject(wrong);

  const message = buildSignedMessage({
    senderVlad: Buffer.from(vlad, 'hex'),
    receiverVlad: Buffer.from(c.receiverVlad, 'hex'),
    type: 'bs-docsign-field',
    body: Buffer.from(statement),
  });
  const v = await verifySignature({
    vladHex: vlad,
    messageHex: message.toString('hex'),
    signatureHex: Buffer.from(vladSig).toString('hex'),
    rp: c.rp,
  });
  if (!v.ok) {
    // The relay keeps the answer until the request expires, so a verifier
    // outage just means another poll.
    if (v.unavailable) return { status: 'pending', retry: true };
    return reject('signature', { code: v.code });
  }

  const dataUrl = 'data:image/png;base64,' + Buffer.from(image).toString('base64');
  row.set('Statement', b64u(statement));
  row.set('Signature', b64u(vladSig));
  row.set('Image', dataUrl);
  row.set('SignedAt', new Date());
  log('signed', { vlad: vlad.slice(0, 16), docId: row.get('DocId') });
  await finish(row, 'signed');
  return { status: 'signed', image: dataUrl };
}

// Settle the request: the one-time key is no longer needed.
async function finish(row, status, message) {
  row.set('Status', status);
  row.unset('EphSecret');
  await row.save(null, { useMasterKey: true });
  return message ? { status, message } : { status };
}

// Best-effort sweep of unsigned rows shortly after they expire (with any
// one-time key a request never settled); never blocks or fails the request.
// Signed rows stay: they hold the statement and signature.
function sweep() {
  new Parse.Query(CLASS)
    .notEqualTo('Status', 'signed')
    .lessThan('ExpiresAt', new Date(Date.now() - SWEEP_AFTER_MS))
    .limit(100)
    .find({ useMasterKey: true })
    .then(rows => rows.length && Parse.Object.destroyAll(rows, { useMasterKey: true }))
    .catch(() => {});
}
