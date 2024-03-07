import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../primitives/LoaderWithMsg";
import { contractDocument } from "../../constant/Utils";
import HandleError from "../../primitives/HandleError";
function DraftDocument() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    isLoader: true,
    message: "This might take some time"
  });

  const rowLevel =
    localStorage.getItem("rowlevel") &&
    JSON.parse(localStorage.getItem("rowlevel"));
  const docId =
    rowLevel && rowLevel?.id
      ? rowLevel.id
      : rowLevel?.objectId && rowLevel.objectId;

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
      setIsLoading({
        isLoader: false,
        message: "Error: Something went wrong!"
      });
    } else {
      setIsLoading({
        isLoader: false,
        message: "No data found!"
      });
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
      navigate(`/pdfRequestFiles/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if (!signerExist && !isPlaceholder) {
      navigate(`/signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`/pdfRequestFiles/${data.objectId}`);
      //checking draft type document
    } else if (
      signerExist?.length > 0 &&
      isPlaceholder?.length > 0 &&
      !signedUrl
    ) {
      navigate(`/placeHolderSign/${data.objectId}`);
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signerExist?.length > 0) {
      navigate(`/pdfRequestFiles/${data.objectId}`);
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
        <Loader isLoading={isLoading} />
      ) : (
        <HandleError handleError={isLoading.message} />
      )}
    </div>
  );
}

export default DraftDocument;
