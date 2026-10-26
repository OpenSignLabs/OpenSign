export const LOCAL_QA_API_PREFIX = "/api/app";

const disabledFeatures = {
  hostedSignup: false,
  regionSelector: false,
  appSwitcher: false,
  publicProfiles: false,
  embedding: false,
  googleAuth: false,
  dropbox: false,
  passkeys: false,
  sso: false,
  openSignDocs: false,
  openSignSocials: false,
  trialHandoff: false
};

const LOCAL_QA_RUNTIME_CONFIG = {
  schemaVersion: 1,
  brandKey: "opensign",
  productName: "OpenSign™ Local QA",
  metaDescription: "",
  environment: "local-qa",
  region: "global",
  announcement: null,
  assets: {
    logoUrl: "",
    darkLogoUrl: "",
    faviconUrl: "",
    fontCssUrl: "",
    pdfFontUrl: ""
  },
  theme: { light: {}, dark: {}, emailAccent: "" },
  urls: {
    app: "",
    api: "",
    publicProfile: "",
    github: "",
    docs: "",
    support: "",
    terms: "",
    privacy: "",
    sandbox: ""
  },
  regionTargets: [],
  features: disabledFeatures,
  analytics: { gtmId: "", googleTagIds: [] },
  auth: {
    googleClientId: "",
    dropboxAppKey: "",
    googleAuthCallbackUrl: "",
    googleDriveCallbackUrl: "",
    ssoAuthorizationUrl: "",
    ssoAudience: "",
    ssoCallbackUrl: "",
    webAuthnRpId: "",
    webAuthnOrigins: []
  },
  billing: { provider: "zoho", catalogKey: "opensign" }
};

function localQaBootstrapScript() {
  return `(function () {
    var allowedHosts = ["localhost", "127.0.0.1", "::1"];
    if (!allowedHosts.includes(window.location.hostname)) return;
    window.RUNTIME_CONFIG = ${JSON.stringify(LOCAL_QA_RUNTIME_CONFIG)};
    try {
      var prefix = "opensign.local-qa-storage:";
      var backing = window.sessionStorage;
      var keys = function () {
        var result = [];
        for (var index = 0; index < backing.length; index += 1) {
          var key = backing.key(index);
          if (key && key.indexOf(prefix) === 0) result.push(key.slice(prefix.length));
        }
        return result;
      };
      var isolatedStorage = {
        get length() { return keys().length; },
        clear: function () { keys().forEach(function (key) { backing.removeItem(prefix + key); }); },
        getItem: function (key) { return backing.getItem(prefix + String(key)); },
        key: function (index) { return keys()[index] || null; },
        removeItem: function (key) { backing.removeItem(prefix + String(key)); },
        setItem: function (key, value) { backing.setItem(prefix + String(key), String(value)); }
      };
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        enumerable: true,
        value: isolatedStorage,
        writable: true
      });
      window.__OPENSIGN_LOCAL_QA_STORAGE_READY__ = true;
    } catch (error) {
      window.__OPENSIGN_LOCAL_QA_STORAGE_READY__ = false;
      console.error("Local QA storage isolation could not be enabled.", error);
    }
  })();`;
}

const READ_ONLY_CLOUD_FUNCTIONS = new Set(["getlogobydomain", "getReport"]);
const LOCAL_USER = Object.freeze({
  objectId: "local-qa-reviewer",
  username: "browser-qa@local.invalid",
  email: "browser-qa@local.invalid",
  name: "Browser QA Reviewer",
  emailVerified: true,
  sessionToken: "local-qa-visual-only",
  className: "_User"
});

export function isLoopbackHostHeader(hostHeader = "") {
  try {
    const hostname = new URL(`http://${hostHeader}`).hostname.toLowerCase();
    return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function response(status, body) {
  return { status, body };
}

export function resolveLocalQaApiResponse(method, requestUrl, hostHeader) {
  let url;
  try {
    url = new URL(requestUrl, "http://localhost");
  } catch {
    return null;
  }

  if (
    url.pathname !== LOCAL_QA_API_PREFIX &&
    !url.pathname.startsWith(`${LOCAL_QA_API_PREFIX}/`)
  ) {
    return null;
  }

  if (!isLoopbackHostHeader(hostHeader)) {
    return response(403, {
      code: 119,
      error: "Local QA API only accepts loopback requests."
    });
  }

  const path = url.pathname.slice(LOCAL_QA_API_PREFIX.length) || "/";
  const normalizedMethod = String(method || "GET").toUpperCase();

  if (normalizedMethod === "GET" && path.startsWith("/classes/")) {
    if (path === `/classes/_User/${LOCAL_USER.objectId}`) {
      return response(200, LOCAL_USER);
    }
    return response(200, { results: [], count: 0 });
  }

  if (normalizedMethod === "POST" && path.startsWith("/functions/")) {
    const functionName = path.slice("/functions/".length);
    if (READ_ONLY_CLOUD_FUNCTIONS.has(functionName)) {
      return response(200, {
        result: functionName === "getReport" ? [] : null
      });
    }
  }

  return response(403, {
    code: 119,
    error:
      "Local QA identity is visual-only. API writes and unsupported requests are disabled."
  });
}

export function localQaApiPlugin() {
  return {
    name: "opensign-local-qa-api",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler() {
        return [
          {
            tag: "script",
            attrs: {},
            children: localQaBootstrapScript(),
            injectTo: "head-prepend"
          }
        ];
      }
    },
    configureServer(server) {
      server.middlewares.use((request, result, next) => {
        const apiResponse = resolveLocalQaApiResponse(
          request.method,
          request.url,
          request.headers.host
        );
        if (!apiResponse) return next();

        result.statusCode = apiResponse.status;
        result.setHeader("Content-Type", "application/json; charset=utf-8");
        result.setHeader("Cache-Control", "no-store");
        result.end(JSON.stringify(apiResponse.body));
      });
    }
  };
}
