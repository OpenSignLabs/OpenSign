import moment from "moment";
import {
  generateTitleFromFilename,
  selectFormat,
  changeDateToMomentFormat
} from "../constant/Utils";
import { base64StringtoFile, uploadFile } from "./fileUtils";
import { sanitizeFileName } from "./sanitizeFileName";
import Parse from "parse";
export const dateFormat = [
  "L",
  "MM-DD-YYYY",
  "MM.DD.YYYY",
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "DD.MM.YYYY",
  "YYYY-MM-DD",
  "MMM DD, YYYY",
  "LL",
  "DD MMM, YYYY",
  "DD MMMM, YYYY"
];
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

// The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
export const getDatePickerDate = (selectedDate, format = "dd-MM-yyyy") => {
  let date;
  if (!selectedDate) {
    return;
  }
  if (format && format === "dd-MM-yyyy") {
    const [day, month, year] = selectedDate?.split("-");
    date = new Date(`${year}-${month}-${day}`);
  } else if (format && format === "dd.MM.yyyy") {
    const [day, month, year] = selectedDate?.split(".");
    date = new Date(`${year}.${month}.${day}`);
  } else if (format && format === "dd/MM/yyyy") {
    const [day, month, year] = selectedDate?.split("/");
    date = new Date(`${year}/${month}/${day}`);
  } else {
    date = new Date(selectedDate);
  }
  return date;
};

// Parses strictly "mm/dd/yyyy" (e.g., "01/30/2026")
// Returns "YYYY-MM-DD" (e.g., "2026-01-30") or null if invalid.
export function parseMMDDYYYY(input) {
  if (typeof input !== "string") return null;

  const match = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]); // 1..12
  const day = Number(match[2]); // 1..31
  const year = Number(match[3]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Strict calendar validation (rejects 02/30/2026 etc.)
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }

  const MM = String(month).padStart(2, "0");
  const DD = String(day).padStart(2, "0");
  return `${year}-${MM}-${DD}`; // ISO-like (date-only)
}

// Parses strictly "dd-mm-yyyy" (e.g., "30-01-2026")
// Returns "YYYY-MM-DD" (e.g., "2026-01-30") or null if invalid.
export function parseDDMMYYYY(input) {
  if (typeof input !== "string") return null;

  const match = input.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]); // 1..31
  const month = Number(match[2]); // 1..12
  const year = Number(match[3]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Strict calendar validation (rejects 31-02-2026 etc.)
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }

  const MM = String(month).padStart(2, "0");
  const DD = String(day).padStart(2, "0");
  return `${year}-${MM}-${DD}`; // ISO-like (date-only)
}

// Turn "/^[A-Z]+$/i" OR "^[A-Z]+$" into a real RegExp
export function toRegExp(maybeRegex, defaultFlags = "") {
  if (maybeRegex instanceof RegExp) return maybeRegex;

  const s = String(maybeRegex ?? "").trim();
  const m = s.match(/^\/([\s\S]*)\/([gimsuy]*)$/); // /pattern/flags

  if (m) {
    const [, pattern, flags] = m;
    return new RegExp(pattern, flags);
  }
  return new RegExp(s, defaultFlags);
}

// For <input pattern="..."> (must NOT include /.../ delimiters)
export function toHtmlPattern(maybeRegex) {
  if (!maybeRegex) return;

  const re = toRegExp(maybeRegex);
  // pattern attribute is implicitly full-match; stripping anchors is optional
  return re.source.replace(/^\^/, "").replace(/\$$/, "");
}

export const formatCSVDate = (widget, response, formatInISO = false) => {
  const format = widget?.options?.validation?.format ?? "dd-MM-yyyy";
  const input = response === "today" ? new Date() : response;
  // moment strict parse; fallback to "today" if invalid
  const m = moment(input, changeDateToMomentFormat(format), true);
  const date = m.isValid()
    ? m
    : moment(new Date(), changeDateToMomentFormat(format), true);

  const finalResponse = formatInISO
    ? date.format("DD-MM-YYYY")
    : date.format(format?.toUpperCase());
  return finalResponse;
};
