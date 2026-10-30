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

export function renderMailBrandLogo({ appName, logoUrl }) {
  if (!logoUrl) return "";
  if (appName === OPEN_SIGN_NAME && logoUrl === OPEN_SIGN_EMAIL_LOGO) {
    return `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;">
  <tr>
    <td style="padding:10px 14px;background:#ffffff;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="padding-right:8px;">
            <table role="presentation" width="53" height="53" cellpadding="0" cellspacing="0" border="0" style="width:53px;height:53px;border:8px solid #0b326b;">
              <tr>
                <td align="center" valign="middle">
                  <table role="presentation" width="20" height="20" cellpadding="0" cellspacing="0" border="0" style="width:20px;height:20px;background:#0b326b;">
                    <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
          <td valign="middle">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:35px;line-height:38px;font-weight:700;letter-spacing:-1.5px;color:#080b10;">OpenSign</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;letter-spacing:.4px;color:#173d72;text-align:center;">Seal the Deal, Openly</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  }
  return `<div style='padding:10px'><img src='${logoUrl}' height='50' /></div>`;
}
