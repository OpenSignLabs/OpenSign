import React, { useState, useRef, useEffect } from "react";
import { themeColor } from "../utils/ThemeColor/backColor";
import { PDFDocument } from "pdf-lib";
import "../css/signature.css";
import axios from "axios";
import loader from "../assests/loader2.gif";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import SignPad from "./component/signPad";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import { useNavigate } from "react-router-dom";
import {
  contractDocument,
  multiSignEmbed,
  embedDocId,
  pdfNewWidthFun,
  signPdfFun,
  onImageSelect,
  onSaveSign,
  onSaveImage,
  addDefaultSignatureImg,
  getHostUrl
} from "../utils/Utils";
import Loader from "./component/loader";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import Header from "./component/header";
import RenderPdf from "./component/renderPdf";
import CustomModal from "./component/CustomModal";
import Title from "./component/Title";
import DefaultSignature from "./component/defaultSignature";
import ModalUi from "../premitives/ModalUi";

function PdfRequestFiles() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [signedSigners, setSignedSigners] = useState([]);
  const [unsignedSigners, setUnSignedSigners] = useState([]);
  const [isSignPad, setIsSignPad] = useState(false);
  const [pdfUrl, setPdfUrl] = useState();
  const [allPages, setAllPages] = useState(null);
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [image, setImage] = useState(null);
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [signature, setSignature] = useState();
  const [isStamp, setIsStamp] = useState(false);
  const [signKey, setSignKey] = useState();
  const [imgWH, setImgWH] = useState({});
  const imageRef = useRef(null);
  const [handleError, setHandleError] = useState();
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [defaultSignImg, setDefaultSignImg] = useState();
  const [isDocId, setIsDocId] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [signerPos, setSignerPos] = useState([]);
  const [noData, setNoData] = useState(false);
  const [signerObjectId, setSignerObjectId] = useState();
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isDecline, setIsDecline] = useState({ isDeclined: false });
  const [currentSigner, setCurrentSigner] = useState(false);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isInitialSign, setIsInitialSign] = useState(false);
  const [defaultSignAlert, setDefaultSignAlert] = useState({
    isShow: false,
    alertMessage: ""
  });
  const [isCompleted, setIsCompleted] = useState({
    isCertificate: false,
    isModal: false
  });
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [isSigned, setIsSigned] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [alreadySign, setAlreadySign] = useState(false);
  const [containerWH, setContainerWH] = useState({});
  const [initial, setInitial] = useState("");
  const divRef = useRef(null);
  const isMobile = window.innerWidth < 767;
  const rowLevel =
    localStorage.getItem("rowlevel") &&
    JSON.parse(localStorage.getItem("rowlevel"));

  const objectId =
    rowLevel && rowLevel.id
      ? rowLevel.id
      : rowLevel?.objectId && rowLevel.objectId;
  const documentId = docId ? docId : objectId && objectId;

  const senderUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonSender = JSON.parse(senderUser);

  useEffect(() => {
    if (documentId) {
      getDocumentDetails();
    }
  }, []);
  useEffect(() => {
    if (divRef.current) {
      const pdfWidth = pdfNewWidthFun(divRef);
      setPdfNewWidth(pdfWidth);
      setContainerWH({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight
      });
    }
  }, [divRef.current]);
  // Function to check if the given initial value exists in the array
  const isInitialValueExist = (array, initialValue) => {
    for (const item of array) {
      for (const pos of item.pos) {
        if (pos.type === "initials") {
          return true;
        }
      }
    }
    return false;
  };
  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async () => {
    let currUserId;
    //getting document details
    const documentData = await contractDocument(documentId);
    if (documentData && documentData.length > 0) {
      const isCompleted =
        documentData[0].IsCompleted && documentData[0].IsCompleted;
      const expireDate = documentData[0].ExpiryDate.iso;
      const declined = documentData[0].IsDeclined && documentData[0].IsDeclined;
      const expireUpdateDate = new Date(expireDate).getTime();
      const currDate = new Date().getTime();
      const getSigners = documentData[0].Signers;
      const getCurrentSigner =
        getSigners &&
        getSigners.filter(
          (data) => data.UserId.objectId === jsonSender.objectId
        );

      currUserId = getCurrentSigner[0] ? getCurrentSigner[0].objectId : "";
      setSignerObjectId(currUserId);
      if (documentData[0].SignedUrl) {
        setPdfUrl(documentData[0].SignedUrl);
      } else {
        setPdfUrl(documentData[0].URL);
      }
      if (isCompleted) {
        setIsSigned(true);
        const data = {
          isCertificate: true,
          isModal: true
        };
        setAlreadySign(true);
        setIsCompleted(data);
      } else if (declined) {
        const currentDecline = {
          currnt: "another",
          isDeclined: true
        };
        setIsDecline(currentDecline);
      } else if (currDate > expireUpdateDate) {
        setIsExpired(true);
      }

      if (documentData.length > 0) {
        const checkDocIdExist =
          documentData[0].AuditTrail &&
          documentData[0].AuditTrail.length > 0 &&
          documentData[0].AuditTrail.filter(
            (data) => data.Activity === "Signed"
          );

        const checkAlreadySign =
          documentData[0].AuditTrail &&
          documentData[0].AuditTrail.length > 0 &&
          documentData[0].AuditTrail.filter(
            (data) =>
              data.UserPtr.objectId === currUserId && data.Activity === "Signed"
          );
        if (
          checkAlreadySign &&
          checkAlreadySign[0] &&
          checkAlreadySign.length > 0
        ) {
          setAlreadySign(true);
        }

        let signers = [];
        let unSignedSigner = [];

        //check document is signed or not
        if (checkDocIdExist && checkDocIdExist.length > 0) {
          setIsDocId(true);
          const signerRes = documentData[0].Signers;
          //comparison auditTrail user details with signers user details
          for (let i = 0; i < signerRes.length; i++) {
            const signerId = signerRes[i].objectId;

            let isSignedSignature = false;
            for (let j = 0; j < checkDocIdExist.length; j++) {
              const signedExist =
                checkDocIdExist[j] && checkDocIdExist[j].UserPtr.objectId;
              //checking signerObjId and auditTrail User objId
              // if match then add signed data in signer array and break loop

              if (signerId === signedExist) {
                signers.push({ ...signerRes[i], ...signerRes[i] });
                isSignedSignature = true;
                break;
              }
              // if does not match then add unsigned data in unSignedSigner array
            }
            if (!isSignedSignature) {
              unSignedSigner.push({ ...signerRes[i], ...signerRes[i] });
            }
          }
          setSignedSigners(signers);
          setUnSignedSigners(unSignedSigner);

          setSignerPos(documentData[0].Placeholders);
        } else {
          let unsigned = [];
          for (let i = 0; i < documentData.length; i++) {
            unsigned.push(documentData[i].Signers);
          }
          setUnSignedSigners(unsigned[0]);
          setSignerPos(documentData[0].Placeholders);
        }
        setPdfDetails(documentData);
        setIsUiLoading(false);
      } else {
        alert("No data found!");
      }
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    } else {
      setNoData(true);
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
      setIsUiLoading(false);
    }
    await axios
      .get(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Signature?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${
          jsonSender.objectId
        }"}}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then((Listdata) => {
        const json = Listdata.data;
        const res = json.results;

        if (res[0] && res.length > 0) {
          setDefaultSignImg(res[0].ImageURL);
          const getcurrentUserPosition = documentData[0].Placeholders.filter(
            (data) => data.signerObjId === currUserId
          );
          const getPlacecholder = getcurrentUserPosition[0].placeHolder;
          const checkInitialExist = isInitialValueExist(getPlacecholder);

          if (res[0].Initials) {
            setInitial(res[0]?.Initials);
          } else if (checkInitialExist) {
            setIsInitialSign(true);
          }
        }
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      })
      .catch((err) => {
        const loadObj = {
          isLoad: false
        };
        setHandleError("Error: Something went wrong!");
        setIsLoading(loadObj);
      });
  };

  //function for embed signature or image url in pdf
  async function embedImages() {
    const checkUser = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    if (checkUser && checkUser.length > 0) {
      let checkSigned = 0;
      let allXyPos = 0;

      for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
        const posSignUrlData = checkUser[0].placeHolder[i].pos.filter(
          (pos) => pos.SignUrl
        );
        const posWidgetData = checkUser[0].placeHolder[i].pos.filter(
          (pos) => pos.widgetValue
        );

        checkSigned =
          checkSigned + posSignUrlData.length + posWidgetData.length;
        allXyPos = allXyPos + checkUser[0].placeHolder[i].pos.length;
      }

      if (allXyPos !== checkSigned) {
        setIsAlert({
          isShow: true,
          alertMessage: "Please complete your signature!"
        });
      } else {
        setIsUiLoading(true);
        const pngUrl = checkUser[0].placeHolder;
        // Load a PDFDocument from the existing PDF bytes
        const existingPdfBytes = await fetch(pdfUrl).then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.load(existingPdfBytes, {
          ignoreEncryption: true
        });

        const flag = false;
        //embed document's object id to all pages in pdf document
        if (!isDocId) {
          await embedDocId(pdfDoc, documentId, allPages);
        }
        //embed multi signature in pdf
        const pdfBytes = await multiSignEmbed(
          pngUrl,
          pdfDoc,
          pdfOriginalWidth,
          flag,
          containerWH
        );

        //function for call to embed signature in pdf and get digital signature pdf
        try {
          const res = await signPdfFun(
            pdfBytes,
            documentId,
            signerObjectId,
            pdfOriginalWidth,
            pngUrl,
            containerWH,
            setIsAlert
          );
          if (res && res.status === "success") {
            setPdfUrl(res.data);
            setIsSigned(true);
            setSignedSigners([]);
            setUnSignedSigners([]);
            getDocumentDetails();
          } else {
            setIsAlert({
              isShow: true,
              alertMessage: "something went wrong"
            });
          }
        } catch (err) {
          setIsAlert({
            isShow: true,
            alertMessage: "something went wrong"
          });
        }
      }

      setIsSignPad(false);
      // }
    } else {
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong"
      });
    }
  }

  //function for get pdf page details
  const pageDetails = async (pdf) => {
    const load = {
      status: true
    };
    setPdfLoadFail(load);
    pdf.getPage(1).then((pdfPage) => {
      const pageWidth = pdfPage.view[2];

      setPdfOriginalWidth(pageWidth);
    });
  };

  //function for change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  const getFirstLetter = (name) => {
    const firstLetter = name.charAt(0);
    return firstLetter;
  };
  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event, setImgWH, setImage);
    }
  };
  //function for upload stamp image
  const saveImage = () => {
    //get current signers placeholder position data
    const currentSigner = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //get current pagenumber placeholder index
    const getIndex = currentSigner[0].placeHolder.findIndex((object) => {
      return object.pageNumber === pageNumber;
    });
    //get current signer placeholder position data
    const placeholderPosition = currentSigner[0].placeHolder;
    //function of save image and get updated position with image url
    const getUpdatePosition = onSaveImage(
      placeholderPosition,
      getIndex,
      signKey,
      imgWH,
      image
    );

    //replace updated placeholder position with old data
    placeholderPosition.splice(
      0,
      placeholderPosition.length,
      ...getUpdatePosition
    );
    //get current signers placeholder position data index number in array
    const indexofSigner = signerPos.findIndex((object) => {
      return object.signerObjId === signerObjectId;
    });
    //update current signers data with new placeholder position array data
    setSignerPos((prevState) => {
      const newState = [...prevState]; // Create a copy of the state
      newState.splice(indexofSigner, 1, ...currentSigner); // Modify the copy
      return newState; // Update the state with the modified copy
    });
  };

  //function for save button to save signature or image url
  const saveSign = (isDefaultSign, width, height) => {
    const isTypeText = width && height ? true : false;
    const signatureImg = isDefaultSign ? defaultSignImg : signature;
    let imgWH = { width: width ? width : "", height: height ? height : "" };
    setIsSignPad(false);
    setIsImageSelect(false);
    setImage();

    //get current signers placeholder position data
    const currentSigner = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //get current pagenumber placeholder index
    const getIndex = currentSigner[0].placeHolder.findIndex((object) => {
      return object.pageNumber === pageNumber;
    });

    //set default signature image width and height
    if (isDefaultSign) {
      const img = new Image();
      img.src = defaultSignImg;
      if (img.complete) {
        imgWH = {
          width: img.width,
          height: img.height
        };
      }
    }
    //get current signer placeholder position data
    const placeholderPosition = currentSigner[0].placeHolder;
    //function of save signature image and get updated position with signature image url
    const getUpdatePosition = onSaveSign(
      placeholderPosition,
      getIndex,
      signKey,
      signatureImg,
      imgWH,
      isDefaultSign,
      isTypeText
    );

    const updateSignerData = currentSigner.map((obj, ind) => {
      if (obj.signerObjId === signerObjectId) {
        return { ...obj, placeHolder: getUpdatePosition };
      }
      return obj;
    });

    const index = signerPos.findIndex(
      (data) => data.signerObjId === signerObjectId
    );
    setSignerPos((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1, ...updateSignerData);
      return newState;
    });
  };

  const checkSignerBackColor = (obj) => {
    const data = signerPos.filter((data) => data.signerObjId === obj.objectId);
    return data && data.length > 0 && data[0].blockColor;
  };

  //function for set decline true on press decline button
  const declineDoc = async () => {
    setIsDecline({ isDeclined: false });
    const data = {
      IsDeclined: true
    };
    setIsUiLoading(true);

    await axios
      .put(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Document/${documentId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then((result) => {
        const res = result.data;
        if (res) {
          const currentDecline = {
            currnt: "YouDeclined",
            isDeclined: true
          };
          setIsDecline(currentDecline);
          setIsUiLoading(false);
        }
      })
      .catch((err) => {
        console.log("error updating field is decline ", err);
      });
  };
  //function to add default signature for all requested placeholder of sign
  const addDefaultSignature = () => {
    //get current signers placeholder position data
    const currentSignerPosition = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    //function for save default signature url for all placeholder position
    const updatePlace = addDefaultSignatureImg(
      currentSignerPosition[0].placeHolder,
      defaultSignImg
    );

    const updatesignerPos = signerPos.map((x) =>
      x.signerObjId === signerObjectId ? { ...x, placeHolder: updatePlace } : x
    );
    setSignerPos(updatesignerPos);
    setDefaultSignAlert({
      isShow: false,
      alertMessage: ""
    });
  };

  const handleAddInitial = () => {
    const hostUrl = getHostUrl();
    navigate(`${hostUrl}managesign`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={"Request Sign"} />
      {isLoading.isLoad ? (
        <Loader isLoading={isLoading} />
      ) : handleError ? (
        <HandleError handleError={handleError} />
      ) : noData ? (
        <Nodata />
      ) : (
        <div>
          {isUiLoading && (
            <div
              style={{
                position: "absolute",
                height: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                zIndex: "20",
                backgroundColor: "#e6f2f2",
                opacity: 0.8
              }}
            >
              <img
                alt="no img"
                src={loader}
                style={{ width: "100px", height: "100px" }}
              />
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                This might take some time
              </span>
            </div>
          )}

          <div className="signatureContainer" ref={divRef}>
            <ModalUi
              headerColor={"#dc3545"}
              isOpen={isAlert.isShow}
              title={"Alert message"}
              handleClose={() => {
                setIsAlert({
                  isShow: false,
                  alertMessage: ""
                });
              }}
            >
              <div style={{ height: "100%", padding: 20 }}>
                <p>{isAlert.alertMessage}</p>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#9f9f9f",
                    width: "100%",
                    marginTop: "15px",
                    marginBottom: "15px"
                  }}
                ></div>

                <button
                  onClick={() => {
                    setIsAlert({
                      isShow: false,
                      alertMessage: ""
                    });
                  }}
                  type="button"
                  className="finishBtn cancelBtn"
                >
                  Ok
                </button>
              </div>
            </ModalUi>
            {/* this modal is used to show decline alert */}
            <CustomModal
              containerWH={containerWH}
              show={isDecline.isDeclined}
              headMsg="Document Declined"
              bodyMssg={
                isDecline.currnt === "Sure" ? (
                  <p className="pTagBody">
                    Are you sure want to decline this document ?
                  </p>
                ) : isDecline.currnt === "YouDeclined" ? (
                  <p className="pTagBody">You have declined this document!</p>
                ) : (
                  isDecline.currnt === "another" && (
                    <p className="pTagBody">
                      You cannot sign this document as it has been declined by
                      one or more person(s).
                    </p>
                  )
                )
              }
              footerMessage={isDecline.currnt === "Sure"}
              declineDoc={declineDoc}
              setIsDecline={setIsDecline}
            />
            {/* this modal is used for show expired alert */}
            <CustomModal
              containerWH={containerWH}
              show={isExpired}
              headMsg="Document Expired!"
              bodyMssg="This Document is no longer available."
            />
            <ModalUi
              headerColor={defaultSignImg ? themeColor() : "#dc3545"}
              isOpen={defaultSignAlert.isShow}
              title={"Auto sign"}
              handleClose={() => {
                setDefaultSignAlert({
                  isShow: false,
                  alertMessage: ""
                });
              }}
            >
              <div style={{ height: "100%", padding: 20 }}>
                <p>{defaultSignAlert.alertMessage}</p>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#9f9f9f",
                    width: "100%",
                    marginTop: "15px",
                    marginBottom: "15px"
                  }}
                ></div>
                {defaultSignImg ? (
                  <>
                    <button
                      onClick={() => addDefaultSignature()}
                      style={{
                        background: themeColor()
                      }}
                      type="button"
                      className="finishBtn"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setDefaultSignAlert({
                          isShow: false,
                          alertMessage: ""
                        });
                      }}
                      type="button"
                      className="finishBtn cancelBtn"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAlert({
                        isShow: false,
                        alertMessage: ""
                      });
                    }}
                    type="button"
                    className="finishBtn cancelBtn"
                  >
                    Ok
                  </button>
                )}
              </div>
            </ModalUi>
            {/* this component used to render all pdf pages in left side */}
            <RenderAllPdfPage
              signPdfUrl={pdfDetails[0].URL}
              allPages={allPages}
              setAllPages={setAllPages}
              setPageNumber={setPageNumber}
              pageNumber={pageNumber}
            />

            {/* pdf render view */}
            <div
              style={{
                marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
                marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
              }}
            >
              {/* this modal is used show this document is already sign */}
              <ModalUi
                isOpen={isCompleted.isModal}
                title={"Sign Documents"}
                handleClose={() => {
                  setIsCompleted({ isModal: false, isCertificate: true });
                }}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>This document has been signed by all Signers.</p>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#9f9f9f",
                      width: "100%",
                      marginTop: "15px",
                      marginBottom: "15px"
                    }}
                  ></div>
                  <button
                    type="button"
                    className="finishBtn cancelBtn"
                    onClick={() =>
                      setIsCompleted({ isModal: false, isCertificate: true })
                    }
                  >
                    Close
                  </button>
                </div>
              </ModalUi>

              {/* this component is used for signature pad modal */}
              <SignPad
                isSignPad={isSignPad}
                isStamp={isStamp}
                setIsImageSelect={setIsImageSelect}
                setIsSignPad={setIsSignPad}
                setImage={setImage}
                isImageSelect={isImageSelect}
                imageRef={imageRef}
                onImageChange={onImageChange}
                setSignature={setSignature}
                image={image}
                onSaveImage={saveImage}
                onSaveSign={saveSign}
                defaultSign={defaultSignImg}
              />
              {/* pdf header which contain funish back button */}
              <Header
                isPdfRequestFiles={true}
                pageNumber={pageNumber}
                allPages={allPages}
                changePage={changePage}
                pdfDetails={pdfDetails}
                signerPos={signerPos}
                isSigned={isSigned}
                isCompleted={isCompleted}
                embedImages={embedImages}
                isShowHeader={true}
                setIsDecline={setIsDecline}
                decline={true}
                currentSigner={currentSigner}
                pdfUrl={pdfUrl}
                alreadySign={alreadySign}
              />
              {containerWH && (
                <RenderPdf
                  pageNumber={pageNumber}
                  pdfOriginalWidth={pdfOriginalWidth}
                  pdfNewWidth={pdfNewWidth}
                  setIsSignPad={setIsSignPad}
                  setIsStamp={setIsStamp}
                  setSignKey={setSignKey}
                  pdfDetails={pdfDetails}
                  signerPos={signerPos}
                  successEmail={false}
                  pdfUrl={pdfUrl}
                  numPages={numPages}
                  pageDetails={pageDetails}
                  pdfRequest={true}
                  signerObjectId={signerObjectId}
                  signedSigners={signedSigners}
                  setCurrentSigner={setCurrentSigner}
                  setPdfLoadFail={setPdfLoadFail}
                  pdfLoadFail={pdfLoadFail}
                  setSignerPos={setSignerPos}
                  containerWH={containerWH}
                  initial={initial}
                />
              )}
            </div>
            <div>
              <div className="signerComponent">
                <div
                  style={{ maxHeight: window.innerHeight - 70 + "px" }}
                  className="autoSignScroll"
                >
                  {signedSigners.length > 0 && (
                    <>
                      <div
                        style={{
                          background: themeColor()
                        }}
                        className="signedStyle"
                      >
                        Signed by
                      </div>
                      <div style={{ marginTop: "2px" }}>
                        {signedSigners.map((obj, ind) => {
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "10px 0",
                                background: checkSignerBackColor(obj)
                              }}
                              key={ind}
                            >
                              <div
                                className="signerStyle"
                                style={{
                                  background: "#abd1d0",
                                  width: 30,
                                  height: 30,
                                  display: "flex",
                                  borderRadius: 30 / 2,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  margin: "0 10px 0 5px"
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "12px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "black",
                                    textTransform: "uppercase"
                                  }}
                                >
                                  {getFirstLetter(obj.Name)}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column"
                                }}
                              >
                                <span className="userName">{obj.Name}</span>
                                <span className="useEmail">{obj.Email}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {unsignedSigners.length > 0 && (
                    <>
                      <div
                        style={{
                          background: themeColor(),
                          color: "white",
                          padding: "5px",
                          fontFamily: "sans-serif",
                          marginTop: signedSigners.length > 0 && "20px"
                        }}
                      >
                        Yet to sign
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        {unsignedSigners.map((obj, ind) => {
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "10px 0",
                                background: checkSignerBackColor(obj)
                              }}
                              key={ind}
                            >
                              <div
                                className="signerStyle"
                                style={{
                                  background: "#abd1d0",
                                  width: 30,
                                  height: 30,
                                  display: "flex",
                                  borderRadius: 30 / 2,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  margin: "0 10px 0 5px"
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "12px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "black",
                                    textTransform: "uppercase"
                                  }}
                                >
                                  {getFirstLetter(obj.Name)}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column"
                                }}
                              >
                                <span className="userName">{obj.Name}</span>
                                <span className="useEmail">{obj.Email}</span>
                              </div>
                              <hr />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {defaultSignImg && !alreadySign && (
                    <DefaultSignature
                      themeColor={themeColor}
                      defaultSignImg={defaultSignImg}
                      setDefaultSignImg={setDefaultSignImg}
                      userObjectId={signerObjectId}
                      setIsLoading={setIsLoading}
                      xyPostion={signerPos}
                      setDefaultSignAlert={setDefaultSignAlert}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalUi
        isOpen={isInitialSign}
        title={"Add Initial signature"}
        handleClose={() => {
          setIsInitialSign(false);
        }}
      >
        <div style={{ height: "100%", padding: 20 }}>
          <p>Please add your initial signature</p>

          <div
            style={{
              height: "1px",
              backgroundColor: "#9f9f9f",
              width: "100%",
              marginTop: "15px",
              marginBottom: "15px"
            }}
          ></div>

          <button
            style={{
              background: themeColor()
            }}
            onClick={() => {
              handleAddInitial();
            }}
            type="button"
            className="finishBtn"
          >
            Add
          </button>
        </div>
      </ModalUi>
    </DndProvider>
  );
}

export default PdfRequestFiles;
