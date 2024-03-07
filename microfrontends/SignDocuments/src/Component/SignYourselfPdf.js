import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import "../css/./signature.css";
import { themeColor } from "../utils/ThemeColor/backColor";
import axios from "axios";
import moment from "moment";
import Loader from "./component/loader";
import loader from "../assests/loader2.gif";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import SignPad from "./component/signPad";
import EmailComponent from "./component/emailComponent";
import FieldsComponent from "./component/fieldsComponent";
import {
  contractDocument,
  embedDocId,
  multiSignEmbed,
  pdfNewWidthFun,
  onImageSelect,
  calculateInitialWidthHeight,
  defaultWidthHeight
} from "../utils/Utils";
import { useParams } from "react-router-dom";
import Tour from "reactour";
import { onSaveImage, onSaveSign } from "../utils/Utils";
import Signedby from "./component/signedby";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import Header from "./component/header";
import RenderPdf from "./component/renderPdf";
import { contractUsers, contactBook } from "../utils/Utils";
import PlaceholderCopy from "./component/PlaceholderCopy";
import TourContentWithBtn from "../premitives/TourContentWithBtn";
import Title from "./component/Title";
import ModalUi from "../premitives/ModalUi";
import DropdownWidgetOption from "./WidgetComponent/dropdownWidgetOption";

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
  const [myInitial, setMyInitial] = useState("");
  const [isInitial, setIsInitial] = useState(false);
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [validateAlert, setValidateAlert] = useState(false);
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
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [showAlreadySignDoc, setShowAlreadySignDoc] = useState({
    status: false
  });
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState([]);
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isDontShow, setIsDontShow] = useState(false);
  const divRef = useRef(null);
  const nodeRef = useRef(null);
  const [, drop] = useDrop({
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
      id: 1,
      text: "signature"
    },
    collect: (monitor) => ({
      isDragSign: !!monitor.isDragging()
    })
  });

  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",
    item: {
      id: 2,
      text: "stamp"
    },

    collect: (monitor) => ({
      isDragStamp: !!monitor.isDragging()
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
        } else {
          setIsUiLoading(false);
          setIsSignPad(false);
          setIsEmail(true);
          setXyPostion([]);
          setSignBtnPosition([]);
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
          setMyInitial(res[0]?.Initials);
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

  const getDate = () => {
    const date = new Date();
    const milliseconds = date.getTime();
    const newDate = moment(milliseconds).format("MM/DD/YYYY");
    return newDate;
  };
  const getWidgetValue = (type) => {
    switch (type) {
      case "name":
        return pdfDetails[0].ExtUserPtr.Name;
      case "company":
        return pdfDetails[0].ExtUserPtr.Company;
      case "job title":
        return pdfDetails[0].ExtUserPtr.JobTitle;
      case "email":
        return pdfDetails[0].ExtUserPtr.Email;
      case "checkbox":
        const flag = true;
        return flag;
      case "date":
        return getDate();
      default:
        return "";
    }
  };
  const addWidgetOptions = (type) => {
    switch (type) {
      case "signature":
        return {
          name: "signature"
        };
      case "stamp":
        return {
          name: "stamp"
        };
      case "checkbox":
        return {
          name: "checkbox"
        };

      case "text":
        return {
          name: "text"
        };
      case "initials":
        return {
          name: "initials"
        };
      case "name":
        return {
          name: "name",
          defaultValue: getWidgetValue(type),
          validation: {
            type: "text",
            pattern: ""
          }
        };
      case "company":
        return {
          name: "company",
          defaultValue: getWidgetValue(type),
          validation: {
            type: "text",
            pattern: ""
          }
        };
      case "job title":
        return {
          name: "job title",
          defaultValue: getWidgetValue(type),
          validation: {
            type: "text",
            pattern: ""
          }
        };
      case "date":
        return {
          name: "date",
          defaultValue: getDate()
        };
      case "image":
        return {
          name: "image"
        };
      case "email":
        return {
          name: "email",
          defaultValue: getWidgetValue(type),
          validation: {
            type: "email",
            pattern: ""
          }
        };
      default:
        return {};
    }
  };
  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    const key = Math.floor(1000 + Math.random() * 9000);
    let dropData = [];
    let dropObj = {};
    let filterDropPos = xyPostion.filter(
      (data) => data.pageNumber === pageNumber
    );
    const dragTypeValue = item?.text ? item.text : monitor.type;
    const widgetValue = getWidgetValue(dragTypeValue);
    const widgetWidth = defaultWidthHeight(dragTypeValue).width;
    const widgetHeight = defaultWidthHeight(dragTypeValue).height;
    const widgetTypeExist = ["name", "company", "job title", "email"].includes(
      dragTypeValue
    );
    if (item === "onclick") {
      dropObj = {
        xPosition: containerWH.width / 2 - widgetWidth / 2,
        yPosition: containerWH.height / 2 - widgetHeight / 2,
        isDrag: false,
        isStamp:
          (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
        key: key,
        type: dragTypeValue,
        yBottom: window.innerHeight / 2 - 60,

        Width: widgetTypeExist
          ? calculateInitialWidthHeight(dragTypeValue, widgetValue).getWidth
          : dragTypeValue === "initials"
            ? defaultWidthHeight(dragTypeValue).width
            : "",
        Height: widgetTypeExist
          ? calculateInitialWidthHeight(dragTypeValue, widgetValue).getHeight
          : dragTypeValue === "initials"
            ? defaultWidthHeight(dragTypeValue).height
            : "",
        options: addWidgetOptions(dragTypeValue)
      };

      dropData.push(dropObj);
    } else {
      const offset = monitor.getClientOffset();
      //adding and updating drop position in array when user drop signature button in div
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();

      const x = offset.x - containerRect.left;
      const y = offset.y - containerRect.top;
      dropObj = {
        xPosition: signBtnPosition[0] ? x - signBtnPosition[0].xPos : x,
        yPosition: signBtnPosition[0] ? y - signBtnPosition[0].yPos : y,
        // isDrag: false,
        isStamp:
          (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
        key: key,
        type: dragTypeValue,
        Width: widgetTypeExist
          ? calculateInitialWidthHeight(dragTypeValue, widgetValue).getWidth
          : defaultWidthHeight(dragTypeValue).width,
        Height: widgetTypeExist
          ? calculateInitialWidthHeight(dragTypeValue, widgetValue).getHeight
          : defaultWidthHeight(dragTypeValue).height,
        options: addWidgetOptions(dragTypeValue)
      };

      dropData.push(dropObj);
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

      // }
    } else {
      const xyPos = {
        pageNumber: pageNumber,
        pos: dropData
      };
      setXyPostion((prev) => [...prev, xyPos]);
    }

    if (
      dragTypeValue === "signature" ||
      dragTypeValue === "stamp" ||
      dragTypeValue === "image" ||
      dragTypeValue === "initials"
    ) {
      setIsSignPad(true);
    }

    if (dragTypeValue === "stamp" || dragTypeValue === "image") {
      setIsStamp(true);
    } else if (dragTypeValue === "initials") {
      setIsInitial(true);
    } else if (dragTypeValue === "checkbox") {
      setIsCheckbox(true);
    }
    setWidgetType(dragTypeValue);
    setSelectWidgetId(key);
    setSignKey(key);
  };

  //function for send placeholder's co-ordinate(x,y) position embed signature url or stamp url
  async function embedWidgetsData() {
    let showAlert = false;

    for (let i = 0; i < xyPostion?.length; i++) {
      const requiredWidgets = xyPostion[i].pos.filter(
        (position) => position.type !== "checkbox"
      );
      if (requiredWidgets && requiredWidgets?.length > 0) {
        let checkSigned;
        for (let i = 0; i < requiredWidgets?.length; i++) {
          checkSigned = requiredWidgets[i]?.options?.response;
          if (!checkSigned) {
            const checkSignUrl = requiredWidgets[i]?.pos?.SignUrl;

            let checkDefaultSigned = requiredWidgets[i]?.options?.defaultValue;
            if (!checkSignUrl) {
              if (!checkDefaultSigned) {
                if (!showAlert) {
                  showAlert = true;
                }
              }
            }
          }
        }
      }
    }
    if (xyPostion.length === 0) {
      setIsAlert({
        isShow: true,
        alertMessage: "Please complete your signature!"
      });
      return;
    } else if (showAlert) {
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
      setIsUiLoading(true);
      const url = pdfDetails[0] && pdfDetails[0].URL;

      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer()
      );

      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true
      });

      const flag = true;

      const extUserPtr = pdfDetails[0].ExtUserPtr;
      const HeaderDocId = extUserPtr?.HeaderDocId;

      //embed document's object id to all pages in pdf document
      if (!HeaderDocId) {
        await embedDocId(pdfDoc, documentId, allPages);
      }
      //embed multi signature in pdf
      const pdfBytes = await multiSignEmbed(
        xyPostion,
        pdfDoc,
        pdfOriginalWidth,
        flag,
        containerWH
      );
      // console.log('pdf',pdfBytes)
      //function for call to embed signature in pdf and get digital signature pdf
      await signPdfFun(pdfBytes, documentId);
    }
  }

  //function for get digital signature
  const signPdfFun = async (base64Url, documentId) => {
    let singleSign = {
      pdfFile: base64Url,
      docId: documentId
    };

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
  const handleStop = (event, dragElement, type) => {
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
      onImageSelect(event, setImgWH, setImage);
    }
  };

  //function for upload stamp or image
  const saveImage = () => {
    const getImage = onSaveImage(xyPostion, index, signKey, imgWH, image);
    setXyPostion(getImage);
  };

  //function for save button to save signature or image url
  const saveSign = (isDefaultSign, width, height) => {
    const isTypeText = width && height ? true : false;
    const signatureImg = isDefaultSign
      ? isDefaultSign === "initials"
        ? myInitial
        : defaultSignImg
      : signature;
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

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  const tourConfig = [
    {
      selector: '[data-tut="reactourFirst"]',
      content: () => (
        <TourContentWithBtn
          message={`Drag the signature or stamp placeholder onto the PDF to choose your desired signing location.`}
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
          message={`Drag and drop anywhere in this area. You can resize and move it later.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  //function for update TourStatus
  const closeTour = async () => {
    setSignTour(false);
    if (isDontShow) {
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
    }
  };

  const handleSaveWidgetsOptions = (
    dropdownName,
    dropdownOptions,
    minCount,
    maxCount,
    isReadOnly,
    addOption,
    deleteOption
  ) => {
    const getPageNumer = xyPostion.filter(
      (data) => data.pageNumber === pageNumber
    );

    if (getPageNumer.length > 0) {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((position) => {
        if (position.key === signKey) {
          if (addOption) {
            return {
              ...position,
              Height: position.Height
                ? position.Height + 15
                : defaultWidthHeight(widgetType).height + 15
            };
          } else if (deleteOption) {
            return {
              ...position,
              Height: position.Height
                ? position.Height - 15
                : defaultWidthHeight(widgetType).height - 15
            };
          } else {
            return {
              ...position,
              options: {
                ...position.options,
                name: dropdownName,
                values: dropdownOptions,
                isReadOnly: isReadOnly
              }
            };
          }
        }
        return position;
      });
      const updateXYposition = xyPostion.map((obj, ind) => {
        if (ind === index) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });
      setXyPostion(updateXYposition);
      if (!addOption && !deleteOption) {
        handleCloseModal();
      }
    }
  };

  const handleCloseModal = () => {
    setCurrWidgetsDetails({});
    setIsCheckbox(false);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={"Self Sign"} />
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
                zIndex: "999",
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
              pageNumber={pageNumber}
            />

            {/* pdf render view */}
            <div
              style={{
                marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
                marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
              }}
            >
              <ModalUi
                headerColor={"#dc3545"}
                isOpen={isAlert.isShow}
                title={"Alert"}
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

              {/* this modal is used show this document is already sign */}
              <ModalUi
                isOpen={showAlreadySignDoc.status}
                title={"Sign Documents"}
                handleClose={() => {
                  setShowAlreadySignDoc({ status: false });
                }}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>{showAlreadySignDoc.mssg}</p>

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
                    className="finishBtn cancelBtn"
                    onClick={() => setShowAlreadySignDoc({ status: false })}
                  >
                    Close
                  </button>
                </div>
              </ModalUi>
              <DropdownWidgetOption
                type="checkbox"
                title="Checkbox"
                showDropdown={isCheckbox}
                setShowDropdown={setIsCheckbox}
                handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                currWidgetsDetails={currWidgetsDetails}
                setCurrWidgetsDetails={setCurrWidgetsDetails}
                isSignYourself={true}
                handleClose={handleCloseModal}
              />
              <PlaceholderCopy
                isPageCopy={isPageCopy}
                setIsPageCopy={setIsPageCopy}
                xyPostion={xyPostion}
                setXyPostion={setXyPostion}
                allPages={allPages}
                pageNumber={pageNumber}
                signKey={signKey}
              />
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
                myInitial={myInitial}
                isInitial={isInitial}
                setIsInitial={setIsInitial}
                setIsStamp={setIsStamp}
                widgetType={widgetType}
              />
              {/*render email component to send email after finish signature on document */}
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
                embedWidgetsData={embedWidgetsData}
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
                    setIsPageCopy={setIsPageCopy}
                    setIsInitial={setIsInitial}
                    setWidgetType={setWidgetType}
                    setSelectWidgetId={setSelectWidgetId}
                    selectWidgetId={selectWidgetId}
                    setIsCheckbox={setIsCheckbox}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    setValidateAlert={setValidateAlert}
                  />
                )}
              </div>
            </div>

            {/*if document is not completed then render signature and stamp button in the right side */}
            {/*else document is  completed then render signed by signer name in the right side */}
            <div
              style={{
                maxHeight: window.innerHeight - 70 + "px",
                backgroundColor: "white"
              }}
              className="autoSignScroll"
            >
              {!documentStatus.isCompleted ? (
                <div>
                  <FieldsComponent
                    dataTut="reactourFirst"
                    pdfUrl={pdfUrl}
                    dragSignature={dragSignature}
                    signRef={signRef}
                    handleDivClick={handleDivClick}
                    handleMouseLeave={handleMouseLeave}
                    isDragSign={isDragSign}
                    themeColor={themeColor}
                    dragStamp={dragStamp}
                    dragRef={dragRef}
                    isDragStamp={isDragStamp}
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
          </div>
        </div>
      )}
      <ModalUi
        headerColor={"#dc3545"}
        isOpen={validateAlert}
        title={"Validation alert"}
        handleClose={() => {
          setValidateAlert(false);
        }}
      >
        <div style={{ height: "100%", padding: 20 }}>
          <p>
            The input does not meet the criteria set by the regular expression.
          </p>

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
            onClick={() => setValidateAlert(false)}
            type="button"
            className="finishBtn cancelBtn"
          >
            Close
          </button>
        </div>
      </ModalUi>
    </DndProvider>
  );
}

export default SignYourSelf;
