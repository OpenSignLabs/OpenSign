import fontkit from "@pdf-lib/fontkit";
import { getRuntimePdfFontUrl } from "../runtimeConfig";
import { drawWidget } from "./UtilsPart01.js";
import { radioButtonWidget } from "./UtilsPart01.js";
import { fileasbytes } from "./UtilsPart01.js";
import { isBase64, isEmptyValue } from "./UtilsPart10.js";
import { convertBase64ToImg } from "./UtilsPart09.js";
import { drawWidgetPosition } from "./pdfWidgetDrawing";

export const embedWidgetsToDoc = async (
  widgets,
  pdfDoc,
  signyourself,
  scale,
  prefillImg
) => {
  // `fontBytes` is used to embed custom font in pdf
  const pdfFontUrl = getRuntimePdfFontUrl();
  if (!pdfFontUrl) throw new Error("A PDF font URL is required.");
  const fontBytes = await fileasbytes(pdfFontUrl);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  let hasError = false;
  for (let item of widgets) {
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
            !isEmptyValue(data?.options?.defaultValue) ||
            !isEmptyValue(data?.options?.response) ||
            data?.type === "checkbox" ||
            data?.type === radioButtonWidget
        );
      }
    } else {
      updateItem = item.pos;
    }
    const ImgTypeWidget = [
      "signature",
      "stamp",
      "initials",
      "image",
      drawWidget
    ];
    const pageNo = item.pageNumber;
    const widgetsPositionArr = updateItem;
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const page = pages[pageNo - 1];
    // `page.getCropBox()` returns the visible area of the PDF page.
    // It provides an object with the following properties:
    // - x: the x-coordinate of the lower-left corner of the visible area
    // - y: the y-coordinate of the lower-left corner of the visible area
    // - width: the width of the visible area (x1 - x0)
    // - height: the height of the visible area (y1 - y0)
    // If the page does not explicitly define a CropBox, this method returns
    // the MediaBox instead, which represents the full physical size of the page.
    //
    // Example CropBox: [0, 7.92, 612, 799.92]
    // => x = 0, y = 7.92, width = 612 - 0 = 612, height = 799.92 - 7.92 = 792
    // This is equivalent to `react-pdf`'s `page.view` array: [x0, y0, x1, y1]
    const { _, y, width, height } = page.getCropBox();
    const originalHeight = height + y;
    let images;
    const getSize = { height: originalHeight, width: width };
    try {
      images = await Promise.all(
        widgetsPositionArr.map(async (widget) => {
          // `SignUrl` this is wrong nomenclature and maintain for older code in this options we save base64 of signature image from sign pad
          let signbase64 = widget?.options?.response;
          const widgetDims = { Width: widget.Width, Height: widget.Height };
          if (signbase64 && ImgTypeWidget.includes(widget.type)) {
            if (!isBase64(signbase64) && prefillImg) {
              const imgData = prefillImg?.find((x) => x?.id === widget?.key);
              signbase64 = imgData?.base64;
            }
            // let arr = signbase64.split(",");
            // const mime = arr[0].match(/:(.*?);/)[1];
            const signatureImg = await convertBase64ToImg(
              signbase64,
              widgetDims
            );
            const mime = signatureImg?.split(",")?.[0]?.match(/:(.*?);/)?.[1];
            const res = await fetch(signatureImg);
            const arrayBuffer = await res.arrayBuffer();
            const obj = { mimetype: mime, arrayBuffer: arrayBuffer };
            return obj;
          }
        })
      );
    } catch (e) {
      console.log("error in image", e);
    }
    for (let [id, position] of widgetsPositionArr.entries()) {
      if (hasError) break; // Stop the inner loop if an error occurred
      try {
        await drawWidgetPosition({
          id,
          position,
          images,
          ImgTypeWidget,
          pdfDoc,
          page,
          pageNo,
          scale,
          font,
          form,
          getSize
        });
      } catch (err) {
        console.log("Err in embed widget on page ", pageNo, err);
        hasError = true;
        break;
      }
    }
    form?.flatten();
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
