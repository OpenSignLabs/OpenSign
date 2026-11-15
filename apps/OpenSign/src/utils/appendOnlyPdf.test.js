// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  PDFName,
  PDFSignature,
  PDFString,
  PDFDocument as IncrementalPDFDocument
} from "@cantoo/pdf-lib";
import {
  flattenExceptSignatures,
  isAppendOnlyDoc,
  isAppendOnlyPdf,
  loadPdfForSigning
} from "./appendOnlyPdf";

const startsWith = (bytes, prefix) =>
  bytes.length > prefix.length && prefix.every((byte, i) => bytes[i] === byte);

// A PDF with a text field and, optionally, a signature field (as a desktop
// signature leaves one: field and widget in one dictionary with /FT /Sig).
async function formPdf({ withSignature = true } = {}) {
  const base = await PDFDocument.create();
  const page = base.addPage([600, 800]);
  const text = base.getForm().createTextField("company");
  text.setText("ACME");
  text.addToPage(page, { x: 50, y: 600, width: 200, height: 20 });
  const bytes = await base.save();
  if (!withSignature) return bytes;

  const doc = await IncrementalPDFDocument.load(bytes, {
    forIncrementalUpdate: true,
    updateMetadata: false
  });
  const p = doc.getPages()[0];
  const sig = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Widget",
      FT: "Sig",
      Rect: [0, 0, 0, 0],
      T: PDFString.of("BetterSign alice"),
      F: 4,
      P: p.ref
    })
  );
  p.node.addAnnot(sig);
  doc.getForm().acroForm.addField(sig);
  return doc.save();
}

describe("isAppendOnlyDoc", () => {
  it("is true only once a VLAD has signed", () => {
    expect(isAppendOnlyDoc({ VladSignatures: [{ vlad: "aa" }] })).toBe(true);
    expect(isAppendOnlyDoc({ VladSignatures: [] })).toBe(false);
    expect(isAppendOnlyDoc({})).toBe(false);
    expect(isAppendOnlyDoc(undefined)).toBe(false);
  });
});

describe("loadPdfForSigning", () => {
  it("appends in append-only mode", async () => {
    const bytes = await formPdf({ withSignature: false });
    const doc = await loadPdfForSigning(bytes, true);
    expect(isAppendOnlyPdf(doc)).toBe(true);
    doc.getPages()[0].drawText("signed", { x: 10, y: 10 });
    const out = Buffer.from(
      await doc.saveAsBase64({ useObjectStreams: false }),
      "base64"
    );
    expect(startsWith(out, bytes)).toBe(true);
  });

  it("uses plain pdf-lib otherwise", async () => {
    const doc = await loadPdfForSigning(
      await formPdf({ withSignature: false }),
      false
    );
    expect(isAppendOnlyPdf(doc)).toBe(false);
  });
});

describe("flattenExceptSignatures", () => {
  it("flattens form fields but keeps the signature field, appending", async () => {
    const bytes = await formPdf();
    const doc = await loadPdfForSigning(bytes, true);
    flattenExceptSignatures(doc.getForm());
    const out = await doc.save();
    expect(startsWith(out, bytes)).toBe(true);

    const fields = (await IncrementalPDFDocument.load(out))
      .getForm()
      .getFields();
    expect(fields.map((f) => f.getName())).toEqual(["BetterSign alice"]);
    expect(fields[0]).toBeInstanceOf(PDFSignature);
  });

  it("skips a widget it can't flatten instead of failing", async () => {
    const bytes = await formPdf();
    const doc = await loadPdfForSigning(bytes, true);
    // Make the text field's widget unplaceable: no /P, and not in any page's /Annots.
    const form = doc.getForm();
    const widget = form.getTextField("company").acroField.getWidgets()[0];
    widget.dict.delete(PDFName.of("P"));
    const page = doc.getPages()[0];
    page.node.removeAnnot(doc.context.getObjectRef(widget.dict));

    expect(() => flattenExceptSignatures(form)).not.toThrow();
    expect(form.getFields().map((f) => f.getName())).toEqual([
      "BetterSign alice"
    ]);
  });

  it("does nothing without a form", () => {
    expect(() => flattenExceptSignatures(undefined)).not.toThrow();
  });
});
