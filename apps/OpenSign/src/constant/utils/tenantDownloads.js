import axios from "axios";
import Parse from "parse";
import { appInfo } from "../appinfo";
import { saveAs } from "file-saver";
import i18n from "../../i18n";
import { persistBrandPresentation } from "../brandPresentation";
import { buildDownloadFilename } from "../../utils/fileUtils";
import { appName } from "./coreConstants.js";

export const getAppLogo = async () => {
  const domain = window.location.host;
  try {
    const tenant = await Parse.Cloud.run("getlogobydomain", {
      domain: domain
    });
    if (tenant) {
      const resolvedFavicon =
        tenant?.favicon || tenant?.logo || appInfo.fev_Icon;
      localStorage.setItem("appname", "OpenSign™");
      localStorage.setItem("favicon", appInfo.fev_Icon);
      persistBrandPresentation(
        {
          appName: tenant?.appname || "OpenSign™",
          logo: tenant?.logo || appInfo.applogo,
          favicon: resolvedFavicon
        },
        "tenant"
      );
      return {
        logo: tenant?.logo,
        favicon: resolvedFavicon,
        user: tenant?.user
      };
    }
  } catch (err) {
    console.log("err in getlogo ", err);
    localStorage.setItem("favicon", appInfo.fev_Icon);
    if (err?.message?.includes("valid JSON")) {
      return { logo: appInfo.applogo, user: "exist", error: "invalid_json" };
    } else {
      return { logo: appInfo.applogo, user: "exist" };
    }
  }
};

export const getTenantDetails = async (objectId, contactId) => {
  try {
    const url = `${localStorage.getItem("baseUrl")}functions/gettenant`;
    const parseAppId = localStorage.getItem("parseAppId");
    const accesstoken = localStorage.getItem("accesstoken");
    const token = { "X-Parse-Session-Token": accesstoken };
    const data = { userId: objectId, contactId: contactId };
    const res = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        ...token
      }
    });
    if (res.data.result) {
      const updateRes = JSON.parse(JSON.stringify(res.data.result));
      return updateRes;
    } else {
      return "";
    }
  } catch (err) {
    console.log("err in gettenant", err);
    return "user does not exist!";
  }
};

export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, "g");
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }

  const result = {
    subject: replacedSubject,
    body: replacedBody
  };
  return result;
}

export const copytoData = (url) => {
  // navigator.clipboard.writeText(text);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  } else {
    // Fallback for browsers that don't support navigator.clipboard
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

export const convertPdfArrayBuffer = async (url) => {
  try {
    const response = await fetch(url);
    // Check if the response was successful (status 200)
    if (!response.ok) {
      return "Error";
    }
    // Convert the response to ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error";
  }
};

export const handleSendOTP = async (email) => {
  try {
    let url = `${localStorage.getItem("baseUrl")}functions/SendOTPMailV1`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId")
    };
    const body = {
      email: email
    };
    await axios.post(url, body, { headers: headers });
  } catch (error) {
    alert(error.message);
  }
};

export const fetchUrl = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      alert(i18n.t("something-went-wrong-mssg"));
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    saveAs(blob, fileName);
  } catch (error) {
    alert(i18n.t("something-went-wrong-mssg"));
    console.error("Error downloading the file:", error);
  }
};

export const getSignedUrl = async (pdfUrl, docId, templateId) => {
  //use only axios here due to public template sign
  const token = {
    "X-Parse-Session-Token": localStorage.getItem("accesstoken")
  };
  const axiosRes = await axios.post(
    `${localStorage.getItem("baseUrl")}/functions/getsignedurl`,
    {
      url: pdfUrl,
      docId: docId || "",
      templateId: templateId || ""
    },
    {
      headers: {
        "content-type": "Application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      }
    }
  );
  const url = axiosRes.data.result;
  return url;
};

export const fetchBase64 = async (pdfBase64, pdfName) => {
  // Create a Blob from the Base64 string
  const byteCharacters = atob(pdfBase64);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });

  // Create a link element
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = pdfName;

  // Programmatically click the link to trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const handleDownloadPdf = async (
  pdfDetails,
  setIsDownloading,
  pdfBase64
) => {
  const pdfName =
    pdfDetails?.[0]?.Name?.length > 100
      ? pdfDetails?.[0]?.Name?.slice(0, 100)
      : pdfDetails?.[0]?.Name || "Document";
  const isCompleted = pdfDetails?.[0]?.IsCompleted || false;
  const formatId = pdfDetails?.[0]?.ExtUserPtr?.DownloadFilenameFormat;
  const docName = buildDownloadFilename(formatId, {
    docName: pdfName,
    email: pdfDetails?.[0]?.ExtUserPtr?.Email,
    isSigned: isCompleted
  });
  if (pdfBase64) {
    await fetchBase64(pdfBase64, docName);
    setIsDownloading && setIsDownloading("");
  } else {
    const pdfUrl = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
    setIsDownloading && setIsDownloading("pdf");
    const docId = pdfDetails?.[0]?.objectId || "";
    try {
      const url = await getSignedUrl(pdfUrl, docId);
      await fetchUrl(url, docName);
      setIsDownloading && setIsDownloading("");
    } catch (err) {
      console.log("err in getsignedurl", err);
      setIsDownloading("");
      alert(i18n.t("something-went-wrong-mssg"));
    }
  }
};

export function fileNameWithUnderscore(pdfName) {
  // Replace spaces with underscore
  return pdfName.replace(/ /g, "_");
}
