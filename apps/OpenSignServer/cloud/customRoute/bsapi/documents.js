// /api/v1 read endpoints: who am I, my documents, a document's PDF.
//
// Queries run with the master key and explicit owner / signer filters, the way
// getReport does, so access doesn't depend on each document's ACL. Responses
// use stable public field names, not OpenSign's internal ones.

import crypto from 'node:crypto';
import { isAppendOnly, readDocumentPdf } from '../../../utils/appendOnlyPdf.js';
import {
  COMPLETION_ACTIVITIES,
  findPendingPriorSigner,
  findPlaceholderIndex,
} from '../../../utils/workflowUtils.js';
import { apiError } from './auth.js';

const ID_RE = /^[A-Za-z0-9]{1,32}$/;
const ROLES = ['owner', 'signer'];
const STATUSES = ['draft', 'in_progress', 'completed', 'declined', 'expired'];
const MAX_LIMIT = 100;

const userPtr = id => ({ __type: 'Pointer', className: '_User', objectId: id });

// GET /me
export async function me(req, res) {
  const { user, vlad } = req.bs;
  return res.json({
    vlad,
    user: { id: user.id, email: user.get('email') || user.get('username'), name: user.get('name') },
  });
}

function signerContactsQuery(userId) {
  const q = new Parse.Query('contracts_Contactbook');
  q.equalTo('UserId', userPtr(userId));
  return q;
}

function baseQuery() {
  const q = new Parse.Query('contracts_Document');
  q.notEqualTo('IsArchive', true);
  q.notEqualTo('Type', 'Folder');
  q.include('Signers');
  q.include('CreatedBy');
  return q;
}

// The status filter, matching documentStatus(): a document with no
// ExpiryDate never expires.
function statusQuery(status, now = new Date()) {
  const q = () => new Parse.Query('contracts_Document');
  const open = () => {
    const o = q();
    o.notEqualTo('IsCompleted', true);
    o.notEqualTo('IsDeclined', true);
    return o;
  };
  switch (status) {
    case 'draft': {
      const d = open();
      d.doesNotExist('SignedUrl');
      return d;
    }
    case 'in_progress': {
      const notExpired = open();
      notExpired.exists('SignedUrl');
      notExpired.greaterThan('ExpiryDate', now);
      const noExpiry = open();
      noExpiry.exists('SignedUrl');
      noExpiry.doesNotExist('ExpiryDate');
      return Parse.Query.or(notExpired, noExpiry);
    }
    case 'completed': {
      const c = q();
      c.notEqualTo('IsDeclined', true);
      c.equalTo('IsCompleted', true);
      return c;
    }
    case 'declined': {
      const d = q();
      d.equalTo('IsDeclined', true);
      return d;
    }
    case 'expired': {
      const e = open();
      e.exists('SignedUrl');
      e.lessThan('ExpiryDate', now);
      return e;
    }
  }
  return null;
}

export function documentStatus(doc, now = new Date()) {
  if (doc.get('IsDeclined')) return 'declined';
  if (doc.get('IsCompleted')) return 'completed';
  if (!doc.get('SignedUrl')) return 'draft';
  const expiry = doc.get('ExpiryDate');
  if (expiry && expiry < now) return 'expired';
  return 'in_progress';
}

const no = (reason, message) => ({ canSign: false, reason, message });

// Can this user sign the document now? { canSign, contact, placeholder } or
// { canSign: false, reason, message }. The same gates as signPdf: a pending
// signer placeholder, and their turn when the document is sent in order.
export function signerState(doc, userId, now = new Date()) {
  if (doc.get('IsArchive')) return no('not_found', 'This document was deleted.');
  if (doc.get('IsDeclined')) return no('declined', 'This document was declined.');
  if (doc.get('IsCompleted')) return no('completed', 'Everyone has already signed.');
  if (!doc.get('SignedUrl')) return no('not_sent', "This document hasn't been sent yet.");
  const expiry = doc.get('ExpiryDate');
  if (expiry && expiry < now) return no('expired', 'This document has expired.');
  const contact = (doc.get('Signers') || []).find(s => s.get?.('UserId')?.id === userId);
  if (!contact) return no('not_a_signer', "You aren't a signer of this document.");
  // As JSON, like signPdf: the SDK decodes the pointers nested in these arrays
  // into Parse.Objects (.id), but the workflow helpers read .objectId.
  const json = doc.toJSON();
  const placeholders = (json.Placeholders || []).filter(p => p?.Role !== 'prefill');
  const idx = findPlaceholderIndex(placeholders, contact.id);
  if (idx === -1) return no('not_a_signer', 'You have no fields to sign in this document.');
  const audit = json.AuditTrail || [];
  const signed = audit.some(
    a => a?.UserPtr?.objectId === contact.id && COMPLETION_ACTIVITIES.includes(a?.Activity)
  );
  if (signed) return no('already_signed', 'You have already signed this document.');
  if (doc.get('SendinOrder') && findPendingPriorSigner(placeholders, idx, audit)) {
    return no('not_your_turn', 'Earlier signers have to sign first.');
  }
  return { canSign: true, contact, placeholder: placeholders[idx] };
}

// The placeholder's fields in PDF points: page (1-based), and x/y/width/height
// from the top-left of the page's crop box, as OpenSign places them. Fields
// placed on old mobile views are stored scaled; this undoes that, as
// embedWidgetsToDoc does.
export function placeholderFields(placeholder) {
  const out = [];
  for (const page of placeholder?.placeHolder || []) {
    for (const pos of page?.pos || []) {
      const scaled = pos.isMobile && pos.scale;
      const size = v => (v == null ? null : scaled && !pos.IsResize ? v * pos.scale : v);
      out.push({
        page: page.pageNumber,
        type: pos.type || 'signature',
        x: scaled ? pos.xPosition * pos.scale : pos.xPosition,
        y: scaled ? pos.yPosition * pos.scale : pos.yPosition,
        width: size(pos.Width),
        height: size(pos.Height),
      });
    }
  }
  return out;
}

export function toPublicDocument(doc, userId) {
  const audit = doc.get('AuditTrail') || [];
  const signedBy = new Set(
    audit
      .filter(a => COMPLETION_ACTIVITIES.includes(a?.Activity))
      .map(a => a?.UserPtr?.objectId || a?.UserPtr?.id)
  );
  const declinedBy = doc.get('DeclineBy');
  const createdBy = doc.get('CreatedBy');
  const turn = signerState(doc, userId);
  return {
    id: doc.id,
    name: doc.get('Name'),
    description: doc.get('Description') || null,
    note: doc.get('Note') || null,
    status: documentStatus(doc),
    role: createdBy?.id === userId ? 'owner' : 'signer',
    owner: createdBy
      ? { email: createdBy.get?.('email') || null, name: createdBy.get?.('name') || null }
      : null,
    signers: (doc.get('Signers') || []).map(s => ({
      id: s.id,
      email: s.get?.('Email') || null,
      name: s.get?.('Name') || null,
      signed: signedBy.has(s.id),
      signedWithBetterSign: audit.some(
        a => (a?.UserPtr?.objectId || a?.UserPtr?.id) === s.id && a?.Vlad
      ),
    })),
    appendOnly: isAppendOnly(doc),
    canSign: turn.canSign,
    cannotSignReason: turn.canSign ? null : turn.reason,
    myFields: turn.canSign ? placeholderFields(turn.placeholder) : [],
    sendInOrder: !!doc.get('SendinOrder'),
    declineReason: doc.get('IsDeclined') ? doc.get('DeclineReason') || null : null,
    declinedBy: declinedBy?.id || null,
    expiresAt: doc.get('ExpiryDate')?.toISOString() || null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// GET /documents?role=owner|signer&status=…&limit=&skip=
export async function listDocuments(req, res) {
  const userId = req.bs.user.id;
  const role = req.query.role || 'owner';
  const status = req.query.status;
  if (!ROLES.includes(role)) {
    return apiError(res, 400, 'invalid_request', `role must be one of ${ROLES.join(', ')}.`);
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return apiError(res, 400, 'invalid_request', `status must be one of ${STATUSES.join(', ')}.`);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), MAX_LIMIT);
  const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

  let q = baseQuery();
  if (role === 'owner') q.equalTo('CreatedBy', userPtr(userId));
  else q.matchesQuery('Signers', signerContactsQuery(userId));
  if (status) {
    q = Parse.Query.and(q, statusQuery(status));
    q.include('Signers');
    q.include('CreatedBy');
  }
  q.descending('updatedAt');
  q.limit(limit);
  q.skip(skip);
  const docs = await q.find({ useMasterKey: true });
  return res.json({ results: docs.map(d => toPublicDocument(d, userId)), limit, skip });
}

// The document if this user owns it or is one of its signers, else null.
export async function findAccessibleDocument(id, userId) {
  if (!ID_RE.test(String(id || ''))) return null;
  const owned = baseQuery();
  owned.equalTo('objectId', id);
  owned.equalTo('CreatedBy', userPtr(userId));
  const asSigner = baseQuery();
  asSigner.equalTo('objectId', id);
  asSigner.matchesQuery('Signers', signerContactsQuery(userId));
  const q = Parse.Query.or(owned, asSigner);
  q.include('Signers');
  q.include('CreatedBy');
  return q.first({ useMasterKey: true });
}

// GET /documents/:id
export async function getDocument(req, res) {
  const doc = await findAccessibleDocument(req.params.id, req.bs.user.id);
  if (!doc) return apiError(res, 404, 'not_found', 'No such document, or no access to it.');
  return res.json(toPublicDocument(doc, req.bs.user.id));
}

// GET /documents/:id/file?version=current|original
// current = the latest PDF (with every signature so far); original = as uploaded.
// X-Content-SHA256 lets the desktop app tie its local signature to these bytes.
export async function getDocumentFile(req, res) {
  const version = req.query.version || 'current';
  if (!['current', 'original'].includes(version)) {
    return apiError(res, 400, 'invalid_request', 'version must be current or original.');
  }
  const doc = await findAccessibleDocument(req.params.id, req.bs.user.id);
  if (!doc) return apiError(res, 404, 'not_found', 'No such document, or no access to it.');
  const url = version === 'original' ? doc.get('URL') : doc.get('SignedUrl') || doc.get('URL');
  if (!url) return apiError(res, 404, 'not_found', 'This document has no file.');

  let bytes;
  try {
    bytes = await readDocumentPdf(url);
  } catch (e) {
    console.log('bsapi: file download failed', doc.id, e?.message);
    return apiError(res, 502, 'file_unavailable', "Couldn't read the document's file.");
  }
  const safeName = String(doc.get('Name') || 'document').replace(/[^\w .-]/g, '_');
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
    'X-Content-SHA256': crypto.createHash('sha256').update(bytes).digest('hex'),
  });
  return res.send(bytes);
}
