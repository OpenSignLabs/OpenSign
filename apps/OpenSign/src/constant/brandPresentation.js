import { getRuntimeConfig } from "./runtimeConfig";

export const BRAND_PRESENTATION_EVENT = "opensign:brand-presentation-change";

const BRAND_SOURCE_KEY = "brandSource";
const RESOLVED_BRAND_SOURCES = new Set(["deployment", "tenant"]);
const OPEN_SIGN_SIDEBAR_BRAND_NAME = "OpenSign";
const OPEN_SIGN_PRODUCT_NAME = "OpenSign™";

const THEME_VARIABLES = {
  primary: "--p",
  "primary-content": "--pc",
  primaryContent: "--pc",
  secondary: "--s",
  "secondary-content": "--sc",
  secondaryContent: "--sc",
  accent: "--a",
  "accent-content": "--ac",
  accentContent: "--ac",
  neutral: "--n",
  "neutral-content": "--nc",
  neutralContent: "--nc",
  "base-100": "--b1",
  base100: "--b1",
  "base-200": "--b2",
  base200: "--b2",
  "base-300": "--b3",
  base300: "--b3",
  "base-content": "--bc",
  baseContent: "--bc",
  info: "--in",
  "info-content": "--inc",
  infoContent: "--inc",
  success: "--su",
  "success-content": "--suc",
  successContent: "--suc",
  warning: "--wa",
  "warning-content": "--wac",
  warningContent: "--wac",
  error: "--er",
  "error-content": "--erc",
  errorContent: "--erc"
};

const toLinearRgb = (channel) =>
  channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);

export function hexToOklchChannels(value) {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value?.trim());
  if (!match) return "";

  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((character) => character + character)
          .join("")
      : match[1];
  const red = toLinearRgb(parseInt(hex.slice(0, 2), 16) / 255);
  const green = toLinearRgb(parseInt(hex.slice(2, 4), 16) / 255);
  const blue = toLinearRgb(parseInt(hex.slice(4, 6), 16) / 255);
  const linearLightness =
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const linearMedium =
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const linearShort =
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  const lightnessRoot = Math.cbrt(linearLightness);
  const mediumRoot = Math.cbrt(linearMedium);
  const shortRoot = Math.cbrt(linearShort);
  const lightness =
    0.2104542553 * lightnessRoot +
    0.793617785 * mediumRoot -
    0.0040720468 * shortRoot;
  const axisA =
    1.9779984951 * lightnessRoot -
    2.428592205 * mediumRoot +
    0.4505937099 * shortRoot;
  const axisB =
    0.0259040371 * lightnessRoot +
    0.7827717662 * mediumRoot -
    0.808675766 * shortRoot;
  const chroma = Math.sqrt(axisA * axisA + axisB * axisB);
  const hue = (Math.atan2(axisB, axisA) * 180) / Math.PI;

  return `${(lightness * 100).toFixed(4)}% ${chroma.toFixed(6)} ${(hue < 0
    ? hue + 360
    : hue
  ).toFixed(4)}`;
}

const themeCss = (selector, theme) => {
  const declarations = Object.entries(theme).flatMap(([key, value]) => {
    const variable = THEME_VARIABLES[key];
    const channels = hexToOklchChannels(value);
    return variable && channels ? [`${variable}:${channels}`] : [];
  });
  return declarations.length ? `${selector}{${declarations.join(";")}}` : "";
};

const notifyBrandChange = () => {
  window.dispatchEvent(new Event(BRAND_PRESENTATION_EVENT));
};

export function getSidebarNavigationLabel(runtimeConfig) {
  try {
    const configuredProductName = (runtimeConfig ?? getRuntimeConfig())
      ?.productName;
    const productName =
      typeof configuredProductName === "string"
        ? configuredProductName.trim()
        : "";
    const brandName =
      productName && productName !== OPEN_SIGN_PRODUCT_NAME
        ? productName
        : OPEN_SIGN_SIDEBAR_BRAND_NAME;

    return `${brandName} Sidebar Navigation`;
  } catch {
    return `${OPEN_SIGN_SIDEBAR_BRAND_NAME} Sidebar Navigation`;
  }
}

export function persistBrandPresentation(brand, source) {
  const values = {
    appname: brand.appName,
    appLogo: brand.logo,
    appLogoDark: brand.darkLogo,
    favicon: brand.favicon
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value);
    } else if (key === "appLogoDark") {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem(BRAND_SOURCE_KEY, source);
  notifyBrandChange();
}

export function initializeAppInfoBrand(appInfo) {
  if (RESOLVED_BRAND_SOURCES.has(localStorage.getItem(BRAND_SOURCE_KEY))) {
    return;
  }

  persistBrandPresentation(
    {
      appName: localStorage.getItem("appname") || "OpenSign™",
      logo: appInfo.applogo,
      favicon: appInfo.fev_Icon
    },
    "default"
  );
}

export function applyRuntimeFont(runtimeConfig = getRuntimeConfig()) {
  const fontId = "deployment-brand-font";
  let font = document.getElementById(fontId);
  if (runtimeConfig.assets.fontCssUrl) {
    if (!font) {
      font = document.createElement("link");
      font.id = fontId;
      font.rel = "stylesheet";
      document.head.appendChild(font);
    }
    font.href = runtimeConfig.assets.fontCssUrl;
    font.onerror = () => font.remove();
  } else {
    font?.remove();
  }
}

export function applyDeploymentBranding(
  appInfo,
  runtimeConfig = getRuntimeConfig()
) {
  document.documentElement.setAttribute(
    "data-brand",
    runtimeConfig.brandKey || "opensign"
  );
  persistBrandPresentation(
    {
      appName: runtimeConfig.productName,
      logo: runtimeConfig.assets.logoUrl || appInfo.applogo,
      darkLogo: runtimeConfig.assets.darkLogoUrl,
      favicon: runtimeConfig.assets.faviconUrl || appInfo.fev_Icon
    },
    "deployment"
  );

  const styleId = "deployment-brand-theme";
  const css = [
    themeCss('[data-theme="opensigncss"]', runtimeConfig.theme.light),
    themeCss('[data-theme="opensigndark"]', runtimeConfig.theme.dark)
  ].join("");
  let style = document.getElementById(styleId);
  if (css) {
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = css;
  } else {
    style?.remove();
  }
  applyRuntimeFont(runtimeConfig);
}

const validateImage = (url, ImageConstructor) => {
  if (!url) return Promise.resolve(false);

  return new Promise((resolve) => {
    const image = new ImageConstructor();
    image.onload = () =>
      resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
    image.onerror = () => resolve(false);
    image.src = url;
  });
};

export async function validateDeploymentAssets(
  appInfo,
  runtimeConfig = getRuntimeConfig(),
  ImageConstructor = window.Image
) {
  const [logoValid, darkLogoValid, faviconValid] = await Promise.all([
    validateImage(runtimeConfig.assets.logoUrl, ImageConstructor),
    validateImage(runtimeConfig.assets.darkLogoUrl, ImageConstructor),
    validateImage(runtimeConfig.assets.faviconUrl, ImageConstructor)
  ]);

  if (localStorage.getItem(BRAND_SOURCE_KEY) !== "deployment") return;

  persistBrandPresentation(
    {
      appName: runtimeConfig.productName,
      logo: logoValid ? runtimeConfig.assets.logoUrl : appInfo.applogo,
      darkLogo: darkLogoValid ? runtimeConfig.assets.darkLogoUrl : "",
      favicon: faviconValid ? runtimeConfig.assets.faviconUrl : appInfo.fev_Icon
    },
    "deployment"
  );
}

export function getBrowserMetadata(runtimeConfig = getRuntimeConfig()) {
  return {
    metaDescription: runtimeConfig.metaDescription,
    themeColor: runtimeConfig.theme.light.primary || "#000000",
    backgroundColor:
      runtimeConfig.theme.light["base-100"] ||
      runtimeConfig.theme.light.base100 ||
      "#ffffff"
  };
}
