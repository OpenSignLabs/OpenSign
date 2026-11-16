// bsextchallenge / bsextlogin — "Sign in with BetterSign" through the
// BetterSign browser extension: a tap on the phone, no QR (BetterSignApps
// docs/Technical/extension-login-design.md §4.3).
//
// The first sign-in in a browser goes through bs-id's passkey page (bsidlogin),
// where "Remember this browser" links the extension to this site. After that,
// Login.jsx (through vendor/signInWithBetterSignButton/browser.js):
//   1. asks the extension whether this browser is linked; if so
//   2. bsextchallenge {} -> { challengeId, challenge }
//   3. asks the extension to sign in; the phone approves and signs a bs-login
//      statement naming our origin, our bs-id client and the challenge
//   4. bsextlogin { challengeId, statement, vladSig } -> the same result as
//      bsidlogin: { sessionToken, objectId, email, bettersign }
//
// The statement check is the shared one (vendor/signInWithBetterSignButton/server.js, from
// BetterSignApps server/signInWithBetterSignButton), as oauthService and apiDelegateService use.
// A challenge is single-use (one attempt) and lives CHALLENGE_TTL_MS.
//
// Env:
//   BS_API_ORIGIN    the origin statements must name (this site, as the browser
//                    sees it). Default https://docsign.bettersign.ing
//   BS_ID_CLIENT_ID  the rp statements must name: this app's bs-id client,
//                    which the link was made for. Default bs-opensign
//   BS_API_AUTH_RATE_PER_MIN  per-IP limit on both functions. Default 30
//   plus BS_VERIFIER_URL / BS_VERIFIER_SECRET (customRoute/bsapi/verifier.js)

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { newChallenge, verifyExtensionLogin } from '../../vendor/signInWithBetterSignButton/server.js';
import { verifySignature } from '../customRoute/bsapi/verifier.js';
import { signInVlad } from './bsidlogin.js';

const CLASS = 'bs_LoginChallenge';
// Long enough for the phone: the extension waits up to 120 s for it.
const CHALLENGE_TTL_MS = 3 * 60 * 1000;
const ID_RE = /^[A-Za-z0-9]{1,32}$/;
const DEFAULT_PER_MIN = 30;

function config() {
  return {
    origin: (process.env.BS_API_ORIGIN || 'https://docsign.bettersign.ing').replace(/\/$/, ''),
    rp: process.env.BS_ID_CLIENT_ID || 'bs-opensign',
  };
}

const log = (event, fields) => console.log(JSON.stringify({ event: `bsextlogin_${event}`, ...fields }));

// Both functions are open to anyone, and each stores a row or calls the
// verifier, so they're limited per IP (in memory, per machine). Fly-Client-IP
// is set by Fly and can't be sent by the client; off Fly, Parse's request.ip.
const limiters = new Map();
async function rateLimit(request, route) {
  const points = Number(process.env.BS_API_AUTH_RATE_PER_MIN) || DEFAULT_PER_MIN;
  const key = `${route}:${points}`;
  if (!limiters.has(key)) limiters.set(key, new RateLimiterMemory({ points, duration: 60 }));
  const ip = request.headers?.['fly-client-ip'] || request.ip || '';
  try {
    await limiters.get(key).consume(ip);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Parse.Error(Parse.Error.REQUEST_LIMIT_EXCEEDED, 'Too many sign-in attempts. Try again in a minute.');
  }
}

// Best-effort sweep of expired rows; never blocks or fails the request.
function sweep() {
  new Parse.Query(CLASS)
    .lessThan('ExpiresAt', new Date())
    .limit(100)
    .find({ useMasterKey: true })
    .then(rows => rows.length && Parse.Object.destroyAll(rows, { useMasterKey: true }))
    .catch(() => {});
}

export async function bsextchallenge(request) {
  await rateLimit(request, 'challenge');
  const challenge = newChallenge();
  const row = new Parse.Object(CLASS);
  row.set('Challenge', challenge);
  row.set('ExpiresAt', new Date(Date.now() + CHALLENGE_TTL_MS));
  row.set('Uses', 0);
  row.setACL(new Parse.ACL()); // master key only
  await row.save(null, { useMasterKey: true });
  sweep();
  return { challengeId: row.id, challenge };
}

// Take the challenge: only the request that moves Uses to 1 goes on, so two
// requests racing with the same statement can't both get a session. Returns
// the challenge string, or null if it's unknown, expired or used.
async function takeChallenge(challengeId) {
  const row = await new Parse.Query(CLASS).get(challengeId, { useMasterKey: true }).catch(() => null);
  if (!row || row.get('ExpiresAt') < new Date()) return null;
  row.increment('Uses');
  // Fails if a racing request already took and deleted it.
  const taken = await row.save(null, { useMasterKey: true }).then(
    () => row.get('Uses') === 1,
    () => false
  );
  if (!taken) return null;
  row.destroy({ useMasterKey: true }).catch(() => {});
  return row.get('Challenge');
}

export async function bsextlogin(request) {
  await rateLimit(request, 'login');
  const { challengeId, statement, vladSig } = request.params || {};
  if (typeof challengeId !== 'string' || !ID_RE.test(challengeId)) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing or malformed sign-in parameters.');
  }
  const challenge = await takeChallenge(challengeId);
  if (!challenge) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'This sign-in expired. Please try again.');
  }

  const c = config();
  const v = await verifyExtensionLogin({
    statement,
    vladSig,
    origin: c.origin,
    rp: c.rp,
    challenge,
    verify: async ({ vlad, nonce, signature }) => {
      const r = await verifySignature({ vladHex: vlad, messageHex: nonce, signatureHex: signature, rp: c.rp });
      if (r.misconfigured) log('verifier_misconfigured', { code: r.code });
      return r;
    },
  });
  if (!v.ok) {
    log('denied', { status: v.status, error: v.error, why: v.description });
    if (v.status === 503) {
      throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'BetterSign could not check the sign-in right now. Please try again.');
    }
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'BetterSign sign-in could not be verified.');
  }
  return signInVlad(v.vladHex, 'bsextlogin');
}
