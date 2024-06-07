import React, { useState, useRef, useEffect } from "react";
import { isEnableSubscription, themeColor } from "../constant/const";
import { PDFDocument } from "pdf-lib";
import "../styles/signature.css";
import Parse from "parse";
import axios from "axios";
import loader from "../assets/images/loader2.gif";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  handleDownloadPdf,
  handleToPrint,
  handleDownloadCertificate,
  darkenColor
} from "../constant/Utils";
import Loader from "../primitives/LoaderWithMsg";
import HandleError from "../primitives/HandleError";
import Header from "../components/pdf/PdfHeader";
import RenderPdf from "../components/pdf/RenderPdf";
import PdfDeclineModal from "../primitives/PdfDeclineModal";
import Title from "../components/Title";
import DefaultSignature from "../components/pdf/DefaultSignature";
import ModalUi from "../primitives/ModalUi";
import VerifyEmail from "../components/pdf/VerifyEmail";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import { appInfo } from "../constant/appinfo";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PdfRequestFiles() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
  const sendmail = query.get("sendmail");
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
  const [requestSignTour, setRequestSignTour] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });

  const [defaultSignImg, setDefaultSignImg] = useState();
  const [isDocId, setIsDocId] = useState(false);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [signerPos, setSignerPos] = useState([]);
  const [signerObjectId, setSignerObjectId] = useState();
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isDecline, setIsDecline] = useState({ isDeclined: false });
  const [currentSigner, setCurrentSigner] = useState(false);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [unSignedWidgetId, setUnSignedWidgetId] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
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
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current]);

  //function to use resend otp for email verification
  const handleResend = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    await handleSendOTP(Parse.User.current().getEmail());
    setOtpLoader(false);
    alert("OTP sent on you email");
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    try {
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: Parse.User.current().getEmail()
      });
      if (resEmail?.message === "Email is verified.") {
        setIsEmailVerified(true);
      } else if (resEmail?.message === "Email is already verified.") {
        setIsEmailVerified(true);
      }
      setOtp("");
      alert(resEmail.message);
      setIsVerifyModal(false);
      // handleRecipientSign();
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };

  //`handleVerifyBtn` function is used to send otp on user mail
  const handleVerifyBtn = async () => {
    setIsVerifyModal(true);
    await handleSendOTP(Parse.User.current().getEmail());
  };
  async function checkIsSubscribed(extUserId, contactId) {
    const isGuestSign = location.pathname.includes("/load/") || false;
    const res = await fetchSubscription(extUserId, contactId, isGuestSign);
    const plan = res.plan;
    const billingDate = res?.billingDate;
    const status = res?.status;
    if (plan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (new Date(billingDate) > new Date()) {
        setIsSubscribed(true);
        return true;
      } else {
        if (location.pathname.includes("/load/")) {
          setIsSubscriptionExpired(true);
        } else {
          navigate(`/subscription`);
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
        navigate(`/subscription`);
      }
    }
  }
  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (isNextUser) => {
    let currUserId;
    //getting document details
    const documentData = await contractDocument(documentId);
    if (documentData && documentData.length > 0) {
      setExtUserId(documentData[0]?.ExtUserPtr?.objectId);
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
      if (isEnableSubscription) {
        await checkIsSubscribed(
          documentData[0]?.ExtUserPtr?.objectId,
          currUserId
        );
      }
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
        setIsCelebration(true);
        setTimeout(() => {
          setIsCelebration(false);
        }, 5000);
      } else if (declined) {
        const currentDecline = {
          currnt: "another",
          isDeclined: true
        };
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
        setTimeout(() => {
          setIsCelebration(false);
        }, 5000);
        setIsCompleted({
          isModal: true,
          message:
            "You have successfully signed the document. You can download or print a copy of the partially signed document. A copy of the digitally signed document will be sent to the owner over email once it is signed by all signers."
        });
      }

      const isGuestSign = location.pathname.includes("/load/");
      if (
        !isGuestSign &&
        !isCompleted &&
        !declined &&
        currDate < expireUpdateDate
      ) {
        const currentUser = JSON.parse(JSON.stringify(Parse.User.current()));
        let isEmailVerified;
        isEmailVerified = currentUser?.emailVerified;
        if (isEmailVerified) {
          setIsEmailVerified(isEmailVerified);
        } else {
          try {
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(currentUser.objectId, {
              sessionToken: localStorage.getItem("accesstoken")
            });
            if (user) {
              isEmailVerified = user?.get("emailVerified");
              setIsEmailVerified(isEmailVerified);
            }
          } catch (e) {
            setHandleError("Error: Something went wrong!");
          }
        }
      }
      const audittrailData =
        documentData[0].AuditTrail &&
        documentData[0].AuditTrail.length > 0 &&
        documentData[0].AuditTrail.filter((data) => data.Activity === "Signed");

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
      } else {
        const obj = documentData?.[0];
        setSendInOrder(obj?.SendinOrder || false);
        if (
          obj &&
          obj.Signers &&
          obj.Signers.length > 0 &&
          obj.Placeholders &&
          obj.Placeholders.length > 0
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
              viewedBy: jsonSender.email,
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
                  "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
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
        const emailExist = placeholder?.email;
        if (emailExist) {
          placeholdersOrSigners.push(placeholder);
        } else {
          const getSignerData = documentData[0].Signers.filter(
            (data) => data.objectId === placeholder?.signerObjId
          );
          placeholdersOrSigners.push(getSignerData[0]);
        }
      }
      //condition to check already signed document by someone
      if (audittrailData && audittrailData.length > 0) {
        setIsDocId(true);

        for (const item of placeholdersOrSigners) {
          const checkEmail = item?.email;
          //if email exist then compare user signed by using email else signers objectId
          const emailOrId = checkEmail ? item.email : item.objectId;
          //`isSignedSignature` variable to handle break loop whenever it get true
          let isSignedSignature = false;
          //checking the signer who signed the document by using audit trail details.
          //and save signedSigners and unsignedSigners details
          for (const doc of audittrailData) {
            const signedExist = checkEmail
              ? doc?.UserPtr.Email
              : doc?.UserPtr.objectId;

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
        (checkAlreadySign &&
          checkAlreadySign[0] &&
          checkAlreadySign.length > 0) ||
        !currUserId ||
        declined ||
        currDate > expireUpdateDate
      ) {
        setRequestSignTour(true);
      } else {
        //else condition to check current user exist in contracts_Users class and check tour message status
        //if not then check user exist in contracts_Contactbook class and check tour message status
        const localuser = localStorage.getItem(
          `Parse/${appInfo.appId}/currentUser`
        );
        const currentUser = JSON.parse(JSON.stringify(localuser));
        const currentUserEmail = currentUser.email;
        const res = await contractUsers(currentUserEmail);
        if (res === "Error: Something went wrong!") {
          setHandleError("Error: Something went wrong!");
        } else if (res[0] && res?.length) {
          setContractName("_Users");
          currUserId = res[0].objectId;
          setSignerUserId(currUserId);
          const tourData = res[0].TourStatus && res[0].TourStatus;
          if (tourData && tourData.length > 0) {
            setTourStatus(tourData);
            setRequestSignTour(tourData[0]?.requestSign || false);
          }
        } else if (res?.length === 0) {
          const res = await contactBook(currUserId);

          if (res === "Error: Something went wrong!") {
            setHandleError("Error: Something went wrong!");
          } else if (res[0] && res.length) {
            setContractName("_Contactbook");
            const objectId = res[0].objectId;
            setSignerUserId(objectId);
            const tourData = res[0].TourStatus && res[0].TourStatus;

            if (tourData && tourData.length > 0) {
              setTourStatus(tourData);
              setRequestSignTour(tourData[0]?.requestSign || false);
            }
          } else if (res.length === 0) {
            setHandleError("Error: User does not exist!");
          }
        }
      }
      setIsUiLoading(false);
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
      setHandleError("No Data Found!");
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
          jsonSender?.objectId
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

        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      })
      .catch((err) => {
        const loadObj = {
          isLoad: false
        };
        console.log("Err ", err);
        setHandleError("Error: Something went wrong!");
        setIsLoading(loadObj);
      });
  };
  //function for embed signature or image url in pdf
  async function embedWidgetsData() {
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
          pageNumber; // `pageNumber` is used to check on which page user did not fill widget's data then change current pageNumber and show tour message on that page

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
                  !position.options?.isReadOnly && position.type === "checkbox"
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
                    pageNumber = updatePage;
                    setminRequiredCount(parseMin);
                  }
                  //else condition to validate minimum required checkbox
                  else if (parseMin > 0 && (parseMin > response || !response)) {
                    if (!showAlert) {
                      showAlert = true;
                      widgetKey = requiredCheckbox[i].key;
                      pageNumber = updatePage;

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
                      pageNumber = updatePage;
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
                        pageNumber = updatePage;
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
          setPageNumber(pageNumber);
          setWidgetsTour(true);
        } else if (radioExist && showAlert) {
          setUnSignedWidgetId(widgetKey);
          setPageNumber(pageNumber);
          setWidgetsTour(true);
        } else if (showAlert) {
          setUnSignedWidgetId(widgetKey);
          setPageNumber(pageNumber);
          setWidgetsTour(true);
        } else {
          setIsUiLoading(true);

          const pngUrl = checkUser[0].placeHolder;
          let pdfArrBuffer;
          //`contractDocument` function used to get updated SignedUrl
          //resolved issue of sign document by multiple signers simultaneously
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
              pngUrl,
              pdfDoc,
              pdfOriginalWidth,
              isSignYourSelfFlow,
              containerWH
            );
            //get ExistUserPtr object id of user class to get tenantDetails
            const objectId = pdfDetails?.[0]?.ExtUserPtr?.UserId?.objectId;
            //get ExistUserPtr email to get userDetails
            const currentUserEmail = pdfDetails?.[0]?.ExtUserPtr?.Email;
            const res = await contractUsers(currentUserEmail);
            let activeMailAdapter = "";
            if (res === "Error: Something went wrong!") {
              setHandleError("Error: Something went wrong!");
              setIsLoading({
                isLoad: false
              });
            } else if (!res || res?.length === 0) {
              activeMailAdapter = "";
            } else if (res[0] && res.length) {
              activeMailAdapter = res[0]?.active_mail_adapter;
            }
            //function for call to embed signature in pdf and get digital signature pdf
            try {
              const res = await signPdfFun(
                pdfBytes,
                documentId,
                signerObjectId,
                setIsAlert,
                objectId,
                isSubscribed,
                activeMailAdapter,
                pngUrl
              );
              if (res && res.status === "success") {
                setPdfUrl(res.data);
                setIsSigned(true);
                setSignedSigners([]);
                setUnSignedSigners([]);
                getDocumentDetails(true);
                const index = pdfDetails?.[0].Signers.findIndex(
                  (x) => x.Email === jsonSender.email
                );
                const newIndex = index + 1;
                const usermail = {
                  Email: pdfDetails?.[0]?.Placeholders[newIndex]?.email || ""
                };
                const user =
                  usermail?.Email || pdfDetails?.[0]?.Signers[newIndex];
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
                      let signPdf = `${hostUrl}/login/${encodeBase64}`;
                      const openSignUrl =
                        "https://www.opensignlabs.com/contact-us";
                      const orgName = pdfDetails[0]?.ExtUserPtr.Company
                        ? pdfDetails[0].ExtUserPtr.Company
                        : "";
                      const themeBGcolor = themeColor;
                      let replaceVar;
                      if (
                        requestBody &&
                        requestSubject &&
                        (!isEnableSubscription || isSubscribed)
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
                          sender_name: senderName,
                          sender_mail: senderEmail,
                          sender_phone: senderPhone,
                          receiver_name: user.Name,
                          receiver_email: user.Email,
                          receiver_phone: user.Phone,
                          expiry_date: localExpireDate,
                          company_name: orgName,
                          signing_url: `<a href=${signPdf}>Sign here</a>`
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
                            "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
                            signPdf +
                            "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                            senderEmail +
                            " directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= " +
                            openSignUrl +
                            " target=_blank>here</a>.</p> </div></div></body> </html>"
                      };
                      await axios.post(url, params, {
                        headers: headers
                      });
                    } catch (error) {
                      console.log("error", error);
                    }
                  }
                }
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
          } catch (err) {
            setIsUiLoading(false);
            if (err && err.message.includes("is encrypted.")) {
              setIsAlert({
                isShow: true,
                alertMessage: `Currently encrypted pdf files are not supported.`
              });
            } else {
              console.log("err in request signing", err);
              setIsAlert({
                isShow: true,
                alertMessage: `Something went wrong.`
              });
            }
          }
        }
        setIsSignPad(false);
      } else {
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong"
        });
      }
    } catch (err) {
      console.log("err in embedsign", err);
      setIsUiLoading(false);
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong, please try again later."
      });
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
        ? `Please confirm that you have selected at least ${minRequiredCount} checkboxes.`
        : "Ensure this field is accurately filled and meets all requirements.",
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

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
    if (name) {
      const firstLetter = name.charAt(0);
      return firstLetter;
    }
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

  const checkSignerBackColor = (obj) => {
    let data = "";
    if (obj?.Id) {
      data = signerPos.filter((data) => data.Id === obj.Id);
    } else {
      data = signerPos.filter((data) => data.signerObjId === obj.objectId);
    }
    return data && data.length > 0 && data[0].blockColor;
  };
  const checkUserNameColor = (obj) => {
    const getBackColor = checkSignerBackColor(obj);
    if (getBackColor) {
      const color = darkenColor(getBackColor, 0.4);
      return color;
    } else {
      return "#abd1d0";
    }
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
      .then(async (result) => {
        const res = result.data;
        if (res) {
          const currentDecline = {
            currnt: "YouDeclined",
            isDeclined: true
          };
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
              declinedBy: jsonSender.email,
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
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  //function to close tour and save tour status
  const closeRequestSignTour = async () => {
    setRequestSignTour(true);
    if (isDontShow) {
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
        );
      } catch (e) {
        console.log("update tour messages error", e);
      }
    }
  };
  const requestSignTourFunction = () => {
    const tourConfig = [
      {
        selector: '[data-tut="reactourFirst"]',
        content: () => (
          <TourContentWithBtn
            message={`List of signers who still need to sign the document .`}
            isChecked={handleDontShow}
          />
        ),
        position: "top",
        style: { fontSize: "13px" }
      },
      {
        selector: '[data-tut="reactourForth"]',
        content: () => (
          <TourContentWithBtn
            message={`Click any of the placeholders appearing on the document to sign. You will then see options to draw your signature, type it, or upload an image .`}
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
            message={`Click the Back, Decline, or Finish buttons to navigate your document. Use the ellipsis menu for additional options, including the Download button .`}
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
          message={`List of signers who have already signed the document .`}
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
          message={`You can click "Auto Sign All" to automatically sign at all the locations meant to be signed by you. Make sure that you review the document properly before you click this button .`}
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
  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={"Request Sign"} />
      {isSubscriptionExpired ? (
        <ModalUi
          title={"Subscription Expired"}
          isOpen={isSubscriptionExpired}
          showClose={false}
        >
          <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
            <p className="text-sm md:text-lg font-normal">
              Owner&apos;s subscription has expired.
            </p>
          </div>
        </ModalUi>
      ) : (
        <>
          {isLoading.isLoad ? (
            <Loader isLoading={isLoading} />
          ) : handleError ? (
            <HandleError handleError={handleError} />
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
              {isCelebration && (
                <div style={{ position: "relative", zIndex: "1000" }}>
                  <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                  />
                </div>
              )}

              <div
                className="relative flex flex-col md:flex-row justify-between bg-[#ebebeb]"
                style={{
                  pointerEvents:
                    isExpired ||
                    (isDecline.isDeclined && isDecline.currnt === "another")
                      ? "none"
                      : "auto"
                }}
                ref={divRef}
              >
                {!requestSignTour && requestSignTourFunction()}
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
                  headMsg="Document Declined"
                  bodyMssg={
                    isDecline.currnt === "Sure"
                      ? "Are you sure want to decline this document ?"
                      : isDecline.currnt === "YouDeclined"
                        ? "You have declined this document!"
                        : isDecline.currnt === "another" &&
                          "You can not sign this document as it has been declined/revoked."
                  }
                  footerMessage={isDecline.currnt === "Sure"}
                  declineDoc={declineDoc}
                  setIsDecline={setIsDecline}
                />
                {/* this modal is used for show expired alert */}
                <PdfDeclineModal
                  show={isExpired}
                  headMsg="Document Expired!"
                  bodyMssg={`This document expired on ${expiredDate} and is no longer available to sign.`}
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
                  headerColor={defaultSignImg ? themeColor : "#dc3545"}
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
                            background: themeColor
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
                    title={"Document signed"}
                    handleClose={() => {
                      setIsCompleted((prev) => ({ ...prev, isModal: false }));
                    }}
                    reduceWidth={
                      !isCompleted?.message &&
                      "md:min-w-[440px] md:max-w-[400px]"
                    }
                  >
                    <div style={{ height: "100%", padding: 20 }}>
                      {isCompleted?.message ? (
                        <p>{isCompleted?.message}</p>
                      ) : (
                        <div className="px-[15px]">
                          <span>
                            Congratulations! 🎉 This document has been
                            successfully signed by all participants!
                          </span>
                        </div>
                      )}
                      {!isCompleted?.message && (
                        <div className="flex mt-4 gap-1 px-[15px]">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadCertificate(
                                pdfDetails,
                                setIsDownloading
                              )
                            }
                            className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#08bc66]"
                          >
                            <i
                              className="fa-solid fa-award py-[3px]"
                              aria-hidden="true"
                            ></i>
                            <span className="hidden lg:block ml-1">
                              Certificate
                            </span>
                          </button>
                          <button
                            onClick={(e) =>
                              handleToPrint(e, pdfUrl, setIsDownloading)
                            }
                            type="button"
                            className="flex flex-row items-center  shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#188ae2]"
                          >
                            <i
                              className="fa fa-print py-[3px]"
                              aria-hidden="true"
                            ></i>
                            <span className="hidden lg:block ml-1">Print</span>
                          </button>
                          <button
                            type="button"
                            className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#f14343]"
                            onClick={() =>
                              handleDownloadPdf(
                                pdfDetails,
                                pdfUrl,
                                setIsDownloading
                              )
                            }
                          >
                            <i
                              className="fa fa-download py-[3px]"
                              aria-hidden="true"
                            ></i>
                            <span className="hidden lg:block ml-1">
                              Download
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </ModalUi>
                  {isDownloading === "pdf" && (
                    <div className="fixed z-[1000] inset-0 flex justify-center items-center bg-black bg-opacity-30">
                      <div
                        style={{ fontSize: "45px", color: "#3dd3e0" }}
                        className="loader-37"
                      ></div>
                    </div>
                  )}
                  <ModalUi
                    isOpen={isDownloading === "certificate"}
                    title={
                      isDownloading === "certificate"
                        ? "Generating certificate"
                        : "PDF Download"
                    }
                    handleClose={() => setIsDownloading("")}
                  >
                    <div className="p-3 md:p-5 text-[13px] md:text-base text-center">
                      {isDownloading === "certificate"}{" "}
                      <p>
                        Your completion certificate is being generated. Please
                        wait momentarily.
                      </p>
                      <p>
                        If the download doesn&apos;t start shortly, click the
                        button again.
                      </p>
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
                    isPdfRequestFiles={true}
                    pageNumber={pageNumber}
                    allPages={allPages}
                    changePage={changePage}
                    pdfDetails={pdfDetails}
                    signerPos={signerPos}
                    isSigned={isSigned}
                    isCompleted={isCompleted.isCertificate}
                    embedWidgetsData={embedWidgetsData}
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
                      setIsInitial={setIsInitial}
                      setValidateAlert={setValidateAlert}
                      unSignedWidgetId={unSignedWidgetId}
                      setSelectWidgetId={setSelectWidgetId}
                      selectWidgetId={selectWidgetId}
                      setCurrWidgetsDetails={setCurrWidgetsDetails}
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
                        <div data-tut="reactourSecond">
                          <div
                            style={{ background: themeColor }}
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
                                      background: checkUserNameColor(obj),
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
                                      {getFirstLetter(obj?.Name || obj?.Role)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column"
                                    }}
                                  >
                                    <span className="userName">
                                      {obj?.Name || obj?.Role}
                                    </span>
                                    <span className="useEmail">
                                      {obj?.Email || obj?.email}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {unsignedSigners.length > 0 && (
                        <div data-tut="reactourFirst">
                          <div
                            style={{
                              background: themeColor,
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
                                      background: checkUserNameColor(obj),
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
                                      {getFirstLetter(obj?.Name || obj?.email)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column"
                                    }}
                                  >
                                    <span className="userName">
                                      {obj?.Name || obj?.Role}
                                    </span>
                                    <span className="useEmail">
                                      {obj?.Email || obj?.email}
                                    </span>
                                  </div>
                                  <hr />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {defaultSignImg && !alreadySign && (
                        <DefaultSignature
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
            headerColor={"#dc3545"}
            isOpen={validateAlert}
            title={"Validation alert"}
            handleClose={() => {
              setValidateAlert(false);
            }}
          >
            <div style={{ height: "100%", padding: 20 }}>
              <p>
                The input does not meet the criteria set by the regular
                expression.
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
        </>
      )}
    </DndProvider>
  );
}

export default PdfRequestFiles;
