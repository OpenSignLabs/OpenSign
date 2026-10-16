import { z } from "zod";

const emptyOrHttpUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Expected an absolute HTTP(S) URL");

const emptyOrAssetUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value ||
      value.startsWith("/") ||
      emptyOrHttpUrl.safeParse(value).success,
    "Expected an absolute HTTP(S) URL or root-relative path"
  );
const emptyOrSupportUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value ||
      value.startsWith("mailto:") ||
      emptyOrHttpUrl.safeParse(value).success,
    "Expected an absolute HTTP(S) URL or mailto link"
  );

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[\da-f]{3}|[\da-f]{6})$/i, "Expected a hexadecimal color");
const googleTagId = z
  .string()
  .trim()
  .regex(/^(?:G|AW|GT)-[A-Z0-9]+$/i, "Expected a Google tag ID");
const googleTagManagerId = z
  .string()
  .trim()
  .regex(/^GTM-[A-Z0-9]+$/i, "Expected a Google Tag Manager ID");

export const OPEN_SIGN_RUNTIME_CONFIG = Object.freeze({
  schemaVersion: 1,
  brandKey: "opensign",
  productName: "OpenSign™",
  metaDescription: "",
  environment: "production",
  region: "global",
  announcement: null,
  assets: {
    logoUrl: "",
    darkLogoUrl: "",
    faviconUrl: "",
    fontCssUrl: "https://cdn.opensignlabs.com/fonts.css",
    pdfFontUrl: "https://cdn.opensignlabs.com/webfonts/times.ttf"
  },
  theme: {
    light: {},
    dark: {},
    emailAccent: ""
  },
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
  features: {
    hostedSignup: true,
    regionSelector: true,
    appSwitcher: true,
    publicProfiles: true,
    embedding: true,
    googleAuth: true,
    dropbox: true,
    passkeys: true,
    sso: true,
    openSignDocs: true,
    openSignSocials: true,
    trialHandoff: false
  },
  analytics: {
    gtmId: "",
    googleTagIds: ["G-BHNNETZRTY", "AW-17487135887"]
  },
  auth: {
    googleClientId: "",
    dropboxAppKey: "",
    googleAuthCallbackUrl: "",
    googleDriveCallbackUrl: "",
    ssoAuthorizationUrl: "https://sso.opensignlabs.com/api/oauth/authorize",
    ssoAudience: "OpenSign",
    ssoCallbackUrl: "",
    webAuthnRpId: "",
    webAuthnOrigins: []
  },
  billing: {
    provider: "zoho",
    catalogKey: "opensign"
  }
});

const DISABLED_RUNTIME_FEATURES = Object.freeze(
  Object.fromEntries(
    Object.keys(OPEN_SIGN_RUNTIME_CONFIG.features).map((feature) => [
      feature,
      false
    ])
  )
);

const DISABLED_RUNTIME_ANALYTICS = Object.freeze({
  gtmId: "",
  googleTagIds: []
});

const DISABLED_RUNTIME_ASSETS = Object.freeze({
  logoUrl: "",
  darkLogoUrl: "",
  faviconUrl: "",
  fontCssUrl: "",
  pdfFontUrl: ""
});

const DISABLED_RUNTIME_AUTH = Object.freeze({
  googleClientId: "",
  dropboxAppKey: "",
  googleAuthCallbackUrl: "",
  googleDriveCallbackUrl: "",
  ssoAuthorizationUrl: "",
  ssoAudience: "",
  ssoCallbackUrl: "",
  webAuthnRpId: "",
  webAuthnOrigins: []
});

const createRuntimeConfigSchema = (
  recoverInvalidValues,
  featureDefaults = OPEN_SIGN_RUNTIME_CONFIG.features,
  analyticsDefaults = OPEN_SIGN_RUNTIME_CONFIG.analytics,
  authDefaults = OPEN_SIGN_RUNTIME_CONFIG.auth,
  assetDefaults = OPEN_SIGN_RUNTIME_CONFIG.assets
) => {
  const withFallback = (schema, fallback) =>
    recoverInvalidValues ? schema.catch(fallback) : schema;

  const assets = z
    .object({
      logoUrl: withFallback(emptyOrAssetUrl, assetDefaults.logoUrl).default(
        assetDefaults.logoUrl
      ),
      darkLogoUrl: withFallback(
        emptyOrAssetUrl,
        assetDefaults.darkLogoUrl
      ).default(assetDefaults.darkLogoUrl),
      faviconUrl: withFallback(
        emptyOrAssetUrl,
        assetDefaults.faviconUrl
      ).default(assetDefaults.faviconUrl),
      fontCssUrl: withFallback(
        emptyOrAssetUrl,
        assetDefaults.fontCssUrl
      ).default(assetDefaults.fontCssUrl),
      pdfFontUrl: withFallback(
        emptyOrAssetUrl,
        assetDefaults.pdfFontUrl
      ).default(assetDefaults.pdfFontUrl)
    })
    .strip();
  const theme = z
    .object({
      light: withFallback(z.record(z.string(), hexColor), {}).default({}),
      dark: withFallback(z.record(z.string(), hexColor), {}).default({}),
      emailAccent: withFallback(hexColor.or(z.literal("")), "").default("")
    })
    .strip();
  const urls = z
    .object({
      app: withFallback(emptyOrHttpUrl, "").default(""),
      api: withFallback(emptyOrHttpUrl, "").default(""),
      publicProfile: withFallback(emptyOrHttpUrl, "").default(""),
      github: withFallback(emptyOrHttpUrl, "").default(""),
      docs: withFallback(emptyOrHttpUrl, "").default(""),
      support: withFallback(emptyOrSupportUrl, "").default(""),
      terms: withFallback(emptyOrHttpUrl, "").default(""),
      privacy: withFallback(emptyOrHttpUrl, "").default(""),
      sandbox: withFallback(emptyOrHttpUrl, "").default("")
    })
    .strip();
  const regionTarget = z
    .object({
      region: slug,
      url: emptyOrHttpUrl.refine(Boolean, "URL is required")
    })
    .strip();
  const features = z
    .object({
      hostedSignup: withFallback(
        z.boolean(),
        featureDefaults.hostedSignup
      ).default(featureDefaults.hostedSignup),
      regionSelector: withFallback(
        z.boolean(),
        featureDefaults.regionSelector
      ).default(featureDefaults.regionSelector),
      appSwitcher: withFallback(
        z.boolean(),
        featureDefaults.appSwitcher
      ).default(featureDefaults.appSwitcher),
      publicProfiles: withFallback(
        z.boolean(),
        featureDefaults.publicProfiles
      ).default(featureDefaults.publicProfiles),
      embedding: withFallback(z.boolean(), featureDefaults.embedding).default(
        featureDefaults.embedding
      ),
      googleAuth: withFallback(z.boolean(), featureDefaults.googleAuth).default(
        featureDefaults.googleAuth
      ),
      dropbox: withFallback(z.boolean(), featureDefaults.dropbox).default(
        featureDefaults.dropbox
      ),
      passkeys: withFallback(z.boolean(), featureDefaults.passkeys).default(
        featureDefaults.passkeys
      ),
      sso: withFallback(z.boolean(), featureDefaults.sso).default(
        featureDefaults.sso
      ),
      openSignDocs: withFallback(
        z.boolean(),
        featureDefaults.openSignDocs
      ).default(featureDefaults.openSignDocs),
      openSignSocials: withFallback(
        z.boolean(),
        featureDefaults.openSignSocials
      ).default(featureDefaults.openSignSocials),
      trialHandoff: withFallback(
        z.boolean(),
        featureDefaults.trialHandoff
      ).default(featureDefaults.trialHandoff)
    })
    .strip();
  const analytics = z
    .object({
      gtmId: withFallback(
        googleTagManagerId.or(z.literal("")),
        analyticsDefaults.gtmId
      ).default(analyticsDefaults.gtmId),
      googleTagIds: withFallback(
        z.array(googleTagId),
        analyticsDefaults.googleTagIds
      ).default(analyticsDefaults.googleTagIds)
    })
    .strip();
  const auth = z
    .object({
      googleClientId: withFallback(
        z.string().trim(),
        authDefaults.googleClientId
      ).default(authDefaults.googleClientId),
      dropboxAppKey: withFallback(
        z.string().trim(),
        authDefaults.dropboxAppKey
      ).default(authDefaults.dropboxAppKey),
      googleAuthCallbackUrl: withFallback(
        emptyOrHttpUrl,
        authDefaults.googleAuthCallbackUrl
      ).default(authDefaults.googleAuthCallbackUrl),
      googleDriveCallbackUrl: withFallback(
        emptyOrHttpUrl,
        authDefaults.googleDriveCallbackUrl
      ).default(authDefaults.googleDriveCallbackUrl),
      ssoAuthorizationUrl: withFallback(
        emptyOrHttpUrl,
        authDefaults.ssoAuthorizationUrl
      ).default(authDefaults.ssoAuthorizationUrl),
      ssoAudience: withFallback(
        z.string().trim().max(120),
        authDefaults.ssoAudience
      ).default(authDefaults.ssoAudience),
      ssoCallbackUrl: withFallback(
        emptyOrHttpUrl,
        authDefaults.ssoCallbackUrl
      ).default(authDefaults.ssoCallbackUrl),
      webAuthnRpId: withFallback(
        z.string().trim().max(253),
        authDefaults.webAuthnRpId
      ).default(authDefaults.webAuthnRpId),
      webAuthnOrigins: withFallback(
        z.array(emptyOrHttpUrl.refine(Boolean, "Origin is required")),
        authDefaults.webAuthnOrigins
      ).default(authDefaults.webAuthnOrigins)
    })
    .strip();
  const billing = z
    .object({
      provider: withFallback(z.enum(["zoho", "stripe"]), "zoho").default(
        "zoho"
      ),
      catalogKey: withFallback(slug, "opensign").default("opensign")
    })
    .strip();
  const announcementTranslation = z
    .object({
      message: z.string().trim().min(1).max(1000),
      actionLabel: z.string().trim().max(120).default("")
    })
    .strip();
  const announcement = z
    .object({
      version: z.string().trim().min(1).max(80),
      autoDismissMs: z.number().int().min(0).max(300000).default(20000),
      action: z
        .enum(["preferences-security", "subscription", "none"])
        .default("preferences-security"),
      translations: z
        .record(
          z
            .string()
            .trim()
            .regex(/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i),
          announcementTranslation
        )
        .refine(
          (translations) => Object.keys(translations).length > 0,
          "At least one translation is required"
        )
    })
    .strip();

  return z
    .object({
      schemaVersion: z.literal(1),
      brandKey: withFallback(slug, "opensign").default("opensign"),
      productName: withFallback(
        z.string().trim().min(1).max(80),
        "OpenSign™"
      ).default("OpenSign™"),
      metaDescription: withFallback(z.string().trim().max(240), "").default(""),
      environment: withFallback(slug, "production").default("production"),
      region: withFallback(slug, "global").default("global"),
      announcement: withFallback(announcement.nullable(), null).default(null),
      assets: withFallback(assets, assetDefaults).default(assetDefaults),
      theme: withFallback(theme, OPEN_SIGN_RUNTIME_CONFIG.theme).default(
        OPEN_SIGN_RUNTIME_CONFIG.theme
      ),
      urls: withFallback(urls, OPEN_SIGN_RUNTIME_CONFIG.urls).default(
        OPEN_SIGN_RUNTIME_CONFIG.urls
      ),
      regionTargets: withFallback(z.array(regionTarget), []).default([]),
      features: withFallback(features, featureDefaults).default(
        featureDefaults
      ),
      analytics: withFallback(analytics, analyticsDefaults).default(
        analyticsDefaults
      ),
      auth: withFallback(auth, authDefaults).default(authDefaults),
      billing: withFallback(billing, OPEN_SIGN_RUNTIME_CONFIG.billing).default(
        OPEN_SIGN_RUNTIME_CONFIG.billing
      )
    })
    .strip();
};

const strictOpenSignRuntimeConfigSchema = createRuntimeConfigSchema(false);
const recoverableOpenSignRuntimeConfigSchema = createRuntimeConfigSchema(true);
const strictNonOpenSignRuntimeConfigSchema = createRuntimeConfigSchema(
  false,
  DISABLED_RUNTIME_FEATURES,
  DISABLED_RUNTIME_ANALYTICS,
  DISABLED_RUNTIME_AUTH,
  DISABLED_RUNTIME_ASSETS
);
const recoverableNonOpenSignRuntimeConfigSchema = createRuntimeConfigSchema(
  true,
  DISABLED_RUNTIME_FEATURES,
  DISABLED_RUNTIME_ANALYTICS,
  DISABLED_RUNTIME_AUTH,
  DISABLED_RUNTIME_ASSETS
);

const cloneOpenSignDefaults = () =>
  recoverableOpenSignRuntimeConfigSchema.parse({ schemaVersion: 1 });

const safeNonOpenSignBrandKey = (value) =>
  slug.safeParse(value).success ? value.trim() : "invalid-profile";

const withSafeNonOpenSignIdentity = (config, value) => ({
  ...config,
  brandKey: safeNonOpenSignBrandKey(value?.brandKey),
  productName:
    typeof value?.productName === "string" && value.productName.trim()
      ? value.productName.trim().slice(0, 80)
      : safeNonOpenSignBrandKey(value?.brandKey)
});

const cloneNonOpenSignDefaults = (value) =>
  withSafeNonOpenSignIdentity(
    recoverableNonOpenSignRuntimeConfigSchema.parse({ schemaVersion: 1 }),
    value
  );

export function resolveRuntimeConfig(value, onDiagnostic = console.warn) {
  if (value === undefined || value === null) {
    return cloneOpenSignDefaults();
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    onDiagnostic("Invalid runtime configuration; using OpenSign defaults", {
      paths: ["schemaVersion"]
    });
    return cloneOpenSignDefaults();
  }

  const isOpenSignProfile =
    value.brandKey === undefined || value.brandKey === "opensign";
  if (value.schemaVersion !== 1) {
    onDiagnostic("Invalid runtime configuration; using safe defaults", {
      paths: ["schemaVersion"]
    });
    return isOpenSignProfile
      ? cloneOpenSignDefaults()
      : cloneNonOpenSignDefaults(value);
  }

  const strictSchema = isOpenSignProfile
    ? strictOpenSignRuntimeConfigSchema
    : strictNonOpenSignRuntimeConfigSchema;
  const recoverableSchema = isOpenSignProfile
    ? recoverableOpenSignRuntimeConfigSchema
    : recoverableNonOpenSignRuntimeConfigSchema;
  const strictResult = strictSchema.safeParse(value);
  if (strictResult.success) {
    return isOpenSignProfile
      ? strictResult.data
      : withSafeNonOpenSignIdentity(strictResult.data, value);
  }

  onDiagnostic("Invalid runtime configuration values used defaults", {
    paths: [
      ...new Set(strictResult.error.issues.map((issue) => issue.path.join(".")))
    ]
  });
  const recovered = recoverableSchema.parse(value);
  return isOpenSignProfile
    ? recovered
    : withSafeNonOpenSignIdentity(recovered, value);
}

export function getRuntimeConfig(onDiagnostic) {
  return resolveRuntimeConfig(window?.RUNTIME_CONFIG, onDiagnostic);
}

export function getRuntimePdfFontUrl(onDiagnostic) {
  return getRuntimeConfig(onDiagnostic).assets.pdfFontUrl;
}
