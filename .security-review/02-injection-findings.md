# Security Audit: Input Validation & Injection Risks

**Repository:** OpenSign (`/home/user/OpenSign`)
**Date:** 2026-02-09
**Auditor:** Claude Opus 4.6 (Automated Deep Audit)

---

## Table of Contents
1. [NoSQL Injection](#1-nosql-injection)
2. [XSS (Cross-Site Scripting)](#2-xss-cross-site-scripting)
3. [Command Injection](#3-command-injection)
4. [SSRF (Server-Side Request Forgery)](#4-ssrf-server-side-request-forgery)
5. [Path Traversal](#5-path-traversal)
6. [Email Injection](#6-email-injection)
7. [Regex DoS](#7-regex-dos)

---

*Findings are appended incrementally below as the audit progresses.*

---

## 1. NoSQL Injection

### NOSQL-01: Dynamic Parse Class Name from User Input (CRITICAL)
- **Severity:** CRITICAL
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/usersignup.js`
- **Lines:** 49, 51, 98
- **Code:**
  ```js
  const extClass = userDetails.role.split('_')[0];           // line 49
  const extQuery = new Parse.Query(extClass + '_Users');      // line 51
  const extCls = Parse.Object.extend(extClass + '_Users');    // line 98
  ```
- **Impact:** The `userDetails.role` field from `request.params` is split and its first component is used directly to construct a Parse class name. An attacker can supply an arbitrary string as `role` (e.g., `"_Session_Users"` or `"_Role_Users"`) to query or create objects in arbitrary Parse classes, potentially accessing `_Session`, `_Role`, or other internal classes. This can lead to privilege escalation, data leakage, or data corruption.
- **Recommendation:** Validate `role` against an explicit allowlist of permitted role prefixes (e.g., `['contracts']`) before constructing the class name.

### NOSQL-02: Unvalidated `docId` in getDocument (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getDocument.js`
- **Lines:** 5, 12, 22-23
- **Code:**
  ```js
  const docId = request.params.docId;                    // line 5
  const include = request?.params?.include || '';         // line 6
  query.equalTo('objectId', docId);                      // line 12
  if (include) { query?.include(include); }              // line 22-23
  ```
- **Impact:** (a) `docId` is not validated as a string or checked for format, and the query uses `useMasterKey: true` bypassing all ACLs. If `IsEnableOTP` is false on the document, the document is returned to ANY caller without authentication. This is an authorization bypass; any unauthenticated user with a valid document ID can read the entire document. (b) The `include` parameter is taken directly from user input and passed to `query.include()`, allowing an attacker to request inclusion of related pointer fields not intended to be exposed, potentially leaking sensitive nested data (e.g., internal tenant configuration fields).
- **Recommendation:** (a) Always require authentication or validate the caller has document access before returning data. Never rely solely on `useMasterKey: true` for queries that return user data. (b) Validate `include` against an allowlist of permitted include paths.

### NOSQL-03: Unvalidated `docId` in triggerEvent with useMasterKey (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/triggerEvent.js`
- **Lines:** 7, 16
- **Code:**
  ```js
  const docId = body.objectId;                                    // line 7
  const docRes = await docQuery.get(docId, { useMasterKey: true }); // line 16
  ```
- **Impact:** The `body.objectId` from `request.params` is used directly in `docQuery.get()` with `useMasterKey: true`. No type validation or authentication check before the query. An unauthenticated user can query any document by supplying its objectId. The `contactId` parameter (line 8) is also used directly in a pointer without validation, allowing an attacker to inject audit trail entries for any contact.
- **Recommendation:** Validate input types and require authentication before allowing document lookup.

### NOSQL-04: Unvalidated `domain` in GetLogoByDomain with useMasterKey (MEDIUM)
- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/GetLogoByDomain.js`
- **Lines:** 5, 8-9
- **Code:**
  ```js
  const domain = request.params.domain;
  tenantCreditsQuery.equalTo('Domain', domain);
  const res = await tenantCreditsQuery.first({ useMasterKey: true });
  ```
- **Impact:** The `domain` parameter is used directly in a Parse query with `useMasterKey: true` without any type checking. If a non-string value (e.g., an object like `{"$regex":".*"}`) is passed, it could be used for query manipulation (though Parse SDK may partially mitigate this by serializing the value). The function is unauthenticated and exposes tenant existence information.
- **Recommendation:** Validate that `domain` is a string and matches expected domain format.

### NOSQL-05: JSON.parse of User-Controlled String in createBatchDocs (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/createBatchDocs.js`
- **Lines:** 228, 231
- **Code:**
  ```js
  const strDocuments = request.params.Documents;      // line 228
  const Documents = JSON.parse(strDocuments);          // line 231
  ```
- **Impact:** The `Documents` parameter from `request.params` is JSON-parsed without validation. If the input is malformed or crafted, it can cause unhandled exceptions crashing the function. More importantly, the parsed objects are used to construct Parse batch requests (line 131-194) where fields like `className`, `objectId`, `CreatedBy`, etc. are taken directly from user-controlled JSON. An attacker can craft batch requests that create documents pointing to arbitrary users, classes, or objects, enabling data forgery or privilege escalation.
- **Recommendation:** Validate the JSON structure after parsing. Verify all pointer object IDs and class names against expected values. Never trust `CreatedBy` or `ExtUserPtr` from user input.

### NOSQL-06: Unvalidated Pointer objectIds Throughout Cloud Functions (MEDIUM)
- **Severity:** MEDIUM
- **Files:** Multiple cloud functions including:
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getDrive.js` (line 8, 21-25)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSignedUrl.js` (line 43-45)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/savecontact.js` (line 6, 34-38)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/addUser.js` (line 2)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/manageSign.js` (line 2, 13-14)
- **Code Pattern:**
  ```js
  // Typical pattern - objectId from params used directly in pointers
  const tenantId = request.params.tenantId;
  contactQuery.set('TenantId', {
    __type: 'Pointer', className: 'partners_Tenant', objectId: tenantId
  });
  ```
- **Impact:** Object IDs from `request.params` are used to construct Parse pointers without validating they are strings of the expected format. An attacker could pass non-string values or IDs belonging to other tenants to create cross-tenant references.
- **Recommendation:** Validate all objectId parameters are strings matching the Parse objectId format (alphanumeric, 10 characters). Verify the referenced objects exist and belong to the current user's tenant.

### NOSQL-07: Password Set to Email in savecontact (CRITICAL)
- **Severity:** CRITICAL
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/savecontact.js`
- **Line:** 46
- **Code:**
  ```js
  _user.set('password', email);
  ```
- **Impact:** When creating a new contact, the user's password is set to their email address. This means any contact's Parse User account has a trivially guessable password (their own email), allowing anyone who knows a contact's email to log in as them. Combined with the `loginUser` function, an attacker can authenticate as any contact in the system.
- **Recommendation:** Generate a cryptographically random password for contact user accounts, or use a separate authentication mechanism for contacts.

---

## 2. XSS (Cross-Site Scripting)

### XSS-01: Reflected XSS via userId in Server-Rendered HTML (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteUserGet.js`
- **Lines:** 5, 55, 112
- **Code:**
  ```js
  const { userId } = req.params;                              // line 5
  // ... userId interpolated directly into HTML template literal:
  action="${routePath}/delete-account/${userId}"               // line 55
  fetch('${routePath}/delete-account/${userId}/otp', ...)     // line 112
  ```
- **Impact:** The `userId` from `req.params` is interpolated directly into a server-rendered HTML template string without any escaping or sanitization. Although the code first queries the database for the user (line 8-9) and returns 404 if not found, the `userId` value itself is still embedded raw into the HTML response. If an attacker supplies a crafted `userId` containing HTML/JavaScript (e.g., `"><script>alert(1)</script>`) and the objectId format is not strictly enforced by Parse, the payload would execute in the victim's browser. Additionally, because the lookup uses the raw `userId` to construct a pointer (line 8), the query might return no result but the HTML is rendered only when a result IS found -- still, the userId value is never sanitized and goes straight into the `action` attribute and the `fetch()` URL inside `<script>`.
- **Recommendation:** HTML-encode the `userId` parameter before embedding it in the template. Better yet, validate `userId` is a strict alphanumeric Parse objectId format (e.g., `/^[a-zA-Z0-9]{10,}$/`) before use.

### XSS-02: Stored XSS via ReactQuill Rich Text Editor HTML Content (HIGH)
- **Severity:** HIGH
- **Files:**
  - `/home/user/OpenSign/apps/OpenSign/src/components/pdf/EmailBody.jsx` (line 34)
  - `/home/user/OpenSign/apps/OpenSign/src/components/preferences/MailTemplateEditor.jsx` (lines 254, 331)
  - `/home/user/OpenSign/apps/OpenSign/src/reports/template/TemplatesReport.jsx` (line 1489)
  - `/home/user/OpenSign/apps/OpenSign/src/reports/document/DocumentsReport.jsx` (line 1623)
  - `/home/user/OpenSign/apps/OpenSign/src/components/pdf/EditorToolbar.jsx` (lines 3, 6, 65)
  - `/home/user/OpenSign/apps/OpenSign/src/pages/PlaceHolderSign.jsx` (line 1660)
- **Code:**
  ```jsx
  // EditorToolbar.jsx - enables raw HTML editing button
  import htmlEditButton from "quill-html-edit-button";
  Quill.register("modules/htmlEditButton", htmlEditButton);
  // module config:
  htmlEditButton: {}   // line 65 - no sanitization config

  // PlaceHolderSign.jsx - reads raw innerHTML
  const html = editorRef.current.editor.root.innerHTML;  // line 1660
  setRequestBody(html);

  // EmailBody.jsx - renders Quill editor content
  <ReactQuill value={props.requestBody} ... />            // line 34
  ```
- **Impact:** The `quill-html-edit-button` plugin provides a raw HTML editing mode (the `<>` button) allowing users to type arbitrary HTML including `<script>`, `<img onerror=...>`, `<svg onload=...>`, etc. This HTML is extracted via `innerHTML` (PlaceHolderSign.jsx line 1660) and stored as the email body. The content flows through `replaceMailVaribles()` into the `html` parameter of `sendMailv3`, which passes it directly into the email `html` field (sendMailv3.js line 128). This means a malicious user can craft an email body containing JavaScript that executes when the recipient opens the email (in email clients that render HTML). Additionally, if this content is rendered back in the React app via ReactQuill's `value` prop, Quill may render some HTML unsanitized.
- **Recommendation:** Sanitize HTML content from the Quill editor using a library like DOMPurify before storing or sending it. Configure the `htmlEditButton` module with a sanitizer, or remove the raw HTML edit capability. On the server side, sanitize the `html` email body before sending.

### XSS-03: User-Controlled Data in Email HTML Templates Without Escaping (MEDIUM)
- **Severity:** MEDIUM
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/Utils.js` (lines 252-284, `mailTemplate` function)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/ForwardDoc.js` (lines 47-55)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js` (lines 225-238)
- **Code:**
  ```js
  // Utils.js mailTemplate() - user data interpolated into HTML
  const body = "..." +
    param.senderName +                                      // line 264
    ' has requested you to review and sign <strong>' +
    param.title +                                           // line 266
    '</strong>.</p>...' +
    param.senderMail +                                      // line 268
    param.organization +                                    // line 270
    param.note +                                            // line 274
    '...<a target=_blank href=' +
    param.signingUrl +                                      // line 276
    '>...'

  // ForwardDoc.js - docName in HTML
  `<strong>${docName}</strong>`                              // line 53
  ```
- **Impact:** User-controlled values such as `senderName`, `title` (document name), `organization`, `note`, `senderMail`, and `signingUrl` are concatenated directly into HTML email bodies without HTML entity encoding. An attacker who sets their name, document title, or organization to contain HTML/JavaScript (e.g., `<img src=x onerror=alert(document.cookie)>`) can execute scripts in the recipient's email client. The `signingUrl` is particularly dangerous as it is placed in an `href` attribute without quoting, enabling attribute injection. The `replaceMailVaribles()` function (Utils.js line 41-56) also performs replacement without encoding, meaning template variables like `{{sender_name}}` are replaced with raw user values into HTML context.
- **Recommendation:** HTML-entity-encode all user-supplied values before interpolating them into HTML email templates. Use a templating engine with auto-escaping (e.g., Handlebars with default escaping). For URLs in `href` attributes, validate they are proper HTTPS URLs and quote the attribute value.

### XSS-04: URL Parameter Used for Network Fetch Without Validation (MEDIUM)
- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSign/src/pages/DocSuccessPage.jsx`
- **Lines:** 33-47
- **Code:**
  ```js
  const search = window.location.search.split("?")[1];
  const urlParams = new URLSearchParams(search);
  const docUrl = urlParams.get("docurl");                  // line 37
  // ...
  const base64Pdf = await getBase64FromUrl(docUrl);        // line 47
  ```
- **Impact:** The `docurl` parameter is read directly from the URL query string and passed to `getBase64FromUrl()` which likely makes a network request to fetch a PDF. While React's JSX rendering prevents direct DOM XSS, passing an attacker-controlled URL to a fetch function can lead to: (1) SSRF on the client side -- the user's browser can be made to fetch arbitrary URLs; (2) Data exfiltration if the response is processed and displayed; (3) Potential open redirect behavior. The `certificate` URL parameter (line 38) is similarly used without validation.
- **Recommendation:** Validate that `docUrl` and `certificate` URL parameters match expected URL patterns (e.g., must be HTTPS URLs pointing to the application's known file storage domains) before fetching them.

---

## 3. Command Injection

### CMD-01: Environment Variables Interpolated into Shell Command via exec() (MEDIUM)
- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/index.js`
- **Lines:** 16, 245-248
- **Code:**
  ```js
  import { exec } from 'child_process';                       // line 16
  // ...
  const migrate = isWindows
    ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
    : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
  exec(migrate, (error, stdout, stderr) => { ... });          // line 248
  ```
- **Impact:** The `exec()` function spawns a shell and passes the command string to it. The values `serverAppId`, `cloudServerUrl`, and `process.env.MASTER_KEY` are interpolated directly into the command string. While these are server environment variables (not direct user input), if any of these values are ever set from an external source or contain shell metacharacters (`;`, `|`, `$()`, backticks), arbitrary commands would be executed. The `MASTER_KEY` is particularly sensitive -- if it contains characters like `$(command)` or backticks, it would be interpreted by the shell. This is a defense-in-depth concern.
- **Recommendation:** Use `execFile()` or `spawn()` with argument arrays instead of `exec()` with a shell command string. Alternatively, set environment variables via the `env` option of `exec()` rather than interpolating them into the command string.

### CMD-02: exec() Used to Kill Processes in docxtopdf (LOW)
- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/docxtopdf.js`
- **Lines:** 4, 8, 14-27
- **Code:**
  ```js
  import { exec } from 'child_process';                       // line 4
  const execAsync = promisify(exec);                           // line 8

  async function killStuckProcesses() {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      await execAsync("pkill -9 -f 'soffice.*--headless' || true");  // line 18
    } else if (process.platform === 'win32') {
      await execAsync('taskkill /F /IM soffice.bin /T || exit 0');    // line 21
    }
  }
  ```
- **Impact:** While the `exec()` calls in `killStuckProcesses()` use hardcoded command strings (no user input), `exec()` spawns a shell which has inherent risks. The `libreoffice-convert` library (line 3) uses `libre.convert(input, ext, opts, callback)` where `input` is a Buffer and `ext` is the target extension (".pdf"). The `ext` parameter is hardcoded to `'.pdf'` (line 164), and the input is the file buffer, not a filename -- so user-controlled filenames do not reach shell commands in this code path. The risk here is low but the use of `exec()` with a shell is a code smell.
- **Recommendation:** Replace `exec()` with `execFile()` for the process-killing commands. For example: `execFile('pkill', ['-9', '-f', 'soffice.*--headless'])`.

---

## 4. SSRF (Server-Side Request Forgery)

### SSRF-01: User-Controlled URL Fetched in sendMailv3 for PDF Attachment (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js`
- **Lines:** 39, 47-67
- **Code:**
  ```js
  if (req.params.url) {                                       // line 39
    // ...
    const isSecure =
      new URL(req.params.url)?.protocol === 'https:' &&
      new URL(req.params.url)?.hostname !== 'localhost';       // lines 47-48
    if (isSecure) {
      https.get(req.params.url, async function (response) {   // line 51
        response.pipe(Pdf);
      });
    } else {
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      const localUrl = req.params.url;
      const newlocalUrl = localUrl.replace(
        'https://localhost:3001/api', 'http://localhost:8080'  // line 63
      );
      axios.get(newlocalUrl, { responseType: 'stream', httpsAgent }); // line 67
    }
  }
  ```
- **Impact:** The `req.params.url` value is a user-controlled URL passed to the `sendmailv3` Parse Cloud Function. The server fetches this URL to download a PDF attachment. The only validation is checking if the protocol is `https:` and hostname is not `localhost` -- but this is trivially bypassed: (1) An attacker can use `http://` URLs (the `else` branch catches these and disables SSL verification); (2) The `localhost` check only blocks the exact string "localhost", not `127.0.0.1`, `0.0.0.0`, `[::1]`, or other internal hostnames; (3) The `else` branch explicitly replaces localhost URLs and fetches with `rejectUnauthorized: false`, disabling certificate validation entirely. An attacker can force the server to make requests to internal services (e.g., `http://169.254.169.254/` for cloud metadata), internal network hosts, or any arbitrary external URL.
- **Recommendation:** Implement a strict URL allowlist for the PDF download URL (e.g., only allow URLs from known file storage origins like the configured S3/DO endpoint or the Parse Server file URL). Validate the resolved IP address is not in private/reserved ranges before fetching. Remove the SSL verification bypass.

### SSRF-02: User-Controlled URL Fetched in sendMailGmailProvider (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js`
- **Lines:** 47-78
- **Code:**
  ```js
  // url parameter from template object (user-controlled)
  if (url) {
    const isSecure =
      new URL(url)?.protocol === 'https:' && new URL(url)?.hostname !== 'localhost';
    if (isSecure) {
      https.get(url, async function (response) {              // line 56
        response.pipe(Pdf);
      });
    } else {
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      axios.get(url, { responseType: 'stream', httpsAgent }); // line 68
    }
  }
  ```
- **Impact:** Same pattern as SSRF-01. The `url` parameter originates from the `template` object passed to `sendMailGmailProvider()`. The server fetches the URL to download a PDF for email attachment. The same insufficient validation (only checking for "localhost" hostname and https protocol) applies. The `else` branch fetches with SSL verification disabled, and internal/private IP addresses are not blocked. An attacker can exploit this to access internal services or cloud metadata endpoints.
- **Recommendation:** Apply the same URL allowlist and IP range validation as recommended for SSRF-01.

### SSRF-03: certificatePath Parameter Allows Reading Arbitrary Server Files (HIGH)
- **Severity:** HIGH
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js` (line 102)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js` (line 95)
- **Code:**
  ```js
  // sendMailv3.js
  const certificatePath = req.params.certificatePath || `./exports/certificate.pdf`;  // line 102
  if (fs.existsSync(certificatePath)) {
    const certificateBuffer = fs.readFileSync(certificatePath);  // line 106
    // ... attached to email
  }

  // sendMailGmailProvider.js
  const certificate = {
    filename: 'certificate.pdf',
    type: 'application/pdf',
    path: certificatePath || './exports/certificate.pdf',      // line 95
  };
  // ... later: fs.readFileSync(attachment.path)               // line 108
  ```
- **Impact:** The `certificatePath` parameter from the request is used directly in `fs.existsSync()` and `fs.readFileSync()` calls. An attacker who can call the `sendmailv3` cloud function (or influence the `certificatePath` parameter) can specify any file path on the server (e.g., `/etc/passwd`, `/proc/self/environ`, `.env`). The file contents would be read, attached to an email as "certificate.pdf", and sent to the attacker-controlled `recipient` address. This combines SSRF (reading arbitrary files) with data exfiltration via email. Note: This is also a Path Traversal issue (cross-referenced with PATH-02).
- **Recommendation:** Never accept file paths from user input. Generate the certificate path server-side from known-safe components (document ID). If a path must come from input, validate it against a strict pattern (e.g., must start with `./exports/` and contain only alphanumeric characters, dots, hyphens, and underscores).

---

## 5. Path Traversal

### PATH-01: Multer Disk Storage Uses Unsanitized file.originalname in decryptpdf (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/decryptpdf.js`
- **Lines:** 5-12, 17, 20
- **Code:**
  ```js
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'exports');                                     // line 7
    },
    filename(req, file, cb) {
      cb(null, file.originalname);                             // line 10 - UNSANITIZED
    },
  });
  // ...
  const inputPath = req.file.path;                             // line 17
  const file = fs.readFileSync(inputPath);                     // line 20
  ```
- **Impact:** The `file.originalname` from the multipart upload is used directly as the filename for writing to disk. An attacker can craft a multipart request with a filename like `../../../etc/cron.d/malicious` or `../../.env.override` to write the uploaded file outside the intended `exports` directory. Although the file is expected to be a PDF, the content could be anything. After writing, the file is read back and processed, then deleted via `fs.unlink(inputPath)`. The path traversal allows: (1) Writing arbitrary files to the server filesystem; (2) Overwriting existing files; (3) Potential code execution if written to an executable location.
- **Recommendation:** Sanitize `file.originalname` to remove path separators and special characters. Use the `sanitizeFileName()` function already defined in `Utils.js` (line 151-156) or generate a random filename. For example: `cb(null, crypto.randomUUID() + '.pdf')`.

### PATH-02: certificatePath from User Input Enables Arbitrary File Read (CRITICAL)
- **Severity:** CRITICAL
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js` (line 102, 103, 106)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js` (line 95, 97, 108)
- **Code:**
  ```js
  // sendMailv3.js
  const certificatePath = req.params.certificatePath || `./exports/certificate.pdf`;  // line 102
  if (fs.existsSync(certificatePath)) {                        // line 103
    const certificateBuffer = fs.readFileSync(certificatePath); // line 106
    const certificate = {
      filename: 'certificate.pdf',
      content: smtpenable ? certificateBuffer : undefined,
      data: smtpenable ? undefined : certificateBuffer,
    };
    attachment = [file, certificate];                           // attached to email
  }
  ```
- **Impact:** This is the same issue noted in SSRF-03 but from a path traversal perspective. The `certificatePath` parameter is taken directly from user input (`req.params.certificatePath`) and used in `fs.existsSync()` and `fs.readFileSync()` without any path validation. An attacker can supply paths like `/etc/shadow`, `/proc/self/environ` (containing environment variables with secrets like `MASTER_KEY`, `MAILGUN_API_KEY`, database credentials), or `/home/user/OpenSign/.env`. The file content is then attached to an email sent to the attacker-controlled `recipient` parameter. This is a complete arbitrary file read-and-exfiltrate vulnerability.
- **Recommendation:** Remove the `certificatePath` parameter from the public API. Always compute the certificate path server-side using only the document ID: `const certificatePath = path.join('./exports', \`signed_certificate_\${docId}.pdf\`)`. Use `path.resolve()` and verify the resolved path starts with the expected base directory.

### PATH-03: deleteLocalFile Uses URL pathname for File Deletion (MEDIUM)
- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/customRoute/deleteAccount/deleteFileUrl.js`
- **Lines:** 60-69
- **Code:**
  ```js
  async function deleteLocalFile(fileUrl) {
    const url = new URL(fileUrl);
    const filePath = decodeURIComponent(url.pathname);         // line 63
    if (!filePath.includes('files')) return;                    // line 64
    const localPath = url?.pathname?.split(`/files/${serverAppId}/`)?.pop();  // line 66
    if (localPath) {
      await fs.unlink(`./files/files/${localPath}`);           // line 69
    }
  }
  ```
- **Impact:** The `localPath` is extracted from a URL pathname by splitting on `/files/{appId}/` and taking the last segment. The only validation is that the pathname includes the string "files". An attacker who can influence the file URLs stored in documents (e.g., by modifying the document's `URL`, `SignedUrl`, or `CertificateUrl` fields) could craft a URL like `http://localhost/files/opensign/../../important-file` to delete files outside the intended `./files/files/` directory. The `decodeURIComponent` on line 63 also enables URL-encoded path traversal characters (`%2e%2e%2f`).
- **Recommendation:** Validate that `localPath` does not contain `..` segments. Use `path.resolve()` and verify the resolved path starts with the expected base directory before deletion.

### PATH-04: Predictable Temporary File Names in exports/ Directory (LOW)
- **Severity:** LOW
- **Files:**
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js` (line 41)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js` (line 172)
  - `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/pdf/PDF.js` (lines 354-355, 435-436, 446, 454, 460)
- **Code:**
  ```js
  // sendMailv3.js
  const randomNumber = Math.floor(Math.random() * 5000);
  const testPdf = `test_${randomNumber}.pdf`;                  // line 41
  let Pdf = fs.createWriteStream(testPdf);                     // line 43

  // PDF.js
  const randomNumber = Math.floor(Math.random() * 5000);       // line 354
  const pfxname = `keystore_${randomNumber}.pfx`;              // line 355
  let filePath = `./exports/${name}`;                          // line 435
  let signedFilePath = `./exports/signed_${name}`;             // line 436
  ```
- **Impact:** Temporary files use `Math.floor(Math.random() * 5000)` for naming, providing only ~5000 possible filenames. This creates race conditions: (1) Two concurrent requests could get the same random number, causing file overwrites and corrupted PDFs; (2) In the `testPdf` case, files are written to the current working directory (not `exports/`), potentially accessible via static file serving; (3) The PFX keystore file (containing signing certificates) is temporarily written to disk with a predictable name, and an attacker who can read the filesystem during this window could obtain the private key. `Math.random()` is not cryptographically secure.
- **Recommendation:** Use `crypto.randomUUID()` or `crypto.randomBytes(16).toString('hex')` for temporary filenames. Use `os.tmpdir()` or a secure temporary directory. Ensure PFX files are cleaned up in all error paths (already partially done via `unlinkFile`).

---

## 6. Email Injection

### EMAIL-01: Email Header Injection via Raw MIME Construction in Gmail Provider (HIGH)
- **Severity:** HIGH
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailGmailProvider.js`
- **Lines:** 28-155
- **Code:**
  ```js
  const makeEmail = async (to, from, subject, html, url, pdfName, bcc, ...) => {
    const bccHeader = bcc && bcc.length > 0 ? `BCC: ${bcc.join(',')}\n` : '';  // line 43
    const replyToHeader = replyto ? `Reply-To: ${replyto}\n` : '';              // line 44
    // ...
    str = [
      'Content-Type: multipart/mixed; boundary="' + boundary + '"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,                                                             // line 124/141
      `From: ${from}\n`,                                                         // line 125/142
      bccHeader,                                                                 // line 126/143
      replyToHeader,                                                             // line 127/144
      `Subject: ${subject}\n\n`,                                                 // line 128/145
      // ...
    ].join('');
    const encodedMail = Buffer.from(str).toString('base64')...;                  // line 154
  };
  ```
- **Impact:** The Gmail provider constructs raw MIME email messages by string concatenation. The `to`, `from`, `subject`, `bcc`, and `replyto` values are interpolated directly into MIME headers without any sanitization or encoding. If any of these values contain newline characters (`\r\n` or `\n`), an attacker can inject additional MIME headers. For example, a `subject` value of `"Test\r\nBCC: attacker@evil.com\r\nContent-Type: text/html\r\n\r\n<script>..."` would inject an additional BCC recipient and potentially override the email body. The `bcc` array values are joined with commas but individual entries are not validated, so injecting `"victim@test.com\r\nX-Injected: true"` is possible. Since this raw string is base64-encoded and sent via the Gmail API, the injected headers would be processed by Gmail.
- **Recommendation:** Sanitize all header values by stripping or rejecting `\r`, `\n`, and `\0` characters. Use a proper MIME library (like `nodemailer` or `emailjs`) that handles header encoding (RFC 2047) instead of manual string construction. Validate email addresses against a strict regex before use.

### EMAIL-02: Unsanitized from Parameter in sendMailv3 (MEDIUM)
- **Severity:** MEDIUM
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js`
- **Lines:** 120-132, 214-224
- **Code:**
  ```js
  const from = req.params.from || '';                                 // line 120
  const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
  const replyto = req.params?.replyto || '';                         // line 122
  const messageParams = {
    from: from + ' <' + mailsender + '>',                            // line 124
    to: req.params.recipient,                                        // line 125
    subject: req.params.subject,                                     // line 126
    html: req.params.html || '',                                     // line 128
    bcc: req.params.bcc ? req.params.bcc : undefined,                // line 131
    replyTo: replyto ? replyto : undefined,                          // line 132
  };
  ```
- **Impact:** The `from` parameter (display name portion) is concatenated with the system email address. While nodemailer/Mailgun typically handle header encoding, the `from` display name is user-controlled and could contain characters that break email header parsing. The `recipient`, `subject`, `html`, `bcc`, and `replyto` fields are all taken directly from `req.params` without validation. Although the SMTP/Mailgun libraries provide some protection against raw header injection, the `bcc` parameter allows an attacker to add arbitrary BCC recipients to any email sent through the system, enabling them to receive copies of all documents and signing notifications. The `html` body is completely user-controlled (see XSS-02), and `subject` could contain misleading content for phishing.
- **Recommendation:** Validate `recipient` and all BCC addresses with the existing `emailRegex` from Utils.js. Strip newlines from `from`, `subject`, and `replyto`. Restrict `bcc` to addresses belonging to the sender's organization. Sanitize `html` content.

### EMAIL-03: Unsanitized User Data in OTP Email HTML Body (LOW)
- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`
- **Lines:** 23, 36-39
- **Code:**
  ```js
  let email = request.params.email;                                   // line 23
  // ...
  html: `...Your OTP for ${AppName} verification is:...</p>` + code  // lines 36-39
  ```
- **Impact:** The `email` parameter from `request.params` is used to look up and store OTP records but is not validated as a proper email format. While the email address itself is not directly embedded in the HTML body (only `AppName` and `code` are), the `email` is used as the `recipient` for `Parse.Cloud.sendEmail()`. If the email field contains injection characters, it could be used to send OTP emails to unintended addresses. The OTP code itself is generated with `Math.random()` (line 22) which is not cryptographically secure, making brute-force attacks feasible with only 9000 possible values (1000-9999).
- **Recommendation:** Validate `email` against the `emailRegex` from Utils.js before use. Use `crypto.randomInt(100000, 999999)` for generating 6-digit OTPs with cryptographic randomness.

---

## 7. Regex DoS

### REGEX-01: RegExp Construction from Template Variable Names in replaceMailVaribles (LOW)
- **Severity:** LOW
- **File:** `/home/user/OpenSign/apps/OpenSignServer/Utils.js`
- **Lines:** 41-56
- **Code:**
  ```js
  export function replaceMailVaribles(subject, body, variables) {
    let replacedSubject = subject;
    let replacedBody = body;
    for (const variable in variables) {
      const regex = new RegExp(`{{${variable}}}`, 'g');       // line 46
      if (subject) {
        replacedSubject = replacedSubject.replace(regex, variables[variable]);
      }
      if (body) {
        replacedBody = replacedBody.replace(regex, variables[variable]);
      }
    }
    return { subject: replacedSubject, body: replacedBody };
  }
  ```
- **Impact:** The `variable` key name is interpolated directly into a `new RegExp()` constructor without escaping. If a variable name contained regex metacharacters (e.g., `.*+?`), it could alter the regex behavior. However, in the current codebase, the variable names are hardcoded by the callers (e.g., `document_title`, `sender_name`, `sender_mail`, `receiver_name`, `expiry_date`, `company_name`, `signing_url` -- see createBatchDocs.js lines 62-74 and PDF.js lines 225-235). Since the variable names are not user-controlled, this is a low-severity code quality issue rather than an exploitable vulnerability. The risk would increase if the code were ever modified to accept dynamic variable names from user input (e.g., custom template variables).
- **Recommendation:** As a defense-in-depth measure, escape the variable name before constructing the regex: `const regex = new RegExp(\`\\{\\{${escapeRegExp(variable)}\\}\\}\`, 'g')`. The `escapeRegExp` function is already defined in multiple files (getSigners.js, reportsJson.js, filterDocs.js).

### REGEX-02: Regex Search Applied to User Input in getSigners (LOW - MITIGATED)
- **Severity:** LOW (mitigated)
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSigners.js`
- **Lines:** 1-9
- **Code:**
  ```js
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');    // line 3
  }
  // ...
  const escapedSearch = escapeRegExp(searchObj.search);        // line 8
  const searchRegex = new RegExp(escapedSearch, 'i');           // line 9
  ```
- **Impact:** The search input is properly escaped using `escapeRegExp()` before being used in `new RegExp()`. This correctly mitigates regex injection and ReDoS attacks. The escaped regex is then used with `Parse.Query.matches()` which sends it to MongoDB's `$regex` operator. This is a well-implemented pattern. The same escaping pattern is used in `reportsJson.js` (line 230, 240) and `filterDocs.js` (line 4, 28). **This is an informational finding confirming a good security practice.**
- **Recommendation:** No action needed. Continue using this pattern for all regex operations with user input.

### REGEX-03: MongoDB $regex with User Input in reportsJson applySearch (LOW - MITIGATED)
- **Severity:** LOW (mitigated)
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/reportsJson.js`
- **Lines:** 230-242
- **Code:**
  ```js
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');       // line 231
  }
  export function applySearch({ reportId, baseWhere, searchTerm }) {
    if (!searchTerm) return baseWhere;
    const escaped = escapeRegExp(searchTerm);                  // line 240
    const nameMatch = { Name: { $regex: `.*${escaped}.*`, $options: 'i' } };
    const emailMatch = { Email: { $regex: `.*${escaped}.*`, $options: 'i' } };
  ```
- **Impact:** Similar to REGEX-02, the `searchTerm` is properly escaped before being used in MongoDB `$regex` queries. The escaping prevents regex injection. However, even with escaping, MongoDB `$regex` queries with `$options: 'i'` (case-insensitive) and leading wildcards (`.*`) cannot use indexes efficiently, potentially causing slow queries on large collections. This is a performance concern rather than a security vulnerability.
- **Recommendation:** Consider using MongoDB text indexes or Atlas Search for full-text search instead of `$regex` with leading wildcards, especially as the dataset grows. The current regex escaping is correct and should be maintained.

---

## Summary

| Category | Finding ID | Severity | Description |
|----------|-----------|----------|-------------|
| NoSQL Injection | NOSQL-01 | CRITICAL | Dynamic Parse class name from user role |
| NoSQL Injection | NOSQL-02 | HIGH | Unvalidated docId with useMasterKey bypass |
| NoSQL Injection | NOSQL-03 | HIGH | Unvalidated objectId in triggerEvent |
| NoSQL Injection | NOSQL-04 | MEDIUM | Unvalidated domain in GetLogoByDomain |
| NoSQL Injection | NOSQL-05 | HIGH | JSON.parse of user-controlled batch documents |
| NoSQL Injection | NOSQL-06 | MEDIUM | Unvalidated pointer objectIds in cloud functions |
| NoSQL Injection | NOSQL-07 | CRITICAL | Password set to email in savecontact |
| XSS | XSS-01 | HIGH | Reflected XSS via userId in server-rendered HTML |
| XSS | XSS-02 | HIGH | Stored XSS via ReactQuill raw HTML editor |
| XSS | XSS-03 | MEDIUM | User data in email HTML templates without escaping |
| XSS | XSS-04 | MEDIUM | URL parameter used for unvalidated network fetch |
| Command Injection | CMD-01 | MEDIUM | Environment variables interpolated into exec() |
| Command Injection | CMD-02 | LOW | exec() used for process management |
| SSRF | SSRF-01 | HIGH | User-controlled URL fetched in sendMailv3 |
| SSRF | SSRF-02 | HIGH | User-controlled URL fetched in Gmail provider |
| SSRF | SSRF-03 | HIGH | certificatePath allows reading arbitrary server files |
| Path Traversal | PATH-01 | HIGH | Unsanitized file.originalname in multer disk storage |
| Path Traversal | PATH-02 | CRITICAL | certificatePath from user input enables file read |
| Path Traversal | PATH-03 | MEDIUM | URL pathname used for local file deletion |
| Path Traversal | PATH-04 | LOW | Predictable temporary file names |
| Email Injection | EMAIL-01 | HIGH | Raw MIME header construction in Gmail provider |
| Email Injection | EMAIL-02 | MEDIUM | Unsanitized from/bcc/subject in sendMailv3 |
| Email Injection | EMAIL-03 | LOW | Unsanitized email in OTP function |
| Regex DoS | REGEX-01 | LOW | RegExp from template variable names (not user-controlled) |
| Regex DoS | REGEX-02 | LOW (mitigated) | User input properly escaped in getSigners |
| Regex DoS | REGEX-03 | LOW (mitigated) | User input properly escaped in applySearch |

### Severity Distribution
- **CRITICAL:** 3 (NOSQL-01, NOSQL-07, PATH-02)
- **HIGH:** 9 (NOSQL-02, NOSQL-03, NOSQL-05, XSS-01, XSS-02, SSRF-01, SSRF-02, SSRF-03/PATH-02, PATH-01, EMAIL-01)
- **MEDIUM:** 6 (NOSQL-04, NOSQL-06, XSS-03, XSS-04, PATH-03, EMAIL-02)
- **LOW:** 5 (CMD-02, PATH-04, EMAIL-03, REGEX-01, REGEX-02/03)

### Top Priority Remediation
1. **PATH-02 / SSRF-03:** Remove `certificatePath` from user input in sendMailv3/sendMailGmailProvider -- this enables arbitrary file read + exfiltration.
2. **SSRF-01 / SSRF-02:** Implement URL allowlisting for PDF download URLs in email sending functions.
3. **PATH-01:** Sanitize `file.originalname` in decryptpdf multer configuration.
4. **EMAIL-01:** Replace raw MIME string construction with a proper MIME library in Gmail provider.
5. **XSS-02:** Sanitize Quill editor HTML output before storing or sending.
6. **XSS-03:** HTML-encode all user data in email templates.
