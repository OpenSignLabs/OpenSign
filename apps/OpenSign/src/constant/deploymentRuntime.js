const OPEN_SIGN_URLS = Object.freeze({
  github: "https://github.com/OpenSignLabs/OpenSign",
  docs: "https://docs.opensignlabs.com",
  support: "mailto:support@opensignlabs.com",
  terms: "https://www.opensignlabs.com/terms-and-conditions",
  privacy: "https://www.opensignlabs.com/privacy-policy",
  sandbox: "https://sandbox.opensignlabs.com"
});

const OPEN_SIGN_REGION_TARGETS = Object.freeze([
  { region: "global", url: "https://app.opensignlabs.com" },
  { region: "europe", url: "https://eu-app.opensignlabs.com" }
]);

const OPEN_SIGN_PUBLIC_PROFILES = Object.freeze({
  global: "https://opensign.me",
  europe: "https://eu.opensign.me",
  staging: "https://staging.opensign.me"
});

export function hasExplicitRuntimeConfig(value = window?.RUNTIME_CONFIG) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const normalizeRegionTargets = (targets) => {
  const seen = new Set();
  return targets.flatMap((target) => {
    try {
      const url = new URL(target.url);
      const normalized = { ...target, url: url.origin };
      const key = `${normalized.region}:${normalized.url}`;
      if (seen.has(key)) return [];
      seen.add(key);
      return [normalized];
    } catch {
      return [];
    }
  });
};

export function resolveRegionTargets(
  runtimeConfig,
  { explicit = false, origin = window.location.origin } = {}
) {
  if (runtimeConfig.regionTargets.length) {
    return normalizeRegionTargets(runtimeConfig.regionTargets);
  }
  if (explicit && runtimeConfig.brandKey !== "opensign") return [];

  if (!explicit) {
    try {
      const current = new URL(origin);
      if (current.hostname.startsWith("app.")) {
        return [
          { region: "global", url: current.origin },
          {
            region: "europe",
            url: `${current.protocol}//eu-app.${current.hostname.slice(4)}${
              current.port ? `:${current.port}` : ""
            }`
          }
        ];
      }
      if (current.hostname.startsWith("eu-app.")) {
        return [
          {
            region: "global",
            url: `${current.protocol}//app.${current.hostname.slice(7)}${
              current.port ? `:${current.port}` : ""
            }`
          },
          { region: "europe", url: current.origin }
        ];
      }
    } catch {
      // Invalid browser origins cannot become navigation targets.
    }
  }

  return OPEN_SIGN_REGION_TARGETS;
}

export function buildRegionNavigationUrl(
  targetUrl,
  location = window.location
) {
  if (!targetUrl) return "";
  const target = new URL(targetUrl);
  target.pathname = location.pathname || "/";
  target.search = location.search || "";
  target.hash = location.hash || "";
  return target.toString();
}

export function resolveRuntimeUrls(
  runtimeConfig,
  { explicit = false, origin = window.location.origin } = {}
) {
  const isOpenSign = runtimeConfig.brandKey === "opensign";
  const allowOpenSignFallback = !explicit || isOpenSign;
  const originRegion =
    origin === "https://eu-app.opensignlabs.com" ? "europe" : "global";
  const region = explicit ? runtimeConfig.region || originRegion : originRegion;
  const publicProfileFallback =
    origin === "https://staging-app.opensignlabs.com"
      ? OPEN_SIGN_PUBLIC_PROFILES.staging
      : OPEN_SIGN_PUBLIC_PROFILES[region] || OPEN_SIGN_PUBLIC_PROFILES.global;

  return {
    app: runtimeConfig.urls.app || (allowOpenSignFallback ? origin : ""),
    api: runtimeConfig.urls.api,
    publicProfile: runtimeConfig.features.publicProfiles
      ? runtimeConfig.urls.publicProfile ||
        (allowOpenSignFallback ? publicProfileFallback : "")
      : "",
    github:
      runtimeConfig.urls.github ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.github : ""),
    docs:
      runtimeConfig.urls.docs ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.docs : ""),
    support:
      runtimeConfig.urls.support ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.support : ""),
    terms:
      runtimeConfig.urls.terms ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.terms : ""),
    privacy:
      runtimeConfig.urls.privacy ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.privacy : ""),
    sandbox:
      runtimeConfig.urls.sandbox ||
      (allowOpenSignFallback ? OPEN_SIGN_URLS.sandbox : "")
  };
}

export function resolveRuntimeCapabilities(
  runtimeConfig,
  runtimeUrls,
  runtimeAuth,
  { explicit = false, openSignFirstParty = false } = {}
) {
  if (!explicit) {
    return {
      hostedSignup: openSignFirstParty,
      publicProfiles: openSignFirstParty,
      embedding: openSignFirstParty,
      googleAuth: openSignFirstParty,
      dropbox: openSignFirstParty,
      passkeys: openSignFirstParty,
      sso: openSignFirstParty,
      openSignDocs: openSignFirstParty,
      openSignSocials: openSignFirstParty,
      trialHandoff: false
    };
  }

  const isNonOpenSign = runtimeConfig.brandKey !== "opensign";
  return {
    hostedSignup:
      runtimeConfig.features.hostedSignup &&
      (!isNonOpenSign ||
        Boolean(
          runtimeUrls.app &&
            runtimeUrls.api &&
            runtimeUrls.terms &&
            runtimeUrls.privacy
        )),
    publicProfiles:
      runtimeConfig.features.publicProfiles &&
      Boolean(runtimeUrls.publicProfile),
    embedding: runtimeConfig.features.embedding,
    googleAuth:
      runtimeConfig.features.googleAuth &&
      Boolean(runtimeAuth.googleClientId && runtimeAuth.googleAuthCallbackUrl),
    dropbox:
      runtimeConfig.features.dropbox && Boolean(runtimeAuth.dropboxAppKey),
    passkeys:
      runtimeConfig.features.passkeys &&
      (!isNonOpenSign ||
        Boolean(
          runtimeAuth.webAuthnRpId && runtimeAuth.webAuthnOrigins.length
        )),
    sso:
      runtimeConfig.features.sso &&
      Boolean(
        runtimeAuth.ssoAuthorizationUrl &&
          runtimeAuth.ssoAudience &&
          runtimeAuth.ssoCallbackUrl
      ),
    openSignDocs:
      runtimeConfig.features.openSignDocs && Boolean(runtimeUrls.docs),
    openSignSocials: runtimeConfig.features.openSignSocials,
    trialHandoff:
      runtimeConfig.brandKey === "qiksign" &&
      runtimeConfig.features.trialHandoff
  };
}

export function resolveRuntimeLink(configuredBase, legacyUrl) {
  if (!configuredBase || !legacyUrl) return configuredBase || legacyUrl || "";

  try {
    const configured = new URL(configuredBase);
    const legacy = new URL(legacyUrl);
    configured.pathname = `${configured.pathname.replace(/\/$/, "")}${
      legacy.pathname
    }`;
    configured.search = legacy.search;
    configured.hash = legacy.hash;
    return configured.toString();
  } catch {
    return configuredBase;
  }
}
