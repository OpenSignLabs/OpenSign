# Security Audit: Secrets Handling, File Upload Security, and API Security

**Repository:** /home/user/OpenSign
**Date:** 2026-02-09
**Auditor:** Claude Opus 4.6

---

## Part 1: Secrets & Credentials

### Finding S-01: Hardcoded Master Key in Committed Environment Files
**Severity:** CRITICAL
**Files:**
- `/home/user/OpenSign/.env.example` (line 20)
- `/home/user/OpenSign/.env.local_dev` (line 19)

**Code:**
```
MASTER_KEY=XnAadwKxxByMr
```

**Impact:** The master key `XnAadwKxxByMr` is committed to version control in both `.env.example` and `.env.local_dev`. The `.gitignore` only ignores `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, and `.env.production.local`, but NOT `.env.example` or `.env.local_dev`. If any production or staging deployment uses this default key, an attacker can gain full Parse Server master key access, bypassing all ACLs and CLPs.

**Recommendation:** Remove the actual key value from `.env.example`, replacing with a placeholder like `MASTER_KEY=your-random-master-key-here`. Add `.env.local_dev` to `.gitignore`. Ensure deployments generate unique master keys.

---

### Finding S-02: PFX Certificate and Passphrase Committed to Repository
**Severity:** CRITICAL
**Files:**
- `/home/user/OpenSign/.env.local_dev` (lines 55-108, 111)

**Code:**
```
PFX_BASE64='MIIKCQIBAzCCCc8GCSqGSIb3DQEHAaCCCcAEggm8MIIJuDCCBG8GCSqGSIb3DQEH...'
PASS_PHRASE=opensign
```

**Impact:** A full Base64-encoded PFX/P12 certificate along with its passphrase (`opensign`) is committed to the repository. This certificate is used for document signing (see `generateCertificatebydocId.js` line 53 and `PDF.js` line 400). Anyone with access to the repository can extract the private key and forge document signatures, completely undermining document authenticity.

**Recommendation:** Remove the certificate and passphrase from committed files immediately. Store them only in secure environment variables or a secrets manager. Rotate the compromised certificate.

---

### Finding S-03: `.env.local_dev` Not in `.gitignore`
**Severity:** HIGH
**File:** `/home/user/OpenSign/.gitignore`

**Impact:** The `.gitignore` does not include `.env.local_dev`, meaning this file with secrets (master key, SMTP password, PFX certificate) is tracked by git and visible to all repository contributors.

**Recommendation:** Add `.env.local_dev` to `.gitignore` and remove it from tracking with `git rm --cached .env.local_dev`.

---

### Finding S-04: SMTP Password in Committed File
**Severity:** HIGH
**File:** `/home/user/OpenSign/.env.local_dev` (line 51)

**Code:**
```
SMTP_PASS=password   # if your password includes spaces then write password in single quotes
```

**Impact:** While this is a placeholder value, the file structure encourages developers to put real credentials directly in this committed file.

**Recommendation:** Remove credential values from committed files. Use `.env.local` (which is gitignored) for actual credentials.

---

### Finding S-05: Master Key Passed via Command-Line in Process Spawn (Visible in `ps`)
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/index.js` (lines 246-247)

**Code:**
```javascript
const migrate = isWindows
  ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
  : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
exec(migrate, ...);
```

**Impact:** The master key is passed as an inline environment variable via `exec()`, making it visible in the process command line. On Linux, any user can see process arguments via `/proc/*/cmdline` or `ps aux`. This leaks the master key to all users on the same machine.

**Recommendation:** Pass secrets via the `env` option of `exec()` instead of embedding them in the command string. Example: `exec('npx parse-dbtool migrate', { env: { ...process.env, MASTER_KEY: process.env.MASTER_KEY } })`.

---

### Finding S-06: `masterKeyIps` Set to Allow All IPs
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/index.js` (line 113)

**Code:**
```javascript
masterKeyIps: ['0.0.0.0/0', '::/0'],
```

**Impact:** Parse Server's `masterKeyIps` setting restricts which IP addresses can use the master key for API requests. Setting it to `0.0.0.0/0` (all IPv4) and `::/0` (all IPv6) means any network client can use the master key from any IP address, completely negating the IP-based protection.

**Recommendation:** Restrict `masterKeyIps` to trusted internal IPs only (e.g., `['127.0.0.1', '::1']`), or to the specific IPs of your backend services.

---

### Finding S-07: Master Key Used as JWT Signing Secret
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSignedUrl.js` (lines 106, 128, 156)

**Code:**
```javascript
const secretKey = process.env.MASTER_KEY;
const token = jwt.sign(payload, secretKey);
// ...
const decoded = jwt.verify(token, secretKey);
```

**Impact:** The Parse master key is reused as the JWT signing secret for pre-signed local file URLs. If the JWT secret is ever compromised (e.g., via the committed `.env.example`), the attacker can forge file access tokens. Additionally, reusing the master key for a different purpose violates the principle of least privilege and single responsibility for secrets.

**Recommendation:** Use a dedicated, separate secret for JWT signing (e.g., `JWT_FILE_SECRET`). Rotate it independently from the master key.

---

### Finding S-08: `getContact` Uses `useMasterKey: true` Without Ownership Verification
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getContact.js` (lines 1-11)

**Code:**
```javascript
export default async function getContact(request) {
  const contactId = request.params.contactId;
  const contactCls = new Parse.Query('contracts_Contactbook');
  const contactRes = await contactCls.get(contactId, { useMasterKey: true });
  return contactRes;
}
```

**Impact:** This cloud function fetches any contact by ID using the master key, bypassing all ACLs, and returns the full object. There is no verification that the requesting user owns or has permission to access the contact. Any authenticated user (or unauthenticated user if the function is not requireUser-protected) can enumerate and read any contact in the system.

**Recommendation:** Add ownership validation (e.g., verify `request.user` is the `CreatedBy` pointer). Alternatively, remove `useMasterKey: true` and rely on ACLs.

---

### Finding S-09: `getDocument` Uses `useMasterKey` and Only Partially Validates Access
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getDocument.js` (lines 1-74)

**Code:**
```javascript
const res = await query.first({ useMasterKey: true });
// ...
if (!IsEnableOTP) {
  return document;  // No session/ownership check when OTP is not enabled
}
```

**Impact:** When `IsEnableOTP` is `false` (the default for most documents), the function returns the complete document including all placeholders, signers, and audit trail to any caller with just a `docId`. No session token or ownership check is performed. Sensitive fields like `ExtUserPtr.TenantId` are partially sanitized (PfxFile and FileAdapters are deleted), but the rest of the tenant data is returned. Document IDs are predictable (auto-increment style in some Parse configurations) or guessable.

**Recommendation:** Always verify the caller's identity and access rights before returning document data. Use session tokens and ACL checks regardless of the OTP setting.

---

### Finding S-10: `afterFind` Hooks Do Not Sanitize Sensitive Fields
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/UserAfterFInd.js`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/TenantAfterFind.js`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/DocumentAfterFind.js`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SignatureAfterFind.js`

**Impact:** The `afterFind` hooks for users, tenants, documents, and signatures only handle presigned URL generation for file fields. They do NOT strip sensitive fields from the response. For example:
- The `UserAfterFind` hook does not remove password hashes, session tokens, or email verification tokens.
- The `TenantAfterFind` hook does not remove `PfxFile`, `FileAdapters`, or other internal configuration from tenant objects (though `getDocument.js` manually deletes some of these).
- None of the hooks process results when `request.objects.length > 1`, meaning batch queries may expose raw S3 URLs without presigning.

**Recommendation:** Add field exclusion logic to all `afterFind` hooks to strip sensitive data. Handle the `objects.length > 1` case to ensure presigning applies to all results.

---

## Part 2: File Upload Security

### Finding FU-01: `decryptpdf` Endpoint Has No File Type Validation, No Size Limit, and Uses Original Filename for Disk Storage
**Severity:** CRITICAL
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/decryptpdf.js` (lines 5-14)

**Code:**
```javascript
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'exports');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);  // Uses client-supplied filename directly
  },
});

export const upload = multer({ storage }); // No fileFilter, no limits
```

**Impact:** This endpoint has three critical issues:
1. **No file type validation:** The multer configuration has no `fileFilter`. Any file type can be uploaded -- executables, scripts, HTML files, etc.
2. **No file size limit:** The multer `limits` object is not set. Combined with the `express.json({ limit: '100mb' })` in `customApp.js`, files up to 100MB can be uploaded, enabling denial-of-service via disk exhaustion.
3. **Path traversal via filename:** `file.originalname` is used directly as the filename on disk. An attacker can craft a filename like `../../index.js` or `../../../etc/cron.d/malicious` to write files outside the `exports` directory. This is a classic path traversal vulnerability that can lead to remote code execution.

**Recommendation:** Add a `fileFilter` that only accepts PDF files (by both MIME type and extension). Add `limits: { fileSize: ... }`. Never use `file.originalname` for disk storage -- generate a random filename and validate the extension.

---

### Finding FU-02: `decryptpdf` Endpoint Has No Authentication
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js` (line 19)

**Code:**
```javascript
app.post('/decryptpdf', decryptUpload.single('file'), decryptpdf);
```

**Impact:** The `/decryptpdf` route has no session token validation, no authentication middleware, and no authorization check. Any unauthenticated user on the network can upload files to the server's `exports` directory. Combined with FU-01 (path traversal, no file type check), this makes the endpoint a direct attack vector for writing arbitrary files to the server filesystem.

**Recommendation:** Add authentication middleware that validates a session token before processing the upload. At minimum, verify `req.headers.sessiontoken` against Parse Server's `/users/me` endpoint, similar to how `deleteUserByAdmin` does it.

---

### Finding FU-03: `saveFile` Cloud Function Accepts Only Extension-Based File Type Check, No MIME Validation
**Severity:** MEDIUM
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/saveFile.js` (lines 20-32)

**Code:**
```javascript
const ext = request.params.fileName?.split('.')?.pop();
let mimeType;
let file;
if (ext === 'pdf') {
  mimeType = 'application/pdf';
  const flatPdf = await flattenPdf(fileBase64);
  file = flatPdf;
} else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
  mimeType = `image/${ext}`;
  file = Buffer.from(fileBase64, 'base64');
}
```

**Impact:** File type is determined solely by the client-supplied file extension from `request.params.fileName`. The actual content of the base64-encoded file is never validated against its declared type. An attacker could upload a malicious HTML or SVG file with a `.png` extension. Additionally, if the extension does not match `pdf`, `png`, `jpeg`, or `jpg`, both `mimeType` and `file` remain `undefined`, potentially causing undefined behavior in `parseUploadFile()`. The function does require authentication (`request.user` check at line 11), which mitigates the risk somewhat.

**Recommendation:** Validate the actual file content (magic bytes / file signatures) in addition to the extension. Return an explicit error for unsupported file types rather than passing `undefined` values.

---

### Finding FU-04: `sanitizeFileName` Is Defined but Never Called on Server-Side Upload Paths
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/Utils.js` (line 151) -- definition
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/saveFile.js` -- does NOT call it
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js` -- does NOT call it
- `/home/user/OpenSign/apps/OpenSignServer/utils/fileUtils.js` (`parseUploadFile`) -- does NOT call it

**Code (definition):**
```javascript
export function sanitizeFileName(fileName) {
  const file = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
  const removedot = file.replace(/\.(?=.*\.)/g, '');
  return removedot.replace(/[^a-zA-Z0-9._-]/g, '');
}
```

**Impact:** The `sanitizeFileName` function exists in `Utils.js` and is exported, but no server-side code ever calls it. In `saveFile.js`, the user-supplied `request.params.fileName` is passed directly to `parseUploadFile()` without sanitization. In `PDF.js`, the document name is manually sanitized inline (line 432: `_resDoc?.Name?.replace(/[^a-zA-Z0-9._-]/g, '_')`) rather than using the shared function. In `parseUploadFile()` (`fileUtils.js` line 84), the `fileName` is used directly in the HTTP request URL (`/files/${fileName}`), making it vulnerable to URL injection if the filename contains special characters like `?`, `#`, or `/`.

**Recommendation:** Call `sanitizeFileName()` consistently before all file upload operations. Additionally, apply URL encoding to filenames used in URL paths.

---

### Finding FU-05: S3 Adapter Configured with `directAccess: true` and `preserveFileName: true`
**Severity:** MEDIUM
**File:** `/home/user/OpenSign/apps/OpenSignServer/index.js` (lines 29-44)

**Code:**
```javascript
const s3Options = {
  bucket: process.env.DO_SPACE,
  baseUrl: process.env.DO_BASEURL,
  fileAcl: 'none',
  region: process.env.DO_REGION,
  directAccess: true,
  preserveFileName: true,
  presignedUrl: true,
  presignedUrlExpires: 900,
  // ...
};
```

**Impact:**
1. **`directAccess: true`**: This tells Parse Server to return the direct S3/DigitalOcean Spaces URL to the client, bypassing Parse Server's file access middleware. While `presignedUrl: true` and `fileAcl: 'none'` mitigate some risk (files are not publicly readable without a pre-signed URL), the combination means files are accessed directly from the storage service, bypassing any server-side access controls or audit logging.
2. **`preserveFileName: true`**: User-supplied filenames are preserved as-is in S3 storage. If filenames are not sanitized (see FU-04), this could lead to issues with special characters or filename-based attacks. It also makes file URLs somewhat predictable if document names are known.
3. **`presignedUrlExpires: 900`** (15 minutes): This is a reasonable expiration time, but pre-signed URLs can be shared during the validity window with anyone.

**Recommendation:** Consider setting `preserveFileName: false` to use random filenames in S3. Ensure all filenames are sanitized before upload. Review whether `directAccess` is strictly necessary; if not, route file access through the server for additional access control.

---

### Finding FU-06: `docxtopdf` Endpoint References Undefined Variable `uploadedSizeBytes`
**Severity:** LOW (bug, potential crash)
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/docxtopdf.js` (line 152)

**Code:**
```javascript
const timeoutMs = uploadedSizeBytes > 10 * 1024 * 1024 ? 120_000 : 90_000;
```

**Impact:** The variable `uploadedSizeBytes` is never declared in the function scope. This will throw a `ReferenceError` at runtime, causing the entire conversion request to fail with a 400 error. While not directly a security vulnerability, it renders the endpoint non-functional in its current state, and error messages returned to the client may expose internal details. Note: the `docxtopdf` endpoint does properly validate authentication via session token (line 128) and has good multer configuration with file type and size limits (lines 94-105).

**Recommendation:** Replace `uploadedSizeBytes` with `req.file.buffer.length` or `req.file.size`.

---

### Finding FU-07: `saveFileUsage` Does Not Validate File Content or Type
**Severity:** LOW
**File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js` (lines 58-94)

**Impact:** The `saveFileUsage` function only tracks storage usage (file size and URL) for billing/quota purposes. It performs no validation of file type, content, or size. It trusts the `size` and `fileUrl` parameters passed to it. While this function is not an upload endpoint itself, it means the upload quota tracking layer provides no secondary defense against malicious uploads.

**Recommendation:** Consider adding file type validation at the storage tracking layer as a defense-in-depth measure.

---

### Finding FU-08: Pre-Signed URL Generation Does Not Scope to User or Document
**Severity:** MEDIUM
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSignedUrl.js` (lines 41-101)

**Code:**
```javascript
export async function getSignedUrl(request) {
  const docId = request.params.docId || '';
  const templateId = request.params.templateId || '';
  const url = request.params.url;

  if (docId || templateId) {
    // ... fetches document but does NOT verify the requesting user owns it
    if (_resDoc?.IsEnableOTP) {
      const isAuth = await isAuthenticated(request?.user);
      // ... only checks auth when OTP is enabled
    }
    const presignedUrl = getPresignedUrl(url);
    return presignedUrl;
  }
}
```

**Impact:** The `getSignedUrl` cloud function generates pre-signed S3 URLs. When a `docId` or `templateId` is provided:
1. The function verifies the document exists but does NOT check whether the requesting user is the document owner or an authorized signer.
2. Authentication is only enforced when `IsEnableOTP` is true.
3. The `url` parameter is user-supplied -- an attacker could pass ANY S3 URL (for a different document or tenant's file), and the function will generate a pre-signed URL for it as long as the `docId` points to a valid document.
4. There is no validation that the provided `url` actually belongs to the specified `docId`.

When no `docId` or `templateId` is provided, authentication IS properly enforced, but the same issue exists: any authenticated user can generate pre-signed URLs for any file in the S3 bucket.

**Recommendation:** Validate that the requested `url` corresponds to a file belonging to the specified document. Always verify that the requesting user has access to the document (owner, signer, or admin).

---

## Part 3: API Security

### Finding API-01: No Rate Limiting on Any Endpoint
**Severity:** CRITICAL
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/index.js` -- no rate limiting middleware
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js` -- no rate limiting middleware
- `/home/user/OpenSign/apps/OpenSignServer/package.json` (line 56) -- `"rate-limiter-flexible": "^9.0.1"` is listed as a dependency

**Impact:** The `rate-limiter-flexible` package is declared as a dependency in `package.json` but is **never imported or used** anywhere in the codebase. No Express middleware or Parse Cloud function applies rate limiting. This leaves every endpoint vulnerable to brute-force and abuse attacks, including:

1. **Login (`loginuser` cloud function):** No rate limiting on password attempts. An attacker can attempt unlimited username/password combinations.
2. **OTP send (`SendOTPMailV1` cloud function):** No rate limiting on OTP requests. An attacker can trigger unlimited OTP emails to any email address, causing email bombing and potential service billing costs.
3. **OTP verification (`AuthLoginAsMail` cloud function):** No rate limiting on OTP verification. The OTP is only 4 digits (`Math.floor(1000 + Math.random() * 9000)`), giving only 9,000 possible values. An attacker can brute-force this in seconds.
4. **Signup (`usersignup` cloud function):** No rate limiting on account creation.
5. **Password reset (`resetpassword` cloud function):** No rate limiting on password reset requests.
6. **Delete account OTP (`/delete-account/:userId/otp`):** Has a 30-second cooldown between sends (good), but no overall rate limit on the endpoint itself.
7. **File upload endpoints (`/docxtopdf`, `/decryptpdf`):** No rate limiting, enabling DoS via resource exhaustion.

**Recommendation:** Implement rate limiting using the already-installed `rate-limiter-flexible` package. Apply strict limits to authentication endpoints (login, OTP send/verify, signup, password reset). Apply moderate limits to resource-intensive endpoints (file upload, document conversion).

---

### Finding API-02: OTP Is Only 4 Digits and Generated with `Math.random()` (Not Cryptographically Secure)
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js` (line 22)

**Code:**
```javascript
let code = Math.floor(1000 + Math.random() * 9000);
```

**Impact:** The OTP has only 9,000 possible values (1000-9999). Combined with the lack of rate limiting (API-01), an attacker can brute-force the OTP in approximately 9,000 requests. `Math.random()` is not cryptographically secure; its output can be predicted if the attacker can observe previous values. The delete account OTP (`deleteUtils.js` line 16) has a similar issue but uses 6 digits and includes attempt limiting (5 max attempts), which is significantly better.

**Recommendation:** Increase OTP length to at least 6 digits. Use `crypto.randomInt()` or `crypto.getRandomValues()` for cryptographically secure random number generation. Add attempt limiting similar to the delete OTP flow (max 5 attempts, then require re-send).

---

### Finding API-03: OTP Never Expires and Is Not Invalidated After Use
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js` (lines 51-71) and `AuthLoginAsMail.js` (lines 20-23)

**Code (SendMailOTPv1.js):**
```javascript
// OTP is stored in defaultdata_Otp class with no expiration field
if (resultOTP !== undefined) {
  updateOtp.set('OTP', code);
  updateOtp.save(null, { useMasterKey: true });
} else {
  newOtpQuery.set('OTP', code);
  newOtpQuery.set('Email', email);
  await newOtpQuery.save(null, { useMasterKey: true });
}
```

**Code (AuthLoginAsMail.js):**
```javascript
if (resOtp === otp) {
  var result = await getToken(request);
  // OTP is NOT deleted or invalidated after successful use
```

**Impact:** The OTP stored in the `defaultdata_Otp` class:
1. Has no expiration timestamp -- it remains valid indefinitely until a new OTP is generated for the same email.
2. Is not deleted or invalidated after successful verification -- the same OTP can be reused multiple times.
3. Has no attempt counter -- unlimited verification attempts are allowed (see API-01).

This is in stark contrast to the delete account OTP flow which properly implements expiration (10 minutes), attempt counting (5 max), and cooldown between sends.

**Recommendation:** Add an expiration timestamp to the OTP record. Delete or invalidate the OTP immediately after successful verification. Add an attempt counter to prevent brute-force.

---

### Finding API-04: CORS Configured with Wildcard Origin (No Restrictions)
**Severity:** HIGH
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/index.js` (line 168)
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js` (line 14)

**Code:**
```javascript
// index.js
app.use(cors());

// customApp.js
app.use(cors());
```

**Impact:** Both the main Express app and the custom route app use `cors()` with no configuration, which defaults to allowing ALL origins (`Access-Control-Allow-Origin: *`). This means:
1. Any website can make cross-origin requests to the API.
2. While browsers will not send credentials with wildcard CORS, Parse Server uses custom headers (`X-Parse-Session-Token`) rather than cookies, so the wildcard CORS effectively allows any malicious website to make authenticated API calls if it can obtain a session token (e.g., via XSS on any domain).
3. The `/decryptpdf` and `/docxtopdf` endpoints are accessible from any origin.

**Recommendation:** Configure CORS with an explicit allowlist of trusted origins. For example: `cors({ origin: ['https://your-app-domain.com'], credentials: true })`.

---

### Finding API-05: No Security Headers (No Helmet.js, No CSP, No X-Frame-Options)
**Severity:** HIGH
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/index.js`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js`

**Impact:** Neither Express application uses `helmet.js` or sets any security headers manually. The following headers are missing:
1. **`Strict-Transport-Security` (HSTS):** Without this, connections may be downgraded from HTTPS to HTTP via man-in-the-middle attacks.
2. **`X-Content-Type-Options: nosniff`:** Without this, browsers may MIME-sniff responses, potentially interpreting uploaded files (stored in the `exports` directory or served via S3) as executable content.
3. **`X-Frame-Options` / `Content-Security-Policy: frame-ancestors`:** Without this, the application can be embedded in iframes on malicious sites, enabling clickjacking attacks. This is especially relevant for the delete account confirmation page served by `deleteUserGet.js`.
4. **`Content-Security-Policy`:** No CSP is configured, making the application more vulnerable to XSS attacks.
5. **`X-XSS-Protection`:** While deprecated in modern browsers, its absence removes a defense-in-depth layer for older browsers.
6. **`Referrer-Policy`:** Not set, potentially leaking sensitive URL parameters (like session tokens) to third-party sites.

**Recommendation:** Add `helmet` as middleware to both Express apps. Configure CSP, HSTS, and frame-ancestors appropriate to the deployment.

---

### Finding API-06: Express Body Parser Limit Set to 100MB
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/index.js` (lines 169-170)
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js` (lines 15-16)
- `/home/user/OpenSign/apps/OpenSignServer/index.js` (line 111) -- `maxUploadSize: '100mb'`

**Code:**
```javascript
// index.js
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// customApp.js
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Parse Server config
maxUploadSize: '100mb',
```

**Impact:** All three body parser configurations allow payloads up to 100MB. This is extremely generous and enables denial-of-service attacks:
1. An attacker can send many concurrent 100MB JSON payloads, consuming server memory rapidly (JSON parsing loads the entire body into memory).
2. The `express.urlencoded({ extended: true })` with 100MB limit is particularly dangerous as `qs` library (used by `extended: true`) can be slow on deeply nested objects.
3. Cloud functions like `signPdf` accept base64-encoded PDF data in JSON (`req.params.pdfFile`), meaning a 100MB JSON body could contain ~75MB of PDF data.
4. There is no `maxLimit` restriction on Parse query results besides the 500-object limit (line 110), but the per-request payload size is the primary concern.

**Recommendation:** Reduce the JSON and URL-encoded body limits to a more reasonable size (e.g., 10-20MB for most endpoints). For endpoints that genuinely need large uploads (like `signPdf`), consider using multipart/form-data with streaming instead of base64 in JSON.

---

### Finding API-07: Custom Express Routes Lack Consistent Authentication
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/customApp.js`

**Code:**
```javascript
app.post('/docxtopdf', docxUpload.single('file'), docxtopdf);      // Auth: YES (validates session token in handler)
app.post('/decryptpdf', decryptUpload.single('file'), decryptpdf);  // Auth: NO
app.get('/delete-account/:userId', deleteUserGet);                   // Auth: NO (serves HTML form to anyone with userId)
app.post('/delete-account/:userId/otp', deleteUserOtp);              // Auth: NO (sends OTP to anyone with userId)
app.post('/delete-account/:userId', deleteUserPost);                 // Auth: NO (but requires OTP)
app.post('/deleteuser/:userId', deleteUserByAdmin);                  // Auth: YES (validates session token)
```

**Impact:** Authentication is inconsistently applied across custom routes:
1. **`/decryptpdf`**: Completely unauthenticated (see FU-02).
2. **`/delete-account/:userId` (GET)**: Anyone with a valid `userId` (a Parse objectId) can view the delete account page. The `userId` is a short alphanumeric string that could potentially be enumerated.
3. **`/delete-account/:userId/otp` (POST)**: Anyone with a valid `userId` can trigger OTP emails to that user's registered email address. This could be used for email harassment or to enumerate valid user IDs.
4. **`/delete-account/:userId` (POST)**: Requires a valid OTP but not a session token. The OTP is the only authentication factor.
5. **`/docxtopdf`** and **`/deleteuser/:userId`**: Properly validate session tokens.

**Recommendation:** Add authentication middleware to all routes that perform sensitive operations. For the delete account flow, consider requiring the user to be logged in (session token) in addition to the OTP. At minimum, add rate limiting to the OTP send endpoint.

---

### Finding API-08: SSL Certificate Validation Disabled for File Downloads
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js` (line 66)
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js` (line 60)

**Code:**
```javascript
const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Disable SSL validation
axios.get(url, { responseType: 'stream', httpsAgent })
```

**Impact:** When downloading PDF files for email attachment (in both the SMTP and Gmail mail providers), SSL certificate validation is explicitly disabled for non-HTTPS or localhost URLs. The condition is:
```javascript
const isSecure = new URL(url)?.protocol === 'https:' && new URL(url)?.hostname !== 'localhost';
```
When `isSecure` is false (i.e., HTTP URLs or localhost), the code uses `rejectUnauthorized: false`. This allows man-in-the-middle attacks to intercept or modify document downloads. An attacker on the same network could replace the PDF content being attached to completion emails. Note that this only affects the server-to-server download path when sending email attachments.

**Recommendation:** Remove `rejectUnauthorized: false`. If self-signed certificates are needed for local development, make this configurable via an environment variable that is never enabled in production.

---

### Finding API-09: `delete-account` Flow Vulnerable to User Enumeration
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserGet.js` (line 10)
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserOtp.js` (line 16)

**Code:**
```javascript
// deleteUserGet.js
const extUser = await extUserQuery.first({ useMasterKey: true });
if (!extUser) return res.status(404).send('User not found.');

// deleteUserOtp.js
if (!extUser) return res.status(404).json({ error: 'User not found' });
```

**Impact:** Both endpoints return different responses for valid vs. invalid user IDs:
- Valid `userId`: Returns the HTML form (GET) or sends an OTP (POST)
- Invalid `userId`: Returns 404 "User not found"

This allows an attacker to enumerate valid user IDs by testing different objectId values. Parse objectIds are typically 10-character alphanumeric strings, making enumeration feasible with automated tools. Successful enumeration would reveal which user IDs exist in the system, enabling targeted attacks on specific accounts.

**Recommendation:** Return the same response regardless of whether the user exists. For example, always display the OTP form and claim "OTP sent" even if the user does not exist.

---

### Finding API-10: `Math.random()` Used for Security-Sensitive Random Values
**Severity:** MEDIUM
**Files:**
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js` (line 22)
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUtils.js` (line 16)
- `/home/user/OpenSign/apps/OpenSignServer/Utils.js` (line 181) -- `generateId()`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/docxtopdf.js` (line 110) -- `generatePdfName()`
- `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/saveAsTemplate.js` (line 1)

**Code examples:**
```javascript
// SendMailOTPv1.js - OTP generation
let code = Math.floor(1000 + Math.random() * 9000);

// deleteUtils.js - Delete OTP generation
const n = Math.floor(Math.random() * Math.pow(10, len));

// Utils.js - generateId for file adapters
result += characters.charAt(Math.floor(Math.random() * charactersLength));
```

**Impact:** `Math.random()` is not cryptographically secure. Its output is deterministic given knowledge of the internal state, which can potentially be recovered from observed outputs. This affects:
1. OTP generation (both login and delete flows) -- attacker may predict future OTPs
2. File adapter IDs -- predictable identifiers
3. PDF filenames -- predictable names (lower risk)

Note that `Utils.js` line 327 uses `crypto.getRandomValues()` for `randomId()`, showing awareness of the issue, but it is not applied consistently.

**Recommendation:** Replace all `Math.random()` usage in security-sensitive contexts with `crypto.randomInt()` (Node.js 14.10+) or `crypto.getRandomValues()`. The existing `randomId()` function in `Utils.js` already demonstrates the correct approach.

---

### Finding API-11: No `beforeSaveFile` or `afterSaveFile` Triggers for Server-Side File Validation
**Severity:** MEDIUM
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/main.js`

**Impact:** Parse Server supports `beforeSaveFile` and `afterSaveFile` cloud triggers that run before/after any file is saved to the file adapter. The codebase does not define either of these triggers. This means:
1. There is no server-side validation of file type, size, or content when files are uploaded via the Parse Files API (`POST /files/:filename`).
2. Any authenticated client can upload files of any type and size (up to the 100MB `maxUploadSize` limit).
3. The `parseUploadFile()` function in `fileUtils.js` uploads files using the master key, bypassing any file-level CLPs.
4. No file extension whitelist is enforced at the Parse Server level (`fileExtensions` config option is not set).

**Recommendation:** Add a `beforeSaveFile` trigger that validates file type (by extension and magic bytes), enforces size limits, and sanitizes filenames. Consider setting the `fileExtensions` Parse Server configuration option to restrict allowed file types.

---

### Finding API-12: WebSocket Dependency Present but Not Actively Used in Application Code
**Severity:** LOW (Informational)
**File:** `/home/user/OpenSign/apps/OpenSignServer/package.json` (line 59)

**Code:**
```json
"ws": "^8.19.0"
```

**Impact:** The `ws` WebSocket library is listed as a dependency, but no application code imports or uses it directly. Parse Server may use it internally for LiveQuery subscriptions, but LiveQuery is not configured in the Parse Server configuration (`index.js`). The `ws` package itself is not a vulnerability, but unused dependencies increase the attack surface and should be periodically reviewed.

**Recommendation:** If WebSocket/LiveQuery functionality is not needed, remove `ws` from dependencies. If it is needed in the future, ensure WebSocket connections require authentication (session token validation).

---

### Finding API-13: `usersignup` Cloud Function Has No Authentication and Allows Arbitrary Role Assignment
**Severity:** HIGH
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/usersignup.js` (lines 44-131)

**Code:**
```javascript
export default async function usersignup(request) {
  const userDetails = request.params.userDetails;
  // ... no authentication check (no request.user verification)
  const user = await saveUser(userDetails);
  const extClass = userDetails.role.split('_')[0];
  // ... creates objects in `${extClass}_Users` class
  newObj.set('UserRole', userDetails.role);
}
```

**Impact:**
1. **No authentication:** The function does not check `request.user`, meaning unauthenticated requests can create new users.
2. **Arbitrary role:** The `userDetails.role` parameter is user-supplied and used directly. An attacker could supply `contracts_Admin` as the role to create an admin account.
3. **Arbitrary class injection:** The `extClass` is derived from `userDetails.role.split('_')[0]`, and objects are created in `${extClass}_Users`. While `allowClientClassCreation` is `false`, the `useMasterKey: true` on the save could bypass this restriction, potentially allowing creation in unintended classes.
4. **loginAs with master key:** If the email already exists, the function calls `/loginAs` with the master key (line 13-25), returning a valid session token for ANY existing user without password verification.

**Recommendation:** Add authentication to the signup function if it should only be used by admins. Validate the role against an allowlist. Remove or restrict the `loginAs` fallback for existing users.

---

### Finding API-14: `deleteUserGet` Serves Inline HTML with Unsanitized userId in Action URL
**Severity:** MEDIUM
**File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserGet.js` (line 55)

**Code:**
```javascript
const htmlForm = `
  ...
  <form id="otpForm" class="hidden" method="POST" action="${routePath}/delete-account/${userId}">
  ...
  const resp = await fetch('${routePath}/delete-account/${userId}/otp', ...);
  ...
`;
res.send(htmlForm);
```

**Impact:** The `userId` parameter from `req.params.userId` is directly interpolated into the HTML response without sanitization. While Parse objectIds are typically alphanumeric, if an attacker crafts a request with a `userId` containing HTML/JavaScript (e.g., `"><script>alert(1)</script>`), it would be executed in the victim's browser context. This is a reflected XSS vulnerability. The endpoint also lacks `Content-Type` headers with charset specification and has no CSP headers (see API-05).

**Recommendation:** HTML-encode the `userId` before interpolating it into the HTML response. Use a templating engine with auto-escaping. Add `Content-Security-Policy` headers to prevent inline script execution.

---

### Finding API-15: `parseUploadFile` Passes Master Key in HTTP Headers for Internal Requests
**Severity:** LOW (Informational)
**File:** `/home/user/OpenSign/apps/OpenSignServer/utils/fileUtils.js` (lines 82-100)

**Code:**
```javascript
export async function parseUploadFile(fileName, fileData, mimeType) {
  const res = await axios.post(`${cloudServerUrl}/files/${fileName}`, fileData, {
    headers: {
      'X-Parse-Application-Id': serverAppId,
      'X-Parse-Master-Key': process.env.MASTER_KEY,
      'Content-Type': mimeType,
    },
  });
  return res.data;
}
```

**Impact:** All file uploads go through this function, which uses the master key for authentication. This means:
1. All file uploads bypass any file-level CLPs or ACLs.
2. The master key is included in HTTP headers for internal loopback requests (`http://localhost:8080/app/files/...`). While these are local requests, if the server is behind a reverse proxy that logs request headers, the master key would be captured in logs.
3. The `fileName` is not URL-encoded, meaning filenames with special characters (spaces, `?`, `#`) could corrupt the URL path.

**Recommendation:** URL-encode the filename. Consider using Parse SDK's `Parse.File` API instead of raw HTTP requests to avoid passing the master key explicitly. If using HTTP, ensure request logging does not capture sensitive headers.

---

