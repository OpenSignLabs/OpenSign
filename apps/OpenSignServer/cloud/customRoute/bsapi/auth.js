// /api/v1 sign-in for the BetterSign desktop app: no browser, no bs-id.
//
//   1. POST /auth/challenge { vlad }
//      -> { challengeId, challenge, origin, rp, receiverVlad, expiresAt }
//   2. the app builds a bs-login v1 statement (statement.js) naming our origin,
//      our rp and that challenge, and signs it with /keys/primary in
//      bs-message's canonical form (buildSignedMessage) addressed to receiverVlad
//   3. POST /auth/token { challengeId, statement | message, signature } (base64url)
//      -> we check the signed message and statement, the verifier the signature
//      -> { access_token: "bso_…", token_type: "Bearer", expires_in }
//   4. Authorization: Bearer bso_… on every other call (requireToken)
//
// A challenge is single-use and lives 60 s. A token lives BS_API_TOKEN_TTL_S
// (default 30 min) and is stored hashed. Handlers act for the token's account
// with the master key and explicit owner / signer checks; no Parse session is
// created.
//
// Env:
//   BS_API_ORIGIN       the origin statements must name. Default https://docsign.bettersign.ing
//   BS_API_RP           the rp statements must name. Default bs-opensign-api
//   BS_API_RECEIVER_VLAD this server's VLAD (hex), the receiver_vlad of every
//                       signed message. Unset: one generated once and stored
//                       (receiverVlad.js). Malformed: sign-in is off
//   BS_API_TOKEN_TTL_S  token lifetime in seconds. Default 1800
//   plus BS_VERIFIER_URL / BS_VERIFIER_SECRET (verifier.js)

import crypto from 'node:crypto';
import { accountForVlad, VLAD_HEX_RE } from '../../../utils/bsIdentity.js';
import { ensureReceiverVlad } from './receiverVlad.js';
import { parseStatement, signedMessageFrom } from './statement.js';
import { verifySignature } from './verifier.js';

const CHALLENGE_TTL_MS = 60 * 1000;
const STATEMENT_SKEW_S = 120;
const TOKEN_RE = /^bso_[A-Za-z0-9_-]{43}$/;
const B64URL_RE = /^[A-Za-z0-9_-]+$/;
const ID_RE = /^[A-Za-z0-9]{1,32}$/;
const MAX_STATEMENT_BYTES = 8192;
const MAX_MESSAGE_BYTES = 32768;
const MAX_SIGNATURE_BYTES = 16384;
// A VLAD's wire encoding starts with its multicodec sigil, 0x1207 as a varint.
const RECEIVER_VLAD_RE = /^8724(?:[0-9a-f]{2})+$/;

export function config() {
  const receiverVlad = (process.env.BS_API_RECEIVER_VLAD || '').trim().toLowerCase();
  return {
    origin: (process.env.BS_API_ORIGIN || 'https://docsign.bettersign.ing').replace(/\/$/, ''),
    rp: process.env.BS_API_RP || 'bs-opensign-api',
    receiverVlad: RECEIVER_VLAD_RE.test(receiverVlad) ? receiverVlad : null,
    tokenTtlS: Number(process.env.BS_API_TOKEN_TTL_S) || 1800,
  };
}

export const apiError = (res, status, error, message, extra = {}) =>
  res.status(status).json({ error, message, ...extra });

export const notConfigured = res =>
  apiError(res, 503, 'not_configured', 'BetterSign sign-in is not set up on this server.');

// Validate the signed-input fields of a request body: `signature`, and
// `statement` and/or `message` (base64url). Returns an error message or null.
export function checkSignedFields(body, maxStatement) {
  const { statement, message, signature } = body || {};
  if (statement === undefined && message === undefined) {
    return 'statement or message is required.';
  }
  for (const [k, v, max] of [
    ['statement', statement, maxStatement],
    ['message', message, MAX_MESSAGE_BYTES],
    ['signature', signature, MAX_SIGNATURE_BYTES],
  ]) {
    if (k !== 'signature' && v === undefined) continue;
    if (typeof v !== 'string' || !B64URL_RE.test(v) || v.length > Math.ceil((max * 4) / 3)) {
      return `${k} is missing or not base64url.`;
    }
  }
  return null;
}

const sha256Hex = s => crypto.createHash('sha256').update(s).digest('hex');
const nowSec = () => Math.floor(Date.now() / 1000);
const masterOnly = () => new Parse.ACL(); // no public, no user access
const userPtr = id => ({ __type: 'Pointer', className: '_User', objectId: id });

function log(event, fields) {
  console.log(JSON.stringify({ event: `bsapi_${event}`, ...fields }));
}

// Best-effort sweep of expired rows; never blocks or fails the request.
function sweep(className) {
  const q = new Parse.Query(className);
  q.lessThan('ExpiresAt', new Date());
  q.limit(100);
  q.find({ useMasterKey: true })
    .then(rows => rows.length && Parse.Object.destroyAll(rows, { useMasterKey: true }))
    .catch(() => {});
}

// POST /auth/challenge
export async function createChallenge(req, res) {
  await ensureReceiverVlad();
  const c = config();
  if (!c.receiverVlad) return notConfigured(res);
  const vlad = String(req.body?.vlad || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad) || vlad.length < 64 || vlad.length > 8192 || vlad.length % 2) {
    return apiError(res, 400, 'invalid_request', 'vlad must be the identity VLAD in hex.');
  }
  const account = await accountForVlad(vlad);
  if (!account.user) {
    log('challenge_denied', { vlad: vlad.slice(0, 16), reason: account.reason });
    return apiError(
      res,
      403,
      'not_linked',
      "This BetterSign identity isn't linked to an OpenSign account. Ask an admin to add it."
    );
  }

  const challenge = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  const row = new Parse.Object('bs_ApiChallenge');
  row.set('Challenge', challenge);
  row.set('vlad', vlad);
  row.set('ExpiresAt', expiresAt);
  row.set('Uses', 0);
  row.setACL(masterOnly());
  await row.save(null, { useMasterKey: true });
  sweep('bs_ApiChallenge');

  return res.json({
    challengeId: row.id,
    challenge,
    origin: c.origin,
    rp: c.rp,
    receiverVlad: c.receiverVlad,
    expiresAt: expiresAt.toISOString(),
  });
}

// POST /auth/token
export async function issueToken(req, res) {
  await ensureReceiverVlad();
  const c = config();
  if (!c.receiverVlad) return notConfigured(res);
  const { challengeId, signature } = req.body || {};
  if (typeof challengeId !== 'string' || !ID_RE.test(challengeId)) {
    return apiError(res, 400, 'invalid_request', 'challengeId is missing.');
  }
  const bad = checkSignedFields(req.body, MAX_STATEMENT_BYTES);
  if (bad) return apiError(res, 400, 'invalid_request', bad);

  // Take the challenge first: one attempt per challenge, so two requests
  // racing with the same statement can't both get a token. Uses is an atomic
  // increment; only the request that moves it to 1 goes on.
  const cq = new Parse.Query('bs_ApiChallenge');
  const ch = await cq.get(challengeId, { useMasterKey: true }).catch(() => null);
  if (!ch || ch.get('ExpiresAt') < new Date()) {
    return apiError(res, 400, 'invalid_challenge', 'The challenge expired or was already used.');
  }
  ch.increment('Uses');
  // Fails if a racing request already took and deleted it.
  const taken = await ch.save(null, { useMasterKey: true }).then(
    () => ch.get('Uses') === 1,
    () => false
  );
  if (!taken) {
    return apiError(res, 400, 'invalid_challenge', 'The challenge expired or was already used.');
  }
  ch.destroy({ useMasterKey: true }).catch(() => {});

  // What was signed must be the canonical message from the challenge's VLAD to
  // us, carrying a bs-login statement.
  let signed;
  let s;
  try {
    signed = signedMessageFrom(req.body, {
      senderVlad: Buffer.from(ch.get('vlad'), 'hex'),
      receiverVlad: Buffer.from(c.receiverVlad, 'hex'),
      type: 'bs-login',
    });
    s = parseStatement(signed.statementBytes);
  } catch (e) {
    return apiError(res, 400, 'invalid_statement', e.message);
  }
  const vlad = Buffer.from(s.vlad).toString('hex');
  const deny = (message, reason) => {
    log('token_denied', { vlad: vlad.slice(0, 16), reason });
    return apiError(res, 401, 'access_denied', message);
  };
  if (vlad !== ch.get('vlad')) return deny('The statement is for another identity.', 'vlad');
  if (s.origin !== c.origin) return deny('The statement is for another site.', 'origin');
  if (s.rp !== c.rp) return deny('The statement is for another application.', 'rp');
  if (Buffer.from(s.challenge).toString('base64url') !== ch.get('Challenge')) {
    return deny('The statement is for another sign-in.', 'challenge');
  }
  if (Math.abs(nowSec() - s.iat) > STATEMENT_SKEW_S) {
    return deny('The statement is too old (check the clock).', 'iat');
  }

  const v = await verifySignature({
    vladHex: vlad,
    messageHex: signed.message.toString('hex'),
    signatureHex: Buffer.from(signature, 'base64url').toString('hex'),
    rp: c.rp,
  });
  if (!v.ok) {
    log('verify_failed', { vlad: vlad.slice(0, 16), code: v.code, error: v.error });
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

  // Re-check the link: it may have been revoked since the challenge.
  const account = await accountForVlad(vlad);
  if (!account.user) return deny('This BetterSign identity is no longer linked.', account.reason);

  const expiresAt = new Date(Date.now() + c.tokenTtlS * 1000);

  const token = 'bso_' + crypto.randomBytes(32).toString('base64url');
  const row = new Parse.Object('bs_ApiToken');
  row.set('TokenHash', sha256Hex(token));
  row.set('vlad', vlad);
  row.set('UserId', userPtr(account.user.id));
  row.set('ExpiresAt', expiresAt);
  row.set('ClientKey', Buffer.from(s.extSignPub).toString('hex'));
  row.set('ReqId', Buffer.from(s.reqId).toString('hex'));
  row.set('IpAddress', req.headers['x-real-ip'] || '');
  row.setACL(masterOnly());
  await row.save(null, { useMasterKey: true });
  sweep('bs_ApiToken');

  log('token', { vlad: vlad.slice(0, 16), userId: account.user.id, source: account.source });
  return res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: c.tokenTtlS,
    expires_at: expiresAt.toISOString(),
  });
}

// Middleware: Authorization: Bearer bso_… -> req.bs = { vlad, user, token }.
export async function requireToken(req, res, next) {
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m || !TOKEN_RE.test(m[1])) {
    return apiError(res, 401, 'invalid_token', 'Send Authorization: Bearer <access_token>.');
  }
  try {
    const q = new Parse.Query('bs_ApiToken');
    q.equalTo('TokenHash', sha256Hex(m[1]));
    const token = await q.first({ useMasterKey: true });
    if (!token || token.get('RevokedAt') || token.get('ExpiresAt') < new Date()) {
      return apiError(
        res,
        401,
        'invalid_token',
        'The token expired or was revoked. Sign in again.'
      );
    }
    // The link is checked on every call, so unlinking a VLAD takes effect at once.
    const vlad = token.get('vlad');
    const account = await accountForVlad(vlad);
    if (!account.user || account.user.id !== token.get('UserId').id) {
      return apiError(res, 401, 'invalid_token', 'This BetterSign identity is no longer linked.');
    }
    req.bs = { vlad, user: account.user, token };
    return next();
  } catch (e) {
    return next(e);
  }
}

// POST /auth/logout (with the token)
export async function logout(req, res) {
  const { token } = req.bs;
  token.set('RevokedAt', new Date());
  await token.save(null, { useMasterKey: true });
  return res.status(204).end();
}
