# Security Audit: Cryptographic Practices & PDF Signing

**Repository:** OpenSign (`/home/user/OpenSign`)
**Date:** 2026-02-09
**Auditor:** Claude Opus 4.6 (Automated Deep Audit)

---

## Table of Contents
1. [PDF Digital Signing](#part-1-pdf-digital-signing)
2. [Random Number Generation](#part-2-random-number-generation)
3. [Hashing & Encryption](#part-3-hashing--encryption)
4. [Token & Session Security](#part-4-token--session-security)
5. [TLS/Transport Security](#part-5-tlstransport-security)
6. [Frontend Crypto](#part-6-frontend-crypto)

---

*Findings are appended incrementally as discovered.*

---

## Part 1: PDF Digital Signing

### FINDING PDF-1: PFX Private Key Hardcoded in Repository (CRITICAL)

- **Severity:** CRITICAL
- **File:** `/home/user/OpenSign/.env.local_dev`, line 55
- **Also referenced in:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js` (lines 400-401), `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/generateCertificatebydocId.js` (line 53)
- **Code:**
  ```
  PFX_BASE64='MIIKCQIBAzCCCc8GCSqGSIb3DQEHAaCCCcAEggm8MIIJuDCCBG8GCSqGSIb3DQEH...'
  PASS_PHRASE=opensign
  ```
- **Impact:** The `.env.local_dev` file contains a full PFX/P12 certificate private key encoded in base64, with the passphrase `opensign` in plaintext. This file is committed to the repository. Anyone with access to the repo can extract the signing private key, forge digitally signed PDF documents, and impersonate the OpenSign service. The passphrase "opensign" is trivially guessable.
- **Recommendation:**
  1. Immediately revoke the exposed certificate and generate a new one.
  2. Never commit private key material to version control.
  3. Use a secrets management system (e.g., HashiCorp Vault, AWS Secrets Manager).
  4. Ensure `.env.local_dev` is in `.gitignore`.
  5. Use a strong, randomly generated passphrase for PFX files.

### FINDING PDF-2: Tenant PFX Passwords Stored in Database in Plaintext (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js`, lines 402-404
- **Code:**
  ```javascript
  if (_resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64) {
    pfxFile = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64;
    passphrase = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.password;
  }
  ```
- **Impact:** Tenants can supply custom PFX certificates. Both the PFX base64 content and its passphrase are stored in the `partners_Tenant` database record as a plaintext JSON object (`PfxFile.base64` and `PfxFile.password`). If the database is compromised, all tenant signing keys are exposed. The password field is not encrypted at rest.
- **Recommendation:** Encrypt PFX passphrases at rest using an application-level encryption key (envelope encryption). Better yet, store PFX files in a dedicated key management service.

### FINDING PDF-3: Math.random() Used for PFX Temp Filename (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js`, line 354
- **Code:**
  ```javascript
  const randomNumber = Math.floor(Math.random() * 5000);
  const pfxname = `keystore_${randomNumber}.pfx`;
  ```
- **Impact:** `Math.random()` generates only 5,000 possible filenames for the temporary PFX file (`keystore_0.pfx` through `keystore_4999.pfx`). This creates: (a) **Race condition risk**: Concurrent signing requests can collide on the same filename, causing one request to use another's certificate or overwriting it. (b) **Predictable path**: An attacker with local file access can predict exactly where the PFX file will be written. (c) **PFX written to disk unprotected**: The PFX is written to the current working directory (line 408: `fs.writeFileSync(pfxname, P12Buffer)`), not to a secure temporary directory.
- **Recommendation:** Use `crypto.randomUUID()` for temp filenames, use `os.tmpdir()` with `fs.mkdtemp()` for secure temp directories, and ensure proper file permissions (0600).

### FINDING PDF-4: No Certificate Validation on Signing (HIGH)

- **Severity:** HIGH
- **Files:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js` (lines 445, 279), `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/generateCertificatebydocId.js` (line 73)
- **Code:**
  ```javascript
  const p12Cert = new P12Signer(P12Buffer, { passphrase: passphrase || null });
  ```
- **Impact:** The code loads PFX certificates and uses them for signing without any validation:
  - No check that the certificate is not expired
  - No check of the certificate's trust chain
  - No check of certificate revocation (CRL/OCSP)
  - No check that the certificate has the correct key usage extensions (digital signature)
  - Tenant-supplied certificates are used blindly
  This means expired, revoked, or untrusted certificates can be used to sign documents.
- **Recommendation:** Before signing, validate: certificate expiry, key usage, trust chain, and optionally check revocation status.

### FINDING PDF-5: No Post-Signing Verification (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js`, lines 449-451
- **Code:**
  ```javascript
  const OBJ = new SignPdf();
  const signedDocs = await OBJ.sign(PdfBuffer, p12Cert);
  fs.writeFileSync(signedFilePath, signedDocs);
  ```
- **Impact:** After signing, the code saves the PDF and uploads it without verifying the signature is valid. A corrupted or incomplete signature would be distributed. The server-side code never verifies its own signatures.
- **Recommendation:** After signing, verify the embedded signature before saving/uploading the signed PDF.

### FINDING PDF-6: PFX File Not Securely Cleaned Up on All Error Paths (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js`, lines 508-517
- **Code:**
  ```javascript
  } catch (err) {
    console.log('Err in signpdf', err);
    const body = { DebugginLog: err?.message };
    try {
      await axios.put(`${docUrl}/${docId}`, body, { headers });
    } catch (err) { ... }
    unlinkFile(pfxname);
    throw err;
  }
  ```
- **Impact:** While the main catch block does call `unlinkFile(pfxname)`, if the process crashes or is killed between writing the PFX file (line 408) and the cleanup, the private key material persists on disk. There is no `finally` block to guarantee cleanup.
- **Recommendation:** Use a `try/finally` pattern to ensure PFX files are always cleaned up. Better yet, avoid writing PFX to disk entirely by using in-memory buffers only.

### FINDING PDF-7: Client-Side Signature Verification Lacks Trust Chain Validation (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSign/src/pages/VerifyDocument.jsx`, lines 502-512
- **Code:**
  ```javascript
  const notBefore = signerCertificate.notBefore.value;
  const notAfter = signerCertificate.notAfter.value;
  const currentDate = new Date();
  certValidity = `Valid from ${notBefore.toLocaleDateString()} to ${notAfter.toLocaleDateString()}`;
  if (currentDate < notBefore || currentDate > notAfter) {
    certValidity += ` (Expired or not yet valid)`;
    isValid = false;
  } else {
    certValidity += ` (Valid)`;
    isValid = true;
  }
  ```
- **Impact:** The `VerifyDocument` component uses `pkijs` to parse and display signature information, but it only checks certificate date validity. It does NOT:
  - Verify the certificate's trust chain against a trusted CA store
  - Verify the actual cryptographic signature over the document hash
  - Check certificate revocation
  - A self-signed or attacker-issued certificate with valid dates would show as "Valid"
  This gives users a false sense of security; the verification is cosmetic, not cryptographic.
- **Recommendation:** Implement full PKCS#7 signature verification including: (1) cryptographic verification of the signature over signed attributes, (2) hash comparison of the document content, (3) trust chain validation against known CAs.

---

## Part 2: Random Number Generation

### FINDING RNG-1: OTP Generation Uses Math.random() (CRITICAL)

- **Severity:** CRITICAL
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`, line 22
- **Code:**
  ```javascript
  let code = Math.floor(1000 + Math.random() * 9000);
  ```
- **Impact:** OTP codes for document signing authentication are generated using `Math.random()`, which is NOT cryptographically secure. The V8 engine uses xorshift128+ for `Math.random()` which can be predicted if an attacker observes several outputs. This OTP has only 4 digits (1000-9999), providing at most ~13 bits of entropy. Combined with predictable PRNG, this makes OTP brute-force or prediction attacks feasible. The OTP is also logged to console (line 41: `console.log('OTP sent', code)`).
- **Recommendation:** Use `crypto.randomInt(100000, 999999)` for 6-digit OTPs, or at minimum `crypto.randomInt(1000, 9999)`. Never log OTP values.

### FINDING RNG-2: Account Deletion OTP Uses Math.random() (CRITICAL)

- **Severity:** CRITICAL
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUtils.js`, line 16
- **Code:**
  ```javascript
  export function generateOtp(len = OTP_LENGTH) {
    const n = Math.floor(Math.random() * Math.pow(10, len));
    return String(n).padStart(len, '0');
  }
  ```
- **Impact:** Account deletion OTP (6 digits by default) uses `Math.random()`. Account deletion is a destructive, irreversible operation. A predicted OTP could allow an attacker to delete a victim's account.
- **Recommendation:** Use `crypto.randomInt(0, Math.pow(10, len))` instead.

### FINDING RNG-3: Password Generation Uses Math.random() (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSign/src/components/AddUser.jsx`, lines 16-26
- **Code:**
  ```javascript
  function generatePassword(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ```
- **Impact:** Generated passwords for new users use `Math.random()`. This reduces the effective entropy of generated passwords. Additionally, the character set lacks special characters.
- **Recommendation:** Use `crypto.getRandomValues()` (Web Crypto API) for client-side password generation.

### FINDING RNG-4: Password Reset Modal Uses Math.random() (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSign/src/primitives/PasswordResetModal.jsx`, lines 87, 90
- **Code:**
  ```javascript
  function pick(str) {
    return str[Math.floor(Math.random() * str.length)];
  }
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
  ```
- **Impact:** The password reset modal generates suggested passwords using `Math.random()` for both character selection and shuffle. The Fisher-Yates shuffle variant using `Math.random() - 0.5` with `Array.sort()` is also biased (not uniformly random).
- **Recommendation:** Use `crypto.getRandomValues()` for character selection and a proper Fisher-Yates shuffle with CSPRNG.

### FINDING RNG-5: Server-Side generateId() Uses Math.random() (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`, lines 176-184
- **Code:**
  ```javascript
  export function generateId(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ```
- **Impact:** This function is used to generate unique IDs for the file adapter. File IDs should be unpredictable to prevent unauthorized access. Note that a `randomId()` function using `crypto.getRandomValues()` already exists in the same file (lines 326-331) but is not used consistently.
- **Recommendation:** Replace `Math.random()` with the existing `randomId()` function or use `crypto.randomUUID()`.

### FINDING RNG-6: Temp File Collisions in Mail Handlers (MEDIUM)

- **Severity:** MEDIUM
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js`, line 40
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js`, line 171
- **Code:**
  ```javascript
  const randomNumber = Math.floor(Math.random() * 5000);
  const testPdf = `test_${randomNumber}.pdf`;
  ```
- **Impact:** Temp PDF filenames for email attachments use `Math.random() * 5000`, allowing only 5,000 possible filenames. Under concurrent load, filename collisions will occur, potentially causing one user to receive another user's document.
- **Recommendation:** Use `crypto.randomUUID()` for temp filenames and store in `os.tmpdir()`.

### FINDING RNG-7: Frontend generateId() Uses Math.random() (LOW)

- **Severity:** LOW
- **Files:**
  - `/home/user/OpenSign/apps/OpenSign/src/constant/Utils.js`, lines 130-140, 3410-3420
- **Impact:** Frontend ID generation uses `Math.random()`. These appear to be used for non-security purposes (UI element IDs, PDF naming), so this is lower severity. However, the pattern is inconsistent: a `randomId()` function using `crypto.getRandomValues()` exists at line 42-55 of the same file.
- **Recommendation:** Standardize on the CSPRNG-based `randomId()` function across the codebase.

### FINDING RNG-8: OTP Logged to Console (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`, line 41
- **Code:**
  ```javascript
  console.log('OTP sent', code);
  ```
- **Impact:** OTP values are logged in plaintext to the console/stdout. In production, these logs may be persisted to log aggregation services, viewable by operations staff, or captured by log monitoring tools. This completely undermines OTP security.
- **Recommendation:** Remove OTP logging entirely. Log only that an OTP was sent (without the value).

### FINDING RNG-9: OTP Stored as Plaintext Integer in Database (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`, lines 60-69
- **Code:**
  ```javascript
  updateOtp.set('OTP', code);  // code is a plain integer
  // ...
  newOtpQuery.set('OTP', code);
  ```
- **Impact:** OTPs are stored as plaintext integers in the `defaultdata_Otp` Parse class. Anyone with database access can read all active OTPs. OTPs should be stored hashed, similar to passwords.
- **Recommendation:** Store OTPs as SHA-256 hashes (with the email as salt). Compare by hashing the user-submitted OTP and comparing to the stored hash.

---

## Part 3: Hashing & Encryption

### FINDING HASH-01: HMAC-SHA256 Webhook Signature Without Timing-Safe Comparison (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`, lines 163-173
- **Code:**
  ```javascript
  export function signPayload(payload, secret) {
    if (payload && secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      return { 'x-webhook-signature': signature };
    } else {
      return {};
    }
  }
  ```
- **Impact:** The `signPayload()` function correctly uses HMAC-SHA256 to sign webhook payloads. However, this function only generates signatures -- there is no corresponding server-side verification function anywhere in the codebase. A search for `timingSafeEqual` returned zero results in the entire repository. If webhook recipients verify the signature using simple string comparison (`===`), this is vulnerable to timing attacks. More critically, there is no evidence that webhook signatures are verified on the receiving end at all -- the function only creates signatures for outbound webhooks, but no inbound webhook verification exists.
- **Recommendation:**
  1. Document that webhook consumers MUST use `crypto.timingSafeEqual()` for signature verification.
  2. If this project also receives webhooks, implement server-side verification using `crypto.timingSafeEqual()`.
  3. Consider adding a timestamp to the signed payload to prevent replay attacks.

### FINDING HASH-02: SHA-256 Document Hash Used Correctly for Integrity (INFO)

- **Severity:** INFO
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js`, lines 2, 33
- **Code:**
  ```javascript
  import { createHash } from 'node:crypto';
  // ...
  function generateDocumentHash(buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }
  ```
- **Impact:** SHA-256 is used appropriately for document integrity hashing. This is the correct algorithm for this purpose and is used to generate `DocumentHash` values stored on the completion certificate. No weakness identified in this particular usage.
- **Recommendation:** None -- this is a correct use of SHA-256 for integrity verification.

### FINDING HASH-03: No Password Hashing Library Used -- Relies Entirely on Parse Server (INFO)

- **Severity:** INFO
- **Files:** Entire codebase (search for `bcrypt`, `scrypt`, `argon2`, `pbkdf2`)
- **Impact:** The codebase does not directly import or use any password hashing libraries (bcrypt, scrypt, argon2, pbkdf2). This is because user password hashing is delegated to Parse Server, which uses bcrypt internally by default. While this is acceptable, it means the application has no explicit control over hashing parameters (e.g., bcrypt cost factor). The default Parse Server bcrypt cost factor is 10, which is considered the minimum acceptable.
- **Recommendation:** Consider configuring Parse Server's `passwordPolicy.maxPasswordAge` and verifying the bcrypt cost factor is at least 12 for modern security requirements.

### FINDING HASH-04: No Encryption At Rest for Sensitive Database Fields (MEDIUM)

- **Severity:** MEDIUM
- **Files:** Multiple files across `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/`
- **Impact:** A search for `createCipheriv`, `createDecipheriv`, `encrypt`, and `decrypt` reveals no application-level encryption. The codebase stores multiple sensitive fields in the database as plaintext:
  - PFX certificate passphrases (see PDF-2)
  - OTP codes (see RNG-9)
  - Webhook secrets
  - OAuth refresh tokens (in `sendMailGmailProvider.js`)

  There is no envelope encryption, no field-level encryption, and no use of any encryption library for data at rest. All protection depends entirely on database-level access controls.
- **Recommendation:** Implement application-level encryption for sensitive fields using AES-256-GCM with proper key management. At minimum, encrypt: PFX passphrases, OAuth refresh tokens, and webhook secrets.

### FINDING HASH-05: JWT File URL Signing Uses MASTER_KEY as Secret (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSignedUrl.js`, lines 106, 116, 128, 137, 156, 158
- **Code:**
  ```javascript
  export function getSignedLocalUrl(fileUrl, expirationTimeInSeconds) {
    const secretKey = process.env.MASTER_KEY;
    // ...
    const token = jwt.sign(payload, secretKey);
    return `${fileUrl}?token=${token}`;
  }

  export async function validateSignedLocalUrl(signedUrl) {
    // ...
    const secretKey = process.env.MASTER_KEY;
    const decoded = jwt.verify(token, secretKey);
  }
  ```
- **Impact:** The `MASTER_KEY` (Parse Server master key) is reused as the JWT signing secret for presigned file URLs. The MASTER_KEY is already a high-value secret that provides full administrative access to Parse Server. Reusing it for JWT signing means:
  1. Any JWT token leak exposes the master key's HMAC signature, potentially enabling offline attacks.
  2. If the JWT secret is compromised through timing attacks or other side channels, the entire Parse Server is compromised.
  3. The MASTER_KEY is also passed in command-line arguments during migration (line 246-247 of `index.js`), visible in process listings.
  4. The JWT uses the default HS256 algorithm, which is acceptable, but key reuse across different cryptographic contexts violates the principle of key separation.
- **Recommendation:** Use a separate, dedicated secret for JWT file URL signing. Generate it independently from MASTER_KEY.

### FINDING HASH-06: Master Key Exposed in Process Arguments (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/index.js`, lines 246-247
- **Code:**
  ```javascript
  const migrate = isWindows
    ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
    : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
  exec(migrate, ...);
  ```
- **Impact:** The MASTER_KEY is passed as a command-line environment variable to the `parse-dbtool migrate` child process. On Linux/macOS, this is passed as inline environment variables (which may appear in `/proc/*/environ`). On Windows, it uses `set` commands in a shell string. In both cases, any user on the system who can list processes or read `/proc` entries can see the MASTER_KEY value.
- **Recommendation:** Pass environment variables to child processes using the `env` option of `child_process.exec()` instead of embedding them in the command string.

### FINDING HASH-07: Master Key IP Allowlist Set to Accept All (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/index.js`, line 113
- **Code:**
  ```javascript
  masterKeyIps: ['0.0.0.0/0', '::/0'], // '::1'
  ```
- **Impact:** The `masterKeyIps` configuration allows Master Key usage from ANY IP address (`0.0.0.0/0` and `::/0`). The Master Key provides unrestricted administrative access to the Parse Server (bypassing all ACLs, CLPs, and authentication). Any client that knows the Master Key can perform any operation from any network location. The commented-out `'::1'` suggests localhost-only was considered but not implemented.
- **Recommendation:** Restrict `masterKeyIps` to localhost only (`['127.0.0.1', '::1']`) or to specific trusted server IPs. The Master Key should never be usable from external networks.

---

## Part 4: Token & Session Security

### FINDING TOKEN-01: `generate-api-key` Package Included but Never Used (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/package.json`, line 38
- **Code:**
  ```json
  "generate-api-key": "^1.0.2",
  ```
- **Impact:** The `generate-api-key` package is listed as a dependency in the OpenSignServer `package.json`, but a thorough search of all server-side source files reveals that it is never imported or used anywhere. The package remains installed, increasing the attack surface (supply chain risk) without providing any functionality. This also suggests that API token generation may have been planned but never implemented with this library, or that tokens are generated using a different (potentially weaker) method.
- **Recommendation:** Remove the unused dependency to reduce supply chain attack surface. If API key generation is needed, use a well-vetted approach such as `crypto.randomBytes(32).toString('hex')`.

### FINDING TOKEN-02: Session Tokens Stored in localStorage (HIGH)

- **Severity:** HIGH
- **Files:**
  - `/home/user/OpenSign/apps/OpenSign/src/pages/Login.jsx`, lines 60, 161
  - `/home/user/OpenSign/apps/OpenSign/src/pages/AddAdmin.jsx`, lines 177, 179
  - `/home/user/OpenSign/apps/OpenSign/src/pages/GuestLogin.jsx`, line 188
  - `/home/user/OpenSign/apps/OpenSign/src/pages/ChangePassword.jsx`, line 54
- **Code:**
  ```javascript
  localStorage.setItem("accesstoken", user.sessionToken);
  localStorage.setItem("UserInformation", JSON.stringify(user));
  ```
- **Impact:** Parse Server session tokens are stored in `localStorage` under the key `accesstoken`. The `localStorage` API is accessible to any JavaScript running on the same origin, making these tokens vulnerable to:
  1. **Cross-Site Scripting (XSS):** Any XSS vulnerability allows an attacker to steal the session token via `localStorage.getItem("accesstoken")` and hijack the user's session.
  2. **No expiration enforcement on the client:** `localStorage` data persists indefinitely until explicitly cleared, even after the browser is closed.
  3. **No `HttpOnly` protection:** Unlike cookies with the `HttpOnly` flag, `localStorage` cannot be made inaccessible to JavaScript.
  4. **User information exposure:** The full `UserInformation` JSON object (including email, name, and potentially role data) is also stored in `localStorage`.
  The session token is then read back and sent as `X-Parse-Session-Token` header in API requests, making it the sole authentication credential.
- **Recommendation:** Store session tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies instead of `localStorage`. If `localStorage` must be used for the Parse SDK, implement additional XSS protections (Content Security Policy, input sanitization) and ensure tokens have a short TTL.

### FINDING TOKEN-03: No Explicit Session Expiration Configuration (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/index.js`, lines 102-162
- **Impact:** The Parse Server configuration in `index.js` does not set `sessionLength`, `expireInactiveSessions`, or any session timeout parameters. Parse Server defaults apply:
  - Default session length: 1 year (31536000 seconds)
  - `expireInactiveSessions`: true by default, but with a 1-year window
  This means a stolen session token remains valid for up to 1 year unless the user explicitly logs out. Combined with TOKEN-02 (tokens in `localStorage`), this creates a very long window of opportunity for session hijacking.
- **Recommendation:** Configure `sessionLength` to a reasonable value (e.g., 86400 for 24 hours or less). Enable `expireInactiveSessions` with a short inactivity timeout (e.g., 30 minutes). Implement session rotation on sensitive operations.

### FINDING TOKEN-04: Session Token Passed in Custom HTTP Header Without CSRF Protection (MEDIUM)

- **Severity:** MEDIUM
- **Files:**
  - `/home/user/OpenSign/apps/OpenSign/src/pages/PdfRequestFiles.jsx`, lines 1142, 1234, 1452
  - `/home/user/OpenSign/apps/OpenSign/src/constant/Utils.js`, line 249
- **Code:**
  ```javascript
  headers: {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
    "X-Parse-Session-Token": localStorage.getItem("accesstoken")
  }
  ```
- **Impact:** The session token is transmitted via the `X-Parse-Session-Token` custom header. While custom headers provide inherent CSRF protection (browsers do not include custom headers in cross-origin requests without CORS preflight), the application uses `app.use(cors())` with no origin restrictions (see `/home/user/OpenSign/apps/OpenSignServer/index.js`, line 168), which means ANY origin can make authenticated requests if it knows the session token. The unrestricted CORS policy negates the CSRF protection that custom headers would normally provide.
- **Recommendation:** Configure CORS with a strict origin allowlist instead of the default permissive configuration. At minimum: `app.use(cors({ origin: [allowedDomain], credentials: true }))`.

### FINDING TOKEN-05: `signPayload` Webhook Function Defined but Never Called (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`, lines 163-173
- **Impact:** The `signPayload()` function (documented in HASH-01) for HMAC-SHA256 webhook signing is exported from `Utils.js` but is never imported or called anywhere in the codebase. This means webhook payloads are sent **without any signature at all**. The `Webhook` field exists in the `contracts_Users` schema (added in database migration `20240306123606`), but no code reads this field to send webhooks. This means the webhook feature is either incomplete or broken, and any webhook integration lacks authentication entirely.
- **Recommendation:** If webhooks are a feature, implement the full webhook sending flow with `signPayload()`. If webhooks are not needed, remove the dead code and the database field.

### FINDING TOKEN-06: SSO Auth Adapter Does Not Validate App ID (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/auth/authadapter.js`, lines 29-31
- **Code:**
  ```javascript
  validateAppId: () => {
    return Promise.resolve();
  },
  ```
- **Impact:** The SSO authentication adapter's `validateAppId()` method unconditionally resolves without performing any validation. While this is common in single-application deployments, it means any application ID will be accepted for SSO authentication. If the Parse Server were to serve multiple applications, this would allow cross-application authentication bypass.
- **Recommendation:** Implement proper app ID validation if multi-tenant SSO is planned. For single-application deployments, this is acceptable but should be documented.

---

## Part 5: TLS/Transport Security

### FINDING TLS-01: Caddy TLS Configuration Relies Entirely on Defaults (INFO)

- **Severity:** INFO
- **File:** `/home/user/OpenSign/Caddyfile`
- **Code:**
  ```
  {$HOST_URL} {
      reverse_proxy client:3000
      handle_path /api/* {
          reverse_proxy server:8080
              rewrite * {uri}
      }
  }
  ```
- **Impact:** The Caddyfile uses Caddy's automatic HTTPS with default TLS settings. Caddy's defaults are generally strong (TLS 1.2+, modern cipher suites, automatic certificate management via Let's Encrypt). However, the configuration:
  1. Does not explicitly set minimum TLS version (e.g., `tls { protocols tls1.2 tls1.3 }`)
  2. Does not configure HSTS (HTTP Strict Transport Security) headers
  3. Does not set cipher suite preferences
  4. Uses `{$HOST_URL}` environment variable, which defaults to `localhost:3001` in Docker Compose -- meaning in default deployment, Caddy serves on a non-standard port without a real hostname
  While Caddy's defaults are acceptable, explicit configuration provides defense-in-depth and makes the security posture auditable.
- **Recommendation:** Add explicit TLS configuration to the Caddyfile: minimum TLS 1.2, prefer TLS 1.3, add HSTS header (`Strict-Transport-Security: max-age=31536000; includeSubDomains`), and document the expected `HOST_URL` for production.

### FINDING TLS-02: Internal Server Communication Uses Plaintext HTTP (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`, line 10
- **Code:**
  ```javascript
  export const cloudServerUrl = 'http://localhost:8080/app';
  ```
- **Also used in:** `/home/user/OpenSign/apps/OpenSignServer/index.js` (line 114, `serverURL: cloudServerUrl`) and throughout the codebase for internal Parse Server API calls.
- **Impact:** All internal server-to-server communication (Parse Server API calls, cloud function invocations, migration commands) uses plaintext HTTP on `localhost:8080`. In the Docker Compose setup, `localhost` resolves correctly within the same container, but cross-container references use the Docker network name `server:8080`. While traffic within a Docker bridge network is not exposed to the host network, it is:
  1. Visible to any container on the same Docker bridge network (`app-network`)
  2. Not encrypted, so a compromised container could sniff traffic including session tokens and Master Keys
  3. The server port 8080 is also published to the host (`ports: "8080:8080"` in docker-compose.yml), meaning the Parse Server is directly accessible from the host without TLS
- **Recommendation:** Do not publish port 8080 to the host; use `expose: 8080` instead of `ports: "8080:8080"` so only containers on the Docker network can reach the server. Consider adding TLS for inter-container communication in high-security environments.

### FINDING TLS-03: MongoDB Exposed on Host Without Authentication (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/docker-compose.yml`, lines 18-26
- **Code:**
  ```yaml
  mongo:
    image: mongo:latest
    container_name: mongo-container
    volumes:
      - data-volume:/data/db
    ports:
      - "27018:27017"
    networks:
      - app-network
  ```
- **Impact:** The MongoDB instance is:
  1. Published to the host on port 27018 (`ports: "27018:27017"`), making it accessible from outside the container
  2. Not configured with authentication (no `--auth` flag, no `MONGO_INITDB_ROOT_USERNAME`/`MONGO_INITDB_ROOT_PASSWORD` environment variables)
  3. Connected via the database URI `mongodb://localhost:27017/dev` (from `config.databaseURI` default), which has no authentication credentials
  4. No TLS/SSL configured for MongoDB connections
  This means anyone with network access to the host on port 27018 can read and write all database data, including user credentials, session tokens, documents, PFX passphrases, and OTPs.
- **Recommendation:** Remove the published port (use `expose` instead of `ports`). Enable MongoDB authentication. Configure TLS for MongoDB connections. Use a strong, randomly generated password for the database.

### FINDING TLS-04: SSL Certificate Validation Disabled for PDF Downloads (HIGH)

- **Severity:** HIGH
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js`, line 60
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js`, line 66
- **Code:**
  ```javascript
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  axios.get(url, { responseType: 'stream', httpsAgent })
  ```
- **Impact:** When downloading PDFs for email attachments, SSL certificate validation is explicitly disabled via `rejectUnauthorized: false`. This is applied for any URL where `isSecure` is false (non-HTTPS or localhost URLs). This makes the download vulnerable to man-in-the-middle attacks where an attacker could:
  1. Intercept the PDF download and replace it with a malicious document
  2. Steal the contents of the PDF being sent
  3. Inject content into signed documents before they are emailed to recipients
  This is particularly dangerous because these are the final signed PDF documents being distributed to signers.
- **Recommendation:** Remove `rejectUnauthorized: false` entirely. If self-signed certificates are needed for development, make this configurable via an environment variable that defaults to `true` (validation enabled) and is never disabled in production.

### FINDING TLS-05: SMTP TLS Configuration Uses Inverted Logic (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`, line 159
- **Code:**
  ```javascript
  export const smtpsecure = process.env.SMTP_PORT && process.env.SMTP_PORT !== '465' ? false : true;
  ```
- **Also used in:** `/home/user/OpenSign/apps/OpenSignServer/index.js`, line 67: `secure: smtpsecure`
- **Impact:** The SMTP TLS configuration logic is confusing and potentially insecure:
  1. If `SMTP_PORT` is not set at all, `smtpsecure` is `true` (because the first condition fails)
  2. If `SMTP_PORT` is `465`, `smtpsecure` is `true` (implicit TLS -- correct)
  3. If `SMTP_PORT` is any other value (e.g., `587`), `smtpsecure` is `false`
  When `secure: false`, Nodemailer does not use TLS at all by default -- it connects in plaintext. For port 587 (STARTTLS), the correct approach is `secure: false` with `requireTLS: true` to upgrade the connection via STARTTLS. Without `requireTLS: true`, SMTP credentials and email content (including OTPs, document links, and signed PDFs) are sent in plaintext.
  The `.env.local_dev` file shows `SMTP_PORT=443`, which is a non-standard SMTP port and would set `smtpsecure` to `false`.
- **Recommendation:** Add explicit STARTTLS support: when `SMTP_PORT` is 587, set `secure: false` AND `requireTLS: true`. Add a `SMTP_SECURE` environment variable to give operators explicit control. Never send SMTP traffic in plaintext in production.

### FINDING TLS-06: Unrestricted CORS Configuration (MEDIUM)

- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/index.js`, line 168
- **Code:**
  ```javascript
  app.use(cors());
  ```
- **Impact:** The Express server uses `cors()` with no configuration, which means:
  1. `Access-Control-Allow-Origin: *` is set for all responses
  2. Any website on the internet can make cross-origin requests to the API
  3. Combined with session tokens stored in `localStorage` (TOKEN-02), any XSS vulnerability on any site visited by the user could make authenticated API requests
  4. This effectively disables the Same-Origin Policy protection for the entire API
- **Recommendation:** Configure CORS with explicit origin allowlist: `cors({ origin: ['https://your-app-domain.com'], credentials: true })`. In development, allow `localhost` origins explicitly.

---

## Part 6: Frontend Crypto

### FINDING FRONT-01: Client-Side Signature Verification Is Cosmetic, Not Cryptographic (HIGH)

- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSign/src/pages/VerifyDocument.jsx`, lines 380-555
- **Code:**
  ```javascript
  const signedData = new SignedData({ schema: cmsContentInfo.content });
  // ...
  const notBefore = signerCertificate.notBefore.value;
  const notAfter = signerCertificate.notAfter.value;
  const currentDate = new Date();
  if (currentDate < notBefore || currentDate > notAfter) {
    isValid = false;
  } else {
    isValid = true;
  }
  ```
- **Impact:** The `VerifyDocument` component uses `pkijs` to parse PKCS#7/CMS signature structures and display certificate information. However, the verification is purely cosmetic:
  1. **No cryptographic signature verification:** The code never calls `signedData.verify()` to actually verify the cryptographic signature over the document content. It only parses the ASN.1 structure and reads certificate fields.
  2. **No document hash verification:** The code does not compute the hash of the PDF content and compare it against the signed hash in the PKCS#7 structure. A modified document with the original signature attached would show as "valid."
  3. **No trust chain validation:** The code does not verify the certificate chain against any trusted CA store. A self-signed certificate with valid dates would show as "Valid."
  4. **No revocation checking:** No CRL or OCSP check is performed.
  5. **Only date-based validity:** The sole check is whether the current date falls within the certificate's `notBefore`/`notAfter` range.
  This gives users a false sense of security. A document with a forged or self-issued certificate and valid dates will display as having a valid signature. This is already documented in PDF-7 but deserves emphasis as a frontend-specific finding.
- **Recommendation:** Implement full signature verification using `pkijs`'s `SignedData.verify()` method with proper `CertificateChainValidationEngine`. At minimum, clearly label the current verification as "basic certificate parsing" rather than "signature verification" to avoid misleading users.

### FINDING FRONT-02: Extensive Sensitive Data Stored in localStorage (HIGH)

- **Severity:** HIGH
- **Files:** 54+ files across `/home/user/OpenSign/apps/OpenSign/src/`
- **Key localStorage entries:**
  ```
  accesstoken          - Parse session token (authentication credential)
  UserInformation      - Full user JSON object (email, name, profile data)
  Extand_Class         - Extended user class data (organization, role, tenant info)
  userEmail            - User's email address
  username             - User's display name
  TenantId             - Tenant identifier
  TenantName           - Tenant name
  _user_role           - User's role in the application
  parseAppId           - Parse Application ID
  baseUrl              - API base URL
  ```
- **Impact:** The application stores an extensive amount of sensitive data in `localStorage`:
  1. **Session token** (`accesstoken`): The primary authentication credential, accessible to any JavaScript on the page (see TOKEN-02).
  2. **Full user object** (`UserInformation`): Contains the complete Parse User object serialized as JSON, which may include session tokens, email, and other PII.
  3. **Extended user data** (`Extand_Class`): Organization membership, role, and tenant information -- useful for privilege escalation if stolen.
  4. **70+ reads** of `accesstoken` across 27 files, showing pervasive reliance on `localStorage` for authentication state.
  All of this data persists across browser sessions, survives tab closure, and is accessible to any script running on the same origin. An XSS vulnerability would expose all of this data.
- **Recommendation:** Minimize data stored in `localStorage`. Move session tokens to `HttpOnly` cookies. Store user profile data in memory (React state/context) rather than persistent storage. Implement Content Security Policy (CSP) headers to mitigate XSS risk.

### FINDING FRONT-03: `jwt-decode` Dependency Present but Unused (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSign/package.json`, line 21
- **Code:**
  ```json
  "jwt-decode": "^4.0.0",
  ```
- **Impact:** The `jwt-decode` package is listed as a frontend dependency but is never imported or used in any source file under `apps/OpenSign/src/`. This package decodes JWT tokens without verifying signatures. Its presence as an unused dependency:
  1. Increases the attack surface through supply chain risk
  2. May indicate that JWT decoding on the client was planned but not implemented
  3. If it were to be used for security decisions (e.g., checking token expiry) without server-side verification, it would be a vulnerability
- **Recommendation:** Remove the unused dependency. If JWT decoding is needed on the client, ensure it is used only for non-security purposes (e.g., displaying user info) and never for authorization decisions.

### FINDING FRONT-04: Web Crypto API Used Correctly for PDF Metadata Hashing (INFO)

- **Severity:** INFO
- **File:** `/home/user/OpenSign/apps/OpenSign/src/components/pdf/EditTemplate.jsx`, lines 101-116
- **Code:**
  ```javascript
  const getPdfMetadataHash = async (pdfBytes) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const metaString = pages
      .map((page, index) => {
        const { width, height } = page.getSize();
        return `${index + 1}:${Math.round(width)}x${Math.round(height)}`;
      })
      .join("|");
    const encoder = new TextEncoder();
    const data = encoder.encode(metaString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };
  ```
- **Impact:** The `EditTemplate` component correctly uses the Web Crypto API (`crypto.subtle.digest("SHA-256", ...)`) to compute a SHA-256 hash of PDF page metadata. This is used to validate that a replacement PDF has the same page structure as the original. This is a correct use of the Web Crypto API for integrity checking.
- **Recommendation:** None -- this is an appropriate use of client-side cryptography.

### FINDING FRONT-05: Frontend CSPRNG Implementation Has Modulo Bias (LOW)

- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSign/src/constant/Utils.js`, lines 42-55
- **Code:**
  ```javascript
  export const randomId = (digit = 8) => {
    const randomBytes = crypto.getRandomValues(new Uint32Array(1));
    const raw = randomBytes[0]; // 0 ... 4,294,967,295
    const min = Math.pow(10, digit - 1);
    const max = Math.pow(10, digit) - 1;
    const range = max - min + 1;
    return min + (raw % range);
  };
  ```
- **Impact:** The frontend `randomId()` function correctly uses `crypto.getRandomValues()` for cryptographic randomness, which is a significant improvement over `Math.random()`. However, it uses the modulo operator (`raw % range`) to reduce the random value to the desired range. This introduces a slight modulo bias because `2^32` (4,294,967,296) is not evenly divisible by typical range values (e.g., for 8 digits, range = 90,000,000). The bias is small (approximately `range / 2^32` per value, or about 2% for 8-digit numbers) and acceptable for non-security ID generation, but not for security-critical purposes.
  Note: The server-side `randomId()` in `/home/user/OpenSign/apps/OpenSignServer/Utils.js` (lines 326-331) has the same modulo bias issue but with `Uint16Array`, making the bias much worse (range/65536).
- **Recommendation:** For security-critical random number generation, use rejection sampling to eliminate modulo bias. For non-security IDs, the current implementation is acceptable.

### FINDING FRONT-06: Parse SDK Stores Session Token in localStorage Redundantly (INFO)

- **Severity:** INFO
- **Files:**
  - `/home/user/OpenSign/apps/OpenSign/src/pages/GuestLogin.jsx`, lines 190-196
  - `/home/user/OpenSign/apps/OpenSign/src/pages/Login.jsx`, line 160
- **Code:**
  ```javascript
  localStorage.setItem(
    `Parse/${parseId}/currentUser`,
    JSON.stringify(_user)
  );
  // ...
  await Parse.User.become(sessionToken);
  ```
- **Impact:** The Parse JavaScript SDK itself stores the current user (including session token) in `localStorage` under the key `Parse/{appId}/currentUser`. The application also redundantly stores the session token under `accesstoken` and the user object under `UserInformation`. This means the session token is stored in at least two (and sometimes three) different `localStorage` keys, increasing the attack surface. Even if the application were to switch to `HttpOnly` cookies for `accesstoken`, the Parse SDK's own `localStorage` storage would still expose the token.
- **Recommendation:** If migrating away from `localStorage` for session tokens, configure the Parse SDK to use a custom storage adapter that does not persist to `localStorage`. Alternatively, accept the Parse SDK's `localStorage` usage and remove the redundant `accesstoken` key.

---

## Full Audit Summary

### Findings by Severity

| Severity | Count | Finding IDs |
|----------|-------|-------------|
| **CRITICAL** | 3 | PDF-1, RNG-1, RNG-2 |
| **HIGH** | 14 | PDF-2, PDF-4, RNG-3, RNG-4, RNG-5, RNG-9, HASH-01, HASH-05, HASH-07, TOKEN-02, TLS-03, TLS-04, FRONT-01, FRONT-02 |
| **MEDIUM** | 12 | PDF-3, PDF-5, PDF-7, RNG-6, RNG-8, HASH-04, HASH-06, TOKEN-03, TOKEN-04, TLS-02, TLS-05, TLS-06 |
| **LOW** | 7 | PDF-6, RNG-7, TOKEN-01, TOKEN-05, TOKEN-06, FRONT-03, FRONT-05 |
| **INFO** | 5 | HASH-02, HASH-03, TLS-01, FRONT-04, FRONT-06 |
| **TOTAL** | **41** | |

### Findings by Section

| Section | Count | Critical | High | Medium | Low | Info |
|---------|-------|----------|------|--------|-----|------|
| Part 1: PDF Digital Signing | 7 | 1 | 2 | 3 | 1 | 0 |
| Part 2: Random Number Generation | 9 | 2 | 4 | 2 | 1 | 0 |
| Part 3: Hashing & Encryption | 7 | 0 | 3 | 2 | 0 | 2 |
| Part 4: Token & Session Security | 6 | 0 | 1 | 2 | 3 | 0 |
| Part 5: TLS/Transport Security | 6 | 0 | 2 | 3 | 0 | 1 |
| Part 6: Frontend Crypto | 6 | 0 | 2 | 0 | 2 | 2 |
| **Total** | **41** | **3** | **14** | **12** | **7** | **5** |

### Top Priority Remediation Items

The following issues should be addressed immediately due to their severity and exploitability:

1. **Revoke the hardcoded PFX certificate** (PDF-1): The signing private key and passphrase are committed to the repository. This certificate must be revoked and regenerated immediately.

2. **Replace all `Math.random()` usage in security contexts** (RNG-1, RNG-2, RNG-3, RNG-4, RNG-5): OTP generation, password generation, and server-side ID generation all use the cryptographically insecure `Math.random()`. Replace with `crypto.randomInt()` (server) or `crypto.getRandomValues()` (client).

3. **Secure session token storage** (TOKEN-02, FRONT-02): Session tokens stored in `localStorage` are vulnerable to XSS. Migrate to `HttpOnly` cookies or implement robust Content Security Policy.

4. **Secure the MongoDB instance** (TLS-03): The database is exposed on the host without authentication. Add authentication, remove the published port, and configure TLS.

5. **Fix SSL certificate validation** (TLS-04): Remove `rejectUnauthorized: false` from production code paths to prevent man-in-the-middle attacks on document downloads.

6. **Restrict Master Key access** (HASH-07): Change `masterKeyIps` from `0.0.0.0/0` to localhost only.

7. **Implement real signature verification** (FRONT-01, PDF-7): The client-side document verification only checks certificate dates, not the actual cryptographic signature. Users are given a false sense of security.

### Systemic Issues

Several patterns appear across multiple findings, suggesting systemic issues rather than isolated bugs:

- **Pervasive use of `Math.random()`**: Found in OTP generation, password generation, ID generation, and temp file naming across both frontend and backend. A project-wide policy to ban `Math.random()` for anything beyond purely cosmetic purposes is recommended.

- **No application-level encryption**: The codebase has zero uses of `createCipheriv`/`createDecipheriv`. All sensitive data (PFX passphrases, OAuth tokens, OTPs, webhook secrets) is stored in plaintext in the database.

- **Excessive reliance on `localStorage`**: 54+ files read from or write to `localStorage`, storing session tokens, user data, and application configuration. This creates a large XSS attack surface.

- **Dead cryptographic code**: Both `signPayload()` (webhook signing) and `generate-api-key` (API key generation) are defined/installed but never used, suggesting incomplete security features.

- **Key reuse**: The `MASTER_KEY` is used for Parse Server admin access, JWT file URL signing, and is exposed in process arguments during migration.

---

*End of cryptographic security audit. Report generated 2026-02-10.*

