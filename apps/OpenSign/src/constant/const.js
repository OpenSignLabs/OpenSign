export const contactCls = "contracts_Contactbook";
export const templateCls = "contracts_Template";
export const documentCls = "contracts_Document";
export const themeColor = "#47a3ad";
export const iconColor = "#686968";
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const isEnableSubscription =
  process.env.REACT_APP_ENABLE_SUBSCRIPTION &&
  process.env.REACT_APP_ENABLE_SUBSCRIPTION?.toLowerCase() === "true"
    ? true
    : false;
export const isStaging =
  window.location.origin === "https://staging-app.opensignlabs.com";
export const isPublicProduction =
  window.location.origin === "https://opensign.me";
export const isPublicStaging =
  window.location.origin === "https://staging.opensign.me";
