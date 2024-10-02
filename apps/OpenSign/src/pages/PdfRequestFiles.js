import React, { useState, useRef, useEffect } from "react";
import { isEnableSubscription, isStaging, themeColor } from "../constant/const";
import { PDFDocument } from "pdf-lib";
import "../styles/signature.css";
import Parse from "parse";
import axios from "axios";
import { DndProvider } from "react-dnd";
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
  onImageSelect,
  onSaveSign,
  onSaveImage,
  addDefaultSignatureImg,
  radioButtonWidget,
  replaceMailVaribles,
  fetchSubscription,
  convertPdfArrayBuffer,
  contractUsers,
  handleSendOTP,
  contactBook,
  handleToPrint,
  handleDownloadCertificate,
  getDefaultSignature,
  onClickZoomIn,
  onClickZoomOut,
  fetchUrl
} from "../constant/Utils";
import Header from "../components/pdf/PdfHeader";
import RenderPdf from "../components/pdf/RenderPdf";
import Title from "../components/Title";
import DefaultSignature from "../components/pdf/DefaultSignature";
import { useSelector } from "react-redux";
import SignerListComponent from "../components/pdf/SignerListComponent";
import VerifyEmail from "../components/pdf/VerifyEmail";
import PdfZoom from "../components/pdf/PdfZoom";
import { useTranslation } from "react-i18next";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import DownloadPdfZip from "../primitives/DownloadPdfZip";
import Loader from "../primitives/Loader";
import PdfDeclineModal from "../primitives/PdfDeclineModal";

function PdfRequestFiles(props) {
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
  const [otpLoader, setOtpLoader] = useState(false);
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
  const [isSubscribed, setIsSubscribed] = useState(false);
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
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [extUserId, setExtUserId] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [contractName, setContractName] = useState("");
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [uniqueId, setUniqueId] = useState("");
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [isOtp, setIsOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publicRes, setPublicRes] = useState({});
  const [documentId, setDocumentId] = useState("");
  const [isPublicContact, setIsPublicContact] = useState(false);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState("");
  const [plancode, setPlanCode] = useState("");
  const isHeader = useSelector((state) => state.showHeader);
  const divRef = useRef(null);
  const [isDownloadModal, setIsDownloadModal] = useState(false);

  const isMobile = window.innerWidth < 767;

  let isGuestSignFlow = false;
  let sendmail;
  let getDocId = "";
  let contactBookId = "";
  const route = !props.templateId && window.location.pathname;
  const getQuery = !props.templateId && window.location?.search?.split("?"); //['','sendmail=false']
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
    } else if (props.templateId) {
      getTemplateDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.templateId, getDocumentId]);
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
  //function to use resend otp for email verification
  const handleResend = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    await handleSendOTP(currentUser?.email);
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    try {
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: currentUser?.email
      });
      if (resEmail?.message === "Email is verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-1"));
      } else if (resEmail?.message === "Email is already verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-2"));
      }
      setOtp("");
      setIsVerifyModal(false);
      //handleRecipientSign();
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };
  //`handleVerifyBtn` function is used to send otp on user mail
  const handleVerifyBtn = async () => {
    setIsVerifyModal(true);
    const localuser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const currentUser = JSON.parse(localuser);
    await handleSendOTP(currentUser?.email);
  };

  const handleNavigation = () => {
    window.location.href = "/subscription";
  };
  async function checkIsSubscribed(extUserId, contactId) {
    const isGuestSign = isGuestSignFlow || false;
    const isPublic = props.templateId ? true : false;
    const res = await fetchSubscription(
      extUserId,
      contactId,
      isGuestSign,
      isPublic
    );
    const plan = res.plan;
    const billingDate = res?.billingDate;
    const status = res?.status;
    setPlanCode(plan);
    if (plan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (new Date(billingDate) > new Date()) {
        setIsSubscribed(true);
        return true;
      } else {
        if (isGuestSign) {
          setIsSubscriptionExpired(true);
        } else {
          handleNavigation(plan);
        }
      }
    } else if (isGuestSign) {
      if (status) {
        setIsSubscribed(true);
        return true;
      } else {
        setIsSubscriptionExpired(true);
      }
    } else {
      if (isGuestSign) {
        setIsSubscriptionExpired(true);
      } else {
        handleNavigation(res.plan);
      }
    }
  }
  //function for get document details for perticular signer with signer'object id
  //whenever change anything in this function check react/angular packages also in plan js
  const getTemplateDetails = async () => {
    try {
      const params = { templateId: props.templateId, ispublic: true };
      const templateDeatils = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessiontoken: localStorage.getItem("accesstoken")
          }
        }
      );
      const documentData = templateDeatils?.data?.result
        ? [templateDeatils?.data?.result]
        : [];
      if (documentData && documentData[0]?.error) {
        props?.setTemplateStatus &&
          props?.setTemplateStatus({
            status: "Invalid"
          });
        throw new Error("error: Invalid TemplateId");
      } else if (documentData && documentData.length > 0) {
        if (documentData[0]?.IsPublic) {
          //handle condition when someone use plan js then setTemplateStatus is not supporting
          props?.setTemplateStatus &&
            props?.setTemplateStatus({
              status: "Success"
            });
          const url =
            documentData[0] &&
            (documentData[0]?.SignedUrl || documentData[0]?.URL);
          if (url) {
            //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
            const arrayBuffer = await convertPdfArrayBuffer(url);
            if (arrayBuffer === "Error") {
              setHandleError(t("something-went-wrong-mssg"));
            } else {
              setPdfArrayBuffer(arrayBuffer);
            }
          } else {
            setHandleError(t("something-went-wrong-mssg"));
          }
          setIsPublicTemplate(true);
          const getPublicRole = documentData[0]?.PublicRole[0];
          const getUniqueIdDetails = documentData[0]?.Placeholders.find(
            (x) => x.Role === getPublicRole
          );
          if (getUniqueIdDetails) {
            setUniqueId(getUniqueIdDetails.Id);
          }
          setSignerPos(documentData[0]?.Placeholders);
          let placeholdersOrSigners = [];
          // const placeholder = documentData[0]?.Placeholders;
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
          setUnSignedSigners(placeholdersOrSigners);
          setPdfDetails(documentData);
          setIsLoading({
            isLoad: false
          });
        } else {
          props?.setTemplateStatus &&
            props?.setTemplateStatus({
              status: "Private"
            });
          setIsLoading(false);
          setHandleError(t("something-went-wrong-mssg"));
          console.error("error:  TemplateId is not public");
          return;
        }
      } else {
        props?.setTemplateStatus &&
          props?.setTemplateStatus({
            status: "Invalid"
          });
        setIsLoading(false);
        setHandleError(t("something-went-wrong-mssg"));
        console.error("error: Invalid TemplateId");
        return;
      }
    } catch (err) {
      setIsLoading(false);
      if (err?.response?.data?.code === 101) {
        setHandleError(t("error-template"));
      } else {
        setHandleError(t("something-went-wrong-mssg"));
      }
      console.error("error: Invalid TemplateId");
      return;
    }
  };
  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (docId, isNextUser) => {
    try {
      const senderUser = localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      );
      const jsonSender = JSON.parse(senderUser);
      // `currUserId` will be contactId or extUserId
      let currUserId;
      //getting document details
      const documentData = await contractDocument(docId);
      if (documentData && documentData.length > 0) {
        const url =
          documentData[0] &&
          (documentData[0]?.SignedUrl || documentData[0]?.URL);
        if (url) {
          //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
          const arrayBuffer = await convertPdfArrayBuffer(url);
          if (arrayBuffer === "Error") {
            setHandleError(t("something-went-wrong-mssg"));
          } else {
            setPdfArrayBuffer(arrayBuffer);
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
        const getCurrentSigner = getSigners?.find(
          (data) => data.UserId.objectId === jsonSender?.objectId
        );

        currUserId = getCurrentSigner?.objectId
          ? getCurrentSigner.objectId
          : contactBookId || signerObjectId || "";
        if (isEnableSubscription) {
          await checkIsSubscribed(
            documentData[0]?.ExtUserPtr?.objectId,
            currUserId
          );
        }
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
          const data = { isCertificate: true, isModal: true };
          setAlreadySign(true);
          setIsCompleted(data);
          setIsCelebration(true);
          setTimeout(() => setIsCelebration(false), 5000);
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
          setIsCompleted({
            isModal: true,
            message: t("document-signed-alert-1")
          });
        } else {
          if (currUserId) {
            const checkCurrentUser = documentData[0].Placeholders.find(
              (data) => data?.signerObjId === currUserId
            );
            if (checkCurrentUser) {
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
          if (
            obj &&
            obj?.Signers?.length > 0 &&
            obj?.Placeholders?.length > 0
          ) {
            const params = {
              event: "viewed",
              contactId: currUserId,
              body: {
                objectId: documentData?.[0].objectId,
                file: documentData?.[0]?.SignedUrl || documentData?.[0]?.URL,
                name: documentData?.[0].Name,
                note: documentData?.[0].Note || "",
                description: documentData?.[0].Description || "",
                signers: documentData?.[0].Signers?.map((x) => ({
                  name: x?.Name,
                  email: x?.Email,
                  phone: x?.Phone
                })),
                viewedBy:
                  documentData?.[0].Signers?.find(
                    (x) => x.objectId === currUserId
                  )?.Email || jsonSender?.email,
                viewedAt: new Date(),
                createdAt: documentData?.[0].createdAt
              }
            };

            try {
              await axios.post(
                `${localStorage.getItem("baseUrl")}functions/callwebhook`,
                params,
                {
                  headers: {
                    "Content-Type": "application/json",
                    "X-Parse-Application-Id":
                      localStorage.getItem("parseAppId"),
                    sessiontoken: localStorage.getItem("accesstoken")
                  }
                }
              );
            } catch (err) {
              console.log("Err ", err);
            }
          }
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
          currDate > expireUpdateDate
        ) {
          setRequestSignTour(true);
        } else {
          const isEnableOTP = documentData?.[0]?.IsEnableOTP || false;
          if (!isEnableOTP) {
            try {
              const resContact = await axios.post(
                `${localStorage.getItem("baseUrl")}functions/getcontact`,
                {
                  contactId: currUserId
                },
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
              }
            } catch (err) {
              console.log("err while getting tourstatus", err);
            }
          } else {
            //else condition to check current user exist in contracts_Users class and check tour message status
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
                }
              } else if (res.length === 0) {
                setHandleError(t("user-not-exist"));
              }
            }
          }
        }
        setIsUiLoading(false);
      } else if (
        documentData === "Error: Something went wrong!" ||
        (documentData.result && documentData.result.error)
      ) {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
        console.log("err in  getDocument cloud function ");
      } else {
        setHandleError(t("no-data"));
        setIsUiLoading({ isLoad: false });
      }
      //function to get default signatur eof current user from `contracts_Signature` class
      const defaultSignRes = await getDefaultSignature(jsonSender?.objectId);
      if (defaultSignRes?.status === "success") {
        const sign = defaultSignRes?.res?.defaultSignature || "";
        const initials = defaultSignRes?.res?.defaultInitial || "";
        setDefaultSignImg(sign);
        setMyInitial(initials);
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
        setIsEmailVerified(isEmailVerified);
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

            // Load a PDFDocument from the existing PDF bytes
            const existingPdfBytes = pdfArrayBuffer;
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
                scale,
                pdfOriginalWH,
                containerWH
              );
              // console.log("pdfte", pdfBytes);
              //get ExistUserPtr object id of user class to get tenantDetails
              const objectId = pdfDetails?.[0]?.ExtUserPtr?.UserId?.objectId;
              let activeMailAdapter =
                pdfDetails?.[0]?.ExtUserPtr?.active_mail_adapter;

              //function for call to embed signature in pdf and get digital signature pdf
              const resSign = await signPdfFun(
                pdfBytes,
                documentId,
                signerObjectId,
                objectId,
                isSubscribed,
                activeMailAdapter,
                widgets
              );
              if (resSign && resSign.status === "success") {
                setPdfUrl(resSign.data);
                setIsSigned(true);
                setSignedSigners([]);
                setUnSignedSigners([]);
                getDocumentDetails(documentId, true);
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
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      }
                    );
                    let senderEmail = pdfDetails?.[0].ExtUserPtr.Email;
                    let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
                    const senderName = `${pdfDetails?.[0].ExtUserPtr.Name}`;

                    try {
                      const imgPng =
                        "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
                      let url = `${localStorage.getItem(
                        "baseUrl"
                      )}functions/sendmailv3`;
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
                      const hostPublicUrl = isStaging
                        ? "https://staging-app.opensignlabs.com"
                        : "https://app.opensignlabs.com";
                      let signPdf = props?.templateId
                        ? `${hostPublicUrl}/login/${encodeBase64}`
                        : `${hostUrl}/login/${encodeBase64}`;
                      const openSignUrl =
                        "https://www.opensignlabs.com/contact-us";
                      const orgName = pdfDetails[0]?.ExtUserPtr.Company
                        ? pdfDetails[0].ExtUserPtr.Company
                        : "";
                      const themeBGcolor = themeColor;
                      let replaceVar;
                      if (requestBody && requestSubject && isSubscribed) {
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
                          sender_name: senderName,
                          sender_mail: senderEmail,
                          sender_phone: senderPhone,
                          receiver_name: user.Name,
                          receiver_email: user.Email,
                          receiver_phone: user.Phone,
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
                        recipient: user.Email,
                        subject: requestSubject
                          ? replaceVar?.subject
                          : `${pdfDetails?.[0].ExtUserPtr.Name} has requested you to sign "${pdfDetails?.[0].Name}"`,
                        from: senderEmail,
                        plan: plancode,
                        html: requestBody
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
              } else {
                setIsUiLoading(false);
                setIsAlert({ isShow: true, alertMessage: resSign.message });
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
  const saveSign = (type, isDefaultSign, width, height) => {
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
    //function of save signature image and get updated position with signature image url
    const getUpdatePosition = onSaveSign(
      type,
      placeholderPosition,
      getIndex,
      signKey,
      signatureImg,
      imgWH,
      isDefaultSign,
      isTypeText
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
  };
  //function for set decline true on press decline button
  const declineDoc = async (reason) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsDecline({ isDeclined: false });
    setIsUiLoading(true);
    const email =
      pdfDetails?.[0].Signers?.find((x) => x.objectId === signerObjectId)
        ?.Email || jsonSender?.email;
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
          const params = {
            event: "declined",
            body: {
              objectId: pdfDetails?.[0].objectId,
              file: pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL,
              name: pdfDetails?.[0].Name,
              note: pdfDetails?.[0].Note || "",
              description: pdfDetails?.[0].Description || "",
              signers: pdfDetails?.[0].Signers?.map((x) => ({
                name: x?.Name,
                email: x?.Email,
                phone: x?.Phone
              })),
              declinedBy: email,
              declinedReason: reason,
              declinedAt: new Date(),
              createdAt: pdfDetails?.[0].createdAt
            }
          };

          try {
            await axios.post(
              `${localStorage.getItem("baseUrl")}functions/callwebhook`,
              params,
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                  sessiontoken: localStorage.getItem("accesstoken")
                }
              }
            );
          } catch (err) {
            console.log("Err ", err);
          }
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
            {
              contactId: signerObjectId
            },
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
  const requestSignTourFunction = () => {
    const tourConfig = [
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
    //checking if signed by user component exist then add signed step
    const signedBy =
      signedSigners.length > 0
        ? [...tourConfig.slice(0, 0), signedByStep, ...tourConfig.slice(0)]
        : tourConfig;

    //checking if default signature component exist then add defaultSign step
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
    //index is handle is signed by exist then 2 else 1 to add tour step
    const index = signedSigners.length > 0 ? 2 : 1;
    const defaultSignTour = defaultSignImg
      ? [...signedBy.slice(0, index), defaultSignStep, ...signedBy.slice(index)]
      : signedBy;

    if (isMobile) {
      tourConfig.shift();
    }

    return (
      <Tour
        onRequestClose={closeRequestSignTour}
        steps={isMobile ? tourConfig : defaultSignTour}
        isOpen={true}
        closeWithMask={false}
        rounded={5}
      />
    );
  };

  const handleUserDetails = () => {
    setIsPublicContact(true);
  };

  //`handlePublicUser` function to use create user from public role and create document from public template
  const handlePublicUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {
        ...contact,
        templateid: pdfDetails[0]?.objectId,
        role: pdfDetails[0]?.PublicRole[0]
      };
      const userRes = await axios.post(
        `${localStorage.getItem(
          "baseUrl"
        )}/functions/publicuserlinkcontacttodoc`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId")
          }
        }
      );

      if (userRes?.data?.result) {
        setPublicRes(userRes.data.result);
        const isEnableOTP = pdfDetails?.[0]?.IsEnableOTP || false;
        if (isEnableOTP) {
          await SendOtp();
        } else {
          setIsPublicContact(false);
          setIsPublicTemplate(false);
          setDocumentId(userRes.data?.result?.docId);
          const contactId = userRes.data.result?.contactId;
          setSignerObjectId(contactId);
        }
      } else {
        console.log("error in public-sign to create user details");
        setIsAlert({
          title: "Error",
          isShow: true,
          alertMessage: t("something-went-wrong-mssg")
        });
      }
    } catch (e) {
      console.log("e", e);
      if (
        e?.response?.data?.error === "Insufficient Credit" ||
        e?.response?.data?.error === "Plan expired"
      ) {
        handleCloseOtp();
        setIsAlert({
          title: t("insufficient-credits"),
          isShow: true,
          alertMessage: t("insufficient-credits-mssg")
        });
      } else {
        handleCloseOtp();
        setIsAlert({
          title: "Error",
          isShow: true,
          alertMessage: t("something-went-wrong-mssg")
        });
      }
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setContact({ ...contact, [name]: value });
  };

  const SendOtp = async () => {
    try {
      const params = { email: contact.email, docId: publicRes?.docId };
      const Otp = await axios.post(
        `${localStorage.getItem("baseUrl")}/functions/SendOTPMailV1`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId")
          }
        }
      );

      if (Otp) {
        setIsOtp(true);
        setLoading(false);
      }
    } catch (error) {
      console.log("error in verify otp in public-sign", error);
      setIsAlert({
        title: "Error",
        isShow: true,
        alertMessage: t("something-went-wrong-mssg")
      });
    }
  };

  //verify OTP send on via email
  const VerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const serverUrl =
      localStorage.getItem("baseUrl") && localStorage.getItem("baseUrl");
    const parseId =
      localStorage.getItem("parseAppId") && localStorage.getItem("parseAppId");
    if (otp) {
      // setLoading(true);
      try {
        let url = `${serverUrl}/functions/AuthLoginAsMail/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId
        };
        let body = { email: contact.email, otp: otp };
        let user = await axios.post(url, body, { headers: headers });
        if (user.data.result === "Invalid Otp") {
          alert(t("invalid-otp"));
          setLoading(false);
        } else if (user.data.result === "user not found!") {
          alert(t("user-not-found"));
          setLoading(false);
        } else {
          let _user = user.data.result;
          const parseId = localStorage.getItem("parseAppId");
          await Parse.User.become(_user.sessionToken);
          const contractUserDetails = await contractUsers();
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem(
            `Parse/${parseId}/currentUser`,
            JSON.stringify(_user)
          );
          if (contractUserDetails && contractUserDetails.length > 0) {
            localStorage.setItem(
              "Extand_Class",
              JSON.stringify(contractUserDetails)
            );
          }
          localStorage.setItem("username", _user.name);
          localStorage.setItem("accesstoken", _user.sessionToken);
          setLoading(false);
          setIsPublicContact(false);
          setIsPublicTemplate(false);
          setIsLoading({ isLoad: false });
          setDocumentId(publicRes?.docId);
        }
      } catch (error) {
        console.log("err ", error);
      }
    } else {
      alert(t("enter-otp-alert"));
    }
  };
  const handleCloseOtp = () => {
    setIsPublicContact(false);
    setLoading(false);
    setIsOtp(false);
    setOtp();
    setContact({ name: "", email: "", phone: "" });
  };

  const clickOnZoomIn = () => {
    onClickZoomIn(scale, zoomPercent, setScale, setZoomPercent);
  };
  const clickOnZoomOut = () => {
    onClickZoomOut(zoomPercent, scale, setZoomPercent, setScale);
  };
  const handleDownloadBtn = async () => {
    const url = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
    const name = pdfDetails?.[0]?.Name;
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
  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={props.templateId ? "Public Sign" : "Request Sign"} />
      {isSubscriptionExpired ? (
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
      ) : (
        <>
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
                  (props.templateId || isGuestSignFlow) &&
                  "mx-2 border-[0.5px] border-gray-300"
                } relative op-card overflow-hidden flex flex-col md:flex-row justify-between bg-base-300`}
              >
                {!requestSignTour &&
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
                  headMsg={t("expired-doc-title")}
                  bodyMssg={t("expired-on-mssg", { expiredDate })}
                  isDownloadBtn={true}
                  handleDownloadBtn={handleDownloadBtn}
                />
                {!isEmailVerified && (
                  <VerifyEmail
                    isVerifyModal={isVerifyModal}
                    setIsVerifyModal={setIsVerifyModal}
                    handleVerifyEmail={handleVerifyEmail}
                    setOtp={setOtp}
                    otp={otp}
                    otpLoader={otpLoader}
                    handleVerifyBtn={handleVerifyBtn}
                    handleResend={handleResend}
                  />
                )}
                <ModalUi
                  isOpen={isPublicContact}
                  title={isOtp ? t("verify-email-1") : t("contact-details")}
                  handleClose={() => handleCloseOtp()}
                >
                  <div className="h-full p-[20px]">
                    {isOtp ? (
                      <form onSubmit={VerifyOTP}>
                        <div className="mb-[0.75rem]">
                          <label className="block text-xs font-semibold mb-2">
                            {t("get-otp-alert")}
                            <span className="text-[13px] text-[red]"> *</span>
                          </label>
                          <input
                            type="number"
                            name="otp"
                            placeholder={t("otp-placeholder")}
                            onInvalid={(e) =>
                              e.target.setCustomValidity(t("input-required"))
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={loading}
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          />
                        </div>
                        <div className="mt-6 flex justify-start gap-2">
                          <button
                            className="op-btn op-btn-primary"
                            disabled={loading}
                          >
                            {loading ? t("loading") : t("verify")}
                          </button>
                          <button
                            className="op-btn op-btn-ghost"
                            onClick={() => handleCloseOtp()}
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form
                        className="text-base-content p-2 mx-auto"
                        onSubmit={handlePublicUser}
                      >
                        <div className="mb-[0.75rem]">
                          <label className="block text-xs font-semibold mb-[5px]">
                            {t("name")}
                            <span className="text-[13px] text-[red]"> *</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={contact.name}
                            onChange={handleInputChange}
                            onInvalid={(e) =>
                              e.target.setCustomValidity(t("input-required"))
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                            disabled={loading}
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          />
                        </div>
                        <div className="mb-[0.75rem]">
                          <label className="block text-xs font-semibold mb-[5px]">
                            {t("email")}
                            <span className="text-[13px] text-[red]"> *</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={contact.email}
                            onChange={handleInputChange}
                            onInvalid={(e) =>
                              e.target.setCustomValidity(t("input-required"))
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                            disabled={loading}
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          />
                        </div>
                        <div className="mb-[0.75rem]">
                          <label className="block text-xs font-semibold mb-[5px]">
                            {t("phone")}
                          </label>
                          <input
                            value={contact.phone}
                            onChange={handleInputChange}
                            type="text"
                            name="phone"
                            placeholder={t("phone-optional")}
                            disabled={loading}
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          />
                        </div>

                        <div className="mt-6 flex justify-start gap-2">
                          <button
                            className="op-btn op-btn-primary"
                            disabled={loading}
                          >
                            {loading ? t("loading") : t("submit")}
                          </button>
                          <button
                            className="op-btn op-btn-ghost"
                            onClick={() => handleCloseOtp()}
                          >
                            {t("close")}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </ModalUi>
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
                          className="op-btn op-btn-secondary"
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
                  signerObjectId={signerObjectId}
                  signPdfUrl={
                    pdfDetails[0] &&
                    (pdfDetails[0]?.SignedUrl || pdfDetails[0]?.URL)
                  }
                  allPages={allPages}
                  setAllPages={setAllPages}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  containerWH={containerWH}
                />
                {/* pdf render view */}
                <div className=" w-full md:w-[57%] flex mr-4">
                  <PdfZoom
                    clickOnZoomIn={clickOnZoomIn}
                    clickOnZoomOut={clickOnZoomOut}
                    isDisableRotate={true}
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
                          <p>{isCompleted?.message}</p>
                        ) : (
                          <div className="px-[15px]">
                            <span>{t("document-signed-alert-4")}</span>
                          </div>
                        )}
                        {!isCompleted?.message && (
                          <div className="flex mt-4 gap-1 px-[15px]">
                            <button
                              onClick={(e) =>
                                handleToPrint(
                                  e,
                                  pdfUrl,
                                  setIsDownloading,
                                  pdfDetails
                                )
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
                        )}
                      </div>
                    </ModalUi>
                    {isDownloading === "pdf" && (
                      <div className="fixed z-[1000] inset-0 flex justify-center items-center bg-black bg-opacity-30">
                        <Loader />
                      </div>
                    )}
                    <ModalUi
                      isOpen={isDownloading === "certificate"}
                      title={
                        isDownloading === "certificate"
                          ? t("generating-certificate")
                          : t("pdf-download")
                      }
                      handleClose={() => setIsDownloading("")}
                    >
                      <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
                        {isDownloading === "certificate"}{" "}
                        <p>{t("generate-certificate-alert")}</p>
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
                      myInitial={myInitial}
                      isInitial={isInitial}
                      setIsInitial={setIsInitial}
                      setIsStamp={setIsStamp}
                      currWidgetsDetails={currWidgetsDetails}
                      setCurrWidgetsDetails={setCurrWidgetsDetails}
                    />
                    {/* pdf header which contain funish back button */}
                    <Header
                      isPdfRequestFiles={isPublicTemplate ? false : true}
                      pageNumber={pageNumber}
                      allPages={allPages}
                      changePage={changePage}
                      pdfDetails={pdfDetails}
                      signerPos={signerPos}
                      isSigned={isSigned}
                      isCompleted={isCompleted.isCertificate}
                      embedWidgetsData={
                        isPublicTemplate ? handleUserDetails : embedWidgetsData
                      }
                      isShowHeader={true}
                      setIsDecline={setIsDecline}
                      decline={true}
                      currentSigner={currentSigner}
                      pdfUrl={pdfUrl}
                      alreadySign={alreadySign}
                      containerWH={containerWH}
                      isPublicTemplate={isPublicTemplate}
                      clickOnZoomIn={clickOnZoomIn}
                      clickOnZoomOut={clickOnZoomOut}
                      isDisableRotate={true}
                      templateId={props.templateId}
                      setIsDownloadModal={setIsDownloadModal}
                    />

                    <div ref={divRef} data-tut="pdfArea" className="h-[95%]">
                      {containerWH && (
                        <RenderPdf
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
                          ispublicTemplate={isPublicTemplate}
                          handleUserDetails={handleUserDetails}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[23%] bg-base-100 overflow-y-auto hide-scrollbar hidden md:inline-block">
                  <div className={`max-h-screen`}>
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
                    {defaultSignImg && !alreadySign && currentSigner && (
                      <DefaultSignature
                        defaultSignImg={defaultSignImg}
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
        </>
      )}
    </DndProvider>
  );
}
export default PdfRequestFiles;
