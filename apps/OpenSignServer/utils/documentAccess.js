import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const GRANT_CLASS = 'contracts_DocumentAccessGrant';
export const FILE_CLASS = 'contracts_FileAccessReceipt';
const INCLUDES = [
  'ExtUserPtr',
  'ExtUserPtr.TenantId',
  'CreatedBy',
  'Signers',
  'AuditTrail.UserPtr',
  'Placeholders',
  'DeclineBy',
];
const FILE_FIELDS = ['URL', 'SignedUrl', 'CertificateUrl'];
const idOf = (value) => value?.id || value?.objectId;
const valueOf = (object, key) =>
  typeof object?.get === 'function' ? object.get(key) : object?.[key];
export const deny = () => {
  throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Document or file is unavailable.');
};
export const dateMillis = (value) =>
  value instanceof Date ? value.getTime() : Date.parse(value?.iso || value || '');
export const pointer = (className, id) => ({ __type: 'Pointer', className, objectId: id });

export function assertDocumentOpen(document, now = Date.now()) {
  if (valueOf(document, 'IsArchive') || valueOf(document, 'IsDeclined')) deny();
  const expires = dateMillis(valueOf(document, 'ExpiryDate'));
  if (!Number.isFinite(expires) || now >= expires) deny();
  return expires;
}

export function canonicalFileUrl(input) {
  if (typeof input !== 'string' || input.length > 8192) deny();
  let url;
  try {
    url = new URL(input);
  } catch {
    deny();
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash)
    deny();
  return url.origin + url.pathname;
}

export function resolveBoundFile(document, requestedUrl) {
  const wanted = canonicalFileUrl(requestedUrl);
  const match = FILE_FIELDS.map((key) => valueOf(document, key)).find(
    (url) => url && canonicalFileUrl(url) === wanted
  );
  if (!match) deny();
  // Use the stored URL, never attacker-controlled query parameters.
  return canonicalFileUrl(match);
}

function sessionOptions(request) {
  if (request.master === true) return { useMasterKey: true };
  const token = request.user?.getSessionToken?.();
  if (!request.user?.id || !token) deny();
  return { sessionToken: token };
}

async function loadDocument(docId, options) {
  if (typeof docId !== 'string' || !/^[A-Za-z0-9]{6,30}$/.test(docId)) deny();
  try {
    let authorised;
    if (!options.useMasterKey) {
      const aclQuery = new Parse.Query('contracts_Document');
      aclQuery.select('objectId', 'ACL', 'updatedAt');
      authorised = await aclQuery.get(docId, options);
    }
    // Related classes have stricter CLPs. Expand only after the document ACL check.
    const query = new Parse.Query('contracts_Document');
    query.include(INCLUDES);
    const document = await query.get(docId, { useMasterKey: true });
    if (authorised && authorised.updatedAt?.getTime() !== document.updatedAt?.getTime()) deny();
    return document;
  } catch {
    deny();
  }
}

function ownsDocument(request, document) {
  return request.master === true || request.user?.id === idOf(valueOf(document, 'CreatedBy'));
}

function recipientOf(document, recipientId) {
  const recipient = (valueOf(document, 'Signers') || []).find((item) => idOf(item) === recipientId);
  if (!recipient || valueOf(recipient, 'IsDeleted')) deny();
  return recipient;
}

const digest = (secret) => createHash('sha256').update(secret).digest('hex');

async function loadGrant(token, docId, now) {
  if (typeof token !== 'string' || token.length > 100) deny();
  const parts = /^([A-Za-z0-9]{6,30})\.([a-f0-9]{64})$/.exec(token);
  if (!parts) deny();
  let grant;
  try {
    grant = await new Parse.Query(GRANT_CLASS).get(parts[1], { useMasterKey: true });
  } catch {
    deny();
  }
  const expected = valueOf(grant, 'SecretHash');
  if (typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected)) deny();
  if (!timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(digest(parts[2]), 'hex'))) deny();
  if (idOf(valueOf(grant, 'Document')) !== docId || valueOf(grant, 'RevokedAt')) deny();
  const expires = dateMillis(valueOf(grant, 'ExpiresAt'));
  if (!Number.isFinite(expires) || now >= expires) deny();
  return grant;
}

export async function documentAccess(request, { signing = false, now = Date.now() } = {}) {
  await resolvePrincipal(request);
  const docId = request.params?.docId;
  let grant, document, recipientId;
  if (request.params?.guestToken) {
    grant = await loadGrant(request.params.guestToken, docId, now);
    document = await loadDocument(docId, { useMasterKey: true });
    assertDocumentOpen(document, now);
    recipientId = idOf(valueOf(grant, 'Recipient'));
    const recipient = recipientOf(document, recipientId);
    if (valueOf(document, 'IsEnableOTP') && request.user?.id !== idOf(valueOf(recipient, 'UserId')))
      throw new Parse.Error(
        Parse.Error.INVALID_SESSION_TOKEN,
        'Recipient verification is required.'
      );
  } else {
    // Parse enforces object ACLs, including role ACLs, before any data is returned.
    document = await loadDocument(docId, sessionOptions(request));
    if (valueOf(document, 'IsArchive')) deny();
  }
  if (signing) {
    assertDocumentOpen(document, now);
    if (valueOf(document, 'IsCompleted')) deny();
    const signingRecipient = request.params?.userId;
    if (grant && signingRecipient !== recipientId) deny();
    if (signingRecipient) {
      const recipient = recipientOf(document, signingRecipient);
      if (!grant && request.user?.id !== idOf(valueOf(recipient, 'UserId'))) deny();
      const placeholder = (valueOf(document, 'Placeholders') || []).find(
        (p) => p.signerObjId === signingRecipient
      );
      if (['viewer', 'prefill'].includes(placeholder?.Role?.toLowerCase())) deny();
      if (
        (valueOf(document, 'AuditTrail') || []).some(
          (e) => ['Signed', 'Approved'].includes(e.Activity) && idOf(e.UserPtr) === signingRecipient
        )
      )
        deny();
    } else if (grant || !ownsDocument(request, document)) deny();
  }
  return {
    document,
    grant,
    recipientId,
    expiresAt: grant
      ? Math.min(assertDocumentOpen(document, now), dateMillis(valueOf(grant, 'ExpiresAt')))
      : null,
  };
}

export async function issueDocumentAccess(request) {
  if (request.params?.guestToken) deny();
  const { document } = await documentAccess(request);
  if (!ownsDocument(request, document) || valueOf(document, 'IsCompleted')) deny();
  const recipientId =
    request.params?.recipientId ||
    idOf(
      (valueOf(document, 'Signers') || []).find(
        (item) =>
          valueOf(item, 'Email')?.toLowerCase() === request.params?.recipientEmail?.toLowerCase()
      )
    );
  const recipient = recipientOf(document, recipientId);
  const expiresAt = Math.min(assertDocumentOpen(document), Date.now() + 7 * 86400000);
  const secret = randomBytes(32).toString('hex');
  const grant = new Parse.Object(GRANT_CLASS);
  grant.set('Document', pointer('contracts_Document', document.id));
  grant.set('Recipient', pointer('contracts_Contactbook', recipientId));
  grant.set('SecretHash', digest(secret));
  grant.set('ExpiresAt', new Date(expiresAt));
  grant.setACL(new Parse.ACL());
  await grant.save(null, { useMasterKey: true });
  const token = grant.id + '.' + secret;
  const base64 = Buffer.from(
    [document.id, valueOf(recipient, 'Email'), recipientId, 'false', token].join('/')
  ).toString('base64');
  const publicUrl = new URL(process.env.PUBLIC_URL);
  if (!['http:', 'https:'].includes(publicUrl.protocol)) deny();
  return {
    token,
    grantId: grant.id,
    expiresAt: new Date(expiresAt).toISOString(),
    signUrl: publicUrl.origin + '/login/' + base64,
  };
}

export async function revokeDocumentAccess(request) {
  if (request.params?.guestToken) deny();
  const { document } = await documentAccess(request);
  if (!ownsDocument(request, document)) deny();
  let grant;
  try {
    grant = await new Parse.Query(GRANT_CLASS).get(request.params.grantId, { useMasterKey: true });
  } catch {
    deny();
  }
  if (idOf(valueOf(grant, 'Document')) !== document.id) deny();
  grant.set('RevokedAt', new Date());
  await grant.save(null, { useMasterKey: true });
  return { revoked: true };
}

export function protectPrivateRecord(request) {
  if (request.master !== true) deny();
}

export async function recordUploadedFile(request) {
  if (!request.user?.id || !request.file?.url()) return;
  const record = new Parse.Object(FILE_CLASS);
  record.set('URL', canonicalFileUrl(request.file.url()));
  record.set('Owner', pointer('_User', request.user.id));
  record.setACL(new Parse.ACL());
  await record.save(null, { useMasterKey: true });
}

export async function fileAccess(request) {
  await resolvePrincipal(request);
  const { docId, templateId, url } = request.params || {};
  if (docId) {
    const access = await documentAccess(request);
    return {
      ...access,
      url: resolveBoundFile(access.document, url),
      scope: { docId, grantId: access.grant?.id, recipientId: access.recipientId },
      ttl: access.expiresAt
        ? Math.min(160, Math.floor((access.expiresAt - Date.now()) / 1000))
        : 160,
    };
  }
  if (request.params?.guestToken) deny();
  const options = sessionOptions(request);
  const wanted = canonicalFileUrl(url);
  if (templateId) {
    let template;
    try {
      template = await new Parse.Query('contracts_Template').get(templateId, options);
    } catch {
      deny();
    }
    return { url: resolveBoundFile(template, url), ttl: 160 };
  }
  const receipt = new Parse.Query(FILE_CLASS);
  receipt.equalTo('URL', wanted);
  receipt.equalTo('Owner', pointer('_User', request.user?.id));
  if (await receipt.first({ useMasterKey: true })) return { url: wanted, ttl: 160 };
  // Legacy files can be refreshed only through a record the session may read.
  const escaped = wanted.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g, '\\$&');
  for (const className of ['contracts_Document', 'contracts_Template']) {
    const matches = FILE_FIELDS.map((field) =>
      new Parse.Query(className).matches(field, '^' + escaped + '(?:\\?|$)')
    );
    const query = Parse.Query.or(...matches);
    query.notEqualTo('IsArchive', true);
    const record = await query.first(options);
    if (record)
      return {
        url: resolveBoundFile(record, wanted),
        scope: className === 'contracts_Document' ? { docId: record.id } : undefined,
        ttl: 160,
      };
  }
  deny();
}

export async function validateFileScope(scope, fileUrl, now = Date.now()) {
  if (!scope?.docId) return;
  const document = await loadDocument(scope.docId, { useMasterKey: true });
  resolveBoundFile(document, fileUrl);
  if (valueOf(document, 'IsArchive')) deny();
  if (scope.grantId) {
    let grant;
    try {
      grant = await new Parse.Query(GRANT_CLASS).get(scope.grantId, { useMasterKey: true });
    } catch {
      deny();
    }
    if (
      idOf(valueOf(grant, 'Document')) !== scope.docId ||
      valueOf(grant, 'RevokedAt') ||
      dateMillis(valueOf(grant, 'ExpiresAt')) <= now
    )
      deny();
    if (idOf(valueOf(grant, 'Recipient')) !== scope.recipientId) deny();
    recipientOf(document, scope.recipientId);
    assertDocumentOpen(document, now);
  }
}

export function sanitiseDocument(document) {
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value)
          .filter(
            ([key]) => !/token|secret|password|privatekey|PfxFile|FileAdapters|authData/i.test(key)
          )
          .map(([key, item]) => [key, clean(item)])
      );
    return value;
  }
  return clean(document.toJSON());
}

// Compatibility for clients that used the former custom sessionToken header.
// The header is never treated as an identity without validation by Parse.
async function resolvePrincipal(request) {
  if (request.user?.id || request.master === true) return;
  const token = request.headers?.sessiontoken;
  if (!token || token === 'null' || token === 'undefined') return;
  try {
    const response = await fetch(process.env.SERVER_URL.replace(/\/$/, '') + '/users/me', {
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID || 'opensign',
        'X-Parse-Session-Token': token,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) deny();
    const user = await response.json();
    if (!user.objectId) deny();
    request.user = { id: user.objectId, getSessionToken: () => token, get: (key) => user[key] };
  } catch {
    deny();
  }
}

export async function secureInvitationLinks(request) {
  await resolvePrincipal(request);
  const base = new URL(process.env.PUBLIC_URL).origin + '/login/';
  const replacements = new Map();
  for (const key of ['html', 'text']) {
    const content = request.params?.[key];
    if (typeof content !== 'string') continue;
    let offset = 0;
    while ((offset = content.indexOf(base, offset)) !== -1) {
      const start = offset,
        encoded = /^[A-Za-z0-9+/=]+/.exec(content.slice(offset + base.length))?.[0];
      offset += base.length;
      if (!encoded) continue;
      const legacy = base + encoded;
      if (replacements.has(legacy)) continue;
      let fields;
      try {
        fields = Buffer.from(encoded, 'base64').toString('utf8').split('/');
      } catch {
        deny();
      }
      // Already-scoped links may be sent by a holder, but issuing/reissuing remains owner-only.
      const owned = await documentAccess({ ...request, params: { docId: fields[0] } });
      if (!ownsDocument(request, owned.document)) deny();
      const signer = (valueOf(owned.document, 'Signers') || []).find(
        (item) =>
          idOf(item) === fields[2] ||
          (!fields[2] && valueOf(item, 'Email')?.toLowerCase() === fields[1]?.toLowerCase())
      );
      if (!signer) deny();
      const issued = await issueDocumentAccess({
        ...request,
        params: { docId: fields[0], recipientId: idOf(signer) },
      });
      replacements.set(legacy, issued.signUrl);
      offset = start + legacy.length;
    }
  }
  for (const key of ['html', 'text'])
    if (typeof request.params?.[key] === 'string') {
      for (const [from, to] of replacements)
        request.params[key] = request.params[key].split(from).join(to);
    }
}

export async function guardDocumentMutation(request) {
  const document = request.object,
    original = request.original;
  const dirty = typeof document.dirtyKeys === 'function' ? document.dirtyKeys() : [];
  if (original && dirty.includes('AuditTrail')) {
    const old = valueOf(original, 'AuditTrail') || [];
    const incoming = valueOf(document, 'AuditTrail') || [];
    const newSignatures = incoming.filter(
      (e) =>
        ['Signed', 'Approved'].includes(e.Activity) &&
        !old.some((previous) => JSON.stringify(previous) === JSON.stringify(e))
    );
    if (newSignatures.length) {
      assertDocumentOpen(original);
      if (valueOf(original, 'IsCompleted')) deny();
    }
  }
  if (
    original &&
    valueOf(original, 'IsCompleted') &&
    dirty.includes('SignedUrl') &&
    canonicalFileUrl(valueOf(original, 'SignedUrl')) !==
      canonicalFileUrl(valueOf(document, 'SignedUrl'))
  )
    deny();
  if (request.master === true) return;
  if (!request.user?.id) deny();
  if (
    original &&
    !ownsDocument(request, original) &&
    dirty.some((key) =>
      [
        'ExpiryDate',
        'TimeToCompleteDays',
        'URL',
        'SignedUrl',
        'AuditTrail',
        'IsCompleted',
        'CreatedBy',
        'ExtUserPtr',
      ].includes(key)
    )
  )
    deny();
  if (!original && idOf(valueOf(document, 'CreatedBy')) !== request.user.id) deny();
  for (const key of ['URL', 'SignedUrl']) {
    const url = valueOf(document, key);
    if (
      dirty.includes(key) &&
      url &&
      (!original ||
        !valueOf(original, key) ||
        canonicalFileUrl(url) !== canonicalFileUrl(valueOf(original, key)))
    ) {
      await fileAccess({ ...request, params: { url } });
    }
  }
}
