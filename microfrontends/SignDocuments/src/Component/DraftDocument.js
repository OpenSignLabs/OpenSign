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
    const expireDate = data.ExpiryDate.iso;
    const expireUpdateDate = new Date(expireDate).getTime();
    const currDate = new Date().getTime();
    const signerExist = data.Signers && data.Signers;
    const signUrl = data.SignedUrl && data.SignedUrl;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;

    let isExpire = false;
    if (currDate > expireUpdateDate) {
      isExpire = true;
    }
    //checking if document has completed
    //checking if document has completed
    if (data?.IsCompleted && signerExist?.length > 0) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);

      // window.location.hash = `/pdfRequestFiles/${data.objectId}`;
    } else if (data?.IsCompleted && signerExist?.length === 0) {
      navigate(`${hostUrl}signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
      //checking draft type document
    } else if (
      (isExpire || !isExpire) &&
      !signerExist &&
      !isPlaceholder &&
      !signUrl
    ) {
      navigate(`${hostUrl}signaturePdf/${data.objectId}`);
    } else if (
      (isExpire || !isExpire) &&
      isPlaceholder &&
      signerExist?.length > 0
    ) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
    } else if (
      (isExpire || !isExpire) &&
      signerExist?.length > 0 &&
      !isPlaceholder
    ) {
      navigate(`${hostUrl}placeHolderSign/${data.objectId}`);
      //checking draft type document
    } else if (
      (isExpire || !isExpire) &&
      signerExist?.length === 0 &&
      isPlaceholder
    ) {
      navigate(`${hostUrl}placeHolderSign/${data.objectId}`);
    }
    //checking document is draft and signyourself type then user can sign document
    else {
      navigate(`${hostUrl}signaturePdf/${data.objectId}`);
    }
  };

  return (
    <div>
      {isLoading.isLoad ? <Loader isLoading={isLoading} /> : handleDraftDoc()}
    </div>
  );
}

export default DraftDocument;
