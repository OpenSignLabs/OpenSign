import moment from "moment";
import { format } from "date-fns-tz";
import { changeDateToMomentFormat } from "./UtilsPart03.js";

export const handleDeleteWidget = (key, Id, pageNumber, signerPos) => {
  // Find the signer by ID
  const signer = signerPos.find((item) => item.Id === Id);
  if (!signer || !signer.placeHolder) return signerPos;

  const placeHolder = signer.placeHolder;

  // Find the page inside placeHolder
  const currentPage = placeHolder.find((p) => p.pageNumber === pageNumber);
  if (!currentPage) return signerPos;

  // Remove widget from the selected page
  const updatedPos = currentPage.pos.filter((w) => w.key !== key);

  // -------------------------------------------------------
  // CASE A → After deletion, page still has widgets then keep that widgets
  // -------------------------------------------------------
  if (updatedPos.length > 0) {
    const updatedPlaceHolder = placeHolder.map((p) =>
      p.pageNumber === pageNumber ? { ...p, pos: updatedPos } : p
    );

    return signerPos.map((s) =>
      s.Id === Id ? { ...s, placeHolder: updatedPlaceHolder } : s
    );
  }

  // -------------------------------------------------------
  // CASE B → current page becomes empty → remove current page entirely and keep another pages which have widgets
  // -------------------------------------------------------
  const remainPages = placeHolder.filter((p) => p.pageNumber !== pageNumber);

  //`remainPages` keep another pages's data which have widgets
  if (remainPages.length > 0) {
    const index = signerPos.findIndex((s) => s.Id === Id);
    if (index === -1) return signerPos;

    const newSignerPos = [...signerPos];
    newSignerPos[index] = {
      ...newSignerPos[index],
      placeHolder: remainPages
    };

    return newSignerPos;
  }

  // -------------------------------------------------------
  // CASE C → No pages have widgets after delete widgets
  //          Remove placeHolder field for particular signers, EXCEPT prefill role
  // -------------------------------------------------------
  const updatedData = signerPos
    .map((s) => {
      if (s.Id === Id && s.Role === "prefill") return null; // remove whole signer
      if (s.Id === Id) {
        const updated = { ...s };
        delete updated.placeHolder;
        return updated;
      }
      return s;
    })
    .filter(Boolean); // remove nulls (deleted items)

  return updatedData;
};

export const getDefaultDate = (dateStr, format) => {
  //get valid date format for moment to convert formatted date to new Date() format
  const formats = changeDateToMomentFormat(format);
  const parsedDate = moment(dateStr, formats);
  let date;
  if (parsedDate.isValid()) {
    date = new Date(parsedDate.toISOString());
    return date;
  } else if (dateStr === "today") {
    date = new Date();
    return date;
  }
};

export const getDefaultFormat = (dateFormat) => dateFormat || "MM/dd/yyyy";

export const handleBackground = (data, isNeedSign, uniqueId) => {
  if (data) {
    if (isNeedSign) {
      if (data?.Id === uniqueId) {
        return data?.blockColor + "b0";
      } else {
        return "#dedddc";
      }
    } else {
      return data?.blockColor + "b0";
    }
  } else {
    return "rgba(203, 233, 237, 0.69)";
  }
};

export function getBase64MimeType(base64) {
  const match = base64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
  return match ? match[1] : null;
}
