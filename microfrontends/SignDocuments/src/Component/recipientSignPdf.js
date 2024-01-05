import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import "../css/./signature.css";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { themeColor } from "../utils/ThemeColor/backColor";
import { useParams } from "react-router-dom";
import SignPad from "./component/signPad";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import DefaultSignature from "./component/defaultSignature";
import {
  getBase64FromUrl,
  getBase64FromIMG,
  pdfNewWidthFun,
  convertPNGtoJPEG,
  contractUsers,
  contactBook,
  contractDocument,
  urlValidator,
  multiSignEmbed,
  embedDocId,
  signPdfFun,
  addDefaultSignatureImg,
  onImageSelect
} from "../utils/Utils";
import Tour from "reactour";
import Signedby from "./component/signedby";
import { onSaveImage, onSaveSign } from "../utils/Utils";
import Loader from "./component/loader";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import Header from "./component/header";
import RenderPdf from "./component/renderPdf";
import CustomModal from "./component/CustomModal";
import { modalAlign } from "../utils/Utils";
import AlertComponent from "./component/alertComponent";
import TourContentWithBtn from "../premitives/TourContentWithBtn";
import Title from "./component/Title";
function EmbedPdfImage() {
  const { id, contactBookId } = useParams();
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
  const [xyPostion, setXyPostion] = useState([]);
  const [isAlreadySign, setIsAlreadySign] = useState({ status: false });
  const imageRef = useRef(null);
  const [signedPdfData, setSignedPdfData] = useState();
  const [handleError, setHandleError] = useState();
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [defaultSignImg, setDefaultSignImg] = useState();
  const [userObjectID, setUserObjectID] = useState();
  const [isDocId, setIsDocId] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [signTour, setSignTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [signerUserId, setSignerUserId] = useState();
  const [tourStatus, setTourStatus] = useState([]);
  const [isExpired, setIsExpired] = useState(false);
  const [noData, setNoData] = useState(false);
  const [contractName, setContractName] = useState("");
  const [isDecline, setIsDecline] = useState({
    isDeclined: false
  });
  const [addDefaultSign, setAddDefaultSign] = useState({
    isShow: false,
    alertMessage: ""
  });
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [containerWH, setContainerWH] = useState({});
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isDontShow, setIsDontShow] = useState(false);
  const docId = id && id;
  const isMobile = window.innerWidth < 767;
  const index = xyPostion.findIndex((object) => {
    return object.pageNumber === pageNumber;
  });
  const divRef = useRef(null);
  const senderUser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  )
    ? localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    : `${localStorage.getItem("UserInformation")}` &&
      `${localStorage.getItem("UserInformation")}`;
  const jsonSender = JSON.parse(senderUser);

  useEffect(() => {
    getDocumentDetails();
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

  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async () => {
    let currUserId, userObjectId;
    //getting contracts_contactBook details
    const json = await contactBook(contactBookId);
    if (json && json.length > 0) {
      setContractName("_Contactbook");

      userObjectId = json[0].UserId.objectId;
      setUserObjectID(userObjectId);
      currUserId = json[0].objectId;

      setSignerUserId(currUserId);
      const tourstatus = json[0].TourStatus && json[0].TourStatus;

      if (tourstatus && tourstatus.length > 0) {
        setTourStatus(tourstatus);
        const checkTourRecipients = tourstatus.filter(
          (data) => data.recipientssign
        );
        if (checkTourRecipients && checkTourRecipients.length > 0) {
          setCheckTourStatus(checkTourRecipients[0].recipientssign);
        }
      }
    } else if (json === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    } else {
      const json = await contractUsers(jsonSender.email);
      if (json && json.length > 0) {
        setContractName("_Users");
        if (json[0]) {
          userObjectId = json[0].UserId.objectId;
          setUserObjectID(userObjectId);
          currUserId = json[0].objectId;

          setSignerUserId(currUserId);
          const tourstatus = json[0].TourStatus && json[0].TourStatus;

          if (tourstatus && tourstatus.length > 0) {
            setTourStatus(tourstatus);
            const checkTourRecipients = tourstatus.filter(
              (data) => data.recipientssign
            );
            if (checkTourRecipients && checkTourRecipients.length > 0) {
              setCheckTourStatus(checkTourRecipients[0].recipientssign);
            }
          }
        } else {
          setNoData(true);
          const loadObj = {
            isLoad: false
          };
          setIsLoading(loadObj);
        }
      } else if (json === "Error: Something went wrong!") {
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
      }
    }

    //getting document details
    const documentData = await contractDocument(docId);
    if (documentData && documentData.length > 0) {
      const declined = documentData[0].IsDeclined && documentData[0].IsDeclined;
      const isCompleted =
        documentData[0].IsCompleted && documentData[0].IsCompleted;
      const expireDate = documentData[0].ExpiryDate.iso;

      const expireUpdateDate = new Date(expireDate).getTime();
      const currDate = new Date().getTime();
      if (isCompleted) {
        //checking document is completed (signed by all requested signers) than isCompleted true
        //then show alert with completed message
        const alreadySign = {
          status: true,
          mssg: "This document has been successfully signed!"
        };
        setIsAlreadySign(alreadySign);
        setPdfUrl(documentData[0].SignedUrl);
        setSignedPdfData(documentData);
      } else if (declined) {
        const currentDecline = {
          currnt: "another",
          isDeclined: true
        };
        setIsDecline(currentDecline);

        setSignedPdfData(documentData);
      } else if (currDate > expireUpdateDate) {
        setIsExpired(true);
        const checkDocIdExist =
          documentData[0].AuditTrail &&
          documentData[0].AuditTrail.length > 0 &&
          documentData[0].AuditTrail.filter(
            (data) => data.Activity === "Signed"
          );

        //if signed by someone than go to in if condition
        // and second signer could not be add documentId
        //for that setIsDocId true
        if (checkDocIdExist && checkDocIdExist.length > 0) {
          setIsDocId(true);
          const currUser =
            documentData.Placeholders &&
            documentData.Placeholders.filter(
              (data) => data.signerObjId === currUserId
            );

          setSignedPdfData(documentData);

          setXyPostion(currUser[0].placeHolder);

          const key = currUser[0].placeHolder[0].pos[0].key;
          setSignKey(key);
        }
        //for show current requested signer's placeholder
        else {
          const currUser =
            documentData[0].Placeholders &&
            documentData[0].Placeholders.filter(
              (data) => data.signerObjId === currUserId
            );

          setSignedPdfData(documentData);

          setXyPostion(currUser[0].placeHolder);

          const key = currUser[0].placeHolder[0].pos[0].key;
          setSignKey(key);
        }
      } else {
        //checking document has signed by someone or not

        const checkDocIdExist =
          documentData[0].AuditTrail &&
          documentData[0].AuditTrail.length > 0 &&
          documentData[0].AuditTrail.filter(
            (data) => data.Activity === "Signed"
          );

        //if signed by someone than go to in if condition
        // and second signer could not be add documentId
        //for that setIsDocId true

        if (checkDocIdExist && checkDocIdExist.length > 0) {
          setIsDocId(true);

          //condition for checking document signed by current requested user or not
          const checkAlreadyBySigner = documentData[0].AuditTrail.filter(
            (data) =>
              data.UserPtr.objectId === currUserId && data.Activity === "Signed"
          );

          // if checkAlreadyBySigner has some data that current user already sign this document
          // then show alert with message
          if (checkAlreadyBySigner && checkAlreadyBySigner.length > 0) {
            const alreadySign = {
              status: true,
              mssg: "You have successfully signed the document!"
            };
            setIsAlreadySign(alreadySign);
            setPdfUrl(documentData[0].SignedUrl);
            setSignedPdfData(documentData);
          }
          //else show placeholder of current requested signer
          else {
            const currUser =
              documentData[0].Placeholders &&
              documentData[0].Placeholders.filter(
                (data) => data.signerObjId === currUserId
              );

            setSignedPdfData(documentData);

            setXyPostion(currUser[0].placeHolder);

            const key = currUser[0].placeHolder[0].pos[0].key;
            setSignKey(key);
          }
        }
        //for show current requested signer's placeholder
        else {
          const currUser =
            documentData[0].Placeholders &&
            documentData[0].Placeholders.filter(
              (data) => data.signerObjId === currUserId
            );

          setSignedPdfData(documentData);

          setXyPostion(currUser[0].placeHolder);

          const key = currUser[0].placeHolder[0].pos[0].key;
          setSignKey(key);
        }
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
    }
    await axios
      .get(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Signature?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${userObjectId}"}}`,
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
        }
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      })
      .catch((err) => {
        console.log("axois err ", err);
        const loadObj = {
          isLoad: false
        };
        setHandleError("Error: Something went wrong!");
        setIsLoading(loadObj);
      });
  };

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

  //function for embed signature or image url in pdf
  async function embedImages() {
    let checkSignUrl = [];

    for (let i = 0; i < xyPostion.length; i++) {
      const posData = xyPostion[i].pos.filter((pos) => !pos.SignUrl);

      if (posData && posData.length > 0) {
        checkSignUrl.push(posData);
      }
    }

    if (checkSignUrl && checkSignUrl.length > 0) {
      setIsAlert({
        isShow: true,
        alertMessage: "Please complete your signature!"
      });
    } else {
      const loadObj = {
        isLoad: true,
        message: "This might take some time"
      };
      setIsLoading(loadObj);
      const url = pdfUrl
        ? pdfUrl
        : signedPdfData[0] && signedPdfData[0].SignedUrl;
      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer()
      );

      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true
      });

      const pngUrl = xyPostion;

      // let pdfBase64;
      //checking if signature is only one then send image url in jpeg formate to server
      // if (xyPostion.length === 1 && xyPostion[0].pos.length === 1) {
      //   if (isDocId) {
      //     pdfBase64 = await getBase64FromUrl(url);
      //   } else {
      //     //embed document's object id to all pages in pdf document
      //     await embedDocId(pdfDoc, docId, allPages);
      //     pdfBase64 = await pdfDoc.saveAsBase64({ useObjectStreams: false });
      //   }

      //   for (let xyData of xyPostion) {
      //     const imgUrlList = xyData.pos;
      //     const pageNo = xyData.pageNumber;
      //     imgUrlList.map(async (data) => {
      //       //cheking signUrl is defau;t signature url of custom url
      //       let ImgUrl = data.SignUrl;
      //       const checkUrl = urlValidator(ImgUrl);

      //       //if default signature url then convert it in base 64
      //       if (checkUrl) {
      //         ImgUrl = await getBase64FromIMG(ImgUrl + "?get");
      //       }
      //       //function for convert signature png base64 url to jpeg base64
      //       convertPNGtoJPEG(ImgUrl)
      //         .then((jpegBase64Data) => {
      //           const removeBase64Fromjpeg = "data:image/jpeg;base64,";
      //           const newImgUrl = jpegBase64Data.replace(
      //             removeBase64Fromjpeg,
      //             ""
      //           );

      //           //function for embed signature in pdf and get digital signature pdf
      //           signPdfFun(
      //             newImgUrl,
      //             docId,
      //             signerUserId,
      //             pdfOriginalWidth,
      //             xyPostion,
      //             containerWH,
      //             setIsAlert,
      //             data,
      //             pdfBase64,
      //             pageNo
      //           )
      //             .then((res) => {
      //               if (res && res.status === "success") {
      //                 getDocumentDetails();
      //               } else {
      //                 setIsAlert({
      //                   isShow: true,
      //                   alertMessage: "something went wrong"
      //                 });
      //               }
      //             })
      //             .catch((err) => {
      //               setIsAlert({
      //                 isShow: true,
      //                 alertMessage: "something went wrong"
      //               });
      //             });
      //         })
      //         .catch((error) => {
      //           setIsAlert({
      //             isShow: true,
      //             alertMessage: "something went wrong"
      //           });
      //         });
      //     });
      //   }
      // }
      // //else if signature is more than one then embed all sign with the use of pdf-lib
      // else if (xyPostion.length > 0 && xyPostion[0].pos.length > 0) {
      const flag = false;
      //embed document's object id to all pages in pdf document
      if (!isDocId) {
        await embedDocId(pdfDoc, docId, allPages);
      }
      //embed multi signature in pdf
      const pdfBytes = await multiSignEmbed(
        pngUrl,
        pdfDoc,
        pdfOriginalWidth,
        flag,
        containerWH
      );

      //function for embed signature in pdf and get digital signature pdf
      try {
        const res = await signPdfFun(
          pdfBytes,
          docId,
          signerUserId,
          pdfOriginalWidth,
          xyPostion,
          containerWH,
          setIsAlert
        );
        if (res && res.status === "success") {
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
    setXyPostion([]);
    // }
  }

  //function for change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event, setImgWH, setImage);
    }
  };

  //function for save button to save signature or image url
  const saveSign = (isDefaultSign, width, height) => {
    const isTypeText = width && height ? true : false;
    const signatureImg = isDefaultSign ? defaultSignImg : signature;

    let imgWH = { width: width ? width : "", height: height ? height : "" };
    setIsSignPad(false);
    setIsImageSelect(false);
    setImage();

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
    const getUpdatePosition = onSaveSign(
      xyPostion,
      index,
      signKey,
      signatureImg,
      imgWH,
      isDefaultSign,
      isTypeText
    );

    if (getUpdatePosition) {
      setXyPostion(getUpdatePosition);
    }
  };
  //function for upload stamp image
  const saveImage = () => {
    const getImage = onSaveImage(xyPostion, index, signKey, imgWH, image);
    setXyPostion(getImage);
  };

  //function for set decline true on press decline button
  const declineDoc = async () => {
    const data = {
      IsDeclined: true
    };

    await axios
      .put(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Document/${docId}`,
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
        }
      })
      .catch((err) => {
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong"
        });
      });
  };

  const addDefaultSignature = () => {
    const getXyData = addDefaultSignatureImg(xyPostion, defaultSignImg);

    setXyPostion(getXyData);
    setAddDefaultSign({
      isShow: false,
      alertMessage: ""
    });
  };

  //function for update TourStatus
  const closeTour = async () => {
    setSignTour(false);
    if (isDontShow) {
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const recipientssignIndex = tourStatus.findIndex(
          (obj) =>
            obj["recipientssign"] === false || obj["recipientssign"] === true
        );
        if (recipientssignIndex !== -1) {
          updatedTourStatus[recipientssignIndex] = { recipientssign: true };
        } else {
          updatedTourStatus.push({ recipientssign: true });
        }
      } else {
        updatedTourStatus = [{ recipientssign: true }];
      }

      await axios
        .put(
          `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
            "_appName"
          )}${contractName}/${signerUserId}`,
          {
            TourStatus: updatedTourStatus
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )
        .then((Listdata) => {
          // const json = Listdata.data;
          // const res = json.results;
          // console.log("res", json);
        })
        .catch((err) => {
          console.log("axois err ", err);
        });
    }
  };

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };

  const tourFunction = () => {
    const tourConfig = [
      {
        selector: '[data-tut="reactourFirst"]',
        content: () => (
          <TourContentWithBtn
            message={`You can click "Auto Sign All" to automatically sign at all the locations meant to be signed by you.Make sure that you review the document properly before you click this button.`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourSecond"]',
        content: () => (
          <TourContentWithBtn
            message={`Click any of such placeholders appearing on the document to sign.You will see the options to draw sign or upload an image once you click here.`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourThird"]',
        content: () => (
          <TourContentWithBtn
            message={`Click here to finish & download the signed document.You will also receive a copy on your email.`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      }
    ];

    let stepsToShow = [];
    if (!defaultSignImg || isMobile) {
      stepsToShow = tourConfig.filter(
        (step) => step.selector !== '[data-tut="reactourFirst"]'
      );
    }

    return (
      <Tour
        onRequestClose={closeTour}
        steps={stepsToShow && stepsToShow.length > 0 ? stepsToShow : tourConfig}
        isOpen={signTour}
        closeWithMask={false}
        rounded={5}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={"Sign Document"} />
      {isLoading.isLoad ? (
        <Loader isLoading={isLoading} />
      ) : handleError ? (
        <HandleError handleError={handleError} />
      ) : noData ? (
        <Nodata />
      ) : (
        <div className="signatureContainer" ref={divRef}>
          {/* this modal is used to show decline alert */}
          <CustomModal
            containerWH={containerWH}
            show={isDecline.isDeclined}
            headMsg="Document Declined Alert!"
            bodyMssg={
              isDecline.currnt === "Sure" ? (
                <p>Are you sure want to decline this document ?</p>
              ) : isDecline.currnt === "YouDeclined" ? (
                <p>You have declined this document!</p>
              ) : (
                isDecline.currnt === "another" && (
                  <p>
                    You cannot sign this document as it has been declined by one
                    or more person(s).
                  </p>
                )
              )
            }
            footerMessage={isDecline.currnt === "Sure"}
            declineDoc={declineDoc}
            setIsDecline={setIsDecline}
          />
          <AlertComponent
            isShow={isAlert.isShow}
            alertMessage={isAlert.alertMessage}
            setIsAlert={setIsAlert}
          />
          <AlertComponent
            isShow={addDefaultSign.isShow}
            alertMessage={addDefaultSign.alertMessage}
            setIsAlert={setAddDefaultSign}
            isdefaultSign={true}
            addDefaultSignature={addDefaultSignature}
            headBG={themeColor()}
          />

          {/* this modal is used for show expired alert */}
          <CustomModal
            containerWH={containerWH}
            show={isExpired}
            headMsg="Document Expired!"
            bodyMssg="This Document is no longer available."
          />
          {/* this component used for UI interaction and show their functionality */}
          {pdfLoadFail.status &&
            !isExpired &&
            !checkTourStatus &&
            tourFunction()}

          {/* this component used to render all pdf pages in left side */}
          <RenderAllPdfPage
            pdfUrl={pdfUrl}
            signPdfUrl={signedPdfData[0] && signedPdfData[0].URL}
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
            ref={divRef}
          >
            {/* this modal is used show this document is already sign */}
            <Modal
              show={isAlreadySign.status}
              onShow={() => modalAlign()}
              backdropClassName="signature-backdrop"
            >
              <ModalHeader style={{ background: themeColor() }}>
                <span style={{ color: "white" }}> Sign Documents</span>
              </ModalHeader>

              <Modal.Body>
                <p>{isAlreadySign.mssg}</p>
              </Modal.Body>

              <Modal.Footer>
                <button
                  style={{
                    borderRadius: "0px",
                    border: "1.5px solid #e3e2e1",
                    fontWeight: "600",
                    color: "black"
                  }}
                  className="btn"
                  onClick={() => setIsAlreadySign({ status: false })}
                >
                  Close
                </button>
              </Modal.Footer>
            </Modal>
            {/* this is modal of signature pad */}
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

            {/* pdf header which contain finish back button */}
            <Header
              recipient={true}
              pdfDetails={signedPdfData}
              isAlreadySign={isAlreadySign}
              pageNumber={pageNumber}
              allPages={allPages}
              changePage={changePage}
              pdfUrl={pdfUrl}
              setIsDecline={setIsDecline}
              embedImages={embedImages}
              isShowHeader={true}
              currentSigner={true}
              decline={true}
              alreadySign={pdfUrl ? true : false}
            />
            {containerWH && (
              <RenderPdf
                pageNumber={pageNumber}
                pdfOriginalWidth={pdfOriginalWidth}
                pdfNewWidth={pdfNewWidth}
                setIsSignPad={setIsSignPad}
                setIsStamp={setIsStamp}
                setSignKey={setSignKey}
                pdfDetails={signedPdfData}
                xyPostion={xyPostion}
                successEmail={false}
                pdfUrl={pdfUrl}
                numPages={numPages}
                pageDetails={pageDetails}
                recipient={true}
                isAlreadySign={isAlreadySign}
                setPdfLoadFail={setPdfLoadFail}
                pdfLoadFail={pdfLoadFail}
                setXyPostion={setXyPostion}
                index={index}
                containerWH={containerWH}
              />
            )}
          </div>

          {!pdfUrl ? (
            <div data-tut="reactourFirst">
              {/* this component is used to render default signature of user in the right side of the component */}

              <DefaultSignature
                themeColor={themeColor}
                defaultSignImg={defaultSignImg}
                setDefaultSignImg={setDefaultSignImg}
                userObjectId={userObjectID}
                setIsLoading={setIsLoading}
                xyPostion={xyPostion}
                setXyPostion={setXyPostion}
                setShowAlreadySignDoc={setIsAlreadySign}
                setIsAlert={setAddDefaultSign}
              />
            </div>
          ) : (
            <div>
              <Signedby pdfDetails={signedPdfData[0]} />
            </div>
          )}
        </div>
      )}
    </DndProvider>
  );
}

export default EmbedPdfImage;
