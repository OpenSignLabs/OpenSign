// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { PDFDict, PDFDocument, PDFName, PDFRef, PDFString } from "pdf-lib";
import { copyPdfMetadata, mergePdfBuffers } from "./pdfDocumentUtils";
import { reorderPdfPages } from "../constant/Utils";

const creationDate = new Date("2020-02-03T04:05:06Z");

const createPdf = async ({ pageCount = 1, metadata = true } = {}) => {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage();
  }
  if (metadata) {
    doc.setTitle("Master service agreement");
    doc.setAuthor("José García");
    doc.setSubject("Contract");
    doc.setKeywords(["invoice:42", "契約"]);
    doc.setCreator("Word");
    doc.setCreationDate(creationDate);
  }
  return doc;
};

const expectOriginalMetadata = (doc) => {
  expect(doc.getTitle()).toBe("Master service agreement");
  expect(doc.getAuthor()).toBe("José García");
  expect(doc.getSubject()).toBe("Contract");
  expect(doc.getKeywords()).toBe("invoice:42 契約");
  expect(doc.getCreator()).toBe("Word");
  expect(doc.getCreationDate()).toEqual(creationDate);
};

const reload = async (doc) =>
  PDFDocument.load(await doc.save({ useObjectStreams: false }), {
    updateMetadata: false
  });

const infoDict = (doc) =>
  doc.context.lookup(doc.context.trailerInfo.Info, PDFDict);

describe("mergePdfBuffers", () => {
  it("keeps the metadata of a single uploaded PDF", async () => {
    const pdf = await (await createPdf()).save();

    expectOriginalMetadata(await reload(await mergePdfBuffers([pdf])));
  });

  it("keeps the metadata of the first PDF and all pages when merging", async () => {
    const first = await (await createPdf({ pageCount: 2 })).save();
    const second = await createPdf();
    second.setTitle("Second file");
    second.setKeywords(["second"]);

    const merged = await reload(
      await mergePdfBuffers([first, await second.save()])
    );

    expect(merged.getPageCount()).toBe(3);
    expectOriginalMetadata(merged);
  });

  it("keeps custom entries of the information dictionary", async () => {
    const doc = await createPdf();
    infoDict(doc).set(PDFName.of("Department"), PDFString.of("Legal"));

    const merged = await reload(await mergePdfBuffers([await doc.save()]));

    expect(infoDict(merged).lookup(PDFName.of("Department")).asString()).toBe(
      "Legal"
    );
  });

  it("merges PDFs that have no metadata", async () => {
    const pdf = await (await createPdf({ metadata: false })).save();

    const merged = await reload(await mergePdfBuffers([pdf, pdf]));

    expect(merged.getPageCount()).toBe(2);
    expect(merged.getKeywords()).toBeUndefined();
  });
});

describe("copyPdfMetadata", () => {
  it("copies metadata stored as indirect objects", async () => {
    const source = await createPdf();
    const titleRef = source.context.register(PDFString.of("Indirect title"));
    infoDict(source).set(PDFName.of("Title"), titleRef);
    const target = await PDFDocument.create();

    copyPdfMetadata(source, target);

    expect((await reload(target)).getTitle()).toBe("Indirect title");
  });

  it("still saves when an entry points to a missing object", async () => {
    const source = await createPdf();
    infoDict(source).set(PDFName.of("Broken"), PDFRef.of(9999));
    const target = await PDFDocument.create();

    copyPdfMetadata(source, target);

    expect((await reload(target)).getTitle()).toBe("Master service agreement");
  });

  it("does not copy the ciphertext metadata of an encrypted PDF", async () => {
    const source = await createPdf();
    source.isEncrypted = true;
    const target = await PDFDocument.create();

    copyPdfMetadata(source, target);

    expect(target.getKeywords()).toBeUndefined();
  });
});

describe("reorderPdfPages", () => {
  it("keeps the metadata and applies the new page order", async () => {
    const doc = await createPdf({ pageCount: 2 });
    doc.getPage(0).setWidth(100);
    doc.getPage(1).setWidth(200);

    const { arrayBuffer, totalPages } = await reorderPdfPages(
      await doc.save(),
      [2, 1]
    );

    const reordered = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false
    });
    expect(totalPages).toBe(2);
    expect(reordered.getPage(0).getWidth()).toBe(200);
    expectOriginalMetadata(reordered);
  });
});
