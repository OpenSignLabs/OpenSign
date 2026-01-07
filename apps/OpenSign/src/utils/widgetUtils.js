import { generateTitleFromFilename, selectFormat } from "../constant/Utils";
import { base64StringtoFile, uploadFile } from "./fileUtils";
import { sanitizeFileName } from "./sanitizeFileName";
import Parse from "parse";
// `handlesavesign` is used to save signature, initials, stamp as a default
export const saveToMySign = async (widget) => {
  const base64 = widget?.base64;
  if (base64) {
    try {
      const User = Parse?.User?.current();
      const sanitizename = generateTitleFromFilename(User?.get("name"));
      const replaceSpace = sanitizeFileName(sanitizename);
      const fileName =
        widget?.type === "signature"
          ? `${replaceSpace}__sign`
          : widget?.type === "initials"
            ? `${replaceSpace}__initials`
            : `${replaceSpace}_stamp`;
      const file = base64StringtoFile(base64, fileName);
      const fileUrl = await uploadFile(file, User?.id);
      // below code is used to save or update default signature, initials, stamp
      const params = {
        id: widget?.defaultSignId, // pass id to update existing signature/initials
        userId: User.id
      };
      if (widget?.type === "initials") {
        params.initials = fileUrl; // save initials image url
      } else if (widget?.type === "signature") {
        params.signature = fileUrl; // save signature image url
      } else if (widget?.type === "stamp") {
        params.stamp = fileUrl; // save stamp image url
      }
      const signRes = await Parse.Cloud.run("savesignature", params);
      return { base64File: base64, id: signRes?.id };
    } catch (err) {
      console.log("Err while saving signature", err);
      return err;
    }
  }
};

// helper: does this signer already have any signature widget?
export const hasSignatureWidget = (s) =>
  (s.placeHolder ?? []).some((ph) =>
    (ph?.pos ?? []).some((p) => p?.type === "signature")
  );

export const widgetNamesArr = (placeholders, signerId) => {
  const widgetNames =
    placeholders?.length > 0
      ? placeholders
          ?.filter((x) => x.Id !== signerId) // exclude current signer
          ?.flatMap((item) => item.placeHolder || []) // go inside placeHolder[]
          ?.flatMap((ph) => ph.pos || []) // go inside pos[]
          ?.map((pos) => pos.options?.name) // pick the name
          .filter(Boolean)
      : [];

  return widgetNames;
};

// `hasDuplicateWidgetNames` checks for duplicate widget names across different placeholder objects
export const hasDuplicateWidgetNames = (placeholders = []) => {
  const seen = new Set(); // names we've already seen in previous objs

  for (const obj of placeholders || []) {
    const widgetNames =
      obj?.placeHolder
        ?.flatMap((ph) => ph.pos || [])
        ?.map((pos) => pos.options?.name)
        .filter(Boolean) || [];

    const uniqueNames = [...new Set(widgetNames)]; // ignore duplicates inside same obj

    const isDuplicate = uniqueNames.some((name) => seen.has(name));
    if (isDuplicate) return true; // early exit on first cross-obj duplicate

    uniqueNames.forEach((name) => seen.add(name));
  }

  return false;
};

/**
 *
 * @param {Array<object>} pages
 *   Array of page objects. Each page is expected to have:
 *     - pos: Array<Widget> where Widget has shape:
 *         {
 *           key: string,
 *           type: string,
 *           options?: {
 *             response?: number|string,
 *             defaultValue?: number|string,
 *             formula?: string
 *           }
 *         }
 *
 * @returns {Array<object>}
 */
export const applyNumberFormulasToPages = (pages = []) => {
  // Guard: if not an array or empty, just return as-is
  if (!Array.isArray(pages) || pages.length === 0) {
    return pages;
  }

  // Clone pages and each widget.options so we do not mutate caller's data.
  // (Shallow clone is sufficient for our current usage since we only touch `options`.)
  const clonedPages = pages.map((page) => ({
    ...page,
    pos: (page?.pos || []).map((widget) => ({
      ...widget,
      options: { ...widget.options }
    }))
  }));

  // Return the cloned, updated pages
  return clonedPages;
};

export const getInitials = (name) => {
  if (!name) return "";

  // Trim and split by any amount of whitespace
  const parts = name.trim().split(/\s+/);

  // Only one word → return first letter of that word
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  // More than one word → take first and second words
  const first = parts[0];
  const second = parts[1];

  return `${first[0].toUpperCase()} ${second[0].toUpperCase()}`;
};

// Function to check if a string is valid Base64 (supports data URL)
export const isValidBase64 = (str) => {
  if (!str || typeof str !== "string") return false;

  // Remove data URL prefix if present
  const cleanedStr = str.split(",").pop()?.trim();
  if (!cleanedStr) return false;

  // Length must be divisible by 4
  if (cleanedStr.length % 4 !== 0) return false;

  // Base64 or Base64URL regex
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!base64Regex.test(cleanedStr)) return false;

  try {
    // atob throws if invalid
    atob(cleanedStr);
    return true;
  } catch {
    return false;
  }
};
export const addPreferenceOpt = (owner, type, role, isSignyourself) => {
  const widget = owner?.WidgetPreferences?.find((w) => w.type === type) || {};
  switch (type) {
    case "date": {
      const signingDate = widget?.isSigningDate ? "today" : widget?.date || "";
      const isReadOnly = widget?.isReadOnly || false;
      const isPrefill = role && role === "prefill";
      const format =
        widget?.format || selectFormat(owner?.DateFormat) || "MM/DD/YYYY";
      const prefillDate = new Date();
      const response = isPrefill
        ? formatDate({ date: prefillDate, format: format })
        : signingDate || "";
      const option =
        isSignyourself || isPrefill ? {} : { isReadOnly: isReadOnly };
      return {
        response: response,
        ...option,
        format: widget?.format || "MM/dd/yyyy"
      };
    }
    default:
      return {};
  }
};

export function formatDate(dateObj) {
  const format = dateObj?.format?.toLowerCase();
  const date = new Date(dateObj.date);

  // zero-padded day and month
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  // month names
  const shortNames = [
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
  const longNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const mmm = shortNames[date.getMonth()];
  const mmmm = longNames[date.getMonth()];

  // a map of token → replacement
  const tokens = { yyyy: yyyy, mm: mm, dd: dd, mmm: mmm, mmmm: mmmm };

  // Replace longer tokens first
  return format
    .replace(/yyyy/, tokens.yyyy)
    .replace(/mmmm/, tokens.mmmm)
    .replace(/mmm/, tokens.mmm)
    .replace(/mm/, tokens.mm)
    .replace(/dd/, tokens.dd);
}
