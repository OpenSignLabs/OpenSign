import { PDFDocument } from "pdf-lib";
import { rgb } from "pdf-lib";
import { PDFName } from "pdf-lib";
import { StandardFonts } from "pdf-lib";
import { PDFArray } from "pdf-lib";
import { PDFDict } from "pdf-lib";
import { toPdfBytes } from "./pdfPageEdit.js";
import { hasSignatureField } from "./pdfPageEdit.js";
import { _drawTextField } from "./pdfFieldDrawing.js";
import { _drawCheckBox } from "./pdfFieldDrawing.js";
import { _drawRadioGroup } from "./pdfFieldDrawing.js";
import { _drawDropdown } from "./pdfFieldDrawing.js";
import { _drawOptionList } from "./widgetResponses.js";
import { _removeWidgetAnnotations } from "./widgetResponses.js";
import { widgets } from "./widgetCatalog.js";

export const flattenPdf = async (pdfFile) => {
  const inputBytes = toPdfBytes(pdfFile);
  const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });

  // Preserve existing digital signatures: if the document contains a
  // signature field (SigFlags or /FT /Sig), skip flattening entirely.
  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of("AcroForm"));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry, PDFDict)
      : pdfDoc.context.lookup(acroFormEntry);
    if (acroForm) {
      const sigFlags = acroForm.get(PDFName.of("SigFlags"));
      if (sigFlags && Number(sigFlags) > 0) {
        return inputBytes;
      }
      const fieldsRef = acroForm.get(PDFName.of("Fields"));
      const fields = fieldsRef ? pdfDoc.context.lookup(fieldsRef) : null;
      if (fields && typeof fields.asArray === "function") {
        for (const fRef of fields.asArray()) {
          const field = pdfDoc.context.lookup(fRef);
          if (hasSignatureField(pdfDoc.context, field)) return inputBytes;
        }
      }
    }
  } catch {
    // continue with normal flatten
  }

  // Preserve existing digital signatures: if the document contains a
  // signature field (SigFlags or /FT /Sig), skip flattening entirely.
  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of("AcroForm"));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry)
      : pdfDoc.context.lookup(acroFormEntry);
    if (acroForm) {
      const sigFlags = acroForm.get(PDFName.of("SigFlags"));
      if (sigFlags && Number(sigFlags) > 0) {
        return pdfFile;
      }
      const fieldsRef = acroForm.get(PDFName.of("Fields"));
      const fields = fieldsRef ? pdfDoc.context.lookup(fieldsRef) : null;
      if (fields && fields.asArray) {
        for (const fRef of fields.asArray()) {
          const f = pdfDoc.context.lookup(fRef);
          const ft = f?.get(PDFName.of("FT"));
          if (ft && ft.toString() === "/Sig") return pdfFile;
          const kidsRef = f?.get(PDFName.of("Kids"));
          const kids = kidsRef ? pdfDoc.context.lookup(kidsRef) : null;
          if (kids && kids.asArray) {
            for (const kRef of kids.asArray()) {
              const k = pdfDoc.context.lookup(kRef);
              const kft = k?.get(PDFName.of("FT"));
              if (kft && kft.toString() === "/Sig") return pdfFile;
            }
          }
        }
      }
    }
  } catch {
    // continue with normal flatten
  }

  let form;
  try {
    form = pdfDoc.getForm();
  } catch {
    // No form, nothing to flatten
    return await pdfDoc.save({ useObjectStreams: false });
  }

  // If any signature field exists, skip flatten to preserve it.
  try {
    const sigField = form
      .getFields()
      .some((f) => f?.constructor?.name === "PDFSignature");
    if (sigField) return pdfFile;
  } catch {
    // continue
  }

  const pages = pdfDoc.getPages();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const zapf = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);

  const fields = form.getFields();

  for (const field of fields) {
    const type = field.constructor.name;

    if (type === "PDFSignature") {
      continue;
    }

    const widgets = _safeGetWidgets(field);

    for (const widget of widgets) {
      const rect = _getWidgetRect(widget, pdfDoc);
      const page = _getWidgetPage(pdfDoc, pages, widget);

      if (!rect || !page) continue;

      _drawWidgetBox(page, rect);

      if (type === "PDFTextField") {
        _drawTextField(page, field, rect, helvetica);
      } else if (type === "PDFCheckBox") {
        _drawCheckBox(page, field, rect, zapf);
      } else if (type === "PDFRadioGroup") {
        _drawRadioGroup(page, field, widget, rect);
      } else if (type === "PDFDropdown") {
        _drawDropdown(page, field, rect, helvetica);
      } else if (type === "PDFOptionList") {
        _drawOptionList(page, field, rect, helvetica);
      } else if (type === "PDFButton") {
        // Push buttons are interactive controls, not meaningful data fields.
      }
    }
  }

  if (fields.length > 0) {
    _removeWidgetAnnotations(pdfDoc);
  }

  return await pdfDoc.save({ useObjectStreams: false });
};

export function _safeGetWidgets(field) {
  try {
    return field.acroField?.getWidgets?.() || [];
  } catch {
    return [];
  }
}

export function _getWidgetRect(widget, pdfDoc) {
  try {
    const r = widget.getRectangle?.();
    if (
      r &&
      isFinite(r.x) &&
      isFinite(r.y) &&
      isFinite(r.width) &&
      isFinite(r.height)
    ) {
      return r;
    }
  } catch {
    /* fall through to manual extraction */
  }

  try {
    const rectArr = widget.dict?.lookup?.(PDFName.of("Rect"));
    if (!rectArr || typeof rectArr.size !== "function" || rectArr.size() !== 4)
      return null;

    const x1 = _numberFromPdfObject(rectArr.get(0));
    const y1 = _numberFromPdfObject(rectArr.get(1));
    const x2 = _numberFromPdfObject(rectArr.get(2));
    const y2 = _numberFromPdfObject(rectArr.get(3));

    if ([x1, y1, x2, y2].some((v) => !isFinite(v))) return null;

    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1)
    };
  } catch {
    return null;
  }
}

export function _numberFromPdfObject(obj) {
  if (!obj) return NaN;
  if (typeof obj.asNumber === "function") return obj.asNumber();
  if (typeof obj.numberValue === "function") return obj.numberValue();
  return Number(obj?.value ?? obj);
}

export function _getWidgetPage(pdfDoc, pages, widget) {
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
    const pRef = widget.dict?.get?.(PDFName.of("P"));
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
      const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
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

export function _drawWidgetBox(page, rect) {
  try {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      borderWidth: 0.6,
      borderColor: rgb(0.65, 0.65, 0.65)
    });
  } catch {
    /* best effort */
  }
}
