import {
  PDFDocument,
  PDFName,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
  PDFSignature,
  PDFTextField
} from "pdf-lib";

import {
  textInputWidget,
  textWidget,
  radioButtonWidget,
  randomId,
  generateId,
  defaultWidthHeight
} from "../constant/Utils";

/**
 * Maps a pdf-lib field instance to an OpenSign widget type.
 * @param {object} field - A pdf-lib form field
 * @returns {string|null} OpenSign widget type or null if unsupported
 */
const mapFieldType = (field) => {
  if (field instanceof PDFTextField) return textInputWidget;
  if (field instanceof PDFCheckBox) return "checkbox";
  if (field instanceof PDFDropdown) return "dropdown";
  if (field instanceof PDFRadioGroup) return radioButtonWidget;
  if (field instanceof PDFSignature) return "signature";
  return null;
};

/**
 * Extracts a numeric font size from the default appearance (DA) string of a
 * field or its first widget annotation.  Returns undefined when not found.
 * @param {object} field - A pdf-lib form field
 * @returns {number|undefined}
 */
const extractFontSize = (field) => {
  try {
    const widgets = field.acroField.getWidgets();
    const da =
      field.acroField.dict?.get(PDFName.of("DA"))?.toString() ||
      widgets?.[0]?.dict?.get(PDFName.of("DA"))?.toString() ||
      "";
    // DA string typically looks like "/Helv 12 Tf 0 g"
    const match = da.match(/(\d+(?:\.\d+)?)\s+Tf/);
    if (match) return parseFloat(match[1]);
  } catch {
    // ignore
  }
  return undefined;
};

const isFieldFilled = (field) => {
  try {
    if (field instanceof PDFCheckBox) return field.isChecked?.() || false;

    if (field instanceof PDFTextField) {
      return Boolean(field.getText?.()?.trim());
    }

    if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
      const selected = field.getSelected?.();
      return Array.isArray(selected)
        ? selected.length > 0
        : Boolean(selected?.trim?.());
    }

    if (field instanceof PDFSignature) {
      return Boolean(field.acroField.dict?.get(PDFName.of("V")));
    }

    return false;
  } catch {
    return false;
  }
};

const normalizeFieldValue = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value == null ? "" : String(value);
};

/**
 * Determine which PDF page index (0-based) a widget annotation belongs to.
 * @param {object} pdfDoc - A pdf-lib PDFDocument
 * @param {object} widgetDict - The widget annotation PDFDict
 * @returns {number} 0-based page index, defaults to 0
 */
const getWidgetPageIndex = (pdfDoc, widgetDict) => {
  // First try the /P (page) entry on the widget itself
  const pageRef = widgetDict.get(PDFName.of("P"));
  if (pageRef) {
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      // Compare refs by their string representation for reliability
      if (
        pages[i].ref === pageRef ||
        String(pages[i].ref) === String(pageRef)
      ) {
        return i;
      }
    }
  }
  // Fallback: iterate pages and check their /Annots arrays
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    try {
      const annots = pages[i].node.Annots();
      if (!annots) continue;
      const size = annots.size?.() || 0;
      for (let j = 0; j < size; j++) {
        const ref = annots.get(j);
        const resolved = pdfDoc.context.lookupMaybe
          ? pdfDoc.context.lookupMaybe(ref)
          : pdfDoc.context.lookup(ref);
        if (resolved === widgetDict) return i;
      }
    } catch {
      // some pages might not have valid annotations
    }
  }
  return 0;
};

/**
 * Extracts acroform field metadata from a PDF before it is flattened.
 *
 * @param {string|Uint8Array|ArrayBuffer} pdfFile - The raw PDF data
 * @returns {Promise<{fields: Array, pageCount: number}>} Extracted fields and page count
 *
 * Each extracted field object contains:
 *   - fieldName:     original PDF field name
 *   - type:          OpenSign widget type string
 *   - pageNumber:    1-based page number
 *   - xPosition:     x coordinate in PDF points (top-left origin)
 *   - yPosition:     y coordinate in PDF points (top-left origin)
 *   - width:         field width in PDF points
 *   - height:        field height in PDF points
 *   - defaultValue:  the field's current/default value
 *   - fontSize:      detected font size (if any)
 *   - options:       dropdown/radio option values (if any)
 *   - isChecked:     checkbox checked state (if applicable)
 *   - isRequired:    whether the field was marked required
 */
export const extractAcroFields = async (pdfFile) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfFile, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (!fields || fields.length === 0)
      return { fields: [], pageCount: pdfDoc.getPageCount() };

    const pages = pdfDoc.getPages();
    const extracted = [];

    for (const field of fields) {
      const widgetType = mapFieldType(field);
      if (!widgetType) continue; // skip unsupported types (e.g. buttons)
      if (isFieldFilled(field)) continue;

      const fontSize = extractFontSize(field);
      const isRequired = field.isRequired?.() || false;

      // Extract type-specific data
      let defaultValue = "";
      let fieldOptions = [];
      let isChecked = false;

      switch (widgetType) {
        case textInputWidget:
          defaultValue = field.getText?.() || "";
          break;
        case "checkbox":
          isChecked = field.isChecked?.() || false;
          break;
        case "dropdown":
          fieldOptions = field.getOptions?.() || [];
          defaultValue = normalizeFieldValue(field.getSelected?.());
          break;
        case radioButtonWidget:
          fieldOptions = field.getOptions?.() || [];
          defaultValue = normalizeFieldValue(field.getSelected?.());
          break;
        case "signature":
          break;
        default:
          break;
      }

      // Process widget annotations for this field.
      // For checkbox and radio types, create a single extracted entry per
      // field (not one per widget annotation) so that multiple annotations
      // sharing the same PDF field name are grouped into one OpenSign widget.
      const widgets = field.acroField.getWidgets();
      if (
        (widgetType === "checkbox" || widgetType === radioButtonWidget) &&
        widgets.length > 0
      ) {
        const firstWidget = widgets[0];
        const rect = firstWidget.getRectangle();
        if (rect) {
          const pageIndex = getWidgetPageIndex(pdfDoc, firstWidget.dict);
          const page = pages[pageIndex];
          if (page) {
            const pageHeight = page.getHeight();
            extracted.push({
              fieldName: field.getName(),
              type: widgetType,
              pageNumber: pageIndex + 1,
              xPosition: rect.x,
              yPosition: pageHeight - rect.y - rect.height,
              width: rect.width,
              height: rect.height,
              defaultValue,
              fontSize,
              options: fieldOptions,
              isChecked,
              isRequired
            });
          }
        }
      } else {
        for (const widget of widgets) {
          const rect = widget.getRectangle();
          if (!rect) continue;

          const pageIndex = getWidgetPageIndex(pdfDoc, widget.dict);
          const page = pages[pageIndex];
          if (!page) continue;

          const pageHeight = page.getHeight();

          // Convert from PDF coordinate system (bottom-left origin)
          // to OpenSign coordinate system (top-left origin)
          const xPos = rect.x;
          const yPos = pageHeight - rect.y - rect.height;

          extracted.push({
            fieldName: field.getName(),
            type: widgetType,
            pageNumber: pageIndex + 1, // 1-based
            xPosition: xPos,
            yPosition: yPos,
            width: rect.width,
            height: rect.height,
            defaultValue,
            fontSize,
            options: fieldOptions,
            isChecked,
            isRequired
          });
        }
      }
    }

    return { fields: extracted, pageCount: pdfDoc.getPageCount() };
  } catch (err) {
    console.log("Error extracting acroform fields:", err);
    return { fields: [], pageCount: 0 };
  }
};

/**
 * Converts extracted acroform fields into OpenSign widget position objects
 * for placeholder-based flows (PlaceHolderSign, TemplatePlaceholder,
 * DraftDocument, DraftTemplate).
 *
 * @param {Array} acroFields - Array from extractAcroFields()
 * @param {object} params
 * @param {Array}  params.existingPlaceholder - Current placeholder array for the signer
 * @param {number} params.startZIndex - Starting zIndex value
 * @returns {{ pages: Array, nextZIndex: number }}
 *   pages: Array of { pageNumber, pos: [widgetObj, ...] } suitable for merging
 *   into a signer's placeHolder array.
 */
export const convertAcroFieldsToPlaceholderWidgets = (
  acroFields,
  { existingPlaceholder = [], startZIndex = 1, isSelfSign = false } = {}
) => {
  const pagesMap = {};
  let zIndex = startZIndex;

  for (const field of acroFields) {
    const key = randomId(8);
    const id = generateId(6);
    // For self-sign flows, text input fields become text widgets
    const type =
      isSelfSign && field.type === textInputWidget ? textWidget : field.type;

    // Count existing widgets of this type for naming
    const existingCount =
      existingPlaceholder?.reduce((count, page) => {
        return count + (page.pos || []).filter((w) => w.type === type).length;
      }, 0) || 0;
    const countInBatch = Object.values(pagesMap).reduce((count, arr) => {
      return count + arr.filter((w) => w.type === type).length;
    }, 0);
    const count = existingCount + countInBatch + 1;

    const options = buildWidgetOptions(type, id, count, field);
    const defaultDim = defaultWidthHeight(type);

    const widgetObj = {
      xPosition: field.xPosition,
      yPosition: field.yPosition,
      isStamp: false,
      key: String(key),
      type,
      Width: field.width > 0 ? field.width : defaultDim.width,
      Height: field.height > 0 ? field.height : defaultDim.height,
      options,
      zIndex: zIndex++
    };

    if (!pagesMap[field.pageNumber]) {
      pagesMap[field.pageNumber] = [];
    }
    pagesMap[field.pageNumber].push(widgetObj);
  }

  const pages = Object.entries(pagesMap).map(([pageNum, posArr]) => ({
    pageNumber: parseInt(pageNum, 10),
    pos: posArr
  }));

  return { pages, nextZIndex: zIndex };
};

/**
 * Converts extracted acroform fields into OpenSign widget position objects
 * for self-sign / sign-yourself flows.
 *
 * @param {Array} acroFields - Array from extractAcroFields()
 * @param {object} params
 * @param {Array}  params.existingPositions - Current xyPosition array
 * @param {number} params.startZIndex - Starting zIndex value
 * @returns {{ pages: Array, nextZIndex: number }}
 */
export const convertAcroFieldsToSelfSignWidgets = (
  acroFields,
  { existingPositions = [], startZIndex = 1 } = {}
) => {
  const pagesMap = {};
  let zIndex = startZIndex;

  for (const field of acroFields) {
    const key = randomId(8);
    const id = generateId(6);
    // For self-sign flows, text input fields become text widgets
    const type = field.type === textInputWidget ? textWidget : field.type;

    // Count existing widgets of this type
    const existingCount = existingPositions.reduce((count, page) => {
      return count + (page.pos || []).filter((w) => w.type === type).length;
    }, 0);
    const countInBatch = Object.values(pagesMap).reduce((count, arr) => {
      return count + arr.filter((w) => w.type === type).length;
    }, 0);
    const count = existingCount + countInBatch + 1;

    const options = buildWidgetOptions(type, id, count, field);
    const defaultDim = defaultWidthHeight(type);

    const widgetObj = {
      xPosition: field.xPosition,
      yPosition: field.yPosition,
      isStamp: false,
      key: String(key),
      type,
      Width: field.width > 0 ? field.width : defaultDim.width,
      Height: field.height > 0 ? field.height : defaultDim.height,
      options,
      zIndex: zIndex++
    };

    if (!pagesMap[field.pageNumber]) {
      pagesMap[field.pageNumber] = [];
    }
    pagesMap[field.pageNumber].push(widgetObj);
  }

  const pages = Object.entries(pagesMap).map(([pageNum, posArr]) => ({
    pageNumber: parseInt(pageNum, 10),
    pos: posArr
  }));

  return { pages, nextZIndex: zIndex };
};

const hasFilledAcroFields = (fields = []) =>
  fields.some(
    (field) =>
      field.isChecked ||
      (typeof field.defaultValue === "string" && field.defaultValue.trim())
  );

/**
 * Build widget options object based on field type and extracted data.
 */
function buildWidgetOptions(type, id, count, field) {
  // Use PDF field name as widget name when available, otherwise generate one
  const baseName = field.fieldName || `${type}-${id}-${count}`;
  const base = {
    name: baseName,
    status: field.isRequired ? "required" : "optional"
  };

  switch (type) {
    case textInputWidget:
    case textWidget:
      return {
        ...base,
        defaultValue: field.defaultValue || "",
        isReadOnly: false,
        isHideText: false,
        ...(field.fontSize ? { fontSize: field.fontSize } : {})
      };
    case "checkbox":
      return {
        ...base,
        values: [field.fieldName || `checkbox-${id}-${count}`],
        isReadOnly: false,
        isHideLabel: true,
        validation: {
          minRequiredCount: 0,
          maxRequiredCount: 0
        },
        defaultValue: field.isChecked ? [0] : []
      };
    case "dropdown":
      return {
        ...base,
        values: field.options || [],
        defaultValue: normalizeFieldValue(field.defaultValue),
        ...(field.fontSize ? { fontSize: field.fontSize } : {})
      };
    case radioButtonWidget:
      return {
        ...base,
        values: field.options || [],
        defaultValue: field.defaultValue || "",
        isReadOnly: false,
        isHideLabel: true
      };
    case "signature":
      return base;
    default:
      return base;
  }
}

/**
 * Stores extracted acroform fields in sessionStorage.
 * @param {Array} fields - Extracted fields from extractAcroFields
 * @param {boolean} isSignyourself - True if form is for "Sign Yourself"
 */
export const storeAcroFields = (fields = [], isSignyourself = false) => {
  const filteredFields = fields.filter(({ fieldName, width, height, type }) => {
    // Remove invalid hidden Signature1 field
    const isHiddenSignatureField =
      fieldName === "Signature1" && width === 0 && height === 0;

    // Remove radio buttons only for "Sign Yourself"
    const isExcludedRadioButton = isSignyourself && type === radioButtonWidget;

    return !isHiddenSignatureField && !isExcludedRadioButton;
  });
  if (hasFilledAcroFields(filteredFields)) {
    sessionStorage.removeItem("acroFields");
    return;
  }
  // if (acroFields && acroFields.length > 0) {
  try {
    sessionStorage.setItem("acroFields", JSON.stringify(filteredFields));
  } catch (err) {
    console.log("Error storing acroform fields:", err);
  }
  // }
};

/**
 * Retrieves and clears stored acroform fields from sessionStorage.
 * @returns {Array|null} Extracted fields or null
 */
export const getAndClearAcroFields = () => {
  try {
    const data = sessionStorage.getItem("acroFields");
    if (data) {
      sessionStorage.removeItem("acroFields");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error retrieving acroform fields:", err);
  }
  return null;
};

export const clearAcroFields = async (pdfFile) => {
  const pdfDoc = await PDFDocument.load(pdfFile, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const populatedFields = fields.filter(isFieldFilled);

  if (populatedFields.length > 0) {
    try {
      // Keep pre-filled fields, but remove empty source controls so the
      // auto-detected widgets are the only controls for those positions.
      fields.forEach((field) => {
        if (!isFieldFilled(field)) form.removeField(field);
      });
      return await pdfDoc.save({ useObjectStreams: false });
    } catch {
      // Preserve the original PDF if a malformed field cannot be removed.
      return pdfFile;
    }
  }

  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of("AcroForm"));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry)
      : pdfDoc.context.lookup(acroFormEntry);

    if (acroForm && typeof acroForm.set === "function") {
      // Avoid pdf-lib form APIs here; some malformed PDFs crash while
      // iterating/removing fields. Clearing /Fields directly is safer.
      acroForm.set(PDFName.of("Fields"), pdfDoc.context.obj([]));
      acroForm.delete(PDFName.of("XFA"));
      acroForm.delete(PDFName.of("SigFlags"));
    }
  } catch {
    // If AcroForm is malformed, continue with page annotation cleanup.
  }

  for (const page of pdfDoc.getPages()) {
    try {
      const annotationsRef = page.node.get(PDFName.of("Annots"));
      if (!annotationsRef) continue;

      const annotations = pdfDoc.context.lookup(annotationsRef);
      if (!annotations || !annotations.asArray) continue;

      const filtered = annotations.asArray().filter((annotRef) => {
        try {
          const annot = pdfDoc.context.lookup(annotRef);
          const subtype = annot?.get(PDFName.of("Subtype"));
          return subtype?.toString() !== "/Widget";
        } catch {
          return true;
        }
      });

      if (filtered.length === 0) {
        page.node.delete(PDFName.of("Annots"));
      } else {
        page.node.set(PDFName.of("Annots"), pdfDoc.context.obj(filtered));
      }
    } catch {
      // best effort cleanup
    }
  }

  try {
    pdfDoc.catalog.delete(PDFName.of("AcroForm"));
  } catch {
    // best effort cleanup
  }

  return await pdfDoc.save({ useObjectStreams: false });
};

export async function isPdfPasswordProtected(pdfBytes) {
  try {
    await PDFDocument.load(pdfBytes);
    return false; // PDF opened normally
  } catch (error) {
    console.error("Error in isPdfPasswordProtected:", error);
    throw error; // Other error
  }
}
