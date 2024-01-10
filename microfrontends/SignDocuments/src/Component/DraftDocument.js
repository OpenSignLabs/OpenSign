import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./component/loader";
import { contractDocument, getHostUrl } from "../utils/Utils";
function DraftDocument() {
  const navigate = useNavigate();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
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
    if (docId) {
      getDocumentDetails();
    }
  }, []);

  //get document details
  const getDocumentDetails = async () => {
    //getting document details
    const documentData = await contractDocument(docId);
    if (documentData && documentData.length > 0) {
      setPdfDetails(documentData);
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      alert("Error: Something went wrong!");
    } else {
      alert("No data found!");
    }
  };

  //check document type and render on signyour self and placeholder route
  const handleDraftDoc = () => {
    const data = pdfDetails[0];
    const hostUrl = getHostUrl();
    const signerExist = data.Signers && data.Signers;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;

    //checking if document has completed and request signature flow
    if (data?.IsCompleted && signerExist?.length > 0) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if (!signerExist && !isPlaceholder) {
      navigate(`${hostUrl}signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
      //checking draft type document
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signerExist?.length > 0) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
    } //placeholder draft document
    else if (
      (signerExist?.length > 0 && !isPlaceholder) ||
      (!signerExist && isPlaceholder?.length > 0)
    ) {
      navigate(`${hostUrl}placeHolderSign/${data.objectId}`);
    }
  };

  return (
    <div>
      {isLoading.isLoad ? <Loader isLoading={isLoading} /> : handleDraftDoc()}
    </div>
  );
}

export default DraftDocument;
