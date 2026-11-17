import axios from "axios";
import { getErrorMessage } from "../../utils/creditErrors";
import Parse from "parse";
import { fetchImageBase64 } from "./UtilsPart10.js";
import { changeImageWH } from "./UtilsPart10.js";
import { getTenantDetails } from "./UtilsPart13.js";
import { widgets } from "./UtilsPart02.js";
import { DEFAULT_COMPLETION_DAYS } from "../runtimeConfig.js";

export const signPdfFun = async (
  base64Url,
  documentId,
  signerObjectId,
  objectId,
  widgets,
  activity
) => {
  let isCustomCompletionMail = false;
  if (!base64Url) {
    return { status: "error", message: "No PDF data to sign." };
  }
  try {
    //qes: skip getTenantDetails when objectId is unavailable (QES redirect-back)
    if (objectId) {
      //get tenant details
      const tenantDetails = await getTenantDetails(objectId);
      if (tenantDetails && tenantDetails === "user does not exist!") {
        return { status: "error", message: "User does not exist." };
      } else {
        if (tenantDetails?.CompletionBody && tenantDetails?.CompletionSubject) {
          isCustomCompletionMail = true;
        }
      }
    }
    //qes: skip widget-based signature extraction (eID Easy already signed the PDF)
    let suffixbase64 = ""; //qes: declare outside for QES path
    // below for loop is used to get first signature of user to send if to signpdf
    // for adding it in completion certificate
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

    let base64Sign = getSignature?.SignUrl;
    if (base64Sign) {
      //check https type signature (default signature exist) then convert in base64
      const isUrl = base64Sign.includes("https");
      if (isUrl) {
        try {
          base64Sign = await fetchImageBase64(base64Sign);
        } catch (e) {
          console.log("error", e);
          return { status: "error", message: "something went wrong." };
        }
      }
      //change image width and height to 300/120 in png base64
      const imagebase64 = await changeImageWH(base64Sign);
      //remove suffiix of base64 (without type)
      suffixbase64 = imagebase64 && imagebase64.split(",").pop();
    }

    const params = {
      pdfFile: base64Url,
      docId: documentId,
      userId: signerObjectId,
      isCustomCompletionMail: isCustomCompletionMail,
      signature: suffixbase64, //qes: will be empty string for QES
      activity: activity || "Signed"
    };
    const resSignPdf = await Parse.Cloud.run("signPdf", params);
    if (resSignPdf) {
      const signedPdf = JSON.parse(JSON.stringify(resSignPdf));
      return signedPdf;
    }
  } catch (e) {
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
    const date = new Date();
    const isoDate = date.toISOString();
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
    let placeholdersArr = [];
    if (placeholders?.length > 0) {
      placeholdersArr = placeholders;
    }
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
    const useNameAsSender = extClass?.[0]?.UseNameAsSender === true;
    const senderName =
      Doc?.SenderName || (useNameAsSender ? extClass?.[0]?.Name || "" : "");
    const senderMail =
      Doc?.SenderMail || (useNameAsSender ? extClass?.[0]?.Email || "" : "");
    const SenderName = senderName ? { SenderName: senderName } : {};
    const SenderMail = senderMail ? { SenderMail: senderMail } : {};
    const SignatureType = Doc?.SignatureType
      ? { SignatureType: Doc?.SignatureType }
      : {};
    const NotifyOnSignatures =
      Doc?.NotifyOnSignatures !== undefined
        ? { NotifyOnSignatures: Doc?.NotifyOnSignatures }
        : {};
    const Bcc = Doc?.Bcc?.length > 0 ? { Bcc: Doc?.Bcc } : {};
    const Cc = Doc?.Cc?.length > 0 ? { Cc: Doc?.Cc } : {};
    const RedirectUrl = Doc?.RedirectUrl
      ? { RedirectUrl: Doc?.RedirectUrl }
      : {};
    const PenColors =
      Doc?.PenColors?.length > 0 ? { PenColors: Doc?.PenColors } : {};
    const TemplateId = Doc?.objectId
      ? {
          TemplateId: {
            __type: "Pointer",
            className: "contracts_Template",
            objectId: Doc?.objectId
          }
        }
      : {};
    const data = {
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
        objectId: extUserId
      },
      CreatedBy: { __type: "Pointer", className: "_User", objectId: creatorId },
      Signers: signers,
      SendinOrder: Doc?.SendinOrder || false,
      AutomaticReminders: Doc?.AutomaticReminders || false,
      RemindOnceInEvery: parseInt(Doc?.RemindOnceInEvery || 5),
      IsEnableOTP: Doc?.IsEnableOTP || false,
      SendInOrderStrict: Doc?.SendInOrderStrict || false,
      IsTourEnabled: Doc?.IsTourEnabled || false,
      AllowModifications: Doc?.AllowModifications || false,
      TimeToCompleteDays: parseInt(Doc?.TimeToCompleteDays) || DEFAULT_COMPLETION_DAYS,
      DocSentAt: { __type: "Date", iso: isoDate },
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
    const remindOnceInEvery = Doc?.RemindOnceInEvery;
    const TimeToCompleteDays = parseInt(Doc?.TimeToCompleteDays);
    const reminderCount = TimeToCompleteDays / remindOnceInEvery;
    const AutomaticReminders = Doc.autoreminder;
    if (AutomaticReminders && reminderCount > 15) {
      return { status: "error", id: "only-15-reminder-allowed" };
    }
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
  }
};

export const getFirstLetter = (name) => {
  const firstLetter = name?.charAt(0);
  return firstLetter;
};
