import { drawWidget } from "./coreConstants.js";
import { convertTextToImg } from "./widgetInlineEditing.js";
import { placeholderHeight } from "./placeholderTools.js";

export function onSaveSign(
  type,
  xyPosition,
  index,
  signKey,
  signatureImg,
  updatedImgWH,
  isTypeText,
  typedSignature,
  isAutoSign,
  widgetsType,
  typeFont,
  fontColor
) {
  let getIMGWH, posWidth, posHeight;
  let getXYdata = xyPosition[index].pos;
  const isSignOrInitials =
    widgetsType && ["signature", "initials"].includes(widgetsType);
  const updateXYData = getXYdata.map((position) => {
    if (position.key === signKey) {
      if (isTypeText) {
        getIMGWH = {
          newWidth: updatedImgWH.width,
          newHeight: updatedImgWH.height
        };
      }
      posWidth = getIMGWH ? getIMGWH.newWidth : 150;
      posHeight = getIMGWH ? getIMGWH.newHeight : 60;
      const widgetDims = { Width: posWidth, Height: posHeight };
      const signImg = typedSignature
        ? convertTextToImg(typeFont, typedSignature, fontColor, widgetDims)
        : signatureImg;
      if (widgetsType === drawWidget) {
        return {
          ...position,
          options: { ...position.options, response: signImg }
        };
      } else {
        return {
          ...position,
          ...(type === "type" ? { Width: posWidth } : {}),
          ...(type === "type" ? { Height: posHeight } : {}),
          SignUrl: signImg,
          ...(isSignOrInitials && { signatureType: type || "" }),
          options: { ...position.options, response: signImg },
          ...(typedSignature && {
            typeSignature: typedSignature,
            typeFont: typeFont ?? "Fasthand",
            fontColor: fontColor ?? "blue"
          })
        };
      }
    }
    return position;
  });

  const updateXYposition = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });
  //condition  when draw/upload signature/initials then apply it all related to widgets (draw, typed signature or default signature)
  if (isAutoSign && widgetsType !== drawWidget) {
    const updatedArray = updateXYposition.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        if (item.type === widgetsType) {
          const widgetDims = { Width: item.Width, Height: item.Height };
          const signImg = typedSignature
            ? convertTextToImg(typeFont, typedSignature, fontColor, widgetDims)
            : signatureImg;
          return {
            ...item,
            SignUrl: signImg,
            ...(isSignOrInitials && { signatureType: type || "" }),
            options: { ...item.options, response: signImg },
            ...(typedSignature && {
              typeSignature: typedSignature,
              typeFont: typeFont || "Fasthand",
              fontColor: fontColor || "blue"
            })
          };
        }
        return item; // Otherwise, keep it unchanged
      })
    }));
    return updatedArray;
  } else {
    return updateXYposition;
  }
}

export function clearResponse(widgetKey, placeholder = [], index) {
  if (!Array.isArray(placeholder) || !placeholder[index]?.pos) {
    return placeholder;
  }
  const getXYdata = placeholder[index]?.pos;
  const updateXYData = getXYdata.map((widget) => {
    if (widget?.key !== widgetKey) return widget;
    return {
      ...widget,
      options: { ...widget.options, response: "" },
      SignUrl: ""
    };
  });

  const updatePlaceholder = placeholder.map((p, ind) => {
    if (ind !== index) return p;
    return { ...p, pos: updateXYData };
  });
  return updatePlaceholder;
}

export async function convertBase64ToImg(base64Image, widgetDims) {
  const { Width: maxWidth, Height: maxHeight } = widgetDims;
  // Load the image off-DOM
  const img = new Image();
  img.src = base64Image;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // 2. Compute scale to fit within widget (preserving aspect ratio)
  const { naturalWidth: imgW, naturalHeight: imgH } = img;
  const scale = Math.min(maxWidth / imgW, maxHeight / imgH, 1);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  // 3. Prepare a high-DPI canvas
  const pxRatio = (window.devicePixelRatio || 1) * 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(maxWidth * pxRatio);
  canvas.height = Math.ceil(maxHeight * pxRatio);
  const ctx = canvas.getContext("2d");
  ctx.scale(pxRatio, pxRatio);
  ctx.clearRect(0, 0, maxWidth, maxHeight);

  // 4. Center the image in the widget rectangle
  const x = (maxWidth - drawW) / 2;
  const y = (maxHeight - drawH) / 2;
  ctx.drawImage(img, x, y, drawW, drawH);
  // 5. Return new base64 in same format as input
  // const quality =
  //   inputMime.includes("jpeg") || inputMime.includes("jpg") ? 0.9 : undefined;
  // return canvas.toDataURL(inputMime, quality);
  // 5. Always return PNG (lossless, no quality param needed)
  return canvas.toDataURL("image/png");
}

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
        // Width: existSignPosition.Width,
        // Height: existSignPosition.Height,
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
