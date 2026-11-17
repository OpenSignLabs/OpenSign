import { PDFArray, PDFName, rgb } from 'pdf-lib';

/* ---- flattenPdf private helpers (kept with the pdf helpers) ---- */

function _safeGetWidgetsServer(field) {
  try {
    return field.acroField?.getWidgets?.() || [];
  } catch {
    return [];
  }
}

function _getWidgetRectServer(widget, pdfDoc) {
  try {
    const r = widget.getRectangle?.();
    if (r && isFinite(r.x) && isFinite(r.y) && isFinite(r.width) && isFinite(r.height)) {
      return r;
    }
  } catch {
    /* fall through to manual extraction */
  }

  try {
    const rectArr = widget.dict?.lookup?.(PDFName.of('Rect'));
    if (!rectArr || typeof rectArr.size !== 'function' || rectArr.size() !== 4) return null;

    const x1 = _numberFromPdfObjectServer(rectArr.get(0));
    const y1 = _numberFromPdfObjectServer(rectArr.get(1));
    const x2 = _numberFromPdfObjectServer(rectArr.get(2));
    const y2 = _numberFromPdfObjectServer(rectArr.get(3));

    if ([x1, y1, x2, y2].some(v => !isFinite(v))) return null;
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  } catch {
    return null;
  }
}

function _numberFromPdfObjectServer(obj) {
  if (!obj) return NaN;
  if (typeof obj.asNumber === 'function') return obj.asNumber();
  if (typeof obj.numberValue === 'function') return obj.numberValue();
  return Number(obj?.value ?? obj);
}

function _getWidgetPageServer(pdfDoc, pages, widget) {
  try {
    const pRef = widget.P?.();
    if (pRef) {
      for (const page of pages) {
        if (page.ref === pRef) return page;
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const pRef = widget.dict?.get?.(PDFName.of('P'));
    if (pRef) {
      for (const page of pages) {
        if (page.ref === pRef) return page;
      }
    }
  } catch {
    /* fall through */
  }

  // Fallback: search page annots
  try {
    for (const page of pages) {
      const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
      if (!annots) continue;

      for (let i = 0; i < annots.size(); i++) {
        const ref = annots.get(i);
        if (ref === widget.ref) return page;
      }
    }
  } catch {
    /* fall through */
  }

  return null;
}

function _drawWidgetBoxServer(page, rect) {
  try {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      borderWidth: 0.6,
      borderColor: rgb(0.65, 0.65, 0.65),
    });
  } catch {
    /* best effort */
  }
}

function _drawTextFieldServer(page, field, rect, font) {
  let text = '';
  try {
    text = field.getText?.() ?? '';
  } catch {
    text = '';
  }
  text = String(text ?? '');

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
    _drawCombTextServer(page, text, rect, font);
    return;
  }

  if (multiline || text.includes('\n')) {
    _drawMultilineTextServer(page, text, rect, font);
    return;
  }

  const fontSize = _fitSingleLineFontSizeServer(text, rect, font);
  const baselineY = rect.y + Math.max(2, (rect.height - fontSize) / 2);

  page.drawText(text, {
    x: rect.x + 2,
    y: baselineY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: Math.max(1, rect.width - 4),
  });
}

function _drawMultilineTextServer(page, text, rect, font) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const fontSize = Math.max(8, Math.min(11, rect.height / Math.max(lines.length + 0.5, 2)));
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
      lineHeight,
    });

    y -= lineHeight;
  }
}

function _drawCombTextServer(page, text, rect, font) {
  const chars = String(text).split('');
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
      color: rgb(0, 0, 0),
    });

    if (i < count - 1) {
      try {
        page.drawLine({
          start: { x: rect.x + (i + 1) * cellWidth, y: rect.y },
          end: { x: rect.x + (i + 1) * cellWidth, y: rect.y + rect.height },
          thickness: 0.4,
          color: rgb(0.75, 0.75, 0.75),
        });
      } catch {
        /* best effort */
      }
    }
  });
}

export function _fitSingleLineFontSizeServer(text, rect, font) {
  let size = Math.min(12, rect.height - 4);
  size = Math.max(size, 6);

  while (size > 6) {
    const width = font.widthOfTextAtSize(text, size);
    if (width <= rect.width - 4) return size;
    size -= 0.5;
  }

  return 6;
}
