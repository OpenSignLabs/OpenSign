import { getRuntimeConfig } from "./runtimeConfig";

const OPEN_SIGN_NAME = "OpenSign™";
const OPEN_SIGN_EMAIL_LOGO =
  "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
const OPEN_SIGN_EMAIL_ACCENT = "#47a3ad";

function resolveEmailLogoUrl(logoUrl, appUrl) {
  if (!logoUrl?.startsWith("/")) return logoUrl;

  const baseUrl = appUrl || globalThis.location?.origin;
  if (!baseUrl) return "";

  try {
    return new URL(logoUrl, baseUrl).href;
  } catch {
    return "";
  }
}

export function resolveMailBrandPresentation(storedAppName = "") {
  const runtimeConfig = getRuntimeConfig();
  const deploymentAppName = runtimeConfig.productName || OPEN_SIGN_NAME;
  const appName = storedAppName || deploymentAppName;
  const usesDeploymentBrand = appName === deploymentAppName;

  const configuredLogoUrl = usesDeploymentBrand
    ? runtimeConfig.assets.logoUrl ||
      (runtimeConfig.brandKey === "opensign" ? OPEN_SIGN_EMAIL_LOGO : "")
    : "";
  const logoUrl = resolveEmailLogoUrl(
    configuredLogoUrl,
    runtimeConfig.urls.app
  );

  const accentColor = runtimeConfig.theme.emailAccent || OPEN_SIGN_EMAIL_ACCENT;

  return { appName, logoUrl, accentColor };
}
