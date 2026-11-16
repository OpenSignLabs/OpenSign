// bsidlogin — "Sign in with BetterSign" through bs-id (the BetterSign OIDC
// provider, BetterSignApps apps/Experiments/bs-id, https://id.bettersign.ing).
//
// The browser runs the authorization-code + PKCE redirect (see
// apps/OpenSign/src/constant/bsid.js) and hands us the code. We:
//   1. exchange it at bs-id /token (public client: code_verifier, no secret),
//   2. verify the id_token (ES256 against bs-id /jwks; iss, aud, nonce, exp),
//   3. map its `vlad` to an existing OpenSign account (the bs_Identity class,
//      utils/bsIdentity.js); a VLAD with no active link is recorded for an
//      admin to link and refused,
//   4. mint a Parse session for that account (same /loginAs path as
//      bettersignlogin), which Login.jsx finishes with thirdpartyLoginfn.
//
// Only linked VLADs can sign in, and only to an account that already exists:
// the admin picks the account, not the user.
//
// Env:
//   BS_ID_URL        bs-id origin (= the id_token `iss`). Default https://id.bettersign.ing
//   BS_ID_CLIENT_ID  this app's client_id at bs-id. Default bs-opensign
//
// Params: { code, codeVerifier, redirectUri, nonce }
// Returns: { sessionToken, objectId, email, bettersign } (bettersign: the session
// was recorded as a BetterSign one)

import crypto from 'node:crypto';
import axios from 'axios';
import { sessionViaLoginAs } from './bettersignlogin.js';
import { accountForVlad, recordSignInAttempt } from '../../utils/bsIdentity.js';
import { recordBsIdSession } from '../../utils/bsWebSession.js';

const B64URL_RE = /^[A-Za-z0-9_-]+$/;
const JWKS_TTL_MS = 10 * 60 * 1000;

function config() {
  return {
    url: (process.env.BS_ID_URL || 'https://id.bettersign.ing').replace(/\/$/, ''),
    clientId: process.env.BS_ID_CLIENT_ID || 'bs-opensign',
  };
}

const fail = msg => new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, msg);
const b64urlJson = s => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

// --- id_token verification (bs-id, ES256) -------------------------------------

let jwksCache = null; // { url, at, keys }

async function bsIdKey(c, kid) {
  const url = c.url + '/jwks';
  if (
    !jwksCache ||
    jwksCache.url !== url ||
    Date.now() - jwksCache.at > JWKS_TTL_MS ||
    !jwksCache.keys.some(k => k.kid === kid)
  ) {
    const res = await axios.get(url, { timeout: 10000 });
    jwksCache = { url, at: Date.now(), keys: res.data?.keys || [] };
  }
  const jwk = jwksCache.keys.find(k => k.kid === kid);
  if (!jwk) throw new Error('id_token kid not in bs-id jwks');
  return crypto.createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y },
    format: 'jwk',
  });
}

export async function verifyIdToken(c, idToken, nonce) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3 || !parts.every(p => B64URL_RE.test(p))) {
    throw new Error('id_token is not a JWS');
  }
  const header = b64urlJson(parts[0]);
  if (header.alg !== 'ES256' || !header.kid) throw new Error('id_token must be ES256 with a kid');
  const key = await bsIdKey(c, header.kid);
  const ok = crypto.verify(
    'sha256',
    Buffer.from(parts[0] + '.' + parts[1]),
    { key, dsaEncoding: 'ieee-p1363' }, // JWS ES256 is raw r||s
    Buffer.from(parts[2], 'base64url')
  );
  if (!ok) throw new Error('id_token signature does not verify');
  const p = b64urlJson(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  if (p.iss !== c.url) throw new Error(`id_token iss ${p.iss} is not ${c.url}`);
  if (p.aud !== c.clientId) throw new Error('id_token aud is not this app');
  if (p.nonce !== nonce) throw new Error('id_token nonce does not match this sign-in');
  if (typeof p.exp !== 'number' || p.exp < now - 30) throw new Error('id_token expired');
  if (typeof p.iat !== 'number' || p.iat > now + 60)
    throw new Error('id_token iat is in the future');
  if (typeof p.sub !== 'string' || !p.sub) throw new Error('id_token has no sub');
  if (typeof p.vlad !== 'string' || !/^[0-9a-f]+$/i.test(p.vlad))
    throw new Error('id_token has no vlad');
  return p;
}

// --- cloud function -------------------------------------------------------------

export default async function bsidlogin(request) {
  const { code, codeVerifier, redirectUri, nonce } = request.params || {};
  if (![code, codeVerifier, nonce].every(v => typeof v === 'string' && B64URL_RE.test(v))) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing or malformed sign-in parameters.');
  }
  if (typeof redirectUri !== 'string' || !/^https?:\/\//.test(redirectUri)) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing redirect URI.');
  }
  const c = config();

  // 1. Code -> tokens. bs-id checks client_id, redirect_uri and PKCE.
  let tokens;
  try {
    const res = await axios.post(
      c.url + '/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: c.clientId,
        code_verifier: codeVerifier,
      }).toString(),
      { headers: { 'content-type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );
    tokens = res.data;
  } catch (e) {
    console.log('bsidlogin: token exchange failed', e?.response?.data || e?.message);
    throw fail('BetterSign sign-in failed. Please try again.');
  }

  // 2. Verify the id_token.
  let claims;
  try {
    claims = await verifyIdToken(c, tokens?.id_token, nonce);
  } catch (e) {
    console.log('bsidlogin: id_token rejected:', e.message);
    throw fail('BetterSign sign-in could not be verified.');
  }

  // 3 and 4: the account and its session.
  return signInVlad(claims.vlad.toLowerCase(), 'bsidlogin');
}

// A VLAD that has proved itself (bs-id's id_token, or the phone's signature
// in bsextlogin.js) -> a session for its linked account. `event` prefixes the
// log lines.
export async function signInVlad(vlad, event) {
  // 3. VLAD -> account.
  const account = await accountForVlad(vlad);
  if (account.reason === 'no_account') {
    console.log(JSON.stringify({ event: `${event}_no_account`, vlad }));
    throw fail('The account linked to this BetterSign identity does not exist.');
  }
  if (!account.user) {
    console.log(JSON.stringify({ event: `${event}_denied`, vlad, reason: account.reason }));
    // The VLAD proved itself: list it on the Users page for an admin.
    if (account.reason !== 'ambiguous') await recordSignInAttempt(vlad);
    throw fail(
      `This BetterSign identity isn't linked to an account. Ask an admin to add it (VLAD ${vlad.slice(0, 16)}…).`
    );
  }
  const { user, email } = account;

  // 4. Session for that account, remembered as a BetterSign session (for
  // "Sign on phone", utils/bsWebSession.js). The sign-in doesn't depend on
  // that: if it can't be recorded, the session just isn't a BetterSign one.
  const login = await sessionViaLoginAs(user.id);
  let bettersign = true;
  try {
    await recordBsIdSession(login.sessionToken, vlad, user.id);
  } catch (e) {
    bettersign = false;
    console.log(JSON.stringify({ event: `${event}_session_not_recorded`, error: e.message }));
  }
  console.log(JSON.stringify({ event, vlad: vlad.slice(0, 16), userId: user.id }));
  return { sessionToken: login.sessionToken, objectId: user.id, email, bettersign };
}
