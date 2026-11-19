// @vitest-environment node
// Characterization tests for #68 (UtilsPart05 split):
// - capture the observable behavior of signPdfFun / createDocument /
//   getFirstLetter BEFORE the <=50-line split, so the refactor can prove
//   exports and behavior stay identical.
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));
vi.mock("parse", () => ({
  default: { Cloud: { run: vi.fn() } }
}));
vi.mock("./imageHandling.js", () => ({
  fetchImageBase64: vi.fn(),
  changeImageWH: vi.fn()
}));
vi.mock("./tenantDownloads.js", () => ({ getTenantDetails: vi.fn() }));
vi.mock("./widgetCatalog.js", () => ({ widgets: [] }));

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

const axios = (await import("axios")).default;
const Parse = (await import("parse")).default;
const { fetchImageBase64, changeImageWH } = await import(
  "./imageHandling.js"
);
const { getTenantDetails } = await import("./tenantDownloads.js");
const { signPdfFun, createDocument, getFirstLetter } = await import(
  "./UtilsPart05.js"
);

const signatureWidgets = (signUrl) => [
  { pos: [{ type: "signature", SignUrl: signUrl }] }
];

const templateDoc = (overrides = {}) => ({
  Name: "Agreement",
  URL: "https://files.example/doc.pdf",
  SignedUrl: "https://files.example/signed.pdf",
  SentToOthers: false,
  Description: "desc",
  Note: "note",
  ExtUserPtr: { objectId: "ext1" },
  CreatedBy: { objectId: "user1" },
  objectId: "tpl1",
  ...overrides
});

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
  store.set("baseUrl", "https://parse.example/");
  store.set("parseAppId", "appId");
  store.set("accesstoken", "token");
});

describe("signPdfFun", () => {
  it("rejects a missing pdf payload without any cloud call", async () => {
    await expect(signPdfFun("", "d1", "s1", "o1", [], "Signed")).resolves.toEqual(
      { status: "error", message: "No PDF data to sign." }
    );
    expect(Parse.Cloud.run).not.toHaveBeenCalled();
  });

  it("rejects when the tenant no longer exists", async () => {
    getTenantDetails.mockResolvedValue("user does not exist!");
    await expect(
      signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed")
    ).resolves.toEqual({ status: "error", message: "User does not exist." });
    expect(Parse.Cloud.run).not.toHaveBeenCalled();
  });

  it("signs without tenant lookup or signature payload on the QES path", async () => {
    Parse.Cloud.run.mockResolvedValue({ objectId: "signed1" });
    const res = await signPdfFun("base64pdf", "d1", "s1", undefined, [], undefined);
    expect(getTenantDetails).not.toHaveBeenCalled();
    expect(Parse.Cloud.run).toHaveBeenCalledWith("signPdf", {
      pdfFile: "base64pdf",
      docId: "d1",
      userId: "s1",
      isCustomCompletionMail: false,
      signature: "",
      activity: "Signed"
    });
    expect(res).toEqual({ objectId: "signed1" });
  });

  it("flags a custom completion mail when the tenant defines one", async () => {
    getTenantDetails.mockResolvedValue({
      CompletionBody: "body",
      CompletionSubject: "subject"
    });
    Parse.Cloud.run.mockResolvedValue({ objectId: "signed2" });
    await signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed");
    expect(Parse.Cloud.run).toHaveBeenCalledWith(
      "signPdf",
      expect.objectContaining({ isCustomCompletionMail: true })
    );
  });

  it("converts an https signature to a resized suffix payload", async () => {
    getTenantDetails.mockResolvedValue({});
    fetchImageBase64.mockResolvedValue("data:image/png;base64,AAA");
    changeImageWH.mockResolvedValue("data:image/png;base64,BBB");
    Parse.Cloud.run.mockResolvedValue({ objectId: "signed3" });
    await signPdfFun(
      "base64pdf",
      "d1",
      "s1",
      "o1",
      signatureWidgets("https://files.example/sign.png"),
      "Signed"
    );
    expect(fetchImageBase64).toHaveBeenCalledWith(
      "https://files.example/sign.png"
    );
    expect(Parse.Cloud.run).toHaveBeenCalledWith(
      "signPdf",
      expect.objectContaining({ signature: "BBB" })
    );
  });

  it("keeps an inline base64 signature payload resized without refetch", async () => {
    getTenantDetails.mockResolvedValue({});
    changeImageWH.mockResolvedValue("data:image/png;base64,CCC");
    Parse.Cloud.run.mockResolvedValue({ objectId: "signed4" });
    await signPdfFun(
      "base64pdf",
      "d1",
      "s1",
      "o1",
      signatureWidgets("data:image/png;base64,DDD"),
      "Signed"
    );
    expect(fetchImageBase64).not.toHaveBeenCalled();
    expect(Parse.Cloud.run).toHaveBeenCalledWith(
      "signPdf",
      expect.objectContaining({ signature: "CCC" })
    );
  });

  it("maps a signature-image fetch failure to a generic error", async () => {
    getTenantDetails.mockResolvedValue({});
    fetchImageBase64.mockRejectedValue(new Error("net down"));
    await expect(
      signPdfFun(
        "base64pdf",
        "d1",
        "s1",
        "o1",
        signatureWidgets("https://files.example/sign.png"),
        "Signed"
      )
    ).resolves.toEqual({ status: "error", message: "something went wrong." });
    expect(Parse.Cloud.run).not.toHaveBeenCalled();
  });

  it("maps cloud failures to the documented messages", async () => {
    getTenantDetails.mockResolvedValue({});
    Parse.Cloud.run.mockRejectedValue(new Error("file is encrypted."));
    await expect(
      signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed")
    ).resolves.toEqual({
      status: "error",
      message: "Currently encrypted pdf files are not supported."
    });

    Parse.Cloud.run.mockRejectedValue(new Error("wrong password"));
    await expect(
      signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed")
    ).resolves.toEqual({
      status: "error",
      message: "PFX file password is invalid."
    });

    Parse.Cloud.run.mockRejectedValue(
      Object.assign(new Error("strict signing order"), { code: 119 })
    );
    await expect(
      signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed")
    ).resolves.toEqual({
      status: "error",
      message: "strict signing order"
    });

    Parse.Cloud.run.mockRejectedValue(new Error("boom"));
    await expect(
      signPdfFun("base64pdf", "d1", "s1", "o1", [], "Signed")
    ).resolves.toEqual({ status: "error", message: "something went wrong." });
  });
});

describe("createDocument", () => {
  it("does nothing without a template", async () => {
    await expect(createDocument([], [], [], null, false)).resolves.toBeUndefined();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("builds the document payload with defaults and posts it", async () => {
    axios.post.mockResolvedValue({
      data: { result: { objectId: "doc1" } }
    });
    const res = await createDocument(
      [templateDoc()],
      [{ pageNumber: 1, pos: [] }],
      [{ objectId: "contact1" }],
      "https://files.example/signed.pdf",
      true
    );
    expect(axios.post).toHaveBeenCalledWith(
      "https://parse.example/functions/createdocumentfromapp",
      expect.objectContaining({
        document: expect.objectContaining({
          Name: "Agreement",
          URL: "https://files.example/signed.pdf",
          SignedUrl: "https://files.example/signed.pdf",
          TimeToCompleteDays: 15,
          RemindOnceInEvery: 5,
          Signers: [
            {
              __type: "Pointer",
              className: "contracts_Contactbook",
              objectId: "contact1"
            }
          ],
          ExtUserPtr: {
            __type: "Pointer",
            className: "contracts_Users",
            objectId: "ext1"
          },
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: "user1"
          },
          TemplateId: {
            __type: "Pointer",
            className: "contracts_Template",
            objectId: "tpl1"
          }
        })
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Parse-Session-Token": "token"
        })
      })
    );
    expect(res).toEqual({
      status: "success",
      id: "doc1",
      data: { objectId: "doc1" }
    });
  });

  it("keeps an explicit completion window instead of the default", async () => {
    axios.post.mockResolvedValue({
      data: { result: { objectId: "doc2" } }
    });
    await createDocument([templateDoc({ TimeToCompleteDays: "30" })], [], [], null, false);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        document: expect.objectContaining({ TimeToCompleteDays: 30 })
      }),
      expect.anything()
    );
  });

  it("blocks runaway automatic reminders", async () => {
    const res = await createDocument(
      [
        templateDoc({
          TimeToCompleteDays: 100,
          RemindOnceInEvery: 5,
          autoreminder: true
        })
      ],
      [],
      [],
      null,
      false
    );
    expect(res).toEqual({ status: "error", id: "only-15-reminder-allowed" });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("maps a post failure to the error status", async () => {
    axios.post.mockRejectedValue({ response: { data: {} } });
    const res = await createDocument([templateDoc()], [], [], null, false);
    expect(res).toEqual({
      status: "error",
      id: "something-went-wrong-mssg"
    });
  });
});

describe("getFirstLetter", () => {
  it("returns the first character", () => {
    expect(getFirstLetter("OpenSign")).toBe("O");
    expect(getFirstLetter("")).toBe("");
    expect(getFirstLetter(undefined)).toBeUndefined();
  });
});
