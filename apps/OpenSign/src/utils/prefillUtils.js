import { SaveFileSize } from "../constant/saveFileSize";
import {
  convertBase64ToFile,
  convertPdfArrayBuffer,
  createDocument,
  generatePdfName,
  embedWidgetsToDoc,
  randomId,
  getBase64FromUrl
} from "../constant/Utils";
import { PDFDocument } from "pdf-lib";

export const prefillBlockColor = "transparent";
export const prefillObj = (id) => {
  const obj = {
    Id: id || randomId(),
    Role: "prefill",
    Name: "Prefill by owner",
    blockColor: prefillBlockColor
  };

  return obj;
};
//funtion to use embed prefill details in documentAdd commentMore actions
export const handleEmbedPrefillToDoc = async (
  prefillDetails,
  scale,
  pdfArrayBuffer,
  prefillImg,
  userId
) => {
  try {
    const placeholder = prefillDetails?.placeHolder;
    const existingPdfBytes = pdfArrayBuffer;
    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
      ignoreEncryption: true
    });
    const isSignYourSelfFlow = false;
    try {
      const pdfBase64 = await embedWidgetsToDoc(
        placeholder,
        pdfDoc,
        isSignYourSelfFlow,
        scale,
        prefillImg
      );
      const pdfName = generatePdfName(16);
      const pdfUrl = await convertBase64ToFile(pdfName, pdfBase64);
      const tenantId = localStorage.getItem("TenantId");
      const buffer = atob(pdfBase64);
      SaveFileSize(buffer.length, pdfUrl, tenantId, userId);
      return pdfUrl;
    } catch (err) {
      console.log("error to convertBase64ToFile in placeholder flow", err);
      alert(err?.message);
    }
  } catch (err) {
    console.log("error in handleEmbedPrefillToDoc function", err);
  }
};
//this function is used to open modal to show signers list
export const handleDisplaySignerList = async (
  xyPosition,
  signers,
  setForms,
  isHideSigner
) => {
  //'isHideSigner' is used to check should signer attach dropdown display or not
  if (!isHideSigner) {
    // if any role does not attach signer then show signers list attach to role in modal
    const filterPrefill = xyPosition?.filter((x) => x.Role !== "prefill");
    let users = [];
    filterPrefill?.forEach((element) => {
      let label = "";
      const signerData = signers?.find(
        (x) => element.signerObjId && element.signerObjId === x.objectId
      );
      if (signerData) {
        label = `${signerData.Name}<${signerData.Email}>`;
      }
      users = [
        ...users,
        {
          value: element?.signerObjId || element?.Id,
          label: label || "",
          role: element.Role
        }
      ];
    });
    setForms(users);
  }
};

export const isValidPrefill = (prefillData) => {
  const getPlaceholder = prefillData?.placeHolder;
  if (getPlaceholder) {
    // Find objects with empty response of prefill widgets
    const emptyResponseObjects = getPlaceholder.flatMap((page) =>
      page.pos.filter(
        (item) =>
          item?.type !== "checkbox" &&
          !item?.options?.defaultValue &&
          !item?.options?.response
      )
    );
    if (emptyResponseObjects.length > 0) {
      const res = {
        status: "unfilled",
        emptyResponseObjects: emptyResponseObjects
      };
      return res;
    }
  }
};
//function to use create document from templateAdd commentMore actions
export const handleCheckPrefillCreateDoc = async (
  xyPosition,
  signers,
  setIsPrefillModal,
  scale,
  updatedPdfUrl,
  pdfDetails,
  prefillImg,
  userId
) => {
  const pdfArrayBuffer = await convertPdfArrayBuffer(updatedPdfUrl);
  const prefillData = xyPosition.find((x) => x.Role === "prefill");
  if (prefillData) {
    const res = isValidPrefill(prefillData);
    if (res) {
      return res;
    }
  }
  const removePrefill = xyPosition.filter((data) => data.Role !== "prefill");
  const isAllAttachSigner =
    removePrefill.length > 0 && removePrefill.every((x) => x?.signerObjId);
  if (isAllAttachSigner) {
    setIsPrefillModal(false);
    const prefillDetails = xyPosition.find((data) => data.Role === "prefill");
    let signedUrl;
    //condition to check prefill widgets exit or not if exist then embed prefill widgets value in template
    //and then create document
    if (prefillDetails) {
      signedUrl = await handleEmbedPrefillToDoc(
        prefillDetails,
        scale,
        pdfArrayBuffer,
        prefillImg,
        userId
      );
    } else {
      signedUrl = pdfDetails[0]?.URL;
    }
    const isSendDoc = true;
    const res = await createDocument(
      pdfDetails,
      xyPosition,
      signers,
      signedUrl || updatedPdfUrl,
      isSendDoc
    );
    if (res.status === "success") {
      return res;
    }
  } else {
    const res = { status: "unattach signer" };
    return res;
  }
};

//function is used to save prefill image base64 in local to display on document/template
export const savePrefillImg = async (Placeholders) => {
  const prefillData = Placeholders?.find((x) => x.Role === "prefill");
  if (prefillData) {
    const allImageFields = prefillData?.placeHolder.flatMap((p) =>
      p.pos.filter((item) => item.type === "image")
    );
    const hasImageType = allImageFields.some((p) => p.type === "image");
    if (hasImageType) {
      const imgArr = [];
      for (const ph of prefillData?.placeHolder || []) {
        for (const pos of ph?.pos || []) {
          if (pos?.type === "image" && pos?.SignUrl) {
            const addSuffix = true;
            const base64 = await getBase64FromUrl(pos?.SignUrl, addSuffix);
            imgArr.push({
              id: pos?.key,
              base64: base64
            });
          } else if (pos?.type === "image") {
            imgArr.push({
              id: pos?.key,
              base64: ""
            });
          }
        }
      }

      return imgArr;
    }
  }
};

//function is used to get signers list for showing in modal
export const handleSignersList = (item) => {
  const removePrefill = item?.Placeholders?.filter((x) => x.Role !== "prefill");
  let updatedSigners = removePrefill.map((x) => {
    let matchingSigner = item?.Signers?.find(
      (y) => x.signerObjId && x.signerObjId === y.objectId
    );
    if (matchingSigner) {
      return {
        ...matchingSigner,
        Role: x.Role ? x.Role : matchingSigner.Role,
        Id: x.Id,
        blockColor: x.blockColor
      };
    } else {
      return { Role: x.Role, Id: x.Id, blockColor: x.blockColor };
    }
  });
  return updatedSigners;
};
