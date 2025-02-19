import React, { useState, useRef, useEffect } from "react";
import {
  themeColor
} from "../constant/const";
import { PDFDocument } from "pdf-lib";
import "../styles/signature.css";
import Parse from "parse";
import axios from "axios";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SignPad from "../components/pdf/SignPad";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import Tour from "reactour";
import Confetti from "react-confetti";
import moment from "moment";
import {
  contractDocument,
  multiSignEmbed,
  embedDocId,
  pdfNewWidthFun,
  signPdfFun,
  onSaveSign,
  onSaveImage,
  addDefaultSignatureImg,
  radioButtonWidget,
  replaceMailVaribles,
  convertPdfArrayBuffer,
  contractUsers,
  contactBook,
  handleToPrint,
  handleDownloadCertificate,
  getDefaultSignature,
  onClickZoomIn,
  onClickZoomOut,
  fetchUrl,
  signatureTypes,
  handleSignatureType,
  getTenantDetails,
  getBase64FromUrl,
  openInNewTab,
  getContainerScale,
  randomId,
  defaultWidthHeight,
  addWidgetOptions,
  textWidget,
  compressedFileSize
} from "../constant/Utils";
import Header from "../components/pdf/PdfHeader";
import RenderPdf from "../components/pdf/RenderPdf";
import Title from "../components/Title";
import DefaultSignature from "../components/pdf/DefaultSignature";
import { useSelector } from "react-redux";
import SignerListComponent from "../components/pdf/SignerListComponent";
import PdfZoom from "../components/pdf/PdfZoom";
import { useTranslation } from "react-i18next";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import DownloadPdfZip from "../primitives/DownloadPdfZip";
import Loader from "../primitives/Loader";
import PdfDeclineModal from "../primitives/PdfDeclineModal";
import { serverUrl_fn } from "../constant/appinfo";
import AgreementSign from "../components/pdf/AgreementSign";
import WidgetComponent from "../components/pdf/WidgetComponent";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import TextFontSetting from "../components/pdf/TextFontSetting";

function PdfRequestFiles(
) {
  const { t } = useTranslation();
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
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [isCelebration, setIsCelebration] = useState(false);
  const [requestSignTour, setRequestSignTour] = useState(true);
  const [tourStatus, setTourStatus] = useState([]);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [defaultSignImg, setDefaultSignImg] = useState();
  const [isDocId, setIsDocId] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [signerPos, setSignerPos] = useState([]);
  const [signerObjectId, setSignerObjectId] = useState();
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isDecline, setIsDecline] = useState({ isDeclined: false });
  const [currentSigner, setCurrentSigner] = useState(false);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [unSignedWidgetId, setUnSignedWidgetId] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [isResize, setIsResize] = useState(false);
  const [signerUserId, setSignerUserId] = useState();
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDownloading, setIsDownloading] = useState("");
  const [defaultSignAlert, setDefaultSignAlert] = useState({
    isShow: false,
    alertMessage: ""
  });
  const [isCompleted, setIsCompleted] = useState({
    isCertificate: false,
    isModal: false
  });
  const [myInitial, setMyInitial] = useState("");
  const [isInitial, setIsInitial] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [alreadySign, setAlreadySign] = useState(false);
  const [containerWH, setContainerWH] = useState({});
  const [validateAlert, setValidateAlert] = useState(false);
  const [widgetsTour, setWidgetsTour] = useState(false);
  const [minRequiredCount, setminRequiredCount] = useState();
  const [sendInOrder, setSendInOrder] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState({});
  const [extUserId, setExtUserId] = useState("");
  const [contractName, setContractName] = useState("");
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [uniqueId, setUniqueId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const isHeader = useSelector((state) => state.showHeader);
  const divRef = useRef(null);
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const [isAgree, setIsAgree] = useState(false);
  const [isAgreeTour, setIsAgreeTour] = useState(false);
  const [redirectTimeLeft, setRedirectTimeLeft] = useState(5);
  const [isredirectCanceled, setIsredirectCanceled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragKey, setDragKey] = useState();
  const [isAutoSign, setIsAutoSign] = useState(false);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const [zIndex, setZIndex] = useState(1);
  const [fontSize, setFontSize] = useState();
  const [fontColor, setFontColor] = useState();
  const [widgetType, setWidgetType] = useState("");
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [assignedWidgetId, setAssignedWidgetId] = useState([]);
  const [saveSignCheckbox, setSaveSignCheckbox] = useState({
    isVisible: false,
    signId: ""
  });
  const [showSignPagenumber, setShowSignPagenumber] = useState([]);
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  });
  const isMobile = window.innerWidth < 767;
  let isGuestSignFlow = false;
  let sendmail;
  let getDocId = "";
  let contactBookId = "";
  const route =
    window.location.pathname;
  const getQuery =
    window.location?.search?.split("?"); //['','sendmail=false']
  if (getQuery) {
    sendmail = getQuery?.[1]?.split("=")[1]; //false
  }

  const routeId = route && route?.split("/"); // ['', 'load', 'recipientSignPdf', ':docId', ':contactBookId']
  if (routeId && routeId.length > 4) {
    // this condition will be occur only in guest flow in which load routeId will be include
    isGuestSignFlow = true;
    getDocId = routeId[3];
    contactBookId = routeId[4];
  } else {
    // this condition will be occur only in if user is logged in and load routeId will be exclude
    getDocId = routeId[2];
    contactBookId = routeId?.[3] || "";
  }
  let getDocumentId = getDocId || documentId;
  useEffect(() => {
    if (getDocumentId) {
      setDocumentId(getDocumentId);
      getDocumentDetails(getDocumentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getDocumentId
  ]);
  useEffect(() => {
    const updateSize = () => {
      if (divRef.current) {
        const pdfWidth = pdfNewWidthFun(divRef);
        setPdfNewWidth(pdfWidth);
        setContainerWH({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight
        });
      }
    };

    // Use setTimeout to wait for the transition to complete
    const timer = setTimeout(updateSize, 100); // match the transition duration
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current, isHeader]);
  const redirectUrl = pdfDetails?.[0]?.RedirectUrl || "";
  useEffect(() => {
    if (isredirectCanceled) return; // Stop the redirect timer if canceled
    if (redirectUrl) {
      if (redirectTimeLeft === 0) {
        openInNewTab(redirectUrl, "_self"); // Replace with your target URL
      }
      const timer = setTimeout(() => {
        setRedirectTimeLeft((prev) => prev - 1); // Decrement the timer
      }, 1000);
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [redirectTimeLeft, isredirectCanceled, redirectUrl]);

  const fetchTenantDetails = async (contactId) => {
    const user = JSON.parse(
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    );
    try {
      const tenantDetails = await getTenantDetails(
        user?.objectId, // userId
        contactId // contactId
      );
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
  };

  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (
    docId,
    isNextUser,
    isSuccessPage = false
  ) => {
    try {
      const senderUser = localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      );
      const jsonSender = JSON.parse(senderUser);
      const contactId = jsonSender?.objectId
        ? ""
        : contactBookId || signerObjectId || "";
      const tenantSignTypes = await fetchTenantDetails(contactId);
      // `currUserId` will be contactId or extUserId
      let currUserId;
      //getting document details
      const documentData = await contractDocument(docId);
      if (documentData && documentData.length > 0) {
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
        const url =
          documentData[0] &&
          (documentData[0]?.SignedUrl || documentData[0]?.URL);
        if (url) {
          const base64Pdf = await getBase64FromUrl(url);
          if (base64Pdf) {
            setPdfBase64Url(base64Pdf);
          }
        } else {
          setHandleError(t("something-went-wrong-mssg"));
        }
        setExtUserId(documentData[0]?.ExtUserPtr?.objectId);
        const isCompleted =
          documentData[0].IsCompleted && documentData[0].IsCompleted;
        const expireDate = documentData[0].ExpiryDate.iso;
        const declined =
          documentData[0].IsDeclined && documentData[0].IsDeclined;
        const expireUpdateDate = new Date(expireDate).getTime();
        const currDate = new Date().getTime();
        const getSigners = documentData[0].Signers;
        const isTourEnabled =
          documentData[0]?.IsTourEnabled === true ? true : false;
        const getCurrentSigner = getSigners?.find(
          (data) => data.UserId.objectId === jsonSender?.objectId
        );

        currUserId = getCurrentSigner?.objectId
          ? getCurrentSigner.objectId
          : contactBookId || signerObjectId || ""; //signerObjectId is contactBookId refer from public template flow
        if (currUserId) {
          setSignerObjectId(currUserId);
        }
        if (documentData[0].SignedUrl) {
          setPdfUrl(documentData[0].SignedUrl);
        } else {
          setPdfUrl(documentData[0].URL);
        }
        if (isCompleted) {
          setIsSigned(true);
          setAlreadySign(true);
          setIsCelebration(true);
          setTimeout(() => setIsCelebration(false), 5000);
          if (!isSuccessPage) {
            const data = { isCertificate: true, isModal: true };
            setIsCompleted(data);
          }
        } else if (declined) {
          const currentDecline = { currnt: "another", isDeclined: true };
          setIsDecline(currentDecline);
        } else if (currDate > expireUpdateDate) {
          const expireDateFormat = moment(new Date(expireDate)).format(
            "MMM DD, YYYY"
          );
          setIsExpired(true);
          setExpiredDate(expireDateFormat);
        } // Check if the current signer is not a last signer and handle the complete message.
        else if (isNextUser) {
          setIsCelebration(true);
          setTimeout(() => setIsCelebration(false), 5000);
          if (!isSuccessPage) {
            setIsCompleted({
              isModal: true,
              message: t("document-signed-alert-1")
            });
          }
        } else {
          if (currUserId) {
            const checkCurrentUser = documentData[0].Placeholders.find(
              (data) => data?.signerObjId === currUserId
            );
            if (checkCurrentUser) {
              const widgetId = [];
              for (let placeholder of checkCurrentUser.placeHolder) {
                for (let item of placeholder.pos) {
                  widgetId.push(item.key);
                }
              }
              setAssignedWidgetId(widgetId);
              setUniqueId(checkCurrentUser.Id);
              setCurrentSigner(true);
            }
          }
        }
        const audittrailData = documentData?.[0]?.AuditTrail?.filter(
          (data) => data.Activity === "Signed"
        );
        const checkAlreadySign =
          documentData?.[0]?.AuditTrail?.some(
            (data) =>
              data?.UserPtr?.objectId === currUserId &&
              data.Activity === "Signed"
          ) || false;
        if (checkAlreadySign) {
          setAlreadySign(true);
        } else {
          const obj = documentData?.[0];
          setSendInOrder(obj?.SendinOrder || false);
        }

        let signers = [];
        let unSignedSigner = [];

        const placeholdersOrSigners = [];
        for (const placeholder of documentData[0].Placeholders) {
          //`emailExist` variable to handle condition for quick send flow and show unsigned signers list
          const signerIdExist = placeholder?.signerObjId;
          if (signerIdExist) {
            const getSignerData = documentData[0].Signers.find(
              (data) => data.objectId === placeholder?.signerObjId
            );
            placeholdersOrSigners.push(getSignerData);
          } else {
            placeholdersOrSigners.push(placeholder);
          }
        }
        //condition to check already signed document by someone
        if (audittrailData && audittrailData.length > 0) {
          setIsDocId(true);

          for (const item of placeholdersOrSigners) {
            const checkEmail = item?.email;
            //if email exist then compare user signed by using email else signers objectId
            const emailOrId = checkEmail ? item.email : item?.objectId;
            //`isSignedSignature` variable to handle break loop whenever it get true
            let isSignedSignature = false;
            //checking the signer who signed the document by using audit trail details.
            //and save signedSigners and unsignedSigners details
            for (const doc of audittrailData) {
              const signedExist = checkEmail
                ? doc?.UserPtr?.Email
                : doc?.UserPtr?.objectId;

              if (emailOrId === signedExist) {
                signers.push({ ...item });
                isSignedSignature = true;
                break;
              }
            }
            if (!isSignedSignature) {
              unSignedSigner.push({ ...item });
            }
          }
          setSignedSigners(signers);
          setUnSignedSigners(unSignedSigner);
          setSignerPos(documentData[0].Placeholders);
        } else {
          //else condition is show there are no details in audit trail then direct push all signers details
          //in unsignedsigners array
          setUnSignedSigners(placeholdersOrSigners);
          setSignerPos(documentData[0].Placeholders);
        }
        setPdfDetails(documentData);
        //checking if condition current user already sign or owner does not exist as a signer or document has been declined by someone or document has been expired
        //then stop to display tour message
        if (
          checkAlreadySign ||
          !currUserId ||
          declined ||
          currDate > expireUpdateDate ||
          !isTourEnabled
        ) {
          setRequestSignTour(true);
        } else {
          const isEnableOTP = documentData?.[0]?.IsEnableOTP || false;
          const sessionToken = localStorage.getItem("accesstoken");
          if (sessionToken) {
            //condition to check current user exist in contracts_Users class and check tour message status
            //if not then check user exist in contracts_Contactbook class and check tour message status
            const res = await contractUsers();
            if (res === "Error: Something went wrong!") {
              setHandleError(t("something-went-wrong-mssg"));
            } else if (res[0] && res?.length) {
              setContractName("_Users");
              currUserId = res[0].objectId;
              setSignerUserId(currUserId);
              const tourData = res[0].TourStatus && res[0].TourStatus;
              if (tourData && tourData.length > 0) {
                const checkTourRequest = tourData.filter(
                  (data) => data?.requestSign
                );
                setTourStatus(tourData);
                setRequestSignTour(checkTourRequest[0]?.requestSign || false);
              } else {
                setRequestSignTour(false);
              }
              setSaveSignCheckbox((prev) => ({ ...prev, isVisible: true }));
              //function to get default signatur of current user from `contracts_Signature` class
              const defaultSignRes = await getDefaultSignature(
                jsonSender?.objectId
              );
              if (defaultSignRes?.status === "success") {
                setSaveSignCheckbox((prev) => ({
                  ...prev,
                  isVisible: true,
                  signId: defaultSignRes?.res?.id
                }));
                const sign = defaultSignRes?.res?.defaultSignature || "";
                const initials = defaultSignRes?.res?.defaultInitial || "";
                setDefaultSignImg(sign);
                setMyInitial(initials);
              }
            } else if (res?.length === 0) {
              const res = await contactBook(currUserId);
              if (res === "Error: Something went wrong!") {
                setHandleError(t("something-went-wrong-mssg"));
              } else if (res[0] && res.length) {
                setContractName("_Contactbook");
                const objectId = res[0].objectId;
                setSignerUserId(objectId);
                const tourData = res[0].TourStatus && res[0].TourStatus;
                if (tourData && tourData.length > 0) {
                  const checkTourRequest = tourData.filter(
                    (data) => data?.requestSign
                  );
                  setTourStatus(tourData);
                  setRequestSignTour(checkTourRequest[0]?.requestSign || false);
                } else {
                  setRequestSignTour(false);
                }
              } else if (res.length === 0) {
                setHandleError(t("user-not-exist"));
              }
            }
          } else if (!isEnableOTP) {
            try {
              const resContact = await axios.post(
                `${localStorage.getItem("baseUrl")}functions/getcontact`,
                { contactId: currUserId },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "X-Parse-Application-Id": localStorage.getItem("parseAppId")
                  }
                }
              );
              const contact = resContact?.data?.result;
              setContractName("_Contactbook");
              setSignerUserId(contact?.objectId);
              const tourData = contact?.TourStatus && contact?.TourStatus;
              if (tourData && tourData.length > 0) {
                const checkTourRequest =
                  tourData?.some((data) => data?.requestSign) || false;
                setTourStatus(tourData);
                setRequestSignTour(checkTourRequest);
              } else {
                setRequestSignTour(false);
              }
            } catch (err) {
              console.log("err while getting tourstatus", err);
            }
          }
        }
        setIsUiLoading(false);
        setIsLoading({ isLoad: false });
        return updatedPdfDetails;
      } else if (
        documentData === "Error: Something went wrong!" ||
        (documentData.result && documentData.result.error)
      ) {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
        console.log("err in  getDocument cloud function ");
      } else {
        setHandleError(t("no-data"));
        setIsUiLoading(false);
        setIsLoading({ isLoad: false });
      }
      setIsLoading({ isLoad: false });
    } catch (err) {
      console.log("Error: error in getDocumentDetails", err);
      setHandleError("Error: Something went wrong!");
      setIsLoading({ isLoad: false });
    }
  };
  //function for embed signature or image url in pdf
  async function embedWidgetsData() {
    //for emailVerified data checking first in localstorage
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    let currentUser = JSON.parse(localuser);
    let isEmailVerified = currentUser?.emailVerified;
    const isEnableOTP = pdfDetails?.[0]?.IsEnableOTP || false;
    //if emailVerified data is not present in local user details then fetch again in _User class
    if (isEnableOTP) {
      try {
        if (!currentUser?.emailVerified) {
          const userQuery = new Parse.Query(Parse.User);
          const getUser = await userQuery.get(currentUser?.objectId, {
            sessionToken:
              currentUser?.sessionToken || localStorage.getItem("accesstoken")
          });
          if (getUser) {
            currentUser = JSON.parse(JSON.stringify(getUser));
          }
        }
        isEmailVerified = currentUser?.emailVerified;
      } catch (err) {
        console.log("err in get email verification ", err);
        setHandleError(t("something-went-wrong-mssg"));
      }
    }
    //check if isEmailVerified then go on next step
    if (!isEnableOTP || isEmailVerified) {
      try {
        const checkUser = signerPos.filter(
          (data) => data.signerObjId === signerObjectId
        );
        if (checkUser && checkUser.length > 0) {
          let checkboxExist,
            requiredRadio,
            showAlert = false,
            widgetKey,
            radioExist,
            requiredCheckbox,
            TourPageNumber; // `pageNumber` is used to check on which page user did not fill widget's data then change current pageNumber and show tour message on that page

          for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
            for (let j = 0; j < checkUser[0].placeHolder[i].pos.length; j++) {
              //get current page
              const updatePage = checkUser[0].placeHolder[i]?.pageNumber;
              //checking checbox type widget
              checkboxExist =
                checkUser[0].placeHolder[i].pos[j].type === "checkbox";
              //checking radio button type widget
              radioExist =
                checkUser[0].placeHolder[i].pos[j].type === radioButtonWidget;
              //condition to check checkbox widget exist or not
              if (checkboxExist) {
                //get all required type checkbox
                requiredCheckbox = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    !position.options?.isReadOnly &&
                    position.type === "checkbox"
                );
                //if required type checkbox data exit then check user checked all checkbox or some checkbox remain to check
                //also validate to minimum and maximum required checkbox
                if (requiredCheckbox && requiredCheckbox.length > 0) {
                  for (let i = 0; i < requiredCheckbox.length; i++) {
                    //get minimum required count if  exit
                    const minCount =
                      requiredCheckbox[i].options?.validation?.minRequiredCount;
                    const parseMin = minCount && parseInt(minCount);
                    //get maximum required count if  exit
                    const maxCount =
                      requiredCheckbox[i].options?.validation?.maxRequiredCount;
                    const parseMax = maxCount && parseInt(maxCount);
                    //in `response` variable is used to get how many checkbox checked by user
                    const response =
                      requiredCheckbox[i].options?.response?.length;
                    //in `defaultValue` variable is used to get how many checkbox checked by default
                    const defaultValue =
                      requiredCheckbox[i].options?.defaultValue?.length;
                    //condition to check  parseMin  and parseMax greater than 0  then consider it as a required check box
                    if (
                      parseMin > 0 &&
                      parseMax > 0 &&
                      !response &&
                      !defaultValue &&
                      !showAlert
                    ) {
                      showAlert = true;
                      widgetKey = requiredCheckbox[i].key;
                      TourPageNumber = updatePage;
                      setminRequiredCount(parseMin);
                    }
                    //else condition to validate minimum required checkbox
                    else if (
                      parseMin > 0 &&
                      (parseMin > response || !response)
                    ) {
                      if (!showAlert) {
                        showAlert = true;
                        widgetKey = requiredCheckbox[i].key;
                        TourPageNumber = updatePage;
                        setminRequiredCount(parseMin);
                      }
                    }
                  }
                }
              }
              //condition to check radio widget exist or not
              else if (radioExist) {
                //get all required type radio button
                requiredRadio = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    !position.options?.isReadOnly &&
                    position.type === radioButtonWidget
                );
                //if required type radio data exit then check user checked all radio button or some radio remain to check
                if (requiredRadio && requiredRadio?.length > 0) {
                  let checkSigned;
                  for (let i = 0; i < requiredRadio?.length; i++) {
                    checkSigned = requiredRadio[i]?.options?.response;
                    if (!checkSigned) {
                      let checkDefaultSigned =
                        requiredRadio[i]?.options?.defaultValue;
                      if (!checkDefaultSigned && !showAlert) {
                        showAlert = true;
                        widgetKey = requiredRadio[i].key;
                        TourPageNumber = updatePage;
                        setminRequiredCount(null);
                      }
                    }
                  }
                }
              }
              //else condition to check all type widget data fill or not except checkbox and radio button
              else {
                //get all required type widgets except checkbox and radio
                const requiredWidgets = checkUser[0].placeHolder[i].pos.filter(
                  (position) =>
                    position.options?.status === "required" &&
                    position.type !== radioButtonWidget &&
                    position.type !== "checkbox"
                );
                if (requiredWidgets && requiredWidgets?.length > 0) {
                  let checkSigned;
                  for (let i = 0; i < requiredWidgets?.length; i++) {
                    checkSigned = requiredWidgets[i]?.options?.response;
                    if (!checkSigned) {
                      const checkSignUrl = requiredWidgets[i]?.pos?.SignUrl;
                      if (!checkSignUrl) {
                        let checkDefaultSigned =
                          requiredWidgets[i]?.options?.defaultValue;
                        if (!checkDefaultSigned && !showAlert) {
                          showAlert = true;
                          widgetKey = requiredWidgets[i].key;
                          TourPageNumber = updatePage;
                          setminRequiredCount(null);
                        }
                      }
                    }
                  }
                }
              }
            }
            //when showAlert is true then break the loop and show alert to fill required data in widgets
            if (showAlert) {
              break;
            }
          }
          if (checkboxExist && requiredCheckbox && showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(TourPageNumber);
            setWidgetsTour(true);
          } else if (radioExist && showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(TourPageNumber);
            setWidgetsTour(true);
          } else if (showAlert) {
            setUnSignedWidgetId(widgetKey);
            setPageNumber(TourPageNumber);
            setWidgetsTour(true);
          } else {
            setIsUiLoading(true);
            // `widgets` is Used to return widgets details with page number of current user
            const widgets = checkUser?.[0]?.placeHolder;
            let pdfArrBuffer;
            //`contractDocument` function used to get updated SignedUrl
            // to resolve issue of widgets get remove automatically when more than 1 signers try to sign doc at a time
            const documentData = await contractDocument(documentId);
            if (documentData && documentData.length > 0) {
              const url = documentData[0]?.SignedUrl || documentData[0]?.URL;
              //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
              const arrayBuffer = await convertPdfArrayBuffer(url);
              if (arrayBuffer === "Error") {
                setHandleError("Error: invalid document!");
              } else {
                pdfArrBuffer = arrayBuffer;
              }
            } else if (
              documentData === "Error: Something went wrong!" ||
              (documentData.result && documentData.result.error)
            ) {
              setHandleError("Error: Something went wrong!");
            } else {
              setHandleError("Document not Found!");
            }
            // Load a PDFDocument from the existing PDF bytes
            const existingPdfBytes = pdfArrBuffer;
            try {
              const pdfDoc = await PDFDocument.load(existingPdfBytes);
              const isSignYourSelfFlow = false;
              const extUserPtr = pdfDetails[0].ExtUserPtr;
              const HeaderDocId = extUserPtr?.HeaderDocId;
              //embed document's object id to all pages in pdf document
              if (!HeaderDocId) {
                if (!isDocId) {
                  await embedDocId(pdfDoc, documentId, allPages);
                }
              }
              //embed multi signature in pdf
              const pdfBytes = await multiSignEmbed(
                widgets,
                pdfDoc,
                isSignYourSelfFlow,
                scale
              );
              // console.log("pdfte", pdfBytes);
              //get ExistUserPtr object id of user class to get tenantDetails
              if (!pdfBytes?.error) {
                const objectId = pdfDetails?.[0]?.ExtUserPtr?.UserId?.objectId;
                //function for call to embed signature in pdf and get digital signature pdf
                const resSign = await signPdfFun(
                  pdfBytes,
                  documentId,
                  signerObjectId,
                  objectId,
                  widgets
                );
                if (resSign && resSign.status === "success") {
                  setPdfUrl(resSign.data);
                  setIsSigned(true);
                  setSignedSigners([]);
                  setUnSignedSigners([]);
                  const isSuccessRoute = pdfDetails?.[0]?.RedirectUrl
                    ? false
                    : window.location?.pathname?.includes("load");
                  const updateDoc = await getDocumentDetails(
                    documentId,
                    true,
                    isSuccessRoute
                  );
                  const index = pdfDetails?.[0]?.Signers.findIndex(
                    (x) => x.objectId === signerObjectId
                  );
                  const newIndex = index + 1;
                  const usermail = {
                    Email: pdfDetails?.[0]?.Placeholders[newIndex]?.email || ""
                  };
                  const user = usermail?.Email
                    ? usermail
                    : pdfDetails?.[0]?.Signers[newIndex];
                  if (sendmail !== "false" && sendInOrder) {
                    const requestBody = pdfDetails?.[0]?.RequestBody;
                    const requestSubject = pdfDetails?.[0]?.RequestSubject;
                    if (user) {
                      const expireDate = pdfDetails?.[0].ExpiryDate.iso;
                      const newDate = new Date(expireDate);
                      const localExpireDate = newDate.toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "long", year: "numeric" }
                      );
                      let senderEmail = pdfDetails?.[0].ExtUserPtr.Email;
                      let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
                      const senderName = `${pdfDetails?.[0].ExtUserPtr.Name}`;

                      try {
                        const imgPng =
                          "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
                        let url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
                        const headers = {
                          "Content-Type": "application/json",
                          "X-Parse-Application-Id":
                            localStorage.getItem("parseAppId"),
                          sessionToken: localStorage.getItem("accesstoken")
                        };
                        const objectId = user?.objectId;
                        const hostUrl = window.location.origin;
                        //encode this url value `${pdfDetails?.[0].objectId}/${user.Email}/${objectId}` to base64 using `btoa` function
                        let encodeBase64;
                        if (objectId) {
                          encodeBase64 = btoa(
                            `${pdfDetails?.[0].objectId}/${user.Email}/${objectId}`
                          );
                        } else {
                          encodeBase64 = btoa(
                            `${pdfDetails?.[0].objectId}/${user.Email}`
                          );
                        }
                        let signPdf =
                              `${hostUrl}/login/${encodeBase64}`;
                        const openSignUrl =
                          "https://www.opensignlabs.com/contact-us";
                        const orgName = pdfDetails[0]?.ExtUserPtr.Company
                          ? pdfDetails[0].ExtUserPtr.Company
                          : "";
                        const themeBGcolor = themeColor;
                        let replaceVar;
                        if (
                          requestBody &&
                          requestSubject
                        ) {
                          const replacedRequestBody = requestBody.replace(
                            /"/g,
                            "'"
                          );
                          const htmlReqBody =
                            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
                            replacedRequestBody +
                            "</body> </html>";

                          const variables = {
                            document_title: pdfDetails?.[0].Name,
                            sender_name:
                              senderName,
                            sender_mail:
                              senderEmail,
                            sender_phone: senderPhone,
                            receiver_name: user?.Name || "",
                            receiver_email: user.Email,
                            receiver_phone: user?.Phone || "",
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
                          replyto:
                            senderEmail ||
                            "",
                          extUserId: extUserId,
                          recipient: user.Email,
                          subject: replaceVar?.subject
                            ? replaceVar?.subject
                            : `${pdfDetails?.[0].ExtUserPtr.Name} has requested you to sign "${pdfDetails?.[0].Name}"`,
                          from:
                            senderEmail,
                          html: replaceVar?.body
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
                              "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                              localExpireDate +
                              "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a target=_blank href=" +
                              signPdf +
                              "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                              senderEmail +
                              " directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= " +
                              openSignUrl +
                              " target=_blank>here</a>.</p> </div></div></body> </html>"
                        };
                        await axios.post(url, params, { headers: headers });
                      } catch (error) {
                        console.log("error", error);
                      }
                    }
                  }
                  if (!isSuccessRoute) {
                    setIsredirectCanceled(false);
                  } else {
                    const url =
                      updateDoc?.[0]?.SignedUrl || updateDoc?.[0]?.URL;
                    const fileAdapter =
                          "";
                    const isCompleted = updateDoc?.[0]?.IsCompleted
                      ? `&completed=true`
                      : "";
                    const params = `docid=${updateDoc[0].objectId}&docurl=${encodeURIComponent(url)}${isCompleted}${fileAdapter}`;
                    window.location.href = `/success?${params}`;
                  }
                } else {
                  setIsUiLoading(false);
                  setIsAlert({
                    title: "Error",
                    isShow: true,
                    alertMessage: resSign.message
                  });
                }
              } else {
                setIsUiLoading(false);
                setIsAlert({
                  title: "Error",
                  isShow: true,
                  alertMessage: t("pdf-uncompatible")
                });
              }
            } catch (err) {
              setIsUiLoading(false);
              if (err && err.message.includes("is encrypted.")) {
                setIsAlert({
                  isShow: true,
                  alertMessage: t("encrypted-pdf-not-support")
                });
              } else {
                console.log("err in request signing", err);
                setIsAlert({
                  isShow: true,
                  alertMessage: t("something-went-wrong-mssg")
                });
              }
            }
          }
          setIsSignPad(false);
        } else {
          setIsAlert({
            isShow: true,
            alertMessage: t("something-went-wrong-mssg")
          });
        }
      } catch (err) {
        console.log("err in embedsign", err);
        setIsUiLoading(false);
        setIsAlert({
          isShow: true,
          alertMessage: t("something-went-wrong-mssg")
        });
      }
    }
  }

  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key) => {
    setDragKey(key);
    setIsDragging(true);
  };
  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement, signerId, key) => {
    if (!isResize && isDragging) {
      let updateSignPos = [...signerPos];
      const signerObjId = signerId ? signerId : uniqueId;
      const keyValue = key ? key : dragKey;
      const containerScale = getContainerScale(
        pdfOriginalWH,
        pageNumber,
        containerWH
      );
      if (keyValue >= 0) {
        let filterSignerPos = [];
        if (signerObjId) {
          //get current signerObjId placeholder details
          filterSignerPos = updateSignPos.filter(
            (data) => data.Id === signerObjId
          );
        }

        if (filterSignerPos.length > 0) {
          const getPlaceHolder = filterSignerPos[0].placeHolder;
          //get position of current pagenumber
          const getPageNumer = getPlaceHolder.filter(
            (data) => data.pageNumber === pageNumber
          );
          if (getPageNumer.length > 0) {
            const getXYdata = getPageNumer[0].pos;
            const addSignPos = getXYdata.map((url) => {
              //add new position after drag widgets
              if (url.key === keyValue) {
                return {
                  ...url,
                  xPosition: dragElement.x / (containerScale * scale),
                  yPosition: dragElement.y / (containerScale * scale)
                };
              }
              return url;
            });
            //update new position of current page number
            const newUpdateSignPos = getPlaceHolder.map((obj) => {
              if (obj.pageNumber === pageNumber) {
                return { ...obj, pos: addSignPos };
              }
              return obj;
            });
            //update new placeholder of current signer
            const newUpdateSigner = updateSignPos.map((obj) => {
              if (signerObjId) {
                if (obj.Id === signerObjId) {
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

  const handleTextSettingModal = (value) => {
    setIsTextSetting(value);
  };
  const handleSaveFontSize = () => {
    const filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
    if (filterSignerPos) {
      const placehoder = filterSignerPos[0].placeHolder;
      const getPageNumer = placehoder.filter(
        (data) => data.pageNumber === pageNumber
      );
      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;
        const getPosData = getXYdata;
        const updateSignPos = getPosData.map((position) => {
          if (position.key === signKey) {
            return {
              ...position,
              options: {
                ...position.options,
                fontSize:
                  fontSize || currWidgetsDetails?.options?.fontSize || 12,
                fontColor:
                  fontColor || currWidgetsDetails?.options?.fontColor || "black"
              }
            };
          }
          return position;
        });

        //update new position of current page number
        const newUpdateSignPos = placehoder.map((obj) => {
          if (obj.pageNumber === pageNumber) {
            return { ...obj, pos: updateSignPos };
          }
          return obj;
        });
        //update new placeholder of current signer
        const newUpdateSigner = signerPos.map((obj) => {
          if (obj.Id === uniqueId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }

          return obj;
        });
        setSignerPos(newUpdateSigner);

        setFontSize();
        setFontColor();
        handleTextSettingModal(false);
      }
    }
  };
  //function for update TourStatus
  const closeTour = async () => {
    setWidgetsTour(false);
  };

  const tourConfig = [
    {
      selector: '[data-tut="IsSigned"]',
      content: minRequiredCount
        ? t("signature-validate-alert", { minRequiredCount })
        : t("signature-validate-alert-2"),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  //function for get pdf page details
  const pageDetails = async (pdf) => {
    let pdfWHObj = [];
    const totalPages = pdf.numPages; // Get the total number of pages
    for (let index = 0; index < totalPages; index++) {
      const getPage = await pdf.getPage(index + 1);
      const scale = 1;
      const { width, height } = getPage.getViewport({ scale });
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    }
    setPdfOriginalWH(pdfWHObj);
    setPdfLoad(true);
  };
  //function for change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      compressedFileSize(file, setImgWH, setImage);
    }
  };
  //function for upload stamp image
  const saveImage = () => {
    const widgetsType = currWidgetsDetails?.type;
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
    //`isApplyAll` is used when user edit stamp then updated signature apply all existing drawn signatures
    const isApplyAll = true;
    //function of save image and get updated position with image url
    const getUpdatePosition = onSaveImage(
      placeholderPosition,
      getIndex,
      signKey,
      imgWH,
      image,
      isAutoSign,
      widgetsType,
      isApplyAll
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
    setIsAutoSign(false);
  };
  //function for save button to save signature or image url
  const saveSign = (type, isDefaultSign, width, height, typedSignature) => {
    const widgetsType = currWidgetsDetails?.type;
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
        imgWH = { width: img.width, height: img.height };
      }
    }
    //get current signer placeholder position data
    const placeholderPosition = currentSigner[0].placeHolder;
    //`isApplyAll` is used when user edit signature/initial then updated signature apply all existing drawn signatures
    const isApplyAll = true;
    //function of save signature image and get updated position with signature image url
    const getUpdatePosition = onSaveSign(
      type,
      placeholderPosition,
      getIndex,
      signKey,
      signatureImg,
      imgWH,
      isDefaultSign,
      isTypeText,
      typedSignature,
      isAutoSign,
      widgetsType,
      isApplyAll
    );
    const updateSignerData = currentSigner.map((obj) => {
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

    setIsAutoSign(false);
  };
  //function for set decline true on press decline button
  const declineDoc = async (reason) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsDecline({ isDeclined: false });
    setIsUiLoading(true);
    const userId =
      pdfDetails?.[0].Signers?.find((x) => x.objectId === signerObjectId)
        ?.UserId?.objectId || jsonSender?.objectId;
    const params = {
      docId: pdfDetails?.[0].objectId,
      reason: reason,
      userId: userId
    };
    await axios
      .post(`${localStorage.getItem("baseUrl")}functions/declinedoc`, params, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      })
      .then(async (result) => {
        const res = result.data;
        if (res) {
          const currentDecline = { currnt: "YouDeclined", isDeclined: true };
          setIsDecline(currentDecline);
          setIsUiLoading(false);
        }
      })
      .catch((err) => {
        console.log("error updating field is decline ", err);
        setIsUiLoading(false);
        setIsAlert({
          title: "Error",
          isShow: true,
          alertMessage: t("something-went-wrong-mssg")
        });
      });
  };
  //function to add default signature for all requested placeholder of sign
  const addDefaultSignature = () => {
    const type = defaultSignAlert?.type;
    //get current signers placeholder position data
    const currentSignerPosition = signerPos.filter(
      (data) => data.signerObjId === signerObjectId
    );
    const defaultSign = type === "signature" ? defaultSignImg : myInitial;
    //function for save default signature url for all placeholder position
    const updatePlace = addDefaultSignatureImg(
      currentSignerPosition[0].placeHolder,
      defaultSign,
      type
    );

    const updatesignerPos = signerPos.map((x) =>
      x.signerObjId === signerObjectId ? { ...x, placeHolder: updatePlace } : x
    );
    setSignerPos(updatesignerPos);
    setDefaultSignAlert({ isShow: false, alertMessage: "" });
  };
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  //function to close tour and save tour status
  const closeRequestSignTour = async () => {
    setRequestSignTour(true);
    if (isDontShow) {
      const isEnableOTP = pdfDetails?.[0]?.IsEnableOTP || false;
      if (!isEnableOTP) {
        try {
          await axios.post(
            `${localStorage.getItem("baseUrl")}functions/updatecontacttour`,
            { contactId: signerObjectId },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId")
              }
            }
          );
        } catch (e) {
          console.log("update tour messages error", e);
        }
      } else {
        let updatedTourStatus = [];
        if (tourStatus.length > 0) {
          updatedTourStatus = [...tourStatus];
          const requestSignIndex = tourStatus.findIndex(
            (obj) => obj["requestSign"] === false || obj["requestSign"] === true
          );
          if (requestSignIndex !== -1) {
            updatedTourStatus[requestSignIndex] = { requestSign: true };
          } else {
            updatedTourStatus.push({ requestSign: true });
          }
        } else {
          updatedTourStatus = [{ requestSign: true }];
        }
        try {
          await axios.put(
            `${localStorage.getItem(
              "baseUrl"
            )}classes/contracts${contractName}/${signerUserId}`,
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
          );
        } catch (e) {
          console.log("update tour messages error", e);
        }
      }
    }
  };
  const formatArrayToString = (arr) => {
    if (arr.length === 0) return ""; // Handle empty array
    if (arr.length === 1) return `${arr[0]}`; // Handle single-element array

    const lastElement = arr.pop(); // Remove and store the last element
    return `${arr.join(", ")} ${t("and")} ${lastElement}`; // Format the string
  };
  const requestSignTourFunction = () => {
    const pagenumbers = formatArrayToString(showSignPagenumber);
    const tourConfig = [
      {
        selector: '[data-tut="IsSigned"]',
        content: () => (
          <TourContentWithBtn
            message={t("tour-mssg.pdf-request-file-6", { pagenumbers })}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourFirst"]',
        content: () => (
          <TourContentWithBtn
            message={t("tour-mssg.pdf-request-file-1")}
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
            message={t("tour-mssg.pdf-request-file-2")}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourFifth"]',
        content: () => (
          <TourContentWithBtn
            message={t("tour-mssg.pdf-request-file-3")}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      }
    ];
    const signedByStep = {
      selector: '[data-tut="reactourSecond"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.pdf-request-file-4")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    };
    //checking if signed by user component exist then add signed by tour step
    const signedBy =
      signedSigners.length > 0
        ? [...tourConfig.slice(0, 0), signedByStep, ...tourConfig.slice(0)]
        : tourConfig;

    //checking if default signature component exist then add defaultSign tour step
    const defaultSignStep = {
      selector: '[data-tut="reactourThird"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.pdf-request-file-5")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    };
    //checking if AllowModifications is true then add allow widgets panel tour step
    const allModifyWidgets = {
      selector: '[data-tut="reactourFourth"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.allowModify-widgets")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    };

    //handle signed by panel index if signed by exist then 2 else 1 to add tour step
    const index = signedSigners.length > 0 ? 3 : 2;
    let defaultSignTour = defaultSignImg
      ? [...signedBy.slice(0, index), defaultSignStep, ...signedBy.slice(index)]
      : signedBy;
    //handle index when AllowModifications is true and defaultSignImg & signedSigners both exist or only
    //signedSigners or defaultSignImg exist then adjust index
    const modifyIndex =
      signedSigners > 0 && defaultSignImg
        ? 4
        : signedSigners > 0 || defaultSignImg
          ? 3
          : 2;
    if (pdfDetails[0]?.AllowModifications) {
      defaultSignTour = [
        ...defaultSignTour.slice(0, modifyIndex),
        allModifyWidgets,
        ...defaultSignTour.slice(modifyIndex)
      ];
    }
    let mobileTour;
    if (isMobile) {
      mobileTour = tourConfig.filter((_, ind) => ind !== 1);
    }
    return (
      <Tour
        onRequestClose={closeRequestSignTour}
        steps={isMobile ? mobileTour : defaultSignTour}
        isOpen={true}
        closeWithMask={false}
        rounded={5}
      />
    );
  };


  const clickOnZoomIn = () => {
    onClickZoomIn(scale, zoomPercent, setScale, setZoomPercent);
  };
  const clickOnZoomOut = () => {
    onClickZoomOut(zoomPercent, scale, setZoomPercent, setScale);
  };
  const handleDownloadBtn = async () => {
    const url = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
    const name =
      pdfDetails?.[0]?.Name?.length > 100
        ? pdfDetails?.[0]?.Name?.slice(0, 100)
        : pdfDetails?.[0]?.Name || "Document";
    await fetchUrl(url, name);
  };
  const handleDeclineMssg = () => {
    const user = pdfDetails[0]?.DeclineBy?.email;
    return (
      <div>
        {t("decline-alert-3")}
        <div className="mt-2">
          {" "}
          <span className="font-medium">{t("decline-by")}</span> : {user}
        </div>
        <div className="mt-2">
          {" "}
          <span className="font-medium">{t("reason")}</span> :{" "}
          {pdfDetails[0]?.DeclineReason}{" "}
        </div>
      </div>
    );
  };

  const handleExpiry = async (expiryDate) => {
    setIsUiLoading(true);
    const doc = pdfDetails?.[0];
    const oldExpiryDate = new Date(doc?.ExpiryDate?.iso);
    const newExpiryDate = new Date(expiryDate);
    if (newExpiryDate > oldExpiryDate) {
      const updateExpiryDate = new Date(expiryDate).toISOString();
      const expiryIsoFormat = { iso: updateExpiryDate, __type: "Date" };
      try {
        const serverUrl = serverUrl_fn();
        const url = serverUrl + `/classes/contracts_Document/`;
        const body = { ExpiryDate: expiryIsoFormat };
        const res = await axios.put(url + doc.objectId, body, {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        });
        if (res.data && res.data.updatedAt) {
          setIsExpired(false);
          let doc = pdfDetails?.[0];
          doc.ExpiryDate = expiryIsoFormat;
          setPdfDetails([doc]);
        }
      } catch (err) {
        console.log("err", err);
      } finally {
        setIsUiLoading(false);
      }
    } else {
      setIsUiLoading(false);
      alert(t("expiry-date-error"));
    }
  };
  const AgreementTour = [
    {
      selector: '[data-tut="IsAgree"]',
      content: () => <p className="p-0">{t("agrrement-alert")}</p>,
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  const handleCloseAgreeTour = () => {
    setIsAgreeTour(false);
  };
  // `handleRedirectCancel` is used to cancel redirecting to redirectUrl
  const handleRedirectCancel = () => {
    setIsredirectCanceled(true);
  };
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
  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    getSignerPos(item, monitor);
  };
  const getSignerPos = (item, monitor) => {
    const posZIndex = zIndex + 1;
    setZIndex(posZIndex);
    const key = randomId();
    const containerScale = getContainerScale(
      pdfOriginalWH,
      pageNumber,
      containerWH
    );
    let dropData = [];
    let placeHolder;
    const dragTypeValue = item?.text ? item.text : monitor.type;
    const widgetWidth =
      defaultWidthHeight(dragTypeValue).width * containerScale;
    const widgetHeight =
      defaultWidthHeight(dragTypeValue).height * containerScale;
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
      const getXPosition = signBtnPosition[0] ? x - signBtnPosition[0].xPos : x;
      const getYPosition = signBtnPosition[0] ? y - signBtnPosition[0].yPos : y;
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
    if (uniqueId) {
      let filterSignerPos, currentPagePosition;
      filterSignerPos = signerPos.find((data) => data.Id === uniqueId);
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

      // if (dragTypeValue === "dropdown") {
      //   setShowDropdown(true);
      // } else if (dragTypeValue === "checkbox") {
      //   setIsCheckbox(true);
      // } else
      if (
        [textWidget, "name", "company", "job title", "email"].includes(
          dragTypeValue
        )
      ) {
        setFontSize(12);
        setFontColor("black");
      }
      setWidgetType(dragTypeValue);
      setSignKey(key);
      setCurrWidgetsDetails({});
    }
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
  //function to get first widget and page number to assign currect signer and tour message
  const showFirstWidget = () => {
    if (!requestSignTour) {
      const getCurrentUserPlaceholder = signerPos.find(
        (x) => x.Id === uniqueId
      );
      const placeholder = getCurrentUserPlaceholder.placeHolder;
      //checking minimum pagnumber of existing widgets and throw tour message on that page
      const getPosition = placeholder.reduce(
        (min, obj) => (obj.pageNumber < min.pageNumber ? obj : min),
        placeholder[0]
      );
      const getWidgetId = getPosition.pos[0].key;
      setUnSignedWidgetId(getWidgetId);
      setPageNumber(getPosition.pageNumber);
      let pagenumber = [];
      for (let item of getCurrentUserPlaceholder.placeHolder) {
        pagenumber.push(item.pageNumber);
      }
      // Sort the pagenumber in ascending order
      const sortedPagenumber = [...pagenumber].sort((a, b) => a - b);
      setShowSignPagenumber(sortedPagenumber);
    }
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <Title
        title={
              "Request Sign"
        }
      />
          {isLoading.isLoad ? (
            <LoaderWithMsg isLoading={isLoading} />
          ) : handleError ? (
            <HandleError handleError={handleError} />
          ) : (
            <div>
              {!isAgree &&
                currentSigner &&
                !isExpired &&
                !alreadySign &&
                !isCompleted?.isCertificate &&
                !isDecline?.isDeclined && (
                  <AgreementSign
                    setIsAgree={setIsAgree}
                    setIsAgreeTour={setIsAgreeTour}
                    showFirstWidget={showFirstWidget}
                  />
                )}
              <Tour
                showNumber={false}
                showNavigation={false}
                showNavigationNumber={false}
                onRequestClose={handleCloseAgreeTour}
                steps={AgreementTour}
                isOpen={isAgreeTour}
                rounded={5}
                closeWithMask={false}
              />

              {isUiLoading && (
                <div className="absolute h-[100vh] w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2] bg-opacity-80">
                  <Loader />
                  <span className="text-[13px] text-base-content">
                    {t("loading-mssg")}
                  </span>
                </div>
              )}
              {isUiLoading && (
                <div className="absolute h-[100vh] w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2] bg-opacity-80">
                  <Loader />
                  <span className="text-[13px] text-base-content">
                    {t("loading-mssg")}
                  </span>
                </div>
              )}
              {isCelebration && (
                <div className="relative z-[1000]">
                  <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false} // Prevents confetti from repeating
                    gravity={0.1} // Adjust the gravity to control the speed
                  />
                </div>
              )}
              <div
                style={{
                  pointerEvents:
                    isExpired ||
                    (isDecline.isDeclined && isDecline.currnt === "another")
                      ? "none"
                      : "auto"
                }}
                className={`${
                      isGuestSignFlow
                      ? "border-[0.5px] border-gray-300"
                      : "op-card"
                } relative overflow-hidden flex flex-col md:flex-row justify-between bg-base-300`}
              >
                {!requestSignTour &&
                  isAgree &&
                  signerObjectId &&
                  requestSignTourFunction()}
                <Tour
                  showNumber={false}
                  showNavigation={false}
                  showNavigationNumber={false}
                  onRequestClose={closeTour}
                  steps={tourConfig}
                  isOpen={widgetsTour}
                  rounded={5}
                  closeWithMask={false}
                />

                {/* this modal is used to show decline alert */}
                <PdfDeclineModal
                  show={isDecline.isDeclined}
                  headMsg={t("document-declined")}
                  bodyMssg={
                    isDecline.currnt === "Sure"
                      ? t("decline-alert-1")
                      : isDecline.currnt === "YouDeclined"
                        ? t("decline-alert-2")
                        : isDecline.currnt === "another" && handleDeclineMssg()
                  }
                  footerMessage={isDecline.currnt === "Sure"}
                  declineDoc={declineDoc}
                  setIsDecline={setIsDecline}
                />
                {/* this modal is used for show expired alert */}
                <PdfDeclineModal
                  show={isExpired}
                  doc={pdfDetails?.[0]}
                  headMsg={t("expired-doc-title")}
                  bodyMssg={t("expired-on-mssg", { expiredDate })}
                  isDownloadBtn={true}
                  handleDownloadBtn={handleDownloadBtn}
                  handleExpiry={handleExpiry}
                />
                <ModalUi
                  isOpen={defaultSignAlert.isShow}
                  title={t("auto-sign-all")}
                  handleClose={() =>
                    setDefaultSignAlert({ isShow: false, alertMessage: "" })
                  }
                >
                  <div className="h-full p-[20px]">
                    <p>{defaultSignAlert.alertMessage}</p>
                    <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                    {defaultSignImg ? (
                      <>
                        <button
                          onClick={() => addDefaultSignature()}
                          type="button"
                          className="op-btn op-btn-primary"
                        >
                          {t("yes")}
                        </button>
                        <button
                          onClick={() =>
                            setDefaultSignAlert({
                              isShow: false,
                              alertMessage: ""
                            })
                          }
                          type="button"
                          className="op-btn op-btn-secondary ml-1"
                        >
                          {t("close")}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setIsAlert({ isShow: false, alertMessage: "" })
                        }
                        type="button"
                        className="op-btn op-btn-primary"
                      >
                        {t("ok")}
                      </button>
                    )}
                  </div>
                </ModalUi>
                {/* this component used to render all pdf pages in left side */}
                <RenderAllPdfPage
                  signerPos={signerPos}
                  id={uniqueId}
                  allPages={allPages}
                  setAllPages={setAllPages}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  containerWH={containerWH}
                  pdfBase64Url={pdfBase64Url}
                  signedUrl={pdfDetails?.[0]?.SignedUrl || ""}
                />
                {/* pdf render view */}
                <div className=" w-full md:w-[57%] flex mr-4">
                  <PdfZoom
                    clickOnZoomIn={clickOnZoomIn}
                    clickOnZoomOut={clickOnZoomOut}
                    isDisableEditTools={true}
                    allPages={allPages}
                    setAllPages={setAllPages}
                    setPageNumber={setPageNumber}
                  />
                  <PlaceholderCopy
                    isPageCopy={isPageCopy}
                    setIsPageCopy={setIsPageCopy}
                    xyPosition={signerPos}
                    setXyPosition={setSignerPos}
                    allPages={allPages}
                    pageNumber={pageNumber}
                    signKey={signKey}
                    Id={uniqueId}
                    widgetType={widgetType}
                    setUniqueId={setUniqueId}
                  />
                  <div className=" w-full md:w-[95%] ">
                    {/* this modal is used show this document is already sign */}
                    <ModalUi
                      isOpen={isCompleted.isModal}
                      title={t("document-signed")}
                      handleClose={() =>
                        setIsCompleted((prev) => ({ ...prev, isModal: false }))
                      }
                      reduceWidth={
                        !isCompleted?.message &&
                        "md:min-w-[440px] md:max-w-[400px]"
                      }
                    >
                      <div className="h-full p-[20px] text-base-content">
                        {isCompleted?.message ? (
                          <>
                            <p>{isCompleted?.message}</p>
                            {!isredirectCanceled && redirectUrl && (
                              <div className="flex flex-row gap-1 items-center justify-center mb-3 mt-2">
                                <p>
                                  Redirecting you in {redirectTimeLeft} sec...
                                </p>
                                <button
                                  onClick={handleRedirectCancel}
                                  className="underline cursor-pointer op-text-primary focus:outline-none ml-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="px-[15px]">
                            <span>{t("document-signed-alert-4")}</span>
                          </div>
                        )}
                        {!isCompleted?.message && (
                          <div className="flex flex-col mt-3 gap-1 px-[10px] justify-center items-center">
                            {!isredirectCanceled && redirectUrl && (
                              <div className="flex flex-row gap-1 items-center justify-center mb-3">
                                <p>
                                  Redirecting you in {redirectTimeLeft} sec...
                                </p>
                                <button
                                  onClick={handleRedirectCancel}
                                  className="underline cursor-pointer op-text-primary focus:outline-none ml-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            <div className={`${!redirectUrl ? "m-2" : ""}`}>
                              <button
                                onClick={(e) =>
                                  handleToPrint(e, setIsDownloading, pdfDetails)
                                }
                                type="button"
                                className="font-[500] text-[13px] mr-[5px] op-btn op-btn-neutral"
                              >
                                <i
                                  className="fa-light fa-print"
                                  aria-hidden="true"
                                ></i>
                                <span className="hidden lg:block">
                                  {t("print")}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadCertificate(
                                    pdfDetails,
                                    setIsDownloading
                                  )
                                }
                                className="font-[500] text-[13px] mr-[5px] op-btn op-btn-secondary"
                              >
                                <i
                                  className="fa-light fa-award mx-[3px] lg:mx-0"
                                  aria-hidden="true"
                                ></i>
                                <span className="hidden lg:block">
                                  {t("certificate")}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="font-[500] text-[13px] mr-[5px] op-btn op-btn-primary"
                                onClick={() => {
                                  setIsCompleted((prev) => ({
                                    ...prev,
                                    isModal: false
                                  }));
                                  setIsDownloadModal(true);
                                }}
                              >
                                <i
                                  className="fa-light fa-download"
                                  aria-hidden="true"
                                ></i>
                                <span className="hidden lg:block">
                                  {t("download")}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </ModalUi>
                    {isDownloading === "pdf" && (
                      <div className="fixed z-[1000] inset-0 flex justify-center items-center bg-black bg-opacity-30">
                        <Loader />
                      </div>
                    )}
                    <ModalUi
                      isOpen={
                        isDownloading === "certificate" ||
                        isDownloading === "certificate_err"
                      }
                      title={
                        isDownloading === "certificate" ||
                        isDownloading === "certificate_err"
                          ? t("generating-certificate")
                          : t("pdf-download")
                      }
                      handleClose={() => setIsDownloading("")}
                    >
                      <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
                        {isDownloading === "certificate" ? (
                          <p>{t("generate-certificate-alert")}</p>
                        ) : (
                          <p>{t("generate-certificate-err")}</p>
                        )}
                      </div>
                    </ModalUi>
                    {/* this component is used for signature pad modal */}
                    {documentId && isSignPad && (
                      <SignPad
                        saveSignCheckbox={saveSignCheckbox}
                        setSaveSignCheckbox={setSaveSignCheckbox}
                        signatureTypes={signatureType}
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
                        setDefaultSignImg={setDefaultSignImg}
                        setMyInitial={setMyInitial}
                        isInitial={isInitial}
                        setIsInitial={setIsInitial}
                        setIsStamp={setIsStamp}
                        currWidgetsDetails={currWidgetsDetails}
                        setCurrWidgetsDetails={setCurrWidgetsDetails}
                        setIsAutoSign={setIsAutoSign}
                        isAutoSign={isAutoSign}
                      />
                    )}
                    {/* pdf header which contain funish back button */}
                    <Header
                      isPdfRequestFiles={
                            true
                      }
                      pageNumber={pageNumber}
                      allPages={allPages}
                      changePage={changePage}
                      pdfDetails={pdfDetails}
                      signerPos={signerPos}
                      isSigned={isSigned}
                      isCompleted={isCompleted.isCertificate}
                      embedWidgetsData={
                            embedWidgetsData
                      }
                      isShowHeader={true}
                      setIsDecline={setIsDecline}
                      decline={true}
                      currentSigner={currentSigner}
                      alreadySign={alreadySign}
                      containerWH={containerWH}
                      clickOnZoomIn={clickOnZoomIn}
                      clickOnZoomOut={clickOnZoomOut}
                      isDisablePdfEditTools={true}
                      setIsDownloadModal={setIsDownloadModal}
                      pdfBase64={pdfBase64Url}
                      isGuestSignFlow={isGuestSignFlow}
                    />

                    <div
                      ref={divRef}
                      data-tut="pdfArea"
                      className="h-full md:h-[95%]"
                    >
                      {containerWH && (
                        <RenderPdf
                          setIsPageCopy={setIsPageCopy}
                          drop={drop}
                          pageNumber={pageNumber}
                          pdfOriginalWH={pdfOriginalWH}
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
                          setPdfLoad={setPdfLoad}
                          pdfLoad={pdfLoad}
                          setSignerPos={setSignerPos}
                          containerWH={containerWH}
                          setIsInitial={setIsInitial}
                          setValidateAlert={setValidateAlert}
                          unSignedWidgetId={unSignedWidgetId}
                          setSelectWidgetId={setSelectWidgetId}
                          selectWidgetId={selectWidgetId}
                          setCurrWidgetsDetails={setCurrWidgetsDetails}
                          divRef={divRef}
                          setIsResize={setIsResize}
                          isResize={isResize}
                          setScale={setScale}
                          scale={scale}
                          uniqueId={uniqueId}
                          pdfBase64Url={pdfBase64Url}
                          setIsAgreeTour={setIsAgreeTour}
                          isAgree={isAgree}
                          handleTabDrag={handleTabDrag}
                          handleStop={handleStop}
                          isDragging={isDragging}
                          isAlllowModify={pdfDetails[0]?.AllowModifications}
                          setUniqueId={setUniqueId}
                          handleDeleteSign={handleDeleteSign}
                          handleTextSettingModal={handleTextSettingModal}
                          setWidgetType={setWidgetType}
                          assignedWidgetId={assignedWidgetId}
                          setRequestSignTour={setRequestSignTour}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[23%] bg-base-100 overflow-y-auto hide-scrollbar ">
                  <div className={`max-h-screen`}>
                    <div className="w-full hidden md:inline-block">
                      {signedSigners.length > 0 && (
                        <>
                          <div
                            data-tut="reactourSecond"
                            className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300"
                          >
                            <span>{t("signed-by")}</span>
                          </div>
                          <div className="mt-[2px]">
                            {signedSigners.map((obj, ind) => {
                              return (
                                <div key={ind}>
                                  <SignerListComponent
                                    ind={ind}
                                    obj={obj}
                                    isMenu={isHeader}
                                    signerPos={signerPos}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {unsignedSigners.length > 0 && (
                        <>
                          <div
                            data-tut="reactourFirst"
                            className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300"
                          >
                            <span>{t("yet-to-sign")}</span>
                          </div>
                          <div className="mt-[5px]">
                            {unsignedSigners.map((obj, ind) => {
                              return (
                                <div key={ind}>
                                  <SignerListComponent
                                    ind={ind}
                                    obj={obj}
                                    isMenu={isHeader}
                                    signerPos={signerPos}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      {(defaultSignImg || myInitial) &&
                        !alreadySign &&
                        currentSigner && (
                          <DefaultSignature
                            defaultSignImg={defaultSignImg}
                            myInitial={myInitial}
                            userObjectId={signerObjectId}
                            setIsLoading={setIsLoading}
                            xyPosition={signerPos}
                            uniqueId={uniqueId}
                            setDefaultSignAlert={setDefaultSignAlert}
                            isDefault={
                              signatureType?.find((x) => x.name === "default")
                                ?.enabled || false
                            }
                            isAgree={isAgree}
                            setIsAgreeTour={setIsAgreeTour}
                          />
                        )}
                    </div>
                    {pdfDetails[0]?.AllowModifications &&
                      currentSigner &&
                      !alreadySign && (
                        <div data-tut="reactourFourth">
                          <WidgetComponent
                            pdfUrl={pdfUrl}
                            handleDivClick={handleDivClick}
                            handleMouseLeave={handleMouseLeave}
                            xyPosition={signerPos}
                            addPositionOfSignature={addPositionOfSignature}
                            isAlllowModify={true}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <ModalUi
            isOpen={validateAlert}
            title={t("validation-alert")}
            handleClose={() => setValidateAlert(false)}
          >
            <div className="h-[100%] p-[20px]">
              <p>{t("validation-alert-1")}</p>
              <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
              <button
                onClick={() => setValidateAlert(false)}
                type="button"
                className="op-btn op-btn-ghost"
              >
                {t("close")}
              </button>
            </div>
          </ModalUi>
          <DownloadPdfZip
            setIsDownloadModal={setIsDownloadModal}
            isDownloadModal={isDownloadModal}
            pdfDetails={pdfDetails}
            isDocId={true}
            pdfBase64={pdfBase64Url}
          />
          <ModalUi
            isOpen={isAlert.isShow}
            title={isAlert?.title || t("alert-message")}
            handleClose={() => setIsAlert({ isShow: false, alertMessage: "" })}
          >
            <div className="h-full p-[20px]">
              <p>{isAlert.alertMessage}</p>
              <button
                onClick={() => setIsAlert({ isShow: false, alertMessage: "" })}
                type="button"
                className="op-btn op-btn-primary mt-3 px-4"
              >
                {t("close")}
              </button>
            </div>
          </ModalUi>
          <TextFontSetting
            isTextSetting={isTextSetting}
            setIsTextSetting={setIsTextSetting}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontColor={fontColor}
            setFontColor={setFontColor}
            handleSaveFontSize={handleSaveFontSize}
            currWidgetsDetails={currWidgetsDetails}
          />
    </DndProvider>
  );
}
export default PdfRequestFiles;
