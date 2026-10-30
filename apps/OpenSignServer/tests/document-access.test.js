import test from 'node:test';
import assert from 'node:assert/strict';
import {
  documentAccess,
  issueDocumentAccess,
  revokeDocumentAccess,
  fileAccess,
  validateFileScope,
  assertDocumentOpen,
  sanitiseDocument,
  guardDocumentMutation,
  protectPrivateRecord,
  recordUploadedFile,
  GRANT_CLASS,
  FILE_CLASS,
} from '../utils/documentAccess.js';

const store = new Map(),
  queries = [];
class PObject {
  constructor(className, id, fields = {}) {
    this.className = className;
    this.id = id;
    this.fields = fields;
  }
  get(key) {
    return this.fields[key];
  }
  set(key, value) {
    this.fields[key] = value;
  }
  setACL(acl) {
    this.acl = acl;
  }
  dirtyKeys() {
    return this.dirty || Object.keys(this.fields);
  }
  toJSON() {
    return { objectId: this.id, ...this.fields };
  }
  async save() {
    this.id ||= 'grant' + String(++counter).padStart(5, '0');
    store.set(this.className + ':' + this.id, this);
    return this;
  }
}
let counter = 0;
const getId = (x) => x?.id || x?.objectId;
const eq = (a, b) =>
  typeof a === 'object' && typeof b === 'object' ? getId(a) === getId(b) : a === b;
class Query {
  constructor(className) {
    this.className = className;
    this.conditions = [];
  }
  include() {
    return this;
  }
  select() {
    return this;
  }
  equalTo(key, value) {
    this.conditions.push((x) => eq(x.get(key), value));
    return this;
  }
  notEqualTo(key, value) {
    this.conditions.push((x) => !eq(x.get(key), value));
    return this;
  }
  matches(key, pattern) {
    this.conditions.push((x) => new RegExp(pattern).test(x.get(key) || ''));
    return this;
  }
  static or(...queries) {
    const q = new Query(queries[0].className);
    q.conditions.push((x) => queries.some((item) => item.conditions.every((c) => c(x))));
    return q;
  }
  authorised(x, options) {
    return options?.useMasterKey || x.fields.readers?.includes(options?.sessionToken);
  }
  async get(id, options) {
    queries.push({ className: this.className, id, options });
    const x = store.get(this.className + ':' + id);
    if (!x || !this.authorised(x, options)) throw Error('denied');
    return x;
  }
  async first(options) {
    return (
      [...store.values()].find(
        (x) =>
          x.className === this.className &&
          this.authorised(x, options) &&
          this.conditions.every((c) => c(x))
      ) || null
    );
  }
}
class PError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
Object.assign(PError, { OPERATION_FORBIDDEN: 119, INVALID_SESSION_TOKEN: 209 });
globalThis.Parse = { Query, Object: PObject, ACL: class {}, Error: PError };
process.env.PUBLIC_URL = 'http://localhost:3120';
const owner = { id: 'owner00001', getSessionToken: () => 'owner-session' };
const stranger = { id: 'other00001', getSessionToken: () => 'other-session' };
const signer = { id: 'signeruser1', getSessionToken: () => 'signer-session' };
const req = (params = {}, user) => ({
  params: { docId: 'document01', ...params },
  user,
  headers: {},
});
const denied = (promise) => assert.rejects(promise, (e) => e.code === 119 || e.code === 209);
function fixture() {
  store.clear();
  queries.length = 0;
  const contact = new PObject('contracts_Contactbook', 'recipient1', {
    Email: 'signer@example.test',
    UserId: { objectId: signer.id },
  });
  const other = new PObject('contracts_Contactbook', 'recipient2', {
    Email: 'other@example.test',
    UserId: { objectId: stranger.id },
  });
  const doc = new PObject('contracts_Document', 'document01', {
    CreatedBy: { objectId: owner.id },
    Signers: [contact, other],
    readers: ['owner-session', 'signer-session'],
    ExpiryDate: new Date(Date.now() + 3600000),
    URL: 'http://localhost:3120/api/app/files/opensign/first.pdf',
    SignedUrl: 'http://localhost:3120/api/app/files/opensign/first.pdf',
    Placeholders: [
      { signerObjId: contact.id, Role: 'signer' },
      { signerObjId: other.id, Role: 'viewer' },
    ],
    AuditTrail: [],
  });
  store.set('contracts_Document:document01', doc);
  return doc;
}
async function grant() {
  const issued = await issueDocumentAccess(req({ recipientId: 'recipient1' }, owner));
  return { ...issued, record: store.get(GRANT_CLASS + ':' + issued.grantId) };
}

test('anonymous document ID is insufficient with OTP disabled', async () => {
  fixture();
  await denied(documentAccess(req()));
});
test('owner uses the Parse ACL rather than a master-key read', async () => {
  fixture();
  await documentAccess(req({}, owner));
  assert.equal(queries[0].options.sessionToken, 'owner-session');
  assert.equal(queries[0].options.useMasterKey, undefined);
});
test('unrelated authenticated user cannot read another document', async () => {
  fixture();
  await denied(documentAccess(req({}, stranger)));
});
test('owner access does not depend on OTP being disabled', async () => {
  fixture().set('IsEnableOTP', true);
  await documentAccess(req({}, owner));
});
test('only owner can issue a recipient capability', async () => {
  fixture();
  await denied(issueDocumentAccess(req({ recipientId: 'recipient1' }, signer)));
  await denied(issueDocumentAccess(req({ recipientId: 'recipient1' })));
});
test('grant is random, hashed in storage and capped by document expiry', async () => {
  const doc = fixture(),
    g = await grant();
  assert.match(g.token, /^[A-Za-z0-9]{6,30}\.[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(g.record.fields).includes(g.token.split('.')[1]));
  assert.ok(Date.parse(g.expiresAt) <= doc.get('ExpiryDate').getTime());
});
test('grant cannot be issued for a non-recipient', async () => {
  fixture();
  await denied(issueDocumentAccess(req({ recipientId: 'notinvited' }, owner)));
});
test('guest capability permits its document and intended recipient', async () => {
  fixture();
  const g = await grant();
  assert.equal((await documentAccess(req({ guestToken: g.token }))).recipientId, 'recipient1');
});
test('guest secret tampering is rejected', async () => {
  fixture();
  const g = await grant();
  await denied(
    documentAccess(req({ guestToken: g.token.slice(0, -1) + (g.token.endsWith('a') ? 'b' : 'a') }))
  );
});
test('guest capability cannot be replayed for another document', async () => {
  fixture();
  const g = await grant();
  await denied(documentAccess(req({ docId: 'document02', guestToken: g.token })));
});
test('expired grant denies access', async () => {
  fixture();
  const g = await grant();
  g.record.set('ExpiresAt', new Date(Date.now() - 1));
  await denied(documentAccess(req({ guestToken: g.token })));
});
test('revocation invalidates an existing grant', async () => {
  fixture();
  const g = await grant();
  await revokeDocumentAccess(req({ grantId: g.grantId }, owner));
  await denied(documentAccess(req({ guestToken: g.token })));
});
test('a non-owner cannot revoke a grant', async () => {
  fixture();
  const g = await grant();
  await denied(revokeDocumentAccess(req({ grantId: g.grantId }, signer)));
});
test('shortening document expiry immediately invalidates an unexpired grant', async () => {
  const doc = fixture(),
    g = await grant();
  doc.set('ExpiryDate', new Date(Date.now() - 1));
  await denied(documentAccess(req({ guestToken: g.token })));
});
test('deadline equality is expired, including ISO-shaped dates', () => {
  assert.throws(() =>
    assertDocumentOpen(
      { ExpiryDate: { iso: '2026-01-01T00:00:00Z' } },
      Date.parse('2026-01-01T00:00:00Z')
    )
  );
});
test('missing or invalid deadline fails closed for guest signing', async () => {
  fixture().set('ExpiryDate', 'invalid');
  await denied(issueDocumentAccess(req({ recipientId: 'recipient1' }, owner)));
});
test('archived and declined documents invalidate guest capabilities', async () => {
  for (const key of ['IsArchive', 'IsDeclined']) {
    const doc = fixture(),
      g = await grant();
    doc.set(key, true);
    await denied(documentAccess(req({ guestToken: g.token })));
  }
});
test('removed recipient invalidates capability', async () => {
  const doc = fixture(),
    g = await grant();
  doc.set('Signers', []);
  await denied(documentAccess(req({ guestToken: g.token })));
});
test('guest token does not bypass the document OTP requirement', async () => {
  const doc = fixture(),
    g = await grant();
  doc.set('IsEnableOTP', true);
  await denied(documentAccess(req({ guestToken: g.token })));
  await documentAccess(req({ guestToken: g.token }, signer));
  await denied(documentAccess(req({ guestToken: g.token }, stranger)));
});
test('signing recipient is bound to the capability', async () => {
  fixture();
  const g = await grant();
  await documentAccess(req({ guestToken: g.token, userId: 'recipient1' }), { signing: true });
  await denied(
    documentAccess(req({ guestToken: g.token, userId: 'recipient2' }), { signing: true })
  );
});
test('authenticated owner cannot impersonate a recipient', async () => {
  fixture();
  await denied(documentAccess(req({ userId: 'recipient1' }, owner), { signing: true }));
  await documentAccess(req({ userId: 'recipient1' }, signer), { signing: true });
});
test('viewer cannot sign', async () => {
  fixture();
  await denied(documentAccess(req({ userId: 'recipient2' }, stranger), { signing: true }));
});
test('completed document cannot be signed again', async () => {
  const doc = fixture(),
    g = await grant();
  doc.set('IsCompleted', true);
  await denied(
    documentAccess(req({ guestToken: g.token, userId: 'recipient1' }), { signing: true })
  );
  await documentAccess(req({ guestToken: g.token }));
});
test('a recipient signature cannot be replayed', async () => {
  const doc = fixture(),
    g = await grant();
  doc.set('AuditTrail', [{ Activity: 'Signed', UserPtr: { objectId: 'recipient1' } }]);
  await denied(
    documentAccess(req({ guestToken: g.token, userId: 'recipient1' }), { signing: true })
  );
});
test('expired document cannot be signed even by owner', async () => {
  fixture().set('ExpiryDate', new Date(Date.now() - 1));
  await denied(documentAccess(req({}, owner), { signing: true }));
  await documentAccess(req({}, owner));
});
test('guest file access requires binding to the same document', async () => {
  const doc = fixture(),
    g = await grant();
  await fileAccess(req({ guestToken: g.token, url: doc.get('URL') }));
  await denied(
    fileAccess(
      req({ guestToken: g.token, url: 'http://localhost:3120/api/app/files/opensign/foreign.pdf' })
    )
  );
});
test('a session and a readable document ID do not authorise an unrelated file', async () => {
  fixture();
  await denied(
    fileAccess(req({ url: 'http://localhost:3120/api/app/files/opensign/foreign.pdf' }, owner))
  );
});
test('URL query parameters supplied by the caller are not signed', async () => {
  const doc = fixture();
  const result = await fileAccess(req({ url: doc.get('URL') + '?attacker=true' }, owner));
  assert.equal(result.url, doc.get('URL'));
});
test('fresh signed file scope is denied after revocation', async () => {
  const doc = fixture(),
    g = await grant(),
    access = await fileAccess(req({ guestToken: g.token, url: doc.get('URL') }));
  await validateFileScope(access.scope, access.url);
  await revokeDocumentAccess(req({ grantId: g.grantId }, owner));
  await denied(validateFileScope(access.scope, access.url));
});
test('signed file scope is denied after document expiry', async () => {
  const doc = fixture(),
    g = await grant(),
    access = await fileAccess(req({ guestToken: g.token, url: doc.get('URL') }));
  doc.set('ExpiryDate', new Date(Date.now() - 1));
  await denied(validateFileScope(access.scope, access.url));
});
test('raw URL without identity or scope cannot mint a token', async () => {
  const doc = fixture();
  await denied(fileAccess({ params: { url: doc.get('URL') }, headers: {} }));
});
test('upload receipt permits only the uploading user', async () => {
  fixture();
  await recordUploadedFile({
    user: owner,
    file: { url: () => 'http://localhost:3120/api/app/files/opensign/new.pdf' },
  });
  const params = { url: 'http://localhost:3120/api/app/files/opensign/new.pdf' };
  await fileAccess({ params, user: owner });
  await denied(fileAccess({ params, user: stranger }));
});
test('client cannot create or modify private capability records', () => {
  assert.throws(() => protectPrivateRecord({ user: owner }));
  protectPrivateRecord({ master: true });
});
test('late signature persistence is refused by beforeSave guard', async () => {
  const original = fixture();
  original.set('ExpiryDate', new Date(Date.now() - 1));
  const current = new PObject('contracts_Document', original.id, {
    ...original.fields,
    AuditTrail: [{ Activity: 'Signed' }],
  });
  current.dirty = ['AuditTrail'];
  await denied(guardDocumentMutation({ original, object: current, master: true }));
});
test('recipient cannot extend expiry through a direct object update', async () => {
  const original = fixture(),
    current = new PObject('contracts_Document', original.id, { ...original.fields });
  current.dirty = ['ExpiryDate'];
  await denied(guardDocumentMutation({ original, object: current, user: signer }));
});
test('document response strips signing keys and account secrets', () => {
  const doc = fixture();
  doc.set('ExtUserPtr', {
    TenantId: { PfxFile: { password: 'secret' }, FileAdapters: 'secret' },
    OAuthToken: 'secret',
    Name: 'Allowed',
  });
  const value = sanitiseDocument(doc);
  assert.equal(JSON.stringify(value).includes('secret'), false);
  assert.equal(value.ExtUserPtr.Name, 'Allowed');
});
