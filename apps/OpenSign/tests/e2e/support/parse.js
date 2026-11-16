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
