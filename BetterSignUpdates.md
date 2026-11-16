# BetterSign Updates

Changes this fork (Open BetterSign) makes on top of upstream OpenSign. Hosting and
operations are covered in [DEPLOYMENT.md](DEPLOYMENT.md).

- [Change log](#change-log)
- [Home page and sign-in](#home-page-and-sign-in)
  - [Sign in with BetterSign](#sign-in-with-bettersign)
  - [What a VLAD signs to log in](#what-a-vlad-signs-to-log-in)
  - [Recipients: the emailed signing link](#recipients-the-emailed-signing-link)
  - [No username/password sign-in](#no-usernamepassword-sign-in)
  - [Brand UI](#brand-ui)
- [One-time codes (OTC)](#one-time-codes-otc)
- [API changes](#api-changes)
- [Deploying the sign-in lockdown](#deploying-the-sign-in-lockdown-2026-11-13)
- [Testing the sign-in lockdown](#testing-the-sign-in-lockdown-2026-11-13)
- [Changes from upstream OpenSign](#changes-from-upstream-opensign)
- [Follow-ups](#follow-ups)

---

## Change log

### 2026-11-15: admins can edit users

- The Users page has an **Edit** action (pencil) next to Delete. An admin can
  change a user's name, phone, role and teams. **The email can't be changed**:
  it's also the account's username, and documents and contacts find people by it.
- Cloud function `updateuserbyadmin`
  (`apps/OpenSignServer/cloud/parsefunction/updateUserByAdmin.js`), with the same
  rules as `adduser`: admins and org admins only, within their tenant; an org
  admin only within their own organization and not on the tenant admin; roles
  OrgAdmin, Editor or User; teams from the user's organization. The tenant
  admin's role can't be changed, and nobody can change their own role. Name and
  phone are copied to `_User`.
- A role change takes effect for permission checks at once. The user's menus
  follow at their next sign-in.

### 2026-11-15: manage VLAD links on the Users page; unknown VLADs are recorded

- The Users page has a **BetterSign identities** section (admins only,
  `apps/OpenSign/src/components/BsIdentities.jsx`). An admin can add a VLAD,
  choose its account, give it a label, switch it on or off, or remove it. It
  shows the links to accounts in the admin's tenant and the unassigned
  identities. Cloud functions `bsidentitylist`, `bsidentitysave` and
  `bsidentitydelete` (`apps/OpenSignServer/cloud/parsefunction/bsIdentityAdmin.js`).
- A VLAD that signs in without an active link is added to `bs_Identity`
  **turned off, with no account**, label `Sign-in attempt`, and `LastSeenAt` set
  (bumped on later attempts). It's still refused. It's only recorded once the
  identity is proven: bs-id's signed `id_token` for Sign in with BetterSign, the
  verifier's signature check for the desktop API. So nobody can fill the table by
  posting random VLADs.
- The desktop API now gives an unlinked VLAD a challenge (so its signature can be
  checked), and `/auth/token` answers `403 not_linked`. Before, `/auth/challenge`
  answered `403 not_linked` straight away.
- `bs_Identity` has an `Active` flag (the on/off switch) instead of `RevokedAt`.
  A row is on only if `Active` is `true`, and it must have an account. Migration
  `20261115150000-bs_identity_active_flag.cjs` converts existing rows
  (`Active` = no `RevokedAt`).

### 2026-11-15: VLAD links live only in MongoDB (`bs_Identity`)

- `BS_ID_USERS` is gone. Which account a VLAD signs in to, for both Sign in with
  BetterSign and the desktop API, is now read only from the master-key-only
  `bs_Identity` class (`apps/OpenSignServer/utils/bsIdentity.js`).
- Migration `20261115140000-move_bs_id_users_to_bs_identity.cjs` copies the old
  `fly.toml` list (and `BS_ID_USERS`, if a deployment still sets it) into
  `bs_Identity` with the label `Moved from BS_ID_USERS`. VLADs that already have a
  row, and emails with no account, are skipped.
- Linking or unlinking a VLAD no longer needs a redeploy; it takes effect at once.

### 2026-11-15: signed-in users can create documents again

- `DocumentBeforesave` refused every document created with a user's session
  ("VladSignatures is set by the server."), so Request Signatures failed. New
  documents are now checked with `has()`; updates still with `dirty()`.

### 2026-11-15: a wrong verifier secret is reported as such

- When the BetterSign verifier refuses this server's `BS_VERIFIER_SECRET`
  (`401 bad_secret`: wrong or not set), the desktop API's sign-in and uploads now
  return `502 verifier_misconfigured` ("This server's BetterSign verifier secret
  is wrong or not set") and log an error. They used to return `401
  access_denied`, "The identity's signature didn't verify", which sent people
  looking at the identity instead of the server's settings.

### 2026-11-15: seal completed documents with docsign's BetterSign identity

- OpenSign's seal on a completed document, and on its completion certificate,
  can now come from **bs-service-identity**. That's docsign's own BetterSign
  identity, a private Fly app (`bs-service-identity`, BetterSignApps
  `server/bs-service-identity`, PR #200). The demo PFX is no longer needed for
  that seal. Plan and reasons: [docs/BsServiceIdentitySealing.md](docs/BsServiceIdentitySealing.md).
- All sealing goes through `apps/OpenSignServer/utils/seal.js`. `SEAL_BACKEND`
  chooses `p12` (the default, today's behaviour) or `bs-service-identity`. A
  tenant that uploaded its own certificate is always sealed with it.
- A seal by the service also produces a `.sig` file, the BetterSign proof needed
  to verify it later. It's stored next to the PDF, and the document records how
  it was sealed in two new server-only fields:
  - `Seal` (the signed PDF) and `CertificateSeal` (the certificate):
    `{ backend, recordId, logId, plogVlad, verificationKey, fieldName, sealedLength, sealedAt, sigUrl }`
    for the service, `{ backend: 'p12', tenantCertificate }` for a PFX.
  - `sealedLength`: the `.sig` verifies only the first `sealedLength` bytes of
    the file.
- If the service is down, the last signer's signing fails and nothing is stored.
  They can try again. `SEAL_FALLBACK=p12` seals with the PFX instead (for the
  rollout only); those seals are recorded with `fallback: true`.
- The seal no longer carries a reason, location or contact. bs-sdk writes the
  signature itself and has no fields for them yet. The certificate's name is
  the service's `BS_SERVICE_SIGNER_NAME`, and the field is named
  `OpenSign seal <time>`.
- Flattening and sealing a normal (not append-only) document are now two steps:
  `processPdf` only flattens, then the seal is added.

### 2026-11-15: VLAD sign-in signs the canonical bs-message form

- The desktop API (`/api/v1`, [docs/BetterSignAPI.md](docs/BetterSignAPI.md)) now
  requires sign-in and upload statements to be signed as bs-auth signs messages:
  `DOMAIN_SEP ‖ sender_vlad ‖ sender_key_path ‖ receiver_vlad ‖ content_type ‖ body`.
  See [What a VLAD signs to log in](#what-a-vlad-signs-to-log-in).
- A client may send the full signed bytes as `message`; the server inspects them
  and refuses anything not in that form before asking the verifier.
- New setting `BS_API_RECEIVER_VLAD` (this server's VLAD). If it isn't set, the
  server generates a random one on first use and stores it in the master-key-only
  `bs_ApiConfig` class (migration `20261115120000-create_bs_apiconfig.cjs`), so it
  stays the same across machines and restarts. A malformed value turns the desktop
  API's sign-in and uploads off (`503 not_configured`).
- Signatures over the old `SHA-256("bs-login/v1/statement\n" ‖ statement)` digest
  are refused.

### 2026-11-14: BetterSign desktop API (`/api/v1`) and append-only signing

- A REST API for the BetterSign desktop app, which holds the user's VLAD and keys:
  sign in by signing a challenge (checked by the BetterSign verifier), list and
  download documents, and upload a PDF signed on the desktop. Reference:
  [docs/BetterSignAPI.md](docs/BetterSignAPI.md).
- VLAD -> account links moved to the master-key-only `bs_Identity` class
  (`utils/bsIdentity.js`), shared with Sign in with BetterSign.
- Once a VLAD has signed a document, it's **append-only**: online signers and
  OpenSign's seal add incremental updates instead of rewriting the PDF, so the
  desktop signature stays valid (`utils/appendOnlyPdf.js` on both server and
  frontend).
- Signing commits are a compare-and-swap on `contracts_Document.SignRevision`, so
  two signers working from the same version can't both be stored.
- Desktop uploads email the next signer for in-order documents, as browser
  signing does.
- Tests: `npm run test:bsapi` and `npm run test:bsapi:integration`
  (`apps/OpenSignServer`), also run in CI (`.github/workflows/bettersign-tests.yml`).

### 2026-11-13: sign-in lockdown and one-time code hardening

- **Home page:** Sign in with BetterSign is the only way to sign in. The
  email/password form, the "Forgot password?" link and the code sign-in were removed.
  A hint points recipients to the link in their email.
- **Password sign-in blocked on the server** with a `beforeLogin` hook, including
  Parse's `/login` and the `loginuser` function. The Forgot Password and Change
  Password pages, the Change Password menu items and the admin "Reset password"
  action were removed.
- **One-time codes are only for document recipients.** Without a signed-in user, the
  server sends or accepts a code only for an email that is a signer of the given
  document. A signed-in user can only get a code for their own email.
- **Codes are 6 digits** (previously 4), from a secure random generator, valid for
  10 minutes, single use, with a 30-second resend cooldown, 5 wrong attempts per
  code and 10 per email per day.
- **Security fixes:**
  - pending codes were publicly readable through the API
  - codes were stored and logged in plain text
  - `verifyemail` accepted a code sent to any mailbox
  - wrong-attempt counts were reset by requesting a new code
  - recipients' passwords were their email address
- **Account deletion** codes share the same rules and generator.

### 2026-11-06: BetterSign brand UI and Sign in with BetterSign

- The web app was restyled to the bettersign.ing brand. See [Brand UI](#brand-ui).
- "Sign in with BetterSign" through bs-id (OIDC + PKCE) replaced the push-to-phone
  login button. See [Sign in with BetterSign](#sign-in-with-bettersign).

### 2026-10-09: Material Design 3 web UI

- The web client's DaisyUI/Tailwind components were replaced with Material UI v7
  themed as Material Design 3 (`src/theme/md3Theme.js`, `ThemeModeProvider.jsx`).
  Presentation only; logic unchanged. Playbook: `apps/OpenSign/MD3_MIGRATION.md`.

### 2026-10-07: Cloudflare + Fly.io deployment

- Frontend on Cloudflare Workers Static Assets, Parse Server and MongoDB on Fly.io
  (`deploy/`, `apps/OpenSignServer/Dockerfile`, `fly.toml`). See
  [DEPLOYMENT.md](DEPLOYMENT.md).
- Public file uploads enabled (`FILE_UPLOAD_PUBLIC`) for OpenSign's token-less
  uploads; `Content-Length` exposed cross-origin.
- `patches/parse+8.6.0.patch` fixes parse-js 8.6.0's upload "body stream is locked"
  error (applied by `patch-package` on install).

### 2026-10-06: sign on phone

- "Sign on phone" for a signature field (`src/components/pdf/PhoneSign.jsx`) and the
  `bettersignlogin` cloud function, both through the bs-opensign signing Worker. The
  push-to-phone login button was later replaced by bs-id (2026-11-06);
  `bettersignlogin` stays for that Worker.

---

## Home page and sign-in

The home page (`apps/OpenSign/src/pages/Login.jsx`) has one way to sign in:
**Sign in with BetterSign**. Below it, a hint tells people who were asked to sign a
document to open the link in their email.

There is no email, password or code field on the home page.

### Sign in with BetterSign

Sign-in goes through **bs-id** (`https://id.bettersign.ing`), the BetterSign OIDC
provider. The user approves with the passkey on their phone (QR scan, or the same
device), so there is no password to steal.

- The browser runs an authorization code + PKCE flow
  (`apps/OpenSign/src/constant/bsid.js`). `startBsIdLogin()` keeps the state, nonce and
  PKCE verifier in `sessionStorage` and redirects to bs-id.
- bs-id returns to `/auth/bettersign/callback`. `Login.jsx` reads the result with
  `takeBsIdCallback()`, removes the code from the address bar, and calls the
  `bsidlogin` cloud function.
- `bsidlogin` (`apps/OpenSignServer/cloud/parsefunction/bsidlogin.js`) exchanges the
  code at bs-id `/token`, verifies the ES256 `id_token` against bs-id `/jwks` (`iss`,
  `aud`, `nonce`, `exp`, `iat`) and returns a session for the account that the token's
  `vlad` maps to.
- **Who may sign in:** a VLAD needs an active row in the `bs_Identity` class
  (master key only) pointing at an existing account. Admins manage these on the
  Users page (BetterSign identities); an unknown VLAD that signs in shows up there,
  turned off. Or [docs/BetterSignAPI.md §3](docs/BetterSignAPI.md#3-linking-a-vlad-to-an-account). Unknown VLADs
  are refused and logged as `{"event":"bsidlogin_denied","vlad":…}`.
- **Configuration:** `BS_ID_URL` and `BS_ID_CLIENT_ID` on the server;
  `REACT_APP_BS_ID_URL` and `REACT_APP_BS_ID_CLIENT_ID` at frontend build time.
  Defaults are `https://id.bettersign.ing` and `bs-opensign`.
- This replaced the earlier push-to-phone "Log in with BetterSign" button
  (`BetterSignLogin.jsx`, removed). The `bettersignlogin` cloud function stays for the
  BetterSign Worker, and `bsidlogin` reuses its `/loginAs` helper.

### What a VLAD signs to log in

**Any login where a VLAD signs something signs the canonical bs-message form**,
the same bytes bs-auth signs (BetterSignApps `crates/bs-message/src/message.rs`
`build_tbs`):

```
"bettersign-message-v2" ‖ sender_vlad ‖ Varbytes(sender_key_path)
‖ receiver_vlad ‖ Varbytes(content_type) ‖ Varbytes(body)
```

`sender_vlad` is the identity signing in, `sender_key_path` is `/keys/primary`,
`receiver_vlad` is the site's VLAD (`BS_API_RECEIVER_VLAD`, generated and stored
if unset), `content_type` says
what the body is (`application/vnd.bettersign.login+cbor` for sign-in) and `body`
is the sign-in statement (origin, `rp`, challenge, time). `Varbytes` is an unsigned
LEB128 length then the bytes. The signature covers these bytes directly.

The desktop API checks this today (`apps/OpenSignServer/cloud/customRoute/bsapi/statement.js`,
`inspectSignedMessage`); new VLAD sign-in paths, such as the extension sign-in in
[Follow-ups](#follow-ups), should reuse it rather than sign a statement or digest
directly. Website sign-in through bs-id is unaffected: bs-id checks the passkey and
OpenSign checks bs-id's `id_token`.

### Recipients: the emailed signing link

Only a signed-in BetterSign user can send a document. The people they send it to
(recipients) don't sign in on the home page. They open the signing link from their
email (`/login/<link>`, `GuestLogin.jsx`), which takes them straight to that document.

- The link carries the document and the recipient's email, so the recipient never
  types their email. The page shows it, locked.
- If the sender turned on the email-code check for the document (`IsEnableOTP`), the
  recipient must first enter the 6-digit code emailed to them. Without it, the link
  alone opens the document.
- The server only sends or accepts that code when the email is a signer of that
  document. See [One-time codes](#one-time-codes-otc).

### No username/password sign-in

Password sign-in is turned off everywhere, not just hidden:

- **Server:** a `Parse.Cloud.beforeLogin` hook (`apps/OpenSignServer/cloud/main.js`)
  rejects every password sign-in: Parse's `/login` REST endpoint and the `loginuser`
  cloud function. BetterSign and the recipient code still work, because they get
  their sessions from `/loginAs`, which doesn't run that hook. Sign-up
  (`usersignup`, `addadmin`) is also unaffected.
- **Why it matters:** when a contact or recipient gets an account, upstream OpenSign
  sets the password to the email address (`savecontact.js`, `editContact.js`,
  `ContactBookAftersave.js`, `linkContactToDoc.js`). With `/login` open, anyone who
  knew a recipient's email could sign in as them.
- **Frontend:** the email/password form, the Forgot Password and Change Password
  pages (`/forgetpassword`, `/changepassword`), the Change Password entries in the
  header menu and the profile page, and the admin "Reset password" action on the
  Users list are removed.
- Anything outside this app that signs in with a password through the API (scripts,
  a mobile app) stops working.

### Brand UI

The web app is restyled to match the bettersign.ing sites (BetterSignApps
`website/brand/brand.css`):

- Theme (`apps/OpenSign/src/theme/md3Theme.js`): the brand palette (ink, green, teal),
  a system font stack with heavy headings, pill gradient buttons, 16px soft cards and
  brand table headers. Dark mode uses the same ink palette. The `bs` tokens are
  exported for components.
- A dark ink top bar with the BetterSign wordmark and product pill (`BrandMark`), a
  light sidebar with green active pills, and a dark brand footer.
- The login page sits on the brand hero band (`BrandHero.jsx`), with the "Sign
  documents with an identity you hold." pitch beside the sign-in card.
- DaisyUI themes, global CSS, `theme-color` and the web manifest use the same brand
  palette.

---

## One-time codes (OTC)

Every emailed code follows the rules first built for account deletion. They live in
`apps/OpenSignServer/cloud/parsefunction/emailOtp.js`:

| Rule | Value |
|---|---|
| Length | 6 digits (`OTP_LENGTH`), previously 4 |
| Generator | `crypto.randomInt`, previously `Math.random()` |
| Expiry | 10 minutes (`OTP_EXPIRES_MIN`) |
| Resend cooldown | 30 seconds (`RESEND_COOLDOWN_SEC`) |
| Wrong attempts per code | 5, then a new code is needed (`MAX_ATTEMPTS`) |
| Wrong attempts per day | 10 per email in 24 hours, even across resends (`MAX_DAILY_FAILS`) |
| Use | Single use: the code is removed once verified |
| Storage | Only an HMAC-SHA256 of the code (keyed with the master key), never the code |
| Comparison | Constant time (`crypto.timingSafeEqual`) |

Where the codes are used:

| Flow | Who can get a code | Send | Verify |
|---|---|---|---|
| Recipient opening a document from the signing link (`GuestLogin.jsx`) | A signer of that document (`docId` required) | `SendOTPMailV1` | `AuthLoginAsMail` |
| Signed-in user verifying their email before signing (`IsEnableOTP`) | Only the user's own email | `SendOTPMailV1` | `verifyemail` |
| Account deletion (`customRoute/deleteAccount`) | The account's admin email | `POST /delete-account/:userId/otp` | `POST /delete-account/:userId` |

Codes are never a way to sign in from the home page. Without a signed-in user, the
server refuses to send or accept a code unless the email is a signer of the given
document (`assertDocRecipient`). This stops someone using the code flow to get into
a BetterSign user's account.

Why 6 digits and not 9: the recipient's email is already part of the code check (a
code only works for the email it was sent to), and the per-code and per-day caps limit
an attacker to 10 guesses a day out of 1,000,000. Moving to 9 digits only makes sense
if those caps are removed.

Other changes:

- **`defaultdata_Otp` is master-key only.** This class was created on the fly with
  public permissions, so anyone with the app ID could read pending codes. Migration
  `20261113000000-lock_defaultdata_otp.cjs` locks it down and removes the old
  plaintext codes. Each row now holds `Email`, `CodeHash`, `ExpiresAt`, `SentAt`,
  `Tries`, `FailsSince` and `DailyFails`.
- **`verifyemail` only verifies the signed-in user's own email.** It used to accept
  any email address as a parameter. A user could then verify their account with a code
  sent to a different mailbox.
- **The code is no longer written to the server log.**
- **Errors are real errors.** Wrong, expired or rate-limited codes return a
  `Parse.Error` with a readable message, and the UI shows it. Previously the functions
  returned strings such as `"Invalid Otp"`. If sending the email fails, the request
  now fails instead of storing a code nobody received.
- **The account deletion flow** shares the same constants and generator, and compares
  codes in constant time. It keeps its own storage on `contracts_Users`.
- **Frontend:** code inputs accept exactly 6 digits, with `inputmode="numeric"` and
  `autocomplete="one-time-code"` for autofill on phones.
  `runPublicCloudFn` (`apps/OpenSign/src/constant/Utils.js`) calls these functions
  without a session (the recipient page) and shows the server's message on failure.
  `handleSendOTP`, used by signed-in users, now sends the session so the server
  knows whose email to use. "Code sent" is only shown when sending succeeded.

---

## API changes

These matter to anything that calls the Parse API directly. The app itself is
already updated.

| Endpoint | Before | Now |
|---|---|---|
| `POST /login`, `loginuser` | Signed in with email and password | Always refused: "Password sign-in is disabled. Sign in with BetterSign." |
| `SendOTPMailV1` | Sent a 4-digit code to any email; returned `"Otp send"` | Without a session: needs `docId`, and `email` must be a signer of it. With a session: always sends to the signed-in user's email and ignores `email`. Returns `{ cooldownSec, expiresInMin }`. Errors during the cooldown. |
| `AuthLoginAsMail` | `{ email, otp }`; returned `"Invalid Otp"` or `"user not found!"` as results | Needs `{ email, otp, docId }`; `email` must be a signer of `docId`. Wrong, expired or locked codes return an error. |
| `verifyemail` | `{ email, otp }`; checked the code against `email` | `{ otp }`; the code is checked against the signed-in user's email. `email` is ignored. |
| `defaultdata_Otp` class | Readable and writable with the app ID | Master key only |

Added by this fork (none of these exist upstream):

| Endpoint or class | What it is |
|---|---|
| `/api/v1/*` (REST) | Desktop API; see [docs/BetterSignAPI.md](docs/BetterSignAPI.md) |
| `bsidlogin` | Sign in with BetterSign: exchanges a bs-id code for a session |
| `bettersignlogin` | Session for an identity verified by the BetterSign Worker |
| `bsidentitylist`, `bsidentitysave`, `bsidentitydelete` | Users page: manage VLAD links (admins) |
| `updateuserbyadmin` | Users page: edit a user's name, phone, role, teams (admins) |
| `bs_Identity`, `bs_ApiChallenge`, `bs_ApiToken`, `bs_ApiConfig` classes | Master key only. VLAD links, sign-in challenges, API tokens, generated settings |
| `contracts_Document` fields `VladSignatures`, `SignRevision`, `Seal`, `CertificateSeal` | Writable only with the master key |

---

## Deploying the sign-in lockdown (2026-11-13)

Later changes list their own deploy steps in their PRs and in the change log.


1. **Deploy the API** (`fly deploy` for `docsign-bettersign-api`, see
   [DEPLOYMENT.md](DEPLOYMENT.md)). Migrations run when the server starts, which
   applies `20261113000000-lock_defaultdata_otp.cjs`.
2. **Deploy the frontend.** Deploy it together with the API: the old home page signs
   in with a password, which the new API refuses.
3. **Codes requested before the deploy stop working.** Recipients just request a new
   one.
4. **Check after deploying:**
   - Sign in with BetterSign works.
   - A password sign-in is refused, for example:
     `curl -X POST <API>/login -H 'X-Parse-Application-Id: <appId>' -d '{"username":"<email>","password":"<email>"}'`
     should fail with "Password sign-in is disabled".
   - Reading the codes class with only the app ID is refused:
     `curl <API>/classes/defaultdata_Otp -H 'X-Parse-Application-Id: <appId>'`
   - A recipient can open a document that requires the email code, using the
     6-digit code from their email.
   - `fly logs` shows no `OTP sent <code>` lines.

---

## Testing the sign-in lockdown (2026-11-13)

The desktop API, sealing, VLAD links and user editing have automated tests:
`npm run test:bsapi` and `npm run test:bsapi:integration` in `apps/OpenSignServer`.


Done:

- The frontend production build passes.
- All changed server files pass a syntax check.
- The code rules were checked against a fake in-memory database:
  - 6 digits
  - only a hash stored
  - resend cooldown
  - lockout after 5 wrong attempts
  - daily cap across resends, which resets after 24 hours
  - single use
  - expiry
  - the recipient check: signer via `Placeholders` or `Signers`, case-insensitive;
    unknown documents and non-signers refused
- The new home page was checked in a browser (screenshot).
- The installed Parse Server source was checked: `beforeLogin` runs for password
  sign-in and third-party `authData` sign-in (not used here), but not for `/loginAs`
  or sign-up.

Not yet done; needs a running API and real email:

- A recipient opening a document end to end with the emailed code.
- Signed-in email verification before signing.
- The `beforeLogin` block against a live server.
- The migration against the real database.

---

## Changes from upstream OpenSign

This section lists every file this fork changes, so that merging a newer
upstream OpenSign shows where conflicts can happen and what has to survive them.
Keep it current: any PR that touches an upstream file adds or updates its row.

- **Fork point:** upstream commit `e5f2c5c0a`. Upstream remotes: `upstream`
  (OpenSignLabs/OpenSign) next to `origin` (Ixiom-Software/BetterOpenSign).
- **Upstream since then** (as of 2026-11-15): `upstream/main` is 26 commits
  ahead of the fork point, `upstream/staging` 20.
- **Regenerate the raw list:**

  ```sh
  git fetch upstream
  git diff --name-status $(git merge-base HEAD upstream/main) HEAD   # A added, M modified, D deleted
  git log --oneline --no-merges $(git merge-base HEAD upstream/main)..HEAD -- <file>   # why a file changed
  ```

### Upstream files we modified (conflict risk)

Server (`apps/OpenSignServer/`):

| File | What we changed | Since |
|---|---|---|
| `index.js` | Public file uploads (`FILE_UPLOAD_PUBLIC`), `Content-Length` exposed cross-origin | 2026-10-07 |
| `cloud/main.js` | Registers our cloud functions (`bettersignlogin`, `bsidlogin`, `bsidentity*`, `updateuserbyadmin`) and the `bs_Identity` save hook; `beforeLogin` hook blocking password sign-in | 2026-10-06 → 11-15 |
| `cloud/customRoute/customApp.js` | Mounts the desktop API router (`bsapi`) at `/api/v1` | 2026-11-14 |
| `cloud/parsefunction/pdf/PDF.js` | Append-only signing once a VLAD signed; signing commits as a compare-and-swap on `SignRevision`; the seal goes through `utils/seal.js` | 2026-11-14 → 11-15 |
| `cloud/parsefunction/pdf/Placeholder.js` | Signature placeholder keeps indirect AcroForm `/Fields` and `/SigFlags` (needed for incremental updates) | 2026-11-14 |
| `cloud/parsefunction/DocumentBeforesave.js` | `VladSignatures`, `SignRevision`, `Seal`, `CertificateSeal` writable only with the master key (creates checked with `has()`) | 2026-11-14 → 11-15 |
| `cloud/parsefunction/generateCertificatebydocId.js` | Certificate sealed through `utils/seal.js` | 2026-11-15 |
| `cloud/parsefunction/SendMailOTPv1.js`, `AuthLoginAsMail.js`, `VerifyEmail.js` | Rewritten on `emailOtp.js` (recipient-only, hashed 6-digit codes) | 2026-11-13 |
| `cloud/customRoute/deleteAccount/deleteUtils.js`, `deleteUser.js` | Share `emailOtp.js` constants; constant-time code comparison | 2026-11-13 |
| `package.json`, `package-lock.json` | `@cantoo/pdf-lib`; test scripts `test:bsapi`, `test:bsapi:integration` | 2026-11-14 |
| `.env.example` (repo root) | Seal settings (`SEAL_BACKEND`, `BS_SERVICE_IDENTITY_*`) | 2026-11-15 |

Frontend (`apps/OpenSign/`). Almost every file under `src/` was also restyled
by the Material Design 3 migration (2026-10-09, 129 files, presentation only:
DaisyUI/Tailwind markup replaced with MUI v7, logic untouched; rules in
`MD3_MIGRATION.md`). Expect markup conflicts in any upstream UI change; take
upstream's logic and keep our MUI markup. The files below also have behaviour
changes:

| File | What we changed | Since |
|---|---|---|
| `src/pages/Login.jsx` | BetterSign-only sign-in card (bs-id); password form, code form and "additional info" modal removed | 2026-10-06 → 11-13 |
| `src/pages/GuestLogin.jsx` | 6-digit code input; sends `docId`; shows server errors | 2026-11-13 |
| `src/pages/UserList.jsx` | Reset-password action removed; Edit user action; BetterSign identities section | 2026-11-13 → 11-15 |
| `src/json/ReportJson.js` | `usersActions`: reset password removed, Edit added | 2026-11-13 → 11-15 |
| `src/pages/UserProfile.jsx` | Change Password button removed; "code sent" only on success | 2026-11-13 |
| `src/pages/SignyourselfPdf.jsx`, `src/components/pdf/VerifyEmail.jsx` | 6-digit codes; "code sent" only on success | 2026-11-13 |
| `src/pages/PdfRequestFiles.jsx` | Append-only signing for documents a VLAD signed | 2026-11-14 |
| `src/components/pdf/WidgetsValueModal.jsx` | "Sign on phone" (PhoneSign) | 2026-10-06 |
| `src/constant/Utils.js` | `runPublicCloudFn`; `handleSendOTP` sends the session; keeps signature fields when flattening an append-only PDF | 2026-11-13 → 11-14 |
| `src/App.jsx` | `/auth/bettersign/callback` route; `/forgetpassword`, `/changepassword` removed | 2026-11-06 → 11-13 |
| `src/components/Header.jsx`, `Footer.jsx`, `FullScreenButton.jsx`, `ThemeToggle.jsx`, `sidebar/Menu.jsx`, `Sidebar.jsx`, `SubMenu.jsx`, `src/layout/HomeLayout.jsx` | BetterSign brand (ink top bar, wordmark, green pills, brand footer); Change Password menu item removed | 2026-11-06 → 11-13 |
| `src/index.css`, `src/styles/dark-theme-improvements.css`, `tailwind.config.js`, `index.html`, `public/manifest.json` | Brand colours and DaisyUI themes, theme-color | 2026-11-06 |
| `public/locales/en/translation.json` | `signer-link-hint`, `bs-identities.*`, edit-user strings (English only; other languages fall back) | 2026-11-13 → 11-15 |
| `package.json`, `package-lock.json` | MUI v7, `@cantoo/pdf-lib`, `patch-package` postinstall | 2026-10-07 → 11-14 |

Repo root: `README.md` (link to this file), `.gitignore`.

### Upstream files we deleted

`apps/OpenSign/src/pages/ForgetPassword.jsx`, `src/pages/ChangePassword.jsx`,
`src/primitives/PasswordResetModal.jsx` (no password sign-in). If upstream
changes them, drop the change; if upstream adds new imports of them, remove those.

### Files only this fork has (no conflicts expected)

- **Desktop API:** `apps/OpenSignServer/cloud/customRoute/bsapi/*`,
  `utils/bsIdentity.js`, `utils/appendOnlyPdf.js`, docs `docs/BetterSignAPI.md`.
- **Sealing:** `apps/OpenSignServer/utils/seal.js`, `docs/BsServiceIdentitySealing.md`.
- **Sign-in and admin cloud functions:** `cloud/parsefunction/bsidlogin.js`,
  `bettersignlogin.js`, `emailOtp.js`, `bsIdentityAdmin.js`, `updateUserByAdmin.js`.
- **Frontend:** `src/theme/md3Theme.js`, `src/theme/ThemeModeProvider.jsx`,
  `src/constant/bsid.js`, `src/components/BrandHero.jsx`, `BsIdentities.jsx`,
  `EditUser.jsx`, `pdf/PhoneSign.jsx`, `src/utils/appendOnlyPdf.js` (+ test),
  `src/assets/images/bettersign-icon.png`, `patches/parse+8.6.0.patch`,
  `MD3_MIGRATION.md`.
- **Tests and CI:** `apps/OpenSignServer/spec/bsapi/*`, `spec/bsapi-integration/*`,
  `spec/support/bsapi*.json`, `.github/workflows/bettersign-tests.yml`.
- **Deployment:** `deploy/*`, `apps/OpenSignServer/Dockerfile`,
  `apps/OpenSignServer/fly.toml`, `DEPLOYMENT.md`.
- **Database migrations** (`apps/OpenSignServer/databases/migrations/`, run in
  this order on startup; keep their timestamps after upstream's):
  `20261113000000-lock_defaultdata_otp`, `20261114120000-create_bettersign_api_classes`,
  `20261115120000-create_bs_apiconfig`, `20261115140000-move_bs_id_users_to_bs_identity`,
  `20261115150000-bs_identity_active_flag`.

### Upgrading to a newer upstream

1. Branch from `staging`, `git merge upstream/main` (merge, don't rebase: the
   fork's history is shared).
2. Resolve conflicts with the tables above: keep upstream's fixes, re-apply our
   behaviour. The riskiest files are `pdf/PDF.js` (signing and sealing),
   `cloud/main.js` (registrations and the `beforeLogin` block), `Login.jsx` and
   anything upstream adds that signs in with a password or sends one-time codes.
3. Check new upstream migrations don't undo ours (class permissions on
   `defaultdata_Otp`, `bs_*` classes, `contracts_Document` fields).
4. Check new upstream routes or cloud functions don't reopen password sign-in or
   send codes to arbitrary emails.
5. Run `npm run test:bsapi` and `npm run test:bsapi:integration`
   (`apps/OpenSignServer`), and the frontend `vite build` and `vitest run`.
6. Update this section: new fork point, and any rows that changed.

---

## Follow-ups

- **New team members can't sign in until they're linked.** Adding a user creates the
  account, but they can only sign in once an admin links their BetterSign VLAD on the
  Users page. Their first sign-in attempt puts the VLAD there, turned off.
- **Admins can't change a user's email.** It's also the username, and documents
  and contacts find people by it; changing it needs those updated together.
- **The Add User form still shows a generated password** (`AddUser.jsx`). It can no
  longer be used and could be removed. The same goes for the password on the
  first-run admin setup page (`AddAdmin.jsx`).
- **Upstream still gives contacts their email as a password.** It's harmless while
  the `beforeLogin` hook is in place. Setting a random password in those four places
  would keep it safe if the hook were ever removed.
- **The email-code check is optional per document** (`IsEnableOTP`). Without it, the
  signing link alone opens the document. Turning it on by default for documents sent
  from this fork would make every recipient confirm their email.
- **`resetpassword` and `loginuser`** are still registered on the server. They no
  longer do anything useful and could be removed.
- **The new `signer-link-hint` text is English only.** Other languages fall back to
  English.
- **No sign-in through the BetterSign browser extension yet.** Sign in with BetterSign
  works with or without the extension, but always through bs-id's passkey page (a QR
  scan on a computer). The extension's "approve on your phone, no QR" sign-in
  (BetterSignApps `docs/Technical/extension-login-design.md`) isn't enabled for this
  site. It needs:
  1. `extensionLogin: true` on the `bs-opensign` and `bs-opensign-dev` clients in
     bs-id (`apps/Experiments/bs-id/src/worker.js`), so bs-id offers "Remember this
     browser" and links the extension to docsign at the first passkey sign-in.
  2. A docsign sign-in step that asks the extension (`bs-login/request` page
     message) and falls back to the bs-id redirect.
  3. A cloud function that checks the phone's signed statement (origin, `rp`,
     single-use challenge, age) and the signature through the verifier's `/verify`,
     then maps the VLAD with `accountForVlad` (`bs_Identity`). oauthService does the same for outline.
     The statement should be signed in the canonical bs-message form
     ([What a VLAD signs to log in](#what-a-vlad-signs-to-log-in)), checked with
     `inspectSignedMessage`. The extension and oauthService sign the bare digest today,
     so they need the same change.
  
  The extension's password fill has nothing to fill here any more, because the site
  has no password form.
