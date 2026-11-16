// "Sign in with BetterSign": this site's settings for the shared sign-in kit
// (src/vendor/signInWithBetterSignButton/browser.js, vendored from BetterSignApps
// server/signInWithBetterSignButton).
//
// signInWithBetterSign() tries the BetterSign extension first: if this browser
// was linked to this site ("Remember this browser" at the first passkey
// sign-in), the phone approves with a tap, no QR. The server half is the
// `bsextchallenge` and `bsextlogin` cloud functions
// (apps/OpenSignServer/cloud/parsefunction/bsextlogin.js).
//
// Otherwise it redirects to bs-id (https://id.bettersign.ing) for the passkey:
// an authorization-code + PKCE flow. bs-id sends the browser back to
// BSID_CALLBACK_PATH, where Login.jsx calls takeBsIdCallback() and then the
// `bsidlogin` cloud function (apps/OpenSignServer/cloud/parsefunction/bsidlogin.js),
// which exchanges the code, verifies the id_token and returns a session.

import Parse from "parse";
import { getEnv } from "./Utils";
import {
  signInWithBetterSign as signIn,
  takePasskeyCallback
} from "../vendor/signInWithBetterSignButton/browser";

export const BSID_CALLBACK_PATH = "/auth/bettersign/callback";

function config() {
  const env = typeof getEnv === "function" ? getEnv() : null;
  const url =
    env?.REACT_APP_BS_ID_URL ||
    process.env.REACT_APP_BS_ID_URL ||
    "https://id.bettersign.ing";
  const clientId =
    env?.REACT_APP_BS_ID_CLIENT_ID ||
    process.env.REACT_APP_BS_ID_CLIENT_ID ||
    "bs-opensign";
  return { bsIdUrl: url.replace(/\/$/, ""), clientId };
}

export const bsIdRedirectUri = () =>
  window.location.origin + BSID_CALLBACK_PATH;

/**
 * Sign in: the extension if this browser is linked, otherwise the passkey at
 * bs-id. Resolves to
 *   { result: "ok", value }   value: what `bsextlogin` returned (as bsidlogin)
 *   { result: "denied" }      the user said no on the phone
 *   { result: "failed", error }
 *   { result: "redirecting" } on the way to bs-id
 */
export function signInWithBetterSign({ onStatus } = {}) {
  let challengeId;
  return signIn({
    ...config(),
    redirectUri: bsIdRedirectUri(),
    onStatus,
    getChallenge: async () => {
      const r = await Parse.Cloud.run("bsextchallenge");
      challengeId = r.challengeId;
      return r.challenge;
    },
    complete: ({ statement, vladSig }) =>
      Parse.Cloud.run("bsextlogin", { challengeId, statement, vladSig })
  });
}

/**
 * Read bs-id's redirect back. Single use, and checks `state`, so a callback
 * this browser didn't start is refused.
 * Returns { code, codeVerifier, nonce, redirectUri } or { error }.
 */
export const takeBsIdCallback = (search) =>
  takePasskeyCallback(search, { redirectUri: bsIdRedirectUri() });
