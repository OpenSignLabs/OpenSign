import { readEnv } from "./env.js";

/**
 * Call the Parse REST API of the isolated stack with the master key.
 * @param {string} path Path under the server URL, for example "classes/_User".
 * @param {{method?: string, body?: object}} [options] HTTP method and JSON body.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} When the server answers with an error status.
 */
export const parseRequest = async (path, { method = "GET", body } = {}) => {
  const env = readEnv();
  const response = await fetch(`${env.E2E_SERVER_URL}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": env.E2E_APP_ID,
      "X-Parse-Master-Key": env.E2E_MASTER_KEY
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Parse ${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
};

/**
 * Give the admin user the password the tests log in with.
 * @returns {Promise<void>} Resolves when the password is stored.
 */
export const prepareAdminUser = async () => {
  const env = readEnv();
  const where = encodeURIComponent(JSON.stringify({ email: env.E2E_ADMIN_EMAIL }));
  const { results } = await parseRequest(`classes/_User?where=${where}&limit=1`);
  if (!results.length) throw new Error(`Admin user ${env.E2E_ADMIN_EMAIL} not found`);
  await parseRequest(`users/${results[0].objectId}`, {
    method: "PUT",
    body: { password: env.E2E_ADMIN_PASSWORD }
  });
};

/**
 * Read a document.
 * @param {string} id Document object id.
 * @returns {Promise<object>} The document.
 */
export const getDocument = (id) => parseRequest(`classes/contracts_Document/${id}`);

/**
 * Wait until a document is completed.
 * @param {string} id Document object id.
 * @param {number} [timeoutMs] Maximum wait.
 * @returns {Promise<object>} The completed document.
 * @throws {Error} When the document is not completed in time.
 */
export const waitForCompleted = async (id, timeoutMs = 30_000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const doc = await getDocument(id);
    if (doc.IsCompleted) return doc;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Document ${id} was not completed in ${timeoutMs} ms`);
};

/**
 * Create a signer document by cloning the base document with new widgets.
 * @param {{name: string, pages: Array<{pageNumber: number, pos: object[]}>, otp?: boolean}} spec
 *   Document name, widgets grouped by page and whether the signer must verify by OTP.
 * @returns {Promise<{docId: string, contactId: string}>} Ids for the signer URL.
 */
export const createSignerDocument = async ({ name, pages, otp = false }) => {
  const env = readEnv();
  const base = await getDocument(env.E2E_BASE_DOC_ID);
  const { objectId, createdAt, updatedAt, className, ...clone } = base;
  const role = base.Placeholders[0];
  const body = {
    ...clone,
    Name: name,
    IsCompleted: false,
    IsEnableOTP: otp,
    SendinOrder: false,
    Placeholders: [{ ...role, placeHolder: pages }]
  };
  delete body.SignedUrl;
  delete body.AuditTrail;
  const created = await parseRequest("classes/contracts_Document", { method: "POST", body });
  return { docId: created.objectId, contactId: role.signerObjId };
};

/**
 * Create a second user in the admin's tenant so the admin can act on it.
 * @param {string} email Email and username of the new user.
 * @returns {Promise<string>} Object id of the new `contracts_Users` row.
 */
export const createTeammate = async (email) => {
  const env = readEnv();
  const where = encodeURIComponent(JSON.stringify({ Email: env.E2E_ADMIN_EMAIL }));
  const { results } = await parseRequest(`classes/contracts_Users?where=${where}&limit=1`);
  const { objectId, createdAt, updatedAt, className, UserId, Email, Name, ...admin } = results[0];
  const existing = await parseRequest(`classes/_User?where=${encodeURIComponent(JSON.stringify({ email }))}&limit=1`);
  const userId = existing.results.length
    ? existing.results[0].objectId
    : (await parseRequest("users", { method: "POST", body: { username: email, email, password: env.E2E_ADMIN_PASSWORD } })).objectId;
  const rows = await parseRequest(`classes/contracts_Users?where=${encodeURIComponent(JSON.stringify({ Email: email }))}&limit=1`);
  if (rows.results.length) return rows.results[0].objectId;
  const created = await parseRequest("classes/contracts_Users", {
    method: "POST",
    body: {
      ...admin,
      Email: email,
      Name: "E2E Teammate",
      UserRole: "contracts_User",
      UserId: { __type: "Pointer", className: "_User", objectId: userId }
    }
  });
  return created.objectId;
};

/**
 * Create a template with a prefill role (widgets the owner fills) plus the signer role of the first template.
 * @param {{name: string, prefillWidgets: object[]}} spec Template name and the owner's widgets.
 * @returns {Promise<string>} Template object id.
 */
export const createPrefillTemplate = async ({ name, prefillWidgets }) => {
  const { results } = await parseRequest("classes/contracts_Template?limit=1");
  const { objectId, createdAt, updatedAt, className, ...base } = results[0];
  const prefillRole = {
    signerPtr: {},
    signerObjId: "",
    blockColor: "#e0e0e0",
    Role: "prefill",
    Id: 990001,
    placeHolder: [{ pageNumber: 1, pos: prefillWidgets }]
  };
  const created = await parseRequest("classes/contracts_Template", {
    method: "POST",
    body: { ...base, Name: name, Placeholders: [prefillRole, ...base.Placeholders] }
  });
  return created.objectId;
};
