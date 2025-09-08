import { SaveFileSize } from "../constant/saveFileSize";
import { getSecureUrl } from "../constant/Utils";
import Parse from "parse";
import i18n from "../i18n";

export const uploadFile = async (file, userId) => {
  try {
    const parseFile = new Parse.File(file.name, file);
    const response = await parseFile.save();
    if (response?.url()) {
      const fileRes = await getSecureUrl(response.url());
      if (fileRes.url) {
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(file.size, fileRes.url, tenantId, userId);
        return fileRes?.url;
      } else {
        alert(i18n.t("something-went-wrong-mssg"));
        return false;
      }
    } else {
      alert(i18n.t("something-went-wrong-mssg"));
      return false;
    }
  } catch (err) {
    console.log("sign upload err", err);
    alert(`${err.message}`);
    return false;
  }
};

export function base64StringtoFile(base64String, filename) {
  let arr = base64String.split(","),
    // type of uploaded image
    mime = arr[0].match(/:(.*?);/)[1],
    // decode base64
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const ext = mime.split("/").pop();
  const name = `${filename}.${ext}`;
  return new File([u8arr], name, { type: mime });
}

function formatFixedDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const mmm = months[date.getMonth()];
  const yyyy = String(date.getFullYear());
  let h = date.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const HH12 = String(h).padStart(2, "0");
  const MM = String(date.getMinutes()).padStart(2, "0");
  return `${dd}-${mmm}-${yyyy} ${HH12}:${MM} ${ampm}`;
}

/**
 * Remove characters not allowed in file names for major OSes.
 */
function sanitizeDownloadFilename(name) {
  return name
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ") // reserved + control
    .replace(/\s+/g, " ") // collapse spaces
    .trim();
}

/**
 * Build filename using the selected format ID and runtime values.
 * @param {string} formatId - One of FILENAME_FORMATS ids
 * @param {object} ctx - { docName, email, date, ext, isSigned, datePattern }
 * @returns {string}
 */
export function buildDownloadFilename(formatId, ctx) {
  const {
    docName = "Document",
    email = "user@example.com",
    date = new Date(),
    ext = "pdf",
    isSigned = false
  } = ctx || {};

  const base = sanitizeDownloadFilename(String(docName) || "Document");
  const safeEmail = sanitizeDownloadFilename(
    String(email) || "user@example.com"
  );
  const dateStr = formatFixedDate(date);

  let stem;
  switch (formatId) {
    case "DOCNAME":
      stem = base;
      break;
    case "DOCNAME_SIGNED":
      stem = isSigned ? `${base} - Signed` : base; // if not signed, fallback to base
      break;
    case "DOCNAME_EMAIL":
      stem = `${base} - ${safeEmail}`;
      break;
    case "DOCNAME_EMAIL_DATE":
      stem = `${base} - ${safeEmail} - ${dateStr}`;
      break;
    default:
      stem = base; // safe default
  }

  const safeExt = ext.replace(/\.+/g, "").toLowerCase() || "pdf";
  return `${stem}.${safeExt}`;
}
