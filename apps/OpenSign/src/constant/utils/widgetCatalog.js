import axios from "axios";
import moment from "moment";
import { format } from "date-fns-tz";
import { textInputWidget } from "./coreConstants.js";
import { drawWidget } from "./coreConstants.js";
import { textWidget } from "./coreConstants.js";
import { radioButtonWidget } from "./coreConstants.js";
import { cellsWidget } from "./coreConstants.js";
import { convertTextToImg } from "./widgetInlineEditing.js";

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

export const pdfNewWidthFun = (divRef) => {
  const pdfWidth = divRef.current.offsetWidth;
  return pdfWidth;
};

export const handleWidgetResize = (
  ref,
  key,
  signerPos,
  setSignerPos,
  pageNumber,
  containerScale,
  signerId,
  showResize
) => {
  // Compute widget dimensions only once
  const { offsetWidth, offsetHeight } = ref;
  const factor = containerScale || 1;
  const widgetWidth = offsetWidth / factor;
  const widgetHeight = offsetHeight / factor;

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
          // For rotated widgets (90°/270°), the visual dimensions are swapped.
          // Store the original-orientation dimensions in the data model.
          const rotation = url.options?.rotation || 0;
          const isRotSwapped = [90, 270].includes(rotation);
          const storedWidth = isRotSwapped ? widgetHeight : widgetWidth;
          const storedHeight = isRotSwapped ? widgetWidth : widgetHeight;
          const widgetDims = { Width: storedWidth, Height: storedHeight };
          // Base fields for every resized signature
          const base = {
            ...url,
            Width: storedWidth,
            Height: storedHeight,
            IsResize: showResize ? true : false
          };
          // If it's a “type” signature, regenerate the image and options
          if (url.typeSignature && url.signatureType === "type") {
            const signImg = convertTextToImg(
              url.typeFont ?? "Fasthand",
              url.typeSignature,
              url.fontColor ?? "blue",
              widgetDims
            );
            return {
              ...base,
              SignUrl: signImg,
              options: { ...url.options, response: signImg }
            };
          }
          return base;
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
  { type: textInputWidget, icon: "fa-light fa-font", iconSize: "21px" },
  { type: "name", icon: "fa-light fa-user", iconSize: "21px" },
  { type: "job title", icon: "fa-light fa-address-card", iconSize: "17px" },
  { type: "company", icon: "fa-light fa-building", iconSize: "25px" },
  { type: "email", icon: "fa-light fa-envelope", iconSize: "20px" },
  { type: "date", icon: "fa-light fa-calendar-days", iconSize: "20px" },
  { type: textWidget, icon: "fa-light fa-text-width", iconSize: "20px" },
  { type: cellsWidget, icon: "fa-light fa-table-cells", iconSize: "20px" },
  { type: "checkbox", icon: "fa-light fa-square-check", iconSize: "22px" },
  {
    type: "dropdown",
    icon: "fa-light fa-circle-chevron-down",
    iconSize: "19px"
  },
  { type: radioButtonWidget, icon: "fa-light fa-circle-dot", iconSize: "20px" },
  { type: "image", icon: "fa-light fa-image", iconSize: "20px" },
  { type: drawWidget, icon: "fa-light fa-pen-nib", iconSize: "20px" }
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
    case "DD.MM.YYYY":
      return "dd.MM.yyyy";
    case "DD-MMM-YYYY":
      return "dd-MMM-yyyy";
    default:
      return "MM/dd/yyyy";
  }
};
