import logo from "../assets/images/logo.png";

export function serverUrl_fn() {
  let baseUrl = process.env.REACT_APP_SERVERURL
    ? process.env.REACT_APP_SERVERURL
    : window.location.origin + "/api/app";
  return baseUrl;
}
export const appInfo = {
  applogo: logo,
  appId: process.env.REACT_APP_APPID ? process.env.REACT_APP_APPID : "opensign",
  baseUrl: serverUrl_fn(),
  defaultRole: "contracts_User",
  fbAppId: process.env.REACT_APP_FBAPPID
    ? `${process.env.REACT_APP_FBAPPID}`
    : "",
  fev_Icon:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAALlJREFUaEPtmN0NwjAMBpNxYDKYiM1Yp90g93CKStH1NbIdfz921Dker2Pc+Js1cDF7MXAxASMGYkAigBI6vh9ZwoXP53uZoAYcvhwdA3mAVbI2aSb+9zFKU4IURB6j/HoPUIEa2G3iGIAhQQDlAUIoE2diabIklISS0NoFPebo77RF6OenEF3QntOm128he0GKrwHyACFoz2MgBqSGkpAEcHs47oHtN5AFakACqMNjQEMoE8SABFCHn4HE2zGHSLeEAAAAAElFTkSuQmCC",
  googleClietId: process.env.REACT_APP_GOOGLECLIENTID
    ? `${process.env.REACT_APP_GOOGLECLIENTID}`
    : "",
  metaDescription:
    "The fastest way to sign PDFs & request signatures from others.",
  settings: [
    {
      role: "contracts_Admin",
      menuId: "VPh91h0ZHk",
      pageType: "dashboard",
      pageId: "35KBoSgoAK",
      extended_class: "contracts_Users"
    },
    {
      role: "contracts_OrgAdmin",
      menuId: "VPh91h0ZHk",
      pageType: "dashboard",
      pageId: "35KBoSgoAK",
      extended_class: "contracts_Users"
    },
    {
      role: "contracts_Editor",
      menuId: "H9vRfEYKhT",
      pageType: "dashboard",
      pageId: "35KBoSgoAK",
      extended_class: "contracts_Users"
    },
    {
      role: "contracts_User",
      menuId: "H9vRfEYKhT",
      pageType: "dashboard",
      pageId: "35KBoSgoAK",
      extended_class: "contracts_Users"
    }
  ]
};
