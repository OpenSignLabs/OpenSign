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

