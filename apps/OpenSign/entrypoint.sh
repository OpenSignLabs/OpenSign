#!/bin/sh

ENV_FILE=./build/env.js
DOTENV_FILE=./.env.prod
ENTRYPOINT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

echo "Generating runtime env file at $ENV_FILE..."

ENV_FILE="$ENV_FILE" DOTENV_FILE="$DOTENV_FILE" ENTRYPOINT_DIR="$ENTRYPOINT_DIR" node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const runtimeKeys = [
  "APP_LOGIN_ILLUSTRATION_URL",
  "REACT_APP_SERVERURL",
  "REACT_APP_LOGO_URL",
  "REACT_APP_SHOW_REGION_SELECTOR",
  "REACT_APP_SHOW_APP_SWITCHER",
  "REACT_APP_EIDEASY_CLIENT_ID",
  "REACT_APP_EIDEASY_BASE_URL",
];

const deploymentProfileFiles = Object.freeze({
  "qiksign-v1": "qiksign-v1.json"
});

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return env;

    const separator = trimmed.indexOf("=");
    if (separator < 1) return env;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
    return env;
  }, {});
}

const dotenv = readDotEnv(process.env.DOTENV_FILE);
const encodedRuntimeConfig =
  process.env.APP_RUNTIME_CONFIG_BASE64 || dotenv.APP_RUNTIME_CONFIG_BASE64 || "";
let runtimeConfig = null;
let runtimeConfigOverride = null;

const pick = (value, keys) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    keys.filter((key) => Object.hasOwn(value, key)).map((key) => [key, value[key]])
  );
};

const themeKeys = [
  "primary",
  "primary-content",
  "secondary",
  "secondary-content",
  "accent",
  "accent-content",
  "neutral",
  "neutral-content",
  "base-100",
  "base-200",
  "base-300",
  "base-content",
  "info",
  "info-content",
  "success",
  "success-content",
  "warning",
  "warning-content",
  "error",
  "error-content"
];

function sanitizeRuntimeConfig(value) {
  const sanitized = pick(value, [
    "schemaVersion",
    "brandKey",
    "productName",
    "metaDescription",
    "environment",
    "region",
    "announcement",
    "assets",
    "theme",
    "urls",
    "regionTargets",
    "features",
    "analytics",
    "auth",
    "billing"
  ]);
  if (sanitized.announcement && typeof sanitized.announcement === "object") {
    sanitized.announcement = pick(sanitized.announcement, [
      "version",
      "autoDismissMs",
      "action",
      "translations"
    ]);
    if (
      sanitized.announcement.translations &&
      typeof sanitized.announcement.translations === "object" &&
      !Array.isArray(sanitized.announcement.translations)
    ) {
      sanitized.announcement.translations = Object.fromEntries(
        Object.entries(sanitized.announcement.translations).map(([locale, translation]) => [
          locale,
          pick(translation, ["message", "actionLabel"])
        ])
      );
    }
  }
  sanitized.assets = pick(sanitized.assets, [
    "logoUrl",
    "darkLogoUrl",
    "faviconUrl",
    "fontCssUrl",
    "pdfFontUrl"
  ]);
  if (sanitized.theme && typeof sanitized.theme === "object") {
    sanitized.theme = pick(sanitized.theme, ["light", "dark", "emailAccent"]);
    sanitized.theme.light = pick(sanitized.theme.light, themeKeys);
    sanitized.theme.dark = pick(sanitized.theme.dark, themeKeys);
  }
  sanitized.urls = pick(sanitized.urls, [
    "app",
    "api",
    "publicProfile",
    "docs",
    "support",
    "terms",
    "privacy",
    "sandbox"
  ]);
  if (Array.isArray(sanitized.regionTargets)) {
    sanitized.regionTargets = sanitized.regionTargets.map((target) =>
      pick(target, ["region", "url"])
    );
  }
  sanitized.features = pick(sanitized.features, [
    "hostedSignup",
    "regionSelector",
    "appSwitcher",
    "publicProfiles",
    "embedding",
    "googleAuth",
    "dropbox",
    "passkeys",
    "sso",
    "openSignDocs",
    "openSignSocials",
    "trialHandoff"
  ]);
  sanitized.analytics = pick(sanitized.analytics, ["gtmId", "googleTagIds"]);
  sanitized.auth = pick(sanitized.auth, [
    "googleClientId",
    "dropboxAppKey",
    "googleAuthCallbackUrl",
    "googleDriveCallbackUrl",
    "ssoAuthorizationUrl",
    "ssoAudience",
    "ssoCallbackUrl",
    "webAuthnRpId",
    "webAuthnOrigins"
  ]);
  sanitized.billing = pick(sanitized.billing, ["provider", "catalogKey"]);
  return sanitized;
}

function readDeploymentProfile(profileKey) {
  const fileName = deploymentProfileFiles[profileKey];
  if (!fileName) {
    throw new Error(`Unknown APP_DEPLOYMENT_PROFILE: ${profileKey}`);
  }

  const entrypointDirectory = process.env.ENTRYPOINT_DIR;
  const candidates = [
    path.join(entrypointDirectory, "ee", "brandProfiles", fileName),
    path.resolve(entrypointDirectory, "..", "ee", "brandProfiles", fileName)
  ];
  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) {
    throw new Error(`Bundled deployment profile file is missing: ${fileName}`);
  }

  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (
    value?.schemaVersion !== 1 ||
    value?.profileKey !== profileKey ||
    typeof value?.brandKey !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.brandKey) ||
    !value.frontend ||
    typeof value.frontend !== "object" ||
    Array.isArray(value.frontend) ||
    !value.server ||
    typeof value.server !== "object" ||
    Array.isArray(value.server) ||
    !value.billing ||
    typeof value.billing !== "object" ||
    Array.isArray(value.billing) ||
    value.frontend.schemaVersion !== 1 ||
    value.frontend.brandKey !== value.brandKey ||
    !["zoho", "stripe"].includes(value.billing.provider) ||
    typeof value.billing.catalogKey !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.billing.catalogKey) ||
    value.frontend.billing?.provider !== value.billing.provider ||
    value.frontend.billing?.catalogKey !== value.billing.catalogKey
  ) {
    throw new Error(`Bundled deployment profile is invalid: ${profileKey}`);
  }
  return value;
}

function mergeRuntimeConfig(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  return Object.fromEntries(
    [...new Set([...Object.keys(base || {}), ...Object.keys(override)])].map((key) => {
      const baseValue = base?.[key];
      if (!Object.hasOwn(override, key)) return [key, baseValue];
      const overrideValue = override[key];
      if (overrideValue === undefined) return [key, baseValue];
      const mergeObjects =
        baseValue &&
        overrideValue &&
        typeof baseValue === "object" &&
        typeof overrideValue === "object" &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue);
      return [key, mergeObjects ? mergeRuntimeConfig(baseValue, overrideValue) : overrideValue];
    })
  );
}

if (encodedRuntimeConfig) {
  try {
    const encoded = encodedRuntimeConfig.trim();
    if (!encoded || encoded.length > 150_000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
      throw new Error("expected unpadded Base64URL data");
    }
    const rawRuntimeConfig = Buffer.from(encoded, "base64url").toString("utf8");
    if (Buffer.from(rawRuntimeConfig, "utf8").toString("base64url") !== encoded) {
      throw new Error("Base64URL value is not canonical UTF-8");
    }
    const parsed = JSON.parse(rawRuntimeConfig);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("expected a JSON object");
    }
    runtimeConfigOverride = sanitizeRuntimeConfig(parsed);
  } catch (error) {
    console.warn(`Ignoring invalid APP_RUNTIME_CONFIG_BASE64: ${error.message}`);
  }
}

const deploymentProfileKey = (
  process.env.APP_DEPLOYMENT_PROFILE ||
  dotenv.APP_DEPLOYMENT_PROFILE ||
  ""
)
  .trim()
  .toLowerCase();
let deploymentProfile = null;
if (deploymentProfileKey) {
  deploymentProfile = readDeploymentProfile(deploymentProfileKey);
  const configuredBrandKey = (process.env.APP_BRAND_KEY || dotenv.APP_BRAND_KEY || "")
    .trim()
    .toLowerCase();
  if (configuredBrandKey && configuredBrandKey !== deploymentProfile.brandKey) {
    throw new Error("APP_BRAND_KEY does not match APP_DEPLOYMENT_PROFILE");
  }
  if (
    runtimeConfigOverride?.brandKey &&
    runtimeConfigOverride.brandKey !== deploymentProfile.brandKey
  ) {
    throw new Error("APP_RUNTIME_CONFIG_BASE64 brandKey does not match APP_DEPLOYMENT_PROFILE");
  }
  runtimeConfig = mergeRuntimeConfig(
    sanitizeRuntimeConfig(deploymentProfile.frontend),
    runtimeConfigOverride
  );
} else {
  runtimeConfig = runtimeConfigOverride;
}

const runtimeEnv = Object.fromEntries(
  runtimeKeys.map((key) => [
    key,
    process.env[key] ||
      dotenv[key] ||
      (key === "APP_LOGIN_ILLUSTRATION_URL"
        ? deploymentProfile?.frontend?.loginIllustrationUrl
        : "") ||
      ""
  ])
);

const output = [
  `window.RUNTIME_ENV = ${JSON.stringify(runtimeEnv)};`,
  `window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};`,
  ""
].join("\n");

fs.mkdirSync(path.dirname(process.env.ENV_FILE), { recursive: true });
fs.writeFileSync(process.env.ENV_FILE, output);
NODE

runtime_config_status=$?
if [ "$runtime_config_status" -ne 0 ]; then
  exit "$runtime_config_status"
fi

exec "$@"
