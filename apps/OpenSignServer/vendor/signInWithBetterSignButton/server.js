// Vendored from BetterSignApps server/signInWithBetterSignButton/src/server.js (commit fe4d432).
// Don't edit here: change it there and run
//   node server/signInWithBetterSignButton/scripts/vendor.mjs <this folder> server
// --- end of vendoring note ---
// The server half of "Sign in with BetterSign" through the browser extension
// (docs/Technical/extension-login-design.md §4.3, §6.3): check the phone's
// signed sign-in statement before treating its VLAD as signed in.
//
// Runs on Cloudflare Workers and Node 20+ (Web Crypto only, no Node or Worker
// APIs). The site keeps what differs between sites: issuing and storing the
// single-use challenge, the verifier call (passed in as `verify`), and what a
// verified VLAD may do.
//
// What the phone signs today: `vladSig` is a Multisig by the identity's
// /keys/primary over
//   SHA-256("bs-login/v1/statement\n" ‖ statement)
// (bs_fill `login_statement_digest`). Moving it to bs-message's canonical TBS
// (the design's §5 "Planned" note) changes only loginStatementDigest() and
// the nonce sent to the verifier, here.

import { decodeCbor } from "./cbor.js";

export { decodeCbor };

export const STATEMENT_DOMAIN = "bs-login/v1/statement\n";
// How far the statement's iat may be from now, either way.
export const STATEMENT_SKEW_S = 120;
// A statement is about 250 bytes; anything far bigger isn't one.
export const MAX_STATEMENT_BYTES = 8192;
export const MAX_SIGNATURE_BYTES = 16384;

const B64URL_RE = /^[A-Za-z0-9_-]+$/;
const enc = new TextEncoder();

export function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** A fresh challenge for one sign-in: 32 random bytes, base64url. */
export function newChallenge() {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

/** The bytes `vladSig` signs: SHA-256(STATEMENT_DOMAIN ‖ statement). */
export async function loginStatementDigest(statementBytes) {
  const domain = enc.encode(STATEMENT_DOMAIN);
  const msg = new Uint8Array(domain.length + statementBytes.length);
  msg.set(domain);
  msg.set(statementBytes, domain.length);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", msg));
}

/**
 * Read a bs-login v1 statement: a canonical-CBOR map of exactly
 *   { v: 1, type: "bs-login", vlad, origin, rp, challenge, reqId, extSignPub, iat }.
 * Throws an Error naming what's wrong.
 */
export function parseLoginStatement(bytes) {
  const st = decodeCbor(bytes);
  const get = (k, type) => {
    const v = st instanceof Map ? st.get(k) : undefined;
    if (type === "bytes" ? !(v instanceof Uint8Array) : typeof v !== type) throw new Error(`malformed statement.${k}`);
    return v;
  };
  const s = {
    v: get("v", "number"), type: get("type", "string"), vlad: get("vlad", "bytes"), origin: get("origin", "string"),
    rp: get("rp", "string"), challenge: get("challenge", "bytes"), reqId: get("reqId", "bytes"),
    extSignPub: get("extSignPub", "bytes"), iat: get("iat", "number"),
  };
  if (s.v !== 1 || s.type !== "bs-login" || st.size !== 9) throw new Error("not a bs-login v1 statement");
  return s;
}

/**
 * Check what the extension handed the page after the phone approved.
 *
 *   statement, vladSig  base64url strings, as the extension returns them
 *   origin              this site's origin (the statement must name it)
 *   rp                  this site's bs-id client id
 *   challenge           this sign-in's challenge (base64url), from the site's store
 *   verify              async ({ vlad, nonce, signature }) => { ok, error?, unavailable? }
 *                       with hex strings: the verifier's POST /verify
 *                       (verifierClient() below, or the site's own client)
 *
 * Returns { ok: true, vladHex, statement } or
 *         { ok: false, status, error, description } (OAuth-style error codes).
 * Only the challenge's single use is left to the caller: take it after this
 * succeeds (or before, if the store can't count attempts).
 */
export async function verifyExtensionLogin({
  statement, vladSig, origin, rp, challenge, verify, now = Math.floor(Date.now() / 1000), maxSkewS = STATEMENT_SKEW_S,
}) {
  const fail = (status, error, description) => ({ ok: false, status, error, description });
  for (const [k, v, max] of [["statement", statement, MAX_STATEMENT_BYTES], ["vladSig", vladSig, MAX_SIGNATURE_BYTES]]) {
    if (typeof v !== "string" || !B64URL_RE.test(v) || v.length > Math.ceil((max * 4) / 3)) {
      return fail(400, "invalid_request", `${k} missing or not base64url`);
    }
  }
  const statementBytes = b64urlDecode(statement);
  let s;
  try {
    s = parseLoginStatement(statementBytes);
  } catch (e) {
    return fail(400, "invalid_request", e.message);
  }
  if (s.origin !== origin) return fail(401, "access_denied", "statement is for another site");
  if (s.rp !== rp) return fail(401, "access_denied", "statement is for another application");
  if (typeof challenge !== "string" || b64url(s.challenge) !== challenge) {
    return fail(401, "access_denied", "statement is for another sign-in");
  }
  if (Math.abs(now - s.iat) > maxSkewS) return fail(401, "access_denied", "statement is too old");

  const vladHex = toHex(s.vlad);
  const digest = await loginStatementDigest(statementBytes);
  let v;
  try {
    v = await verify({ vlad: vladHex, nonce: toHex(digest), signature: toHex(b64urlDecode(vladSig)) });
  } catch (e) {
    v = { ok: false, unavailable: true, error: "verifier unreachable: " + ((e && e.message) || e) };
  }
  if (!v || !v.ok) {
    const why = (v && v.error) || "unknown error";
    if (v && v.unavailable) return fail(503, "temporarily_unavailable", "the verifier couldn't check the signature: " + why);
    return fail(401, "access_denied", "the phone's signature didn't verify: " + why);
  }
  return { ok: true, vladHex, statement: s };
}

/**
 * A `verify` for verifyExtensionLogin: POST {url}/verify on the BetterSign
 * verifier (server/OrgIdP/bs-verifier), with x-bs-verifier-secret if set.
 * A 503 (the verifier couldn't get the log) comes back as `unavailable`.
 */
export function verifierClient({ url, secret, fetch: fetchFn = (...a) => fetch(...a) }) {
  const base = (url || "").replace(/\/$/, "");
  return async (body) => {
    if (!base) return { ok: false, error: "verifier URL not configured" };
    const headers = { "content-type": "application/json" };
    if (secret) headers["x-bs-verifier-secret"] = secret;
    try {
      const r = await fetchFn(base + "/verify", { method: "POST", headers, body: JSON.stringify(body) });
      const parsed = await r.json().catch(() => ({}));
      if (r.ok && parsed.ok) return parsed;
      return { ok: false, unavailable: r.status === 503, error: parsed.error || `verifier http ${r.status}` };
    } catch (e) {
      return { ok: false, unavailable: true, error: "verifier unreachable: " + e.message };
    }
  };
}
