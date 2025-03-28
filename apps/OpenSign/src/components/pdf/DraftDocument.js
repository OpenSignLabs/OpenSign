import React, { useEffect, useState } from "react";
import LoaderWithMsg from "../../primitives/LoaderWithMsg";
import { contractDocument } from "../../constant/Utils";
import HandleError from "../../primitives/HandleError";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function DraftDocument() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const docId = query.get("docId");
  const [isLoading, setIsLoading] = useState({
    isLoader: true,
    message: t("loading-mssg")
  });
  useEffect(() => {
    getDocumentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //get document details
  const getDocumentDetails = async () => {
    //getting document details
    const documentData = await contractDocument(docId);
    if (documentData && documentData.length > 0) {
      handleDraftDoc(documentData);
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      if (documentData?.result?.error?.includes("deleted")) {
        setIsLoading({
          isLoader: false,
          message: t("document-deleted")
        });
      } else {
        setIsLoading({
          isLoader: false,
          message: t("something-went-wrong-mssg")
        });
      }
    } else {
      setIsLoading({ isLoader: false, message: t("no-data") });
    }
  };

  //check document type and render on signyour self and placeholder route
  const handleDraftDoc = (documentData) => {
    const data = documentData[0];
    const signerExist = data.Signers && data.Signers;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;
    const signedUrl = data.SignedUrl;
    //checking if document has completed and request signature flow
    if (data?.IsCompleted && signerExist?.length > 0) {
      navigate(`/recipientSignPdf/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if ((!signerExist && !isPlaceholder) || data?.IsSignyourself) {
      navigate(`/signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`/recipientSignPdf/${data.objectId}`);
      //checking draft type document
    } else if (
      signerExist?.length > 0 &&
      isPlaceholder?.length > 0 &&
      !signedUrl
    ) {
      navigate(`/placeHolderSign/${data.objectId}`);
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signedUrl) {
      navigate(`/recipientSignPdf/${data.objectId}`);
    } //placeholder draft document
    else if (
      (signerExist?.length > 0 &&
        (!isPlaceholder || isPlaceholder?.length === 0)) ||
      ((!signerExist || signerExist?.length === 0) && isPlaceholder?.length > 0)
    ) {
      navigate(`/placeHolderSign/${data.objectId}`);
    }
  };

  return (
    <div>
      {isLoading.isLoader ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : (
        <HandleError handleError={isLoading.message} />
      )}
    </div>
  );
}

export default DraftDocument;
