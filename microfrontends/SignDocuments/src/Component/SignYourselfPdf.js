import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import "../css/./signature.css";
import sign from "../assests/sign3.png";
import stamp from "../assests/stamp2.png";
import { themeColor } from "../utils/ThemeColor/backColor";
import axios from "axios";
import Loader from "./component/loader";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import SignPad from "./component/signPad";
import EmailComponent from "./component/emailComponent";
import FieldsComponent from "./component/fieldsComponent";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import {
  convertPNGtoJPEG,
  contractDocument,
  getBase64FromIMG,
  embedDocId,
  multiSignEmbed,
  pdfNewWidthFun
} from "../utils/Utils";
import { useParams } from "react-router-dom";
import Tour from "reactour";
import { onSaveImage, onSaveSign } from "../utils/Utils";
import Signedby from "./component/signedby";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import Header from "./component/header";
import RenderPdf from "./component/renderPdf";
import { contractUsers, contactBook, urlValidator } from "../utils/Utils";
import { modalAlign } from "../utils/Utils";
import AlertComponent from "./component/alertComponent";

//For signYourself inProgress section signer can add sign and complete doc sign.
function SignYourSelf() {
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isSignPad, setIsSignPad] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState();
  const [xyPostion, setXyPostion] = useState([]);
  const [defaultSignImg, setDefaultSignImg] = useState();
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [image, setImage] = useState(null);
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [signature, setSignature] = useState();
  const [isStamp, setIsStamp] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const [dragKey, setDragKey] = useState();
  const [signKey, setSignKey] = useState();
  const [imgWH, setImgWH] = useState({});
  const [isCeleb, setIsCeleb] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [successEmail, setSuccessEmail] = useState(false);
  const imageRef = useRef(null);
  const [documentStatus, setDocumentStatus] = useState({ isCompleted: false });
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [handleError, setHandleError] = useState();
  const [isDragging, setIsDragging] = useState(false);
  const [signTour, setSignTour] = useState(true);
  const { docId } = useParams();
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [signerUserId, setSignerUserId] = useState();
  const [tourStatus, setTourStatus] = useState([]);
  const [noData, setNoData] = useState(false);
  const [contractName, setContractName] = useState("");
  const [containerWH, setContainerWH] = useState({});
  const [showAlreadySignDoc, setShowAlreadySignDoc] = useState({
    status: false
  });
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const divRef = useRef(null);
  const nodeRef = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });
  const isMobile = window.innerWidth < 767;

  const pdfRef = useRef();

  const [{ isDragSign }, dragSignature] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 1,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragSign: !!monitor.isDragging()
    })
  });

  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 2,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStamp: !!monitor.isDragging()
    })
  });
  const [{ isDragSignatureSS }, dragSignatureSS] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 3,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragSignatureSS: !!monitor.isDragging()
    })
  });

  const [{ isDragStampSS }, dragStampSS] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 4,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStampSS: !!monitor.isDragging()
    })
  });

  const index = xyPostion.findIndex((object) => {
    return object.pageNumber === pageNumber;
  });
  //   rowlevel={JSON.parse(localStorage.getItem("rowlevel"))}
  const rowLevel =
    localStorage.getItem("rowlevel") &&
    JSON.parse(localStorage.getItem("rowlevel"));

  const signObjId =
    rowLevel && rowLevel?.id
      ? rowLevel.id
      : rowLevel?.objectId && rowLevel.objectId;

  const documentId = docId ? docId : signObjId && signObjId;
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
      getDocumentDetails(true);
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

  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (showComplete) => {
    //getting document details
    const documentData = await contractDocument(documentId);

    if (documentData && documentData.length > 0) {
      setPdfDetails(documentData);
      const isCompleted =
        documentData[0].IsCompleted && documentData[0].IsCompleted;
      if (isCompleted) {
        const docStatus = {
          isCompleted: isCompleted
        };
        setDocumentStatus(docStatus);
        setPdfUrl(documentData[0].SignedUrl);
        const alreadySign = {
          status: true,
          mssg: "You have successfully signed the document!"
        };
        if (showComplete) {
          setShowAlreadySignDoc(alreadySign);
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
        }
      })
      .catch((err) => {
        const loadObj = {
          isLoad: false
        };
        setHandleError("Error: Something went wrong!");
        setIsLoading(loadObj);
      });

    const contractUsersRes = await contractUsers(jsonSender.email);

    if (contractUsersRes[0] && contractUsersRes.length > 0) {
      setContractName("_Users");
      setSignerUserId(contractUsersRes[0].objectId);
      const tourstatuss =
        contractUsersRes[0].TourStatus && contractUsersRes[0].TourStatus;

      if (tourstatuss && tourstatuss.length > 0) {
        setTourStatus(tourstatuss);
        const checkTourRecipients = tourstatuss.filter(
          (data) => data.signyourself
        );
        if (checkTourRecipients && checkTourRecipients.length > 0) {
          setCheckTourStatus(checkTourRecipients[0].signyourself);
        }
      }
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (contractUsersRes === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    } else if (contractUsersRes.length === 0) {
      const contractContactBook = await contactBook(jsonSender.objectId);
      if (contractContactBook && contractContactBook.length > 0) {
        setContractName("_Contactbook");
        setSignerUserId(contractContactBook[0].objectId);
        const tourstatuss =
          contractContactBook[0].TourStatus &&
          contractContactBook[0].TourStatus;
        if (tourstatuss && tourstatuss.length > 0) {
          setTourStatus(tourstatuss);
          const checkTourRecipients = tourstatuss.filter(
            (data) => data.signyourself
          );
          if (checkTourRecipients && checkTourRecipients.length > 0) {
            setCheckTourStatus(checkTourRecipients[0].signyourself);
          }
        }
      } else {
        setNoData(true);
      }
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    }
  };

  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    const key = Math.floor(1000 + Math.random() * 9000);
    let dropData = [];
    let filterDropPos = xyPostion.filter(
      (data) => data.pageNumber === pageNumber
    );
    if (item === "onclick") {
      const dropObj = {
        xPosition: window.innerWidth / 2 - 100,
        yPosition: window.innerHeight / 2 - 60,
        isDrag: false,
        key: key,
        isStamp: monitor,

        yBottom: window.innerHeight / 2 - 60
      };

      dropData.push(dropObj);

      if (monitor) {
        setIsStamp(true);
      } else {
        setIsStamp(false);
      }
    } else {
      const offset = monitor.getClientOffset();
      //adding and updating drop position in array when user drop signature button in div
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();

      const x = offset.x - containerRect.left;
      const y = offset.y - containerRect.top;
      const ybottom = containerRect.bottom - offset.y;

      const dropObj = {
        xPosition: signBtnPosition[0] ? x - signBtnPosition[0].xPos : x,
        yPosition: signBtnPosition[0] ? y - signBtnPosition[0].yPos : y,
        isDrag: false,
        key: key,
        isStamp: isDragStamp || isDragStampSS ? true : false,
        firstXPos: signBtnPosition[0] && signBtnPosition[0].xPos,
        firstYPos: signBtnPosition[0] && signBtnPosition[0].yPos,
        yBottom: ybottom
      };

      dropData.push(dropObj);

      if (isDragStamp || isDragStampSS) {
        setIsStamp(true);
      } else {
        setIsStamp(false);
      }
    }
    if (filterDropPos.length > 0) {
      const index = xyPostion.findIndex((object) => {
        return object.pageNumber === pageNumber;
      });
      const updateData = filterDropPos[0].pos;

      // if (updateData.length > dropData.length) {
      const newSignPos = updateData.concat(dropData);
      let xyPos = {
        pageNumber: pageNumber,
        pos: newSignPos
      };
      xyPostion.splice(index, 1, xyPos);
      setIsSignPad(true);
      setSignKey(key);
      // }
    } else {
      const xyPos = {
        pageNumber: pageNumber,
        pos: dropData
      };
      setXyPostion((prev) => [...prev, xyPos]);
      setIsSignPad(true);
      setSignKey(key);
    }

    // setXyPostion((prev) => [...prev, xyPos]);
  };

  //function for send placeholder's co-ordinate(x,y) position embed signature url or stamp url
  async function embedImages() {
    let checkSignUrl = [];

    for (let i = 0; i < xyPostion.length; i++) {
      const posData = xyPostion[i].pos.filter((pos) => !pos.SignUrl);
      if (posData && posData.length > 0) {
        checkSignUrl.push(posData);
      }
    }
    if (xyPostion.length === 0) {
      setIsAlert({
        isShow: true,
        alertMessage: "Please complete your signature!"
      });
      return;
    } else if (xyPostion.length > 0 && checkSignUrl.length > 0) {
      setIsAlert({
        isShow: true,
        alertMessage: "Please complete your signature!"
      });
      return;
    } else {
      setIsCeleb(true);
      setTimeout(() => {
        setIsCeleb(false);
      }, 3000);
      const loadObj = {
        isLoad: true,
        message: "This might take some time"
      };
      setIsLoading(loadObj);
      const url = pdfDetails[0] && pdfDetails[0].URL;

      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer()
      );

      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true
      });

      //checking if signature is only one then send image url in jpeg formate to server
      if (xyPostion.length === 1 && xyPostion[0].pos.length === 1) {
        //embed document's object id to all pages in pdf document
        await embedDocId(pdfDoc, documentId, allPages);
        const pdfBase64 = await pdfDoc.saveAsBase64({
          useObjectStreams: false
        });

        for (let xyData of xyPostion) {
          const imgUrlList = xyData.pos;
          const pageNo = xyData.pageNumber;
          imgUrlList.map(async (data) => {
            let ImgUrl = data.SignUrl;
            //cheking signUrl is defau;t signature url of custom url
            const checkUrl = urlValidator(ImgUrl);
            //if default signature url then convert it in base 64
            if (checkUrl) {
              ImgUrl = await getBase64FromIMG(ImgUrl + "?get");
            }
            //function for convert signature png base64 url to jpeg base64
            convertPNGtoJPEG(ImgUrl)
              .then((jpegBase64Data) => {
                const removeBase64Fromjpeg = "data:image/jpeg;base64,";
                const newImgUrl = jpegBase64Data.replace(
                  removeBase64Fromjpeg,
                  ""
                );
                //function for call to embed signature in pdf and get digital signature pdf
                signPdfFun(newImgUrl, documentId, data, pdfBase64, pageNo);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          });
        }
      }
      //else if signature is more than one then embed all sign with the use of pdf-lib
      else if (xyPostion.length > 0 && xyPostion[0].pos.length > 0) {
        const flag = true;
        //embed document's object id to all pages in pdf document
        await embedDocId(pdfDoc, documentId, allPages);

        //embed multi signature in pdf
        const pdfBytes = await multiSignEmbed(
          xyPostion,
          pdfDoc,
          pdfOriginalWidth,
          flag,
          containerWH
        );
        //function for call to embed signature in pdf and get digital signature pdf
        signPdfFun(pdfBytes, documentId);
      }
      setIsSignPad(false);
      setIsEmail(true);
      setXyPostion([]);
      setSignBtnPosition([]);
    }
  }

  //function for get digital signature
  const signPdfFun = async (
    base64Url,
    documentId,
    xyPosData,
    pdfBase64Url,
    pageNo
  ) => {
    let singleSign;
    const newWidth = containerWH.width;
    const scale = isMobile ? pdfOriginalWidth / newWidth : 1;

    if (xyPostion.length === 1 && xyPostion[0].pos.length === 1) {
      const height = xyPosData.Height ? xyPosData.Height : 60;
      const bottomY = xyPosData.isDrag
        ? xyPosData.yBottom * scale - height * scale
        : xyPosData.firstYPos
          ? xyPosData.yBottom * scale - height * scale + xyPosData.firstYPos
          : xyPosData.yBottom * scale - height * scale;

      singleSign = {
        pdfFile: pdfBase64Url,
        docId: documentId,
        sign: {
          Base64: base64Url,
          Left: isMobile ? xyPosData.xPosition * scale : xyPosData.xPosition,
          Bottom: bottomY,
          Width: xyPosData.Width ? xyPosData.Width * scale : 150 * scale,
          Height: height * scale,
          Page: pageNo
        }
      };
    } else if (xyPostion.length > 0 && xyPostion[0].pos.length > 0) {
      singleSign = {
        pdfFile: base64Url,
        docId: documentId
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

        setPdfUrl(json.result.data);
        if (json.result.data) {
          getDocumentDetails(false);
        }
      })
      .catch((err) => {
        console.log("axois err ", err);
      });
  };

  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key, e) => {
    setDragKey(key);
    setIsDragging(true);
  };

  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement) => {
    if (isDragging && dragElement) {
      event.preventDefault();
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();

      const ybottom = containerRect.height - dragElement.y;

      if (dragKey >= 0) {
        const filterDropPos = xyPostion.filter(
          (data) => data.pageNumber === pageNumber
        );

        if (filterDropPos.length > 0) {
          const getXYdata = xyPostion[index].pos;
          const getPosData = getXYdata;
          const addSign = getPosData.map((url, ind) => {
            if (url.key === dragKey) {
              return {
                ...url,
                xPosition: dragElement.x,
                yPosition: dragElement.y,
                isDrag: true,
                yBottom: ybottom
              };
            }
            return url;
          });

          const newUpdateUrl = xyPostion.map((obj, ind) => {
            if (ind === index) {
              return { ...obj, pos: addSign };
            }
            return obj;
          });
          setXyPostion(newUpdateUrl);
        }
      }
    }
    setTimeout(() => {
      setIsDragging(false);
    }, 200);
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

  //function for change page numver of pdf
  function changePage(offset) {
    setSignBtnPosition([]);
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

    setXyPostion(getUpdatePosition);
  };

  //function for capture position on hover signature button
  const handleDivClick = (e) => {
    const divRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - divRect.left;
    const mouseY = e.clientY - divRect.top;

    const xyPosition = {
      xPos: mouseX,
      yPos: mouseY
    };

    setXYSignature(xyPosition);
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = (e) => {
    setSignBtnPosition([xySignature]);
  };

  const handleAllDelete = () => {
    setXyPostion([]);
  };

  //function for delete signature block
  const handleDeleteSign = (key) => {
    const updateResizeData = [];

    let filterData = xyPostion[index].pos.filter((data) => data.key !== key);

    //delete and update block position
    if (filterData.length > 0) {
      updateResizeData.push(filterData);
      const newUpdatePos = xyPostion.map((obj, ind) => {
        if (ind === index) {
          return { ...obj, pos: updateResizeData[0] };
        }
        return obj;
      });

      setXyPostion(newUpdatePos);
    } else {
      const getRemainPage = xyPostion.filter(
        (data) => data.pageNumber !== pageNumber
      );

      if (getRemainPage && getRemainPage.length > 0) {
        setXyPostion(getRemainPage);
      } else {
        setXyPostion([]);
      }
    }
  };

  //function for upload stamp or image
  const saveImage = () => {
    const getImage = onSaveImage(xyPostion, index, signKey, imgWH, image);
    setXyPostion(getImage);
  };

  //function for add default signature url in local array
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
    setShowAlreadySignDoc({ status: false });
  };
  const tourConfig = [
    {
      selector: '[data-tut="reactourFirst"]',
      content: `Drag the signature or stamp placeholder onto the PDF to choose your desired signing location.`,
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourSecond"]',
      content: `Drag and drop anywhere in this area. You can resize and move it later.`,
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  //function for update TourStatus
  const closeTour = async () => {
    setSignTour(false);

    let updatedTourStatus = [];
    if (tourStatus.length > 0) {
      updatedTourStatus = [...tourStatus];
      const signyourselfIndex = tourStatus.findIndex(
        (obj) => obj["signyourself"] === false || obj["signyourself"] === true
      );
      if (signyourselfIndex !== -1) {
        updatedTourStatus[signyourselfIndex] = { signyourself: true };
      } else {
        updatedTourStatus.push({ signyourself: true });
      }
    } else {
      updatedTourStatus = [{ signyourself: true }];
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
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      )
      .then((Listdata) => {
        // const json = Listdata.data;
      })
      .catch((err) => {
        console.log("axois err ", err);
      });
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
          {/* this component used for UI interaction and show their functionality */}
          {pdfLoadFail && !checkTourStatus && (
            <Tour
              onRequestClose={closeTour}
              steps={tourConfig}
              isOpen={signTour}
              rounded={5}
              closeWithMask={false}
            />
          )}

          {/* this component used to render all pdf pages in left side */}

          <RenderAllPdfPage
            pdfUrl={pdfUrl}
            signPdfUrl={pdfDetails[0] && pdfDetails[0].URL}
            allPages={allPages}
            setAllPages={setAllPages}
            setPageNumber={setPageNumber}
            setSignBtnPosition={setSignBtnPosition}
          />

          {/* pdf render view */}
          <div
            style={{
              marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
              marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
            }}
          >
            <AlertComponent
              isShow={isAlert.isShow}
              alertMessage={isAlert.alertMessage}
              setIsAlert={setIsAlert}
            />
            {/* this modal is used show this document is already sign */}
            <Modal
              show={showAlreadySignDoc.status}
              onShow={() => modalAlign()}
              backdropClassName="signature-backdrop"
            >
              <ModalHeader style={{ background: themeColor() }}>
                <span style={{ color: "white" }}> Sign Documents</span>
              </ModalHeader>

              <Modal.Body>
                <p>{showAlreadySignDoc.mssg}</p>
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
                  onClick={() => setShowAlreadySignDoc({ status: false })}
                >
                  Close
                </button>
                {showAlreadySignDoc.sure && (
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
            {/* render email component to send email after finish signature on document */}
            <EmailComponent
              isEmail={isEmail}
              pdfUrl={pdfUrl}
              isCeleb={isCeleb}
              setIsEmail={setIsEmail}
              pdfName={pdfDetails[0] && pdfDetails[0].Name}
              setSuccessEmail={setSuccessEmail}
              sender={jsonSender}
              setIsAlert={setIsAlert}
            />
            {/* pdf header which contain funish back button */}
            <Header
              pageNumber={pageNumber}
              allPages={allPages}
              changePage={changePage}
              pdfUrl={pdfUrl}
              documentStatus={documentStatus}
              embedImages={embedImages}
              pdfDetails={pdfDetails}
              isShowHeader={true}
              currentSigner={true}
              alreadySign={pdfUrl ? true : false}
              isSignYourself={true}
              setIsEmail={setIsEmail}
            />

            <div data-tut="reactourSecond">
              {containerWH && (
                <RenderPdf
                  pageNumber={pageNumber}
                  pdfOriginalWidth={pdfOriginalWidth}
                  pdfNewWidth={pdfNewWidth}
                  drop={drop}
                  successEmail={successEmail}
                  nodeRef={nodeRef}
                  handleTabDrag={handleTabDrag}
                  handleStop={handleStop}
                  isDragging={isDragging}
                  setIsSignPad={setIsSignPad}
                  setIsStamp={setIsStamp}
                  handleDeleteSign={handleDeleteSign}
                  setSignKey={setSignKey}
                  pdfDetails={pdfDetails}
                  setIsDragging={setIsDragging}
                  xyPostion={xyPostion}
                  pdfRef={pdfRef}
                  pdfUrl={pdfUrl}
                  numPages={numPages}
                  pageDetails={pageDetails}
                  setPdfLoadFail={setPdfLoadFail}
                  pdfLoadFail={pdfLoadFail}
                  setXyPostion={setXyPostion}
                  index={index}
                  containerWH={containerWH}
                />
              )}
            </div>
          </div>

          {/*if document is not completed then render signature and stamp button in the right side */}
          {/*else document is  completed then render signed by signer name in the right side */}
          {!documentStatus.isCompleted ? (
            <div>
              <FieldsComponent
                dataTut="reactourFirst"
                pdfUrl={pdfUrl}
                sign={sign}
                stamp={stamp}
                dragSignature={dragSignature}
                signRef={signRef}
                handleDivClick={handleDivClick}
                handleMouseLeave={handleMouseLeave}
                isDragSign={isDragSign}
                themeColor={themeColor}
                dragStamp={dragStamp}
                dragRef={dragRef}
                isDragStamp={isDragStamp}
                isDragSignatureSS={isDragSignatureSS}
                dragSignatureSS={dragSignatureSS}
                dragStampSS={dragStampSS}
                handleAllDelete={handleAllDelete}
                xyPostion={xyPostion}
                isSignYourself={true}
                addPositionOfSignature={addPositionOfSignature}
                isMailSend={false}
              />
            </div>
          ) : (
            <div>
              <Signedby pdfDetails={pdfDetails[0]} />
            </div>
          )}
        </div>
      )}
    </DndProvider>
  );
}

export default SignYourSelf;
