# OpenSign Security Review

**Date:** 2026-02-09 (updated 2026-02-10)
**Scope:** Full codebase review of `apps/OpenSign/` (frontend) and `apps/OpenSignServer/` (backend)

---

## Executive Summary

This comprehensive security review identified **127 unique findings** across four deep-dive audits covering authentication, injection, secrets/API, and cryptography. The findings break down as:

| Severity | Count |
|----------|-------|
| **Critical** | 17 |
| **High** | 42 |
| **Medium** | 37 |
| **Low** | 19 |
| **Info** | 12 |

The most severe findings involve:
- **Unauthenticated admin creation** (`AddAdmin` cloud function callable without auth)
- **Arbitrary file read & exfiltration** via `certificatePath` parameter in email functions
- **SSRF** via user-controlled URL fetching in `sendMailv3` / `sendMailGmailProvider`
- **Hardcoded PFX signing certificate** committed to repository with trivial passphrase
- **No rate limiting anywhere** despite `rate-limiter-flexible` being a dependency
- **Insecure OTP** (4-digit, `Math.random()`, no expiry, no attempt limiting, logged to console)
- **18+ cloud functions lacking authentication**, enabling IDOR across contacts, documents, tenants
- **Password set to email** for auto-created contact accounts (trivial account takeover)
- **MongoDB exposed without authentication** in Docker Compose
- **Session tokens stored in localStorage** (vulnerable to XSS exfiltration)

## Detailed Findings

The full findings are organized in four detailed reports in the `.security-review/` directory:

| Report | Findings | Focus Areas |
|--------|----------|-------------|
| [`01-auth-findings.md`](.security-review/01-auth-findings.md) | 27 findings | Auth checks on all 38+ cloud functions, session management, admin escalation, password handling |
| [`02-injection-findings.md`](.security-review/02-injection-findings.md) | 26 findings | NoSQL injection, XSS, command injection, SSRF, path traversal, email injection, regex DoS |
| [`03-secrets-api-findings.md`](.security-review/03-secrets-api-findings.md) | 33 findings | Hardcoded secrets, master key exposure, file upload security, CORS, rate limiting, security headers |
| [`04-crypto-findings.md`](.security-review/04-crypto-findings.md) | 41 findings | PDF signing, RNG security, hashing, token/session management, TLS, frontend crypto |

---

## Top 21 Findings (Original Summary)

The following is the original summary of the highest-impact findings. For the complete set, see the detailed reports above.

---

## Critical Severity

### 1. Insecure OTP Generation Using `Math.random()`

**Files:**
- `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js:22`
- `apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUtils.js:16`

**Description:** OTP codes are generated using `Math.random()`, which is **not cryptographically secure**. `Math.random()` uses a PRNG (pseudo-random number generator) that can be predicted if the internal state is known or partially observed.

```js
// SendMailOTPv1.js:22
let code = Math.floor(1000 + Math.random() * 9000);

// deleteUtils.js:16
const n = Math.floor(Math.random() * Math.pow(10, len));
```

**Impact:** An attacker who can observe or predict the PRNG state could predict future OTP values, enabling account takeover.

**Recommendation:** Use `crypto.randomInt()` from Node.js `crypto` module:
```js
import crypto from 'node:crypto';
const code = crypto.randomInt(100000, 999999); // 6-digit OTP
```

---

### 2. OTP Is Only 4 Digits (Brute-Forceable)

**File:** `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js:22`

**Description:** The signing OTP generates values from 1000–9999 (only 4 digits / ~9000 possibilities). Without rate limiting on OTP verification, this is trivially brute-forceable.

```js
let code = Math.floor(1000 + Math.random() * 9000);
```

**Impact:** An attacker can brute-force the OTP in under 9000 attempts, bypassing guest signer verification and gaining access to documents.

**Recommendation:** Use at least 6-digit OTPs and implement strict rate limiting on `AuthLoginAsMail` (the OTP verification function).

---

### 3. OTP Logged to Console in Plaintext

**File:** `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js:41`

**Description:** The OTP value is logged in plaintext to the server console:

```js
console.log('OTP sent', code);
```

**Impact:** Anyone with access to server logs (ops team, log aggregation services, log file leaks) can read OTP values and bypass authentication.

**Recommendation:** Remove the OTP value from log output. Log only that an OTP was sent and to which (masked) email.

---

### 4. IDOR — `getContact` Has No Authentication Check

**File:** `apps/OpenSignServer/cloud/parsefunction/getContact.js:1-11`

**Description:** The `getContact` cloud function fetches any contact by ID using `useMasterKey: true` without verifying the caller's identity or ownership:

```js
export default async function getContact(request) {
  const contactId = request.params.contactId;
  const contactCls = new Parse.Query('contracts_Contactbook');
  const contactRes = await contactCls.get(contactId, { useMasterKey: true });
  return contactRes;
}
```

**Impact:** Any unauthenticated caller can retrieve any contact's data (name, email, phone) by guessing or enumerating object IDs. This is a classic Insecure Direct Object Reference (IDOR) vulnerability.

**Recommendation:** Validate `request.user`, verify the caller owns or has access to the requested contact, and add `requireUser: true` to the cloud function definition.

---

### 5. IDOR — `getUserId` Enables User Enumeration

**File:** `apps/OpenSignServer/cloud/parsefunction/getUserId.js:1-18`

**Description:** The `getUserId` function returns internal user IDs given a username or email, with no authentication required:

```js
async function getUserId(request) {
  const username = request.params.username;
  const email = request.params.email;
  const query = new Parse.Query(Parse.User);
  // ... returns { id: user.id }
}
```

**Impact:** An attacker can enumerate all user IDs by email address, enabling targeted attacks on other endpoints (e.g., delete account, document access).

**Recommendation:** Require authentication or remove this endpoint. User IDs should never be exposed to unauthenticated callers.

---

### 6. IDOR — `getDocument` Returns Documents Without Auth When OTP Is Disabled

**File:** `apps/OpenSignServer/cloud/parsefunction/getDocument.js:24-31`

**Description:** When `IsEnableOTP` is `false` (the default), any caller with a document ID can retrieve the full document including signer details, audit trail, and placeholders — no session token required:

```js
const res = await query.first({ useMasterKey: true });
if (res) {
  const IsEnableOTP = res?.get('IsEnableOTP') || false;
  if (!IsEnableOTP) {
    return document; // No auth check!
  }
}
```

**Impact:** Document contents (potentially containing sensitive legal/financial information) can be accessed by anyone who knows or guesses the document ID.

**Recommendation:** Always require authentication before returning document data.

---

### 7. IDOR — `getTenant` Exposes Tenant Data Without Auth

**File:** `apps/OpenSignServer/cloud/parsefunction/getTenant.js:50-59`

**Description:** Tenant information (organization details) is returned for any userId or contactId with no authentication:

```js
export default async function getTenant(request) {
  const userId = request.params.userId || '';
  const contactId = request.params.contactId || '';
  if (userId || contactId) {
    return await getTenantByUserId(userId, contactId);
  }
}
```

**Impact:** Internal organization/tenant data exposed to unauthenticated callers.

---

### 8. Path Traversal in `decryptpdf` File Upload

**File:** `apps/OpenSignServer/cloud/customRoute/decryptpdf.js:9-12`

**Description:** The `decryptpdf` endpoint uses `file.originalname` directly as the filename on disk, with no sanitization and no file type or size validation:

```js
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'exports'); },
  filename(req, file, cb) { cb(null, file.originalname); }, // Unsanitized!
});
export const upload = multer({ storage }); // No fileFilter, no size limit
```

**Impact:** An attacker can craft a filename like `../../index.js` to write arbitrary files to the server filesystem, potentially achieving remote code execution. Additionally, there are no file type restrictions, so any file type can be uploaded. No file size limit means the server is vulnerable to disk exhaustion.

**Recommendation:**
- Sanitize filenames (use the existing `sanitizeFileName()` from `Utils.js`)
- Add a `fileFilter` to restrict to PDF files only
- Add a `limits.fileSize` configuration
- Use random filenames instead of user-supplied names

---

## High Severity

### 9. No `requireUser` on Any Cloud Function

**File:** `apps/OpenSignServer/cloud/main.js:85-138`

**Description:** All 38+ cloud functions are registered with `Parse.Cloud.define()` without the `requireUser: true` option. This means Parse Server does not enforce authentication at the framework level — each function must implement its own auth check, and many don't.

Functions confirmed to **lack authentication checks**:
- `getContact`, `getUserId`, `getTenant`, `getDocument` (when OTP disabled)
- `SendOTPMailV1`, `getlogobydomain`, `newsletter`
- `getsigners`, `gettenant`, `verifyemail`

**Impact:** Unauthenticated access to sensitive operations.

**Recommendation:** Add `{ requireUser: true }` to all cloud function definitions that should require authentication, e.g.:
```js
Parse.Cloud.define('getContact', getContact, { requireUser: true });
```

---

### 10. CORS Allows All Origins

**Files:**
- `apps/OpenSignServer/index.js:168` — `app.use(cors());`
- `apps/OpenSignServer/cloud/customRoute/customApp.js:14` — `app.use(cors());`

**Description:** CORS is configured with no restrictions, allowing any website to make authenticated cross-origin requests to the API.

**Impact:** Enables cross-site request forgery from any malicious website. An attacker-controlled site can make API requests with the victim's session cookies/tokens.

**Recommendation:** Configure CORS to only allow your application's origin:
```js
app.use(cors({ origin: process.env.PUBLIC_URL }));
```

---

### 11. Master Key Accessible From Any IP

**File:** `apps/OpenSignServer/index.js:113`

```js
masterKeyIps: ['0.0.0.0/0', '::/0'],
```

**Description:** Parse Server's `masterKeyIps` allows master key usage from any IP address. The master key bypasses all ACLs and CLPs.

**Impact:** If the master key is leaked (e.g., via logs, error messages, or frontend exposure), it can be used from any location.

**Recommendation:** Restrict to localhost and known backend IPs:
```js
masterKeyIps: ['127.0.0.1', '::1'],
```

---

### 12. `Math.random()` Used for Security-Sensitive IDs

**Files:**
- `apps/OpenSignServer/Utils.js:181` — `generateId()` for file adapter IDs
- `apps/OpenSignServer/cloud/customRoute/docxtopdf.js:110` — PDF filename generation
- `apps/OpenSignServer/cloud/parsefunction/saveAsTemplate.js:1` — Template random IDs

**Description:** `Math.random()` is used to generate IDs and filenames that could be security-relevant (file paths, resource identifiers). These are predictable.

**Impact:** Predictable filenames could enable unauthorized file access. Predictable IDs could enable enumeration attacks.

**Recommendation:** Use `crypto.randomBytes()` or `crypto.randomUUID()` for all security-relevant identifiers.

---

### 13. OTP Verification Has No Rate Limiting

**File:** `apps/OpenSignServer/cloud/parsefunction/AuthLoginAsMail.js:23`

**Description:** The `AuthLoginAsMail` function verifies OTPs with no rate limiting or lockout. Combined with the 4-digit OTP (issue #2), this makes brute-forcing trivial.

```js
if (resOtp === otp) {
  var result = await getToken(request);
  // ... grants session token
}
```

The OTP in `defaultdata_Otp` has no expiration time — it remains valid until a new OTP is sent.

**Impact:** An attacker can try all ~9000 possible OTP values with no penalty, gaining access to any user's account.

**Recommendation:** Implement rate limiting (max 5 attempts), OTP expiration (5-10 minutes), and lockout after failed attempts.

---

### 14. No Password Complexity Enforcement

**File:** `apps/OpenSignServer/cloud/parsefunction/resetPassword.js:54`

**Description:** The `resetPassword` function sets passwords with no validation of complexity:

```js
user.set('password', newPassword);
await user.save(null, { useMasterKey: true });
```

**Impact:** Users/admins can set trivially weak passwords (e.g., "1", "password").

**Recommendation:** Enforce minimum password requirements (length, complexity) at the server level.

---

### 15. Class Name Injection via User-Controlled `role` Parameter

**File:** `apps/OpenSignServer/cloud/parsefunction/usersignup.js:49-51`

**Description:** The user-supplied `role` value is used to dynamically construct Parse class names:

```js
const extClass = userDetails.role.split('_')[0];
const extQuery = new Parse.Query(extClass + '_Users');
```

**Impact:** An attacker can craft a `role` value to query or create objects in arbitrary Parse classes, potentially escalating privileges or accessing/modifying data in unintended classes.

**Recommendation:** Validate `role` against an allowlist of expected values before using it in class name construction.

---

## Medium Severity

### 16. `exec()` With Master Key in Shell Command

**File:** `apps/OpenSignServer/index.js:246-248`

**Description:** The master key is passed directly in a shell command string:

```js
const migrate = `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
exec(migrate, ...);
```

**Impact:** The master key appears in the process list (`ps aux`) and may be captured by system monitoring tools. If any of the interpolated values contain shell metacharacters, this could lead to command injection.

**Recommendation:** Use `execFile()` with an explicit environment object instead:
```js
execFile('npx', ['parse-dbtool', 'migrate'], {
  env: { ...process.env, APPLICATION_ID: serverAppId, SERVER_URL: cloudServerUrl, MASTER_KEY: process.env.MASTER_KEY }
}, callback);
```

---

### 17. No Authentication on Delete Account GET Endpoint

**File:** `apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserGet.js:4-143`

**Description:** The `GET /delete-account/:userId` endpoint renders an HTML page with OTP form for any userId without verifying the requester's identity. While the actual deletion requires OTP verification, the endpoint confirms whether a userId exists and provides an attack surface for social engineering.

**Impact:** User existence enumeration. The OTP-sending mechanism can be triggered by anyone who knows a userId.

---

### 18. 100MB Request Body Limit

**Files:**
- `apps/OpenSignServer/index.js:169-170`
- `apps/OpenSignServer/cloud/customRoute/customApp.js:15-16`

```js
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
```

**Description:** The server accepts request bodies up to 100MB. This is excessively large for JSON API payloads.

**Impact:** Memory exhaustion / denial of service. An attacker can send many large requests to consume server memory.

**Recommendation:** Reduce to a reasonable limit (e.g., 10MB) for JSON endpoints. Use a larger limit only on specific file upload routes.

---

### 19. Verbose Error Messages Expose Internal Details

**Files (examples):**
- `apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUser.js:94` — `'Failed during contracts_Template cleanup:' + err?.message`
- `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js:79` — `return err;` (returns raw error object)

**Description:** Internal error details (class names, query structure, stack traces) are returned to API callers.

**Impact:** Helps attackers understand internal architecture and craft targeted attacks.

**Recommendation:** Return generic error messages to clients. Log detailed errors server-side only.

---

### 20. OTP Stored in Plaintext in Database

**Files:**
- `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js:60` — `updateOtp.set('OTP', code);`
- `apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserOtp.js:34` — `extUser.set('DeleteOTP', otp);`

**Description:** OTP values are stored as plaintext integers/strings in the database.

**Impact:** Database access (via SQL injection, backup leak, or admin access) reveals all active OTPs.

**Recommendation:** Store OTPs as hashed values (bcrypt or SHA-256 with salt).

---

### 21. `SendOTPMailV1` Has No Rate Limiting

**File:** `apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`

**Description:** The OTP sending cloud function has no rate limiting. An attacker can call it repeatedly to:
1. Flood a victim's email inbox
2. Exhaust the email sending quota (Mailgun/SMTP)
3. Generate new OTPs continuously to keep the attack window open

**Impact:** Email flooding, resource exhaustion, and amplified brute-force window.

**Recommendation:** Implement rate limiting per email address (e.g., max 3 OTPs per 10 minutes).

---

## Summary Table

| # | Severity | Issue | File(s) |
|---|----------|-------|---------|
| 1 | **Critical** | Insecure OTP generation (`Math.random()`) | `SendMailOTPv1.js:22`, `deleteUtils.js:16` |
| 2 | **Critical** | 4-digit OTP (brute-forceable) | `SendMailOTPv1.js:22` |
| 3 | **Critical** | OTP logged to console | `SendMailOTPv1.js:41` |
| 4 | **Critical** | IDOR: `getContact` — no auth | `getContact.js:1-11` |
| 5 | **Critical** | IDOR: `getUserId` — user enumeration | `getUserId.js:1-18` |
| 6 | **Critical** | IDOR: `getDocument` — no auth when OTP disabled | `getDocument.js:24-31` |
| 7 | **Critical** | IDOR: `getTenant` — no auth | `getTenant.js:50-59` |
| 8 | **Critical** | Path traversal in `decryptpdf` upload | `decryptpdf.js:9-12` |
| 9 | **High** | No `requireUser` on cloud functions | `main.js:85-138` |
| 10 | **High** | CORS allows all origins | `index.js:168`, `customApp.js:14` |
| 11 | **High** | Master key IPs unrestricted | `index.js:113` |
| 12 | **High** | `Math.random()` for security IDs | `Utils.js:181`, `docxtopdf.js:110` |
| 13 | **High** | OTP verification has no rate limit or expiry | `AuthLoginAsMail.js:23` |
| 14 | **High** | No password complexity enforcement | `resetPassword.js:54` |
| 15 | **High** | Class name injection via `role` parameter | `usersignup.js:49-51` |
| 16 | **Medium** | `exec()` with master key in shell | `index.js:246-248` |
| 17 | **Medium** | Unauthenticated delete account page | `deleteUserGet.js:4-143` |
| 18 | **Medium** | 100MB JSON body limit | `index.js:169-170` |
| 19 | **Medium** | Verbose error messages | Multiple files |
| 20 | **Medium** | OTP stored in plaintext in DB | `SendMailOTPv1.js:60` |
| 21 | **Medium** | No rate limit on OTP sending | `SendMailOTPv1.js` |

---

## Prioritized Remediation Plan

### Emergency (Immediate)
1. **Revoke the hardcoded PFX certificate** in `.env.local_dev` and rotate it — the private key and passphrase ("opensign") are in version control
2. **Remove `certificatePath` parameter** from `sendMailv3`/`sendMailGmailProvider` — enables arbitrary file read + exfiltration via email
3. **Add auth to `AddAdmin`** — currently any unauthenticated user can create an admin account
4. **Add auth to `sendmailv3`** — unauthenticated email relay with SSRF capability
5. **Add auth to `linkContactToDoc`** — unauthenticated document/user modification with `password = email`

### Immediate (Week 1)
6. Replace all `Math.random()` with `crypto.randomInt()` for OTPs and security-sensitive IDs
7. Increase OTP to 6 digits minimum
8. Remove OTP from console logs
9. Add `requireUser: true` to all cloud functions that need authentication (18+ functions affected)
10. Sanitize filename and add file validation in `decryptpdf`
11. Add MongoDB authentication in Docker Compose
12. Restrict `masterKeyIps` to `['127.0.0.1', '::1']`
13. Remove `UpdateExistUserAsAdmin` master key client parameter pattern

### Short-Term (Weeks 2-3)
14. Implement rate limiting using already-installed `rate-limiter-flexible` (login, OTP, signup, password reset)
15. Add OTP expiration (5-10 minutes) and attempt limiting to `AuthLoginAsMail`
16. Restrict CORS to application origin
17. Validate `role` parameter against allowlist in `usersignup`
18. Add password complexity requirements
19. Stop setting `password = email` for auto-created contacts (use random passwords)
20. Implement SSRF protection: URL allowlist for PDF fetching, block private IP ranges
21. Add `helmet.js` for security headers (HSTS, CSP, X-Frame-Options, etc.)
22. Sanitize Quill HTML editor output with DOMPurify before storing/sending
23. Use separate JWT signing secret instead of reusing MASTER_KEY

### Medium-Term (Month 1-2)
24. Hash OTPs before storing in database
25. Add ownership verification to all cloud functions (not just auth checks)
26. Implement application-level encryption for PFX passphrases, OAuth tokens, webhook secrets
27. Replace `exec()` with `execFile()` and environment variables
28. Reduce JSON body size limits on non-upload routes
29. Sanitize all error messages returned to clients
30. Implement real cryptographic signature verification in `VerifyDocument.jsx` (currently cosmetic)
31. Add `beforeSaveFile` trigger for server-side file type validation
32. Move session tokens from `localStorage` to `httpOnly` cookies or secure alternatives
33. HTML-encode all user data in email templates
34. Add `.env.local_dev` to `.gitignore` and remove from tracking
