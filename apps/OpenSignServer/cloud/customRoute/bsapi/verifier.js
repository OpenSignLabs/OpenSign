// Client for the BetterSign verifier (BetterSignApps server/OrgIdP/bs-verifier,
// https://verify.bettersign.ing). POST /verify checks a Multisig over arbitrary
// bytes against the identity's current /keys/primary, after resolving and
// hardened-verifying its log.
//
// Any non-200 is a failed sign-in. A 503 (resolve_failed, incomplete_log) means
// the verifier couldn't get the log and made no decision; we surface it as
// `unavailable` so the client can retry, but it never counts as a pass.
//
// Env:
//   BS_VERIFIER_URL     default https://verify.bettersign.ing
//   BS_VERIFIER_SECRET  sent as x-bs-verifier-secret (the droplet's BS_VERIFIER_SECRET)

import axios from 'axios';

export function verifierUrl() {
  return (process.env.BS_VERIFIER_URL || 'https://verify.bettersign.ing').replace(/\/$/, '');
}

// Returns { ok: true } or { ok: false, unavailable, code, error }.
// `rp` is the relying party the statement names (BS_API_RP); the verifier
// treats it as a hint, but it should match.
export async function verifySignature({ vladHex, messageHex, signatureHex, rp }) {
  const headers = { 'content-type': 'application/json' };
  if (process.env.BS_VERIFIER_SECRET) {
    headers['x-bs-verifier-secret'] = process.env.BS_VERIFIER_SECRET;
  }
  try {
    const res = await axios.post(
      verifierUrl() + '/verify',
      { vlad: vladHex, nonce: messageHex, signature: signatureHex, rp },
      { headers, timeout: 30000, validateStatus: () => true }
    );
    const body = res.data || {};
    if (res.status === 200 && body.ok === true) return { ok: true };
    return {
      ok: false,
      unavailable: res.status === 503,
      code: body.code || `http_${res.status}`,
      error: body.error || `verifier http ${res.status}`,
    };
  } catch (e) {
    return { ok: false, unavailable: true, code: 'unreachable', error: e.message };
  }
}
