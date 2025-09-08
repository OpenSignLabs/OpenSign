import { Helmet } from "react-helmet";
import { useLocation, matchPath } from "react-router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useManifestUrl } from "../hook/useManifestUrl";

const TITLE_MAP = {
  "/": "login",
  // Homelayout
  "/dashboard/35KBoSgoAK": "Dashboard",
  "/form/sHAnZphf69": "Sign Yourself",
  "/form/8mZzFxbG1z": "Request Signatures",
  "/form/template": "New Template",
  "/report/6TeaPr321t": "Templates",
  "/report/4Hhwbp482K": "Need your sign",
  "/report/1MwEuxLEkF": "In Progress",
  "/report/kQUoW4hUXz": "Completed",
  "/report/ByHuevtCFY": "Drafts",
  "/report/UPr2Fm5WY3": "Declined",
  "/report/zNqBHXHsYH": "Expired",
  "/report/contacts": "Contactbook",
  "/drive": "Drive",
  "/managesign": "My Signature",
  "/preferences": "Preferences",
  "/users": "Users",
  "/profile": "profile",
  "/changepassword": "change-password",
  "/verify-document": "verify-document",

  "/signaturePdf/:docId": "Sign Yourself",
  "/placeHolderSign/:docId": "Request Signatures",
  "/template/:templateId": "New Template",
  "/recipientSignPdf/:docId": "Request Signatures",
  "/recipientSignPdf/:docId/:contactBookId": "Request Signatures",
  "/load/recipientSignPdf/:docId/:contactBookId": "Request Signatures",

  // alone
  "/debugpdf": "Debug Pdf",
  "/forgetpassword": "forgot-password",
  "/success": "success",
  "/addadmin": "add-admin",
  "/upgrade-2.1": "add-admin",
  "/draftDocument": "New Document",
  "/login/:base64url": "Request Signatures",

};

function resolveTitle(pathname, override) {
  if (override) return override;
  for (let [pattern, label] of Object.entries(TITLE_MAP)) {
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return label;
    }
  }
  return "";
}

export default function Title() {
  const { pathname, state } = useLocation();
  const { t } = useTranslation();
  const appName =
    "OpenSign™";
  const logo = useMemo(() => localStorage.getItem("favicon"), []);
  const prefix = useMemo(
    () => resolveTitle(pathname, state?.title),
    [pathname, state?.title]
  );
  const title = useMemo(
    () => (prefix ? `${t(prefix)} - ${appName}` : appName),
    [t, prefix, appName]
  );
  const manifestUrl = useManifestUrl(appName, logo);
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={title} />
      {logo && <link rel="icon" type="image/png" href={logo} />}
      <link rel="manifest" href={manifestUrl} />
    </Helmet>
  );
}
