import { convertTextToImg } from "./widgetPrimitives.js";
import { defaultWidthHeight } from "./widgetPrimitives.js";

// Re-exported so the facade (constant/Utils.js) keeps its source module.
export { defaultWidthHeight };

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

// Paint the image over a white background (JPEG has no alpha channel).
const paintWhiteBackgroundCanvas = (img) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // white color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas;
};

export const convertPNGtoJPEG = (base64Data) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Data;

    img.onload = () => {
      // Convert to JPEG by using the canvas.toDataURL() method
      const jpegBase64Data = paintWhiteBackgroundCanvas(img).toDataURL(
        "image/jpeg"
      );
      resolve(jpegBase64Data);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

// For rotated widgets (90°/270°) the visual dimensions are swapped, so the
// data model keeps the original-orientation dimensions.
const resolveStoredDimensions = (ref, containerScale, rotation) => {
  const factor = containerScale || 1;
  const widgetWidth = ref.offsetWidth / factor;
  const widgetHeight = ref.offsetHeight / factor;
  const isSwapped = [90, 270].includes(rotation || 0);
  const storedWidth = isSwapped ? widgetHeight : widgetWidth;
  const storedHeight = isSwapped ? widgetWidth : widgetHeight;
  return { storedWidth, storedHeight };
};

// Regenerate the image when a "type" signature is resized.
const refreshTypeSignatureImage = (url, widgetDims) => {
  if (!(url.typeSignature && url.signatureType === "type")) return null;
  const signImg = convertTextToImg(
    url.typeFont ?? "Fasthand",
    url.typeSignature,
    url.fontColor ?? "blue",
    widgetDims
  );
  return {
    SignUrl: signImg,
    options: { ...url.options, response: signImg }
  };
};

// Resize a single widget position entry, leaving other keys untouched.
const resizePositionEntry = (url, key, stored) => {
  if (url.key !== key) return url;
  const base = {
    ...url,
    Width: stored.storedWidth,
    Height: stored.storedHeight,
    IsResize: true
  };
  const refreshed = refreshTypeSignatureImage(url, {
    Width: stored.storedWidth,
    Height: stored.storedHeight
  });
  return refreshed ? { ...base, ...refreshed } : base;
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

  // Single pass to update only the targeted index/key
  const updated = xyPosition.map((item, idx) => {
    if (idx !== index) return item;
    return {
      ...item,
      pos: item.pos.map((url) => {
        const stored = resolveStoredDimensions(
          ref,
          containerScale,
          url.options?.rotation
        );
        return resizePositionEntry(url, key, stored);
      })
    };
  });
  setXyPosition(updated);
};
