import { PDFDocument } from "pdf-lib";
import { degrees } from "pdf-lib";
import Parse from "parse";
import { SCALE_STEPS } from "../const";
import i18n from "../../i18n";
import { getSecureUrl } from "./UtilsPart01.js";
import { getBase64FromUrl } from "./UtilsPart01.js";
import { fileNameWithUnderscore } from "./UtilsPart13.js";
import { compensateRotation } from "./UtilsPart14.js";

export function getWidgetPosition(page, image, sizeRatio, getSize) {
  let pageWidth;
  // pageHeight;
  if ([90, 270].includes(page.getRotation().angle)) {
    pageWidth = getSize?.height || page.getHeight();
  } else {
    pageWidth = getSize?.width || page.getWidth();
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

export const getContainerScale = (pdfOriginalWH, pageNumber, containerWH) => {
  const getPdfPageWidth = pdfOriginalWH.find(
    (data) => data.pageNumber === pageNumber
  );
  const containerScale = containerWH?.width / getPdfPageWidth?.width || 1;
  return containerScale;
};

export const getDefaultSignature = async (objectId) => {
  try {
    if (objectId) {
      const result = await Parse.Cloud.run("getdefaultsignature", {
        userId: objectId
      });
      if (result) {
        const res = JSON.parse(JSON.stringify(result));
        const defaultSignature = res?.ImageURL
          ? await getBase64FromUrl(res?.ImageURL, true)
          : "";
        const defaultInitial = res?.Initials
          ? await getBase64FromUrl(res?.Initials, true)
          : "";
        const defaultStamp = res?.Stamp
          ? await getBase64FromUrl(res?.Stamp, true)
          : "";

        return {
          status: "success",
          res: {
            id: result?.id,
            defaultSignature: defaultSignature,
            defaultInitial: defaultInitial,
            defaultStamp: defaultStamp
          }
        };
      }
    } else {
      return { status: "error" };
    }
  } catch (err) {
    console.log(
      "Error: error in fetch data in contracts_Signature",
      err?.message || err
    );
    return { status: "error" };
  }
};

export async function rotatePdfPage(rotateDegree, pageNumber, pdfArrayBuffer) {
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer, {
    ignoreEncryption: true
  });
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

export function removeBase64Prefix(base64String) {
  return base64String.replace(/^data:.*;base64,/, "");
}

export const convertBase64ToFile = async (pdfName, pdfBase64, imgType) => {
  let base64Str = pdfBase64;
  const mime = imgType && imgType?.split("/")?.pop();
  let fileName =
    fileNameWithUnderscore(pdfName) + (imgType ? `.${mime}` : ".pdf");
  try {
    fileName = imgType ? pdfName : fileName;
    const pdfFile = new Parse.File(fileName, { base64: base64Str });
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

export const isCustomFileAdapter = (fileAdapterId) =>
  Boolean(fileAdapterId && fileAdapterId !== "opensign");

export const pendingButtonZoomScrollRef = { current: null };

export const captureScrollForButtonZoom = (
  scrollContainerRef,
  scale,
  newScale
) => {
  const el = scrollContainerRef?.current;
  if (!el) return;

  const scaleRatio = newScale / scale;

  // Anchor point = center of the visible scroll container
  const midRelX = el.clientWidth / 2;
  const midRelY = el.clientHeight / 2;

  const docX = el.scrollLeft + midRelX;
  const docY = el.scrollTop + midRelY;

  const newScrollLeft = Math.max(0, docX * scaleRatio - midRelX);
  const newScrollTop = Math.max(0, docY * scaleRatio - midRelY);

  pendingButtonZoomScrollRef.current = { newScrollLeft, newScrollTop };
};

export const onClickZoomIn = (scale, setScale, scrollContainerRef) => {
  // Find last step smaller than current scale
  const nextScale = SCALE_STEPS.find((s) => s > scale);
  if (!nextScale) return;
  captureScrollForButtonZoom(scrollContainerRef, scale, nextScale);
  setScale(nextScale);
};

export const onClickZoomOut = (scale, setScale, scrollContainerRef) => {
  // Find last step smaller than current scale
  const prevScale = [...SCALE_STEPS].reverse().find((s) => s < scale);
  if (!prevScale || prevScale < 1.0) return;
  captureScrollForButtonZoom(scrollContainerRef, scale, prevScale);
  setScale(prevScale);
};

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

export const handleRotateWarning = (signerPos, pageNumber) => {
  const placeholderExist = signerPos?.some((placeholderObj) =>
    placeholderObj?.placeHolder?.some((data) => data?.pageNumber === pageNumber)
  );
  return placeholderExist ? true : false;
};
