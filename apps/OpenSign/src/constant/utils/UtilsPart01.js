import Parse from "parse";
import axios from "axios";
import { resolveMailBrandPresentation } from "../mailBrand";

export const fontsizeArr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];

export const getFontSizeForHeight = (height) => {
  const numericHeight = Number(height);
  if (!Number.isFinite(numericHeight) || numericHeight <= 0) {
    return fontsizeArr[0];
  }

  const fittingSizes = fontsizeArr.filter(
    (fontSize) => fontSize * 1.5 <= numericHeight
  );
  return fittingSizes[fittingSizes.length - 1] || fontsizeArr[0];
};

export const fontColorArr = ["red", "black", "blue", "yellow"];

export const isMobile = window.innerWidth < 767;

export const isTab = 767 < window.innerWidth < 1023;

export const isHighResolution = window.innerWidth > 1023;

export const isTabAndMobile = window.innerWidth < 1023;

export const textInputWidget = "text input";

export const drawWidget = "draw";

export const textWidget = "text";

export const radioButtonWidget = "radio button";

export const isRadioSelected = (value, option) => {
  const label = (item) =>
    typeof item === "string"
      ? item.trim()
      : item && typeof item === "object" && item.name != null
        ? String(item.name).trim()
        : "";
  const expected = label(option);
  if (!expected) return false;
  const values = Array.isArray(value) ? value : [value];
  return values.some(
    (item) => item?.checked !== false && label(item) === expected
  );
};

export const cellsWidget = "cells";

export const duplicateAutoApplyWidgetTypes = [
  "name",
  "company",
  "job title",
  "email",
  textInputWidget
];

export const normalizeDuplicateWidgetType = (type) => {
  if (typeof type !== "string") {
    return type;
  }
  const normalizedType = type.trim().toLowerCase();
  // Backward compatibility for legacy payloads.
  if (normalizedType === "textbox") {
    return textInputWidget;
  }
  return normalizedType;
};

export const normalizeDuplicateWidgetName = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

export const isDuplicateAutoApplyWidget = (widget) =>
  duplicateAutoApplyWidgetTypes.includes(
    normalizeDuplicateWidgetType(widget?.type)
  );

export const getDuplicateAutoApplyName = (widget) => {
  if (!isDuplicateAutoApplyWidget(widget)) {
    return "";
  }
  return normalizeDuplicateWidgetName(widget?.options?.name);
};

export const getWidgetResponseValue = (widget) =>
  widget?.options?.response ?? widget?.options?.defaultValue;

export const getDuplicateResponseMap = (widgets = []) => {
  const responseByName = new Map();
  widgets.forEach((widget) => {
    const widgetName = getDuplicateAutoApplyName(widget);
    const response = getWidgetResponseValue(widget);
    if (
      widgetName &&
      response !== undefined &&
      response !== "" &&
      !responseByName.has(widgetName)
    ) {
      responseByName.set(widgetName, response);
    }
  });
  return responseByName;
};

export const applyDuplicateResponsesToWidgets = (
  widgets = [],
  responseByName = getDuplicateResponseMap(widgets)
) => {
  if (responseByName.size === 0) {
    return widgets;
  }

  return widgets.map((widget) => {
    const widgetName = getDuplicateAutoApplyName(widget);
    if (!widgetName || !responseByName.has(widgetName)) {
      return widget;
    }
    return {
      ...widget,
      options: {
        ...widget.options,
        response: responseByName.get(widgetName),
        defaultValue: ""
      }
    };
  });
};

export const applyDuplicateResponsesToPages = (pages = []) => {
  const responseByName = getDuplicateResponseMap(
    pages.flatMap((page) => page?.pos || [])
  );
  return pages.map((page) => ({
    ...page,
    pos: applyDuplicateResponsesToWidgets(page?.pos || [], responseByName)
  }));
};

export function getEnv() {
  return window?.RUNTIME_ENV || {};
}

export const appName = resolveMailBrandPresentation("").appName;

export const defaultMailBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;

export const defaultMailSubject = `{{sender_name}} has requested you to sign {{document_title}}`;

export const nonPresentMaskCss = (base) => ({
  ...base,
  width: "0px",
  height: "0px"
});

export const randomId = (digit = 8) => {
  // 1. Grab a cryptographically-secure 32-bit random value
  // Use crypto for stronger randomness
  const randomBytes = crypto.getRandomValues(new Uint32Array(1));
  const raw = randomBytes[0]; // 0 … 4,294,967,295

  // Calculate the min and max for the given digit length
  const min = Math.pow(10, digit - 1); // e.g., digit=3 → 100
  const max = Math.pow(10, digit) - 1; // e.g., digit=3 → 999
  const range = max - min + 1;

  // Collapse random value into the range and shift
  return min + (raw % range);
};

export const range = (start, end, step) => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(i);
  }
  return range;
};

export const getYear = (date) => {
  const newYear = new Date(date).getFullYear();
  return newYear;
};

export const years = range(1950, getYear(new Date()) + 16, 1);

export const months = [
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

export const fileasbytes = async (filepath) => {
  const response = await fetch(filepath); // Adjust the path accordingly
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const openInNewTab = (url, target) => {
  if (target) {
    window.open(url, target, "noopener,noreferrer");
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export const getUserCountry = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data?.country_code;
  } catch (err) {
    console.log("Error fetching country", err);
    return "";
  }
};

export const getSecureUrl = async (url) => {
  const fileUrl = new URL(url)?.pathname?.includes("/files/");
  if (fileUrl) {
    try {
      const fileRes = await Parse.Cloud.run("fileupload", { url: url });
      if (fileRes.url) {
        return { url: fileRes.url };
      } else {
        return { url: "" };
      }
    } catch (err) {
      console.log("err while fileupload ", err);
      return { url: "" };
    }
  } else {
    return { url: url };
  }
};

export function generateId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function removeTrailingSegment(url, segment = "app") {
  // Normalize a trailing slash (e.g. “/app/” → “/app”)
  const normalized = url.endsWith("/") ? url.slice(0, -1) : url;

  const lastSlash = normalized.lastIndexOf("/");
  const lastPart = normalized.slice(lastSlash + 1);

  if (lastPart === segment) {
    return normalized.slice(0, lastSlash);
  }

  return normalized;
}

export const color = [
  "#93a3db",
  "#e6c3db",
  "#c0e3bc",
  "#bce3db",
  "#b8ccdb",
  "#ceb8db",
  "#ffccff",
  "#99ffcc",
  "#cc99ff",
  "#ffcc99",
  "#66ccff",
  "#ffffcc"
];

// Login-path helpers live here so the login bundle never pulls the pdf-lib
// modules below (UtilsPart02/04/08/10/11/15-19). They are re-exported from
// the ../Utils facade, so every existing import keeps working (#55).
export const saveLanguageInLocal = (i18n) => {
  const detectedLanguage = i18n.language || "en";
  localStorage.setItem("i18nextLng", detectedLanguage);
};

export const usertimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const contractUsers = async () => {
  try {
    const url = `${localStorage.getItem("baseUrl")}functions/getUserDetails`;
    const parseAppId = localStorage.getItem("parseAppId");
    const accesstoken = localStorage.getItem("accesstoken");
    const token = { "X-Parse-Session-Token": accesstoken };
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        ...token
      }
    };
    const userDetails = await axios.post(url, {}, headers);
    let data = [];
    if (userDetails?.data?.result) {
      const json = JSON.parse(JSON.stringify(userDetails.data.result));
      data.push(json);
    }
    return data;
  } catch (err) {
    console.log("Err in getUserDetails cloud function", err);
    return "Error: Something went wrong!";
  }
};

export async function getBase64FromUrl(url, autosign) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const pdfBase = this.result;
      if (autosign) {
        resolve(pdfBase);
      } else {
        const suffixbase64 = pdfBase.split(",").pop();
        resolve(suffixbase64);
      }
    };
  });
}
