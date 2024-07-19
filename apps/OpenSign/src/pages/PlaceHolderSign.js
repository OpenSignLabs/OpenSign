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
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import HandleError from "../primitives/HandleError";
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
  convertPdfArrayBuffer
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import { useNavigate } from "react-router-dom";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import LinkUserModal from "../primitives/LinkUserModal";
import Title from "../components/Title";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import ModalUi from "../primitives/ModalUi";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import { SaveFileSize } from "../constant/saveFileSize";
import { EmailBody } from "../components/pdf/EmailBody";
import Upgrade from "../primitives/Upgrade";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useSelector } from "react-redux";
import PdfZoom from "../components/pdf/PdfZoom";
import LottieWithLoader from "../primitives/DotLottieReact";

function PlaceHolderSign() {
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
  const [signersdata, setSignersData] = useState();
  const [signerObjId, setSignerObjId] = useState();
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
    message: "This might take some time"
  });
  const [handleError, setHandleError] = useState();
  const [currentId, setCurrentId] = useState("");
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [placeholderTour, setPlaceholderTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [contractName, setContractName] = useState("");
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
  const [isAlreadyPlace, setIsAlreadyPlace] = useState({
    status: false,
    message: ""
  });
  const [extUserId, setExtUserId] = useState("");
  const [isCustomize, setIsCustomize] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
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
    item: {
      type: "BOX",
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
      type: "BOX",
      id: 2,
      text: "stamp"
    },

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
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert("User does not exist");
        } else if (tenantDetails) {
          const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team OpenSign™</p><br>`;
          if (tenantDetails?.RequestBody) {
            setRequestBody(tenantDetails?.RequestBody);
            setRequestSubject(tenantDetails?.RequestSubject);

            setDefaultBody(defaultRequestBody);
            setDefaultSubject(
              `{{sender_name}} has requested you to sign {{document_title}}`
            );
          } else {
            setRequestBody(defaultRequestBody);
            setRequestSubject(
              `{{sender_name}} has requested you to sign {{document_title}}`
            );
            setDefaultBody(defaultRequestBody);
            setDefaultSubject(
              `{{sender_name}}has requested you to sign {{document_title}}`
            );
          }
        }
      } catch (e) {
        alert("User does not exist");
      }
    } else {
      alert("User does not exist");
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

  async function checkIsSubscribed() {
    const res = await fetchSubscription();
    const freeplan = res.plan;
    const billingDate = res.billingDate;
    if (freeplan === "freeplan") {
      return true;
    } else if (billingDate) {
      if (new Date(billingDate) > new Date()) {
        setIsSubscribe(true);
        return true;
      } else {
        navigate(`/subscription`);
      }
    } else {
      navigate(`/subscription`);
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
        setHandleError("Error: Something went wrong!");
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
            message: "This document has been signed by all Signers."
          });
        } else if (declined) {
          // If document has been declined
          setIsAlreadyPlace({
            status: true,
            message:
              "This document has been declined by one or more recipient(s)."
          });
        } else if (currDate > expireUpdateDate) {
          // If document has expired
          setIsAlreadyPlace({
            status: true,
            message: "This Document is no longer available."
          });
        } else {
          // If document is dispatched for signing
          setIsAlreadyPlace({
            status: true,
            message: "The document has already been dispatched for signing."
          });
        }
      }

      setPdfDetails(documentData);

      if (documentData[0].Signers && documentData[0].Signers.length > 0) {
        const currEmail = documentData[0].ExtUserPtr.Email;
        setCurrentId(currEmail);
        setSignerObjId(documentData[0].Signers[0].objectId);
        setContractName(documentData[0].Signers[0].className);
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
              return {
                Role: x.Role,
                Id: x.Id,
                blockColor: x.blockColor
              };
            }
          });
          setSignersData(updatedSigners);
          setUniqueId(updatedSigners[0].Id);
          setBlockColor(updatedSigners[0].blockColor);
        } else {
          const updatedSigners = documentData[0].Signers.map((x, index) => ({
            ...x,
            Id: randomId(),
            // Role: "User " + (index + 1),
            blockColor: color[index % color.length]
          }));
          setSignersData(updatedSigners);
          setUniqueId(updatedSigners[0].Id);
          setBlockColor(updatedSigners[0].blockColor);
        }
      } else {
        // setRoleName("User 1");
        if (
          documentData[0].Placeholders &&
          documentData[0].Placeholders.length > 0
        ) {
          let updatedSigners = documentData[0].Placeholders.map((x) => {
            return {
              Role: x.Role,
              Id: x.Id,
              blockColor: x.blockColor
            };
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
    }
    const currentUserEmail = documentData[0]?.ExtUserPtr?.Email;
    const res = await contractUsers(currentUserEmail);
    if (res === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
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
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (res.length === 0) {
      setHandleError("No Data Found!");
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    }
  };

  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    getSignerPos(item, monitor);
  };
  const getSignerPos = (item, monitor) => {
    //  setSignerObjId("");
    // setContractName("");
    if (uniqueId) {
      const posZIndex = zIndex + 1;
      setZIndex(posZIndex);
      const signer = signersdata.find((x) => x.Id === uniqueId);
      const key = randomId();
      const getPdfPageWidth = pdfOriginalWH.find(
        (data) => data.pageNumber === pageNumber
      );
      const containerScale = containerWH?.width / getPdfPageWidth?.width || 1;
      let dropData = [];
      let placeHolder;
      const dragTypeValue = item?.text ? item.text : monitor.type;
      const widgetWidth = defaultWidthHeight(dragTypeValue).width;
      const widgetHeight = defaultWidthHeight(dragTypeValue).height;
      //adding and updating drop position in array when user drop signature button in div
      if (item === "onclick") {
        const dropObj = {
          //onclick put placeholder center on pdf
          xPosition:
            (containerWH.width / 2 - widgetWidth / 2) /
            (containerScale * scale),
          yPosition:
            (containerWH.height / 2 - widgetHeight / 2) /
            (containerScale * scale),
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
        placeHolder = {
          pageNumber: pageNumber,
          pos: dropData
        };
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
        placeHolder = {
          pageNumber: pageNumber,
          pos: dropData
        };
      }
      setSelectWidgetId(key);
      if (signer) {
        let filterSignerPos;
        if (dragTypeValue === textWidget) {
          filterSignerPos = signerPos.filter((data) => data.Role === "prefill");
        } else {
          filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
        }

        const { blockColor, Role } = signer;
        //adding placholder in existing signer pos array (placaholder)
        if (filterSignerPos.length > 0) {
          const getPlaceHolder = filterSignerPos[0].placeHolder;
          const updatePlace = getPlaceHolder.filter(
            (data) => data.pageNumber !== pageNumber
          );
          const getPageNumer = getPlaceHolder.filter(
            (data) => data.pageNumber === pageNumber
          );

          //add entry of position for same signer on multiple page
          if (getPageNumer.length > 0) {
            const getPos = getPageNumer[0].pos;
            const newSignPos = getPos.concat(dropData);
            let xyPos = {
              pageNumber: pageNumber,
              pos: newSignPos
            };
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
            if (dragTypeValue === textWidget) {
              updatesignerPos = signerPos.map((x) =>
                x.Role === "prefill"
                  ? { ...x, placeHolder: [...x.placeHolder, placeHolder] }
                  : x
              );
            } else {
              updatesignerPos = signerPos.map((x) =>
                x.Id === uniqueId
                  ? { ...x, placeHolder: [...x.placeHolder, placeHolder] }
                  : x
              );
            }
            setSignerPos(updatesignerPos);
          }
        } else {
          //adding new placeholder for selected signer in pos array (placeholder)
          let placeHolderPos;
          if (dragTypeValue === textWidget) {
            placeHolderPos = {
              signerPtr: {},
              signerObjId: "",
              blockColor: "#f58f8c",
              placeHolder: [placeHolder],
              Role: "prefill",
              Id: key
            };
          } else {
            if (contractName) {
              placeHolderPos = {
                signerPtr: {
                  __type: "Pointer",
                  className: `${contractName}`,
                  objectId: signerObjId
                },
                signerObjId: signerObjId,
                blockColor: blockColor ? blockColor : color[isSelectListId],
                placeHolder: [placeHolder],
                Role: Role ? Role : roleName,
                Id: uniqueId
              };
            } else {
              placeHolderPos = {
                signerPtr: {},
                signerObjId: "",
                blockColor: blockColor ? blockColor : color[isSelectListId],
                placeHolder: [placeHolder],
                Role: Role ? Role : roleName,
                Id: uniqueId
              };
            }
          }
          setSignerPos((prev) => [...prev, placeHolderPos]);
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
      const getPdfPageWidth = pdfOriginalWH.find(
        (data) => data.pageNumber === pageNumber
      );
      const containerScale = containerWH.width / getPdfPageWidth?.width;

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
    setTimeout(() => {
      setIsDragging(false);
    }, 200);
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
          const updateFilter = signerPos.filter((data) => data.Id !== Id);
          const getRemainPage = filterSignerPos[0].placeHolder.filter(
            (data) => data.pageNumber !== pageNumber
          );

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
            setSignerPos(updateFilter);
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
      setSignBtnPosition([
        {
          xPos: mouseX,
          yPos: mouseY
        }
      ]);
    } else {
      mouseX = e.clientX - divRect.left;
      mouseY = e.clientY - divRect.top;
      const xyPosition = {
        xPos: mouseX,
        yPos: mouseY
      };
      setXYSignature(xyPosition);
    }
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = () => {
    setSignBtnPosition([xySignature]);
  };

  function sanitizeFileName(fileName) {
    // Remove spaces and invalid characters
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "");
  }
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
        const pdfBytes = await multiSignEmbed(
          placeholder,
          pdfDoc,
          isSignYourSelfFlow,
          containerWH
        );

        const fileName = sanitizeFileName(pdfDetails[0].Name) + ".pdf";
        const pdfFile = new Parse.File(fileName, { base64: pdfBytes });

        // Save the Parse File if needed
        const pdfData = await pdfFile.save();
        const pdfUrl = pdfData.url();
        const tenantId = localStorage.getItem("TenantId");
        const buffer = atob(pdfBytes);
        SaveFileSize(buffer.length, pdfUrl, tenantId);
        return pdfUrl;
      } catch (e) {
        console.log("error", e);
      }
    } else {
      return pdfDetails[0].URL;
    }
  };
  const alertSendEmail = async () => {
    const filterPrefill = signerPos?.filter((data) => data.Role !== "prefill");
    const getPrefill = signerPos?.filter((data) => data.Role === "prefill");
    let isLabel = false;
    //condition is used to check text widget data is empty or have response
    if (getPrefill && getPrefill.length > 0) {
      const prefillPlaceholder = getPrefill[0].placeHolder;
      if (prefillPlaceholder) {
        prefillPlaceholder.map((data) => {
          if (!isLabel) {
            isLabel = data.pos.some((position) => !position.options.response);
          }
        });
      }
    }
    let isSignatureExist = true; // variable is used to check a signature widget exit or not then execute other code
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
        const alert = {
          mssg: "sure",
          alert: true
        };
        setIsSendAlert(alert);
      }
    }

    if (getPrefill && isLabel) {
      const alert = {
        mssg: textWidget,
        alert: true
      };
      setIsSendAlert(alert);
    } else if (isSignatureExist) {
      if (filterPrefill.length === signersdata.length) {
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
        const alert = {
          mssg: "sure",
          alert: true
        };
        setIsSendAlert(alert);
      }
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
          ExpiryDate: {
            iso: updateExpiryDate,
            __type: "Date"
          }
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
          setIsLoading({
            isLoad: false
          });
          setIsUiLoading(false);
          setSignerPos([]);
          setIsSendAlert({
            mssg: "confirm",
            alert: true
          });
        })
        .catch((err) => {
          console.log("axois err ", err);
          alert("something went wrong");
        });
    } catch (e) {
      console.log("error", e);
      alert("something went wrong");
    }
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset copied state after 1.5 seconds
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
          {copied && (
            <Alert type="success">
              <div className="ml-3">Copied</div>
            </Alert>
          )}
          <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis  ">
            {data.signerEmail}
          </span>
          <div className="flex flex-row items-center gap-3 ">
            <button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              className="flex flex-row items-center op-link op-link-primary"
            >
              <i className="fa-light fa-link" aria-hidden="true"></i>
              <span className=" hidden md:block ml-1 ">Copy link</span>
            </button>
            <RWebShare
              data={{
                url: data.url,
                title: "Sign url"
              }}
            >
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
        let url = `${localStorage.getItem("baseUrl")}functions/sendmailv3/`;
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
          recipient: signerMail[i].Email,
          subject: isCustomize
            ? replaceVar?.subject
            : `${senderName} has requested you to sign "${documentName}"`,
          from: senderEmail,
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
              "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
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
    if (sendMail.data.result.status === "success") {
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
          data = {
            SendMail: true
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
          .then(() => {})
          .catch((err) => {
            console.log("axois err ", err);
          });
      } catch (e) {
        console.log("error", e);
      }

      setIsSend(true);
      setIsMailSend(true);
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
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
          message={`Select a recipient from this list to add a place-holder where he is supposed to sign.The placeholder will appear in the same colour as the recipient name once you drop it on the document.`}
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
          message={`Clicking "Add recipients" button will allow you to add more signers.`}
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
          message={`Drag or click on a field to add it to the document.`}
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
          message={`The PDF content area already displays the template's existing placeholders. For your convenience, these placeholders will match the color of the recipient's name, making them easily identifiable.`}
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
          message={`Clicking "Send" will save the document. In the next step you can customize the emails to be sent out to the recipients or copy the signing links and share those with the recipients yourself.`}
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
                    defaultValue: defaultValue
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
                    isHideLabel: isHideLabel || false
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
                  defaultValue: defaultValue
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
    handleNameModal();
    setFontSize();
    setFontColor();
    //condition for text widget type after set all values for text widget
    //change setUniqueId which is set in tempsignerId
    //because textwidget do not have signer user so for selected signers we have to do
    if (currWidgetsDetails.type === textWidget) {
      setUniqueId(tempSignerId);
      setTempSignerId("");
    }
  };

  const handleNameModal = () => {
    setIsNameModal(false);
    setCurrWidgetsDetails({});
    setShowDropdown(false);
    setIsRadio(false);
    setIsCheckbox(false);
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
    signersdata.push({
      ...data,
      className: "contracts_Contactbook",
      Id: newId,
      blockColor: color[signersdata.length]
    });
    setUniqueId(newId);
    setIsSelectId(signersdata.length - 1);
    setBlockColor(color[signersdata.length]);
    setContractName("contracts_Contactbook");
    setSignerObjId(data.objectId);
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
        " You need to attach a Signer to every role. You can do that by clicking this icon. Once you select a Signer it will be attached to all the fields associated with that role which appear in the same colour. ",
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
                  This might take some time
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
              />
              {/* pdf render view */}
              <div className=" w-full md:w-[57%] flex mr-4">
                <PdfZoom
                  setScale={setScale}
                  scale={scale}
                  containerWH={containerWH}
                  setZoomPercent={setZoomPercent}
                  zoomPercent={zoomPercent}
                />
                <div className=" w-full md:w-[95%] ">
                  {/* this modal is used show alert set placeholder for all signers before send mail */}

                  <ModalUi
                    isOpen={isSendAlert.alert}
                    title={
                      isSendAlert.mssg === "sure" ||
                      isSendAlert.mssg === textWidget
                        ? "Fields required"
                        : isSendAlert.mssg === "confirm" && "Send Mail"
                    }
                    handleClose={() => setIsSendAlert({})}
                  >
                    <div className="max-h-96 overflow-y-scroll scroll-hide p-[20px] text-base-content">
                      {isSendAlert.mssg === "sure" ? (
                        <span>
                          Please ensure there&apos;s at least one signature
                          widget added for all recipients.
                        </span>
                      ) : isSendAlert.mssg === textWidget ? (
                        <p>
                          Please confirm that you have filled the text field.
                        </p>
                      ) : (
                        isSendAlert.mssg === "confirm" && (
                          <>
                            {!isCustomize && (
                              <span>
                                Are you sure you want to send out this document
                                for signatures?
                              </span>
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
                                  <span>Reset to default</span>
                                </div>
                              </>
                            )}
                            <div className="flex flex-row md:items-center gap-2 md:gap-6 mt-2">
                              <div className="flex flex-row gap-2">
                                <button
                                  onClick={() => sendEmailToSigners()}
                                  className="op-btn op-btn-primary font-[500] text-sm shadow"
                                >
                                  Send
                                </button>
                                {isCustomize && (
                                  <button
                                    onClick={() => setIsCustomize(false)}
                                    className="op-btn op-btn-ghost font-[500] text-sm"
                                  >
                                    Close
                                  </button>
                                )}
                              </div>
                              {!isCustomize && isSubscribe && (
                                <span
                                  className="op-link op-link-accent text-sm"
                                  onClick={() => setIsCustomize(!isCustomize)}
                                >
                                  Cutomize Email
                                </span>
                              )}
                              {!isSubscribe && isEnableSubscription && (
                                <div className="mt-2">
                                  <Upgrade
                                    message="Upgrade to customize Email"
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
                            <span className="ml-[5px] mr-[5px]">or</span>
                            <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                          </div>
                          <div className="mt-3 mb-3">{handleShareList()}</div>
                        </>
                      )}
                    </div>
                  </ModalUi>

                  {/* this modal is used show send mail  message and after send mail success message */}
                  <ModalUi
                    isOpen={isSend}
                    title={"Mails Sent"}
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
                          <p>
                            You have successfully sent mails to all recipients!
                          </p>
                          {isCurrUser && (
                            <p>Do you want to sign documents right now ?</p>
                          )}
                        </div>
                      ) : (
                        <p>Please setup mail adapter to send mail!</p>
                      )}
                      {!mailStatus && (
                        <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
                      )}
                      <div
                        className={
                          mailStatus === "success"
                            ? "flex justify-center mt-1"
                            : ""
                        }
                      >
                        {isCurrUser && (
                          <button
                            onClick={() => {
                              handleRecipientSign();
                            }}
                            type="button"
                            className="op-btn op-btn-primary mr-1"
                          >
                            Yes
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
                          {isCurrUser ? "No" : "Close"}
                        </button>
                      </div>
                    </div>
                  </ModalUi>
                  <ModalUi
                    isOpen={isShowEmail}
                    title={"signers alert"}
                    handleClose={() => {
                      setIsShowEmail(false);
                    }}
                  >
                    <div className="h-[100%] p-[20px]">
                      <p>Please select signer for add placeholder!</p>
                      <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
                      <button
                        onClick={() => {
                          setIsShowEmail(false);
                        }}
                        type="button"
                        className="op-btn op-btn-primary"
                      >
                        Ok
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
                    title="Radio group"
                    showDropdown={isRadio}
                    setShowDropdown={setIsRadio}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
                  />
                  <DropdownWidgetOption
                    type="checkbox"
                    title="Checkbox"
                    showDropdown={isCheckbox}
                    setShowDropdown={setIsCheckbox}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
                  />
                  <DropdownWidgetOption
                    type="dropdown"
                    title="Dropdown options"
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    handleSaveWidgetsOptions={handleSaveWidgetsOptions}
                    currWidgetsDetails={currWidgetsDetails}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleClose={handleNameModal}
                    isSubscribe={isSubscribe}
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
                  />

                  <div ref={divRef} data-tut="pdfArea" className="h-[95%]">
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
                        setIsPageCopy={setIsPageCopy}
                        signersdata={signersdata}
                        setSignKey={setSignKey}
                        setSignerObjId={setSignerObjId}
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
                        setSignerObjId={setSignerObjId}
                        setIsSelectId={setIsSelectId}
                        setContractName={setContractName}
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
                          setSignerObjId={setSignerObjId}
                          setIsSelectId={setIsSelectId}
                          setContractName={setContractName}
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
          title={"Document Alert"}
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
              View
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
      </DndProvider>
    </>
  );
}

export default PlaceHolderSign;
