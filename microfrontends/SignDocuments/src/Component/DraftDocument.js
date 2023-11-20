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
    if (documentData && documentData !== "no data found!" && documentData[0]) {
      if (documentData[0] && documentData.length > 0) {
        setPdfDetails(documentData);
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      }
    } else if (documentData === "no data found!") {
      alert("No data found!");
    } else if (documentData === "Error: Something went wrong!") {
      alert("Error: Something went wrong!");
    }
  };

  //check document type and render on signyour self and placeholder route
  const handleDraftDoc = () => {
    const data = pdfDetails[0];
    const checkSignerExist =
      pdfDetails[0] && pdfDetails[0].Signers && pdfDetails[0].Signers;
    const isPlaceholder =
      pdfDetails[0].Placeholders && pdfDetails[0].Placeholders;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const signUrl = data.SignedUrl && data.SignedUrl;
    const expireDate =
      pdfDetails[0] &&
      pdfDetails[0].ExpiryDate.iso &&
      pdfDetails[0].ExpiryDate.iso;
    const expireUpdateDate = new Date(expireDate).getTime();
    const currDate = new Date().getTime();
    const hostUrl = getHostUrl();

    //checking document is completed and signer exist then navigate to pdfRequestFiles file
    if (data.IsCompleted && checkSignerExist) {
      navigate(`${hostUrl}pdfRequestFiles`);
    }
    //checking document is completed and signer does not exist then navigate to recipientSignPdf file
    else if (data.IsCompleted && !checkSignerExist) {
      navigate(`${hostUrl}signaturePdf`);
    }
    //checking document is declined by someone then navigate to pdfRequestFiles file
    else if (isDecline) {
      navigate(`${hostUrl}pdfRequestFiles`);
    }
    //checking document has expired and signers exist and placeholder does not set yet then navigate to pdfRequestFiles file
    //draft type request sign document
    else if (
      currDate > expireUpdateDate &&
      checkSignerExist &&
      !isPlaceholder
    ) {
      navigate(`${hostUrl}placeHolderSign`);
    }
    //checking document has expired and signers does not exist and document not signed yet then navigate to pdfRequestFiles file
    //draft type signyouselfdocument
    else if (
      currDate > expireUpdateDate &&
      !checkSignerExist &&
      !isPlaceholder &&
      !signUrl
    ) {
      // window.location.hash = `/signaturePdf`;
      navigate(`${hostUrl}signaturePdf`);
    }
    //checking document has expired and signers exist and document then navigate to pdfRequestFiles file
    else if (currDate > expireUpdateDate) {
      // window.location.hash = `/pdfRequestFiles`;
      navigate(`${hostUrl}pdfRequestFiles`);
    }
    //checking document has expired not been expired yet and signers exist and placeholder does not set yet then navigate to pdfRequestFiles file
    //draft type request sign document
    else if (!signUrl && checkSignerExist) {
      navigate(`${hostUrl}placeHolderSign`);
      // window.location.hash = `/placeHolderSign`;
    } else {
      // window.location.hash = `/signaturePdf/`;
      navigate(`${hostUrl}signaturePdf`);
    }
  };

  return (
    <div>
      {isLoading.isLoad ? <Loader isLoading={isLoading} /> : handleDraftDoc()}
    </div>
  );
}

export default DraftDocument;
