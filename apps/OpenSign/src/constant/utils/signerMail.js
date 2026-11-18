import axios from "axios";
import { replaceMailVaribles } from "./UtilsPart13.js";
import { mailTemplate } from "./widgetResponses.js";
import { DEFAULT_COMPLETION_DAYS } from "../runtimeConfig.js";

export const sendEmailToSigners = async (
  pdfDetails,
  signersdata,
  customizeMail,
  defaultMail,
  isCustomize
) => {
  let htmlReqBody;
  const owner = pdfDetails?.[0]?.ExtUserPtr;
  let sendMail;
  const getDocumentExpDate = pdfDetails?.[0]?.ExpiryDate?.iso;
  const getTemplateExpDate = new Date(pdfDetails[0]?.createdAt);
  getTemplateExpDate.setDate(
    getTemplateExpDate.getDate() +
    (pdfDetails[0]?.TimeToCompleteDays || DEFAULT_COMPLETION_DAYS)
  );
  const expireDate = getDocumentExpDate
    ? getDocumentExpDate
    : getTemplateExpDate;
  const newDate = new Date(expireDate);
  const localExpireDate = newDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let senderEmail =
    pdfDetails?.[0]?.SenderMail || pdfDetails?.[0]?.ExtUserPtr?.Email;
  let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
  let signerMail = signersdata.slice();
  if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
    signerMail = signerMail[0] ? [signerMail[0]] : [];
  }
  for (let i = 0; i < signerMail.length; i++) {
    try {
      let url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessionToken: localStorage.getItem("accesstoken")
      };
      const objectId = signerMail[i].objectId;
      const hostUrl = window.location.origin;
      //encode this url value `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
      const encodeBase64 = btoa(
        `${pdfDetails[0]?.objectId}/${signerMail[i].Email}/${objectId}`
      );
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      const orgName = pdfDetails[0]?.ExtUserPtr.Company
        ? pdfDetails[0].ExtUserPtr.Company
        : "";

      const useNameAsSender =
        pdfDetails?.[0]?.ExtUserPtr?.UseNameAsSender === true;

      const senderName =
        pdfDetails?.[0]?.SenderName || pdfDetails?.[0]?.ExtUserPtr?.Name;

      const from =
        pdfDetails?.[0]?.SenderName ||
        (useNameAsSender
          ? pdfDetails?.[0]?.ExtUserPtr?.Name || ""
          : senderEmail);

      const documentName = `${pdfDetails?.[0].Name}`;
      let replaceVar;

      if (customizeMail && isCustomize) {
        const replacedRequestBody = customizeMail?.body.replace(/"/g, "'");
        htmlReqBody =
          "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
          replacedRequestBody +
          "</body> </html>";

        const variables = {
          document_title: documentName,
          note: pdfDetails?.[0]?.Note,
          sender_name: senderName,
          sender_mail: senderEmail,
          sender_phone: senderPhone || "",
          receiver_name: signerMail[i]?.Name || "",
          receiver_email: signerMail[i].Email,
          receiver_phone: signerMail[i]?.Phone || "",
          expiry_date: localExpireDate,
          company_name: orgName,
          signing_url: signPdf
        };
        replaceVar = replaceMailVaribles(
          customizeMail.subject,
          htmlReqBody,
          variables
        );
      } else if (defaultMail?.body && defaultMail?.subject) {
        const mailBody = defaultMail?.body;
        const mailSubject = defaultMail.subject;
        const replacedRequestBody = mailBody.replace(/"/g, "'");
        const htmlReqBody =
          "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
          replacedRequestBody +
          "</body> </html>";
        const variables = {
          document_title: documentName,
          note: pdfDetails?.[0]?.Note,
          sender_name: senderName,
          sender_mail: senderEmail,
          sender_phone: senderPhone || "",
          receiver_name: signerMail[i]?.Name || "",
          receiver_email: signerMail[i].Email,
          receiver_phone: signerMail[i]?.Phone || "",
          expiry_date: localExpireDate,
          company_name: orgName,
          signing_url: signPdf
        };
        replaceVar = replaceMailVaribles(mailSubject, htmlReqBody, variables);
      }
      const mailparam = {
        senderName: senderName,
        note: pdfDetails?.[0]?.Note || "",
        senderMail: senderEmail,
        title: documentName,
        organization: orgName,
        localExpireDate: localExpireDate,
        signingUrl: signPdf
      };
      // Pick a role-appropriate default template (viewers get a "view"
      // template instead of the "sign" template).
      const defaultTemplate = mailTemplate(mailparam);
      let params = {
        extUserId: owner?.objectId,
        recipient: signerMail[i].Email,
        subject: replaceVar?.subject
          ? replaceVar?.subject
          : defaultTemplate.subject,
        replyto: senderEmail,
        from: from,
        html: replaceVar?.body ? replaceVar?.body : defaultTemplate.body
      };

      sendMail = await axios.post(url, params, { headers: headers });
    } catch (error) {
      console.log("error", error);
    }
  }
  if (sendMail?.data?.result?.status === "success") {
    const sessiontoken = localStorage.getItem("accesstoken");
    if (pdfDetails[0]?.objectId && sessiontoken) {
      try {
        let data;
        if (customizeMail && isCustomize) {
          data = {
            RequestBody: customizeMail?.body,
            RequestSubject: customizeMail.subject,
            SendMail: true
          };
        } else if (defaultMail?.body && defaultMail?.subject) {
          data = {
            RequestBody: defaultMail?.body,
            RequestSubject: defaultMail?.subject,
            SendMail: true
          };
        } else {
          data = { SendMail: true };
        }
        const docUrl = `${localStorage.getItem("baseUrl")}classes/contracts_Document`;
        await axios.put(`${docUrl}/${pdfDetails[0]?.objectId}`, data, {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": sessiontoken
          }
        });
      } catch (error) {
        const err = error?.response?.data?.error || error?.message;
        console.error("Error while updating doc: ", err);
      }
    }
    return { status: "success" };
  } else {
    return { status: sendMail?.data?.result?.status };
  }
};

export function convertJpegToPng(base64Image, filename) {
  if (base64Image) {
    const arr = base64Image.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid dataURL");
    const mime = mimeMatch[1];
    const type = mime.split("/")[1];
    if (type === "png") {
      return base64Image;
    } else {
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const inputFile = new File([u8arr], `${filename}.${type}`, {
        type: mime
      });
      return new Promise((resolve, reject) => {
        // ensure it’s JPEG/JPG (you can remove this check if not needed)
        if (!/image\/jpe?g/.test(inputFile.type)) {
          return reject(new Error("Input must be a JPEG or JPG image"));
        }

        // Read the file as a data URL
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read the file"));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.onload = () => {
            // draw image onto a canvas
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // directly get PNG as base64 data URL
            try {
              const pngDataUrl = canvas.toDataURL("image/png");
              resolve(pngDataUrl);
            } catch (err) {
              reject(new Error("Failed to convert canvas to PNG"));
            }
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(inputFile);
      });
    }
  }
}

export const getSignerEmail = (data, signers) => {
  const getEmail =
    signers?.length > 0 &&
    signers.find((x) => x.objectId === data.signerObjId)?.Email;
  return getEmail;
};
