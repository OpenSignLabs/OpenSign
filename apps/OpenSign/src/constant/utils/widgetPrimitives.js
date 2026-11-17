// Dependency-free widget primitives shared by the sizing module
// (widgetSizing, ex-UtilsPart04) and the inline-editing module
// (widgetInlineEditing, ex-UtilsPart08).
// This module only reads the leaf widget-type constants from UtilsPart01,
// which itself imports no UtilsPart* module, so the historic
// UtilsPart04 <-> UtilsPart08 import cycle cannot reform through here.
import {
  textInputWidget,
  drawWidget,
  textWidget,
  radioButtonWidget,
  cellsWidget
} from "./UtilsPart01.js";

// Fixed dimensions keyed by literal widget type.
const FIXED_DIMS = {
  signature: { width: 150, height: 60 },
  stamp: { width: 150, height: 60 },
  checkbox: { width: 15, height: 19 },
  dropdown: { width: 120, height: 22 },
  initials: { width: 50, height: 50 },
  name: { width: 150, height: 19 },
  company: { width: 150, height: 19 },
  "job title": { width: 150, height: 19 },
  date: { width: 100, height: 20 },
  image: { width: 70, height: 70 },
  email: { width: 150, height: 19 }
};

// Single-line text widgets share the 150x19 box.
const isCompactTextWidget = (type) =>
  [textInputWidget, textWidget, "name", "company", "job title", "email"].includes(
    type
  );

export const defaultWidthHeight = (type) => {
  if (type === cellsWidget) return { width: 112, height: 22 };
  if (type === radioButtonWidget) return { width: 5, height: 10 };
  if (type === drawWidget) return { width: 150, height: 60 };
  if (isCompactTextWidget(type)) return { width: 150, height: 19 };
  return FIXED_DIMS[type] ?? { width: 150, height: 60 };
};

// Measure the font size that lets `text` fill the widget box.
const measureFittedFontSize = (
  measureCtx,
  text,
  fontFamily,
  baselineFontSizePx,
  maxWidth,
  maxHeight
) => {
  measureCtx.font = `${baselineFontSizePx}px ${fontFamily}`;
  const metrics = measureCtx.measureText(text);
  const actualHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const scale = Math.min(
    maxWidth / metrics.width,
    maxHeight / actualHeight,
    1
  );
  return baselineFontSizePx * scale;
};

// Paint centered text on a scaled canvas and return the PNG data URL.
const renderCenteredTextImage = (
  text,
  fontFamily,
  fillColor,
  finalFontSizePx,
  maxWidth,
  maxHeight
) => {
  const pxRatio = window.devicePixelRatio * 2 || 3;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(maxWidth * pxRatio);
  canvas.height = Math.ceil(maxHeight * pxRatio);
  const ctx = canvas.getContext("2d");
  ctx.scale(pxRatio, pxRatio);
  ctx.font = `${finalFontSizePx}px ${fontFamily}`;
  ctx.fillStyle = fillColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(text);
  const y =
    maxHeight / 2 +
    (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  ctx.clearRect(0, 0, maxWidth, maxHeight);
  ctx.fillText(text, maxWidth / 2, y);
  return canvas.toDataURL("image/png");
};

export function convertTextToImg(fontStyle, text, color, widgetDims) {
  const maxWidth = widgetDims.Width;
  const maxHeight = widgetDims.Height;
  const baselineFontSizePx = maxHeight;
  const fontFamily = fontStyle || "Fasthand";
  const measureCanvas = document.createElement("canvas");
  const finalFontSizePx = measureFittedFontSize(
    measureCanvas.getContext("2d"),
    text,
    fontFamily,
    baselineFontSizePx,
    maxWidth,
    maxHeight
  );
  return renderCenteredTextImage(
    text,
    fontFamily,
    color || "blue",
    finalFontSizePx,
    maxWidth,
    maxHeight
  );
}
