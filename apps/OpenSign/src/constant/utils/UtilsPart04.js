import { textInputWidget } from "./UtilsPart01.js";
import { drawWidget } from "./UtilsPart01.js";
import { textWidget } from "./UtilsPart01.js";
import { radioButtonWidget } from "./UtilsPart01.js";
import { cellsWidget } from "./UtilsPart01.js";
import { convertTextToImg } from "./UtilsPart08.js";

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
    case drawWidget:
      return { width: 150, height: 60 };
    default:
      return { width: 150, height: 60 };
  }
};

export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

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

export const handleSignYourselfWidgetResize = (
  ref,
  key,
  xyPosition,
  setXyPosition,
  index,
  containerScale
) => {
  // Guard against bad index
  if (!xyPosition[index]) {
    console.log(`ImageResize invalid index ${index}`);
    return;
  }

  // Compute widget dimensions only once
  const { offsetWidth, offsetHeight } = ref;
  const factor = containerScale || 1;
  const widgetWidth = offsetWidth / factor;
  const widgetHeight = offsetHeight / factor;

  // Single pass to update only the targeted index/key
  const updated = xyPosition.map((item, idx) => {
    if (idx !== index) return item;

    return {
      ...item,
      pos: item.pos.map((url) => {
        if (url.key !== key) return url;

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
          IsResize: true
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
      })
    };
  });
  setXyPosition(updated);
};
