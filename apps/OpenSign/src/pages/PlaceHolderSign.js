import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Parse from "parse";
import "../styles/signature.css";
import { PDFDocument } from "pdf-lib";
import { isEnableSubscription, themeColor } from "../constant/const";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import WidgetComponent from "../components/pdf/WidgetComponent";
import Tour from "reactour";
import { useLocation, useParams } from "react-router-dom";
import SignerListPlace from "../components/pdf/SignerListPlace";
import Header from "../components/pdf/PdfHeader";
import { RWebShare } from "react-web-share";
import {
  pdfNewWidthFun,
  contractDocument,
  contractUsers,
  addZIndex,
  randomId,
  defaultWidthHeight,
  multiSignEmbed,
  addWidgetOptions,
  textInputWidget,
  textWidget,
  radioButtonWidget,
  color,
  getTenantDetails,
  replaceMailVaribles,
  copytoData,
  fetchSubscription,
  convertPdfArrayBuffer,
  getContainerScale,
  convertBase64ToFile,
  onClickZoomIn,
  onClickZoomOut,
  rotatePdfPage,
  handleRemoveWidgets,
  handleRotateWarning
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import { useNavigate } from "react-router-dom";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import Title from "../components/Title";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import { SaveFileSize } from "../constant/saveFileSize";
import { EmailBody } from "../components/pdf/EmailBody";
import { useSelector } from "react-redux";
import PdfZoom from "../components/pdf/PdfZoom";
import { useTranslation } from "react-i18next";
import RotateAlert from "../components/RotateAlert";
import Loader from "../primitives/Loader";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import LinkUserModal from "../primitives/LinkUserModal";
import QuotaCard from "../primitives/QuotaCard";
import LottieWithLoader from "../primitives/DotLottieReact";
import Alert from "../primitives/Alert";
import Upgrade from "../primitives/Upgrade";

function PlaceHolderSign() {
  const { t } = useTranslation();
  const editorRef = useRef();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isMailSend, setIsMailSend] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const [dragKey, setDragKey] = useState();
  const [signersdata, setSignersData] = useState([]);
  const [signerPos, setSignerPos] = useState([]);
  const [isSelectListId, setIsSelectId] = useState();
  const [isSendAlert, setIsSendAlert] = useState({});
  const [isSend, setIsSend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAddSigner, setIsAddSigner] = useState(false);
  const [fontSize, setFontSize] = useState();
  const [fontColor, setFontColor] = useState();
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [handleError, setHandleError] = useState();
  const [currentId, setCurrentId] = useState("");
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [placeholderTour, setPlaceholderTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [containerWH, setContainerWH] = useState();
  const { docId } = useParams();
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const divRef = useRef(null);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const [signKey, setSignKey] = useState();
  const [tempSignerId, setTempSignerId] = useState("");
  const [blockColor, setBlockColor] = useState("");
  const [defaultBody, setDefaultBody] = useState("");
  const [defaultSubject, setDefaultSubject] = useState("");
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [signerExistModal, setSignerExistModal] = useState(false);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isRadio, setIsRadio] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState({});
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [isNameModal, setIsNameModal] = useState(false);
  const [widgetName, setWidgetName] = useState(false);
  const [mailStatus, setMailStatus] = useState("");
  const [isCurrUser, setIsCurrUser] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [requestSubject, setRequestSubject] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState("");
  const isHeader = useSelector((state) => state.showHeader);
  const [activeMailAdapter, setActiveMailAdapter] = useState("");
  const [isRotate, setIsRotate] = useState({
    status: false,
    degree: 0
  });
  const [isAlreadyPlace, setIsAlreadyPlace] = useState({
    status: false,
    message: ""
  });
  const [extUserId, setExtUserId] = useState("");
  const [isCustomize, setIsCustomize] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [pdfRotateBase64, setPdfRotatese64] = useState("");
  const [planCode, setPlanCode] = useState("");
  const isMobile = window.innerWidth < 767;
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  const [{ isDragSign }, dragSignature] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 1, text: "signature" },
    collect: (monitor) => ({
      isDragSign: !!monitor.isDragging()
    })
  });
  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 2, text: "stamp" },
    collect: (monitor) => ({
      isDragStamp: !!monitor.isDragging()
    })
  });
  const documentId = docId;
  useEffect(() => {
    if (documentId) {
      getDocumentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function to fetch tenant Details
  const fetchTenantDetails = async () => {
    const user = JSON.parse(
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    );
    if (user) {
      try {
        const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team OpenSign™</p><br>`;
        const defaultSubject = `{{sender_name}} has requested you to sign {{document_title}}`;
        setDefaultBody(defaultRequestBody);
        setDefaultSubject(defaultSubject);
        setRequestBody(defaultRequestBody);
        setRequestSubject(defaultSubject);
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          if (tenantDetails?.RequestBody) {
            setRequestBody(tenantDetails?.RequestBody);
            setRequestSubject(tenantDetails?.RequestSubject);
          }
        }
      } catch (e) {
        alert(t("user-not-exist"));
      }
    } else {
      alert(t("user-not-exist"));
    }
  };

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
    navigate("/subscription");
  };
  async function checkIsSubscribed() {
    const res = await fetchSubscription();
    const plan = res.plan;
    const billingDate = res.billingDate;
    setPlanCode(plan);
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
  //function for get document details
  const getDocumentDetails = async () => {
    fetchTenantDetails();
    //getting document details
    const documentData = await contractDocument(documentId);
    if (documentData && documentData.length > 0) {
      const url = documentData[0] && documentData[0]?.URL;
      //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
      const arrayBuffer = await convertPdfArrayBuffer(url);
      if (arrayBuffer === "Error") {
        setHandleError(t("something-went-wrong-mssg"));
      } else {
        setPdfArrayBuffer(arrayBuffer);
      }
      setExtUserId(documentData[0]?.ExtUserPtr?.objectId);
      if (isEnableSubscription) {
        checkIsSubscribed(documentData[0]?.ExtUserPtr?.Email);
      }
      const alreadyPlaceholder = documentData[0]?.SignedUrl;
      // Check if document is sent for signing
      if (alreadyPlaceholder) {
        // Check if the document is completed
        const isCompleted =
          documentData[0].IsCompleted && documentData[0]?.IsCompleted;
        // Get the expiration date of the document
        const expireDate = documentData[0].ExpiryDate.iso;
        // Check if the document has been declined
        const declined =
          documentData[0].IsDeclined && documentData[0]?.IsDeclined;
        // Get the expiration update date in milliseconds
        const expireUpdateDate = new Date(expireDate).getTime();
        // Get the current date in milliseconds
        const currDate = new Date().getTime();
        if (isCompleted) {
          // If document is completed
          setIsAlreadyPlace({
            status: true,
            message: t("document-signed-alert-5")
          });
        } else if (declined) {
          // If document has been declined
          setIsAlreadyPlace({
            status: true,
            message: t("document-signed-alert-6")
          });
        } else if (currDate > expireUpdateDate) {
          // If document has expired
          setIsAlreadyPlace({
            status: true,
            message: t("document-signed-alert-7")
          });
        } else {
          // If document is dispatched for signing
          setIsAlreadyPlace({
            status: true,
            message: t("document-signed-alert-8")
          });
        }
      }
      setPdfDetails(documentData);
      //condition when placeholder have empty array with role details and signers array have signers data
      //and both array length are same
      //this case happen using placeholder form in auto save funtionality to save draft type document without adding any placehlder
      if (
        documentData[0]?.Placeholders?.length ===
        documentData[0]?.Signers?.length
      ) {
        const signersArr = documentData[0].Signers;
        const placeholder = documentData[0].Placeholders;
        const updatedSigners = signersArr.map((x, index) => ({
          ...x,
          Id: placeholder[index]?.Id,
          Role: placeholder[index]?.Role,
          blockColor: placeholder[index]?.blockColor
        }));
        setSignerPos(placeholder);
        setSignersData(updatedSigners);
        setIsSelectId(0);
        setUniqueId(placeholder[0].Id);
        setBlockColor(placeholder[0].blockColor);
      }
      //else condition when signers array have some signer's data
      //this case happen using placeholder form and load first time
      else if (documentData[0].Signers && documentData[0].Signers.length > 0) {
        const currEmail = documentData[0].ExtUserPtr.Email;
        setCurrentId(currEmail);
        setIsSelectId(0);
        //if condition when placeholder array present then update signers local array according to placeholder length
        if (
          documentData[0].Placeholders &&
          documentData[0].Placeholders.length > 0
        ) {
          setSignerPos(documentData[0].Placeholders);
          let signers = [...documentData[0].Signers];
          const placeholder = documentData[0]?.Placeholders.filter(
            (data) => data.Role !== "prefill"
          );
          let updatedSigners = placeholder.map((x) => {
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
          //else condition when signers length present but placeholder empty then
          //update signers array with add role,id and add empty object in placeholder with signers details
          //in placeholder array
          const updatedSigners = documentData[0].Signers.map((x, index) => ({
            ...x,
            Id: randomId(),
            // Role: "User " + (index + 1),
            blockColor: color[index % color.length]
          }));
          setSignersData(updatedSigners);
          const updatedPlaceholder = documentData[0].Signers.map((x, index) => {
            return {
              // Role: updatedSigners[index].Role,
              Id: updatedSigners[index].Id,
              blockColor: color[index % color.length],
              signerPtr: {
                __type: "Pointer",
                className: x?.className || "contracts_Contactbook",
                objectId: x?.objectId
              },
              signerObjId: x?.objectId
            };
          });

          setSignerPos(updatedPlaceholder);
          setSignersData(updatedSigners);
          setUniqueId(updatedSigners[0].Id);
          setBlockColor(updatedSigners[0].blockColor);
        }
      } else {
        //when user create document using template where signers data not present and only placeholders present
        //else condition when signers array is empty then check placeholders array length
        //if placeholders have some data then update signers data according to placeholders length
        // setRoleName("User 1");
        if (
          documentData[0].Placeholders &&
          documentData[0].Placeholders.length > 0
        ) {
          const placeholder = documentData[0]?.Placeholders.filter(
            (data) => data.Role !== "prefill"
          );
          let updatedSigners = placeholder.map((x) => {
            return { Role: x.Role, Id: x.Id, blockColor: x.blockColor };
          });
          setSignerPos(documentData[0].Placeholders);
          setSignersData(updatedSigners);
          setIsSelectId(0);
          setUniqueId(updatedSigners[0].Id);
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
    const res = await contractUsers();
    if (res === "Error: Something went wrong!") {
      setHandleError(t("something-went-wrong-mssg"));
      setIsLoading({ isLoad: false });
    } else if (res.length && res[0]?.objectId) {
      setActiveMailAdapter(res[0]?.active_mail_adapter);
      setSignerUserId(res[0].objectId);
      const tourstatus = res[0].TourStatus && res[0].TourStatus;
      const alreadyPlaceholder = documentData[0]?.SignedUrl;
      if (alreadyPlaceholder) {
        setCheckTourStatus(true);
      } else if (tourstatus && tourstatus.length > 0) {
        setTourStatus(tourstatus);
        const checkTourRecipients = tourstatus.filter(
          (data) => data.placeholder
        );
        if (checkTourRecipients && checkTourRecipients.length > 0) {
          setCheckTourStatus(checkTourRecipients[0].placeholder);
        }
      }
      setIsLoading({ isLoad: false });
    } else if (res.length === 0) {
      setHandleError(t("no-data-avaliable"));
      setIsLoading({ isLoad: false });
    }
  };

  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    getSignerPos(item, monitor);
  };
  const getSignerPos = (item, monitor) => {
    if (uniqueId) {
      const posZIndex = zIndex + 1;
      setZIndex(posZIndex);
      const signer = signersdata.find((x) => x.Id === uniqueId);
      const key = randomId();
      const containerScale = getContainerScale(
        pdfOriginalWH,
        pageNumber,
        containerWH
      );
      let dropData = [];
      let placeHolder;
      const dragTypeValue = item?.text ? item.text : monitor.type;
      const widgetWidth = defaultWidthHeight(dragTypeValue).width;
      const widgetHeight = defaultWidthHeight(dragTypeValue).height;
      //adding and updating drop position in array when user drop signature button in div
      if (item === "onclick") {
        const divHeight = divRef.current.getBoundingClientRect().height;
        // `getBoundingClientRect()` is used to get accurate measurement height of the div
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
        //This method returns the offset of the current pointer (mouse) position relative to the client viewport.
        const containerRect = document
          .getElementById("container")
          .getBoundingClientRect();
        //`containerRect.left`,  The distance from the left of the viewport to the left side of the element.
        //`containerRect.top` The distance from the top of the viewport to the top of the element.
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
          zIndex: posZIndex,
          type: dragTypeValue,
          options: addWidgetOptions(dragTypeValue),
          Width: widgetWidth / (containerScale * scale),
          Height: widgetHeight / (containerScale * scale)
        };
        dropData.push(dropObj);
        placeHolder = { pageNumber: pageNumber, pos: dropData };
      }
      setSelectWidgetId(key);
      if (signer) {
        let filterSignerPos, currentPagePosition;
        if (dragTypeValue === textWidget) {
          filterSignerPos = signerPos.find((data) => data.Role === "prefill");
        } else {
          filterSignerPos = signerPos.find((data) => data.Id === uniqueId);
        }
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
          let updatesignerPos;
          if (dragTypeValue === textWidget) {
            updatesignerPos = signerPos.map((x) =>
              x.Role === "prefill" ? { ...x, placeHolder: updatePlace } : x
            );
          } else {
            updatesignerPos = signerPos.map((x) =>
              x.Id === uniqueId ? { ...x, placeHolder: updatePlace } : x
            );
          }
          setSignerPos(updatesignerPos);
        } else {
          let updatesignerPos;
          //if condition when widget type is prefill label text widget
          if (dragTypeValue === textWidget) {
            const prefileTextWidget = {
              signerPtr: {},
              signerObjId: "",
              blockColor: "#f58f8c",
              placeHolder: [placeHolder],
              Role: "prefill",
              Id: key
            };
            signerPos.push(prefileTextWidget);
            setSignerPos(signerPos);
          } else {
            //else condition to add placeholder widgets on multiple page first time
            updatesignerPos = signerPos.map((x) =>
              x.Id === uniqueId && x?.placeHolder
                ? { ...x, placeHolder: [...x.placeHolder, placeHolder] }
                : x.Id === uniqueId
                  ? { ...x, placeHolder: [placeHolder] }
                  : x
            );
            setSignerPos(updatesignerPos);
          }
        }

        if (dragTypeValue === "dropdown") {
          setShowDropdown(true);
        } else if (dragTypeValue === "checkbox") {
          setIsCheckbox(true);
        } else if (
          [
            textInputWidget,
            textWidget,
            "name",
            "company",
            "job title",
            "email"
          ].includes(dragTypeValue)
        ) {
          setFontSize(12);
          setFontColor("black");
        } else if (dragTypeValue === radioButtonWidget) {
          setIsRadio(true);
        }
        setWidgetType(dragTypeValue);
        setSignKey(key);
        setCurrWidgetsDetails({});
        setWidgetName(dragTypeValue);
      }
    }
  };

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
      const signId = signerId ? signerId : uniqueId; //? signerId : signerObjId;
      const keyValue = key ? key : dragKey;
      const containerScale = getContainerScale(
        pdfOriginalWH,
        pageNumber,
        containerWH
      );
      if (keyValue >= 0) {
        let filterSignerPos;
        if (signId) {
          filterSignerPos = updateSignPos.filter((data) => data.Id === signId);
        } else {
          filterSignerPos = updateSignPos.filter(
            (data) => data.Role === "prefill"
          );
        }

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
              if (signId) {
                if (obj.Id === signId) {
                  return { ...obj, placeHolder: newUpdateSignPos };
                }
              } else {
                if (obj.Role === "prefill") {
                  return { ...obj, placeHolder: newUpdateSignPos };
                }
              }
              return obj;
            });
            setSignerPos(newUpdateSigner);
          }
        }
      }
    }
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
        //condition to check on same has multiple widgets so do not delete all widgets
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
      setXYSignature({ xPos: mouseX, yPos: mouseY });
    }
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = () => {
    setSignBtnPosition([xySignature]);
  };
  //embed prefill label widget data
  const embedPrefilllData = async () => {
    const prefillExist = signerPos.filter((data) => data.Role === "prefill");
    if (prefillExist && prefillExist.length > 0) {
      const placeholder = prefillExist[0].placeHolder;
      const existingPdfBytes = pdfArrayBuffer;
      const pdfDoc = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true
      });
      const isSignYourSelfFlow = false;
      try {
        const pdfBase64 = await multiSignEmbed(
          placeholder,
          pdfDoc,
          isSignYourSelfFlow,
          scale,
          pdfOriginalWH,
          containerWH
        );
        const pdfUrl = await convertBase64ToFile(pdfDetails[0].Name, pdfBase64);
        const tenantId = localStorage.getItem("TenantId");
        const buffer = atob(pdfBase64);
        SaveFileSize(buffer.length, pdfUrl, tenantId);
        return pdfUrl;
      } catch (e) {
        console.log("error to convertBase64ToFile in placeholder flow", e);
      }
    } else if (pdfRotateBase64) {
      try {
        const pdfUrl = await convertBase64ToFile(
          pdfDetails[0].Name,
          pdfRotateBase64
        );
        const tenantId = localStorage.getItem("TenantId");
        const buffer = atob(pdfRotateBase64);
        SaveFileSize(buffer.length, pdfUrl, tenantId);
        return pdfUrl;
      } catch (e) {
        console.log("error to convertBase64ToFile in placeholder flow", e);
      }
    } else {
      return pdfDetails[0].URL;
    }
  };
  const alertSendEmail = async () => {
    const filterPrefill = signerPos?.filter((data) => data.Role !== "prefill");
    const getPrefill = signerPos?.filter((data) => data.Role === "prefill");
    let isLabel = false;
    //checking all signers placeholder exist or not
    const isPlaceholderExist = filterPrefill.every((data) => data.placeHolder);
    const prefillPlaceholder = getPrefill[0]?.placeHolder;
    //condition is used to check text widget data is empty or have response
    if (getPrefill && getPrefill.length > 0) {
      if (prefillPlaceholder) {
        prefillPlaceholder.map((data) => {
          if (!isLabel) {
            isLabel = data.pos.some((position) => !position.options.response);
          }
        });
      }
    }
    let isSignatureExist = true; // variable is used to check a signature widget exit or not then execute other code
    if (isPlaceholderExist) {
      //for loop is used to check signature widget exist or not
      for (let item of filterPrefill) {
        let signatureExist = false; // Reset for each iteration
        for (let x of item.placeHolder) {
          if (!signatureExist) {
            const typeExist = x.pos.some((data) => data?.type);
            if (typeExist) {
              signatureExist = x.pos.some((data) => data?.type === "signature");
            } else {
              signatureExist = x.pos.some((data) => !data.isStamp);
            }
          }
        }
        if (!signatureExist) {
          isSignatureExist = false;
          setIsSendAlert({ mssg: "sure", alert: true });
        }
      }
    }
    if (getPrefill && isLabel) {
      setIsSendAlert({ mssg: textWidget, alert: true });
    } else if (isSignatureExist) {
      if (isPlaceholderExist) {
        const IsSignerNotExist = filterPrefill?.filter((x) => !x.signerObjId);
        if (IsSignerNotExist && IsSignerNotExist?.length > 0) {
          setSignerExistModal(true);
          setSelectWidgetId(
            IsSignerNotExist[0]?.placeHolder?.[0]?.pos?.[0]?.key
          );
        } else {
          saveDocumentDetails();
        }
      } else {
        setIsSendAlert({ mssg: "sure", alert: true });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signerPos?.length > 0 && !pdfDetails?.[0]?.IsCompleted) {
        autosavedetails();
      }
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerPos, signersdata]);

  // `autosavedetails` is used to save doc details after every 2 sec when changes are happern in placeholder like drag-drop widgets, remove signers
  const autosavedetails = async () => {
    const signers = signersdata?.filter(
      (x) =>
        x?.Role !== "prefill" &&
        x.objectId && {
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: x.objectId
        }
    );
    try {
      const docCls = new Parse.Object("contracts_Document");
      docCls.id = documentId;
      docCls.set("Placeholders", signerPos);
      docCls.set("Signers", signers);
      await docCls.save();
    } catch (e) {
      console.log("error", e);
      alert(t("something-went-wrong-mssg"));
    }
  };
  //function to use save placeholder details in contracts_document
  const saveDocumentDetails = async () => {
    setIsUiLoading(true);
    let signerMail = signersdata.slice();
    if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
      signerMail.splice(1);
    }
    const pdfUrl = await embedPrefilllData();
    const signers = signersdata?.map((x) => {
      return {
        __type: "Pointer",
        className: "contracts_Contactbook",
        objectId: x.objectId
      };
    });
    const addExtraDays = pdfDetails[0]?.TimeToCompleteDays
      ? pdfDetails[0].TimeToCompleteDays
      : 15;
    const currentUser = signersdata.find((x) => x.Email === currentId);
    setCurrentId(currentUser?.objectId);
    if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
      const currentUserMail = Parse.User.current()?.getEmail();
      const isCurrentUser = signerMail?.[0]?.Email === currentUserMail;
      setIsCurrUser(isCurrentUser);
    } else {
      setIsCurrUser(currentUser?.objectId ? true : false);
    }
    let updateExpiryDate, data;
    updateExpiryDate = new Date();
    updateExpiryDate.setDate(updateExpiryDate.getDate() + addExtraDays);
    //filter label widgets after add label widgets data on pdf
    const filterPrefill = signerPos.filter((data) => data.Role !== "prefill");
    try {
      if (updateExpiryDate) {
        data = {
          Placeholders: filterPrefill,
          SignedUrl: pdfUrl,
          Signers: signers,
          SentToOthers: true,
          ExpiryDate: { iso: updateExpiryDate, __type: "Date" }
        };
      } else {
        data = {
          Placeholders: filterPrefill,
          SignedUrl: pdfUrl,
          Signers: signers,
          SentToOthers: true
        };
      }
      await axios
        .put(
          `${localStorage.getItem(
            "baseUrl"
          )}classes/contracts_Document/${documentId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )
        .then(() => {
          setIsMailSend(true);
          setIsLoading({ isLoad: false });
          setIsUiLoading(false);
          setSignerPos([]);
          setIsSendAlert({ mssg: "confirm", alert: true });
        })
        .catch((err) => {
          console.log("axois err ", err);
          alert(t("something-went-wrong-mssg"));
        });
    } catch (e) {
      console.log("error", e);
      alert(t("something-went-wrong-mssg"));
    }
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset copied state after 1.5 seconds
  };
  //function show signer list and share link to share signUrl
  const handleShareList = () => {
    const shareLinkList = [];
    let signerMail = signersdata;
    for (let i = 0; i < signerMail.length; i++) {
      const objectId = signerMail[i].objectId;
      const hostUrl = window.location.origin;
      const sendMail = false;
      //encode this url value `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
      const encodeBase64 = btoa(
        `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}/${sendMail}`
      );
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      shareLinkList.push({ signerEmail: signerMail[i].Email, url: signPdf });
    }
    return shareLinkList.map((data, ind) => {
      return (
        <div
          className="flex flex-row justify-between items-center mb-1"
          key={ind}
        >
          {copied && <Alert type="success">{t("copied")}</Alert>}
          <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis  ">
            {data.signerEmail}
          </span>
          <div className="flex flex-row items-center gap-3 ">
            <button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              className="flex flex-row items-center op-link op-link-primary"
            >
              <i className="fa-light fa-copy" />
              <span className=" hidden md:block ml-1 ">{t("copy-link")}</span>
            </button>
            <RWebShare data={{ url: data.url, title: t("sign-url") }}>
              <i className="fa-light fa-share-from-square op-link op-link-secondary no-underline"></i>
            </RWebShare>
          </div>
        </div>
      );
    });
  };
  const sendEmailToSigners = async () => {
    let htmlReqBody;
    setIsUiLoading(true);
    setIsSendAlert({});
    let sendMail;
    const expireDate = pdfDetails?.[0].ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    let senderEmail = pdfDetails?.[0]?.ExtUserPtr?.Email;
    let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
    let signerMail = signersdata.slice();

    if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
      signerMail.splice(1);
    }

    for (let i = 0; i < signerMail.length; i++) {
      try {
        const imgPng =
          "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
        let url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessionToken: localStorage.getItem("accesstoken")
        };
        const objectId = signerMail[i].objectId;
        const hostUrl = window.location.origin;
        //encode this url value `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
        const encodeBase64 = btoa(
          `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}`
        );
        let signPdf = `${hostUrl}/login/${encodeBase64}`;
        const openSignUrl = "https://www.opensignlabs.com/";
        const orgName = pdfDetails[0]?.ExtUserPtr.Company
          ? pdfDetails[0].ExtUserPtr.Company
          : "";
        const themeBGcolor = themeColor;
        const senderName = `${pdfDetails?.[0].ExtUserPtr.Name}`;
        const documentName = `${pdfDetails?.[0].Name}`;
        let replaceVar;
        if (requestBody && requestSubject && isCustomize && isSubscribe) {
          const replacedRequestBody = requestBody.replace(/"/g, "'");
          htmlReqBody =
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
            replacedRequestBody +
            "</body> </html>";

          const variables = {
            document_title: documentName,
            sender_name: senderName,
            sender_mail: senderEmail,
            sender_phone: senderPhone || "",
            receiver_name: signerMail[i].Name,
            receiver_email: signerMail[i].Email,
            receiver_phone: signerMail[i]?.Phone || "",
            expiry_date: localExpireDate,
            company_name: orgName,
            signing_url: `<a href=${signPdf} target=_blank>Sign here</a>`
          };
          replaceVar = replaceMailVaribles(
            requestSubject,
            htmlReqBody,
            variables
          );
        }

        let params = {
          mailProvider: activeMailAdapter,
          extUserId: extUserId,
          recipient: signerMail[i].Email,
          subject: isCustomize
            ? replaceVar?.subject
            : `${senderName} has requested you to sign "${documentName}"`,
          from: senderEmail,
          plan: planCode,
          html: isCustomize
            ? replaceVar?.body
            : "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'=> <div   style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
              imgPng +
              " height='50' style='padding: 20px,width:170px,height:40px' /></div>  <div  style=' padding: 2px;font-family: system-ui;background-color:" +
              themeBGcolor +
              ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px;   margin-bottom: 10px;'> " +
              pdfDetails?.[0].ExtUserPtr.Name +
              " has requested you to review and sign <strong> " +
              pdfDetails?.[0].Name +
              "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
              senderEmail +
              "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
              orgName +
              "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expire on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
              localExpireDate +
              "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a target=_blank href=" +
              signPdf +
              "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
              senderEmail +
              " directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= " +
              openSignUrl +
              " target=_blank>here</a>.</p> </div></div></body> </html>"
        };

        sendMail = await axios.post(url, params, { headers: headers });
      } catch (error) {
        console.log("error", error);
      }
    }
    if (sendMail?.data?.result?.status === "success") {
      setMailStatus("success");
      try {
        let data;
        if (requestBody && requestSubject && isCustomize && isSubscribe) {
          data = {
            RequestBody: htmlReqBody,
            RequestSubject: requestSubject,
            SendMail: true
          };
        } else {
          data = { SendMail: true };
        }
        try {
          await axios.put(
            `${localStorage.getItem(
              "baseUrl"
            )}classes/contracts_Document/${documentId}`,
            data,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                "X-Parse-Session-Token": localStorage.getItem("accesstoken")
              }
            }
          );
        } catch (err) {
          console.log("axois err ", err);
        }
      } catch (e) {
        console.log("error", e);
      }
      setIsSend(true);
      setIsMailSend(true);
      setIsLoading({ isLoad: false });
      setIsUiLoading(false);
    } else if (sendMail?.data?.result?.status === "quota-reached") {
      setMailStatus("quotareached");
      setIsSend(true);
      setIsMailSend(true);
      setIsUiLoading(false);
    } else {
      setMailStatus("failed");
      setIsSend(true);
      setIsMailSend(true);
      setIsUiLoading(false);
    }
  };
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  //here you can add your messages in content and selector is key of particular steps

  const tourConfig = [
    {
      selector: '[data-tut="recipientArea"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.placeholder-sign-1")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="addRecipient"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.placeholder-sign-3")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="addWidgets"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.placeholder-sign-4")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="pdfArea"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.placeholder-sign-5")}
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
          message={t("tour-mssg.placeholder-sign-6")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

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
                    isReadOnly: isReadOnly || false,
                    isHideLabel: isHideLabel || false,
                    defaultValue: defaultValue,
                    fontSize:
                      fontSize || currWidgetsDetails?.options?.fontSize || "12",
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
                    defaultValue: defaultValue,
                    isReadOnly: isReadOnly || false,
                    isHideLabel: isHideLabel || false,
                    fontSize:
                      fontSize || currWidgetsDetails?.options?.fontSize || "12",
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
                    fontSize || currWidgetsDetails?.options?.fontSize || "12",
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
  const handleWidgetdefaultdata = (defaultdata) => {
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
                    fontSize || currWidgetsDetails?.options?.fontSize || "12",
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
                    fontSize || currWidgetsDetails?.options?.fontSize || "12",
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
    setCurrWidgetsDetails({});
    setFontSize();
    setFontColor();
    handleNameModal();
  };

  const handleNameModal = () => {
    setIsNameModal(false);
    setCurrWidgetsDetails({});
    setShowDropdown(false);
    setIsRadio(false);
    setIsCheckbox(false);
    setIsPageCopy(false);
    //condition for text widget type after set all values for text widget
    //change setUniqueId which is set in tempsignerId
    //because textwidget do not have signer user so for selected signers we have to do
    if (currWidgetsDetails.type === textWidget) {
      setUniqueId(tempSignerId);
      setTempSignerId("");
    }
  };
  //function for update TourStatus
  const closeTour = async () => {
    setPlaceholderTour(false);
    if (isDontShow) {
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const placeholderIndex = tourStatus.findIndex(
          (obj) => obj["placeholder"] === false || obj["placeholder"] === true
        );
        if (placeholderIndex !== -1) {
          updatedTourStatus[placeholderIndex] = { placeholder: true };
        } else {
          updatedTourStatus.push({ placeholder: true });
        }
      } else {
        updatedTourStatus = [{ placeholder: true }];
      }
      await axios
        .put(
          `${localStorage.getItem(
            "baseUrl"
          )}classes/contracts_Users/${signerUserId}`,
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
        .then(() => {
          // const json = Listdata.data;
          // const res = json.results;
        })
        .catch((err) => {
          console.log("axois err ", err);
        });
    }
  };
  const handleRecipientSign = () => {
    navigate(`/recipientSignPdf/${documentId}/${currentId}`);
  };
  const handleLinkUser = (id) => {
    setIsAddUser({ [id]: true });
  };
  const handleAddUser = (data) => {
    if (data && data.objectId) {
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
      if (updateSigner && updateSigner.length > 0) {
        const currEmail = pdfDetails[0].ExtUserPtr.Email;
        const getCurrentUserDeatils = updateSigner.filter(
          (x) => x.Email === currEmail
        );
        if (getCurrentUserDeatils && getCurrentUserDeatils.length > 0) {
          setCurrentId(getCurrentUserDeatils[0].Email);
        }
      }
      setSignersData(updateSigner);
      const index = signersdata.findIndex((x) => x.Id === uniqueId);
      setIsSelectId(index);
    }
  };
  //function to add new signer in document signers list
  const handleAddNewRecipients = (data) => {
    const newId = randomId();
    const backgroundColor = color[signersdata.length];
    signersdata.push({
      ...data,
      className: "contracts_Contactbook",
      Id: newId,
      blockColor: backgroundColor
    });
    const signerPosObj = {
      signerPtr: {
        __type: "Pointer",
        className: "contracts_Contactbook",
        objectId: data.objectId
      },
      signerObjId: data.objectId,
      blockColor: backgroundColor,
      Id: newId
    };
    setSignerPos((prev) => [...prev, signerPosObj]);
    setUniqueId(newId);
    setIsSelectId(signersdata.length - 1);
    setBlockColor(color[signersdata.length]);
  };

  const closePopup = () => {
    setIsAddUser({});
    setIsAddSigner(false);
  };

  //function for handle ontext change and save again text in delta in Request Email flow
  const handleOnchangeRequest = () => {
    if (editorRef.current) {
      const html = editorRef.current.editor.root.innerHTML;
      setRequestBody(html);
    }
  };

  const signerAssignTour = [
    {
      selector: '[data-tut="assignSigner"]',
      content:
        "You need to attach a Signer to every role. You can do that by clicking this icon. Once you select a Signer it will be attached to all the fields associated with that role which appear in the same colour. ",
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

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
  const handleCloseSendmailModal = () => {
    setIsSendAlert({});
    if (isSendAlert.mssg === "confirm") {
      setIsAlreadyPlace({
        status: true,
        message: t("document-signed-alert-8")
      });
    }
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
      setPdfArrayBuffer && setPdfArrayBuffer(urlDetails.arrayBuffer);
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
    setPdfArrayBuffer && setPdfArrayBuffer(urlDetails.arrayBuffer);
    setPdfRotatese64(urlDetails.base64);
  };
  return (
    <>
      <Title title={state?.title ? state.title : "New Document"} />
      <DndProvider backend={HTML5Backend}>
        {isLoading.isLoad ? (
          <LoaderWithMsg isLoading={isLoading} />
        ) : handleError ? (
          <HandleError handleError={handleError} />
        ) : (
          <div>
            {isUiLoading && (
              <div className="absolute h-[100vh] w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2] bg-opacity-80">
                <Loader />
                <span className="text-[13px] text-base-content">
                  {t("loading-mssg")}
                </span>
              </div>
            )}
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
                  isOpen={placeholderTour}
                  rounded={5}
                  closeWithMask={false}
                />
              )}
              <Tour
                onRequestClose={() => setSignerExistModal(false)}
                steps={signerAssignTour}
                isOpen={signerExistModal}
                rounded={5}
                closeWithMask={false}
              />
              {/* this component used to render all pdf pages in left side */}
              <RenderAllPdfPage
                signPdfUrl={pdfDetails[0].URL}
                allPages={allPages}
                setAllPages={setAllPages}
                setPageNumber={setPageNumber}
                setSignBtnPosition={setSignBtnPosition}
                pageNumber={pageNumber}
                pdfRotateBase64={pdfRotateBase64}
              />
              {/* pdf render view */}
              <div className=" w-full md:w-[57%] flex mr-4">
                <PdfZoom
                  clickOnZoomIn={clickOnZoomIn}
                  clickOnZoomOut={clickOnZoomOut}
                  handleRotationFun={handleRotationFun}
                />
                <div className=" w-full md:w-[95%] ">
                  {/* this modal is used show alert set placeholder for all signers before send mail */}
                  <ModalUi
                    isOpen={isSendAlert.alert}
                    title={
                      isSendAlert.mssg === "sure" ||
                      isSendAlert.mssg === textWidget
                        ? t("fields-required")
                        : isSendAlert.mssg === "confirm" && t("send-mail")
                    }
                    handleClose={() => handleCloseSendmailModal()}
                  >
                    <div className="max-h-96 overflow-y-scroll scroll-hide p-[20px] text-base-content">
                      {isSendAlert.mssg === "sure" ? (
                        <span>{t("placeholder-alert-1")}</span>
                      ) : isSendAlert.mssg === textWidget ? (
                        <p>{t("placeholder-alert-2")}</p>
                      ) : (
                        isSendAlert.mssg === "confirm" && (
                          <>
                            {!isCustomize && (
                              <span>{t("placeholder-alert-3")}</span>
                            )}
                            {isCustomize && isSubscribe && (
                              <>
                                <EmailBody
                                  editorRef={editorRef}
                                  requestBody={requestBody}
                                  requestSubject={requestSubject}
                                  handleOnchangeRequest={handleOnchangeRequest}
                                  setRequestSubject={setRequestSubject}
                                />
                                <div
                                  className="flex justify-end items-center gap-1 mt-2 op-link op-link-primary"
                                  onClick={() => {
                                    setRequestBody(defaultBody);
                                    setRequestSubject(defaultSubject);
                                  }}
                                >
                                  <span>{t("reset-to-default")}</span>
                                </div>
                              </>
                            )}
                            <div className="flex flex-row md:items-center gap-2 md:gap-6 mt-2">
                              <div className="flex flex-row gap-2">
                                <button
                                  onClick={() => sendEmailToSigners()}
                                  className="op-btn op-btn-primary font-[500] text-sm shadow"
                                >
                                  {t("send")}
                                </button>
                                {isCustomize && (
                                  <button
                                    onClick={() => setIsCustomize(false)}
                                    className="op-btn op-btn-ghost font-[500] text-sm"
                                  >
                                    {t("close")}
                                  </button>
                                )}
                              </div>
                              {!isCustomize && isSubscribe && (
                                <span
                                  className="op-link op-link-accent text-sm"
                                  onClick={() => setIsCustomize(!isCustomize)}
                                >
                                  {t("cutomize-email")}
                                </span>
                              )}
                              {!isSubscribe && isEnableSubscription && (
                                <div className="mt-2">
                                  <Upgrade
                                    message={t("upgrade-to-customize-email")}
                                    newWindow={true}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )
                      )}
                      {isSendAlert.mssg === "confirm" && (
                        <>
                          <div className="flex justify-center items-center mt-3">
                            <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                            <span className="ml-[5px] mr-[5px]">{t("or")}</span>
                            <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                          </div>
                          <div className="my-3">{handleShareList()}</div>
                        </>
                      )}
                    </div>
                  </ModalUi>

                  {/* this modal is used show send mail  message and after send mail success message */}
                  <ModalUi
                    isOpen={isSend}
                    title={
                      mailStatus === "quotareached"
                        ? t("quota-mail-head")
                        : t("Mails Sent")
                    }
                    handleClose={() => {
                      setIsSend(false);
                      setSignerPos([]);
                      navigate("/report/1MwEuxLEkF");
                    }}
                  >
                    <div className="h-[100%] p-[20px]">
                      {mailStatus === "success" ? (
                        <div className="text-center mb-[10px]">
                          <LottieWithLoader />
                          <p>{t("placeholder-alert-4")}</p>
                          {isCurrUser && <p>{t("placeholder-alert-5")}</p>}
                        </div>
                      ) : mailStatus === "quotareached" ? (
                        <div className="flex flex-col gap-y-3">
                          <QuotaCard
                            handleClose={() => {
                              setIsSend(false);
                              setSignerPos([]);
                              navigate("/report/1MwEuxLEkF");
                            }}
                          />
                          <div className="my-3">{handleShareList()}</div>
                        </div>
                      ) : (
                        <p>{t("placeholder-alert-6")}</p>
                      )}
                      {!mailStatus && (
                        <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
                      )}
                      {mailStatus !== "quotareached" && (
                        <div
                          className={
                            mailStatus === "success"
                              ? "flex justify-center mt-1"
                              : ""
                          }
                        >
                          {isCurrUser && (
                            <button
                              onClick={() => handleRecipientSign()}
                              type="button"
                              className="op-btn op-btn-primary mr-1"
                            >
                              {t("yes")}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsSend(false);
                              setSignerPos([]);
                              navigate("/report/1MwEuxLEkF");
                            }}
                            type="button"
                            className="op-btn op-btn-ghost"
                          >
                            {isCurrUser ? t("no") : t("close")}
                          </button>
                        </div>
                      )}
                    </div>
                  </ModalUi>
                  <ModalUi
                    isOpen={isShowEmail}
                    title={t("signers-alert")}
                    handleClose={() => setIsShowEmail(false)}
                  >
                    <div className="h-[100%] p-[20px]">
                      <p>{t("placeholder-alert-7")}</p>
                      <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
                      <button
                        onClick={() => setIsShowEmail(false)}
                        type="button"
                        className="op-btn op-btn-primary"
                      >
                        {t("ok")}
                      </button>
                    </div>
                  </ModalUi>
                  <PlaceholderCopy
                    isPageCopy={isPageCopy}
                    setIsPageCopy={setIsPageCopy}
                    xyPostion={signerPos}
                    setXyPostion={setSignerPos}
                    allPages={allPages}
                    pageNumber={pageNumber}
                    signKey={signKey}
                    Id={uniqueId}
                    widgetType={widgetType}
                    setUniqueId={setUniqueId}
                    tempSignerId={tempSignerId}
                    setTempSignerId={setTempSignerId}
                  />
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

                  {/* pdf header which contain funish back button */}
                  <Header
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
                    handleRotationFun={handleRotationFun}
                    clickOnZoomIn={clickOnZoomIn}
                    clickOnZoomOut={clickOnZoomOut}
                  />

                  <div
                    ref={divRef}
                    data-tut="pdfArea"
                    className="h-full md:h-[95%]"
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
                        isResize={isResize}
                        setZIndex={setZIndex}
                        setIsPageCopy={setIsPageCopy}
                        signersdata={signersdata}
                        setSignKey={setSignKey}
                        handleLinkUser={handleLinkUser}
                        setUniqueId={setUniqueId}
                        isDragging={isDragging}
                        setShowDropdown={setShowDropdown}
                        setWidgetType={setWidgetType}
                        setIsRadio={setIsRadio}
                        setIsCheckbox={setIsCheckbox}
                        setCurrWidgetsDetails={setCurrWidgetsDetails}
                        setSelectWidgetId={setSelectWidgetId}
                        selectWidgetId={selectWidgetId}
                        handleNameModal={setIsNameModal}
                        setTempSignerId={setTempSignerId}
                        uniqueId={uniqueId}
                        pdfOriginalWH={pdfOriginalWH}
                        setScale={setScale}
                        scale={scale}
                        setIsSelectId={setIsSelectId}
                        pdfRotateBase64={pdfRotateBase64}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        fontColor={fontColor}
                        setFontColor={setFontColor}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* signature button */}
              <div className="w-full md:w-[23%] bg-base-100 overflow-y-auto hide-scrollbar">
                <div className={`max-h-screen`}>
                  {isMobile ? (
                    <div>
                      <WidgetComponent
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
                        isSigners={true}
                        setIsShowEmail={setIsShowEmail}
                        isMailSend={isMailSend}
                        setSelectedEmail={setSelectedEmail}
                        selectedEmail={selectedEmail}
                        setUniqueId={setUniqueId}
                        setRoleName={setRoleName}
                        initial={true}
                        sendInOrder={pdfDetails[0].SendinOrder}
                        setSignersData={setSignersData}
                        blockColor={blockColor}
                        setBlockColor={setBlockColor}
                        setIsAddSigner={setIsAddSigner}
                        handleDeleteUser={handleDeleteUser}
                        uniqueId={uniqueId}
                      />
                    </div>
                  ) : (
                    <div>
                      <div
                        className="hidden md:block w-full h-full bg-base-100"
                        aria-disabled
                      >
                        <SignerListPlace
                          setSignerPos={setSignerPos}
                          signerPos={signerPos}
                          signersdata={signersdata}
                          isSelectListId={isSelectListId}
                          setIsSelectId={setIsSelectId}
                          setUniqueId={setUniqueId}
                          setRoleName={setRoleName}
                          sendInOrder={pdfDetails[0].SendinOrder}
                          setSignersData={setSignersData}
                          blockColor={blockColor}
                          setBlockColor={setBlockColor}
                          isMailSend={isMailSend}
                          setIsAddSigner={setIsAddSigner}
                          handleDeleteUser={handleDeleteUser}
                          roleName={roleName}
                          uniqueId={uniqueId}
                          // handleAddSigner={handleAddSigner}
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
                            initial={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <ModalUi
          isOpen={isAlreadyPlace.status}
          title={t("document-alert")}
          showClose={false}
        >
          <div className="h-[100%] p-[20px]">
            <p>{isAlreadyPlace.message}</p>
            <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
            <button
              onClick={() => handleRecipientSign()}
              type="button"
              className="op-btn op-btn-primary"
            >
              {t("view")}
            </button>
          </div>
        </ModalUi>
        <LinkUserModal
          handleAddUser={handleAddUser}
          isAddUser={isAddUser}
          uniqueId={uniqueId}
          closePopup={closePopup}
          signersData={signersdata}
        />
        <LinkUserModal
          handleAddUser={handleAddNewRecipients}
          isAddSigner={isAddSigner}
          closePopup={closePopup}
          signersData={signersdata}
        />
        <WidgetNameModal
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
}

export default PlaceHolderSign;
