# Security Audit: Authentication & Authorization in OpenSign

**Audit Date:** 2026-02-09
**Scope:** All cloud functions in `apps/OpenSignServer/cloud/parsefunction/`, auth adapters, and custom routes
**Auditor:** Automated Deep Security Review

---

## Findings

*(Findings are appended incrementally as each file is reviewed.)*

### Finding #1 — CRITICAL: AddAdmin.js has NO authentication check

- **Severity:** Critical
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/AddAdmin.js`, lines 99-101
- **Code:**
```js
export default async function AddAdmin(request) {
  const userDetails = request.params.userDetails;
  const user = await saveUser(userDetails);
```
- **Impact:** The `addadmin` cloud function can be called by ANY unauthenticated user. It does not check `request.user`. An attacker can create a new admin account (with full organization, tenant, team setup) by simply calling `Parse.Cloud.run('addadmin', { userDetails: {...} })` without being logged in. This grants full admin privileges to any anonymous caller.
- **Additional concern (line 62-98):** The `saveUser` helper uses the Parse `loginAs` endpoint with the master key to generate a session token for existing users, meaning if the target email already exists, the attacker gets a valid session token for that existing user.
- **Recommendation:** Add `request.user` check. Restrict to existing admins or use it only during initial setup when no admin exists (combine with `CheckAdminExist` logic).

---

### Finding #2 — HIGH: CheckAdminExist.js has NO authentication check and leaks admin existence

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/CheckAdminExist.js`, lines 2-3
- **Code:**
```js
export default async function CheckAdminExist() {
  try {
    const extClsQuery = new Parse.Query('contracts_Users');
```
- **Impact:** Any unauthenticated user can call `checkadminexist` to determine whether an admin account exists. This is an information disclosure that helps attackers understand system state (e.g., whether the system is freshly installed and vulnerable to admin creation via `addadmin`).
- **Recommendation:** If this is intentionally used during first-time setup, document it and rate-limit. Otherwise, require authentication.

---

### Finding #3 — HIGH: UpdateExistUserAsAdmin.js accepts master key as a client parameter

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/UpdateExistUserAsAdmin.js`, lines 42-47
- **Code:**
```js
export default async function UpdateExistUserAsAdmin(request) {
  const email = request.params.email;
  const masterkey = request.params.masterkey;
  try {
    if (masterkey !== process.env.MASTER_KEY) {
      throw new Parse.Error(404, 'Invalid master key.');
    }
```
- **Impact:** The master key is passed as a client-side parameter and compared in plain text. This means:
  1. The master key must be known by the client/frontend, violating the principle that master keys are server-only secrets.
  2. Any user who knows/guesses the master key can elevate any existing user to admin.
  3. The master key may be exposed in client-side code, network logs, or browser devtools.
  4. No `request.user` check — completely unauthenticated.
- **Recommendation:** Never accept master keys from client parameters. Use `request.user` with role-based authorization instead. If this is an admin setup function, gate it behind proper authentication.

---

### Finding #4 — HIGH: AuthLoginAsMail.js OTP verification has no rate limiting or OTP expiry

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/AuthLoginAsMail.js`, lines 10-23
- **Code:**
```js
let otpN = request.params.otp;
let otp = parseInt(otpN);
let email = request.params.email;
// ...
const checkOtp = new Parse.Query('defaultdata_Otp');
checkOtp.equalTo('Email', email);
const res = await checkOtp.first({ useMasterKey: true });
if (res !== undefined) {
  let resOtp = res.get('OTP');
  if (resOtp === otp) {
```
- **Impact:**
  1. No OTP expiry check — an OTP remains valid indefinitely until a new one is generated.
  2. No rate limiting on OTP verification attempts — an attacker can brute-force the OTP (typically 4-6 digits = 10,000-1,000,000 combinations).
  3. No authentication required (`request.user` not checked) — this is expected for OTP login, but combined with no rate limiting it is a serious risk.
  4. Uses `parseInt` which may have edge cases with non-numeric input.
  5. After OTP verification, it uses `loginAs` with master key to generate a session — this is effectively a password-bypass authentication.
- **Recommendation:** Add OTP expiry (e.g., 5 minutes). Add attempt limiting. Delete/invalidate OTP after successful use.

---

### Finding #5 — MEDIUM: addUser.js — any authenticated user can create new users (no admin check)

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/addUser.js`, lines 1-8
- **Code:**
```js
export default async function addUser(request) {
  const { phone, name, password, organization, team, tenantId, timezone, role } = request.params;
  const email = request.params?.email?.toLowerCase()?.replace(/\s/g, '');
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
  }
  const currentUser = { __type: 'Pointer', className: '_User', objectId: request.user.id };
  if (name && email && password && organization && team && role && tenantId) {
```
- **Impact:** While it checks `request.user`, it does NOT verify the user is an admin or has user-management permissions. Any authenticated user can create new users with arbitrary roles (including potentially admin roles) in any organization/tenant.
- **Additional concern (lines 63-65):** ACL is set with `setPublicReadAccess(true)` and `setPublicWriteAccess(true)`, making the created `contracts_Users` record world-readable and world-writable.
- **Additional concern (lines 76-81):** On duplicate email (error code 202), the function resets the existing user's password via master key — any authenticated user can reset any other user's password by "re-adding" them.
- **Recommendation:** Add admin/OrgAdmin role check. Validate that the caller belongs to the same tenant/organization. Remove public write access from ACLs. Remove the password-reset-on-duplicate logic or restrict it.

---

### Finding #6 — LOW: loginUser.js — no rate limiting, returns full user object

- **Severity:** Low
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/loginUser.js`, lines 2-16
- **Code:**
```js
export default async function loginUser(request) {
  const username = request.params.email;
  const password = request.params.password;
  if (username && password) {
    const user = await Parse.User.logIn(username, password);
    if (user) {
      const _user = user?.toJSON();
      return { ..._user };
```
- **Impact:** Returns the full user JSON object including potentially sensitive fields. No rate limiting on login attempts (brute-force risk). However, Parse Server itself may provide some built-in protection.
- **Recommendation:** Limit returned fields. Consider adding rate limiting or account lockout.

---

### Finding #7 — MEDIUM: resetPassword.js — OrgAdmin can reset passwords but authorization scope is incomplete

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/resetPassword.js`, lines 27-38
- **Code:**
```js
const isAdmin = adminUser.get('UserRole') === 'contracts_Admin' ||
                adminUser.get('UserRole') === 'contracts_OrgAdmin';
// ...
targetUserQuery.notEqualTo('UserRole', 'contracts_Admin');
```
- **Impact:** The function correctly checks for admin/OrgAdmin role and same tenant. However, an OrgAdmin can reset the password of another OrgAdmin (only `contracts_Admin` is excluded from targets). Also, there is no password complexity validation on the new password.
- **Recommendation:** Consider whether OrgAdmin-to-OrgAdmin password reset is intended. Add password complexity requirements.

---

### Finding #8 — CRITICAL: getUserId.js — unauthenticated user enumeration via master key query

- **Severity:** Critical
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getUserId.js`, lines 1-17
- **Code:**
```js
async function getUserId(request) {
  try {
    const username = request.params.username;
    const email = request.params.email;
    const query = new Parse.Query(Parse.User);
    if (username) {
      query.equalTo('username', username);
    } else {
      query.equalTo('email', email);
    }
    const user = await query.first({ useMasterKey: true });
    return { id: user.id };
```
- **Impact:** No authentication check (`request.user` not verified). Any unauthenticated caller can look up a user's internal Parse objectId by providing any email or username. This is a user enumeration vulnerability that can be used to enumerate all accounts in the system. Uses `useMasterKey: true` which bypasses all ACLs on the User class.
- **Recommendation:** Require authentication. Restrict lookup to users within the caller's organization/tenant.

---

### Finding #9 — HIGH: getUserDetails.js — unauthenticated access when email parameter is provided

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getUserDetails.js`, lines 1-3
- **Code:**
```js
async function getUserDetails(request) {
  const reqEmail = request.params.email;
  if (reqEmail || request.user) {
```
- **Impact:** The guard condition is `reqEmail || request.user`, meaning if ANY email parameter is provided, the function proceeds without checking `request.user`. An unauthenticated user can query any user's details by providing an email parameter. While the response for the email-path only returns `{ objectId: res.id }`, this still enables user enumeration and confirms account existence.
- **Recommendation:** Always require `request.user`. If the email lookup path is needed for specific workflows, add proper authentication.

---

### Finding #10 — HIGH: getDocument.js — unauthenticated document access when OTP is disabled

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getDocument.js`, lines 24-31
- **Code:**
```js
const res = await query.first({ useMasterKey: true });
if (res) {
  const IsEnableOTP = res?.get('IsEnableOTP') || false;
  const document = JSON.parse(JSON.stringify(res));
  delete document.ExtUserPtr.TenantId.FileAdapters;
  delete document?.ExtUserPtr?.TenantId?.PfxFile;
  if (!IsEnableOTP) {
    return document;
  }
```
- **Impact:** No `request.user` check. Any unauthenticated user who knows (or guesses) a document's objectId can retrieve the full document including all signers, audit trail, and placeholders. The only protection is the `IsEnableOTP` flag (when enabled, a session token ACL check is performed). By default, when OTP is not enabled, documents are fully accessible to anyone. Uses `useMasterKey: true` bypassing all ACLs.
- **Recommendation:** This appears to be intentional for public signing workflows, but document IDs should be unpredictable (UUIDs). Consider adding a separate signing token mechanism instead of relying on document ID obscurity.

---

### Finding #11 — MEDIUM: getSignedUrl.js — unauthenticated URL signing when docId/templateId is provided

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getSignedUrl.js`, lines 41-72
- **Code:**
```js
export async function getSignedUrl(request) {
  const docId = request.params.docId || '';
  const templateId = request.params.templateId || '';
  const url = request.params.url;
  if (docId || templateId) {
    try {
      if (url?.includes('files')) {
        return presignedlocalUrl(url);  // No auth check at all
      } else if (useLocal !== 'true') {
        // ... queries document with useMasterKey, only checks auth if IsEnableOTP
```
- **Impact:** When `docId` or `templateId` is provided, and the URL contains 'files', the function immediately generates a presigned URL with no authentication whatsoever. Even when it queries the document/template, it only enforces authentication when `IsEnableOTP` is true. An attacker can generate presigned URLs for any file in the storage bucket.
- **Additional concern (line 106, 128):** The MASTER_KEY is used as the JWT signing secret for local file URLs. If the master key is compromised (see Finding #3), all signed URLs can be forged.
- **Recommendation:** Always verify authentication when generating presigned URLs. Do not reuse the master key as a JWT secret.

---

### Finding #12 — MEDIUM: getReport.js uses master key for data queries after session validation

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getReport.js`, lines 70-90
- **Code:**
```js
const headers = {
  'Content-Type': 'application/json',
  'X-Parse-Application-Id': appId,
  'X-Parse-Master-Key': masterKey,
};
// ...
const res = await axios.get(url, { headers: headers });
```
- **Impact:** While the function validates the session token first, it then uses the master key to query data. This means ACLs are bypassed for the actual data query. If the report filter logic has any flaws, a user could potentially access documents belonging to other users/organizations.
- **Recommendation:** Use the session token for data queries instead of master key, or ensure the filter logic is comprehensive and tested.

---

### Finding #13 — CRITICAL: sendmailv3 (sendMailv3.js) — no authentication, allows sending emails as the platform

- **Severity:** Critical
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/sendMailv3.js`, lines 259-262
- **Code:**
```js
async function sendmailv3(req) {
  const nonCustomMail = await sendMailProvider(req);
  return nonCustomMail;
}
```
- **Impact:** No `request.user` check anywhere in the function. Any unauthenticated user can call `sendmailv3` with arbitrary parameters including `recipient`, `subject`, `html`, `from`, and `url` (for PDF attachment). This allows:
  1. Sending arbitrary emails impersonating the platform (phishing/spam relay).
  2. SSRF via the `url` parameter — the server fetches any user-supplied URL (line 51: `https.get(req.params.url)`).
  3. Local file path traversal risk with the certificate path parameter (line 102: `req.params.certificatePath`).
- **Recommendation:** Require authentication. Validate and restrict the `url` parameter. Do not accept `certificatePath` from user input.

---

### Finding #14 — HIGH: usersignup.js — no authentication check, allows arbitrary user/tenant creation

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/usersignup.js`, lines 44-48
- **Code:**
```js
export default async function usersignup(request) {
  const userDetails = request.params.userDetails;
  try {
    const user = await saveUser(userDetails);
    const extClass = userDetails.role.split('_')[0];
```
- **Impact:** No `request.user` check. Any unauthenticated user can create new accounts with arbitrary roles, create tenant records, and get session tokens. The `role` parameter is used to construct the class name (`extClass + '_Users'`), which could be exploited for class injection. The `saveUser` helper (line 12-28) uses `loginAs` with the master key if a user already exists, returning a valid session token for any existing user.
- **Additional concern (line 49):** The `extClass` derived from `userDetails.role.split('_')[0]` is used to construct the class name without sanitization, potentially allowing writes to unintended classes.
- **Recommendation:** Require authentication or restrict to initial setup. Validate the role parameter against allowed values. Do not construct class names from user input.

---

### Finding #15 — HIGH: SendMailOTPv1.js — no authentication, OTP generation for any email, no rate limiting

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/SendMailOTPv1.js`, lines 20-22
- **Code:**
```js
async function sendMailOTPv1(request) {
  try {
    let code = Math.floor(1000 + Math.random() * 9000);
    let email = request.params.email;
```
- **Impact:** No authentication check. Any unauthenticated user can:
  1. Trigger OTP emails to any address (email bombing/abuse).
  2. The OTP is only 4 digits (1000-9999), making brute-force trivial with the brute-force-vulnerable `AuthLoginAsMail`.
  3. No rate limiting on OTP generation.
  4. OTPs never expire (no TTL stored).
  5. `Math.random()` is not cryptographically secure for OTP generation.
- **Recommendation:** Rate-limit OTP requests per email and per IP. Use `crypto.randomInt()` for OTP generation. Add OTP expiry. Consider increasing OTP length to 6 digits.

---

### Finding #16 — HIGH: linkContactToDoc.js — no authentication, creates users with email as password

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/linkContactToDoc.js`, lines 40, 224-225
- **Code:**
```js
export default async function linkContactToDoc(req) {
  // ... no request.user check ...
  // line 224-225:
  _user.set('email', email);
  _user.set('password', email);
```
- **Impact:** No `request.user` check. Any unauthenticated user who knows a document ID can:
  1. Link arbitrary contacts to any document, modifying the document's signers and ACLs.
  2. Create new Parse User accounts where the password is set to the email address.
  3. Modify document ACLs to grant read/write access to arbitrary users.
  All operations use `useMasterKey: true`, bypassing ACLs.
- **Recommendation:** Require authentication. Verify the caller owns or has permission to modify the document. Never set passwords equal to email addresses.

---

### Finding #17 — MEDIUM: isextenduser.js — unauthenticated user enumeration

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/isextenduser.js`, lines 6-22
- **Code:**
```js
export default async function isextenduser(request) {
  try {
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('Email', request.params.email);
    const res = await userQuery.first({ useMasterKey: true });
    if (res) {
      return { isUserExist: true };
    } else {
      return { isUserExist: false };
    }
```
- **Impact:** No authentication check. Allows any unauthenticated user to check whether an email is registered on the platform. Uses `useMasterKey: true`. This is a user enumeration vulnerability.
- **Recommendation:** Require authentication, or if needed for the signup flow, add rate limiting and CAPTCHA.

---

### Finding #18 — HIGH: getContact.js — no authentication, any user can read any contact by ID

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getContact.js`, lines 1-6
- **Code:**
```js
export default async function getContact(request) {
  const contactId = request.params.contactId;
  try {
    const contactCls = new Parse.Query('contracts_Contactbook');
    const contactRes = await contactCls.get(contactId, { useMasterKey: true });
    return contactRes;
```
- **Impact:** No `request.user` check. Any unauthenticated caller can retrieve any contact record by providing its objectId. Uses `useMasterKey: true`, bypassing ACLs. Exposes names, emails, phone numbers, and other PII.
- **Recommendation:** Require authentication. Verify the requesting user owns or has permission to view the contact.

---

### Finding #19 — HIGH: updateContactTour.js — no authentication, allows modifying any contact's tour status

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/updateContactTour.js`, lines 1-5
- **Code:**
```js
export default async function updateContactTour(request) {
  const contactId = request.params.contactId;
  try {
    const contactCls = new Parse.Query('contracts_Contactbook');
    const contactRes = await contactCls.get(contactId, { useMasterKey: true });
```
- **Impact:** No `request.user` check. Any unauthenticated user can modify the `TourStatus` field on any contact. Uses `useMasterKey: true` for both read and write operations.
- **Recommendation:** Require authentication. Verify ownership of the contact.

---

### Finding #20 — HIGH: declinedocument.js — no authentication for non-OTP documents, accepts arbitrary userId

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/declinedocument.js`, lines 54-76
- **Code:**
```js
export default async function declinedocument(request) {
  const docId = request.params.docId;
  const reason = request.params?.reason || '';
  const userId = request.params.userId;
  const declineBy = { __type: 'Pointer', className: '_User', objectId: userId };
  // ...
  if (!isEnableOTP) {
    updateDoc.set('IsDeclined', true);
    updateDoc.set('DeclineReason', reason);
    updateDoc.set('DeclineBy', declineBy);
    await updateDoc.save(null, { useMasterKey: true });
```
- **Impact:** For non-OTP documents, no `request.user` check. Any unauthenticated user can decline any document by providing its `docId`. The `userId` parameter is caller-supplied and unvalidated — the caller can set `DeclineBy` to any arbitrary user. Uses `useMasterKey: true`.
- **Recommendation:** Validate that the caller is an authorized signer of the document. Do not accept userId from client parameters; derive it from `request.user`.

---

### Finding #21 — HIGH: getTenant.js — no authentication, exposes tenant configuration

- **Severity:** High
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getTenant.js`, lines 50-59
- **Code:**
```js
export default async function getTenant(request) {
  const userId = request.params.userId || '';
  const contactId = request.params.contactId || '';
  if (userId || contactId) {
    return await getTenantByUserId(userId, contactId);
  }
```
- **Impact:** No `request.user` check. Any unauthenticated user who provides a userId or contactId can retrieve the associated tenant configuration. While `FileAdapters` and `PfxFile` are excluded, other tenant data (name, email, contact number) is exposed. Uses `useMasterKey: true` throughout.
- **Recommendation:** Require authentication. Scope tenant lookup to the authenticated user's own tenant.

---

### Finding #22 — MEDIUM: savecontact.js — creates users with email as password

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/savecontact.js`, lines 44-46
- **Code:**
```js
_user.set('username', email);
_user.set('email', email);
_user.set('password', email);
```
- **Impact:** While this function does check `request.user`, it creates new Parse User accounts where the password is set to the email address. This means anyone who knows a user's email can log in as that user (password = email). This is a systemic pattern seen in multiple functions.
- **Recommendation:** Generate strong random passwords for auto-created user accounts. These users should authenticate via OTP or invitation links, not via password login.

---

### Finding #23 — MEDIUM: updateTourStatus.js — authenticated but no ownership check on ExtUserId

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/updateTourStatus.js`, lines 1-10
- **Code:**
```js
export default async function updateTourStatus(request) {
  const tourstatus = request.params.TourStatus;
  const extUserId = request.params.ExtUserId;
  if (request.user) {
    const updateUser = new Parse.Object('contracts_Users');
    updateUser.id = extUserId;
    updateUser.set('TourStatus', tourstatus);
    const res = await updateUser.save();
```
- **Impact:** While `request.user` is checked, the `ExtUserId` parameter is taken directly from the request without verifying it belongs to the authenticated user. Any authenticated user could potentially modify another user's `TourStatus`. However, the save uses the user's session (no useMasterKey), so ACLs may provide some protection.
- **Recommendation:** Verify that `extUserId` belongs to the authenticated user.

---

### Finding #24 — CRITICAL: generateCertificatebydocId.js — no authentication, generates and stores certificates for any document

- **Severity:** Critical
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/generateCertificatebydocId.js`, lines 45-62
- **Code:**
```js
export default async function generateCertificatebydocId(req) {
  const docId = req.params.docId;
  if (!docId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'please provide parameter.');
  }
  // ... no request.user check ...
  const getDocument = new Parse.Query('contracts_Document');
  // ...
  const docRes = await getDocument.get(docId, { useMasterKey: true });
```
- **Impact:** No `request.user` check. Any unauthenticated user who knows a document's objectId can:
  1. Trigger certificate generation for any completed document.
  2. Access the full document data including signers, audit trail, and placeholders.
  3. The function writes files to the server filesystem and uploads them, potentially causing disk exhaustion.
  Uses `useMasterKey: true` throughout.
- **Recommendation:** Require authentication. Verify the caller is the document owner or an authorized party.

---

### Finding #25 — CRITICAL: fileUpload.js — no authentication, generates signed URLs for arbitrary file paths

- **Severity:** Critical
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/fileUpload.js`, lines 3-8
- **Code:**
```js
export default async function fileUpload(request) {
  const url = request.params.url;
  try {
    const urlwithjwt = getSignedLocalUrl(url, 200);
    return { url: urlwithjwt };
```
- **Impact:** No `request.user` check. Any unauthenticated user can pass any URL and get a JWT-signed version of it. Since `getSignedLocalUrl` uses the master key as the JWT secret, this essentially allows any anonymous user to generate valid authentication tokens for any file URL in the system.
- **Recommendation:** Require authentication. Validate that the URL points to a file the user has access to.

---

### Finding #26 — MEDIUM: getUserListByOrg.js — authenticated but no org membership verification

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/getUserListByOrg.js`, lines 1-16
- **Code:**
```js
export default async function getUserListByOrg(req) {
  const OrganizationId = req.params.organizationId;
  // ...
  if (!req?.user) {
    throw new Parse.Error(...);
  } else {
    const extUser = new Parse.Query('contracts_Users');
    extUser.equalTo('OrganizationId', orgPtr);
    // ...
    const userRes = await extUser.find({ useMasterKey: true });
```
- **Impact:** While `request.user` is checked, there is no verification that the user belongs to the requested organization. Any authenticated user can enumerate all users in ANY organization by providing an arbitrary organizationId. Uses `useMasterKey: true`.
- **Recommendation:** Verify the authenticated user belongs to the requested organization before returning the user list.

---

### Finding #27 — MEDIUM: editContact.js — creates users with email as password (systemic issue)

- **Severity:** Medium
- **File:** `/home/user/OpenSign/apps/OpenSignServer/cloud/parsefunction/editContact.js`, lines 48-50
- **Code:**
```js
_user.set('username', email?.toLowerCase()?.replace(/\s/g, ''));
_user.set('email', email?.toLowerCase()?.replace(/\s/g, ''));
_user.set('password', email?.toLowerCase()?.replace(/\s/g, ''));
```
- **Impact:** Same systemic issue as Finding #22. Has proper auth check (`request.user`) and uses session token for the initial delete operation, but creates users with email as password. Also uses `useMasterKey` for the final save.
- **Recommendation:** Generate random passwords for auto-created accounts.

