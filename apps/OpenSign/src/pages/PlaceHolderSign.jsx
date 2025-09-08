import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Parse from "parse";
import "../styles/signature.css";
import { PDFDocument } from "pdf-lib";
import { useDrop } from "react-dnd";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import WidgetComponent from "../components/pdf/WidgetComponent";
import Tour from "../primitives/Tour";
import { useLocation, useParams } from "react-router";
import SignerListPlace from "../components/pdf/SignerListPlace";
import Header from "../components/pdf/PdfHeader";
import ShareButton from "../primitives/ShareButton";
import {
  replaceMailVaribles,
  pdfNewWidthFun,
  contractDocument,
  contractUsers,
  addZIndex,
  randomId,
  defaultWidthHeight,
  embedWidgetsToDoc,
  addWidgetOptions,
  textInputWidget,
  cellsWidget,
  textWidget,
  radioButtonWidget,
  color,
  getTenantDetails,
  copytoData,
  convertPdfArrayBuffer,
  getContainerScale,
  convertBase64ToFile,
  onClickZoomIn,
  onClickZoomOut,
  rotatePdfPage,
  handleRemoveWidgets,
  handleRotateWarning,
  signatureTypes,
  handleSignatureType,
  getBase64FromUrl,
  generatePdfName,
  mailTemplate,
  getOriginalWH,
  defaultMailBody,
  defaultMailSubject
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import { useNavigate } from "react-router";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import { SaveFileSize } from "../constant/saveFileSize";
import { useDispatch, useSelector } from "react-redux";
import PdfTools from "../components/pdf/PdfTools";
import { useTranslation } from "react-i18next";
import RotateAlert from "../components/RotateAlert";
import Loader from "../primitives/Loader";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import LinkUserModal from "../primitives/LinkUserModal";
import { EmailBody } from "../components/pdf/EmailBody";
import LottieWithLoader from "../primitives/DotLottieReact";
import Alert from "../primitives/Alert";
import WidgetsValueModal from "../components/pdf/WidgetsValueModal";
import * as utils from "../utils";
import { resetWidgetState, setPrefillImg } from "../redux/reducers/widgetSlice";
import EditDocument from "../components/pdf/EditTemplate";

function PlaceHolderSign() {
  const { t } = useTranslation();
  const copyUrlRef = useRef(null);
  const dispatch = useDispatch();
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const isShowModal = useSelector((state) => state.widget.isShowModal);
  const editorRef = useRef();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [defaultBody, setDefaultBody] = useState("");
  const [defaultSubject, setDefaultSubject] = useState("");
  const [requestSubject, setRequestSubject] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [tenantMailTemplate, setTenantMailTemplate] = useState({
    body: "",
    subject: ""
  });
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
  const [placeholderTour, setPlaceholderTour] = useState(false);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [containerWH, setContainerWH] = useState();
  const { docId } = useParams();
  const divRef = useRef(null);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const [blockColor, setBlockColor] = useState("");
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [signerExistModal, setSignerExistModal] = useState(false);
  const [isDontShow, setIsDontShow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [isRadio, setIsRadio] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState({});
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [isNameModal, setIsNameModal] = useState(false);
  const [mailStatus, setMailStatus] = useState("");
  const [isCurrUser, setIsCurrUser] = useState(false);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState("");
  const isSidebar = useSelector((state) => state.sidebar.isOpen);
  const [showRotateAlert, setShowRotateAlert] = useState({
    status: false,
    degree: 0
  });
  const [isAlreadyPlace, setIsAlreadyPlace] = useState({
    status: false,
    message: ""
  });
  const [isCustomize, setIsCustomize] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const [unSignedWidgetId, setUnSignedWidgetId] = useState("");
  const [signatureType, setSignatureType] = useState(signatureTypes);
  const [isUploadPdf, setIsUploadPdf] = useState(false);
  //'signersName' variable used to show all signer's name that do not have a signature widget assigned
  const [signersName, setSignersName] = useState("");
  const [prefillSigner, setPrefillSigner] = useState([]);
  const [owner, setOwner] = useState({});
  const [docTitle, setDocTitle] = useState("");
  const [isEditDoc, setIsEditDoc] = useState(false);
  const isMobile = window.innerWidth < 767;
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  });
  const currentUser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );
  const user = currentUser && JSON.parse(currentUser);
  const documentId = docId;
  useEffect(() => {
    dispatch(resetWidgetState([]));
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
        const defaultRequestBody = defaultMailBody;
        const defaultSubject = defaultMailSubject;
        setDefaultBody(defaultRequestBody);
        setDefaultSubject(defaultSubject);
        setRequestBody(defaultRequestBody);
        setRequestSubject(defaultSubject);
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          const signatureType = tenantDetails?.SignatureType || [];
          const filterSignTypes = signatureType?.filter(
            (x) => x.enabled === true
          );
          if (tenantDetails?.RequestBody) {
            setRequestBody(tenantDetails?.RequestBody);
            setRequestSubject(tenantDetails?.RequestSubject);
            setTenantMailTemplate({
              body: tenantDetails?.RequestBody,
              subject: tenantDetails?.RequestSubject
            });
          }
          return filterSignTypes;
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
  }, [divRef.current, isSidebar]);
  //function for get document details
  const getDocumentDetails = async () => {
    const tenantSignTypes = await fetchTenantDetails();
    //getting document details
    const documentData = await contractDocument(
      documentId,
      "Bcc"
    );

    if (documentData && documentData.length > 0) {
      const prefillImg = await utils?.savePrefillImg(
        documentData[0]?.Placeholders
      );
      if (prefillImg && Array.isArray(prefillImg)) {
        prefillImg.forEach((img) => {
          dispatch(setPrefillImg(img));
        });
      }

      setDocTitle(documentData?.[0]?.Name);
      const url = documentData[0] && documentData[0]?.URL;
      //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
      const arrayBuffer = await convertPdfArrayBuffer(url);
      const base64Pdf = await getBase64FromUrl(url);
      if (arrayBuffer === "Error") {
        setHandleError(t("something-went-wrong-mssg"));
      } else {
        setPdfArrayBuffer(arrayBuffer);
        setPdfBase64Url(base64Pdf);
      }
      setOwner(documentData?.[0]?.ExtUserPtr);
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
      if (documentData?.[0]?.RequestBody && documentData?.[0]?.RequestSubject) {
        setTenantMailTemplate({
          body: documentData?.[0]?.RequestBody,
          subject: documentData?.[0]?.RequestSubject
        });
      }
      if (
        documentData[0]?.Placeholders?.length === 0 &&
        documentData[0]?.Signers?.length === 0
      ) {
        setSignersData([]);
        setSignerPos([]);
        setPrefillSigner([utils?.prefillObj()]);
      }
      //condition when placeholder have empty array with role details and signers array have signers data
      //and both array length are same
      //this case happen using placeholder form in auto save funtionality to save draft type document without adding any placeholder
      else if (
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
        setPrefillSigner([utils?.prefillObj()]);
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
          const prefillPlaceholder = documentData[0]?.Placeholders.find(
            (data) => data.Role === "prefill"
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
          if (prefillPlaceholder) {
            setPrefillSigner([utils?.prefillObj(prefillPlaceholder.Id)]);
          } else {
            setPrefillSigner([utils?.prefillObj()]);
          }
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
          setPrefillSigner([utils?.prefillObj()]);
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
          setSignerPos(documentData[0].Placeholders);
          if (placeholder.length > 0) {
            let updatedSigners = placeholder.map((x) => {
              return { Role: x.Role, Id: x.Id, blockColor: x.blockColor };
            });
            setSignersData(updatedSigners);
            setIsSelectId(0);
            setUniqueId(updatedSigners[0].Id);
            setBlockColor(updatedSigners[0].blockColor);
          }
          const prefillPlaceholder = documentData[0]?.Placeholders.find(
            (data) => data.Role === "prefill"
          );
          if (prefillPlaceholder) {
            setPrefillSigner([utils?.prefillObj(prefillPlaceholder.Id)]);
          } else {
            setPrefillSigner([utils?.prefillObj()]);
          }
        }
      }
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      if (documentData?.result?.error?.includes("deleted")) {
        setHandleError(t("document-deleted"));
      } else {
        setHandleError(t("something-went-wrong-mssg"));
      }
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
      setSignerUserId(res[0].objectId);
      const tourstatus = res[0].TourStatus && res[0].TourStatus;
      const alreadyPlaceholder = documentData[0]?.SignedUrl;
      if (alreadyPlaceholder) {
        setCheckTourStatus(true);
      } else if (tourstatus && tourstatus.length > 0) {
        setTourStatus(tourstatus);
        const tour = tourstatus?.some((data) => data.placeholder) || false;
        setPlaceholderTour(!tour);
        setCheckTourStatus(tour);
      } else {
        setPlaceholderTour(true);
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
      const signer = signersdata.find((x) => x.Id === uniqueId);
      const prefillUser = prefillSigner.find((x) => x.Id === uniqueId);
      if (signer || prefillUser) {
        const posZIndex = zIndex + 1;
        setZIndex(posZIndex);
        const key = randomId();
        const containerScale = getContainerScale(
          pdfOriginalWH,
          pageNumber,
          containerWH
        );
        let dropData = [],
          filterSignerPos,
          currentPagePosition,
          placeHolder,
          dropObj;
        filterSignerPos = signerPos.find((data) => data.Id === uniqueId);
        const dragTypeValue = item?.text ? item.text : monitor.type;
        const widgetWidth =
          defaultWidthHeight(dragTypeValue).width * containerScale;
        const widgetHeight =
          defaultWidthHeight(dragTypeValue).height * containerScale;
        //adding and updating drop position in array when user drop signature button in div
        if (item === "onclick") {
          // `getBoundingClientRect()` is used to get accurate measurement width, height of the Pdf div
          const divWidth = divRef.current.getBoundingClientRect().width;
          const divHeight = divRef.current.getBoundingClientRect().height;
          //  Compute the pixel‐space center within the PDF viewport:
          const centerX_Pixels = divWidth / 2 - widgetWidth / 2;
          const xPosition_Final = centerX_Pixels / (containerScale * scale);
          dropObj = {
            //onclick put placeholder center on pdf
            xPosition: xPosition_Final,
            yPosition: widgetHeight + divHeight / 2,
            isStamp:
              (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
            key: key,
            scale: containerScale,
            zIndex: posZIndex,
            type: dragTypeValue,
            options: addWidgetOptions(
              dragTypeValue,
              owner,
              filterSignerPos?.placeHolder
            ),
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
          dropObj = {
            xPosition: getXPosition / (containerScale * scale),
            yPosition: getYPosition / (containerScale * scale),
            isStamp:
              (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
            key: key,
            scale: containerScale,
            zIndex: posZIndex,
            type: dragTypeValue,
            options: addWidgetOptions(
              dragTypeValue,
              owner,
              filterSignerPos?.placeHolder
            ),
            Width: widgetWidth / (containerScale * scale),
            Height: widgetHeight / (containerScale * scale)
          };
          dropData.push(dropObj);
          placeHolder = { pageNumber: pageNumber, pos: dropData };
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

          updatesignerPos = signerPos.map((x) =>
            x.Id === uniqueId ? { ...x, placeHolder: updatePlace } : x
          );

          setSignerPos(updatesignerPos);
        } else {
          //condition for prefill role to attach prefill widget on multiple page first time there are no any prefill widget exist
          if (roleName === "prefill") {
            //if condition for prefill role only prefill object exist and placeholder empty then add prefill widget in placeholder
            if (filterSignerPos) {
              const addPrefillData =
                filterSignerPos && filterSignerPos?.placeHolder;
              addPrefillData.push(placeHolder);
              const updatePrefillPos = signerPos.map((x) =>
                x.Role === "prefill" ? { ...x, placeHolder: addPrefillData } : x
              );
              setSignerPos(updatePrefillPos);
            } //else condition if there are no prefill role exist in array then add prefill widget in placeholder
            else {
              const prefillTextWidget = {
                signerPtr: {},
                signerObjId: "",
                blockColor: utils?.prefillBlockColor,
                placeHolder: [placeHolder],
                Role: "prefill",
                Id: uniqueId
              };
              const xyPosition = signerPos || [];
              xyPosition.unshift(prefillTextWidget);
              setSignerPos(xyPosition);
            }
          } else {
            //else condition to add placeholder widgets on multiple page first time for signers
            const updatesignerPos = signerPos.map((x) =>
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
        setCurrWidgetsDetails(dropObj);
      }
    }
  };

  //function for get pdf page details
  const pageDetails = async (pdf) => {
    const pdfWHObj = await getOriginalWH(pdf);
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
              if (signId) {
                if (obj.Id === signId) {
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
  const handleDeleteWidget = (key, Id) => {
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
            const updatedData = signerPos
              .filter((item) => !(item.Id === Id && item.Role === "prefill")) // Remove prefill object
              .map((item) => {
                if (item.Id === Id && item.Role !== "prefill") {
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
  const embedPrefilllWidgets = async () => {
    const prefillExist = signerPos.filter((data) => data.Role === "prefill");
    if (prefillExist && prefillExist.length > 0) {
      const placeholder = prefillExist[0].placeHolder;
      const existingPdfBytes = pdfArrayBuffer;
      const pdfDoc = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true
      });
      const isSignYourSelfFlow = false;
      try {
        const docId = pdfDetails[0]?.objectId;
        //pdfOriginalWH contained all pdf's pages width,height & pagenumber in array format
        const pdfBase64 = await embedWidgetsToDoc(
          placeholder,
          pdfDoc,
          isSignYourSelfFlow,
          scale,
          prefillImg
        );
        const pdfName = generatePdfName(16);
        const pdfUrl = await convertBase64ToFile(
          pdfName,
          pdfBase64,
          "",
        );
        const tenantId = localStorage.getItem("TenantId");
        const buffer = atob(pdfBase64);
        SaveFileSize(buffer.length, pdfUrl, tenantId, owner?.UserId?.objectId);
        return pdfUrl;
      } catch (err) {
        console.log("error to convertBase64ToFile in placeholder flow", err);
        alert(err?.message);
      }
    } else if (pdfBase64Url) {
      try {
        const pdfName = generatePdfName(16);
        const pdfUrl = await convertBase64ToFile(
          pdfName,
          pdfBase64Url,
          "",
        );
        return pdfUrl;
      } catch (err) {
        console.log("error to convertBase64ToFile in placeholder flow", err);
        alert(err?.message);
      }
    } else {
      return pdfDetails[0].URL;
    }
  };

  const handleSaveDoc = async () => {
    let isPrefillEmpty = false,
      unfilledTextWidgetId;
    const prefillExist = signerPos?.find((data) => data.Role === "prefill");
    //condition to check prefill widget exit or not
    if (prefillExist) {
      const getPlaceholder = prefillExist?.placeHolder;
      //if prefill widget exist then make sure there are no any empty prefill widget
      //if empty widget exist and user try to send document then throw tour message
      for (const placeholder of getPlaceholder || []) {
        const requiredWidgets = placeholder.pos.filter(
          (position) => position.type !== "checkbox"
        );
        for (const widget of requiredWidgets) {
          const hasResponse = widget?.options?.response;
          const hasDefault = widget?.options?.defaultValue;
          if (!hasResponse && !hasDefault && !isPrefillEmpty) {
            isPrefillEmpty = true;
            unfilledTextWidgetId = widget.key;
            setPageNumber(placeholder.pageNumber);
            setUniqueId(placeholder.Id);
            break;
          }
        }
        if (isPrefillEmpty) break;
      }
    }
    // keep only non-prefill signers
    const filterPrefill = (signerPos ?? []).filter((s) => s.Role !== "prefill");

    //checking all signers placeholder exist or not
    const isPlaceholderExist =
      filterPrefill?.length > 0 &&
      filterPrefill.some((data) => data.placeHolder);
    // signers who don't have a signature widget (or have no placeholders at all)
    const unassignedWidget = filterPrefill?.filter(
      (s) => !utils?.hasSignatureWidget(s)
    );

    //checking if there are any signer list which do not have signture widget then show signers name on tour messages
    if (unassignedWidget.length > 0) {
      const getSigner = unassignedWidget.map((x) => {
        return signersdata.find((y) => y.Id === x.Id).Name;
      });
      const signerName = getSigner.join(", ");
      setSignersName(signerName);
      setIsSendAlert({ mssg: "sure", alert: true });
      setUniqueId(unassignedWidget[0]?.Id);
      setRoleName("");
    }

    if (prefillExist && isPrefillEmpty) {
      setIsSendAlert({ mssg: "prefill", alert: true });
      setUnSignedWidgetId(unfilledTextWidgetId);
    } else if (signersdata?.length === 0) {
      alert(t("atleast-one-recipient-alert"));
    } else if (isPlaceholderExist && unassignedWidget.length === 0) {
      const IsSignerNotExist = filterPrefill?.filter((x) => !x.signerObjId);
      if (IsSignerNotExist && IsSignerNotExist?.length > 0) {
        setSignerExistModal(true);
        setCurrWidgetsDetails(IsSignerNotExist[0]?.placeHolder?.[0]?.pos[0]);
      } else {
        saveDocumentDetails();
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !pdfDetails?.[0]?.IsCompleted &&
        pdfDetails?.[0]?.CreatedBy?.objectId === user?.objectId
      ) {
        autosavedetails();
      }
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerPos, signersdata, signatureType, pdfBase64Url]);
  // `autosavedetails` is used to save doc details after every 2 sec when changes are happern in placeholder like drag-drop widgets, remove signers
  const autosavedetails = async () => {
    const signers = signersdata?.reduce((acc, x) => {
      if (x.objectId) {
        acc.push({
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: x.objectId
        });
      }
      return acc;
    }, []);
    let pdfUrl;
    if (isUploadPdf) {
      const pdfName = generatePdfName(16);
      pdfUrl = await convertBase64ToFile(
        pdfName,
        pdfBase64Url,
        "",
      );
    }
    try {
      const docCls = new Parse.Object("contracts_Document");
      docCls.id = documentId;
      if (signerPos?.length > 0) {
        docCls.set("Placeholders", signerPos);
      }
      docCls.set("Signers", signers);
      docCls.set("SignatureType", signatureType);
      if (pdfUrl) {
        docCls.set("URL", pdfUrl);
      }
      const res = await docCls.save();
      if (res && pdfUrl) {
        pdfDetails[0] = { ...pdfDetails[0], URL: pdfUrl };
      }
    } catch (e) {
      console.log("error", e);
      alert(t("something-went-wrong-mssg"));
    }
  };
  //function to use save placeholder details in contracts_document
  const saveDocumentDetails = async () => {
    setIsUiLoading(true);
    let signerMail = signersdata.slice();
    // For "Send in order", only consider the first signer
    if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
      signerMail.splice(1);
    }
    const pdfUrl = await embedPrefilllWidgets();
    if (pdfUrl) {
      const removePrefillSigner = signersdata.filter(
        (x) => x.Role !== "prefill"
      );
      const signers = removePrefillSigner?.map((x) => {
        return {
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: x.objectId
        };
      });
      const addExtraDays = pdfDetails?.[0]?.TimeToCompleteDays
        ? pdfDetails[0].TimeToCompleteDays
        : 15;
      const currentUser = signersdata.find((x) => x.Email === currentId);
      setCurrentId(currentUser?.objectId);
      if (
        pdfDetails?.[0]?.SendinOrder &&
        pdfDetails?.[0]?.SendinOrder === true
      ) {
        const currentUserMail = Parse.User.current()?.getEmail();
        const isCurrentUser = signerMail?.[0]?.Email === currentUserMail;
        setIsCurrUser(isCurrentUser);
      } else {
        setIsCurrUser(currentUser?.objectId ? true : false);
      }
      // Compute expiry date with extra days
      let updateExpiryDate = new Date();
      updateExpiryDate.setDate(updateExpiryDate.getDate() + addExtraDays);
      try {
        const data = {
          Name: docTitle || pdfDetails?.[0]?.Name,
          Placeholders: signerPos,
          SignedUrl: pdfUrl,
          URL: pdfUrl,
          Signers: signers,
          SentToOthers: true,
          SignatureType: pdfDetails?.[0]?.SignatureType,
          ExpiryDate: { iso: updateExpiryDate, __type: "Date" }
        };
        await axios.put(
          `${localStorage.getItem("baseUrl")}classes/contracts_Document/${documentId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        );
        setIsMailSend(true);
        setIsLoading({ isLoad: false });
        setIsUiLoading(false);
        setIsSendAlert({ mssg: "confirm", alert: true });
        if (docTitle) {
          const updatedPdfDetails = [...pdfDetails];
          updatedPdfDetails[0].Name = docTitle;
          setPdfDetails(updatedPdfDetails);
        }
      } catch (e) {
        console.log("error", e);
        alert(t("something-went-wrong-mssg"));
      }
    } else {
      setIsUiLoading(false);
    }
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text; // Update text safely
    }
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
          <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">
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
            <ShareButton
              title={t("sign-url")}
              text={t("sign-url")}
              url={data.url}
            >
              <i className="fa-light fa-share-from-square op-link data-[theme=opensigndark]:op-link-primary data-[theme=opensigncss]:op-link-secondary no-underline"></i>
            </ShareButton>
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

    let senderEmail =
      pdfDetails?.[0]?.ExtUserPtr?.Email;
    let senderPhone = pdfDetails?.[0]?.ExtUserPtr?.Phone;
    let signerMail = signersdata.slice();
    if (pdfDetails?.[0]?.SendinOrder && pdfDetails?.[0]?.SendinOrder === true) {
      signerMail.splice(1);
    }

    for (let i = 0; i < signerMail.length; i++) {
      try {
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
        const orgName = pdfDetails[0]?.ExtUserPtr.Company
          ? pdfDetails[0].ExtUserPtr.Company
          : "";
        const senderName =
          pdfDetails?.[0].ExtUserPtr.Name;
        const documentName = `${pdfDetails?.[0].Name}`;
        let replaceVar;

        if (
          requestBody &&
          requestSubject &&
          isCustomize
        ) {
          const replacedRequestBody = requestBody.replace(/"/g, "'");
          htmlReqBody =
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
            replacedRequestBody +
            "</body> </html>";

          const variables = {
            document_title: documentName,
            note: pdfDetails?.[0]?.Note,
            sender_name: senderName,
            sender_mail: senderEmail,
            sender_phone: senderPhone || "",
            receiver_name: signerMail[i]?.Name || "",
            receiver_email: signerMail[i].Email,
            receiver_phone: signerMail[i]?.Phone || "",
            expiry_date: localExpireDate,
            company_name: orgName,
            signing_url: signPdf
          };
          replaceVar = replaceMailVaribles(
            requestSubject,
            htmlReqBody,
            variables
          );
        } else if (
          tenantMailTemplate?.body &&
          tenantMailTemplate?.subject
        ) {
          const mailBody = tenantMailTemplate?.body;
          const mailSubject = tenantMailTemplate?.subject;
          const replacedRequestBody = mailBody.replace(/"/g, "'");
          const htmlReqBody =
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
            replacedRequestBody +
            "</body> </html>";
          const variables = {
            document_title: documentName,
            note: pdfDetails?.[0]?.Note,
            sender_name: senderName,
            sender_mail: senderEmail,
            sender_phone: senderPhone || "",
            receiver_name: signerMail[i]?.Name || "",
            receiver_email: signerMail[i].Email,
            receiver_phone: signerMail[i]?.Phone || "",
            expiry_date: localExpireDate,
            company_name: orgName,
            signing_url: signPdf
          };
          replaceVar = replaceMailVaribles(mailSubject, htmlReqBody, variables);
        }
        const mailparam = {
          senderName: senderName,
          note: pdfDetails?.[0]?.Note || "",
          senderMail: senderEmail,
          title: documentName,
          organization: orgName,
          localExpireDate: localExpireDate,
          signingUrl: signPdf
        };
        let params = {
          extUserId: owner?.objectId,
          recipient: signerMail[i].Email,
          subject: replaceVar?.subject
            ? replaceVar?.subject
            : mailTemplate(mailparam).subject,
          replyto: senderEmail,
          from:
            senderEmail,
          html: replaceVar?.body
            ? replaceVar?.body
            : mailTemplate(mailparam).body
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
        if (
          requestBody &&
          requestSubject &&
          isCustomize
        ) {
          data = {
            RequestBody: htmlReqBody,
            RequestSubject: requestSubject,
            SendMail: true
          };
        } else if (
          tenantMailTemplate?.body &&
          tenantMailTemplate?.subject
        ) {
          data = {
            RequestBody: tenantMailTemplate?.body,
            RequestSubject: tenantMailTemplate?.subject,
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
    }
    else {
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
      selector: '[data-tut="prefillTour"]',
      content: () => (
        <TourContentWithBtn
          message={t("prefill-tour")}
          isDontShowCheckbox={!checkTourStatus}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="recipientArea"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.placeholder-sign-1")}
          isDontShowCheckbox={!checkTourStatus}
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
          isDontShowCheckbox={!checkTourStatus}
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
          isDontShowCheckbox={!checkTourStatus}
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
          isDontShowCheckbox={!checkTourStatus}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="pdftools"]',
      content: () => (
        <TourContentWithBtn
          message={t("pdf-tools-tour")}
          isDontShowCheckbox={!checkTourStatus}
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
          isDontShowCheckbox={!checkTourStatus}
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
    isHideLabel,
    layout
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
          if (position.key === currWidgetsDetails?.key) {
            if (currWidgetsDetails?.type === radioButtonWidget) {
              if (addOption) {
                return {
                  ...position,
                  Height: position.Height
                    ? position.Height + 15
                    : defaultWidthHeight(currWidgetsDetails?.type).height + 15
                };
              } else if (deleteOption) {
                return {
                  ...position,
                  Height: position.Height
                    ? position.Height - 15
                    : defaultWidthHeight(currWidgetsDetails?.type).height - 15
                };
              } else {
                return {
                  ...position,
                  options: {
                    ...position.options,
                    name: dropdownName,
                    values: dropdownOptions,
                    status: status,
                    layout: layout,
                    isReadOnly: isReadOnly || false,
                    isHideLabel: isHideLabel || false,
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
            } else if (currWidgetsDetails?.type === "checkbox") {
              if (addOption) {
                return {
                  ...position,
                  Height: position.Height
                    ? position.Height + 15
                    : defaultWidthHeight(currWidgetsDetails?.type).height + 15
                };
              } else if (deleteOption) {
                return {
                  ...position,
                  Height: position.Height
                    ? position.Height - 15
                    : defaultWidthHeight(currWidgetsDetails?.type).height - 15
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
                    layout: layout,
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
                    "black",
                  ...(isReadOnly ? { isReadOnly: isReadOnly || false } : {})
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
          if (position.key === currWidgetsDetails?.key) {
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
                        {},
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black",
                  isReadOnly: defaultdata?.isReadOnly || false
                }
              };
            } else if (position.type === cellsWidget) {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: defaultdata?.name || "Cells",
                  status: defaultdata?.status || "required",
                  hint: defaultdata?.hint || "",
                  cellCount: parseInt(defaultdata?.cellCount || 5),
                  defaultValue: (defaultdata?.defaultValue || "").slice(
                    0,
                    parseInt(defaultdata?.cellCount || 5)
                  ),
                  validation:
                        {},
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black",
                  isReadOnly: defaultdata?.isReadOnly || false
                }
              };
            } else if (["signature"].includes(position.type)) {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: defaultdata.name,
                  hint: defaultdata?.hint || ""
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
                  hint: defaultdata?.hint || "",
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
  };
  //function for update TourStatus
  const closeTour = async () => {
    setPlaceholderTour(false);
    setIsDontShow(true);
    if (!checkTourStatus && isDontShow) {
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
      try {
        await axios.put(
          `${localStorage.getItem(
            "baseUrl"
          )}classes/contracts_Users/${signerUserId}`,
          { TourStatus: updatedTourStatus },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              sessionToken: localStorage.getItem("accesstoken")
            }
          }
        );
        setCheckTourStatus(true);
      } catch (err) {
        console.log("axois err ", err);
      }
    }
  };
  const handleRecipientSign = () => {
    if (currentId) {
      navigate(`/recipientSignPdf/${documentId}/${currentId}`);
    } else {
      navigate(`/recipientSignPdf/${documentId}`);
    }
  };
  const handleLinkUser = (id) => {
    setIsAddUser({ [id]: true });
  };
  //`handleAddUser` function to use add new user
  const handleAddUser = (data, signerObjId) => {
    const id = signerObjId ? signerObjId : uniqueId;
    if (isAddSigner) {
      handleAddNewRecipients(data);
    } else {
      if (data && data.objectId) {
        const signerPtr = {
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: data.objectId
        };
        const updatePlaceHolder = signerPos.map((x) => {
          if (x.Id === id || x.signerObjId === id) {
            const updated = {
              ...x,
              signerPtr,
              signerObjId: data.objectId
            };

            // Only update email if it already exists in `x`
            if ("email" in x) {
              updated.email = data?.Email || ""; // keep old if no new email
            }

            return updated;
          }
          return { ...x };
        });
        setSignerPos(updatePlaceHolder);
        const updateSigner = signersdata.map((x) => {
          if (x.Id === id || x.objectId === id) {
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
        const index = signersdata.findIndex(
          (x) => x.Id === id || x.objectId === id
        );
        setIsSelectId(index);
      }
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
    setBlockColor(color[signersdata.length - 1]);
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
      content: t("attach-signer-tour"),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  const prefillWidgetTour = [
    {
      selector: '[data-tut="IsSigned"]',
      content: t("text-field-tour"),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  const signatureWidgetTour = [
    {
      selector: '[data-tut="isSignatureWidget"]',
      content: t("signature-field-widget", { signersName }),
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
    const prefillObj = signerPos.find((x) => x.Role === "prefill");
    const filterPrefill = signerPos.filter((x) => x.Role !== "prefill");
    const updatePlaceholderUser = filterPrefill
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
    if (prefillObj) {
      updatePlaceholderUser.unshift(prefillObj);
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
    const rotatePlaceholderExist = handleRotateWarning(signerPos, pageNumber);
    //show rotation alert if widgets already exist
    if (rotatePlaceholderExist) {
      setShowRotateAlert({ status: true, degree: rotateDegree });
    } else {
      setIsUploadPdf(true);
      const urlDetails = await rotatePdfPage(
        rotateDegree,
        pageNumber - 1,
        pdfArrayBuffer
      );
      setPdfArrayBuffer(urlDetails.arrayBuffer);
      setPdfBase64Url(urlDetails.base64);
    }
  };
  const handleRemovePlaceholder = async () => {
    handleRemoveWidgets(
      setSignerPos,
      signerPos,
      pageNumber,
      setShowRotateAlert
    );
    const urlDetails = await rotatePdfPage(
      showRotateAlert.degree,
      pageNumber - 1,
      pdfArrayBuffer
    );
    setPdfArrayBuffer(urlDetails.arrayBuffer);
    setPdfBase64Url(urlDetails.base64);
  };

  const handleEditDocumentModal = () => {
    setIsEditDoc(!isEditDoc);
  };

  const handleEditDocumentForm = async (data) => {
    setIsEditDoc(false);
    const updateDocument = pdfDetails.map((x) => {
      return { ...x, ...data };
    });
    setPdfDetails(updateDocument);
    try {
      const Bcc = updateDocument?.[0]?.Bcc?.length
        ? {
            Bcc: updateDocument?.[0]?.Bcc?.map((x) => ({
              __type: "Pointer",
              className: "contracts_Contactbook",
              objectId: x.objectId
            }))
          }
        : {};
      const RedirectUrl = updateDocument?.[0]?.RedirectUrl
        ? { RedirectUrl: updateDocument?.[0]?.RedirectUrl }
        : {};
      const data = {
        ...(updateDocument?.[0]?.URL ? { URL: updateDocument?.[0]?.URL } : {}),
        Name: updateDocument?.[0]?.Name || "",
        Note: updateDocument?.[0]?.Note || "",
        Description: updateDocument?.[0]?.Description || "",
        SendinOrder: updateDocument?.[0]?.SendinOrder || false,
        AutomaticReminders: updateDocument?.[0]?.AutomaticReminders,
        IsEnableOTP: updateDocument?.[0]?.IsEnableOTP === true ? true : false,
        IsTourEnabled:
          updateDocument?.[0]?.IsTourEnabled === true ? true : false,
        NotifyOnSignatures:
          updateDocument?.[0]?.NotifyOnSignatures !== undefined
            ? updateDocument?.[0]?.NotifyOnSignatures
            : false,
        TimeToCompleteDays:
          parseInt(updateDocument?.[0]?.TimeToCompleteDays) || 15,
        ...Bcc,
        ...RedirectUrl
      };
      const updateTemplateObj = new Parse.Object("contracts_Document");
      updateTemplateObj.id = pdfDetails?.[0]?.objectId;
      for (const key in data) {
        updateTemplateObj.set(key, data[key]);
      }
      await updateTemplateObj.save();
    } catch (err) {
      console.log("error in save document", err);
    }
  };
  return (
    <>
      {isLoading.isLoad ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : handleError ? (
        <HandleError handleError={handleError} />
      ) : (
        <div className="relative op-card overflow-hidden flex flex-col md:flex-row justify-between bg-base-300">
          {isUiLoading && (
            <div className="absolute h-full w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2]/80">
              <Loader />
              <span className="text-[13px]">{t("loading-mssg")}</span>
            </div>
          )}
          {/* 
            this component used for UI interaction and show their functionality 
            this tour component used in your html component where you want to put
            onRequestClose function to close tour
            steps is defined what will be your messages and style also
            isOpen is takes boolean value to open 
            */}
          <Tour
            onRequestClose={closeTour}
            steps={tourConfig}
            isOpen={placeholderTour}
            rounded={5}
            closeWithMask={false}
          />
          <Tour
            onRequestClose={() => setSignerExistModal(false)}
            steps={signerAssignTour}
            isOpen={signerExistModal}
          />
          <Tour
            onRequestClose={() => setIsSendAlert({})}
            steps={prefillWidgetTour}
            isOpen={isSendAlert.mssg === "prefill"}
          />
          <Tour
            onRequestClose={() => handleCloseSendmailModal()}
            steps={signatureWidgetTour}
            isOpen={isSendAlert?.mssg === "sure" && true}
          />
          {/* this component used to render all pdf pages in left side */}
          <RenderAllPdfPage
            allPages={allPages}
            setAllPages={setAllPages}
            setPageNumber={setPageNumber}
            setSignBtnPosition={setSignBtnPosition}
            pageNumber={pageNumber}
            pdfBase64Url={pdfBase64Url}
            signedUrl={pdfDetails?.[0]?.SignedUrl || ""}
            setPdfArrayBuffer={setPdfArrayBuffer}
            setPdfBase64Url={setPdfBase64Url}
            setIsUploadPdf={setIsUploadPdf}
            pdfArrayBuffer={pdfArrayBuffer}
            isMergePdfBtn={true}
          />
          {/* pdf render view */}
          <div className="w-full md:w-[57%] flex mr-4">
            <PdfTools
              clickOnZoomIn={clickOnZoomIn}
              clickOnZoomOut={clickOnZoomOut}
              handleRotationFun={handleRotationFun}
              pdfArrayBuffer={pdfArrayBuffer}
              pageNumber={pageNumber}
              setPdfBase64Url={setPdfBase64Url}
              setPdfArrayBuffer={setPdfArrayBuffer}
              setIsUploadPdf={setIsUploadPdf}
              setSignerPos={setSignerPos}
              signerPos={signerPos}
              userId={uniqueId}
              allPages={allPages}
              setAllPages={setAllPages}
              setPageNumber={setPageNumber}
              setIsTour={setPlaceholderTour}
            />
            <div className=" w-full md:w-[95%] ">
              {/* this modal is used show alert set placeholder for all signers before send mail */}
              <ModalUi
                isOpen={isSendAlert.alert && isSendAlert.mssg === "confirm"}
                title={isSendAlert.mssg === "confirm" && t("send-mail")}
                handleClose={() => handleCloseSendmailModal()}
              >
                <div className="max-h-96 overflow-y-scroll scroll-hide p-[20px] text-base-content">
                  {isSendAlert.mssg === "confirm" && (
                    <>
                      {!isCustomize && <span>{t("placeholder-alert-3")}</span>}
                      {
                          isCustomize && (
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
                          )
                      }
                      <div className="flex flex-row items-center gap-2 md:gap-6 mt-2">
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
                        {
                            !isCustomize && (
                              <span
                                className="op-link op-link-accent text-sm"
                                onClick={() => setIsCustomize(!isCustomize)}
                              >
                                {t("cutomize-email")}
                              </span>
                            )
                        }
                      </div>
                    </>
                  )}
                  {isSendAlert.mssg === "confirm" && (
                    <>
                      <div className="flex justify-center items-center mt-3">
                        <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                        <span className="ml-[5px] mr-[5px]">{t("or")}</span>
                        <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
                      </div>
                      <div className="my-3">{handleShareList()}</div>
                      <p id="copyUrl" ref={copyUrlRef} className="hidden"></p>
                    </>
                  )}
                </div>
              </ModalUi>
              {/* this modal is used show send mail  message and after send mail success message */}
              <ModalUi
                isOpen={isSend}
                title={
                  mailStatus === "success"
                    ? t("mails-sent")
                    : mailStatus === "quotareached"
                      ? t("quota-mail-head")
                      : t("mail-not-delivered")
                }
                handleClose={() => {
                  setIsSend(false);
                  setSignerPos([]);
                  navigate("/report/1MwEuxLEkF");
                }}
              >
                <div className="h-[100%] p-[20px] text-base-content">
                  {mailStatus === "success" ? (
                    <div className="text-center mb-[10px]">
                      <LottieWithLoader />
                      {pdfDetails[0].SendinOrder ? (
                        <p>
                          {isCurrUser
                            ? t("placeholder-mail-alert-you")
                            : t("placeholder-mail-alert", {
                                name: signersdata[0]?.Name
                              })}
                        </p>
                      ) : (
                        <p>{t("placeholder-alert-4")}</p>
                      )}
                      {isCurrUser && <p>{t("placeholder-alert-5")}</p>}
                    </div>
                  ) : mailStatus === "quotareached" ? (
                    <div className="flex flex-col gap-y-3">
                      <div className="my-3">{handleShareList()}</div>
                    </div>
                  ) : (
                    <div className="mb-[10px]">
                      {mailStatus === "dailyquotareached" ? (
                        <p>{t("daily-quota-reached")}</p>
                      ) : (
                        <p>{t("placeholder-alert-6")}</p>
                      )}
                      {isCurrUser && (
                        <p className="mt-1">{t("placeholder-alert-5")}</p>
                      )}
                    </div>
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
                        className="op-btn op-btn-ghost text-base-content"
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
                xyPosition={signerPos}
                setXyPosition={setSignerPos}
                allPages={allPages}
                pageNumber={pageNumber}
                signKey={currWidgetsDetails?.key}
                Id={uniqueId}
                widgetType={currWidgetsDetails?.type}
                setUniqueId={setUniqueId}
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
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontColor={fontColor}
                setFontColor={setFontColor}
                isShowAdvanceFeature={true}
                roleName={roleName}
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
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontColor={fontColor}
                setFontColor={setFontColor}
                isShowAdvanceFeature={true}
                roleName={roleName}
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
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontColor={fontColor}
                setFontColor={setFontColor}
                isShowAdvanceFeature={true}
                roleName={roleName}
              />

              {/* pdf header which contain funish back button */}
              <Header
                completeBtnTitle={t("next")}
                isPlaceholder={true}
                pageNumber={pageNumber}
                allPages={allPages}
                changePage={changePage}
                pdfDetails={pdfDetails}
                signerPos={signerPos}
                signersdata={signersdata}
                isMailSend={isMailSend}
                handleSaveDoc={handleSaveDoc}
                isShowHeader={true}
                currentSigner={true}
                handleRotationFun={handleRotationFun}
                clickOnZoomIn={clickOnZoomIn}
                clickOnZoomOut={clickOnZoomOut}
                setIsUploadPdf={setIsUploadPdf}
                pdfArrayBuffer={pdfArrayBuffer}
                setPdfArrayBuffer={setPdfArrayBuffer}
                setPdfBase64Url={setPdfBase64Url}
                setSignerPos={setSignerPos}
                userId={uniqueId}
                pdfBase64={pdfBase64Url}
                setIsEditTemplate={handleEditDocumentModal}
              />

              <div
                ref={divRef}
                data-tut="pdfArea"
                className="h-full md:h-[95%]"
                onClick={() => setPlaceholderTour(false)}
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
                    handleDeleteWidget={handleDeleteWidget}
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
                    handleLinkUser={handleLinkUser}
                    setUniqueId={setUniqueId}
                    isDragging={isDragging}
                    setShowDropdown={setShowDropdown}
                    setIsRadio={setIsRadio}
                    setIsCheckbox={setIsCheckbox}
                    setCurrWidgetsDetails={setCurrWidgetsDetails}
                    handleNameModal={setIsNameModal}
                    uniqueId={uniqueId}
                    pdfOriginalWH={pdfOriginalWH}
                    setScale={setScale}
                    scale={scale}
                    setIsSelectId={setIsSelectId}
                    pdfBase64Url={pdfBase64Url}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontColor={fontColor}
                    setFontColor={setFontColor}
                    unSignedWidgetId={unSignedWidgetId}
                    divRef={divRef}
                    currWidgetsDetails={currWidgetsDetails}
                    setRoleName={setRoleName}
                    isShowModal={isShowModal}
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
                    handleDivClick={handleDivClick}
                    handleMouseLeave={handleMouseLeave}
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
                    setSignerPos={setSignerPos}
                    roleName={roleName}
                    isPrefillDropdown={false} // In document editing flow there should not be any prefill dropdown widget
                    prefillSigner={prefillSigner}
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
                      prefillSigner={prefillSigner}
                      setIsTour={setPlaceholderTour}
                    />
                    <div data-tut="addWidgets">
                      <WidgetComponent
                        isMailSend={isMailSend}
                        handleDivClick={handleDivClick}
                        handleMouseLeave={handleMouseLeave}
                        isSignYourself={false}
                        addPositionOfSignature={addPositionOfSignature}
                        initial={true}
                        isPrefillDropdown={false}
                        roleName={roleName}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isShowModal[currWidgetsDetails?.key] && (
        <WidgetsValueModal
          key={currWidgetsDetails?.key}
          xyPosition={signerPos}
          pageNumber={pageNumber}
          setXyPosition={setSignerPos}
          uniqueId={uniqueId}
          setPageNumber={setPageNumber}
          setCurrWidgetsDetails={setCurrWidgetsDetails}
          currWidgetsDetails={currWidgetsDetails}
          index={pageNumber}
          isSave={true}
          setUniqueId={setUniqueId}
          signatureTypes={signatureType}
        />
      )}
      <ModalUi
        isOpen={isAlreadyPlace.status}
        title={t("document-alert")}
        showClose={false}
      >
        <div className="h-[100%] p-[20px] text-base-content">
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
      {(isAddSigner || (isAddUser && isAddUser[uniqueId])) && (
        <LinkUserModal
          handleAddUser={handleAddUser}
          uniqueId={uniqueId}
          closePopup={closePopup}
          signersData={signersdata}
          signerPos={signerPos}
          isAddYourSelfCheckbox
        />
      )}
      <WidgetNameModal
        signatureType={signatureType}
        widgetName={currWidgetsDetails?.options?.name}
        defaultdata={currWidgetsDetails}
        isOpen={isNameModal}
        handleClose={handleNameModal}
        handleData={handleWidgetdefaultdata}
        isTextSetting={isTextSetting}
        setIsTextSetting={setIsTextSetting}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontColor={fontColor}
        setFontColor={setFontColor}
        roleName={roleName}
      />
      <RotateAlert
        showRotateAlert={showRotateAlert.status}
        setShowRotateAlert={setShowRotateAlert}
        handleRemoveWidgets={handleRemovePlaceholder}
      />
      {isEditDoc && (
        <EditDocument
          title={t("edit-document")}
          handleClose={handleEditDocumentModal}
          pdfbase64={pdfBase64Url}
          template={pdfDetails?.[0]}
          onSuccess={handleEditDocumentForm}
          setPdfArrayBuffer={setPdfArrayBuffer}
          setPdfBase64Url={setPdfBase64Url}
          isAddYourSelfCheckbox={true}
        />
      )}
    </>
  );
}

export default PlaceHolderSign;
