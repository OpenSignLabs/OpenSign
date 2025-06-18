import axios from "axios";
import moment from "moment";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import Parse from "parse";
import { appInfo } from "./appinfo";
import { saveAs } from "file-saver";
import printModule from "print-js";
import fontkit from "@pdf-lib/fontkit";
import {
  themeColor
} from "./const";
import { format, toZonedTime } from "date-fns-tz";

export const fontsizeArr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
export const fontColorArr = ["red", "black", "blue", "yellow"];
export const isMobile = window.innerWidth < 767;
export const isTab = 767 < window.innerWidth < 1023;
export const isHighResolution = window.innerWidth > 1023;
export const isTabAndMobile = window.innerWidth < 1023;
export const textInputWidget = "text input";
export const textWidget = "text";
export const radioButtonWidget = "radio button";
export const cellsWidget = "cells";
export function getEnv() {
  return window?.RUNTIME_ENV || {};
}

//function for create list of year for date widget
export const range = (start, end, step) => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(i);
  }
  return range;
};
//function for get year
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

// `getSecureUrl` is used to return local secure url if local files
export const getSecureUrl = async (url) => {
  const fileUrl = new URL(url)?.pathname?.includes("files");
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

/**
 * Removes a trailing path segment from a URL string, if present.
 *
 * @param {string} url     - The original URL.
 * @param {string} segment - The segment to strip off (default: "app").
 * @returns {string}       - The URL with the trailing segment removed, or unmodified if it didn’t match.
 */
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

export const nameColor = [
  "#304fbf",
  "#7d5270",
  "#5f825b",
  "#578077",
  "#576e80",
  "#6d527d",
  "#cc00cc",
  "#006666",
  "#cc00ff",
  "#ff9900",
  "#336699",
  "#cc9900"
];
export const toDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      resolve(e.target.result);
    };
  });
};

//function for getting document details for getDrive cloud function
export const getDrive = async (documentId, skip = 0, limit = 50) => {
  const data = {
    docId: documentId && documentId,
    limit: limit,
    skip: skip
  };
  const driveDeatils = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getDrive`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessiontoken: localStorage.getItem("accesstoken")
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;

      if (json && json.result.error) {
        return json;
      } else if (json && json.result) {
        const data = json.result;
        return data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log("Err in getDrive cloud function", err);
      return "Error: Something went wrong!";
    });

  return driveDeatils;
};

// `pdfNewWidthFun` function is used to calculate pdf width to render in middle container
export const pdfNewWidthFun = (divRef) => {
  const pdfWidth = divRef.current.offsetWidth;
  return pdfWidth;
};

//`contractUsers` function is used to get contract_User details
export const contractUsers = async (
) => {
  try {
    const url = `${localStorage.getItem("baseUrl")}functions/getUserDetails`;
    const parseAppId = localStorage.getItem("parseAppId");
    const accesstoken =
      localStorage.getItem("accesstoken");
    const token =
          { "X-Parse-Session-Token": accesstoken };
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

//function for resize image and update width and height for mulitisigners
export const handleImageResize = (
  ref,
  key,
  signerPos,
  setSignerPos,
  pageNumber,
  containerScale,
  scale,
  signerId,
  showResize
) => {
  const filterSignerPos = signerPos.filter((data) => data.Id === signerId);
  if (filterSignerPos.length > 0) {
    const getPlaceHolder = filterSignerPos[0].placeHolder;
    const getPageNumer = getPlaceHolder.filter(
      (data) => data.pageNumber === pageNumber
    );
    if (getPageNumer.length > 0) {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((url) => {
        if (url.key === key) {
          return {
            ...url,
            Width: ref.offsetWidth / (containerScale * scale),
            Height: ref.offsetHeight / (containerScale * scale),
            IsResize: showResize ? true : false
          };
        }
        return url;
      });

      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === pageNumber) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });

      const newUpdateSigner = signerPos.map((obj) => {
        if (obj.Id === signerId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setSignerPos(newUpdateSigner);
    }
  }
};
export const widgets = [
  { type: "signature", icon: "fa-light fa-pen-nib", iconSize: "20px" },
  { type: "stamp", icon: "fa-light fa-stamp", iconSize: "19px" },
  { type: "initials", icon: "fa-light fa-signature", iconSize: "15px" },
  { type: "name", icon: "fa-light fa-user", iconSize: "21px" },
  { type: "job title", icon: "fa-light fa-address-card", iconSize: "17px" },
  { type: "company", icon: "fa-light fa-building", iconSize: "25px" },
  { type: "date", icon: "fa-light fa-calendar-days", iconSize: "20px" },
  { type: textWidget, icon: "fa-light fa-text-width", iconSize: "20px" },
  { type: textInputWidget, icon: "fa-light fa-font", iconSize: "21px" },
  { type: cellsWidget, icon: "fa-light fa-table-cells", iconSize: "20px" },
  { type: "checkbox", icon: "fa-light fa-square-check", iconSize: "22px" },
  {
    type: "dropdown",
    icon: "fa-light fa-circle-chevron-down",
    iconSize: "19px"
  },
  { type: radioButtonWidget, icon: "fa-light fa-circle-dot", iconSize: "20px" },
  { type: "image", icon: "fa-light fa-image", iconSize: "20px" },
  { type: "email", icon: "fa-light fa-envelope", iconSize: "20px" }
];

export const getDate = (dateformat) => {
  const format = dateformat || "MM/DD/YYYY";
  const date = new Date();
  const milliseconds = date.getTime();
  const newDate = moment(milliseconds).format(format);
  return newDate;
};

export const selectFormat = (data) => {
  switch (data) {
    case "L":
      return "MM/dd/yyyy";
    case "MM/DD/YYYY":
      return "MM/dd/yyyy";
    case "DD-MM-YYYY":
      return "dd-MM-yyyy";
    case "DD/MM/YYYY":
      return "dd/MM/yyyy";
    case "LL":
      return "MMMM dd, yyyy";
    case "DD MMM, YYYY":
      return "dd MMM, yyyy";
    case "YYYY-MM-DD":
      return "yyyy-MM-dd";
    case "MM-DD-YYYY":
      return "MM-dd-yyyy";
    case "MM.DD.YYYY":
      return "MM.dd.yyyy";
    case "MMM DD, YYYY":
      return "MMM dd, yyyy";
    case "MMMM DD, YYYY":
      return "MMMM dd, yyyy";
    case "DD MMMM, YYYY":
      return "dd MMMM, yyyy";
    default:
      return "MM/dd/yyyy";
  }
};

export const changeDateToMomentFormat = (format) => {
  switch (format) {
    case "MM/dd/yyyy":
      return "L";
    case "dd-MM-yyyy":
      return "DD-MM-YYYY";
    case "dd/MM/yyyy":
      return "DD/MM/YYYY";
    case "MMMM dd, yyyy":
      return "LL";
    case "dd MMM, yyyy":
      return "DD MMM, YYYY";
    case "yyyy-MM-dd":
      return "YYYY-MM-DD";
    case "MM-dd-yyyy":
      return "MM-DD-YYYY";
    case "MM.dd.yyyy":
      return "MM.DD.YYYY";
    case "MMM dd, yyyy":
      return "MMM DD, YYYY";
    case "dd MMMM, yyyy":
      return "DD MMMM, YYYY";
    default:
      return "L";
  }
};
export const addWidgetOptions = (type, signer, widgetValue) => {
  const status = { status: "required" };
  switch (type) {
    case "signature":
      return { ...status, name: "Signature" };
    case "stamp":
      return { ...status, name: "Upload stamp" };
    case "checkbox":
      return {
        ...status,
        name: "Checkbox",
        isReadOnly: false,
        isHideLabel: false
      };
    case textInputWidget:
      return { ...status, name: "Text", isReadOnly: false };
    case cellsWidget:
      return {
        ...status,
        name: "Cells",
        cellCount: 5,
        defaultValue: "",
        validation: { type: "", pattern: "" },
        isReadOnly: false
      };
    case "initials":
      return { ...status, name: "Initials" };
    case "name":
      return {
        ...status,
        name: "Name",
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "company":
      return {
        ...status,
        name: "Company",
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "job title":
      return {
        ...status,
        name: "Job title",
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "date": {
      const dateFormat = signer?.DateFormat
        ? selectFormat(signer?.DateFormat)
        : "MM/dd/yyyy";
      return {
        ...status,
        name: "Date",
        response: getDate(signer?.DateFormat),
        validation: { format: dateFormat, type: "date-format" }
      };
    }
    case "image":
      return { ...status, name: "Upload image" };
    case "email":
      return {
        ...status,
        name: "Email",
        validation: { type: "email", pattern: "" },
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "dropdown":
      return { ...status, name: "Choose one" };
    case radioButtonWidget:
      return {
        ...status,
        name: "Radio button",
        values: [],
        isReadOnly: false,
        isHideLabel: false
      };
    case textWidget:
      return { ...status, name: "Text" };
    default:
      return {};
  }
};

export const addWidgetSelfsignOptions = (type, getWidgetValue, owner) => {
  switch (type) {
    case "signature":
      return { name: "Signature" };
    case "stamp":
      return { name: "Upload stamp" };
    case "checkbox":
      return { name: "Checkbox" };
    case textWidget:
      return { name: "Text" };
    case cellsWidget:
      return {
        name: "Cells",
        cellCount: 5,
        defaultValue: "",
        validation: { type: "", pattern: "" },
        isReadOnly: false
      };
    case "initials":
      return { name: "Initials" };
    case "name":
      return {
        name: "Name",
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "company":
      return {
        name: "Company",
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "job title":
      return {
        name: "Job title",
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "date": {
      const dateFormat = owner?.DateFormat
        ? selectFormat(owner?.DateFormat)
        : "MM/dd/yyyy";
      return {
        name: "Date",
        response: getDate(owner?.DateFormat),
        validation: { format: dateFormat, type: "date-format" }
      };
    }
    case "image":
      return { name: "Upload image" };
    case "email":
      return {
        name: "Email",
        defaultValue: getWidgetValue(type),
        validation: { type: "email", pattern: "" }
      };
    default:
      return {};
  }
};
export const getWidgetType = (item, widgetName) => {
  return (
    <div className="op-btn w-fit md:w-[100%] op-btn-primary op-btn-outline op-btn-sm focus:outline-none outline outline-[1.5px] ml-[6px] md:ml-0 p-0 overflow-hidden">
      <div className="w-full h-full flex md:justify-between items-center">
        <div className="flex justify-start items-center text-[13px] ml-1">
          {!isMobile && <i className="fa-light fa-grip-vertical ml-[3px]"></i>}
          <span className="md:inline-block text-center text-[15px] ml-[5px] font-semibold pr-1 md:pr-0">
            {widgetName}
          </span>
        </div>
        <div className="text-[20px] op-btn op-btn-primary rounded-none w-[40px] h-full flex justify-center items-center">
          <i className={item.icon}></i>
        </div>
      </div>
    </div>
  );
};

export const defaultWidthHeight = (type) => {
  switch (type) {
    case "signature":
      return { width: 150, height: 60 };
    case "stamp":
      return { width: 150, height: 60 };
    case "checkbox":
      return { width: 15, height: 19 };
    case textInputWidget:
      return { width: 150, height: 19 };
    case cellsWidget:
      return { width: 112, height: 22 };
    case "dropdown":
      return { width: 120, height: 22 };
    case "initials":
      return { width: 50, height: 50 };
    case "name":
      return { width: 150, height: 19 };
    case "company":
      return { width: 150, height: 19 };
    case "job title":
      return { width: 150, height: 19 };
    case "date":
      return { width: 100, height: 20 };
    case "image":
      return { width: 70, height: 70 };
    case "email":
      return { width: 150, height: 19 };
    case radioButtonWidget:
      return { width: 5, height: 10 };
    case textWidget:
      return { width: 150, height: 19 };
    default:
      return { width: 150, height: 60 };
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

export async function getBase64FromIMG(url) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const pdfBase = this.result;

      resolve(pdfBase);
    };
  });
}
//function for convert signature png base64 url to jpeg base64
export const convertPNGtoJPEG = (base64Data) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = base64Data;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // white color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // Convert to JPEG by using the canvas.toDataURL() method
      const jpegBase64Data = canvas.toDataURL("image/jpeg");

      resolve(jpegBase64Data);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

//function for resize image and update width and height for sign-yourself
export const handleSignYourselfImageResize = (
  ref,
  key,
  xyPosition,
  setXyPosition,
  index,
  containerScale,
  scale
) => {
  const getXYdata = xyPosition[index].pos;
  const getPosData = getXYdata;
  const addSign = getPosData.map((url) => {
    if (url.key === key) {
      return {
        ...url,
        Width: ref.offsetWidth / (scale * containerScale),
        Height: ref.offsetHeight / (scale * containerScale),
        IsResize: true
      };
    }
    return url;
  });

  const newUpdateUrl = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: addSign };
    }
    return obj;
  });
  setXyPosition(newUpdateUrl);
};

//function for call cloud function signPdf and generate digital signature
export const signPdfFun = async (
  base64Url,
  documentId,
  signerObjectId,
  objectId,
  widgets,
) => {
  let isCustomCompletionMail = false;
  try {
    //get tenant details
    const tenantDetails = await getTenantDetails(objectId);
    if (tenantDetails && tenantDetails === "user does not exist!") {
      return { status: "error", message: "User does not exist." };
    } else {
      if (
        tenantDetails?.CompletionBody &&
        tenantDetails?.CompletionSubject
      ) {
        isCustomCompletionMail = true;
      }
    }

    // below for loop is used to get first signature of user to send if to signpdf
    // for adding it in completion certificate
    let getSignature;
    for (let item of widgets) {
      if (!getSignature) {
        const typeExist = item.pos.some((data) => data?.type);
        if (typeExist) {
          getSignature = item.pos.find((data) => data?.type === "signature");
        } else {
          getSignature = item.pos.find((data) => !data.isStamp);
        }
      }
    }

    let base64Sign = getSignature.SignUrl;
    //check https type signature (default signature exist) then convert in base64
    const isUrl = base64Sign.includes("https");
    if (isUrl) {
      try {
        base64Sign = await fetchImageBase64(base64Sign);
      } catch (e) {
        console.log("error", e);
        return { status: "error", message: "something went wrong." };
      }
    }
    //change image width and height to 300/120 in png base64
    const imagebase64 = await changeImageWH(base64Sign);
    //remove suffiix of base64 (without type)
    const suffixbase64 = imagebase64 && imagebase64.split(",").pop();

    const params = {
      pdfFile: base64Url,
      docId: documentId,
      userId: signerObjectId,
      isCustomCompletionMail: isCustomCompletionMail,
      signature: suffixbase64
    };
    const resSignPdf = await Parse.Cloud.run("signPdf", params);
    if (resSignPdf) {
      const signedPdf = JSON.parse(JSON.stringify(resSignPdf));
      return signedPdf;
    }
  } catch (e) {
    console.log("Err in signPdf cloud function ", e.message);
    if (e && e?.message?.includes("is encrypted.")) {
      return {
        status: "error",
        message: "Currently encrypted pdf files are not supported."
      };
    } else if (e?.message?.includes("password")) {
      return { status: "error", message: "PFX file password is invalid." };
    } else {
      return { status: "error", message: "something went wrong." };
    }
  }
};

export const randomId = () => {
  // 1. Grab a cryptographically-secure 32-bit random value
  const randomBytes = crypto.getRandomValues(new Uint32Array(1));
  const raw = randomBytes[0]; // 0 … 4 294 967 295

  // 2. Collapse into a 90 000 000-wide band (0…89 999 999), then shift to 10 000 000…99 999 999
  const eightDigit = 10_000_000 + (raw % 90_000_000);

  return eightDigit;
};

export const createDocument = async (
  template,
  placeholders,
  signerData,
  pdfUrl
) => {
  if (template && template.length > 0) {
    const Doc = template[0];
    let placeholdersArr = [];
    if (placeholders?.length > 0) {
      placeholdersArr = placeholders;
    }
    let signers = [];
    if (signerData?.length > 0) {
      signerData.forEach((x) => {
        if (x.objectId) {
          const obj = {
            __type: "Pointer",
            className: "contracts_Contactbook",
            objectId: x.objectId
          };
          signers.push(obj);
        }
      });
    }
    const SignatureType = Doc?.SignatureType
      ? { SignatureType: Doc?.SignatureType }
      : {};
    const NotifyOnSignatures = Doc?.NotifyOnSignatures
      ? { NotifyOnSignatures: Doc?.NotifyOnSignatures }
      : {};
    const Bcc = Doc?.Bcc?.length > 0 ? { Bcc: Doc?.Bcc } : {};
    const RedirectUrl = Doc?.RedirectUrl
      ? { RedirectUrl: Doc?.RedirectUrl }
      : {};
    const TemplateId = Doc?.objectId
      ? {
          TemplateId: {
            __type: "Pointer",
            className: "contracts_Template",
            objectId: Doc?.objectId
          }
        }
      : {};
    const data = {
      Name: Doc.Name,
      URL: pdfUrl,
      SignedUrl: Doc.SignedUrl,
      SentToOthers: Doc.SentToOthers,
      Description: Doc.Description,
      Note: Doc.Note,
      Placeholders: placeholdersArr,
      ExtUserPtr: {
        __type: "Pointer",
        className: "contracts_Users",
        objectId: Doc.ExtUserPtr.objectId
      },
      CreatedBy: {
        __type: "Pointer",
        className: "_User",
        objectId: Doc.CreatedBy.objectId
      },
      Signers: signers,
      SendinOrder: Doc?.SendinOrder || false,
      AutomaticReminders: Doc?.AutomaticReminders || false,
      RemindOnceInEvery: parseInt(Doc?.RemindOnceInEvery || 5),
      IsEnableOTP: Doc?.IsEnableOTP || false,
      IsTourEnabled: Doc?.IsTourEnabled || false,
      AllowModifications: Doc?.AllowModifications || false,
      TimeToCompleteDays: parseInt(Doc?.TimeToCompleteDays) || 15,
      ...SignatureType,
      ...NotifyOnSignatures,
      ...Bcc,
      ...RedirectUrl,
      ...TemplateId
    };
    const remindOnceInEvery = Doc?.RemindOnceInEvery;
    const TimeToCompleteDays = parseInt(Doc?.TimeToCompleteDays);
    const reminderCount = TimeToCompleteDays / remindOnceInEvery;
    const AutomaticReminders = Doc.autoreminder;
    if (AutomaticReminders && reminderCount > 15) {
      return { status: "error", id: "only-15-reminder-allowed" };
    }
    try {
      const res = await axios.post(
        `${localStorage.getItem("baseUrl")}classes/contracts_Document`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      if (res) {
        return { status: "success", id: res.data.objectId };
      }
    } catch (err) {
      console.log("axois err ", err);
      return { status: "error", id: "something-went-wrong-mssg" };
    }
  }
};

export const getFirstLetter = (name) => {
  const firstLetter = name?.charAt(0);
  return firstLetter;
};

export const darkenColor = (color, factor) => {
  // Remove '#' from the color code and parse it to get RGB values
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken the color by reducing each RGB component
  const darkerR = Math.floor(r * (1 - factor));
  const darkerG = Math.floor(g * (1 - factor));
  const darkerB = Math.floor(b * (1 - factor));

  // Convert the darkened RGB components back to hex
  return `#${((darkerR << 16) | (darkerG << 8) | darkerB)
    .toString(16)
    .padStart(6, "0")}`;
};

export const addZIndex = (signerPos, key, setZIndex) => {
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      return {
        ...item,
        placeHolder: addZIndex(item.placeHolder, key, setZIndex)
      };
    } else if (item.pos && item.pos.length > 0) {
      // If there is no nested array, add the new field
      return {
        ...item,
        pos: addZIndex(item.pos, key, setZIndex)
        // Adjust this line to add the desired field
      };
    } else {
      if (item.key === key) {
        setZIndex(item.zIndex);
        return {
          ...item,
          zIndex: item.zIndex ? item.zIndex + 1 : 1
        };
      } else {
        return {
          ...item
        };
      }
    }
  });
};

//function for save widgets value on onchange function
export const onChangeInput = (
  value,
  signKey,
  xyPosition,
  index,
  setXyPosition,
  userId,
  initial,
  dateFormat,
  fontSize,
  fontColor,
  isDateReadOnly
) => {
  const isSigners = xyPosition.some((data) => data.signerPtr);
  let filterSignerPos;
  if (isSigners) {
    if (userId) {
      filterSignerPos = xyPosition.filter((data) => data.Id === userId);
    }
    const getPlaceHolder = filterSignerPos[0]?.placeHolder;
    if (initial) {
      const xyData = addInitialData(xyPosition, setXyPosition, value, userId);
      setXyPosition(xyData);
    } else {
      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === index
      );
      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;
        const getPosData = getXYdata;
        const addSignPos = getPosData.map((position) => {
          if (position.key === signKey) {
            if (dateFormat) {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
                  fontSize: fontSize,
                  fontColor: fontColor,
                  isReadOnly: isDateReadOnly || false,
                  validation: {
                    type: "date-format",
                    format: dateFormat // This indicates the required date format explicitly.
                  }
                }
              };
            } else {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
                  defaultValue: ""
                }
              };
            }
          }
          return position;
        });
        const newUpdateSignPos = getPlaceHolder.map((obj) => {
          if (obj.pageNumber === index) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });

        const newUpdateSigner = xyPosition.map((obj) => {
          if (obj.Id === userId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });

        setXyPosition(newUpdateSigner);
      }
    }
  } else {
    let getXYdata = xyPosition[index].pos;
    const updatePosition = getXYdata.map((positionData) => {
      if (positionData.key === signKey) {
        if (dateFormat) {
          return {
            ...positionData,
            options: {
              ...positionData.options,
              response: value,
              fontSize: fontSize,
              fontColor: fontColor,
              validation: {
                type: "date-format",
                format: dateFormat // This indicates the required date format explicitly.
              }
            }
          };
        } else {
          return {
            ...positionData,
            options: {
              ...positionData.options,
              response: value,
              defaultValue: ""
            }
          };
        }
      }
      return positionData;
    });

    const updatePlaceholder = xyPosition.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: updatePosition };
      }
      return obj;
    });
    setXyPosition(updatePlaceholder);
  }
};
//function to increase height of text area on press enter
export const onChangeHeightOfTextArea = (
  height,
  widgetType,
  signKey,
  xyPosition,
  index,
  setXyPosition,
  userId
) => {
  const isSigners = xyPosition.some((data) => data.signerPtr);
  let filterSignerPos;
  if (isSigners) {
    if (userId) {
      filterSignerPos = xyPosition.filter((data) => data.Id === userId);
    }
    const getPlaceHolder = filterSignerPos[0]?.placeHolder;

    const getPageNumer = getPlaceHolder.filter(
      (data) => data.pageNumber === index
    );
    if (getPageNumer.length > 0) {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((position) => {
        if (position.key === signKey) {
          return {
            ...position,
            Height: position.Height
              ? position.Height + height
              : defaultWidthHeight(widgetType).height + height
          };
        }
        return position;
      });
      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === index) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });

      const newUpdateSigner = xyPosition.map((obj) => {
        if (obj.Id === userId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setXyPosition(newUpdateSigner);
    }
  } else {
    let getXYdata = xyPosition[index].pos;

    const updatePosition = getXYdata.map((position) => {
      if (position.key === signKey) {
        return {
          ...position,
          Height: position.Height
            ? position.Height + height
            : defaultWidthHeight(widgetType).height + height
        };
      }
      return position;
    });

    const updatePlaceholder = xyPosition.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: updatePosition };
      }
      return obj;
    });
    setXyPosition(updatePlaceholder);
  }
};
//calculate width and height
export const calculateInitialWidthHeight = (widgetData) => {
  const intialText = widgetData;
  const span = document.createElement("span");
  span.textContent = intialText;
  span.style.font = `12px`; // here put your text size and font family
  span.style.display = "hidden";
  document.body.appendChild(span);
  const width = span.offsetWidth;
  const height = span.offsetHeight;

  document.body.removeChild(span);
  return { getWidth: width, getHeight: height };
};
export const widgetDataValue = (type, value) => {
  switch (type) {
    case "name":
      return value?.Name;
    case "company":
      return value?.Company;
    case "job title":
      return value?.JobTitle;
    case "email":
      return value?.Email;
    default:
      return "";
  }
};
export const addInitialData = (signerPos, setXyPosition, value, userId) => {
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      if (item.Id === userId) {
        return {
          ...item,
          placeHolder: addInitialData(
            item.placeHolder,
            setXyPosition,
            value,
            userId
          )
        };
      } else {
        return item;
      }
    } else if (item.pos && item.pos.length > 0) {
      // If there is no nested array, add the new field
      return {
        ...item,
        pos: addInitialData(item.pos, setXyPosition, value, userId)
        // Adjust this line to add the desired field
      };
    } else {
      const widgetData = widgetDataValue(item.type, value);
      if (["name", "company", "job title", "email"].includes(item.type)) {
        return {
          ...item,
          options: {
            ...item.options,
            defaultValue: item?.options?.defaultValue || widgetData
          }
        };
      } else {
        return item;
      }
    }
  });
};

//function for embed document id
export const embedDocId = async (pdfOriginalWH, pdfDoc, documentId) => {
  const appName =
    "OpenSign™";
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = await fileasbytes(
    "https://cdn.opensignlabs.com/webfonts/times.ttf"
  );
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  //pdfOriginalWH contained all pdf's pages width and height
  for (let i = 0; i < pdfOriginalWH?.length; i++) {
    const fontSize = 10;
    const textContent =
          documentId && `${appName} DocumentId: ${documentId} `;
    const pages = pdfDoc.getPages();
    const page = pages[i];
    const getSize = pdfOriginalWH[i];
    try {
      const getObj = compensateRotation(
        page.getRotation().angle,
        10,
        5,
        1,
        getSize,
        fontSize,
        rgb(0.5, 0.5, 0.5),
        font,
        page
      );
      page.drawText(textContent, getObj);
    } catch (err) {
      console.log("Err in embed docId on page", i + 1, err?.message);
    }
  }
};

//function for save button to save signature or image url
export function onSaveSign(
  type,
  xyPosition,
  index,
  signKey,
  signatureImg,
  defaultImgWH,
  isDefaultSign,
  isTypeText,
  typedSignature,
  isAutoSign,
  widgetsType,
  isApplyAll
) {
  let getIMGWH, posWidth, posHeight;
  let getXYdata = xyPosition[index].pos;
  const updateXYData = getXYdata.map((position) => {
    if (position.key === signKey) {
      if (isDefaultSign === "initials") {
        let imgWH = { width: position.Width, height: position.Height };
        getIMGWH = calculateImgAspectRatio(imgWH, position);
      } else if (isDefaultSign === "default") {
        getIMGWH = calculateImgAspectRatio(defaultImgWH, position);
      } else if (isTypeText) {
        getIMGWH = {
          newWidth: defaultImgWH.width,
          newHeight: defaultImgWH.height
        };
      } else {
        const defaultWidth = defaultWidthHeight(position?.type).width;
        const defaultHeight = defaultWidthHeight(position?.type).height;

        getIMGWH = calculateImgAspectRatio(
          {
            width: defaultWidth ? defaultWidth : 150,
            height: defaultHeight ? defaultHeight : 60
          },
          position
        );
      }
      posWidth = getIMGWH ? getIMGWH.newWidth : 150;
      posHeight = getIMGWH ? getIMGWH.newHeight : 60;
      return {
        ...position,
        Width: posWidth,
        Height: posHeight,
        SignUrl: signatureImg,
        ...(type && { signatureType: type }),
        options: { ...position.options, response: signatureImg },
        ...(typedSignature && { typeSignature: typedSignature })
      };
    }
    return position;
  });

  const updateXYposition = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });
  //condition  when draw/upload signature/initials then apply it all related to widgets (signature,image,typed signature or default signature)
  if (isApplyAll || isAutoSign) {
    const updatedArray = updateXYposition.map((page) => ({
      ...page,
      pos: page.pos.map(
        (item) =>
          item.type === widgetsType
            ? {
                ...item,
                Width: posWidth,
                Height: posHeight,
                SignUrl: signatureImg,
                ...(type && { signatureType: type }),
                options: { ...item.options, response: signatureImg },
                ...(typedSignature && { typeSignature: typedSignature })
              }
            : item // Otherwise, keep it unchanged
      )
    }));
    return updatedArray;
  } else {
    return updateXYposition;
  }
}

//function to use After setting the signature URL for the first signature widget, clicking on subsequent
//signature widgets should automatically apply and display the signature. apply for initial,signature and stamp widget
export const handleCopySignUrl = (
  currentPos,
  existSignPosition,
  setXyPosition,
  xyPosition,
  pageNumber,
  signerObjectId
) => {
  //get current signer details
  const currentSigner = xyPosition.filter(
    (data) => data.signerObjId === signerObjectId
  );
  //get current signer placeholder details
  const placeholderPosition = currentSigner[0].placeHolder;
  //get current pagenumber position
  const getcurrentPagePosition = placeholderPosition.find(
    (data) => data.pageNumber === pageNumber
  );
  let getXYdata = getcurrentPagePosition.pos;
  const updatePos = getXYdata.map((x) => {
    //update widgets sign url details
    if (x.key === currentPos.key) {
      return {
        ...x,
        Width: existSignPosition.Width,
        Height: existSignPosition.Height,
        SignUrl: existSignPosition.SignUrl,
        signatureType: existSignPosition.signatureType,
        options: { ...x.options, response: existSignPosition.SignUrl },
        ...(existSignPosition.typedSignature && {
          typeSignature: existSignPosition.typedSignature
        })
      };
    }
    return x;
  });
  const updateXYposition = placeholderPosition.map((obj) => {
    if (obj.pageNumber === pageNumber) {
      return { ...obj, pos: updatePos };
    }
    return obj;
  });
  const newUpdateSigner = xyPosition.map((obj) => {
    if (obj.signerObjId === signerObjectId) {
      return { ...obj, placeHolder: updateXYposition };
    }
    return obj;
  });
  setXyPosition(newUpdateSigner);
};
export const calculateImgAspectRatio = (imgWH, pos) => {
  let newWidth, newHeight;

  const placeholderHeight = pos && pos.Height ? pos.Height : 60;
  const aspectRatio = imgWH.width / imgWH.height;
  newWidth = aspectRatio * placeholderHeight;
  newHeight = placeholderHeight;

  return { newHeight, newWidth };
};

//function for upload stamp or image
export function onSaveImage(
  xyPosition,
  index,
  signKey,
  imgWH,
  image,
  isAutoSign,
  widgetsType,
  isApplyAll
) {
  let getIMGWH;

  //get current page position
  const getXYData = xyPosition[index].pos;
  const updateXYData = getXYData.map((position) => {
    if (position.key === signKey) {
      getIMGWH = calculateImgAspectRatio(imgWH, position);

      return {
        ...position,
        Width: getIMGWH.newWidth,
        Height: getIMGWH.newHeight,
        SignUrl: image.src,
        ImageType: image.imgType,
        options: {
          ...position.options,
          response: image.src
        }
      };
    }
    return position;
  });

  const updateXYposition = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });
  //condition  when user upload(stamp) then apply it all related to widgets
  if (isApplyAll || isAutoSign) {
    const updatedArray = updateXYposition.map((page) => ({
      ...page,
      pos: page.pos.map(
        (item) =>
          item.type === widgetsType && item.type !== "image"
            ? {
                ...item,
                Width: getIMGWH.newWidth,
                Height: getIMGWH.newHeight,
                SignUrl: image.src,
                ImageType: image.imgType,
                options: {
                  ...item.options,
                  response: image.src
                }
              }
            : item // Otherwise, keep it unchanged
      )
    }));
    return updatedArray;
  } else {
    return updateXYposition;
  }
}

//function for select image and upload image
export const onImageSelect = (setImgWH, setImage, file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function (e) {
    let width, height;
    const image = new Image();
    image.src = e.target.result;
    image.onload = function () {
      width = image.width;
      height = image.height;
      const aspectRatio = 460 / 184;
      const imgR = width / height;
      if (imgR > aspectRatio) {
        width = 460;
        height = 460 / imgR;
      } else {
        width = 184 * imgR;
        height = 184;
      }
      setImgWH({ width: width, height: height });
    };
    image.src = reader.result;
    setImage({ src: image.src, imgType: file.type });
  };
};
export const compressedFileSize = (file, setImgWH, setImage) => {
  // Create a new FileReader instance to read the uploaded file
  const reader = new FileReader();

  // Event listener triggered when the file is read successfully
  reader.onload = (e) => {
    // Create a new Image instance to manipulate the image data
    const img = new Image();

    // Set the image source to the file's data URL (base64 string)
    img.src = e.target.result;

    // Event listener triggered when the image is fully loaded
    img.onload = () => {
      // Create a canvas element to resize and compress the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d"); // Get the drawing context of the canvas

      // Set the canvas dimensions, ensuring they don't exceed 1920x1920
      canvas.width = Math.min(img.width, 1920); // Limit width to 1920px
      canvas.height = Math.min(img.height, 1920); // Limit height to 1920px

      // Draw the image onto the canvas with the specified dimensions
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Get the original file type (default to "image/png" if not recognized)
      const fileType = file.type || "image/png";
      // Compress the image and convert it into a Blob
      canvas.toBlob(
        (blob) => {
          // Create a new File object from the compressed Blob
          const compressedFile = new File([blob], file.name, {
            type: fileType, // Set the file type to JPEG
            lastModified: Date.now() // Update the last modified timestamp
          });
          // Pass the compressed file to a custom function for further processing
          onImageSelect(setImgWH, setImage, compressedFile);
        },
        fileType, // Output format for the compressed image
        0.3 // Compression quality (30%)
      );
    };
  };

  // Read the file as a data URL (base64 string) to be processed
  reader.readAsDataURL(file);
};
//convert https url to base64
export const fetchImageBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  } catch (error) {
    throw new Error("Error converting URL to base64:", error);
  }
};
//function for select image and upload image
export const changeImageWH = async (base64Image) => {
  const newWidth = 300;
  const newHeight = 120;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const resizedBase64 = canvas.toDataURL("image/png", 1.0);
      resolve(resizedBase64);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};

const getWidgetsFontColor = (type) => {
  switch (type) {
    case "red":
      return rgb(1, 0, 0);
    case "black":
      return rgb(0, 0, 0);
    case "blue":
      return rgb(0, 0, 1);
    case "yellow":
      return rgb(0.9, 1, 0);
    default:
      return rgb(0, 0, 0);
  }
};
//function for embed multiple signature using pdf-lib
export const multiSignEmbed = async (
  pdfOriginalWH,
  widgets,
  pdfDoc,
  signyourself,
  scale
) => {
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = await fileasbytes(
    "https://cdn.opensignlabs.com/webfonts/times.ttf"
  );
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  let hasError = false;
  for (let item of widgets) {
    //pdfOriginalWH contained all pdf's pages width and height
    //'getSize' is used to get particular pdf's page width and height
    const getSize = pdfOriginalWH.find(
      (page) => page?.pageNumber === item?.pageNumber
    );
    if (hasError) break; // Stop the outer loop if an error occurred
    const typeExist = item.pos.some((data) => data?.type);
    let updateItem;

    if (typeExist) {
      if (signyourself) {
        updateItem = item.pos;
      } else {
        // Checking required and optional widget types
        // For both required and optional widgets, handle signurl, defaultValue, and response as the widget's data
        // If the widget type is checkbox or radio (whether required or optional), we don't need to validate its value.
        // Instead, add an empty checkbox/radio, or if a value exists, mark the checkbox/radio as checked.
        updateItem = item.pos.filter(
          (data) =>
            data?.options?.SignUrl ||
            data?.options?.defaultValue ||
            data?.options?.response ||
            data?.type === "checkbox" ||
            data?.type === radioButtonWidget
        );
      }
    } else {
      updateItem = item.pos;
    }
    const pageNo = item.pageNumber;
    const widgetsPositionArr = updateItem;
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const page = pages[pageNo - 1];
    const images = await Promise.all(
      widgetsPositionArr.map(async (widget) => {
        // `SignUrl` this is wrong nomenclature and maintain for older code in this options we save base64 of signature image from sign pad
        let signbase64 = widget.SignUrl && widget.SignUrl;
        if (signbase64) {
          let arr = signbase64.split(","),
            mime = arr[0].match(/:(.*?);/)[1];
          const res = await fetch(signbase64);
          const arrayBuffer = await res.arrayBuffer();
          const obj = { mimetype: mime, arrayBuffer: arrayBuffer };
          return obj;
        }
      })
    );
    for (let [id, position] of widgetsPositionArr.entries()) {
      if (hasError) break; // Stop the inner loop if an error occurred
      try {
        let img;
        if (
          ["signature", "stamp", "initials", "image"].includes(position.type)
        ) {
          if (images[id].mimetype === "image/png") {
            img = await pdfDoc.embedPng(images[id].arrayBuffer);
          } else {
            img = await pdfDoc.embedJpg(images[id].arrayBuffer);
          }
        } else if (!position.type) {
          //  to handle old widget when only stamp and signature are exists
          if (images[id].mimetype === "image/png") {
            img = await pdfDoc.embedPng(images[id].arrayBuffer);
          } else {
            img = await pdfDoc.embedJpg(images[id].arrayBuffer);
          }
        }
        let widgetWidth, widgetHeight;
        widgetWidth = placeholderWidth(position);
        widgetHeight = placeholderHeight(position);
        const xPos = (position) => {
          const resizePos = position.xPosition;
          //first two condition handle to old data already saved from mobile view which scale point diffrent
          if (isMobile && position.isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            const x = resizePos * (position.scale / scale);
            return x * scale;
          } else if (position.isMobile && position.scale) {
            const x = resizePos * position.scale;
            return x;
          } else {
            return resizePos;
          }
        };
        const yPos = (position) => {
          const resizePos = position.yPosition;

          if (position.isMobile && position.scale) {
            if (position.IsResize) {
              const y = resizePos * position.scale;
              return y;
            } else {
              const y = resizePos * position.scale;
              return y;
            }
          } else {
            const WidgetsTypeTextExist = [
              textWidget,
              textInputWidget,
              cellsWidget,
              "name",
              "company",
              "job title",
              "date",
              "email"
            ].includes(position.type);
            const yPosition = WidgetsTypeTextExist ? resizePos + 6 : resizePos;
            return yPosition;
          }
        };
        const color = position?.options?.fontColor;
        const updateColorInRgb = getWidgetsFontColor(color);
        const fontSize = parseInt(position?.options?.fontSize || 12);
        const isTextTypeWidget = [
          textWidget,
          textInputWidget,
          cellsWidget,
          "name",
          "company",
          "job title",
          "date",
          "email"
        ].includes(position.type);
        if (position.type === "checkbox") {
          // Determine layout mode: 'vertical' (default) or 'horizontal'
          // const isHorizontal = position.layout === "horizontal";
          const isHorizontal =
            position?.options?.layout === "horizontal" ? true : false;
          // Initial “cursor” positions
          let currentX = xPos(position);
          let currentY = yPos(position) + 2;
          // Size and spacing settings
          const checkboxSize = fontSize - 1; // checkbox diameter
          const checkboxTextGapFromLeft = fontSize + 5; // gap between box and its label
          const verticalGap = fontSize + 3.2; // gap between two rows (vertical layout)
          let horizontalGap = 0; // will compute after drawing each label
          if (position?.options?.values.length > 0) {
            position.options.values.forEach((item, ind) => {
              // 1. Advance the “cursor” on second+ iteration
              if (ind > 0) {
                if (isHorizontal) {
                  currentX += horizontalGap;
                } else {
                  currentY += verticalGap;
                }
              }
              // 2. Determine whether this checkbox should be checked
              let isCheck = false;
              if (
                position.options.response &&
                position.options.response.length > 0
              ) {
                isCheck = position.options.response.includes(ind);
              } else if (position.options.defaultValue) {
                isCheck = position.options.defaultValue.includes(ind);
              }

              // 3. Draw the label (if labels are not hidden)
              if (!position.options.isHideLabel) {
                const labelX = currentX + checkboxTextGapFromLeft;
                const labelY = currentY - 3;

                const optionsPosition = compensateRotation(
                  page.getRotation().angle,
                  labelX,
                  labelY,
                  1,
                  getSize,
                  fontSize,
                  updateColorInRgb,
                  font,
                  page
                );
                page.drawText(item, optionsPosition);
              }
              // 4. Create and place the actual checkbox
              const checkboxRandomId = "checkbox" + randomId();
              const checkbox = form.createCheckBox(checkboxRandomId);
              let checkboxObj = {
                x: currentX,
                y: currentY,
                width: checkboxSize,
                height: checkboxSize
              };
              checkboxObj = getWidgetPosition(page, checkboxObj, 1, getSize);
              checkbox.addToPage(page, checkboxObj);
              // 5. Check or uncheck as needed, then make read‐only
              if (isCheck) {
                checkbox.check();
              } else {
                checkbox.uncheck();
              }
              checkbox.enableReadOnly();
              // 6. If horizontal layout, compute how far to shift next checkbox‐circle
              if (isHorizontal) {
                // Measure the width of this label text at `fontSize`
                const textWidth = font.widthOfTextAtSize(item, fontSize);
                // Next checkbox should come after: [box] + gap + [label text] + extra 10pt padding
                horizontalGap =
                  checkboxSize + checkboxTextGapFromLeft + textWidth;
              }
            });
          }
        } else if (isTextTypeWidget) {
          let textContent = "";
          if (position?.options?.response) {
            textContent = position.options?.response;
          } else if (position?.options?.defaultValue) {
            textContent = position?.options?.defaultValue;
          }
          if (position.type === cellsWidget) {
            const cellCount =
              position?.options?.cellCount || textContent.length || 1;
            const charWidth = widgetWidth / cellCount;
            const y = yPos(position) - 4;
            for (let i = 0; i < cellCount; i++) {
              const ch = textContent[i] || "";
              const charX =
                xPos(position) +
                charWidth * i +
                (charWidth - font.widthOfTextAtSize(ch, fontSize)) / 2;
              const textPosition = compensateRotation(
                page.getRotation().angle,
                charX,
                y,
                1,
                getSize,
                fontSize,
                updateColorInRgb,
                font,
                page
              );
              if (ch) page.drawText(ch, textPosition);
            }
          } else {
            const fixedWidth = widgetWidth; // Set your fixed width
            const isNewOnEnterLineExist = textContent.includes("\n");

            // Function to break text into lines based on the fixed width
            const NewbreakTextIntoLines = (textContent, width) => {
              const lines = [];
              let currentLine = "";

              for (const word of textContent.split(" ")) {
                //get text line width
                const lineWidth = font.widthOfTextAtSize(
                  `${currentLine} ${word}`,
                  fontSize
                );
                //check text content line width is less or equal to container width
                if (lineWidth <= width) {
                  currentLine += ` ${word}`;
                } else {
                  lines.push(currentLine.trim());
                  currentLine = `${word}`;
                }
              }
              lines.push(currentLine.trim());
              return lines;
            };
            // Function to break text into lines based on when user go next line on press enter button
            const breakTextIntoLines = (textContent, width) => {
              const lines = [];
              for (const word of textContent.split("\n")) {
                const lineWidth = font.widthOfTextAtSize(`${word}`, fontSize);
                //checking string length to container width
                //if string length is less then container width it means user press enter button
                if (lineWidth <= width) {
                  lines.push(word);
                }
                //else adjust text content according to width and send it in new line
                else {
                  const newLine = NewbreakTextIntoLines(word, width);
                  lines.push(...newLine);
                }
              }

              return lines;
            };
            //check if text content have `\n` string it means user press enter to go next line and handle condition
            //else auto adjust text content according to container width
            const lines = isNewOnEnterLineExist
              ? breakTextIntoLines(textContent, fixedWidth)
              : NewbreakTextIntoLines(textContent, fixedWidth);
            // Set initial y-coordinate for the first line
            let x = xPos(position);
            let y = yPos(position) - 4;
            // Embed each line on the page
            for (const line of lines) {
              const textPosition = compensateRotation(
                page.getRotation().angle,
                x,
                y,
                1,
                getSize,
                fontSize,
                updateColorInRgb,
                font,
                page
              );
              page.drawText(line, textPosition);
              y += 18; // Adjust the line height as needed
            }
          }
        } else if (position.type === "dropdown") {
          const dropdownRandomId = "dropdown" + randomId();
          const dropdown = form.createDropdown(dropdownRandomId);
          dropdown.addOptions(position?.options?.values);
          if (position?.options?.response) {
            dropdown.select(position.options?.response);
          } else if (position?.options?.defaultValue) {
            dropdown.select(position?.options?.defaultValue);
          }
          // Define the default appearance string
          // Example format: `/FontName FontSize Tf 0 g` where:
          // - `/FontName` is the name of the font (e.g., `/Helv` for Helvetica)
          // - `FontSize` is the size you want to set (e.g., 12)
          // - `Tf` specifies the font and size
          // - `0 g` sets the text color to black
          const defaultAppearance = `/Helv ${fontSize} Tf 0 g`;
          // Set the default appearance for the dropdown field
          dropdown.acroField.setDefaultAppearance(defaultAppearance);
          dropdown.setFontSize(fontSize);
          const dropdownObj = {
            x: xPos(position),
            y: yPos(position),
            width: widgetWidth,
            height: widgetHeight
          };
          const dropdownOption = getWidgetPosition(
            page,
            dropdownObj,
            1,
            getSize
          );
          const dropdownSelected = { ...dropdownOption, font: font };
          dropdown.defaultUpdateAppearances(font);
          dropdown.addToPage(page, dropdownSelected);
          dropdown.enableReadOnly();
        } else if (position.type === radioButtonWidget) {
          const radioRandomId = "radio" + randomId();
          const radioGroup = form.createRadioGroup(radioRandomId);
          //getting radio buttons options text font size
          const optionsFontSize = fontSize; // font size for option text
          const radioTextGapFromLeft = fontSize + 6; // gap between circle and its label
          const radioSize = fontSize; // circle diameter (square of width×height)
          // Initial “cursor” positions (from your existing helpers)
          let currentX = xPos(position) + 2;
          let currentY = yPos(position);
          // Vertical gap between two radio‐rows
          const verticalGap = fontSize + 6;
          // We’ll compute horizontalGap on the fly—after drawing each label
          // Initialize to zero (will be set after first option is placed)
          let horizontalGap = 0;
          // Determine layout mode: 'vertical' or 'horizontal'.
          // (You mentioned “add one variable called layout” – here we read it from position.layout.)
          const isHorizontal =
            position?.options?.layout === "horizontal" ? true : false;
          // Loop through each option in the group
          if (position?.options?.values.length > 0) {
            position.options.values.forEach((item, ind) => {
              // 1. Advance cursor on second+ iteration
              if (ind > 0) {
                if (isHorizontal) {
                  // Move to the right by horizontalGap
                  currentX += horizontalGap;
                } else {
                  // Move down by verticalGap (vertical stacking)
                  currentY += verticalGap;
                }
              }
              // 2. Draw the label text (if not hidden)
              if (!position?.options?.isHideLabel) {
                // Compute where to draw the text (just to the right of the circle)
                const labelX = currentX + radioTextGapFromLeft;
                const labelY = currentY - 2;
                const optionsPosition = compensateRotation(
                  page.getRotation().angle,
                  labelX,
                  labelY,
                  1,
                  getSize,
                  optionsFontSize,
                  updateColorInRgb,
                  font,
                  page
                );

                page.drawText(item, optionsPosition);
              }
              // 3. Place the radio‐circle itself at (currentX, currentY)
              let radioObj = {
                x: currentX,
                y: currentY,
                width: radioSize,
                height: radioSize
              };

              radioObj = getWidgetPosition(page, radioObj, 1, getSize);
              radioGroup.addOptionToPage(item, page, radioObj);
              // 4. If horizontal layout, re-compute horizontalGap for next iteration:
              if (isHorizontal) {
                // Measure how wide the label text is, so we know how far to shift next circle
                const textWidth = font.widthOfTextAtSize(item, optionsFontSize);
                // radioSize = the circle.  radioTextGapFromLeft = gap between circle and label.
                // Add a small extra padding (e.g. 10pt) before placing next circle.
                horizontalGap = radioSize + radioTextGapFromLeft + textWidth;
              }
            });
          }
          // 5. Pre‐select a value if provided
          if (position?.options?.response) {
            radioGroup.select(position.options?.response);
          } else if (position?.options?.defaultValue) {
            radioGroup.select(position?.options?.defaultValue);
          }
          // 6. Set to read‐only (if required)
          radioGroup.enableReadOnly();
        } else {
          const signature = {
            x: xPos(position),
            y: yPos(position),
            width: widgetWidth,
            height: widgetHeight
          };

          const imageOptions = getWidgetPosition(page, signature, 1, getSize);
          page.drawImage(img, imageOptions);
        }
      } catch (err) {
        console.log("Err in embed widget on page ", pageNo, err?.message);
        hasError = true; // Set the flag to stop both loops
        break; // Exit inner loop
      }
    }
  }
  if (!hasError) {
    const pdfBytes = await pdfDoc.saveAsBase64({ useObjectStreams: false });
    return pdfBytes;
  } else {
    return {
      error:
        "This pdf is not compatible with opensign please contact <support@opensignlabs.com>"
    };
  }
};

// function for validating URLs
export function urlValidator(url) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
}
//calculate placeholder width to embed in pdf
export const placeholderWidth = (pos) => {
  const defaultWidth = defaultWidthHeight(pos.type).width;
  const posWidth = pos.Width || defaultWidth;

  //condition to handle old data saved from mobile view to get widthh
  if (pos.isMobile && pos.scale) {
    if (pos.IsResize) {
      return posWidth;
    } else {
      return posWidth * pos.scale;
    }
  } else {
    return posWidth;
  }
};

//calculate placeholder height to embed in pdf
export const placeholderHeight = (pos) => {
  const posHeight = pos.Height;
  const defaultHeight = defaultWidthHeight(pos.type).height;
  const posUpdateHeight = posHeight || defaultHeight;

  //condition to handle old data saved from mobile view to get height
  if (pos.isMobile && pos.scale) {
    if (pos.IsResize) {
      return posUpdateHeight;
    } else {
      return posUpdateHeight * pos.scale;
    }
  } else {
    return posUpdateHeight;
  }
};

//function for getting contracts_contactbook details
export const contactBook = async (
  objectId,
) => {
  const result = await axios
    .get(
      `${localStorage.getItem(
        "baseUrl"
      )}classes/contracts_Contactbook?where={"objectId":"${objectId}"}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token":
            localStorage.getItem("accesstoken")
        }
      }
    )
    .then((Listdata) => {
      const json = Listdata.data;
      const res = json.results;
      return res;
    })

    .catch((err) => {
      console.log("Err in contracts_Contactbook class ", err);
      return "Error: Something went wrong!";
    });
  return result;
};

//function for getting document details from contract_Documents class
export const contractDocument = async (
  documentId,
) => {
  const data = { docId: documentId };
  const token =
        { sessionToken: localStorage.getItem("accesstoken") };
  const documentDeatils = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getDocument`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;
      let data = [];
      if (json && json.result.error) {
        return json;
      } else if (json && json.result) {
        data.push(json.result);
        return data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log("Err in getDocument cloud function ", err);
      return "Error: Something went wrong!";
    });

  return documentDeatils;
};

//function for add default signature or image for all requested location
export const addDefaultSignatureImg = (xyPosition, defaultSignImg, type) => {
  let imgWH = { width: "", height: "" };
  const img = new Image();
  img.src = defaultSignImg;
  if (img.complete) {
    imgWH = {
      width: img.width,
      height: img.height
    };
  }

  let xyDefaultPos = [];
  for (let i = 0; i < xyPosition.length; i++) {
    let getIMGWH;
    const getXYdata = xyPosition[i].pos;
    const getPageNo = xyPosition[i].pageNumber;
    const getPosData = getXYdata;

    const addSign = getPosData.map((position) => {
      getIMGWH = calculateImgAspectRatio(imgWH, position);
      if (position.type) {
        if (position?.type === type) {
          return {
            ...position,
            SignUrl: defaultSignImg,
            Width: getIMGWH.newWidth,
            Height: getIMGWH.newHeight,
            ImageType: "default",
            options: {
              ...position.options,
              response: defaultSignImg
            }
          };
        }
      } else if (position && !position.isStamp) {
        return {
          ...position,
          SignUrl: defaultSignImg,
          Width: getIMGWH.newWidth,
          Height: getIMGWH.newHeight,
          ImageType: "default",
          options: {
            ...position.options,
            response: defaultSignImg
          }
        };
      }
      return position;
    });

    const newXypos = {
      pageNumber: getPageNo,
      pos: addSign
    };
    xyDefaultPos.push(newXypos);
  }
  return xyDefaultPos;
};

//function for get month
export const getMonth = (date) => {
  const newMonth = new Date(date).getMonth();
  return newMonth;
};

//function to create/copy widget next to already dropped widget
export const handleCopyNextToWidget = (
  position,
  widgetType,
  xyPosition,
  index,
  setXyPosition,
  userId
) => {
  let filterSignerPos;
  //get position of previous widget and create new widget next to that widget on same data except
  // xPosition and key
  let newposition = position;
  const calculateXPosition = parseInt(position.xPosition) + 10;
  const calculateYPosition = parseInt(position.yPosition) + 10;

  const newId = randomId();
  newposition = {
    ...newposition,
    xPosition: calculateXPosition,
    yPosition: calculateYPosition,
    key: newId
  };
  //if condition to create widget in request-sign flow
  if (userId) {
    filterSignerPos = xyPosition.filter((data) => data.Id === userId);
    const getPlaceHolder = filterSignerPos && filterSignerPos[0]?.placeHolder;
    const getPageNumer = getPlaceHolder?.filter(
      (data) => data.pageNumber === index
    );
    const getXYdata = getPageNumer && getPageNumer[0]?.pos;
    getXYdata.push(newposition);
    if (getPageNumer && getPageNumer.length > 0) {
      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === index) {
          return { ...obj, pos: getXYdata };
        }
        return obj;
      });

      const newUpdateSigner = xyPosition.map((obj) => {
        if (obj.Id === userId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setXyPosition(newUpdateSigner);
    }
  } else {
    let getXYdata = xyPosition[index]?.pos || [];
    getXYdata.push(newposition);
    const updatePlaceholder = xyPosition.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: getXYdata };
      }
      return obj;
    });

    setXyPosition(updatePlaceholder);
  }
};

export const getFileName = (fileUrl) => {
  if (fileUrl) {
    const url = new URL(fileUrl);
    const filename = url.pathname.substring(url.pathname.indexOf("_") + 1);
    return filename || "";
  } else {
    return "";
  }
};

//fetch tenant app logo from `partners_Tenant` class by domain name
export const getAppLogo = async () => {
    const domain = window.location.host;
    try {
      const tenant = await Parse.Cloud.run("getlogobydomain", {
        domain: domain
      });
      if (tenant) {
          localStorage.setItem("appname", "OpenSign™");
        return { logo: tenant?.logo, user: tenant?.user };
      }
    } catch (err) {
      console.log("err in getlogo ", err);
      if (err?.message?.includes("valid JSON")) {
        return { logo: appInfo.applogo, user: "exist", error: "invalid_json" };
      } else {
        return { logo: appInfo.applogo, user: "exist" };
      }
    }
};
export const getTenantDetails = async (
  objectId,
  contactId
) => {
  try {
    const url = `${localStorage.getItem("baseUrl")}functions/gettenant`;
    const parseAppId = localStorage.getItem("parseAppId");
    const accesstoken = localStorage.getItem("accesstoken");
    const token =
          { "X-Parse-Session-Token": accesstoken };
    const data =
          { userId: objectId, contactId: contactId };
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

//function to convert variable string name to variable value of email body and subject
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
//`handleSendOTP` function is used to send otp on user's email using `SendOTPMailV1` cloud function
export const handleSendOTP = async (email) => {
  try {
    let url = `${localStorage.getItem("baseUrl")}functions/SendOTPMailV1`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId")
    };
    const body = {
      email: email,
    };
    await axios.post(url, body, { headers: headers });
  } catch (error) {
    alert(error.message);
  }
};
export const fetchUrl = async (url, pdfName) => {
  const appName =
    "OpenSign™";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      alert("something went wrong, refreshing this page may solve this issue.");
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    saveAs(blob, `${sanitizeFileName(pdfName)}_signed_by_${appName}.pdf`);
  } catch (error) {
    alert("something went wrong, refreshing this page may solve this issue.");
    console.error("Error downloading the file:", error);
  }
};
export const getSignedUrl = async (
  pdfUrl,
  docId,
  templateId
) => {
  //use only axios here due to public template sign
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
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      }
    }
  );
  const url = axiosRes.data.result;
  return url;
};
//download base64 type pdf
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
//handle download signed pdf
export const handleDownloadPdf = async (
  pdfDetails,
  setIsDownloading,
  pdfBase64
) => {
  const pdfName =
    pdfDetails?.[0]?.Name?.length > 100
      ? pdfDetails?.[0]?.Name?.slice(0, 100)
      : pdfDetails?.[0]?.Name || "Document";
  if (pdfBase64) {
    await fetchBase64(pdfBase64, pdfName);
    setIsDownloading && setIsDownloading("");
  } else {
    const pdfUrl = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
    setIsDownloading && setIsDownloading("pdf");
    const docId = pdfDetails?.[0]?.objectId || "";
    try {
      const url = await getSignedUrl(
        pdfUrl,
        docId,
      );
      await fetchUrl(url, pdfName);
      setIsDownloading && setIsDownloading("");
    } catch (err) {
      console.log("err in getsignedurl", err);
      setIsDownloading("");
      alert("something went wrong, refreshing this page may solve this issue.");
    }
  }
};

export const sanitizeFileName = (pdfName) => {
  // Replace spaces with underscore
  return pdfName.replace(/ /g, "_");
};
//function for print digital sign pdf
export const handleToPrint = async (event, setIsDownloading, pdfDetails) => {
  event.preventDefault();
  setIsDownloading("pdf");
  const pdfUrl = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
  const docId = pdfDetails?.[0]?.objectId || "";

  try {
    // const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
    //`localStorage.getItem("baseUrl")` is also use in public-profile flow for public-sign
    //if we give this `appInfo.baseUrl` as a base url then in public-profile it will create base url of it's window.location.origin ex- opensign.me which is not base url
    const axiosRes = await axios.post(
      `${localStorage.getItem("baseUrl")}/functions/getsignedurl`,
      {
        url: pdfUrl,
        docId: docId,
      },
      {
        headers: {
          "content-type": "Application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    );
    const url = axiosRes.data.result;
    const pdf = await getBase64FromUrl(url);
    const isAndroidDevice = navigator.userAgent.match(/Android/i);
    const isAppleDevice =
      (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;
    if (isAndroidDevice || isAppleDevice) {
      const byteArray = Uint8Array.from(
        atob(pdf)
          .split("")
          .map((char) => char.charCodeAt(0))
      );
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setIsDownloading("");
    } else {
      printModule({ printable: pdf, type: "pdf", base64: true });
      setIsDownloading("");
    }
  } catch (err) {
    setIsDownloading("");
    console.log("err in getsignedurl", err);
    alert("something went wrong, refreshing this page may solve this issue.");
  }
};

//handle download signed pdf
export const handleDownloadCertificate = async (
  pdfDetails,
  setIsDownloading,
  isZip
) => {
  const appName =
    "OpenSign™";
  if (pdfDetails?.length > 0 && pdfDetails[0]?.CertificateUrl) {
    try {
      await fetch(pdfDetails[0] && pdfDetails[0]?.CertificateUrl);
      const certificateUrl = pdfDetails[0] && pdfDetails[0]?.CertificateUrl;
      if (isZip) {
        return certificateUrl;
      } else {
        saveAs(certificateUrl, `Certificate_signed_by_${appName}.pdf`);
      }
    } catch (err) {
      console.log("err in download in certificate", err);
    }
  } else {
    setIsDownloading("certificate");
    try {
      const data = { docId: pdfDetails[0]?.objectId };
      const docDetails = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getDocument`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      );
      if (docDetails.data && docDetails.data.result) {
        const doc = docDetails.data.result;
        if (doc?.CertificateUrl) {
          await fetch(doc?.CertificateUrl);
          const certificateUrl = doc?.CertificateUrl;
          if (isZip) {
            setIsDownloading("");
            return certificateUrl;
          } else {
            saveAs(certificateUrl, `Certificate_signed_by_${appName}.pdf`);
            setIsDownloading("");
          }
        } else {
          const generateRes = await axios.post(
            `${localStorage.getItem("baseUrl")}functions/generatecertificate`,
            data,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId")
              }
            }
          );
          if (generateRes?.data?.result?.CertificateUrl) {
            try {
              const certificateUrl = generateRes.data.result.CertificateUrl;
              const fetchCertificate = await fetch(certificateUrl);
              if (isZip) {
                setIsDownloading("");
                return certificateUrl;
              } else {
                // Convert the response into a Blob
                const certificateBlob = await fetchCertificate.blob();
                setIsDownloading("");
                saveAs(certificateBlob, `Certificate_signed_by_${appName}.pdf`);
              }
            } catch (err) {
              console.log("err in download in certificate", err);
              setIsDownloading("certificate_err");
            }
          } else {
            setIsDownloading("certificate_err");
          }
        }
      }
    } catch (err) {
      setIsDownloading("certificate_err");
      console.log("err in download in certificate", err);
      alert("something went wrong, refreshing this page may solve this issue.");
    }
  }
};
// Function to escape special characters in the search string
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
}
export async function findContact(
  value,
) {
  try {
    const baseURL = localStorage.getItem("baseUrl");
    const url = `${baseURL}functions/getsigners`;
    const token =
          { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      ...token
    };
    const axiosRes = await axios.post(url, { search: value }, { headers });
    const contactRes = axiosRes?.data?.result || [];
    if (contactRes) {
      const res = JSON.parse(JSON.stringify(contactRes));
      return res;
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}
// `compensateRotation` is used to calculate x and y position of widget on portait, landscape pdf for pdf-lib
function compensateRotation(
  pageRotation,
  x,
  y,
  scale,
  dimensions,
  fontSize,
  updateColorInRgb,
  font,
  page
) {
  // Ensure pageRotation is between 0 and 360 degrees
  pageRotation = ((pageRotation % 360) + 360) % 360;
  let rotationRads = (pageRotation * Math.PI) / 180;

  // Coordinates are from bottom-left
  let coordsFromBottomLeft = { x: x / scale };
  if (pageRotation === 90 || pageRotation === 270) {
    coordsFromBottomLeft.y = dimensions.width - (y + fontSize) / scale;
  } else {
    coordsFromBottomLeft.y = dimensions.height - (y + fontSize) / scale;
  }

  let drawX = null;
  let drawY = null;

  if (pageRotation === 90) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads) +
      dimensions.width;
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads);
  } else if (pageRotation === 180) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads) +
      dimensions.width;
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads) +
      dimensions.height;
  } else if (pageRotation === 270) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads);
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads) +
      dimensions.height;
  } else if (pageRotation === 0 || pageRotation === 360) {
    // No rotation or full rotation
    drawX = coordsFromBottomLeft.x;
    drawY = coordsFromBottomLeft.y;
  }
  if (font) {
    return {
      x: drawX,
      y: drawY,
      font,
      color: updateColorInRgb,
      size: fontSize,
      rotate: page.getRotation()
    };
  } else {
    return { x: drawX, y: drawY };
  }
}

// `getWidgetPosition` is used to calulcate position of image type widget like x, y, width, height for pdf-lib
function getWidgetPosition(page, image, sizeRatio, getSize) {
  let pageWidth;
  // pageHeight;
  if ([90, 270].includes(page.getRotation().angle)) {
    pageWidth = page.getHeight();
  } else {
    pageWidth = page.getWidth();
  }
  // eslint-disable-next-line
  if (!image?.hasOwnProperty("vpWidth")) {
    image["vpWidth"] = pageWidth;
  }

  const pageRatio = pageWidth / (image.vpWidth * sizeRatio);
  const imageWidth = image.width * sizeRatio * pageRatio;
  const imageHeight = image.height * sizeRatio * pageRatio;
  const imageX = image.x * sizeRatio * pageRatio;
  const imageYFromTop = image.y * sizeRatio * pageRatio;

  const correction = compensateRotation(
    page.getRotation().angle,
    imageX,
    imageYFromTop,
    1,
    getSize,
    imageHeight
  );

  return {
    width: imageWidth,
    height: imageHeight,
    x: correction.x,
    y: correction.y,
    rotate: page.getRotation()
  };
}
//function to use calculate pdf rendering scale in the container
export const getContainerScale = (pdfOriginalWH, pageNumber, containerWH) => {
  const getPdfPageWidth = pdfOriginalWH.find(
    (data) => data.pageNumber === pageNumber
  );
  const containerScale = containerWH?.width / getPdfPageWidth?.width || 1;
  return containerScale;
};

//function to get current laguage and set it in local
export const saveLanguageInLocal = (i18n) => {
  const detectedLanguage = i18n.language || "en";
  localStorage.setItem("i18nextLng", detectedLanguage);
};
//function to get default signatur eof current user from `contracts_Signature` class
export const getDefaultSignature = async (objectId) => {
  try {
    const query = new Parse.Query("contracts_Signature");
    query.equalTo("UserId", {
      __type: "Pointer",
      className: "_User",
      objectId: objectId
    });

    const result = await query.first();
    if (result) {
      const res = JSON.parse(JSON.stringify(result));
      const defaultSignature = res?.ImageURL
        ? await getBase64FromUrl(res?.ImageURL, true)
        : "";
      const defaultInitial = res?.Initials
        ? await getBase64FromUrl(res?.Initials, true)
        : "";

      return {
        status: "success",
        res: {
          id: result?.id,
          defaultSignature: defaultSignature,
          defaultInitial: defaultInitial
        }
      };
    }
  } catch (err) {
    console.log(
      "Error: error in fetch data in contracts_Signature",
      err?.message || err
    );
    return { status: "error" };
  }
};

//function to rotate pdf page
export async function rotatePdfPage(rotateDegree, pageNumber, pdfArrayBuffer) {
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
  // Get the page according to page number
  const page = pdfDoc.getPage(pageNumber);
  //get current page rotation angle
  const currentRotation = page.getRotation().angle;
  // Apply the rotation in the counterclockwise direction
  let newRotation = (currentRotation + rotateDegree) % 360;
  // Adjust for negative angles to keep within 0-359 range
  if (newRotation < 0) {
    newRotation += 360;
  }
  page.setRotation(degrees(newRotation));
  const pdfbase64 = await pdfDoc.saveAsBase64({ useObjectStreams: false });
  //convert base64 to arraybuffer is used in pdf-lib
  //pdfbase64 is used to show pdf rotated format
  const arrayBuffer = base64ToArrayBuffer(pdfbase64);
  //`base64` is used to show pdf
  return { arrayBuffer: arrayBuffer, base64: pdfbase64 };
}
export function base64ToArrayBuffer(base64) {
  // Decode the base64 string to a binary string
  const binaryString = atob(base64);
  // Create a new ArrayBuffer with the same length as the binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  // Convert the binary string to a byte array
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Return the ArrayBuffer
  return bytes.buffer;
}

export const convertBase64ToFile = async (
  pdfName,
  pdfBase64,
) => {
  const fileName = sanitizeFileName(pdfName) + ".pdf";
    try {
        const pdfFile = new Parse.File(fileName, { base64: pdfBase64 });
        // Save the Parse File if needed
        const pdfData = await pdfFile.save();
        const pdfUrl = pdfData.url();
        const fileRes = await getSecureUrl(pdfUrl);
        if (fileRes?.url) {
          return fileRes.url;
        }
    } catch (e) {
      console.log("error in convertbase64tofile", e);
    }
};
export const onClickZoomIn = (scale, zoomPercent, setScale, setZoomPercent) => {
  setScale(scale + 0.1 * scale);
  setZoomPercent(zoomPercent + 10);
};
export const onClickZoomOut = (
  zoomPercent,
  scale,
  setZoomPercent,
  setScale
) => {
  if (zoomPercent > 0) {
    if (zoomPercent === 10) {
      setScale(1);
    } else {
      setScale(scale - 0.1 * scale);
    }
    setZoomPercent(zoomPercent - 10);
  }
};

//function to use remove widgets from current page when user want to rotate page
export const handleRemoveWidgets = (
  setSignerPos,
  signerPos,
  pageNumber,
  setIsRotate
) => {
  const isSigners = signerPos.some((data) => data.signerPtr);
  //placeholder,template,draftTemplate flow
  if (isSigners) {
    const updatedSignerPos = signerPos.map((placeholderObj) => {
      return {
        ...placeholderObj,
        placeHolder: placeholderObj?.placeHolder?.filter(
          (data) => data?.pageNumber !== pageNumber
        )
      };
    });

    if (setIsRotate) {
      setSignerPos(updatedSignerPos);
      setIsRotate({ status: false, degree: 0 });
    } else {
      //after deleting pdf page we need to update page number of widgets
      //For example, consider a PDF with 3 pages where widgets are placed on the 2nd page.
      //If we delete the 1st page, the total number of pages will be reduced to 2. In this case,
      // the widgets need to be updated to reflect the new page numbering and should now appear on the 1st page.
      const updatePageNumber = updatedSignerPos?.map((placeholderObj) => {
        return {
          ...placeholderObj,
          placeHolder: placeholderObj?.placeHolder?.map((data) => {
            if (data.pageNumber > pageNumber) {
              return { ...data, pageNumber: data.pageNumber - 1 };
            } else {
              return data;
            }
          })
        };
      });
      setSignerPos(updatePageNumber);
    }
  } else {
    //signyourself flow
    const updatedSignerPos = signerPos?.filter(
      (data) => data?.pageNumber !== pageNumber
    );
    if (setIsRotate) {
      setSignerPos(updatedSignerPos);
      setIsRotate({ status: false, degree: 0 });
    } else {
      //after deleting pdf page we need to update page number of widgets
      //For example, consider a PDF with 3 pages where widgets are placed on the 2nd page.
      //If we delete the 1st page, the total number of pages will be reduced to 2. In this case,
      // the widgets need to be updated to reflect the new page numbering and should now appear on the 1st page.
      const updatePageNumber = updatedSignerPos?.map((data) => {
        if (data.pageNumber > pageNumber) {
          return { ...data, pageNumber: data.pageNumber - 1 };
        } else {
          return data;
        }
      });
      setSignerPos(updatePageNumber);
    }
  }
};
//function to show warning when user rotate page and there are some already widgets on that page
export const handleRotateWarning = (signerPos, pageNumber) => {
  const placeholderExist = signerPos?.some((placeholderObj) =>
    placeholderObj?.placeHolder?.some((data) => data?.pageNumber === pageNumber)
  );
  if (placeholderExist) {
    return true;
  } else {
    return false;
  }
};

// `generateTitleFromFilename` to generate Title of document from file name
export function generateTitleFromFilename(filename) {
  try {
    // Step 1: Trim whitespace
    let title = filename.trim();

    // Step 2: Remove the file extension (everything after the last '.')
    const lastDotIndex = title.lastIndexOf(".");
    if (lastDotIndex > 0) {
      title = title.substring(0, lastDotIndex);
    }

    // Step 3: Replace special characters (except Unicode letters, digits, spaces, and hyphens)
    title = title.replace(/[^\p{L}\p{N}\s-]/gu, " ");

    // Step 4: Replace multiple spaces with a single space
    title = title.replace(/\s+/g, " ");

    // Step 5: Capitalize first letter of each word (Title Case), handling Unicode characters
    title = title.replace(
      /\p{L}\S*/gu,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );

    // Step 6: Restrict length of title (optional, let's say 100 characters)
    if (title.length > 100) {
      title = title.substring(0, 100).trim();
    }

    // Step 7: Handle empty or invalid title by falling back to "Untitled Document"
    if (!title || title.length === 0) {
      return "Untitled Document";
    }

    return title;
  } catch (error) {
    // Handle unexpected errors gracefully by returning a default title
    console.error("Error generating title from filename:", error);
    return "Untitled Document";
  }
}

export const signatureTypes = [
  { name: "draw", enabled: true },
  { name: "typed", enabled: true },
  { name: "upload", enabled: true },
  { name: "default", enabled: true }
];

// `handleSignatureType` is used to return update signature types as per tenant or user
export async function handleSignatureType(tenantSignTypes, signatureType) {
  const docSignTypes = signatureType || signatureTypes;
  let updatedSignatureType = signatureType || signatureTypes;
  if (tenantSignTypes?.length > 0) {
    updatedSignatureType = tenantSignTypes?.map((item) => {
      const match = docSignTypes.find((data) => data.name === item.name);
      return match ? { ...item, enabled: match.enabled } : item;
    });
  }
  return updatedSignatureType;
}

// `formatDate` is used to format date to dd-mmm-yyy
export const formatDate = (date) => {
  // Create a Date object
  const newDate = new Date(date);
  // Format the date
  const formattedDate = newDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const format = formattedDate.replaceAll(/ /g, "-");
  return format;
};

export const deletePdfPage = async (pdfArrayBuffer, pageNumber) => {
  try {
    // Load the existing PDF
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    // Get the total number of pages
    const totalPages = pdfDoc.getPageCount();
    // Ensure the page index is valid
    if (totalPages > 1) {
      //Remove the specified page
      pdfDoc.removePage(pageNumber - 1);
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const arrayBuffer = base64ToArrayBuffer(modifiedPdfBytes);
      return {
        arrayBuffer: arrayBuffer,
        base64: modifiedPdfBytes,
        remainingPages: totalPages - 1
      };
    } else {
      return { totalPages: 1 };
    }
  } catch (err) {
    console.log("Err while deleting page", err);
  }
};

export const reorderPdfPages = async (pdfArrayBuffer, orderArr) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(
      pdfDoc,
      orderArr.map((n) => n - 1)
    );
    pages.forEach((p) => newPdf.addPage(p));
    const pdfBase64 = await newPdf.saveAsBase64({ useObjectStreams: false });
    const arrayBuffer = base64ToArrayBuffer(pdfBase64);
    return { arrayBuffer, base64: pdfBase64, totalPages: orderArr.length };
  } catch (err) {
    console.log("Err while reordering pages", err);
  }
};

// `generatePdfName` is used to generate file name
export function generatePdfName(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Format date and time for the selected timezone
export const formatTimeInTimezone = (date, timezone) => {
  const nyDate = timezone && toZonedTime(date, timezone);
  const generatedDate = timezone
    ? format(nyDate, "EEE, dd MMM yyyy HH:mm:ss zzz", { timeZone: timezone })
    : new Date(date).toUTCString();
  return generatedDate;
};

// `usertimezone` is used to get timezone of current user
export const usertimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const handleHeighlightWidget = (
  getCurrentSignerPos,
  key,
  pageNumber
) => {
  const placeholder = getCurrentSignerPos.placeHolder;
  // Find the highest zIndex value
  const highestZIndex = placeholder
    .flatMap((item) => item.pos.map((position) => position.zIndex))
    .reduce((max, zIndex) => (zIndex > max ? zIndex : max), -Infinity); //-Infinity represents the smallest possible number
  // Update the zIndex of the current signer
  const updateZindex = placeholder.map((data) => {
    if (data.pageNumber === pageNumber) {
      return {
        ...data,
        pos: data.pos.map((position) => {
          if (position.key === key) {
            return {
              ...position,
              zIndex: highestZIndex + 1
            };
          }
          return position;
        })
      };
    }
    return data;
  });
  return updateZindex;
};
/**
 * FlattenPdf is used to remove existing widgets if present any and flatten pdf.
 * @param {string | Uint8Array | ArrayBuffer} pdfFile - pdf file.
 * @returns {Promise<Uint8Array>} flatPdf - pdf file in unit8arry
 */
export const flattenPdf = async (pdfFile) => {
  const pdfDoc = await PDFDocument.load(pdfFile);
  // Get the form
  const form = pdfDoc.getForm();
  // fetch form fields
  const fields = form.getFields();
  // remove form all existing fields and their widgets
  if (fields && fields?.length > 0) {
    try {
      for (const field of fields) {
        while (field.acroField.getWidgets().length) {
          field.acroField.removeWidget(0);
        }
        form.removeField(field);
      }
    } catch (err) {
      console.log("err while removing field from pdf", err);
    }
  }
  // Updates the field appearances to ensure visual changes are reflected.
  form.updateFieldAppearances();
  // Flattens the form, converting all form fields into non-editable, static content
  form.flatten();
  const flatPdf = await pdfDoc.save({ useObjectStreams: false });
  return flatPdf;
};

export const mailTemplate = (param) => {
  const appName =
    "OpenSign™";
  const logo =
        `<div style='padding:10px'><img src='https://qikinnovation.ams3.digitaloceanspaces.com/logo.png' height='50' /></div>`;

  const opurl =
        ` <a href='https://www.opensignlabs.com' target=_blank>here</a>.</p></div></div></body></html>`;

  const subject = `${param.senderName} has requested you to sign "${param.title}"`;
  const body =
    "<html><head><meta http-equiv='Content-Type' content='text/html;charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background:white;padding-bottom:20px'>" +
    logo +
    `<div style='padding:2px;font-family:system-ui;background-color:${themeColor}'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Digital Signature Request</p></div><div><p style='padding:20px;font-size:14px;margin-bottom:10px'>` +
    param.senderName +
    " has requested you to review and sign <strong>" +
    param.title +
    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display:flex;flex-direction:row;justify-content:space-around'><table><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.senderMail +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td><td></td><td style='color:#626363;font-weight:bold'> " +
    param.organization +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.localExpireDate +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Note</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.note +
    "</td></tr><tr><td></td><td></td></tr></table></div> <div style='margin-left:70px'><a target=_blank href=" +
    param.signingUrl +
    "><button style='padding:12px;background-color:#d46b0f;color:white;border:0px;font-weight:bold;margin-top:30px'>Sign here</button></a></div><div style='display:flex;justify-content:center;margin-top:10px'></div></div></div><div><p> This is an automated email from " +
    appName +
    ". For any queries regarding this email, please contact the sender " +
    param.senderMail +
    " directly. If you think this email is inappropriate or spam, you may file a complaint with " +
    appName +
    opurl;

  return { subject, body };
};

export function formatDateTime(date, dateFormat, timeZone, is12Hour) {
  const zonedDate = toZonedTime(date, timeZone); // Convert date to the given timezone
  const timeFormat = is12Hour ? "hh:mm:ss a" : "HH:mm:ss";
  return dateFormat
    ? format(
        zonedDate,
        `${selectFormat(dateFormat)}, ${timeFormat} 'GMT' XXX`,
        { timeZone }
      )
    : formatTimeInTimezone(date, timeZone);
}

export const updateDateWidgetsRes = (documentData, signerId, journey) => {
  const extUser =
        localStorage.getItem("Extand_Class");
  const contactUser = documentData?.Signers.find(
    (data) => data.objectId === signerId
  );
  const placeHolders = documentData?.Placeholders;
  const userDetails = extUser ? JSON.parse(extUser)[0] : contactUser;
  return placeHolders?.map((item) => {
    if (item?.signerObjId === signerId) {
      return {
        ...item,
        placeHolder: item?.placeHolder?.map((ph) => ({
          ...ph,
          pos: ph?.pos?.map((widget) => {
            // only for date widgets *and* missing response
            if (widget.type === "date" && !widget.options.response) {
              return {
                ...widget,
                options: {
                  ...widget.options,
                  response: getDate(
                    changeDateToMomentFormat(widget.options.validation.format)
                  )
                }
              };
            } else if (
              ["name", "email", "job title", "company"].includes(widget.type) &&
              !widget.options.defaultValue &&
              !widget.options.response
            ) {
              return {
                ...widget,
                options: {
                  ...widget.options,
                  response: widgetDataValue(widget.type, userDetails)
                }
              };
            }
            return widget;
          })
        }))
      };
    } else {
      return item;
    }
  });
};

//function for show checked checkbox
export const selectCheckbox = (ind, selectedCheckbox) => {
  if (selectedCheckbox && selectedCheckbox?.length > 0) {
    const isCheck = selectedCheckbox?.some((data) => data === ind);
    return isCheck || false;
  }
};
export const checkRegularExpress = (validateType, setValidatePlaceholder) => {
  switch (validateType) {
    case "email":
      setValidatePlaceholder("demo@gmail.com");
      break;
    case "number":
      setValidatePlaceholder("12345");
      break;
    case "text":
      setValidatePlaceholder("please enter text");
      break;
    case "ssn":
      setValidatePlaceholder("123-45-6789");
      break;
    default:
      setValidatePlaceholder("please enter value");
  }
};
//function to use unlink signer from widgets
export const handleUnlinkSigner = (
  signerPos,
  setSignerPos,
  signersdata,
  setSignersData,
  uniqueId
) => {
  //remove existing signer's details from 'signerPos' array
  const updatePlaceHolder = signerPos.map((x) => {
    if (x.Id === uniqueId) {
      return { ...x, signerPtr: {}, signerObjId: "" };
    }
    return { ...x };
  });
  setSignerPos(updatePlaceHolder);
  //remove existing signer's details from 'signersdata' array and keep role and id
  const updateSigner = signersdata.map((item) => {
    if (item.Id == uniqueId) {
      return { Role: item.Role, Id: item.Id, blockColor: item.blockColor };
    }
    return item;
  });
  setSignersData(updateSigner);
};
//function is used to get pdf original width and height
export const getOriginalWH = async (pdf) => {
  let pdfWHObj = [];
  //get total page number
  const totalPages = pdf?.numPages;
  //according to page number get all pdf's pages width and height
  for (let index = 0; index < totalPages; index++) {
    try {
      const getPage = await pdf.getPage(index + 1);
      const width = getPage?.view[2];
      const height = getPage?.view[3];
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    } catch (e) {
      console.log(`Error getting page ${index + 1} of PDF: ${e.message}`);
    }
  }
  return pdfWHObj;
};

//function is used to check required and optional widgets and ensure required widget should be response
export const handleCheckResponse = (checkUser, setminRequiredCount) => {
  let checkboxExist,
    showAlert = false,
    widgetKey,
    requiredCheckbox,
    tourPageNumber; // `pageNumber` is used to check on which page user did not fill widget's data then change current pageNumber and show tour message on that page
  for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
    for (let j = 0; j < checkUser[0].placeHolder[i].pos.length; j++) {
      //get current page
      const updatePage = checkUser[0].placeHolder[i]?.pageNumber;
      //checking checbox type widget
      checkboxExist = checkUser[0].placeHolder[i].pos[j].type === "checkbox";
      //condition to check checkbox widget exist or not
      if (checkboxExist) {
        //get all required type checkbox
        requiredCheckbox = checkUser[0].placeHolder[i].pos.filter(
          (position) =>
            !position.options?.isReadOnly && position.type === "checkbox"
        );
        //if required type checkbox data exit then check user checked all checkbox or some checkbox remain to check
        //also validate to minimum and maximum required checkbox
        if (requiredCheckbox && requiredCheckbox.length > 0) {
          for (let i = 0; i < requiredCheckbox.length; i++) {
            //get minimum required count if  exit
            const minCount =
              requiredCheckbox[i].options?.validation?.minRequiredCount;
            const parseMin = minCount && parseInt(minCount);
            //get maximum required count if  exit
            const maxCount =
              requiredCheckbox[i].options?.validation?.maxRequiredCount;
            const parseMax = maxCount && parseInt(maxCount);
            //in `response` variable is used to get how many checkbox checked by user
            const response = requiredCheckbox[i].options?.response?.length;
            //in `defaultValue` variable is used to get how many checkbox checked by default
            const defaultValue =
              requiredCheckbox[i].options?.defaultValue?.length;
            //condition to check  parseMin  and parseMax greater than 0  then consider it as a required check box
            if (
              parseMin > 0 &&
              parseMax > 0 &&
              !response &&
              !defaultValue &&
              !showAlert
            ) {
              showAlert = true;
              widgetKey = requiredCheckbox[i].key;
              tourPageNumber = updatePage;
              setminRequiredCount(parseMin);
            }
            //else condition to validate minimum required checkbox
            else if (parseMin > 0 && (parseMin > response || !response)) {
              if (!showAlert) {
                showAlert = true;
                widgetKey = requiredCheckbox[i].key;
                tourPageNumber = updatePage;
                setminRequiredCount(parseMin);
              }
            }
          }
        }
      }
      //else condition to check all type widget data fill or not except checkbox
      else {
        //get all required type widgets except checkbox and radio
        const requiredWidgets = checkUser[0].placeHolder[i].pos.filter(
          (position) =>
            position.type === "signature" ||
            (position.options?.status === "required" &&
              position.type !== "checkbox")
        );
        if (requiredWidgets && requiredWidgets?.length > 0) {
          let checkSigned;
          for (let i = 0; i < requiredWidgets?.length; i++) {
            checkSigned = requiredWidgets[i]?.options?.response;
            if (!checkSigned) {
              let checkDefaultSigned =
                requiredWidgets[i]?.options?.defaultValue;
              if (!checkDefaultSigned && !showAlert) {
                showAlert = true;
                widgetKey = requiredWidgets[i].key;
                tourPageNumber = updatePage;
                setminRequiredCount(null);
              }
            }
          }
        }
      }
    }
    //when showAlert is true then break the loop and show alert to fill required data in widgets
    if (showAlert) {
      break;
    }
  }
  return {
    tourPageNumber,
    widgetKey,
    showAlert
  };
};

/**
 * decryptPdf
 * @param {File} file - The password-protected PDF file to decrypt.
 * @param {string | undefined} password - The password used to unlock the PDF.
 * @returns {Promise<File>} - A Promise that resolves to a decrypted PDF as a File object.
 *
 */
export const decryptPdf = async (file, password) => {
  const name = generatePdfName(16);
  const baseApi = localStorage.getItem("baseUrl") || "";
  const url = removeTrailingSegment(baseApi) + "/decryptpdf?ts=" + Date.now();
  let formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  const config = {
    headers: { "content-type": "multipart/form-data" },
    responseType: "blob"
  };
  const response = await axios.post(url, formData, config);
  const pdfBlob = new Blob([response.data], { type: "application/pdf" });
  return new File([pdfBlob], name, { type: "application/pdf" });
};

/**
 * Convert a Base64 string to a File object.
 *
 * @param {string} base64String - The Base64 string, with or without the data URI prefix.
 *                                e.g. "data:image/png;base64,iVBORw0KGgoAAAANS…" or "iVBORw0KGgoAAAANS…"
 * @param {string} filename     - Desired filename for the File object, e.g. "photo.png"
 * @returns {File}              - The resulting File object
 */
export function base64ToFile(base64String, filename) {
  // Separate out the mime-type and the actual Base64 payload
  const [header, payload] = base64String.includes(",")
    ? base64String.split(",")
    : [null, base64String];
  // Determine the MIME type (fallback to application/octet-stream)
  const mimeMatch = header?.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  // Decode Base64 to raw binary data held in a string
  const binaryString = atob(payload);
  // Create an ArrayBuffer and a view (as unsigned 8-bit)
  const len = binaryString.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryString.charCodeAt(i);
  }

  // Create a File object (Blob subclass) with the binary data
  return new File([u8arr], filename, { type: mime });
}

/**
 * Reads the given File object and returns its contents as an ArrayBuffer.
 *
 * @param {File} file
 *   The File instance to be read.
 * @returns {Promise<ArrayBuffer>}
 *   A promise that resolves with the file’s binary data as an ArrayBuffer,
 *   or rejects with an error if the read fails.
 */
export function getFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e.target.error);
    reader.readAsArrayBuffer(file);
  });
}
