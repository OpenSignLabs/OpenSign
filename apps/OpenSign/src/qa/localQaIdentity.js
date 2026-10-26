export const LOCAL_QA_APP_ID = "opensign-local-qa";
export const LOCAL_QA_DASHBOARD_ID = "35KBoSgoAK";
export const LOCAL_QA_TOKEN = "local-qa-visual-only";

const MODE_KEY = "opensign.localQaIdentityMode";
const SNAPSHOT_KEY = "opensign.localQaIdentityPreviousStorage";
const LOCAL_USER = Object.freeze({
  objectId: "local-qa-reviewer",
  username: "browser-qa@local.invalid",
  email: "browser-qa@local.invalid",
  name: "Browser QA Reviewer",
  emailVerified: true,
  sessionToken: LOCAL_QA_TOKEN,
  createdAt: "2026-01-01T00:00:00.000Z"
});

const LOCAL_EXTENDED_USER = Object.freeze({
  objectId: LOCAL_USER.objectId,
  UserId: {
    __type: "Pointer",
    className: "_User",
    objectId: LOCAL_USER.objectId
  },
  UserRole: "contracts_Admin",
  Company: "Local QA",
  EmailAddress: LOCAL_USER.email,
  TenantId: {
    __type: "Pointer",
    className: "partners_Tenant",
    objectId: "local-qa-tenant"
  },
  IsActive: true,
  TourStatus: [{ loginTour: true }]
});

const STORAGE_KEYS = [
  "accesstoken",
  "userEmail",
  "username",
  "TenantId",
  "PageLanding",
  "defaultmenuid",
  "Extand_Class",
  "profileImg",
  "appLogo",
  "appname",
  "favicon",
  "i18nextLng",
  "parseAppId",
  "baseUrl",
  `Parse/${LOCAL_QA_APP_ID}/currentUser`
];

export function isLoopbackHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(
    String(hostname || "").toLowerCase()
  );
}

export function isLocalQaBuild(env, hostname) {
  return Boolean(
    env?.DEV && env?.MODE === "local-qa" && isLoopbackHostname(hostname)
  );
}

function savePreviousStorage(windowRef) {
  const snapshot = Object.fromEntries(
    STORAGE_KEYS.map((key) => [key, windowRef.localStorage.getItem(key)])
  );
  windowRef.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function restorePreviousStorage(windowRef) {
  const rawSnapshot = windowRef.sessionStorage.getItem(SNAPSHOT_KEY);
  if (rawSnapshot) {
    try {
      const snapshot = JSON.parse(rawSnapshot);
      for (const key of STORAGE_KEYS) {
        const value = snapshot[key];
        if (typeof value === "string")
          windowRef.localStorage.setItem(key, value);
        else windowRef.localStorage.removeItem(key);
      }
    } catch {
      // If the snapshot is damaged, remove only QA-owned keys and keep the app usable.
      for (const key of STORAGE_KEYS) windowRef.localStorage.removeItem(key);
    }
  }
  windowRef.sessionStorage.removeItem(SNAPSHOT_KEY);
  windowRef.sessionStorage.removeItem(MODE_KEY);
  delete windowRef.__OPENSIGN_LOCAL_QA_IDENTITY__;
}

function installLocalStorageIdentity(windowRef) {
  windowRef.__OPENSIGN_LOCAL_QA_IDENTITY__ = true;
  windowRef.localStorage.setItem("accesstoken", LOCAL_QA_TOKEN);
  windowRef.localStorage.setItem("userEmail", LOCAL_USER.email);
  windowRef.localStorage.setItem("username", LOCAL_USER.name);
  windowRef.localStorage.setItem("TenantId", "local-qa-tenant");
  windowRef.localStorage.setItem("PageLanding", LOCAL_QA_DASHBOARD_ID);
  windowRef.localStorage.setItem("defaultmenuid", "VPh91h0ZHk");
  windowRef.localStorage.setItem(
    "Extand_Class",
    JSON.stringify([LOCAL_EXTENDED_USER])
  );
  windowRef.localStorage.setItem("profileImg", "");
  windowRef.localStorage.setItem("appLogo", "");
  windowRef.localStorage.setItem("appname", "OpenSign™ Local QA");
  windowRef.localStorage.setItem("i18nextLng", "en");
  windowRef.localStorage.setItem("parseAppId", LOCAL_QA_APP_ID);
  windowRef.localStorage.setItem(
    "baseUrl",
    `${windowRef.location.origin}/api/app/`
  );
}

export function initializeLocalQaIdentity(
  windowRef = window,
  env = import.meta.env
) {
  if (
    !isLocalQaBuild(env, windowRef.location.hostname) ||
    windowRef.__OPENSIGN_LOCAL_QA_STORAGE_READY__ !== true
  )
    return false;

  const requestedMode = new URLSearchParams(windowRef.location.search).get(
    "localQaIdentity"
  );
  if (requestedMode === "off") {
    restorePreviousStorage(windowRef);
    return false;
  }

  const alreadyEnabled =
    windowRef.sessionStorage.getItem(MODE_KEY) === "enabled";
  if (requestedMode === "1" && !alreadyEnabled) {
    savePreviousStorage(windowRef);
    windowRef.sessionStorage.setItem(MODE_KEY, "enabled");
  }

  if (windowRef.sessionStorage.getItem(MODE_KEY) !== "enabled") return false;
  installLocalStorageIdentity(windowRef);
  return true;
}

export function isLocalQaIdentityEnabled(
  windowRef = window,
  env = import.meta.env
) {
  return (
    isLocalQaBuild(env, windowRef.location.hostname) &&
    windowRef.__OPENSIGN_LOCAL_QA_STORAGE_READY__ === true &&
    windowRef.sessionStorage.getItem(MODE_KEY) === "enabled"
  );
}

export function exitLocalQaIdentity(windowRef = window) {
  restorePreviousStorage(windowRef);
}

export function getLocalQaUser() {
  return { ...LOCAL_USER, className: "_User" };
}
