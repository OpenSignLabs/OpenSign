import { rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getRuntimePdfFontUrl } from "../runtimeConfig";
import { fileasbytes } from "./UtilsPart01.js";
import { defaultWidthHeight } from "./widgetPrimitives.js";
import { convertTextToImg } from "./widgetPrimitives.js";
import { compensateRotation } from "./UtilsPart14.js";
import { appName } from "./UtilsPart01.js";
import { color } from "./UtilsPart01.js";

// Re-exported so the facade (constant/Utils.js) keeps its source module.
export { convertTextToImg };

// Grow one position entry, falling back to the widget default height.
const growPositionHeight = (position, signKey, widgetType, delta) => {
  if (position.key !== signKey) return position;
  return {
    ...position,
    Height: position.Height
      ? position.Height + delta
      : defaultWidthHeight(widgetType).height + delta
  };
};

// Self-sign flow: positions live directly on the page entry.
const growSelfSignedHeight = (
  xyPosition,
  index,
  signKey,
  widgetType,
  delta,
  setXyPosition
) => {
  const getXYdata = xyPosition[index].pos;
  const updatePosition = getXYdata.map((position) =>
    growPositionHeight(position, signKey, widgetType, delta)
  );
  const updatePlaceholder = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updatePosition };
    }
    return obj;
  });
  setXyPosition(updatePlaceholder);
};

// Signer flow: positions live under the signer's placeholders.
const growSignerHeight = (
  signerPos,
  userId,
  index,
  signKey,
  widgetType,
  delta,
  setXyPosition,
  xyPosition
) => {
  const filterSignerPos = signerPos.filter((data) => data.Id === userId);
  const getPlaceHolder = filterSignerPos[0]?.placeHolder;
  const getPageNumer = getPlaceHolder.filter(
    (data) => data.pageNumber === index
  );
  if (getPageNumer.length === 0) return;
  const addSignPos = getPageNumer[0].pos.map((position) =>
    growPositionHeight(position, signKey, widgetType, delta)
  );
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
};

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
  if (!isSigners) {
    growSelfSignedHeight(
      xyPosition,
      index,
      signKey,
      widgetType,
      height,
      setXyPosition
    );
    return;
  }
  let filterSignerPos;
  if (userId) {
    filterSignerPos = xyPosition.filter((data) => data.Id === userId);
  }
  growSignerHeight(
    filterSignerPos,
    userId,
    index,
    signKey,
    widgetType,
    height,
    setXyPosition,
    xyPosition
  );
};

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
      return value?.Name || value?.name;
    case "company":
      return value?.Company || value?.company;
    case "job title":
      return value?.JobTitle || value?.jobTitle;
    case "email":
      return value?.Email || value?.email;
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

export const embedDocId = async (pdfOriginalWH, pdfDoc, documentId) => {
  const appName = "OpenSign™";
  // `fontBytes` is used to embed custom font in pdf
  const pdfFontUrl = getRuntimePdfFontUrl();
  if (!pdfFontUrl) throw new Error("A PDF font URL is required.");
  const fontBytes = await fileasbytes(pdfFontUrl);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  //pdfOriginalWH contained all pdf's width and height of pages
  for (let i = 0; i < pdfOriginalWH?.length; i++) {
    await embedDocIdOnPage(pdfDoc, pdfOriginalWH, i, documentId, font, appName);
  }
};

// Draw the document-id footer on one page, tolerating rotated pages.
const embedDocIdOnPage = async (
  pdfDoc,
  pdfOriginalWH,
  pageIndex,
  documentId,
  font,
  appName
) => {
  const fontSize = 10;
  const textContent = documentId && `${appName} DocumentId: ${documentId} `;
  const page = pdfDoc.getPages()[pageIndex];
  try {
    const getObj = compensateRotation(
      page.getRotation().angle,
      10,
      5,
      1,
      pdfOriginalWH[pageIndex],
      fontSize,
      rgb(0.5, 0.5, 0.5),
      font,
      page
    );
    page.drawText(textContent, getObj);
  } catch (err) {
    console.log("Err in embed docId on page", pageIndex + 1, err?.message);
  }
};
