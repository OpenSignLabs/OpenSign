# BetterSign Updates

Changes this fork (Open BetterSign) makes on top of upstream OpenSign. Hosting and
operations are covered in [DEPLOYMENT.md](DEPLOYMENT.md).

- [Change log](#change-log)
- [Home page and sign-in](#home-page-and-sign-in)
  - [Sign in with BetterSign](#sign-in-with-bettersign)
  - [Recipients: the emailed signing link](#recipients-the-emailed-signing-link)
  - [No username/password sign-in](#no-usernamepassword-sign-in)
  - [Brand UI](#brand-ui)
- [One-time codes (OTC)](#one-time-codes-otc)
- [API changes](#api-changes)
- [Deploying these changes](#deploying-these-changes)
- [Testing](#testing)
- [Files changed](#files-changed)
- [Follow-ups](#follow-ups)

---

## Change log

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
- **Who may sign in:** `BS_ID_USERS` (`apps/OpenSignServer/fly.toml`) maps
  `{ "<vladHex>": "<account email>" }`. The account must already exist. Unknown VLADs
  are refused and logged as `{"event":"bsidlogin_denied","vlad":…}`.
- **Configuration:** `BS_ID_URL` and `BS_ID_CLIENT_ID` on the server;
  `REACT_APP_BS_ID_URL` and `REACT_APP_BS_ID_CLIENT_ID` at frontend build time.
  Defaults are `https://id.bettersign.ing` and `bs-opensign`.
- This replaced the earlier push-to-phone "Log in with BetterSign" button
  (`BetterSignLogin.jsx`, removed). The `bettersignlogin` cloud function stays for the
  BetterSign Worker, and `bsidlogin` reuses its `/loginAs` helper.

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

---

## Deploying these changes

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

## Testing

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

## Files changed

Server (`apps/OpenSignServer/`):

| File | Change |
|---|---|
| `cloud/parsefunction/emailOtp.js` | New. Shared code rules: generate, hash, send, verify, recipient check |
| `cloud/parsefunction/SendMailOTPv1.js` | Uses `emailOtp.js`; recipient or own-email rule |
| `cloud/parsefunction/AuthLoginAsMail.js` | Uses `emailOtp.js`; requires `docId`; reuses `sessionViaLoginAs` |
| `cloud/parsefunction/VerifyEmail.js` | Uses `emailOtp.js`; checks the signed-in user's own email |
| `cloud/customRoute/deleteAccount/deleteUtils.js` | Shares the constants and generator from `emailOtp.js` |
| `cloud/customRoute/deleteAccount/deleteUser.js` | Constant-time code comparison |
| `cloud/main.js` | `beforeLogin` hook blocking password sign-in |
| `databases/migrations/20261113000000-lock_defaultdata_otp.cjs` | New. Locks `defaultdata_Otp`, removes plaintext codes |

Frontend (`apps/OpenSign/`):

| File | Change |
|---|---|
| `src/pages/Login.jsx` | BetterSign-only sign-in card; password form, code form and the unreachable "additional info" modal removed |
| `src/pages/GuestLogin.jsx` | 6-digit code input; sends `docId`; shows server errors |
| `src/components/pdf/VerifyEmail.jsx` | 6-digit code input |
| `src/constant/Utils.js` | `runPublicCloudFn`; `handleSendOTP` sends the session and reports success |
| `src/pages/SignyourselfPdf.jsx`, `src/pages/UserProfile.jsx` | "Code sent" only on success; Change Password button removed from the profile |
| `src/App.jsx` | `/forgetpassword` and `/changepassword` routes removed |
| `src/components/Header.jsx` | Change Password menu item removed |
| `src/pages/UserList.jsx`, `src/json/ReportJson.js` | Admin "Reset password" action removed |
| `src/pages/ForgetPassword.jsx`, `src/pages/ChangePassword.jsx`, `src/primitives/PasswordResetModal.jsx` | Deleted |
| `public/locales/en/translation.json` | New `signer-link-hint` text |

Docs: `BetterSignUpdates.md` (this file) and a link from `README.md`.

---

## Follow-ups

- **New team members can't sign in until they're mapped.** Adding a user creates the
  account, but they can only sign in once their BetterSign VLAD is added to
  `BS_ID_USERS` and the API is redeployed.
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
     then maps the VLAD with `BS_ID_USERS`. oauthService does the same for outline.
  
  The extension's password fill has nothing to fill here any more, because the site
  has no password form.
