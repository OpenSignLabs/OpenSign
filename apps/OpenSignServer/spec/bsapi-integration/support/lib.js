// Helpers for the /api/v1 integration specs: HTTP, the desktop app's side of
// the protocol (statements, local signing), signature checks, and seeding.
import crypto from 'node:crypto';
import forge from 'node-forge';
import * as pdfLib from 'pdf-lib';
import * as cantoo from '@cantoo/pdf-lib';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import { Placeholder } from '../../../cloud/parsefunction/pdf/Placeholder.js';
import { signatureByteRanges } from '../../../utils/appendOnlyPdf.js';

export const PORT = 8080; // Utils.js cloudServerUrl is fixed at localhost:8080/app
export const API = `http://localhost:${PORT}`;
export const PARSE = `${API}/app`;
export const APP_ID = 'opensign';
export const MASTER_KEY = 'bsapi-test-master';
export const MASTER = { 'X-Parse-Application-Id': APP_ID, 'X-Parse-Master-Key': MASTER_KEY };
export const PUBLIC = { 'X-Parse-Application-Id': APP_ID };
export const ORIGIN = 'https://docsign.bettersign.ing';
export const RP = 'bs-opensign-api';

export const sha = b => crypto.createHash('sha256').update(b).digest();
export const ptr = (className, objectId) => ({ __type: 'Pointer', className, objectId });
export const bearer = token => ({ authorization: 'Bearer ' + token });
export const tag = () => crypto.randomBytes(4).toString('hex');

export async function req(method, url, { headers = {}, body, raw } = {}) {
  const r = await fetch(url, {
    method,
    headers: { ...(body && !raw ? { 'content-type': 'application/json' } : {}), ...headers },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  const buf = Buffer.from(await r.arrayBuffer());
  let json = null;
  try {
    json = JSON.parse(buf.toString('utf8'));
  } catch {
    // not JSON (a PDF)
  }
  return { status: r.status, json, buf, headers: r.headers };
}

// --- canonical CBOR (RFC 8949 §4.2.1), as the desktop app emits ---
function head(major, n) {
  if (n < 24) return Buffer.from([(major << 5) | n]);
  if (n < 256) return Buffer.from([(major << 5) | 24, n]);
  if (n < 65536) return Buffer.from([(major << 5) | 25, n >> 8, n & 0xff]);
  const b = Buffer.alloc(5);
  b[0] = (major << 5) | 26;
  b.writeUInt32BE(n, 1);
  return b;
}
export function cbor(v) {
  if (typeof v === 'number') return head(0, v);
  if (typeof v === 'string') {
    const s = Buffer.from(v);
    return Buffer.concat([head(3, s.length), s]);
  }
  if (Buffer.isBuffer(v)) return Buffer.concat([head(2, v.length), v]);
  const e = Object.entries(v)
    .map(([k, x]) => [cbor(k), cbor(x)])
    .sort((a, b) => Buffer.compare(a[0], b[0]));
  return Buffer.concat([head(5, e.length), ...e.flat()]);
}
// What /keys/primary signs: bs-message's canonical TBS (BetterSignApps
// crates/bs-message/src/message.rs build_tbs), written out here rather than
// with the server's helper so the specs check it independently.
//   "bettersign-message-v2" ‖ sender_vlad ‖ Varbytes("/keys/primary")
//   ‖ receiver_vlad ‖ Varbytes(content_type) ‖ Varbytes(statement)
const CONTENT_TYPE = {
  'bs-login': 'application/vnd.bettersign.login+cbor',
  'bs-docsign': 'application/vnd.bettersign.docsign+cbor',
};
function leb128(n) {
  const out = [];
  do {
    out.push((n & 0x7f) | (n > 0x7f ? 0x80 : 0));
    n >>>= 7;
  } while (n > 0);
  return Buffer.from(out);
}
const varbytes = b => Buffer.concat([leb128(b.length), b]);
export const receiverVlad = () => process.env.BS_API_RECEIVER_VLAD;
export function tbs(type, senderVladHex, st, over = {}) {
  return Buffer.concat([
    Buffer.from(over.domain ?? 'bettersign-message-v2'),
    Buffer.from(senderVladHex, 'hex'),
    varbytes(Buffer.from(over.keyPath ?? '/keys/primary')),
    Buffer.from(over.receiverVlad ?? receiverVlad(), 'hex'),
    varbytes(Buffer.from(over.contentType ?? CONTENT_TYPE[type])),
    varbytes(st),
  ]);
}

// Sign `st` as `id` and shape the request fields. `send`: 'statement' (the
// server rebuilds the TBS), 'message' (the full TBS) or 'both'. `msg`
// overrides parts of the TBS (see tbs()).
function signed(type, id, st, { signer = id, send = 'statement', msg = {} } = {}) {
  const m = tbs(type, id.vlad, st, msg);
  const out = { signature: crypto.sign(null, m, signer.privateKey).toString('base64url') };
  if (send !== 'message') out.statement = st.toString('base64url');
  if (send !== 'statement') out.message = m.toString('base64url');
  return out;
}

// An identity: a VLAD (sigil 0x1207, then random) and an Ed25519 "primary
// key" the mock verifier knows.
export function identity() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return { vlad: '8724' + crypto.randomBytes(38).toString('hex'), publicKey, privateKey };
}

export function loginStatement(id, ch, over = {}, signer = id, opts = {}) {
  const st = cbor({
    v: 1,
    type: 'bs-login',
    vlad: Buffer.from(id.vlad, 'hex'),
    origin: ch.origin,
    rp: ch.rp,
    challenge: Buffer.from(ch.challenge, 'base64url'),
    reqId: crypto.randomBytes(16),
    extSignPub: crypto.randomBytes(32),
    iat: Math.floor(Date.now() / 1000),
    ...over,
  });
  return signed('bs-login', id, st, { signer, ...opts });
}

export function docsignStatement(id, docId, base, file, over = {}, opts = {}) {
  const st = cbor({
    v: 1,
    type: 'bs-docsign',
    vlad: Buffer.from(id.vlad, 'hex'),
    origin: ORIGIN,
    rp: RP,
    docId,
    base: sha(base),
    file: sha(file),
    reqId: crypto.randomBytes(16),
    iat: Math.floor(Date.now() / 1000),
    ...over,
  });
  return signed('bs-docsign', id, st, opts);
}

export const challenge = id =>
  req('POST', `${API}/api/v1/auth/challenge`, { body: { vlad: id.vlad } });

export async function signIn(id, over, signer, opts) {
  const ch = (await challenge(id)).json;
  return req('POST', `${API}/api/v1/auth/token`, {
    body: { challengeId: ch.challengeId, ...loginStatement(id, ch, over, signer, opts) },
  });
}

export async function tokenFor(id) {
  const r = await signIn(id);
  if (r.status !== 200) throw new Error('sign-in failed: ' + JSON.stringify(r.json));
  return bearer(r.json.access_token);
}

// A throwaway self-signed signing certificate (PKCS#12, passphrase "test").
export function testP12() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 864e5);
  cert.validity.notAfter = new Date(Date.now() + 864e5);
  const attrs = [{ name: 'commonName', value: 'Test Signer' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], 'test', { algorithm: '3des' });
  return Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary');
}

// The desktop app's local signing, appended (stands in for lopdf + bs-pades).
export async function desktopSign(base, name, p12) {
  const d = await cantoo.PDFDocument.load(base, {
    forIncrementalUpdate: true,
    updateMetadata: false,
  });
  Placeholder({
    pdfDoc: d,
    reason: `BetterSign ${name}`,
    location: 'n/a',
    name,
    contactInfo: 'x',
    signatureLength: 8000,
    fieldName: `BetterSign ${name}`,
    lib: cantoo,
  });
  return new SignPdf().sign(
    Buffer.from(await d.save()),
    new P12Signer(p12, { passphrase: 'test' })
  );
}

// An online signer's PDF, as the browser builds it.
export async function browserPdf(current, appendOnly) {
  const d = appendOnly
    ? await cantoo.PDFDocument.load(current, { forIncrementalUpdate: true, updateMetadata: false })
    : await pdfLib.PDFDocument.load(current);
  d.getPages()[0].drawText('signed online', { x: 300, y: 300, size: 12 });
  return Buffer.from(await d.saveAsBase64({ useObjectStreams: false }), 'base64');
}

// Every signature in the file: does its CMS digest match the bytes it covers,
// and does the RSA signature over the signed attributes verify?
export function verifyAll(bytes) {
  const text = bytes.toString('latin1');
  return signatureByteRanges(bytes).map(([a, b, c, d]) => {
    const covered = Buffer.concat([bytes.subarray(a, a + b), bytes.subarray(c, c + d)]);
    // /Contents is zero-padded; parse the DER by its own length, since the
    // signature itself may end in zero bytes.
    const der = forge.util.hexToBytes(text.slice(b + 1, c - 1));
    const p7 = forge.pkcs7.messageFromAsn1(forge.asn1.fromDer(der, { parseAllBytes: false }));
    const attrsList = p7.rawCapture.authenticatedAttributes;
    const md = attrsList
      .map(
        x =>
          forge.asn1.derToOid(x.value[0].value) === forge.pki.oids.messageDigest &&
          x.value[1].value[0].value
      )
      .find(Boolean);
    const attrs = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SET,
      true,
      attrsList
    );
    const attrsMd = forge.md.sha256.create().update(forge.asn1.toDer(attrs).getBytes());
    const ok =
      forge.util.bytesToHex(md) === sha(covered).toString('hex') &&
      p7.certificates[0].publicKey.verify(attrsMd.digest().getBytes(), p7.rawCapture.signature);
    return { ok, end: c + d };
  });
}

// --- seeding (as an admin, with the master key) ---
export async function mkUser(email, password = 'pw-' + email) {
  const r = await req('POST', `${PARSE}/users`, {
    headers: MASTER,
    body: { username: email, password, email, name: email.split('@')[0] },
  });
  return r.json.objectId;
}

export const link = (id, userId, extra = {}) =>
  req('POST', `${PARSE}/classes/bs_Identity`, {
    headers: MASTER,
    body: { vlad: id.vlad, UserId: ptr('_User', userId), ACL: {}, ...extra },
  });

export async function mkOwner(email) {
  const userId = await mkUser(email);
  const tenant = await req('POST', `${PARSE}/classes/partners_Tenant`, {
    headers: MASTER,
    body: { TenantName: 'T', EmailAddress: email, UserId: ptr('_User', userId) },
  });
  const ext = await req('POST', `${PARSE}/classes/contracts_Users`, {
    headers: MASTER,
    body: {
      Name: 'Owner',
      Email: email,
      UserId: ptr('_User', userId),
      TenantId: ptr('partners_Tenant', tenant.json.objectId),
      UserRole: 'contracts_User',
    },
  });
  return { userId, extId: ext.json.objectId };
}

export async function mkContact(ownerId, name, email, userId) {
  const r = await req('POST', `${PARSE}/classes/contracts_Contactbook`, {
    headers: MASTER,
    body: {
      Name: name,
      Email: email,
      ...(userId ? { UserId: ptr('_User', userId) } : {}),
      CreatedBy: ptr('_User', ownerId),
    },
  });
  return r.json.objectId;
}

export async function basePdf(label = 'Contract') {
  const d = await pdfLib.PDFDocument.create();
  d.addPage([600, 800]);
  d.addPage([600, 800]);
  d.getPages()[0].drawText(`${label} ${tag()}`, { x: 50, y: 750 });
  return Buffer.from(await d.save());
}

export async function uploadPdf(pdf, name = 'doc.pdf') {
  const r = await req('POST', `${PARSE}/files/${name}`, {
    headers: { ...MASTER, 'content-type': 'application/pdf' },
    body: pdf,
    raw: true,
  });
  return r.json.url;
}

const placeholder = (contactId, y) => ({
  signerObjId: contactId,
  signerPtr: ptr('contracts_Contactbook', contactId),
  Role: 'signer',
  placeHolder: [
    {
      pageNumber: 1,
      pos: [
        {
          xPosition: 50,
          yPosition: y,
          Width: 150,
          Height: 50,
          type: 'signature',
          key: crypto.randomUUID(),
        },
      ],
    },
  ],
});

// A sent document with a signer placeholder per contact, in order.
export async function mkDoc(
  owner,
  signers,
  { sendInOrder = false, expiry = true, sent = true, extra = {} } = {}
) {
  const url = await uploadPdf(await basePdf(), `d-${tag()}.pdf`);
  const r = await req('POST', `${PARSE}/classes/contracts_Document`, {
    headers: MASTER,
    body: {
      Name: `doc ${tag()}`,
      URL: url,
      ...(sent ? { SignedUrl: url } : {}),
      CreatedBy: ptr('_User', owner.userId),
      ExtUserPtr: ptr('contracts_Users', owner.extId),
      Signers: signers.map(c => ptr('contracts_Contactbook', c)),
      Placeholders: signers.map((c, i) => placeholder(c, 100 + i * 100)),
      SendinOrder: sendInOrder,
      ...(expiry
        ? { ExpiryDate: { __type: 'Date', iso: new Date(Date.now() + 864e5).toISOString() } }
        : {}),
      AuditTrail: [],
      ...extra,
    },
  });
  if (!r.json?.objectId) throw new Error('mkDoc failed: ' + JSON.stringify(r.json));
  return r.json.objectId;
}

export const getDoc = (auth, id) => req('GET', `${API}/api/v1/documents/${id}`, { headers: auth });

export async function getFile(auth, id) {
  const r = await req('GET', `${API}/api/v1/documents/${id}/file`, { headers: auth });
  return { bytes: r.buf, sha: r.headers.get('x-content-sha256'), status: r.status };
}

export const upload = (auth, docId, pdf, stmt) =>
  req('POST', `${API}/api/v1/documents/${docId}/signatures`, {
    headers: auth,
    body: { pdf: pdf.toString('base64'), ...stmt },
  });

export const signPdf = (docId, contactId, pdf) =>
  req('POST', `${PARSE}/functions/signPdf`, {
    headers: PUBLIC,
    body: { docId, userId: contactId, pdfFile: pdf.toString('base64'), signature: '' },
  });

export const docRow = async id =>
  (await req('GET', `${PARSE}/classes/contracts_Document/${id}`, { headers: MASTER })).json;

export async function waitFor(fn, ms = 15000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const v = await fn();
    if (v) return v;
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

// Completing a document makes its certificate in the background (PDF.js
// doesn't await it). Wait for it, so no test ends with that work in flight.
export const certificateOf = docId => waitFor(async () => (await docRow(docId)).CertificateUrl);
