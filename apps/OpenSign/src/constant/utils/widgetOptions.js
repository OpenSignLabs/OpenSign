import { format } from "date-fns-tz";
import { addPreferenceOpt } from "../../utils/widgetUtils";
import { textInputWidget } from "./coreConstants.js";
import { drawWidget } from "./coreConstants.js";
import { textWidget } from "./coreConstants.js";
import { radioButtonWidget } from "./coreConstants.js";
import { cellsWidget } from "./coreConstants.js";
import { generateId } from "./coreConstants.js";
import { selectFormat } from "./widgetCatalog.js";

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
    case "dd.MM.yyyy":
      return "DD.MM.YYYY";
    case "dd-MMM-yyyy":
      return "DD-MMM-YYYY";
    default:
      return "L";
  }
};

export const getSignerPages = (xyPosition = [], currentKey, signerId) => {
  if (!Array.isArray(xyPosition)) {
    return [];
  }
  const hasSigners = xyPosition.some((item) =>
    Array.isArray(item?.placeHolder)
  );
  if (hasSigners) {
    const candidates =
      signerId !== undefined && signerId !== null && signerId !== ""
        ? xyPosition.filter(
            (item) => item.Id === signerId || item.signerObjId === signerId
          )
        : xyPosition;
    for (const signer of candidates) {
      const pages = signer?.placeHolder || [];
      const ownsWidget = pages.some((page) =>
        (page?.pos || []).some((widget) => widget?.key === currentKey)
      );
      if (ownsWidget) {
        return pages;
      }
    }
    return [];
  }
  return xyPosition;
};

export const addWidgetOptions = (
  type,
  signer,
  placeholder,
  role,
  widgetValue
) => {
  let defaultOpt;
  const id = generateId(6);
  if (placeholder) {
    const countSameWidget = placeholder?.reduce((count, page) => {
      return count + page.pos.filter((item) => item.type === type).length;
    }, 0);
    const count = countSameWidget + 1;
    defaultOpt = { name: `${type}-${id}-${count}`, status: "required" };
  } else {
    defaultOpt = { name: `${type}-${id}-1`, status: "required" };
  }
  switch (type) {
    case "signature":
      return defaultOpt;
    case "stamp":
      return defaultOpt;
    case "checkbox":
      return { ...defaultOpt, isReadOnly: false, isHideLabel: false };
    case textInputWidget:
      return {
        ...defaultOpt,
        isReadOnly: false
      };
    case cellsWidget:
      return {
        ...defaultOpt,
        cellCount: 5,
        defaultValue: "",
        validation: { type: "", pattern: "" },
        isReadOnly: false
      };
    case "initials":
      return defaultOpt;
    case "name":
      return {
        ...defaultOpt,
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "company":
      return {
        ...defaultOpt,
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "job title":
      return {
        ...defaultOpt,
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "date": {
      const dateFormat = signer?.DateFormat
        ? selectFormat(signer?.DateFormat)
        : "MM/dd/yyyy";
      const options = addPreferenceOpt(signer, "date", role);
      return {
        ...defaultOpt,
        response: options?.response || "",
        isReadOnly: options?.isReadOnly || false,
        validation: {
          format: options?.format || dateFormat,
          type: "date-format"
        }
      };
    }
    case "image":
      return defaultOpt;
    case "email":
      return {
        ...defaultOpt,
        validation: { type: "email", pattern: "" },
        defaultValue: widgetValue ? widgetValue : ""
      };
    case "dropdown":
      return defaultOpt;
    case radioButtonWidget:
      return {
        ...defaultOpt,
        values: [],
        isReadOnly: false
      };
    case textWidget:
      return defaultOpt;
    case drawWidget:
      return defaultOpt;
    default:
      return {};
  }
};

export const addWidgetSelfsignOptions = (
  type,
  getWidgetValue,
  owner,
  placeholder,
  isSignyourself
) => {
  let defaultOpt;
  //condition to handle widgets name field
  const id = generateId(6);
  if (placeholder) {
    const countSameWidget = placeholder?.reduce((count, page) => {
      return count + page.pos.filter((item) => item.type === type).length;
    }, 0);
    const count = countSameWidget + 1;
    defaultOpt = { name: `${type}-${id}-${count}`, status: "required" };
  } else {
    defaultOpt = { name: `${type}-${id}-1`, status: "required" };
  }
  switch (type) {
    case "signature":
      return defaultOpt;
    case "stamp":
      return defaultOpt;
    case "checkbox":
      return defaultOpt;
    case textWidget:
      return defaultOpt;
    case cellsWidget:
      return {
        ...defaultOpt,
        cellCount: 5,
        defaultValue: "",
        validation: { type: "", pattern: "" },
        isReadOnly: false
      };
    case "initials":
      return defaultOpt;
    case "name":
      return {
        ...defaultOpt,
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "company":
      return {
        ...defaultOpt,
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "job title":
      return {
        ...defaultOpt,
        defaultValue: getWidgetValue(type),
        validation: { type: "text", pattern: "" }
      };
    case "date": {
      const dateFormat = owner?.DateFormat
        ? selectFormat(owner?.DateFormat)
        : "MM/dd/yyyy";
      const options = addPreferenceOpt(owner, "date", "", isSignyourself);
      return {
        ...defaultOpt,
        response: options?.response || "",
        ...(!isSignyourself
          ? { isReadOnly: options?.isReadOnly || false }
          : {}),
        validation: {
          format: options?.format || dateFormat,
          type: "date-format"
        }
      };
    }
    case "image":
      return defaultOpt;
    case "email":
      return {
        ...defaultOpt,
        defaultValue: getWidgetValue(type),
        validation: { type: "email", pattern: "" }
      };
    default:
      return {};
  }
};
