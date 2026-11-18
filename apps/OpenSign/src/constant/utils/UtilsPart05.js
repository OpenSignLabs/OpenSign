import axios from "axios";
import { getErrorMessage } from "../../utils/creditErrors";
import Parse from "parse";
import { fetchImageBase64, changeImageWH } from "./imageHandling.js";
import { getTenantDetails } from "./tenantDownloads.js";
import { widgets } from "./widgetCatalog.js";
import { DEFAULT_COMPLETION_DAYS } from "../runtimeConfig.js";

// Resolve the tenant completion-mail flag for a non-QES signing flow.
const resolveCompletionMailFlag = async (objectId) => {
  // get tenant details
  const tenantDetails = await getTenantDetails(objectId);
  if (tenantDetails && tenantDetails === "user does not exist!") {
    return { error: { status: "error", message: "User does not exist." } };
  }
  return {
    isCustomCompletionMail: Boolean(
      tenantDetails?.CompletionBody && tenantDetails?.CompletionSubject
    )
  };
};

// Find the first signature widget across the positioned pages.
// below for loop is used to get first signature of user to send if to signpdf
// for adding it in completion certificate
const findFirstSignature = (widgets) => {
  let getSignature;
  for (let item of widgets || []) {
    if (!getSignature) {
      const typeExist = item.pos.some((data) => data?.type);
      if (typeExist) {
        getSignature = item.pos.find((data) => data?.type === "signature");
      } else {
        getSignature = item.pos.find((data) => !data.isStamp);
      }
    }
  }
  return getSignature;
};

// Normalize the first signature into the suffix-only payload the cloud
// function expects, refetching and resizing https signatures.
const normalizeSignatureSuffix = async (base64Sign) => {
  if (!base64Sign) {
    return { suffix: "" };
  }
  // check https type signature (default signature exist) then convert in base64
  const isUrl = base64Sign.includes("https");
  if (isUrl) {
    try {
      base64Sign = await fetchImageBase64(base64Sign);
    } catch (e) {
      console.log("error", e);
      return { error: { status: "error", message: "something went wrong." } };
    }
  }
  // change image width and height to 300/120 in png base64
  const imagebase64 = await changeImageWH(base64Sign);
  // remove suffiix of base64 (without type)
  return { suffix: imagebase64 && imagebase64.split(",").pop() };
};

// Map signPdf cloud failures to the documented user-facing messages.
const mapSignPdfError = (e) => {
  console.log("Err in signPdf cloud function ", e.message);
  if (e && e?.message?.includes("is encrypted.")) {
    return {
      status: "error",
      message: "Currently encrypted pdf files are not supported."
    };
  } else if (e?.message?.includes("password")) {
    return { status: "error", message: "PFX file password is invalid." };
  } else if (
    e?.code === 119 ||
    e?.message?.toLowerCase?.().includes("strict signing order")
  ) {
    return { status: "error", message: e.message };
  } else {
    return { status: "error", message: "something went wrong." };
  }
};

export const signPdfFun = async (
  base64Url,
  documentId,
  signerObjectId,
  objectId,
  widgets,
  activity
) => {
  if (!base64Url) {
    return { status: "error", message: "No PDF data to sign." };
  }
  // qes: skip widget-based signature extraction (eID Easy already signed the PDF)
  try {
    // qes: skip getTenantDetails when objectId is unavailable (QES redirect-back)
    let isCustomCompletionMail = false;
    if (objectId) {
      const tenant = await resolveCompletionMailFlag(objectId);
      if (tenant.error) {
        return tenant.error;
      }
      isCustomCompletionMail = tenant.isCustomCompletionMail;
    }
    const firstSignature = findFirstSignature(widgets);
    const normalized = await normalizeSignatureSuffix(
      firstSignature?.SignUrl
    );
    if (normalized.error) {
      return normalized.error;
    }
    // qes: will be empty string for QES
    const params = {
      pdfFile: base64Url,
      docId: documentId,
      userId: signerObjectId,
      isCustomCompletionMail: isCustomCompletionMail,
      signature: normalized.suffix, // qes: will be empty string for QES
      activity: activity || "Signed"
    };
    const resSignPdf = await Parse.Cloud.run("signPdf", params);
    if (resSignPdf) {
      const signedPdf = JSON.parse(JSON.stringify(resSignPdf));
      return signedPdf;
    }
  } catch (e) {
    return mapSignPdfError(e);
  }
};

// Resolve the document author pointers, honoring the extended-class override.
const resolveDocumentAuthors = (Doc) => {
  let extUserId = Doc.ExtUserPtr.objectId;
  let creatorId = Doc.CreatedBy.objectId;
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  if (extClass && extClass.length > 0) {
    if (Doc.ExtUserPtr?.objectId !== extClass?.[0]?.objectId) {
      if (extClass && extClass.length > 0) {
        extUserId = extClass[0].objectId;
        creatorId = extClass[0]?.UserId.objectId;
      }
    }
  }
  const useNameAsSender = extClass?.[0]?.UseNameAsSender === true;
  const senderName =
    Doc?.SenderName || (useNameAsSender ? extClass?.[0]?.Name || "" : "");
  const senderMail =
    Doc?.SenderMail || (useNameAsSender ? extClass?.[0]?.Email || "" : "");
  return { extUserId, creatorId, senderName, senderMail };
};

// Build contact-book pointer entries for the document signers.
const buildSignerPointers = (signerData) => {
  let signers = [];
  if (signerData?.length > 0) {
    signerData.forEach((x) => {
      if (x.objectId) {
        const obj = {
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: x.objectId
        };
        signers.push(obj);
      }
    });
  }
  return signers;
};

// Collect the optional document fields that only travel when present.
const buildOptionalDocumentFields = (Doc, senderName, senderMail) => {
  const SignatureType = Doc?.SignatureType
    ? { SignatureType: Doc?.SignatureType }
    : {};
  const NotifyOnSignatures =
    Doc?.NotifyOnSignatures !== undefined
      ? { NotifyOnSignatures: Doc?.NotifyOnSignatures }
      : {};
  const SenderName = senderName ? { SenderName: senderName } : {};
  const SenderMail = senderMail ? { SenderMail: senderMail } : {};
  const Bcc = Doc?.Bcc?.length > 0 ? { Bcc: Doc?.Bcc } : {};
  const Cc = Doc?.Cc?.length > 0 ? { Cc: Doc?.Cc } : {};
  const RedirectUrl = Doc?.RedirectUrl ? { RedirectUrl: Doc?.RedirectUrl } : {};
  const PenColors = Doc?.PenColors?.length > 0 ? { PenColors: Doc?.PenColors } : {};
  const TemplateId = Doc?.objectId
    ? {
        TemplateId: {
          __type: "Pointer",
          className: "contracts_Template",
          objectId: Doc?.objectId
        }
      }
    : {};
  return {
    ...SignatureType,
    ...NotifyOnSignatures,
    ...SenderName,
    ...SenderMail,
    ...Bcc,
    ...Cc,
    ...RedirectUrl,
    ...TemplateId,
    ...PenColors
  };
};

// Assemble the createdocumentfromapp payload from the template and authors.
const buildDocumentPayload = (
  Doc,
  { SignedUrl, isSendDoc, placeholdersArr, signers, authors }
) => {
  const date = new Date();
  const isoDate = date.toISOString();
  const optionals = buildOptionalDocumentFields(
    Doc,
    authors.senderName,
    authors.senderMail
  );
  return {
    Name: Doc.Name,
    URL: SignedUrl ? SignedUrl : Doc?.URL,
    SignedUrl: isSendDoc ? SignedUrl : Doc.SignedUrl,
    SentToOthers: Doc.SentToOthers,
    Description: Doc.Description,
    Note: Doc.Note,
    Placeholders: placeholdersArr,
    ExtUserPtr: {
      __type: "Pointer",
      className: "contracts_Users",
      objectId: authors.extUserId
    },
    CreatedBy: {
      __type: "Pointer",
      className: "_User",
      objectId: authors.creatorId
    },
    Signers: signers,
    SendinOrder: Doc?.SendinOrder || false,
    AutomaticReminders: Doc?.AutomaticReminders || false,
    RemindOnceInEvery: parseInt(Doc?.RemindOnceInEvery || 5),
    IsEnableOTP: Doc?.IsEnableOTP || false,
    SendInOrderStrict: Doc?.SendInOrderStrict || false,
    IsTourEnabled: Doc?.IsTourEnabled || false,
    AllowModifications: Doc?.AllowModifications || false,
    TimeToCompleteDays:
      parseInt(Doc?.TimeToCompleteDays) || DEFAULT_COMPLETION_DAYS,
    DocSentAt: { __type: "Date", iso: isoDate },
    ...optionals
  };
};

// Guard against runaway automatic-reminder schedules.
const exceedsReminderLimit = (Doc) => {
  const remindOnceInEvery = Doc?.RemindOnceInEvery;
  const TimeToCompleteDays = parseInt(Doc?.TimeToCompleteDays);
  const reminderCount = TimeToCompleteDays / remindOnceInEvery;
  const AutomaticReminders = Doc.autoreminder;
  return AutomaticReminders && reminderCount > 15;
};

// Post the payload to createdocumentfromapp and normalize the outcome.
const postCreateDocument = async (data) => {
  const url = `${localStorage.getItem("baseUrl")}functions/createdocumentfromapp`;
  const token = {
    "X-Parse-Session-Token": localStorage.getItem("accesstoken")
  };
  try {
    const res = await axios.post(
      url,
      { document: data },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          ...token
        }
      }
    );
    if (res) {
      const result = res.data.result;
      return { status: "success", id: result.objectId, data: result };
    }
  } catch (err) {
    const message = getErrorMessage(err) || "something went wrong.";
    console.error("error in create document:", message);
    return { status: "error", id: "something-went-wrong-mssg" };
  }
};

export const createDocument = async (
  template,
  placeholders,
  signerData,
  SignedUrl,
  isSendDoc
) => {
  if (template && template.length > 0) {
    const Doc = template[0];
    const authors = resolveDocumentAuthors(Doc);
    let placeholdersArr = [];
    if (placeholders?.length > 0) {
      placeholdersArr = placeholders;
    }
    const signers = buildSignerPointers(signerData);
    const data = buildDocumentPayload(Doc, {
      SignedUrl,
      isSendDoc,
      placeholdersArr,
      signers,
      authors
    });
    if (exceedsReminderLimit(Doc)) {
      return { status: "error", id: "only-15-reminder-allowed" };
    }
    return await postCreateDocument(data);
  }
};

export const getFirstLetter = (name) => {
  const firstLetter = name?.charAt(0);
  return firstLetter;
};
