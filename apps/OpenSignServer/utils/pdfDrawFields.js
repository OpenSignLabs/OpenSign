import { PDFDict, PDFName, rgb } from 'pdf-lib';
import { _fitSingleLineFontSizeServer } from './pdfDraw.js';

function _drawCheckBoxServer(page, field, rect, zapf) {
  let checked = false;
  try {
    checked = field.isChecked();
  } catch {
    checked = false;
  }

  if (!checked) return;

  const size = Math.max(8, Math.min(rect.width, rect.height) - 4);

  page.drawText('✔', {
    x: rect.x + Math.max(1, (rect.width - size * 0.7) / 2),
    y: rect.y + Math.max(1, (rect.height - size) / 2),
    size,
    font: zapf,
    color: rgb(0, 0, 0),
  });
}

function _drawRadioGroupServer(page, field, widget, rect) {
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
      const ap = widget.dict?.lookupMaybe?.(PDFName.of('AP'), PDFDict);
      const n = ap?.lookupMaybe?.(PDFName.of('N'), PDFDict);
      if (n) {
        const keys = n.keys();
        for (const k of keys) {
          const name = k?.decodeText?.() ?? k?.encodedName ?? String(k);
          if (name !== '/Off' && name !== 'Off') {
            widgetOnValue = name.replace(/^\//, '');
            break;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  const selectedStr = String(selected).replace(/^\//, '');
  const onStr = String(widgetOnValue ?? '').replace(/^\//, '');

  if (!onStr || selectedStr !== onStr) return;

  // Circle outline
  try {
    page.drawEllipse({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      xScale: rect.width / 2 - 1,
      yScale: rect.height / 2 - 1,
      borderWidth: 0.8,
      borderColor: rgb(0, 0, 0),
    });
  } catch {
    /* best effort */
  }

  // Inner filled dot
  try {
    const r = Math.min(rect.width, rect.height) / 4;
    page.drawEllipse({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      xScale: r,
      yScale: r,
      color: rgb(0, 0, 0),
    });
  } catch {
    /* best effort */
  }
}

function _drawDropdownServer(page, field, rect, font) {
  let text = '';
  try {
    const selected = field.getSelected?.();
    if (Array.isArray(selected)) {
      text = selected.join(', ');
    } else {
      text = selected ?? '';
    }
  } catch {
    text = '';
  }

  text = String(text ?? '');
  if (!text) return;

  const fontSize = _fitSingleLineFontSizeServer(text, rect, font);

  page.drawText(text, {
    x: rect.x + 2,
    y: rect.y + Math.max(2, (rect.height - fontSize) / 2),
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: Math.max(1, rect.width - 12),
  });
}

function _drawOptionListServer(page, field, rect, font) {
  let selected = [];
  try {
    selected = field.getSelected?.() || [];
  } catch {
    selected = [];
  }

  if (!Array.isArray(selected)) {
    selected = [selected].filter(Boolean);
  }

  if (!selected.length) return;

  const lines = selected.map(v => String(v));
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
    });

    y -= lineHeight;
  }
}
