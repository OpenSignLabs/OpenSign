import React, { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/signature.css";
import { isEnableSubscription, isStaging } from "../constant/const";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import WidgetComponent from "../components/pdf/WidgetComponent";
import Tour from "reactour";
import SignerListPlace from "../components/pdf/SignerListPlace";
import Header from "../components/pdf/PdfHeader";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import {
  pdfNewWidthFun,
  contractUsers,
  randomId,
  addZIndex,
  defaultWidthHeight,
  addWidgetOptions,
  textInputWidget,
  radioButtonWidget,
  fetchSubscription,
  getContainerScale,
  convertBase64ToFile,
  rotatePdfPage,
  onClickZoomOut,
  onClickZoomIn,
  handleRemoveWidgets,
  handleRotateWarning,
  color,
  copytoData,
  getTenantDetails,
  signatureTypes,
  handleSignatureType
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import "../styles/AddUser.css";
import Title from "../components/Title";
import EditTemplate from "../components/pdf/EditTemplate";
import AddRoleModal from "../components/pdf/AddRoleModal";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import { useSelector } from "react-redux";
import PdfZoom from "../components/pdf/PdfZoom";
import { useTranslation } from "react-i18next";
import RotateAlert from "../components/RotateAlert";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import LinkUserModal from "../primitives/LinkUserModal";
import { jwtDecode } from "jwt-decode";
import BulkSendUi from "../components/BulkSendUi";
import Alert from "../primitives/Alert";
import { RWebShare } from "react-web-share";

const DraftTemplate = () => {
  const { t } = useTranslation();
  const isHeader = useSelector((state) => state.showHeader);
  const { jwttoken } = useParams();
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const divRef = useRef(null);
  const numPages = 1;
  const isMobile = window.innerWidth < 767;
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isMailSend, setIsMailSend] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const [dragKey, setDragKey] = useState();
  const [signersdata, setSignersData] = useState([]);
  const [signerPos, setSignerPos] = useState([]);
  const [isSelectListId, setIsSelectId] = useState();
  const [isSendAlert, setIsSendAlert] = useState(false);
  const [isCreateDocModal, setIsCreateDocModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [isRotate, setIsRotate] = useState({ status: false, degree: 0 });
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [handleError, setHandleError] = useState();
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [templateTour, setTemplateTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [containerWH, setContainerWH] = useState();
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [isSigners, setIsSigners] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [isRadio, setIsRadio] = useState(false);
  const [blockColor, setBlockColor] = useState("");
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [isNameModal, setIsNameModal] = useState(false);
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [pdfRotateBase64, setPdfRotatese64] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [isModalRole, setIsModalRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [isEditTemplate, setIsEditTemplate] = useState(false);
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [signKey, setSignKey] = useState();
  const [IsReceipent, setIsReceipent] = useState(true);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState([]);
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [widgetName, setWidgetName] = useState(false);
  const [isAddRole, setIsAddRole] = useState(false);
  const [fontSize, setFontSize] = useState();
  const [fontColor, setFontColor] = useState();
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isPublic, setIsPublic] = useState("");
  const [isPublicErr, setIsPublicError] = useState("");
  const [isAllRoleLinked, setIsAllRolelinked] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  });
  const [{ isDragSign }, dragSignature] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 1, text: "signature" },
    collect: (monitor) => ({ isDragSign: !!monitor.isDragging() })
  });
  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 2, text: "stamp" },
    collect: (monitor) => ({ isDragStamp: !!monitor.isDragging() })
  });
  const decode = jwtDecode(jwttoken);
  const templateId = decode?.template_id;
  useEffect(() => {
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (divRef.current) {
        const pdfWidth = pdfNewWidthFun(divRef);
        setPdfNewWidth(pdfWidth);
        setContainerWH({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight
        });
        setScale(1);
        setZoomPercent(0);
      }
    };

    // Use setTimeout to wait for the transition to complete
    const timer = setTimeout(updateSize, 100); // match the transition duration

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current, isHeader]);

  const handleNavigation = () => {
    // navigate("/subscription");
    setIsSubscriptionExpired(true);
  };
  async function checkIsSubscribed() {
    const res = await fetchSubscription("", "", false, false, jwttoken);
    const plan = res.plan;
    const billingDate = res.billingDate;
    if (plan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (new Date(billingDate) > new Date()) {
        setIsSubscribe(true);
        return true;
      } else {
        handleNavigation(plan);
      }
    } else {
      handleNavigation(plan);
    }
  }
  //function to fetch tenant Details
  const fetchTenantDetails = async () => {
    if (jwttoken) {
      try {
        const tenantDetails = await getTenantDetails("", jwttoken);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          const signatureType = tenantDetails?.SignatureType || [];
          const filterSignTypes = signatureType?.filter(
            (x) => x.enabled === true
          );
          return filterSignTypes;
        }
      } catch (e) {
        alert(t("user-not-exist"));
      }
    } else {
      alert(t("user-not-exist"));
    }
  };
  // `fetchTemplate` function in used to get Template from server and setPlaceholder ,setSigner if present
  const fetchTemplate = async () => {
    try {
      const tenantSignTypes = await fetchTenantDetails();
      const params = { templateId: templateId };
      const token = jwttoken
        ? { jwttoken: jwttoken }
        : { sessionToken: localStorage.getItem("accesstoken") };
      const templateDeatils = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            ...token
          }
        }
      );
      const documentData =
        templateDeatils.data && templateDeatils.data.result
          ? [templateDeatils.data.result]
          : [];
      if (templateDeatils?.data?.result?.IsPublic !== undefined) {
        if (templateDeatils?.data?.result?.IsPublic === true) {
          setIsPublic("true");
        } else {
          setIsPublic("false");
        }
      } else {
        setIsPublic("undefined");
      }

      if (documentData && documentData.length > 0) {
        if (isEnableSubscription) {
          checkIsSubscribed(documentData[0]?.ExtUserPtr?.Email);
        }
        const userSignatureType =
          documentData[0]?.ExtUserPtr?.SignatureType || signatureTypes;
        const docSignTypes =
          documentData?.[0]?.SignatureType || userSignatureType;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          docSignTypes
        );
        setSignatureType(updatedSignatureType);
        const updatedPdfDetails = [...documentData];
        updatedPdfDetails[0].SignatureType = updatedSignatureType;
        setPdfDetails(updatedPdfDetails);
        setIsSigners(true);
        if (documentData[0].Signers && documentData[0].Signers.length > 0) {
          setIsSelectId(0);
          if (
            documentData[0].Placeholders &&
            documentData[0].Placeholders.length > 0
          ) {
            setSignerPos(documentData[0].Placeholders);
            let signers = [...documentData[0].Signers];
            let updatedSigners = documentData[0].Placeholders.map((x) => {
              let matchingSigner = signers.find(
                (y) => x.signerObjId && x.signerObjId === y.objectId
              );

              if (matchingSigner) {
                return {
                  ...matchingSigner,
                  Role: x.Role ? x.Role : matchingSigner.Role,
                  Id: x.Id,
                  blockColor: x.blockColor
                };
              } else {
                return { Role: x.Role, Id: x.Id, blockColor: x.blockColor };
              }
            });
            setSignersData(updatedSigners);
            setUniqueId(updatedSigners[0].Id);
            setBlockColor(updatedSigners[0].blockColor);
          } else {
            const updatedSigners = documentData[0].Signers.map((x, index) => ({
              ...x,
              Id: randomId(),
              Role: "User " + (index + 1)
            }));
            setSignersData(updatedSigners);
            setUniqueId(updatedSigners[0].Id);
            setBlockColor(updatedSigners[0].blockColor);
          }
        } else {
          setRoleName("User 1");
          if (
            documentData[0].Placeholders &&
            documentData[0].Placeholders.length > 0
          ) {
            let updatedSigners = documentData[0].Placeholders.map((x) => {
              return { Role: x.Role, Id: x.Id, blockColor: x.blockColor };
            });
            setSignerPos(documentData[0].Placeholders);
            setUniqueId(updatedSigners[0].Id);
            setSignersData(updatedSigners);
            setIsSelectId(0);
            setBlockColor(updatedSigners[0].blockColor);
          }
        }
      } else if (
        documentData === "Error: Something went wrong!" ||
        (documentData.result && documentData.result.error)
      ) {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
      } else {
        setHandleError(t("no-data-avaliable"));
        setIsLoading({ isLoad: false });
      }

      const res = await contractUsers(jwttoken);
      if (res[0] && res.length) {
        setSignerUserId(res[0].objectId);
        const tourstatus = res[0].TourStatus && res[0].TourStatus;
        if (tourstatus && tourstatus.length > 0) {
          setTourStatus(tourstatus);
          const checkTourRecipients = tourstatus.filter(
            (data) => data.templateTour
          );
          if (checkTourRecipients && checkTourRecipients.length > 0) {
            setCheckTourStatus(checkTourRecipients[0].templateTour);
          }
        }
        setIsLoading({ isLoad: false });
      } else if (res === "Error: Something went wrong!") {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
      } else if (res.length === 0) {
        setHandleError(t("no-data-avaliable"));
        setIsLoading({ isLoad: false });
      }
    } catch (err) {
      console.log("err ", err);
      if (err?.response?.data?.code === 101) {
        setHandleError(t("no-data-avaliable"));
      } else {
        setHandleError(t("something-went-wrong-mssg"));
      }
    }
  };
  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    if (item && item.text) {
      setWidgetName(item.text);
    }
    getSignerPos(item, monitor);
  };

  // `getSignerPos` is used to get placeholder position when user place it and save it in array
  const getSignerPos = (item, monitor) => {
    if (uniqueId) {
      const signer = signersdata.find((x) => x.Id === uniqueId);
      if (signer) {
        const posZIndex = zIndex + 1;
        setZIndex(posZIndex);
        const containerScale = getContainerScale(
          pdfOriginalWH,
          pageNumber,
          containerWH
        );
        const key = randomId();
        const dragTypeValue = item?.text ? item.text : monitor.type;
        const widgetWidth =
          defaultWidthHeight(dragTypeValue).width * containerScale;
        const widgetHeight =
          defaultWidthHeight(dragTypeValue).height * containerScale;
        let dropData = [],
          currentPagePosition;
        let placeHolder;
        if (item === "onclick") {
          // `getBoundingClientRect()` is used to get accurate measurement height of the div
          const divHeight = divRef.current.getBoundingClientRect().height;
          const dropObj = {
            //onclick put placeholder center on pdf
            xPosition: widgetWidth / 4 + containerWH.width / 2,
            yPosition: widgetHeight + divHeight / 2,
            isStamp:
              (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
            key: key,
            scale: containerScale,
            zIndex: posZIndex,
            type: dragTypeValue,
            options: addWidgetOptions(dragTypeValue),
            Width: widgetWidth / (containerScale * scale),
            Height: widgetHeight / (containerScale * scale)
          };
          dropData.push(dropObj);
          placeHolder = { pageNumber: pageNumber, pos: dropData };
        } else {
          const offset = monitor.getClientOffset();
          //adding and updating drop position in array when user drop signature button in div
          const containerRect = document
            .getElementById("container")
            .getBoundingClientRect();
          const x = offset.x - containerRect.left;
          const y = offset.y - containerRect.top;
          const getXPosition = signBtnPosition[0]
            ? x - signBtnPosition[0].xPos
            : x;
          const getYPosition = signBtnPosition[0]
            ? y - signBtnPosition[0].yPos
            : y;
          const dropObj = {
            xPosition: getXPosition / (containerScale * scale),
            yPosition: getYPosition / (containerScale * scale),
            isStamp:
              (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
            key: key,
            scale: containerScale,
            // isMobile: isMobile,
            zIndex: posZIndex,
            type: item.text,
            options: addWidgetOptions(dragTypeValue),
            Width: widgetWidth / (containerScale * scale),
            Height: widgetHeight / (containerScale * scale)
          };

          dropData.push(dropObj);
          placeHolder = { pageNumber: pageNumber, pos: dropData };
        }
        let filterSignerPos = signerPos.find((data) => data.Id === uniqueId);
        const getPlaceHolder = filterSignerPos?.placeHolder;
        if (getPlaceHolder) {
          //checking exist placeholder on same page
          currentPagePosition = getPlaceHolder.find(
            (data) => data.pageNumber === pageNumber
          );
        }
        //checking current page has already some placeholders then update that placeholder and add upcoming placehoder position
        if (getPlaceHolder && currentPagePosition) {
          const updatePlace = getPlaceHolder.filter(
            (data) => data.pageNumber !== pageNumber
          );
          const getPos = currentPagePosition?.pos;
          const newSignPos = getPos.concat(dropData);
          let xyPos = { pageNumber: pageNumber, pos: newSignPos };
          updatePlace.push(xyPos);
          const updatesignerPos = signerPos.map((x) =>
            x.Id === uniqueId ? { ...x, placeHolder: updatePlace } : x
          );
          setSignerPos(updatesignerPos);
        } else {
          //else condition to add placeholder widgets on multiple page first time
          const updatesignerPos = signerPos.map((x) =>
            x.Id === uniqueId && x?.placeHolder
              ? { ...x, placeHolder: [...x.placeHolder, placeHolder] }
              : x.Id === uniqueId
                ? { ...x, placeHolder: [placeHolder] }
                : x
          );
          setSignerPos(updatesignerPos);
        }

        if (dragTypeValue === "dropdown") {
          setShowDropdown(true);
        } else if (dragTypeValue === "checkbox") {
          setIsCheckbox(true);
        } else if (dragTypeValue === radioButtonWidget) {
          setIsRadio(true);
        } else if (
          [textInputWidget, "name", "company", "job title", "email"].includes(
            dragTypeValue
          )
        ) {
          setFontSize(12);
          setFontColor("black");
        }
        setCurrWidgetsDetails({});
        setWidgetType(dragTypeValue);
        setSignKey(key);
        setSelectWidgetId(key);
        setIsMailSend(false);
      } else {
        setIsReceipent(false);
      }
    } else {
      setIsAddRole(true);
    }
  };

  const tourAddRole = [
    {
      selector: '[data-tut="reactourAddbtn"]',
      content: t("add-user-template"),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  //function for get pdf page details
  const pageDetails = async (pdf) => {
    let pdfWHObj = [];
    const totalPages = pdf?.numPages;
    for (let index = 0; index < totalPages; index++) {
      const getPage = await pdf.getPage(index + 1);
      const scale = 1;
      const { width, height } = getPage.getViewport({ scale });
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    }
    setPdfOriginalWH(pdfWHObj);
    setPdfLoad(true);
  };
  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key) => {
    setDragKey(key);
    setIsDragging(true);
  };

  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement, signerId, key) => {
    setFontColor();
    setFontSize();
    if (!isResize && isDragging) {
      const dataNewPlace = addZIndex(signerPos, key, setZIndex);
      let updateSignPos = [...signerPos];
      updateSignPos.splice(0, updateSignPos.length, ...dataNewPlace);
      const signId = signerId; //? signerId : signerObjId;
      const keyValue = key ? key : dragKey;
      const containerScale = getContainerScale(
        pdfOriginalWH,
        pageNumber,
        containerWH
      );
      if (keyValue >= 0) {
        const filterSignerPos = updateSignPos.filter(
          (data) => data.Id === signId
        );

        if (filterSignerPos.length > 0) {
          const getPlaceHolder = filterSignerPos[0].placeHolder;

          const getPageNumer = getPlaceHolder.filter(
            (data) => data.pageNumber === pageNumber
          );

          if (getPageNumer.length > 0) {
            const getXYdata = getPageNumer[0].pos;
            const getPosData = getXYdata;
            const addSignPos = getPosData.map((url) => {
              if (url.key === keyValue) {
                return {
                  ...url,
                  xPosition: dragElement.x / (containerScale * scale),
                  yPosition: dragElement.y / (containerScale * scale)
                };
              }
              return url;
            });

            const newUpdateSignPos = getPlaceHolder.map((obj) => {
              if (obj.pageNumber === pageNumber) {
                return { ...obj, pos: addSignPos };
              }
              return obj;
            });
            const newUpdateSigner = updateSignPos.map((obj) => {
              if (obj.Id === signId) {
                return { ...obj, placeHolder: newUpdateSignPos };
              }
              return obj;
            });
            setSignerPos(newUpdateSigner);
          }
        }
      }
    }
    setIsMailSend(false);
    setTimeout(() => setIsDragging(false), 200);
  };
  //function for delete signature block
  const handleDeleteSign = (key, Id) => {
    const updateData = [];
    const filterSignerPos = signerPos.filter((data) => data.Id === Id);

    if (filterSignerPos.length > 0) {
      const getPlaceHolder = filterSignerPos[0].placeHolder;

      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos.filter(
          (data) => data.key !== key
        );

        if (getXYdata.length > 0) {
          updateData.push(getXYdata);
          const newUpdatePos = getPlaceHolder.map((obj) => {
            if (obj.pageNumber === pageNumber) {
              return { ...obj, pos: updateData[0] };
            }
            return obj;
          });

          const newUpdateSigner = signerPos.map((obj) => {
            if (obj.Id === Id) {
              return { ...obj, placeHolder: newUpdatePos };
            }
            return obj;
          });

          setSignerPos(newUpdateSigner);
        } else {
          const getRemainPage = filterSignerPos[0].placeHolder.filter(
            (data) => data.pageNumber !== pageNumber
          );
          //condition to check placeholder length is greater than 1 do not need to remove whole placeholder
          //array only resove particular widgets
          if (getRemainPage && getRemainPage.length > 0) {
            const newUpdatePos = filterSignerPos.map((obj) => {
              if (obj.Id === Id) {
                return { ...obj, placeHolder: getRemainPage };
              }
              return obj;
            });
            let signerupdate = [];
            signerupdate = signerPos.filter((data) => data.Id !== Id);
            signerupdate.push(newUpdatePos[0]);

            setSignerPos(signerupdate);
          } else {
            const updatedData = signerPos.map((item) => {
              if (item.Id === Id) {
                // Create a copy of the item object and delete the placeHolder field
                const updatedItem = { ...item };
                delete updatedItem.placeHolder;
                return updatedItem;
              }
              return item;
            });
            setSignerPos(updatedData);
          }
        }
      }
    }
  };

  //function for change page
  function changePage(offset) {
    setSignBtnPosition([]);
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for capture position on hover or touch widgets
  const handleDivClick = (e) => {
    const isTouchEvent = e.type.startsWith("touch");
    const divRect = e.currentTarget.getBoundingClientRect();
    let mouseX, mouseY;
    if (isTouchEvent) {
      const touch = e.touches[0]; // Get the first touch point
      mouseX = touch.clientX - divRect.left;
      mouseY = touch.clientY - divRect.top;
      setSignBtnPosition([{ xPos: mouseX, yPos: mouseY }]);
    } else {
      mouseX = e.clientX - divRect.left;
      mouseY = e.clientY - divRect.top;
      const xyPosition = { xPos: mouseX, yPos: mouseY };
      setXYSignature(xyPosition);
    }
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = () => setSignBtnPosition([xySignature]);
  const alertSendEmail = async () => {
    const isPlaceholderExist = signerPos.every((data) => data.placeHolder);
    if (isPlaceholderExist) {
      handleSaveTemplate();
    } else {
      setIsSendAlert(true);
    }
  };

  // `saveTemplate` is used to update template on server using savetemplate endpoint
  const saveTemplate = async () => {
    if (signersdata?.length) {
      setIsLoading({ isLoad: true, message: t("loading-mssg") });
      setIsSendAlert(false);
      let signers = [];
      if (signersdata?.length > 0) {
        signers = signersdata?.reduce((acc, x) => {
          if (x.objectId) {
            acc.push({
              __type: "Pointer",
              className: "contracts_Contactbook",
              objectId: x.objectId
            });
          }
          return acc;
        }, []);
      }
      let pdfUrl = pdfDetails[0]?.URL;
      if (pdfRotateBase64) {
        try {
          pdfUrl = await convertBase64ToFile(
            pdfDetails[0].Name,
            pdfRotateBase64
          );
        } catch (e) {
          console.log("error to convertBase64ToFile", e);
        }
      }
      try {
        const data = {
          templateId: templateId,
          Placeholders: signerPos,
          Signers: signers,
          URL: pdfUrl,
          Name: pdfDetails[0]?.Name || "",
          Note: pdfDetails[0]?.Note || "",
          Description: pdfDetails[0]?.Description || "",
          SendinOrder: pdfDetails[0]?.SendinOrder || false,
          AutomaticReminders: pdfDetails[0]?.AutomaticReminders,
          RemindOnceInEvery: parseInt(pdfDetails[0]?.RemindOnceInEvery),
          NextReminderDate: pdfDetails[0]?.NextReminderDate,
          IsEnableOTP: pdfDetails[0]?.IsEnableOTP === true ? true : false,
          IsTourEnabled: pdfDetails[0]?.IsTourEnabled === true ? true : false,
          SignatureType: signatureType
        };
        const baseURL = localStorage.getItem("baseUrl");
        const url = `${baseURL}functions/savetemplate`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          jwttoken: jwttoken
        };
        await axios.post(url, data, { headers });
        // console.log("savetemplate", res.data);
        const isSignersLinked =
          signerPos?.some((x) => !x.signerObjId) === false;
        setIsAllRolelinked(isSignersLinked);
        setIsCreateDocModal(true);
        setIsLoading({ isLoad: false });
      } catch (e) {
        setIsLoading(false);
        alert(t("something-went-wrong-mssg"));
        console.log("error", e);
      }
    } else {
      setIsReceipent(false);
    }
  };
  // `handleSaveTemplate` is used to save template based of validation
  const handleSaveTemplate = async () => {
    const isPublicTemplate = isPublic === "true";
    if (isPublicTemplate) {
      const unlinkSignerIndex = signerPos?.findIndex((x) => !x?.signerObjId);
      const unlinkSigners = signerPos?.filter((x) => !x?.signerObjId)?.length; // unLink with role
      if (unlinkSignerIndex === 0 && unlinkSigners === 1) {
        await saveTemplate();
      } else {
        setIsPublicError(true);
      }
    } else {
      await saveTemplate();
    }
  };

  const handleDontShow = (isChecked) => setIsDontShow(isChecked);

  //here you can add your messages in content and selector is key of particular steps
  const tourConfig = [
    {
      selector: '[data-tut="reactourAddbtn"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.template-placeholder-1")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      observe: '[data-tut="reactourAddbtn--observe"]',
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourFirst"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.template-placeholder-2")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" },
      action: () => handleCloseRoleModal()
    },
    {
      selector: '[data-tut="addWidgets"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.template-placeholder-3")}
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
          message={t("tour-mssg.template-placeholder-4")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="headerArea"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.template-placeholder-5")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  //function for update TourStatus
  const closeTour = async () => {
    setTemplateTour(false);
    if (isDontShow) {
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const templatetourIndex = tourStatus.findIndex(
          (obj) => obj["templateTour"] === false || obj["templateTour"] === true
        );
        if (templatetourIndex !== -1) {
          updatedTourStatus[templatetourIndex] = { templateTour: true };
        } else {
          updatedTourStatus.push({ templateTour: true });
        }
      } else {
        updatedTourStatus = [{ templateTour: true }];
      }
      try {
        const url = `${localStorage.getItem(
          "baseUrl"
        )}functions/updatetourstatus`;
        const parseAppId = localStorage.getItem("parseAppId");
        const accesstoken = localStorage.getItem("accesstoken");
        const token = jwttoken
          ? { jwttoken: jwttoken }
          : { "X-Parse-Session-Token": accesstoken };
        const data = { TourStatus: updatedTourStatus, ExtUserId: signerUserId };
        await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId,
            ...token
          }
        });
      } catch (err) {
        console.log("axios err while update tourstatus", err);
      }
    }
  };

  // `handleAddSigner` is used to open Add Role Modal
  const handleAddSigner = () => {
    setIsModalRole(true);
    setRoleName("");
  };

  // `handleAddRole` function is called when use click on add button in addRole modal
  // save Role in entry in signerList and user
  const handleAddRole = (e) => {
    e.preventDefault();
    const count = signersdata.length > 0 ? signersdata.length + 1 : 1;
    const Id = randomId();
    const index = signersdata.length;
    const obj = {
      Role: roleName || "User " + count,
      Id: Id,
      blockColor: color[index]
    };
    setSignersData((prevArr) => [...prevArr, obj]);
    const signerPosObj = {
      signerPtr: {},
      signerObjId: "",
      blockColor: color[index],
      Role: roleName || "User " + count,
      Id: Id
    };
    setSignerPos((prev) => [...prev, signerPosObj]);
    setIsModalRole(false);
    setRoleName("");
    setUniqueId(Id);
    setBlockColor(color[index]);
    setIsSelectId(index);
    setIsMailSend(false);
  };
  // `handleDeleteUser` function is used to delete record and placeholder when user click on delete which is place next user name in recipients list
  const handleDeleteUser = (Id) => {
    const updateSigner = signersdata
      .filter((x) => x.Id !== Id)
      .map((x, i) => ({ ...x, blockColor: color[i] }));
    setSignersData(updateSigner);
    const updatePlaceholderUser = signerPos
      .filter((x) => x.Id !== Id)
      .map((x, i) => ({ ...x, blockColor: color[i] }));
    const index = signersdata.findIndex((x) => x.Id === Id);
    if (index === signersdata.length - 1) {
      setUniqueId(updateSigner[updateSigner.length - 1]?.Id || "");
      setIsSelectId(index - 1 || 0);
      setBlockColor(color[index - 1 || 0]);
    } else {
      setUniqueId(updateSigner[index]?.Id || "");
      setIsSelectId(index);
      setBlockColor(color[index]);
    }

    setSignerPos(updatePlaceholderUser);
    setIsMailSend(false);
  };

  // `handleLinkUser` is used to open Add/Choose Signer Modal when user can link existing or new User with placeholder
  // and update entry in signersList
  const handleLinkUser = (id) => {
    setIsAddUser({ [id]: true });
  };
  // `handleAddUser` is used to adduser
  const handleAddUser = (data) => {
    const signerPtr = {
      __type: "Pointer",
      className: "contracts_Contactbook",
      objectId: data.objectId
    };

    const updatePlaceHolder = signerPos.map((x) => {
      if (x.Id === uniqueId) {
        return { ...x, signerPtr: signerPtr, signerObjId: data.objectId };
      }
      return { ...x };
    });
    setSignerPos(updatePlaceHolder);

    const updateSigner = signersdata.map((x) => {
      if (x.Id === uniqueId) {
        return { ...x, ...data, className: "contracts_Contactbook" };
      }
      return { ...x };
    });
    setSignersData(updateSigner);
    setIsMailSend(false);
    const index = signersdata.findIndex((x) => x.Id === uniqueId);
    setIsSelectId(index);
  };

  // `closePopup` is used to close Add/Choose signer modal
  const closePopup = () => setIsAddUser({});

  //  `handleRoleChange` function is call when user update Role name from recipients list
  const handleRoleChange = (event, roleId) => {
    // Update the role when the content changes
    const updatedRoles = signersdata.map((role) =>
      role.Id === roleId ? { ...role, Role: event.target.value } : role
    );
    setSignersData(updatedRoles);
    const updatedPlaceholder = signerPos.map((role) =>
      role.Id === roleId ? { ...role, Role: event.target.value } : role
    );
    setSignerPos(updatedPlaceholder);
    setIsMailSend(false);
  };

  //  `handleOnBlur` function is call when user click outside input box
  const handleOnBlur = (updateRole, roleId) => {
    // Update the role when the content changes
    if (!updateRole) {
      const updatedRoles = signersdata.map((role) =>
        role.Id === roleId ? { ...role, Role: roleName } : role
      );
      setSignersData(updatedRoles);
      const updatedPlaceholder = signerPos?.map((role) =>
        role.Id === roleId ? { ...role, Role: roleName } : role
      );
      setSignerPos(updatedPlaceholder);
    }
  };

  const handleEditTemplateModal = () => setIsEditTemplate(!isEditTemplate);

  const handleEditTemplateForm = (data) => {
    setIsEditTemplate(false);
    const updateTemplate = pdfDetails.map((x) => {
      return { ...x, ...data };
    });
    setPdfDetails(updateTemplate);
    setIsMailSend(false);
  };

  const handleCloseRoleModal = () => {
    setIsModalRole(false);
  };

  const handleSaveWidgetsOptions = (
    dropdownName,
    dropdownOptions,
    minCount,
    maxCount,
    isReadOnly,
    addOption,
    deleteOption,
    status,
    defaultValue,
    isHideLabel
  ) => {
    const filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
    if (filterSignerPos.length > 0) {
      const getPlaceHolder = filterSignerPos[0].placeHolder;

      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;

        const getPosData = getXYdata;
        const addSignPos = getPosData.map((position) => {
          if (position.key === signKey) {
            if (widgetType === radioButtonWidget) {
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
                    status: status,
                    defaultValue: defaultValue,
                    isReadOnly: isReadOnly || false,
                    isHideLabel: isHideLabel || false,
                    fontSize:
                      fontSize || currWidgetsDetails?.options?.fontSize || 12,
                    fontColor:
                      fontColor ||
                      currWidgetsDetails?.options?.fontColor ||
                      "black"
                  }
                };
              }
            } else if (widgetType === "checkbox") {
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
                    validation: {
                      minRequiredCount: minCount,
                      maxRequiredCount: maxCount
                    },
                    isReadOnly: isReadOnly || false,
                    defaultValue: defaultValue,
                    isHideLabel: isHideLabel || false,
                    fontSize:
                      fontSize || currWidgetsDetails?.options?.fontSize || 12,
                    fontColor:
                      fontColor ||
                      currWidgetsDetails?.options?.fontColor ||
                      "black"
                  }
                };
              }
            } else {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: dropdownName,
                  status: status,
                  values: dropdownOptions,
                  defaultValue: defaultValue,
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black"
                }
              };
            }
          }
          return position;
        });

        const newUpdateSignPos = getPlaceHolder.map((obj) => {
          if (obj.pageNumber === pageNumber) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });
        const newUpdateSigner = signerPos.map((obj) => {
          if (obj.Id === uniqueId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });

        setSignerPos(newUpdateSigner);
        if (!addOption && !deleteOption) {
          handleNameModal();
        }
      }
    }
    setFontSize();
    setFontColor();
  };

  const handleWidgetdefaultdata = (defaultdata, isSignWidget) => {
    if (isSignWidget) {
      const updatedPdfDetails = [...pdfDetails];
      const signtypes = defaultdata.signatureType || signatureType;
      updatedPdfDetails[0].SignatureType = signtypes;
      // Update the SignatureType with the modified array
      setPdfDetails(updatedPdfDetails);
      setSignatureType(signtypes);
    }
    const options = ["email", "number", "text"];
    let inputype;
    if (defaultdata.textvalidate) {
      inputype = options.includes(defaultdata.textvalidate)
        ? defaultdata.textvalidate
        : "regex";
    }

    const filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
    if (filterSignerPos.length > 0) {
      const getPlaceHolder = filterSignerPos[0].placeHolder;

      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;
        const getPosData = getXYdata;
        const addSignPos = getPosData.map((position) => {
          if (position.key === signKey) {
            if (position.type === textInputWidget) {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: defaultdata?.name || "text",
                  status: defaultdata?.status || "required",
                  hint: defaultdata?.hint || "",
                  defaultValue: defaultdata?.defaultValue || "",
                  validation:
                    isSubscribe && inputype
                      ? {
                          type: inputype,
                          pattern:
                            inputype === "regex" ? defaultdata.textvalidate : ""
                        }
                      : {},
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black"
                }
              };
            } else {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: defaultdata.name,
                  status: defaultdata.status,
                  defaultValue: defaultdata.defaultValue,
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black"
                }
              };
            }
          }
          return position;
        });

        const newUpdateSignPos = getPlaceHolder.map((obj) => {
          if (obj.pageNumber === pageNumber) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });
        const newUpdateSigner = signerPos.map((obj) => {
          if (obj.Id === uniqueId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });
        setSignerPos(newUpdateSigner);
      }
    }
    setFontSize();
    setFontColor();
    setCurrWidgetsDetails({});
    handleNameModal();
  };

  const handleNameModal = () => {
    setIsNameModal(false);
    setCurrWidgetsDetails({});
    setShowDropdown(false);
    setIsRadio(false);
    setIsCheckbox(false);
  };

  const clickOnZoomIn = () => {
    onClickZoomIn(scale, zoomPercent, setScale, setZoomPercent);
  };
  const clickOnZoomOut = () => {
    onClickZoomOut(zoomPercent, scale, setZoomPercent, setScale);
  };
  //`handleRotationFun` function is used to roatate pdf particular page
  const handleRotationFun = async (rotateDegree) => {
    const isRotate = handleRotateWarning(signerPos, pageNumber);
    if (isRotate) {
      setIsRotate({ status: true, degree: rotateDegree });
    } else {
      const urlDetails = await rotatePdfPage(
        pdfDetails[0].URL,
        rotateDegree,
        pageNumber - 1,
        pdfRotateBase64
      );
      setPdfRotatese64(urlDetails.base64);
    }
  };
  const handleRemovePlaceholder = async () => {
    handleRemoveWidgets(setSignerPos, signerPos, pageNumber, setIsRotate);
    const urlDetails = await rotatePdfPage(
      pdfDetails[0].URL,
      isRotate.degree,
      pageNumber - 1,
      pdfRotateBase64
    );
    setPdfRotatese64(urlDetails.base64);
  };
  // `handleQuickSendClose` is trigger when bulk send component trigger close event
  const handleQuickSendClose = (status, count) => {
    if (status === "success") {
      setIsCreateDocModal(false);
      if (count > 1) {
        setIsAlert({
          type: "success",
          msg: count + " " + t("document-sent-alert")
        });
        setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      } else {
        setIsAlert({
          type: "success",
          msg: count + " " + t("document-sent-alert")
        });
        setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      }
    } else {
      setIsAlert({
        type: "danger",
        message: t("something-went-wrong-mssg")
      });
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
    }
  };
  const handleGeneratePublic = async () => {
    const unlinkSignerIndex = signerPos?.findIndex((x) => !x?.signerObjId);
    const unlinkSigners = signerPos?.filter((x) => !x?.signerObjId)?.length; // count of total unlink roles
    if (unlinkSignerIndex === 0 && unlinkSigners === 1) {
      try {
        const role = signerPos[unlinkSignerIndex]?.Role;
        const data = { templateId: templateId, IsPublic: true, Role: role };
        const baseURL = localStorage.getItem("baseUrl");
        const url = `${baseURL}functions/updatetopublictemplate`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          jwttoken: jwttoken
        };
        await axios.post(url, data, { headers });
        // console.log("updatetopublictemplate", res.data);
        setIsPublic("true");
      } catch (e) {
        alert(t("something-went-wrong-mssg"));
        console.log("error", e);
      }
    } else {
      setIsPublicError(true);
    }
  };
  const copytoclipboard = (publicUrl) => {
    copytoData(publicUrl);
    setIsAlert({ type: "success", msg: t("copied") });
    setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500); // Reset copied state after 1.5 seconds
  };

  // `handleSendDocument` is trigger when users are linked to all role
  const handleSendDocument = async () => {
    setIsLoading({ isLoad: true, message: t("loading-mssg") });
    const signers = signersdata?.filter((x) => x.objectId) || [];
    let pdfUrl = pdfDetails[0]?.URL;
    if (pdfRotateBase64) {
      try {
        pdfUrl = await convertBase64ToFile(pdfDetails[0].Name, pdfRotateBase64);
      } catch (e) {
        console.log("error to convertBase64ToFile", e);
      }
    }
    let template = pdfDetails[0];
    template.URL = pdfUrl;
    template.Signers = signers;
    template.Placeholders = signerPos;
    template.SignatureType = signatureType;
    const Documents = [template];
    const token = jwttoken
      ? { jwttoken: jwttoken }
      : { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      ...token
    };
    const functionsUrl = `${localStorage.getItem(
      "baseUrl"
    )}functions/batchdocuments`;
    const params = { Documents: JSON.stringify(Documents) };
    try {
      const res = await axios.post(functionsUrl, params, { headers: headers });
      if (res.data && res.data.result === "success") {
        setIsAlert({
          type: "success",
          msg: Documents?.length + " " + t("document-sent-alert")
        });
      }
    } catch (err) {
      console.log("err in send document ", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
    } finally {
      setIsLoading({ isLoad: false });
      setIsCreateDocModal(false);
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
    }
  };
  //function show signer list and share link to share signUrl
  const handlePublicShare = () => {
    let publicUrl;
    if (isStaging) {
      publicUrl = `https://staging.opensign.me/publicsign?templateid=${templateId}`;
    } else {
      publicUrl = `https://opensign.me/publicsign?templateid=${templateId}`;
    }
    return (
      <div className="flex flex-row justify-between items-center mb-1 mx-1">
        <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">
          {publicUrl}
        </span>
        <div className="flex flex-row items-center gap-3 ">
          <button
            onClick={() => copytoclipboard(publicUrl)}
            type="button"
            className="flex flex-row items-center op-link op-link-primary"
          >
            <i className="fa-light fa-copy" />
            <span className="hidden md:block ml-1 ">{t("copy-link")}</span>
          </button>
          <RWebShare data={{ url: publicUrl, title: t("sign-url") }}>
            <i className="fa-light fa-share-from-square op-link op-link-secondary no-underline"></i>
          </RWebShare>
        </div>
      </div>
    );
  };

  return (
    <>
      <Title title={"Template"} />
      {isAlert.msg && <Alert type={isAlert.type}>{isAlert.msg}</Alert>}
      <DndProvider backend={HTML5Backend}>
        {isLoading.isLoad ? (
          <LoaderWithMsg isLoading={isLoading} />
        ) : isSubscriptionExpired ? (
          <ModalUi
            title={t("subscription-expired")}
            isOpen={isSubscriptionExpired}
            showClose={false}
          >
            <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
              <p className="text-sm md:text-lg font-normal">
                {t("owner-subscription-expired")}
              </p>
            </div>
          </ModalUi>
        ) : handleError ? (
          <HandleError handleError={handleError} />
        ) : (
          <div>
            <div className="relative op-card overflow-hidden flex flex-col md:flex-row justify-between bg-base-300">
              {/* this component used for UI interaction and show their functionality */}
              {!checkTourStatus && (
                //this tour component used in your html component where you want to put
                //onRequestClose function to close tour
                //steps is defined what will be your messages and style also
                //isOpen is takes boolean value to open
                <Tour
                  onRequestClose={closeTour}
                  steps={tourConfig}
                  isOpen={templateTour}
                  rounded={5}
                  closeWithMask={false}
                />
              )}
              {isAddRole && (
                <Tour
                  onRequestClose={() => setIsAddRole(false)}
                  steps={tourAddRole}
                  isOpen={isAddRole}
                  rounded={5}
                  closeWithMask={false}
                />
              )}
              {/* this component used to render all pdf pages in left side */}
              <RenderAllPdfPage
                signPdfUrl={pdfDetails[0].URL}
                allPages={allPages}
                setAllPages={setAllPages}
                setPageNumber={setPageNumber}
                setSignBtnPosition={setSignBtnPosition}
                pageNumber={pageNumber}
              />

              {/* pdf render view */}
              <div className=" w-full md:w-[57%] flex mr-4">
                <PdfZoom
                  clickOnZoomIn={clickOnZoomIn}
                  clickOnZoomOut={clickOnZoomOut}
                  handleRotationFun={handleRotationFun}
                />
                <div className="w-full md:w-[95%]">
                  {/* this modal is used show alert set placeholder for all signers before send mail */}
                  <ModalUi
                    isOpen={isSendAlert}
                    title={t("fields-required")}
                    handleClose={() => setIsSendAlert(false)}
                  >
                    <div className="h-full p-[20px]">
                      <p>{t("template-signature-field")}</p>
                    </div>
                  </ModalUi>
                  <ModalUi
                    isOpen={!IsReceipent}
                    title={t("roles")}
                    handleClose={() => setIsReceipent(true)}
                  >
                    <div className="h-full p-[20px] text-center font-medium">
                      <p>{t("template-role-alert")}</p>
                    </div>
                  </ModalUi>
                  {/* this modal is used show send mail message and after send mail success message */}
                  {isCreateDocModal && (
                    <ModalUi
                      isOpen
                      title={isAllRoleLinked ? "Send Document" : "Bulk send"}
                      handleClose={() => setIsCreateDocModal(false)}
                    >
                      {isAllRoleLinked ? (
                        <div className="px-[20px] pb-3">
                          <div className="mb-3 mt-2 text-base">
                            Are you sure want to send document?
                          </div>
                          <div className="flex flex-row gap-2">
                            <button
                              className="op-btn op-btn-primary w-[80px]"
                              onClick={() => handleSendDocument()}
                            >
                              Yes
                            </button>
                            <button
                              className="op-btn op-btn-secondary w-[80px]"
                              onClick={() => setIsCreateDocModal(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <BulkSendUi
                            signatureType={signatureType}
                            Placeholders={signerPos}
                            item={pdfDetails?.[0]}
                            handleClose={handleQuickSendClose}
                            jwttoken={jwttoken}
                          />
                          {isPublic !== "false" && (
                            <div className="px-[20px] pb-3">
                              <div className="flex justify-center items-center mt-3">
                                <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                                <span className="ml-[5px] mr-[5px]">
                                  {t("or")}
                                </span>
                                <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                              </div>
                              <div className="my-3 ">
                                <h3 className="text-base-content font-bold text-lg pb-[15px]">
                                  Copy/share signing link
                                </h3>

                                {isPublic === "undefined" ? (
                                  <button
                                    className="op-btn op-btn-secondary w-full"
                                    onClick={() => handleGeneratePublic()}
                                  >
                                    Generate Public Link
                                  </button>
                                ) : (
                                  handlePublicShare()
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </ModalUi>
                  )}
                  <ModalUi
                    isOpen={isPublicErr}
                    handleClose={() => setIsPublicError(false)}
                  >
                    <div className="m-4">
                      <p>
                        To make your template public, it must either contain a
                        single role, or, if it includes multiple roles, all
                        additional roles must already be assigned to signers.
                        The unassigned public role should remain empty and must
                        be placed in the first position.{" "}
                      </p>
                      <p>Visit below link to know more - </p>
                      <p
                        className="op-link op-link-primary"
                        onClick={() =>
                          copytoclipboard(
                            "https://docs.opensignlabs.com/docs/help/Templates/publicTemplate"
                          )
                        }
                      >
                        https://docs.opensignlabs.com/docs/help/Templates/publicTemplate
                      </p>
                    </div>
                  </ModalUi>
                  <ModalUi
                    isOpen={isShowEmail}
                    title={t("signers-alert")}
                    handleClose={() => setIsShowEmail(false)}
                  >
                    <div className="h-full p-[20px]">
                      <p>{t("template-creation-alert-1")}</p>
                      <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                      <button
                        onClick={() => setIsShowEmail(false)}
                        type="button"
                        className="op-btn op-btn-primary"
                      >
                        {t("ok")}
                      </button>
                    </div>
                  </ModalUi>
                  <DropdownWidgetOption
                    type={radioButtonWidget}
                    title={t("radio-group")}
                    showDropdown={isRadio}
                    setShowDropdown={setIsRadio}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontColor={fontColor}
                    setFontColor={setFontColor}
                  />
                  <DropdownWidgetOption
                    type="checkbox"
                    title={t("checkbox")}
                    showDropdown={isCheckbox}
                    setShowDropdown={setIsCheckbox}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontColor={fontColor}
                    setFontColor={setFontColor}
                  />
                  <DropdownWidgetOption
                    type="dropdown"
                    title={t("dropdown-options")}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontColor={fontColor}
                    setFontColor={setFontColor}
                  />
                  <PlaceholderCopy
                    isPageCopy={isPageCopy}
                    setIsPageCopy={setIsPageCopy}
                    xyPostion={signerPos}
                    setXyPostion={setSignerPos}
                    allPages={allPages}
                    pageNumber={pageNumber}
                    signKey={signKey}
                    Id={uniqueId}
                  />
                  {/* pdf header which contain funish back button */}
                  <Header
                    completeBtnTitle={t("send")}
                    disabledBackBtn={true}
                    isPlaceholder={true}
                    pageNumber={pageNumber}
                    allPages={allPages}
                    changePage={changePage}
                    pdfDetails={pdfDetails}
                    signerPos={signerPos}
                    signersdata={signersdata}
                    isMailSend={isMailSend}
                    alertSendEmail={alertSendEmail}
                    isShowHeader={true}
                    currentSigner={true}
                    setIsEditTemplate={handleEditTemplateModal}
                    dataTut4="reactourFour"
                    handleRotationFun={handleRotationFun}
                    clickOnZoomIn={clickOnZoomIn}
                    clickOnZoomOut={clickOnZoomOut}
                  />
                  <div
                    ref={divRef}
                    data-tut="reactourThird"
                    className="h-[95%]"
                  >
                    {containerWH && (
                      <RenderPdf
                        pageNumber={pageNumber}
                        pdfNewWidth={pdfNewWidth}
                        pdfDetails={pdfDetails}
                        signerPos={signerPos}
                        successEmail={false}
                        numPages={numPages}
                        pageDetails={pageDetails}
                        placeholder={true}
                        drop={drop}
                        handleDeleteSign={handleDeleteSign}
                        handleTabDrag={handleTabDrag}
                        handleStop={handleStop}
                        setPdfLoad={setPdfLoad}
                        pdfLoad={pdfLoad}
                        setSignerPos={setSignerPos}
                        containerWH={containerWH}
                        setIsResize={setIsResize}
                        setZIndex={setZIndex}
                        handleLinkUser={handleLinkUser}
                        setUniqueId={setUniqueId}
                        signersdata={signersdata}
                        setIsPageCopy={setIsPageCopy}
                        setSignKey={setSignKey}
                        isDragging={isDragging}
                        setShowDropdown={setShowDropdown}
                        setCurrWidgetsDetails={setCurrWidgetsDetails}
                        setWidgetType={setWidgetType}
                        setIsRadio={setIsRadio}
                        setSelectWidgetId={setSelectWidgetId}
                        selectWidgetId={selectWidgetId}
                        setIsCheckbox={setIsCheckbox}
                        handleNameModal={setIsNameModal}
                        pdfOriginalWH={pdfOriginalWH}
                        setScale={setScale}
                        scale={scale}
                        setIsSelectId={setIsSelectId}
                        pdfRotateBase64={pdfRotateBase64}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        fontColor={fontColor}
                        setFontColor={setFontColor}
                        isResize={isResize}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* signature button */}
              {isMobile ? (
                <div>
                  <WidgetComponent
                    dataTut2="reactourSecond"
                    pdfUrl={isMailSend}
                    dragSignature={dragSignature}
                    signRef={signRef}
                    handleDivClick={handleDivClick}
                    handleMouseLeave={handleMouseLeave}
                    isDragSign={isDragSign}
                    dragStamp={dragStamp}
                    dragRef={dragRef}
                    isDragStamp={isDragStamp}
                    isSignYourself={false}
                    addPositionOfSignature={addPositionOfSignature}
                    signerPos={signerPos}
                    signersdata={signersdata}
                    isSelectListId={isSelectListId}
                    setIsSelectId={setIsSelectId}
                    isSigners={isSigners}
                    setIsShowEmail={setIsShowEmail}
                    isMailSend={isMailSend}
                    setSelectedEmail={setSelectedEmail}
                    selectedEmail={selectedEmail}
                    handleAddSigner={handleAddSigner}
                    setUniqueId={setUniqueId}
                    setRoleName={setRoleName}
                    handleDeleteUser={handleDeleteUser}
                    handleRoleChange={handleRoleChange}
                    handleOnBlur={handleOnBlur}
                    title={t("roles")}
                    initial={true}
                    isTemplateFlow={true}
                    sendInOrder={pdfDetails[0].SendinOrder}
                    setSignersData={setSignersData}
                    blockColor={blockColor}
                    setBlockColor={setBlockColor}
                  />
                </div>
              ) : (
                <div className="w-[23%] bg-base-100 min-h-screen overflow-y-auto hide-scrollbar">
                  <div className="max-h-screen">
                    <SignerListPlace
                      isMailSend={isMailSend}
                      signerPos={signerPos}
                      setSignerPos={setSignerPos}
                      signersdata={signersdata}
                      isSelectListId={isSelectListId}
                      setRoleName={setRoleName}
                      setIsSelectId={setIsSelectId}
                      handleAddSigner={handleAddSigner}
                      setUniqueId={setUniqueId}
                      handleDeleteUser={handleDeleteUser}
                      handleRoleChange={handleRoleChange}
                      handleOnBlur={handleOnBlur}
                      title={t("roles")}
                      sendInOrder={pdfDetails[0]?.SendinOrder}
                      setSignersData={setSignersData}
                      blockColor={blockColor}
                      setBlockColor={setBlockColor}
                      uniqueId={uniqueId}
                    />
                    <div data-tut="addWidgets">
                      <WidgetComponent
                        isMailSend={isMailSend}
                        dragSignature={dragSignature}
                        signRef={signRef}
                        handleDivClick={handleDivClick}
                        handleMouseLeave={handleMouseLeave}
                        isDragSign={isDragSign}
                        dragStamp={dragStamp}
                        dragRef={dragRef}
                        isDragStamp={isDragStamp}
                        isSignYourself={false}
                        addPositionOfSignature={addPositionOfSignature}
                        title={t("roles")}
                        initial={true}
                        isTemplateFlow={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div data-tut="reactourAddbtn--observe">
          <AddRoleModal
            isModalRole={isModalRole}
            roleName={roleName}
            signersdata={signersdata}
            setRoleName={setRoleName}
            handleAddRole={handleAddRole}
            handleCloseRoleModal={handleCloseRoleModal}
          />
        </div>
        <div>
          <LinkUserModal
            handleAddUser={handleAddUser}
            isAddUser={isAddUser}
            uniqueId={uniqueId}
            closePopup={closePopup}
            signersData={signersdata}
            jwttoken={jwttoken}
          />
        </div>
        <ModalUi
          title={t("edit-template")}
          isOpen={isEditTemplate}
          handleClose={handleEditTemplateModal}
        >
          <EditTemplate
            template={pdfDetails?.[0]}
            onSuccess={handleEditTemplateForm}
            jwttoken={jwttoken}
          />
        </ModalUi>
        <WidgetNameModal
          signatureType={signatureType}
          widgetName={widgetName}
          defaultdata={currWidgetsDetails}
          isOpen={isNameModal}
          handleClose={handleNameModal}
          handleData={handleWidgetdefaultdata}
          isSubscribe={isSubscribe}
          isTextSetting={isTextSetting}
          setIsTextSetting={setIsTextSetting}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontColor={fontColor}
          setFontColor={setFontColor}
        />
        <RotateAlert
          isRotate={isRotate.status}
          setIsRotate={setIsRotate}
          handleRemoveWidgets={handleRemovePlaceholder}
        />
      </DndProvider>
    </>
  );
};

export default DraftTemplate;
