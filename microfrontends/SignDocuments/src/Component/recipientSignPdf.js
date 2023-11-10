import React, { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
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
  contactBookName
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
  const [completePdfData, setCompletePdfData] = useState([]);
  const [isExpired, setIsExpired] = useState(false);
  const [noData, setNoData] = useState(false);
  const [contractName, setContractName] = useState("");
  const [isDecline, setIsDecline] = useState({
    isDeclined: false
  });
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [containerWH, setContainerWH] = useState({});
  const docId = id && id;
  const isMobile = window.innerWidth < 767;
  const index = xyPostion.findIndex((object) => {
    return object.pageNumber === pageNumber;
  });
  const divRef = useRef(null);
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");
  useEffect(() => {
    const clientWidth = window.innerWidth;
    const pdfWidth = clientWidth - 160 - 220 - 30;
    //160 is width of left side, 200 is width of right side component and 50 is space of middle compoent
    //pdf from left and right component
    setPdfNewWidth(pdfWidth);
    getDocumentDetails();
  }, []);
  useEffect(() => {
    if (divRef.current) {
      setContainerWH({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight
      });
    }
  }, [divRef.current]);

  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async () => {
    let currUserId, userObjectId;
    const json = await contactBookName(contactBookId, "_Contactbook");
    if (json !== "Error: Something went wrong!" && json && json.results[0]) {
      setContractName("_Contactbook");
      if (json.results[0]) {
        userObjectId = json.results[0].UserId.objectId;
        setUserObjectID(userObjectId);
        currUserId = json.results[0].objectId;

        setSignerUserId(currUserId);
        const tourstatus =
          json.results[0].TourStatus && json.results[0].TourStatus;

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
      const json = await contactBookName(contactBookId, "_Users");

      if (json !== "Error: Something went wrong!" && json && json.results[0]) {
        setContractName("_Users");
        if (json.results[0]) {
          userObjectId = json.results[0].UserId.objectId;
          setUserObjectID(userObjectId);
          currUserId = json.results[0].objectId;

          setSignerUserId(currUserId);
          const tourstatus =
            json.results[0].TourStatus && json.results[0].TourStatus;

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
      }
    }

    await axios
      .get(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Document?where={"objectId":"${docId}"}&include=ExtUserPtr,Signers,AuditTrail
        ,`,
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
          const declined = res[0].IsDeclined && res[0].IsDeclined;
          const isCompleted = res[0].IsCompleted && res[0].IsCompleted;
          const expireDate = res[0].ExpiryDate.iso;

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
            setPdfUrl(res[0].SignedUrl);
            setSignedPdfData(json.results);
            setCompletePdfData(res);
          } else if (declined) {
            const currentDecline = {
              currnt: "another",
              isDeclined: true
            };
            setIsDecline(currentDecline);

            setSignedPdfData(json.results);
          } else if (currDate > expireUpdateDate) {
            setIsExpired(true);
            const checkDocIdExist =
              json.results[0].AuditTrail &&
              json.results[0].AuditTrail.length > 0 &&
              json.results[0].AuditTrail.filter(
                (data) => data.Activity === "Signed"
              );

            //if signed by someone than go to in if condition
            // and second signer could not be add documentId
            //for that setIsDocId true
            if (checkDocIdExist && checkDocIdExist.length > 0) {
              setIsDocId(true);
              const currUser =
                json.results[0].Placeholders &&
                json.results[0].Placeholders.filter(
                  (data) => data.signerObjId === currUserId
                );

              setSignedPdfData(json.results);

              setXyPostion(currUser[0].placeHolder);

              const key = currUser[0].placeHolder[0].pos[0].key;
              setSignKey(key);
            }
            //for show current requested signer's placeholder
            else {
              const currUser =
                json.results[0].Placeholders &&
                json.results[0].Placeholders.filter(
                  (data) => data.signerObjId === currUserId
                );

              setSignedPdfData(json.results);

              setXyPostion(currUser[0].placeHolder);

              const key = currUser[0].placeHolder[0].pos[0].key;
              setSignKey(key);
            }
          } else {
            //checking document has signed by someone or not

            const checkDocIdExist =
              json.results[0].AuditTrail &&
              json.results[0].AuditTrail.length > 0 &&
              json.results[0].AuditTrail.filter(
                (data) => data.Activity === "Signed"
              );

            //if signed by someone than go to in if condition
            // and second signer could not be add documentId
            //for that setIsDocId true

            if (checkDocIdExist && checkDocIdExist.length > 0) {
              setIsDocId(true);

              //condition for checking document signed by current requested user or not
              const checkAlreadyBySigner = json.results[0].AuditTrail.filter(
                (data) =>
                  data.UserPtr.objectId === currUserId &&
                  data.Activity === "Signed"
              );

              // if checkAlreadyBySigner has some data that current user already sign this document
              // then show alert with message
              if (checkAlreadyBySigner && checkAlreadyBySigner.length > 0) {
                const alreadySign = {
                  status: true,
                  mssg: "You have successfully signed the document!"
                };
                setIsAlreadySign(alreadySign);
                setPdfUrl(res[0].SignedUrl);
                setSignedPdfData(json.results);
              }
              //else show placeholder of current requested signer
              else {
                const currUser =
                  json.results[0].Placeholders &&
                  json.results[0].Placeholders.filter(
                    (data) => data.signerObjId === currUserId
                  );

                setSignedPdfData(json.results);

                setXyPostion(currUser[0].placeHolder);

                const key = currUser[0].placeHolder[0].pos[0].key;
                setSignKey(key);
              }
            }
            //for show current requested signer's placeholder
            else {
              const currUser =
                json.results[0].Placeholders &&
                json.results[0].Placeholders.filter(
                  (data) => data.signerObjId === currUserId
                );

              setSignedPdfData(json.results);

              setXyPostion(currUser[0].placeHolder);

              const key = currUser[0].placeHolder[0].pos[0].key;
              setSignKey(key);
            }
          }
        }
      })
      .catch((err) => {
        const loadObj = {
          isLoad: false
        };
        setHandleError("Error: Something went wrong!");
        setIsLoading(loadObj);
        console.log("err", err);
      });
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
      alert("Please complete your signature!");
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

      let pdfBase64;
      //checking if signature is only one then send image url in jpeg formate to server
      if (xyPostion.length === 1 && xyPostion[0].pos.length === 1) {
        if (isDocId) {
          pdfBase64 = await getBase64FromUrl(url);
        } else {
          for (let i = 0; i < allPages; i++) {
            const font = await pdfDoc.embedFont("Helvetica");

            const fontSize = 10;
            const textContent = docId && `OpenSign™ DocumentId: ${docId} `;

            const pages = pdfDoc.getPages();
            const page = pages[i];

            page.drawText(textContent, {
              x: 10,
              y: page.getHeight() - 10,
              size: fontSize,
              font,
              color: rgb(0.5, 0.5, 0.5)
            });
          }
          pdfBase64 = await pdfDoc.saveAsBase64({ useObjectStreams: false });
        }
        for (let i = 0; i < xyPostion.length; i++) {
          const imgUrlList = pngUrl[i].pos;
          const pageNo = pngUrl[i].pageNumber;
          imgUrlList.map(async (data) => {
            //cheking signUrl is defau;t signature url of custom url
            let ImgUrl = data.SignUrl;
            const checkUrl = ImgUrl.includes("https:");

            //if default signature url then convert it in base 64
            if (checkUrl) {
              ImgUrl = await getBase64FromIMG(ImgUrl + "?get");
            }
            //function for called convert png signatre to jpeg in base 64
            const convertPNGtoJPEG = (base64Data) => {
              return new Promise((resolve, reject) => {
                const canvas = document.createElement("canvas");
                const img = new Image();
                img.src = base64Data;

                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;

                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0);

                  // Convert to JPEG by using the canvas.toDataURL() method
                  const jpegBase64Data = canvas.toDataURL("image/jpeg");

                  resolve(jpegBase64Data);
                };

                img.onerror = (error) => {
                  reject(error);
                };
              });
            };

            convertPNGtoJPEG(ImgUrl)
              .then((jpegBase64Data) => {
                const removeBase64Fromjpeg = "data:image/jpeg;base64,";
                const newImgUrl = jpegBase64Data.replace(
                  removeBase64Fromjpeg,
                  ""
                );

                //function for call to embed signature in pdf and get digital signature pdf
                signPdfFun(newImgUrl, docId, data, pdfBase64, pageNo);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          });
        }
      }
      //else if signature is more than one then embed all sign with the use of pdf-lib
      else if (xyPostion.length > 0 && xyPostion[0].pos.length > 0) {
        for (let i = 0; i < allPages; i++) {
          const font = await pdfDoc.embedFont("Helvetica");

          const fontSize = 10;
          const textContent = docId && `OpenSign™ DocumentId: ${docId} `;

          const pages = pdfDoc.getPages();
          const page = pages[i];

          page.drawText(textContent, {
            x: 10,
            y: page.getHeight() - 10,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
        }
        for (let i = 0; i < pngUrl.length; i++) {
          const pageNo = pngUrl[i].pageNumber;

          const imgUrlList = pngUrl[i].pos;
          const pages = pdfDoc.getPages();
          const page = pages[pageNo - 1];

          const images = await Promise.all(
            imgUrlList.map(async (url) => {
              let signUrl = url.SignUrl;
              const checkUrl = url.SignUrl.includes("https:");
              if (checkUrl) {
                signUrl = signUrl + "?get";
              }
              const res = await fetch(signUrl);

              return res.arrayBuffer();
            })
          );
          images.forEach(async (imgData, id) => {
            let img;
            if (
              imgUrlList[id].ImageType &&
              imgUrlList[id].ImageType === "image/jpeg"
            ) {
              img = await pdfDoc.embedJpg(imgData);
            } else if (
              imgUrlList[id].ImageType &&
              imgUrlList[id].ImageType === "image/png"
            ) {
              img = await pdfDoc.embedPng(imgData);
            } else {
              img = await pdfDoc.embedPng(imgData);
            }

            const imgHeight = imgUrlList[id].Height
              ? imgUrlList[id].Height
              : 60;
            const imgWidth = imgUrlList[id].Width ? imgUrlList[id].Width : 150;
            const isMobile = window.innerWidth < 767;
            const newWidth = window.innerWidth;
            const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
            const xPos = (pos) => {
              //checking both condition mobile and desktop view
              if (isMobile) {
                //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
                if (pos.isMobile) {
                  const x = pos.xPosition * (pos.scale / scale);
                  return x * scale + 50;
                } else {
                  const x = pos.xPosition / scale;
                  return x * scale;
                }
              } else {
                //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                if (pos.isMobile) {
                  const x = pos.xPosition * pos.scale + 50;
                  return x;
                } else {
                  return pos.xPosition;
                }
              }
            };
            const yPos = (pos) => {
              //checking both condition mobile and desktop view

              if (isMobile) {
                //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
                if (pos.isMobile) {
                  const y = pos.yPosition * (pos.scale / scale);
                  return page.getHeight() - y * scale - imgHeight;
                } else {
                  const y = pos.yPosition / scale;
                  return page.getHeight() - y * scale - imgHeight;
                }
              } else {
                //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                if (pos.isMobile) {
                  const y = pos.yPosition * pos.scale;
                  return page.getHeight() - y - imgHeight;
                } else {
                  return page.getHeight() - pos.yPosition - imgHeight;
                }
              }
            };

            page.drawImage(img, {
              x: xPos(imgUrlList[id]),
              y: yPos(imgUrlList[id]),
              width: imgWidth,
              height: imgHeight
            });
          });
        }
        const pdfBytes = await pdfDoc.saveAsBase64({ useObjectStreams: false });
        signPdfFun(pdfBytes, docId);
      }

      setIsSignPad(false);

      setXyPostion([]);
    }
  }

  //function for call cloud function signPdf and generate digital signature
  const signPdfFun = async (
    base64Url,
    docId,
    xyPosData,
    pdfBase64Url,
    pageNo
  ) => {
    let singleSign;
    const isMobile = window.innerWidth < 767;
    const newWidth = window.innerWidth;
    const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
    const height = xyPosData ? xyPosData.Height : 60;
    const xPos = (pos) => {
      //checking both condition mobile and desktop view
      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (pos.isMobile) {
          const x = pos.xPosition * (pos.scale / scale);
          return x * scale + 50;
        } else {
          const x = pos.xPosition / scale;
          return x * scale;
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
        if (pos.isMobile) {
          const x = pos.xPosition * pos.scale + 50;
          return x;
        } else {
          return pos.xPosition;
        }
      }
    };

    const yBottom = (pos) => {
      let yPosition;
      //checking both condition mobile and desktop view

      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (pos.isMobile) {
          const y = pos.yPosition * (pos.scale / scale);
          yPosition = pos.isDrag
            ? y * scale - height
            : pos.firstYPos
            ? y * scale - height + pos.firstYPos
            : y * scale - height;
          return yPosition;
        } else {
          const y = pos.yBottom / scale;

          yPosition = pos.isDrag
            ? y * scale - height
            : pos.firstYPos
            ? y * scale - height + pos.firstYPos
            : y * scale - height;
          return yPosition;
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
        if (pos.isMobile) {
          const y = pos.yBottom * pos.scale;

          yPosition = pos.isDrag
            ? y - height
            : pos.firstYPos
            ? y - height + pos.firstYPos
            : y - height;
          return yPosition;
        } else {
          yPosition = pos.isDrag
            ? pos.yBottom - height
            : pos.firstYPos
            ? pos.yBottom - height + pos.firstYPos
            : pos.yBottom - height;
          return yPosition;
        }
      }
    };
    if (xyPostion.length === 1 && xyPostion[0].pos.length === 1) {
      const bottomY = yBottom(xyPosData);
      singleSign = {
        pdfFile: pdfBase64Url,
        docId: docId,
        userId: signerUserId,
        sign: {
          Base64: base64Url,
          Left: xPos(xyPosData),
          Bottom: bottomY,
          Width: xyPosData.Width ? xyPosData.Width : 150,
          Height: height,
          Page: pageNo
        }
      };
    } else if (xyPostion.length > 0 && xyPostion[0].pos.length > 0) {
      singleSign = {
        pdfFile: base64Url,
        docId: docId,
        userId: signerUserId
      };
    }

    await axios
      .post(`${localStorage.getItem("baseUrl")}functions/signPdf`, singleSign, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessionToken: localStorage.getItem("accesstoken")
        }
      })
      .then((Listdata) => {
        const json = Listdata.data;

        if (json.result.data) {
          getDocumentDetails();
        }
      })
      .catch((err) => {
        alert("something went wrong");
      });
  };

  //function for change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const imageType = event.target.files[0].type;

      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);

      reader.onloadend = function (e) {
        let width, height;
        const image = new Image();

        image.src = e.target.result;
        image.onload = function () {
          width = image.width;
          height = image.height;
          const aspectRatio = 460 / 184;
          const imgR = width / height;

          if (imgR > aspectRatio) {
            width = 460;
            height = 460 / imgR;
          } else {
            width = 184 * imgR;
            height = 184;
          }
          setImgWH({ width: width, height: height });
          imageRef.current.style.width = `${width}px`;
          imageRef.current.style.height = `${height}px`;
        };

        image.src = reader.result;

        setImage({ src: image.src, imgType: imageType });
      };
    }
  };

  //function for save button to save signature or image url
  const saveSign = (isDefaultSign) => {
    const signatureImg = isDefaultSign ? defaultSignImg : signature;
    setIsSignPad(false);
    setIsImageSelect(false);
    setImage();

    const getUpdatePosition = onSaveSign(
      xyPostion,
      index,
      signKey,
      signatureImg
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
        console.log("error updating field is decline ", err);
      });
  };

  const addDefaultSignature = () => {
    let xyDefaultPos = [];
    for (let i = 0; i < xyPostion.length; i++) {
      const getXYdata = xyPostion[i].pos;
      const getPageNo = xyPostion[i].pageNumber;
      const getPosData = getXYdata;

      const addSign = getPosData.map((url, ind) => {
        if (url) {
          return { ...url, SignUrl: defaultSignImg };
        }
        return url;
      });

      const newXypos = {
        pageNumber: getPageNo,
        pos: addSign
      };
      xyDefaultPos.push(newXypos);
    }

    setXyPostion(xyDefaultPos);
    setIsAlreadySign({ status: false });
  };

  //function for update TourStatus
  const closeTour = async () => {
    setSignTour(false);

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
  };

  const tourFunction = () => {
    const tourConfig = [
      {
        selector: '[data-tut="reactourFirst"]',
        content: `You can click "Auto Sign All" to automatically sign at all the locations meant to be signed by you.Make sure that you review the document properly before you click this button.`,
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourSecond"]',
        content: `Click any of such placeholders appearing on the document to sign.You will see the options to draw sign or upload an image once you click here.`,
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourThird"]',
        content: `Click here to finish & download the signed document.You will also receive a copy on your email.`,
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
          />
          {/* <div style={{width:"160px",border:"1px solid red"}}>kebjke</div> */}
          {/* pdf render view */}
          <div
            style={{
              marginLeft: !isGuestSigner && pdfOriginalWidth > 500 && "20px",
              marginRight: !isGuestSigner && pdfOriginalWidth > 500 && "20px"
            }}
          >
            {/* this modal is used show this document is already sign */}
            <Modal show={isAlreadySign.status}>
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
                {isAlreadySign.sure && (
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
                )}
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
              pdfDetails={completePdfData}
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
            />

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
            />
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