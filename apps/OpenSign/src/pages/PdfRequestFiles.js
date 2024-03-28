import React, { useState, useRef, useEffect } from "react";
import { isEnableSubscription, themeColor } from "../constant/const";
import { PDFDocument } from "pdf-lib";
import "../styles/signature.css";
import axios from "axios";
import loader from "../assets/images/loader2.gif";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SignPad from "../components/pdf/SignPad";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import Tour from "reactour";
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
  radioButtonWidget
} from "../constant/Utils";
import Loader from "../primitives/LoaderWithMsg";
import HandleError from "../primitives/HandleError";
import Header from "../components/pdf/PdfHeader";
import RenderPdf from "../components/pdf/RenderPdf";
import PdfDeclineModal from "../primitives/PdfDeclineModal";
import Title from "../components/Title";
import DefaultSignature from "../components/pdf/DefaultSignature";
import ModalUi from "../primitives/ModalUi";
import Parse from "parse";

function PdfRequestFiles() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isSubscribed, setIsSubscribed] = useState(false);
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

  async function checkIsSubscribed(email) {
    const user = await Parse.Cloud.run("getUserDetails", {
      email: email
    });
    const freeplan = user?.get("Plan") && user?.get("Plan");
    const billingDate =
      user?.get("Next_billing_date") && user?.get("Next_billing_date");
    if (freeplan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (billingDate > new Date()) {
        return true;
      } else {
        if (location.pathname.includes("/load/")) {
          setIsSubscribed(true);
        } else {
          navigate(`/subscription`);
        }
      }
    } else {
      if (location.pathname.includes("/load/")) {
        setIsSubscribed(true);
      } else {
        navigate(`/subscription`);
      }
    }
  }
  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async () => {
    let currUserId;
    //getting document details
    const documentData = await contractDocument(documentId);
    if (documentData && documentData.length > 0) {
      if (isEnableSubscription) {
        await checkIsSubscribed(documentData[0]?.ExtUserPtr?.Email);
      }
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

  const checkSendInOrder = () => {
    if (sendInOrder) {
      const index = pdfDetails?.[0].Signers.findIndex(
        (x) => x.Email === jsonSender.email
      );
      const newIndex = index - 1;
      if (newIndex !== -1) {
        const user = pdfDetails?.[0].Signers[newIndex];
        const isPrevUserSigned =
          pdfDetails?.[0].AuditTrail &&
          pdfDetails?.[0].AuditTrail.some(
            (x) =>
              x.UserPtr.objectId === user.objectId && x.Activity === "Signed"
          );
        if (isPrevUserSigned) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  //function for embed signature or image url in pdf
  async function embedWidgetsData() {
    const validateSigning = checkSendInOrder();
    if (validateSigning) {
      const checkUser = signerPos.filter(
        (data) => data.signerObjId === signerObjectId
      );
      if (checkUser && checkUser.length > 0) {
        let checkboxExist,
          requiredRadio,
          showAlert = false,
          widgetKey,
          radioExist,
          requiredCheckbox;

        for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
          for (let j = 0; j < checkUser[0].placeHolder[i].pos.length; j++) {
            checkboxExist =
              checkUser[0].placeHolder[i].pos[j].type === "checkbox";
            radioExist =
              checkUser[0].placeHolder[i].pos[j].type === radioButtonWidget;
            if (checkboxExist) {
              requiredCheckbox = checkUser[0].placeHolder[i].pos.filter(
                (position) =>
                  !position.options?.isReadOnly && position.type === "checkbox"
              );

              if (requiredCheckbox && requiredCheckbox.length > 0) {
                for (let i = 0; i < requiredCheckbox.length; i++) {
                  const minCount =
                    requiredCheckbox[i].options?.validation?.minRequiredCount;
                  const parseMin = minCount && parseInt(minCount);
                  const maxCount =
                    requiredCheckbox[i].options?.validation?.maxRequiredCount;
                  const parseMax = maxCount && parseInt(maxCount);
                  const response =
                    requiredCheckbox[i].options?.response?.length;
                  const defaultValue =
                    requiredCheckbox[i].options?.defaultValue?.length;
                  if (parseMin === 0 && parseMax === 0) {
                    if (!showAlert) {
                      showAlert = false;
                      setminRequiredCount(null);
                    }
                  } else if (parseMin === 0 && parseMax > 0) {
                    if (!showAlert) {
                      showAlert = false;
                      setminRequiredCount(null);
                    }
                  } else if (!response) {
                    if (!defaultValue) {
                      if (!showAlert) {
                        showAlert = true;
                        widgetKey = requiredCheckbox[i].key;
                        setminRequiredCount(parseMin);
                      }
                    }
                  } else if (parseMin > 0 && parseMin > response) {
                    if (!showAlert) {
                      showAlert = true;
                      widgetKey = requiredCheckbox[i].key;
                      setminRequiredCount(parseMin);
                    }
                  }
                }
              }
            } else if (radioExist) {
              requiredRadio = checkUser[0].placeHolder[i].pos.filter(
                (position) =>
                  !position.options?.isReadOnly &&
                  position.type === radioButtonWidget
              );
              if (requiredRadio && requiredRadio?.length > 0) {
                let checkSigned;
                for (let i = 0; i < requiredRadio?.length; i++) {
                  checkSigned = requiredRadio[i]?.options.response;
                  if (!checkSigned) {
                    let checkDefaultSigned =
                      requiredRadio[i]?.options.defaultValue;
                    if (!checkDefaultSigned) {
                      if (!showAlert) {
                        showAlert = true;
                        widgetKey = requiredRadio[i].key;
                        setminRequiredCount(null);
                      }
                    }
                  }
                }
              }
            } else {
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

                    let checkDefaultSigned =
                      requiredWidgets[i]?.options?.defaultValue;
                    if (!checkSignUrl) {
                      if (!checkDefaultSigned) {
                        if (!showAlert) {
                          showAlert = true;
                          widgetKey = requiredWidgets[i].key;
                          setminRequiredCount(null);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (checkboxExist && requiredCheckbox && showAlert) {
          setUnSignedWidgetId(widgetKey);
          setWidgetsTour(true);
        } else if (radioExist && showAlert) {
          setUnSignedWidgetId(widgetKey);
          setWidgetsTour(true);
        } else if (showAlert) {
          setUnSignedWidgetId(widgetKey);
          setWidgetsTour(true);
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
            flag,
            containerWH
          );

          //function for call to embed signature in pdf and get digital signature pdf
          try {
            const res = await signPdfFun(
              pdfBytes,
              documentId,
              signerObjectId,
              setIsAlert
            );
            if (res && res.status === "success") {
              setPdfUrl(res.data);
              setIsSigned(true);
              setSignedSigners([]);
              setUnSignedSigners([]);
              getDocumentDetails();
              if (sendInOrder) {
                const index = pdfDetails?.[0].Signers.findIndex(
                  (x) => x.Email === jsonSender.email
                );
                const newIndex = index + 1;
                const user = pdfDetails?.[0].Signers[newIndex];
                if (user) {
                  // console.log("pdfDetails", pdfDetails);
                  const expireDate = pdfDetails?.[0].ExpiryDate.iso;
                  const newDate = new Date(expireDate);
                  const localExpireDate = newDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  });
                  let sender = pdfDetails?.[0].ExtUserPtr.Email;

                  try {
                    const imgPng =
                      "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
                    let url = `${localStorage.getItem(
                      "baseUrl"
                    )}functions/sendmailv3/`;
                    const headers = {
                      "Content-Type": "application/json",
                      "X-Parse-Application-Id":
                        localStorage.getItem("parseAppId"),
                      sessionToken: localStorage.getItem("accesstoken")
                    };
                    const serverUrl = localStorage.getItem("baseUrl");
                    const newServer = serverUrl.replaceAll("/", "%2F");
                    const objectId = user.objectId;
                    const serverParams = `${newServer}&${localStorage.getItem(
                      "parseAppId"
                    )}&${localStorage.getItem("_appName")}`;
                    const hostUrl = window.location.origin;
                    let signPdf = `${hostUrl}/login/${pdfDetails?.[0].objectId}/${user.Email}/${objectId}/${serverParams}`;
                    const openSignUrl =
                      "https://www.opensignlabs.com/contact-us";
                    const orgName = pdfDetails[0]?.ExtUserPtr.Company
                      ? pdfDetails[0].ExtUserPtr.Company
                      : "";
                    const themeBGcolor = themeColor;
                    let params = {
                      recipient: user.Email,
                      subject: `${pdfDetails?.[0].ExtUserPtr.Name} has requested you to sign ${pdfDetails?.[0].Name}`,
                      from: sender,

                      html:
                        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'=> <div   style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
                        imgPng +
                        " height='50' style='padding: 20px,width:170px,height:40px' /></div>  <div  style=' padding: 2px;font-family: system-ui;background-color:" +
                        themeBGcolor +
                        ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px;   margin-bottom: 10px;'> " +
                        pdfDetails?.[0].ExtUserPtr.Name +
                        " has requested you to review and sign <strong> " +
                        pdfDetails?.[0].Name +
                        "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                        sender +
                        "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                        orgName +
                        "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                        localExpireDate +
                        "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
                        signPdf +
                        "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                        sender +
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
        }
        setIsSignPad(false);
      } else {
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong"
        });
      }
    } else {
      setIsAlert({
        isShow: true,
        alertMessage:
          "Please wait for your turn to sign this document, as it has been set up by the creator to be signed in a specific order; you'll be notified when it's your turn."
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

  return (
    <DndProvider backend={HTML5Backend}>
      <Title title={"Request Sign"} />
      {isSubscribed ? (
        <ModalUi
          title={"Subscription Expired"}
          isOpen={isSubscribed}
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
                  containerWH={containerWH}
                  show={isDecline.isDeclined}
                  headMsg="Document Declined"
                  bodyMssg={
                    isDecline.currnt === "Sure"
                      ? "Are you sure want to decline this document ?"
                      : isDecline.currnt === "YouDeclined"
                      ? "You have declined this document!"
                      : isDecline.currnt === "another" &&
                        "You cannot sign this document as it has been declined by one or more recipient(s)."
                  }
                  footerMessage={isDecline.currnt === "Sure"}
                  declineDoc={declineDoc}
                  setIsDecline={setIsDecline}
                />
                {/* this modal is used for show expired alert */}
                <PdfDeclineModal
                  containerWH={containerWH}
                  show={isExpired}
                  headMsg="Document Expired!"
                  bodyMssg="This Document is no longer available."
                />

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
                          setIsCompleted({
                            isModal: false,
                            isCertificate: true
                          })
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
                    myInitial={myInitial}
                    isInitial={isInitial}
                    setIsInitial={setIsInitial}
                    setIsStamp={setIsStamp}
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
                                    <span className="useEmail">
                                      {obj.Email}
                                    </span>
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
                                    <span className="useEmail">
                                      {obj.Email}
                                    </span>
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
