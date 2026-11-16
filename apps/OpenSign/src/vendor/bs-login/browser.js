// Vendored from BetterSignApps server/bs-login/src/browser.js (commit 0ea2796).
// Don't edit here: change it there and run
//   node server/bs-login/scripts/vendor.mjs <this folder> browser
// --- end of vendoring note ---
// The browser half of "Sign in with BetterSign": try the BetterSign extension
// (a tap on the phone, no QR), and fall back to the passkey at bs-id.
//
//   extensionSignIn()       the extension path (extension-login-design.md §4.3,
//                           page messages §11.1)
//   startPasskeySignIn()    the passkey path: an authorization-code + PKCE
//   takePasskeyCallback()   redirect to bs-id and back (web-signin-design.md)
//   signInWithBetterSign()  both: the extension if this browser is linked to
//                           this site, otherwise the passkey
//
// The first passkey sign-in links the browser ("Remember this browser" on
// bs-id's page) when the site's bs-id client has `extensionLogin: true`. After
// that, extensionSignIn() works on that site.
//
// The page never talks to the relay or the phone: the extension does, and it
// takes the page's origin from the browser, not from the page. So this has to
// run in the site's own top-level page, not in an iframe from another origin.
//
// The site's server issues the challenge and checks the result (server.js
// verifyExtensionLogin); this file only carries them.

/**
 * Sign in through the BetterSign extension.
 *
 *   rp            the site's bs-id client id (what the link was made for)
 *   getChallenge  async () => challenge (base64url, 32 bytes) from the site's
 *                 server. Called only once the extension says this browser is
 *                 linked, so unlinked visitors cost the server nothing.
 *   complete      async ({ statement, vladSig, challenge }) => value: send them
 *                 to the site's server. Throw to fail.
 *   onStatus      optional (message) => void, for "Approve on your phone…"
 *
 * Resolves to one of
 *   { result: "ok", value }             complete() returned value
 *   { result: "unavailable", reason }   use the passkey: no extension, not
 *                                       linked, phone offline, timed out…
 *   { result: "denied" }                the user said no on the phone
 *   { result: "failed", error }         the server refused the sign-in
 *
 * Self-contained (no module-level references), so a server-rendered page can
 * inline it as `const extensionSignIn = ${extensionSignIn.toString()};`.
 */
export async function extensionSignIn({
  rp, getChallenge, complete, onStatus = () => {}, helloTimeoutMs = 1500, requestTimeoutMs = 130000,
}) {
  const ask = (type, extra, timeoutMs) => new Promise((resolve) => {
    const id = crypto.randomUUID();
    const onMsg = (e) => {
      const d = e.data;
      if (e.source !== window || !d || d.source !== "bettersign-extension" || d.id !== id) return;
      window.removeEventListener("message", onMsg);
      clearTimeout(t);
      resolve(d);
    };
    const t = setTimeout(() => {
      window.removeEventListener("message", onMsg);
      resolve(null);
    }, timeoutMs);
    window.addEventListener("message", onMsg);
    window.postMessage({ source: "bettersign-page", id, type, ...extra }, window.location.origin);
  });

  const hello = await ask("bs-login/hello", { rp }, helloTimeoutMs);
  if (!hello) return { result: "unavailable", reason: "no-extension" };
  if (!hello.linked) return { result: "unavailable", reason: "not-linked" };

  let challenge;
  try {
    challenge = await getChallenge();
  } catch (error) {
    return { result: "failed", error };
  }
  onStatus("Approve on your phone…");
  const r = await ask("bs-login/request", { rp, challenge }, requestTimeoutMs);
  if (!r) return { result: "unavailable", reason: "timeout" };
  if (r.result === "denied") return { result: "denied" };
  if (r.result !== "ok") return { result: "unavailable", reason: r.result || "error" };

  onStatus("Signing in…");
  try {
    return { result: "ok", value: await complete({ statement: r.statement, vladSig: r.vladSig, challenge }) };
  } catch (error) {
    return { result: "failed", error };
  }
}

// --- passkey (bs-id authorization code + PKCE) ------------------------------------

const FLOW_KEY = "bs_login_flow";

function b64url(bytes) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const randomB64url = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));

async function s256(verifier) {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

/**
 * Redirect to bs-id to sign in with the passkey (a public client: the site's
 * server exchanges the code with the verifier from takePasskeyCallback()).
 * Keeps state, nonce and the PKCE verifier in sessionStorage.
 *
 *   bsIdUrl      e.g. https://id.bettersign.ing
 *   clientId     the site's bs-id client id
 *   redirectUri  registered with bs-id for that client
 */
export async function startPasskeySignIn({ bsIdUrl, clientId, redirectUri, scope = "openid" }) {
  const flow = { state: randomB64url(32), nonce: randomB64url(16), verifier: randomB64url(32) };
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  const dest = new URL(bsIdUrl.replace(/\/$/, "") + "/authorize");
  dest.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: await s256(flow.verifier),
    code_challenge_method: "S256",
  }).toString();
  window.location.assign(dest.toString());
}

/**
 * Read bs-id's redirect back. Consumes the stored flow (single use) and checks
 * `state`, so a callback this browser didn't start is refused.
 * Returns { code, codeVerifier, nonce, redirectUri } or { error }.
 */
export function takePasskeyCallback(search, { redirectUri }) {
  const q = new URLSearchParams(search);
  const raw = sessionStorage.getItem(FLOW_KEY);
  sessionStorage.removeItem(FLOW_KEY);
  if (q.get("error")) return { error: q.get("error_description") || q.get("error") };
  let flow;
  try {
    flow = JSON.parse(raw || "");
  } catch {
    flow = null;
  }
  if (!flow || !q.get("state") || q.get("state") !== flow.state) {
    return { error: "This sign-in link has expired. Please try again." };
  }
  if (!q.get("code")) return { error: "BetterSign returned no sign-in code." };
  return { code: q.get("code"), codeVerifier: flow.verifier, nonce: flow.nonce, redirectUri };
}

// --- both ---------------------------------------------------------------------------

/**
 * The "Sign in with BetterSign" button: the extension if it can, the passkey
 * otherwise. Takes extensionSignIn()'s options plus startPasskeySignIn()'s
 * ({ bsIdUrl, clientId, redirectUri, scope }); `rp` defaults to clientId.
 *
 * Resolves like extensionSignIn(), except that "unavailable" never comes
 * back: the page is on its way to bs-id instead ({ result: "redirecting" }).
 */
export async function signInWithBetterSign(opts) {
  const r = await extensionSignIn({ rp: opts.clientId, ...opts });
  if (r.result !== "unavailable") return r;
  await startPasskeySignIn(opts);
  return { result: "redirecting", reason: r.reason };
}
