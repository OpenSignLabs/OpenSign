import { rgb } from "pdf-lib";
import { PDFName } from "pdf-lib";
import { PDFDict } from "pdf-lib";
import { color } from "./UtilsPart01.js";

export function _drawTextField(page, field, rect, font) {
  let text = "";
  try {
    text = field.getText?.() ?? "";
  } catch {
    text = "";
  }
  text = String(text ?? "");

  if (!text) return;

  let multiline = false;
  try {
    multiline = field.isMultiline?.() ?? false;
  } catch {
    /* ignore */
  }

  let comb = false;
  try {
    comb = field.isCombed?.() ?? false;
  } catch {
    /* ignore */
  }

  if (comb) {
    _drawCombText(page, text, rect, font);
    return;
  }

  if (multiline || text.includes("\n")) {
    _drawMultilineText(page, text, rect, font);
    return;
  }

  const fontSize = _fitSingleLineFontSize(text, rect, font);
  const baselineY = rect.y + Math.max(2, (rect.height - fontSize) / 2);

  page.drawText(text, {
    x: rect.x + 2,
    y: baselineY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: Math.max(1, rect.width - 4)
  });
}

export function _drawMultilineText(page, text, rect, font) {
  const lines = String(text).replace(/\r/g, "").split("\n");
  const fontSize = Math.max(
    8,
    Math.min(11, rect.height / Math.max(lines.length + 0.5, 2))
  );
  const lineHeight = fontSize + 1.5;

  let y = rect.y + rect.height - fontSize - 2;

  for (const line of lines) {
    if (y < rect.y + 1) break;

    page.drawText(line, {
      x: rect.x + 2,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: Math.max(1, rect.width - 4),
      lineHeight
    });

    y -= lineHeight;
  }
}

export function _drawCombText(page, text, rect, font) {
  const chars = String(text).split("");
  const count = Math.max(chars.length, 1);
  const cellWidth = rect.width / count;
  const fontSize = Math.max(8, Math.min(12, rect.height - 4));

  chars.forEach((ch, i) => {
    const textWidth = font.widthOfTextAtSize(ch, fontSize);
    const x = rect.x + i * cellWidth + (cellWidth - textWidth) / 2;
    const y = rect.y + Math.max(2, (rect.height - fontSize) / 2);

    page.drawText(ch, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0)
    });

    if (i < count - 1) {
      try {
        page.drawLine({
          start: { x: rect.x + (i + 1) * cellWidth, y: rect.y },
          end: {
            x: rect.x + (i + 1) * cellWidth,
            y: rect.y + rect.height
          },
          thickness: 0.4,
          color: rgb(0.75, 0.75, 0.75)
        });
      } catch {
        /* best effort */
      }
    }
  });
}

export function _fitSingleLineFontSize(text, rect, font) {
  let size = Math.min(12, rect.height - 4);
  size = Math.max(size, 6);

  while (size > 6) {
    const width = font.widthOfTextAtSize(text, size);
    if (width <= rect.width - 4) return size;
    size -= 0.5;
  }

  return 6;
}

export function _drawCheckBox(page, field, rect, zapf) {
  let checked = false;
  try {
    checked = field.isChecked();
  } catch {
    checked = false;
  }

  if (!checked) return;

  const size = Math.max(8, Math.min(rect.width, rect.height) - 4);

  page.drawText("\u2714", {
    x: rect.x + Math.max(1, (rect.width - size * 0.7) / 2),
    y: rect.y + Math.max(1, (rect.height - size) / 2),
    size,
    font: zapf,
    color: rgb(0, 0, 0)
  });
}

export function _drawRadioGroup(page, field, widget, rect) {
  let selected = null;
  try {
    selected = field.getSelected();
  } catch {
    selected = null;
  }

  if (!selected) return;

  let widgetOnValue = null;
  try {
    widgetOnValue = widget.getOnValue?.();
  } catch {
    /* ignore */
  }

  if (!widgetOnValue) {
    try {
      const ap = widget.dict?.lookupMaybe?.(PDFName.of("AP"), PDFDict);
      const n = ap?.lookupMaybe?.(PDFName.of("N"), PDFDict);
      if (n) {
        const keys = n.keys();
        for (const k of keys) {
          const name = k?.decodeText?.() ?? k?.encodedName ?? String(k);
          if (name !== "/Off" && name !== "Off") {
            widgetOnValue = name.replace(/^\//, "");
            break;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  const selectedStr = String(selected).replace(/^\//, "");
  const onStr = String(widgetOnValue ?? "").replace(/^\//, "");

  if (!onStr || selectedStr !== onStr) return;

  // Circle outline
  try {
    page.drawEllipse({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      xScale: rect.width / 2 - 1,
      yScale: rect.height / 2 - 1,
      borderWidth: 0.8,
      borderColor: rgb(0, 0, 0)
    });
  } catch {
    /* best effort */
  }

  // Inner filled dot (drawn as a filled ellipse instead of a text glyph
  // so we avoid WinAnsi encoding issues with bullet characters)
  try {
    const r = Math.min(rect.width, rect.height) / 4;
    page.drawEllipse({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      xScale: r,
      yScale: r,
      color: rgb(0, 0, 0)
    });
  } catch {
    /* best effort */
  }
}

export function _drawDropdown(page, field, rect, font) {
  let text = "";
  try {
    const selected = field.getSelected?.();
    if (Array.isArray(selected)) {
      text = selected.join(", ");
    } else {
      text = selected ?? "";
    }
  } catch {
    text = "";
  }

  text = String(text ?? "");
  if (!text) return;

  const fontSize = _fitSingleLineFontSize(text, rect, font);

  page.drawText(text, {
    x: rect.x + 2,
    y: rect.y + Math.max(2, (rect.height - fontSize) / 2),
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: Math.max(1, rect.width - 12)
  });
}
