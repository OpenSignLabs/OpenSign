import { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import "../styles/signature.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrop } from "react-dnd";
import WidgetComponent from "../components/pdf/WidgetComponent";
import Tour from "../primitives/Tour";
import SignerListPlace from "../components/pdf/SignerListPlace";
import Header from "../components/pdf/PdfHeader";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import { PDFDocument } from "pdf-lib";
import { SaveFileSize } from "../constant/saveFileSize";
import {
  pdfNewWidthFun,
  contractUsers,
  randomId,
  addZIndex,
  createDocument,
  defaultWidthHeight,
  addWidgetOptions,
  textInputWidget,
  cellsWidget,
  radioButtonWidget,
  getContainerScale,
  convertBase64ToFile,
  rotatePdfPage,
  onClickZoomOut,
  onClickZoomIn,
  handleRemoveWidgets,
  handleRotateWarning,
  color,
  signatureTypes,
  getTenantDetails,
  handleSignatureType,
  getBase64FromUrl,
  convertPdfArrayBuffer,
  generatePdfName,
  textWidget,
  multiSignEmbed,
  getOriginalWH
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import "../styles/AddUser.css";
import Title from "../components/Title";
import EditTemplate from "../components/pdf/EditTemplate";
import AddRoleModal from "../components/pdf/AddRoleModal";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import Parse from "parse";
import { useSelector } from "react-redux";
import PdfZoom from "../components/pdf/PdfZoom";
import { useTranslation } from "react-i18next";
import RotateAlert from "../components/RotateAlert";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import HandleError from "../primitives/HandleError";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import LinkUserModal from "../primitives/LinkUserModal";

const TemplatePlaceholder = () => {
  const { t } = useTranslation();
  const { templateId } = useParams();
  const divRef = useRef(null);
  const navigate = useNavigate();
  const numPages = 1;
  const isHeader = useSelector((state) => state.showHeader);
  const [pdfDetails, setPdfDetails] = useState([]);
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
  //'signersName' variable used to show all signer's name that do not have a signature widget assigned
  const [signersName, setSignersName] = useState("");
  const [showRotateAlert, setShowRotateAlert] = useState({
    status: false,
    degree: 0
  });
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
  const [isRadio, setIsRadio] = useState(false);
  const [blockColor, setBlockColor] = useState("");
  const [isNameModal, setIsNameModal] = useState(false);
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const [isUploadPdf, setIsUploadPdf] = useState(false);
  const isMobile = window.innerWidth < 767;
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  });
  const [uniqueId, setUniqueId] = useState("");
  const [isModalRole, setIsModalRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [isCreateDoc, setIsCreateDoc] = useState(false);
  const [isEditTemplate, setIsEditTemplate] = useState(false);
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [IsReceipent, setIsReceipent] = useState(true);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState([]);
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [isAddRole, setIsAddRole] = useState(false);
  const [fontSize, setFontSize] = useState();
  const [fontColor, setFontColor] = useState();
  const [zoomPercent, setZoomPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [signatureType, setSignatureType] = useState([]);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState("");
  const [updatedPdfUrl, setUpdatedPdfUrl] = useState("");
  const [unSignedWidgetId, setUnSignedWidgetId] = useState("");
  const [owner, setOwner] = useState({});
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
      const documentData =
        templateDeatils.data && templateDeatils.data.result
          ? [templateDeatils.data.result]
          : [];

      if (documentData && documentData.length > 0) {
        setOwner(documentData?.[0]?.ExtUserPtr);
        const url = documentData[0] && documentData[0]?.URL;
        if (url) {
          const arrayBuffer = await convertPdfArrayBuffer(url);
          const base64Pdf = await getBase64FromUrl(url);
          if (arrayBuffer === "Error") {
            setHandleError(t("something-went-wrong-mssg"));
          } else {
            setPdfBase64Url(base64Pdf);
            setPdfArrayBuffer(arrayBuffer);
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
        setIsSigners(true);
        if (documentData[0].Signers && documentData[0].Signers.length > 0) {
          setIsSelectId(0);
          if (
            documentData[0].Placeholders &&
            documentData[0].Placeholders.length > 0
          ) {
            const placeholder = documentData[0]?.Placeholders.filter(
              (data) => data.Role !== "prefill"
            );
            setSignerPos(placeholder);
            signersdata.forEach((x) => {
              if (x.objectId) {
                const obj = {
                  __type: "Pointer",
                  className: "contracts_Contactbook",
                  objectId: x.objectId
                };
                signers.push(obj);
              }
            });
            let signers = [...documentData[0].Signers];
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
            const updatedSigners = documentData[0].Signers.map((x, index) => ({
              ...x,
              Id: randomId(),
              Role: "Role " + (index + 1)
            }));
            setSignersData(updatedSigners);
            setUniqueId(updatedSigners[0].Id);
            setBlockColor(updatedSigners[0].blockColor);
          }
        } else {
          setRoleName("Role 1");
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
            setSignerPos(placeholder);
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
      const res = await contractUsers();
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
          dropObj,
          currentPagePosition,
          filterSignerPos;
        let placeHolder;
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
            options: addWidgetOptions(dragTypeValue, owner),
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
          dropObj = {
            xPosition: getXPosition / (containerScale * scale),
            yPosition: getYPosition / (containerScale * scale),
            isStamp:
              (dragTypeValue === "stamp" || dragTypeValue === "image") && true,
            key: key,
            scale: containerScale,
            // isMobile: isMobile,
            zIndex: posZIndex,
            type: item.text,
            options: addWidgetOptions(dragTypeValue, owner),
            Width: widgetWidth / (containerScale * scale),
            Height: widgetHeight / (containerScale * scale)
          };

          dropData.push(dropObj);
          placeHolder = { pageNumber: pageNumber, pos: dropData };
        }
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
          //if condition when widget type is prefill label text widget
          if (dragTypeValue === textWidget) {
            //check text widgets data (prefill) already exist then and want to add text widget on new page
            //create new page entry with old data and update placeholder
            if (filterSignerPos) {
              const addPrefillData =
                filterSignerPos && filterSignerPos?.placeHolder;
              addPrefillData.push(placeHolder);
              const updatePrefillPos = signerPos.map((x) =>
                x.Role === "prefill" ? { ...x, placeHolder: addPrefillData } : x
              );
              setSignerPos(updatePrefillPos);
            } //else condition if user do not have any text widget data
            else {
              const prefillTextWidget = {
                signerPtr: {},
                signerObjId: "",
                blockColor: "#f58f8c",
                placeHolder: [placeHolder],
                Role: "prefill",
                Id: key
              };
              setSignerPos((prev) => [...prev, prefillTextWidget]);
            }
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
        }

        if (dragTypeValue === "dropdown") {
          setShowDropdown(true);
        } else if (dragTypeValue === "checkbox") {
          setIsCheckbox(true);
        } else if (dragTypeValue === radioButtonWidget) {
          setIsRadio(true);
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
        }
        setCurrWidgetsDetails(dropObj);
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
      const signId = signerId; //? signerId : signerObjId;
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
  const handleMouseLeave = () => {
    setSignBtnPosition([xySignature]);
  };
  const alertSendEmail = async () => {
    const isPlaceholderExist = signerPos.every((data) => data.placeHolder);
    const getPrefill = signerPos?.find((data) => data.Role === "prefill");
    const prefillPlaceholder = getPrefill?.placeHolder;
    let isLabel = false;
    let unfilledTextWidgetId = "";
    //condition is used to check text widget data is empty or have response
    if (getPrefill && prefillPlaceholder) {
      prefillPlaceholder.map((data) => {
        if (!isLabel) {
          const unfilledTextWidgets = data.pos.find(
            (position) => !position.options.response
          );
          if (unfilledTextWidgets) {
            isLabel = true;
            unfilledTextWidgetId = unfilledTextWidgets.key;
          }
        }
      });
    }
    if (getPrefill && isLabel) {
      setUnSignedWidgetId(unfilledTextWidgetId);
    } else if (isPlaceholderExist) {
      handleSaveTemplate();
    } else {
      const signerList = signerPos.filter(
        (data) => !data.placeHolder && data.Role !== "prefill"
      );
      const getSigner = signerList.map((x) => {
        return signersdata.find((y) => y.Id === x.Id).Role;
      });
      const signersName = getSigner.join(", ");
      setSignersName(signersName);
      setIsSendAlert(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      autosavedetails();
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerPos, signersdata, signatureType, pdfBase64Url]);

  // `autosavedetails` is used to save template details after every 2 sec when changes are happern in placeholder like drag-drop widgets, remove signers
  const autosavedetails = async () => {
    let signers = [];
    let pdfUrl;
    if (isUploadPdf) {
      const pdfName = generatePdfName(16);
      pdfUrl = await convertBase64ToFile(
        pdfName,
        pdfBase64Url,
        "",
      );
    }
    if (signersdata?.length > 0) {
      signersdata.forEach((x) => {
        if (x.objectId) {
          const obj = {
            __type: "Pointer",
            className: "contracts_Contactbook",
            objectId: x.objectId
          };
          signers.push(obj);
        }
      });
    }
    try {
      const templateCls = new Parse.Object("contracts_Template");
      templateCls.id = templateId;
      if (signerPos?.length > 0) {
        const removePrefill = signerPos.filter((x) => x.Role !== "prefill");
        if (removePrefill.length > 0) {
          templateCls.set("Placeholders", removePrefill);
        }
      }
      templateCls.set("Signers", signers);
      templateCls.set("SignatureType", signatureType);
      if (pdfUrl) {
        templateCls.set("URL", pdfUrl);
      }
      templateCls.set(
        "TimeToCompleteDays",
        parseInt(pdfDetails?.[0]?.TimeToCompleteDays) || 15
      );
      if (pdfDetails[0]?.Bcc?.length) {
        const Bcc = pdfDetails[0]?.Bcc.map((x) => ({
          __type: "Pointer",
          className: "contracts_Contactbook",
          objectId: x.objectId
        }));
        templateCls.set("Bcc", Bcc);
      }
      const res = await templateCls.save();
      if (res && pdfUrl) {
        pdfDetails[0] = { ...pdfDetails[0], URL: pdfUrl };
      }
    } catch (err) {
      console.log("error in autosave template", err);
    }
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
        //pdfOriginalWH contained all pdf's pages width,height & pagenumber in array format
        const pdfBase64 = await multiSignEmbed(
          pdfOriginalWH,
          placeholder,
          pdfDoc,
          isSignYourSelfFlow,
          scale
        );
        const pdfName = generatePdfName(16);
        const pdfUrl = await convertBase64ToFile(
          pdfName,
          pdfBase64,
          "",
        );
        const tenantId = localStorage.getItem("TenantId");
        const buffer = atob(pdfBase64);
        SaveFileSize(buffer.length, pdfUrl, tenantId);
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
  const handleSaveTemplate = async () => {
    if (signersdata?.length) {
      const remindOnceInEvery = parseInt(pdfDetails[0]?.RemindOnceInEvery);
      const TimeToCompleteDays = parseInt(pdfDetails[0]?.TimeToCompleteDays);
      const AutomaticReminders = pdfDetails[0]?.AutomaticReminders;
      const reminderCount = TimeToCompleteDays / remindOnceInEvery;
      if (AutomaticReminders && reminderCount > 15) {
        alert(t("only-15-reminder-allowed"));
        return;
      }
      setIsLoading({ isLoad: true, message: t("loading-mssg") });
      setIsSendAlert(false);
      let signers = [],
        pdfUrl;
      if (signersdata?.length > 0) {
        signersdata.forEach((x) => {
          if (x.objectId) {
            const obj = {
              __type: "Pointer",
              className: "contracts_Contactbook",
              objectId: x.objectId
            };
            signers.push(obj);
          }
        });
      }
      if (pdfBase64Url) {
        try {
          pdfUrl = await embedPrefilllData();
          setUpdatedPdfUrl(pdfUrl);
        } catch (e) {
          console.log("error to convertBase64ToFile in placeholder flow", e);
        }
      }
      try {
        const Bcc = pdfDetails[0]?.Bcc?.length
          ? {
              Bcc: pdfDetails[0]?.Bcc?.map((x) => ({
                __type: "Pointer",
                className: "contracts_Contactbook",
                objectId: x.objectId
              }))
            }
          : {};
        const RedirectUrl = pdfDetails[0]?.RedirectUrl
          ? { RedirectUrl: pdfDetails[0]?.RedirectUrl }
          : {};
        const removePrefill = signerPos.filter((x) => x?.Role !== "prefill");
        const data = {
          Placeholders: removePrefill,
          Signers: signers,
          Name: pdfDetails[0]?.Name || "",
          Note: pdfDetails[0]?.Note || "",
          Description: pdfDetails[0]?.Description || "",
          SendinOrder: pdfDetails[0]?.SendinOrder || false,
          AutomaticReminders: pdfDetails[0]?.AutomaticReminders,
          RemindOnceInEvery: parseInt(pdfDetails[0]?.RemindOnceInEvery),
          NextReminderDate: pdfDetails[0]?.NextReminderDate,
          IsEnableOTP: pdfDetails[0]?.IsEnableOTP === true ? true : false,
          AllowModifications: pdfDetails[0]?.AllowModifications || false,
          IsTourEnabled: pdfDetails[0]?.IsTourEnabled === true ? true : false,
          URL: pdfUrl,
          SignatureType: signatureType,
          NotifyOnSignatures:
            pdfDetails[0]?.NotifyOnSignatures !== undefined
              ? pdfDetails[0]?.NotifyOnSignatures
              : false,
          TimeToCompleteDays:
            parseInt(pdfDetails?.[0]?.TimeToCompleteDays) || 15,
          ...Bcc,
          ...RedirectUrl
        };
        const updateTemplate = new Parse.Object("contracts_Template");
        updateTemplate.id = templateId;
        for (const key in data) {
          updateTemplate.set(key, data[key]);
        }
        await updateTemplate.save();
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

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };

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
      selector: '[data-tut="nonpresentmask"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.template-placeholder-2")}
          isChecked={handleDontShow}
        />
      ),
      position: "center",
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
      await axios
        .put(
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

  // `handleCreateDocModal` is used to create Document from template when user click on yes from modal
  const handleCreateDocModal = async () => {
    setIsCreateDocModal(false);
    setIsCreateDoc(true);
    const removePrefill = signerPos.filter((x) => x.Role !== "prefill");
    // handle create document
    const res = await createDocument(
      pdfDetails,
      removePrefill,
      signersdata,
      updatedPdfUrl
    );
    if (res.status === "success") {
      navigate(`/placeHolderSign/${res.id}`, {
        state: { title: "Use Template" }
      });
      setIsCreateDoc(false);
    } else {
      setHandleError(t(res.id));
      setIsCreateDoc(false);
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
      Role: roleName || "Role " + count,
      Id: Id,
      blockColor: color[index]
    };
    setSignersData((prevArr) => [...prevArr, obj]);
    const signerPosObj = {
      signerPtr: {},
      signerObjId: "",
      blockColor: color[index],
      Role: roleName || "Role " + count,
      Id: Id
    };

    setSignerPos((prev) => [...prev, signerPosObj]);
    setIsModalRole(false);
    setRoleName("");
    setUniqueId(Id);
    setBlockColor(color[index]);
    setIsSelectId(index);
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
    const index = signersdata.findIndex((x) => x.Id === uniqueId);
    setIsSelectId(index);
  };

  // `closePopup` is used to close Add/Choose signer modal
  const closePopup = () => {
    setIsAddUser({});
  };

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

  const handleEditTemplateModal = () => {
    setIsEditTemplate(!isEditTemplate);
  };

  const handleEditTemplateForm = async (data) => {
    setIsEditTemplate(false);
    const updateTemplate = pdfDetails.map((x) => {
      return { ...x, ...data };
    });
    setPdfDetails(updateTemplate);
    try {
      const Bcc = updateTemplate?.[0]?.Bcc?.length
        ? {
            Bcc: updateTemplate?.[0]?.Bcc?.map((x) => ({
              __type: "Pointer",
              className: "contracts_Contactbook",
              objectId: x.objectId
            }))
          }
        : {};
      const RedirectUrl = updateTemplate?.[0]?.RedirectUrl
        ? { RedirectUrl: updateTemplate?.[0]?.RedirectUrl }
        : {};
      const data = {
        ...(updateTemplate?.[0]?.URL ? { URL: updateTemplate?.[0]?.URL } : {}),
        Name: updateTemplate?.[0]?.Name || "",
        Note: updateTemplate?.[0]?.Note || "",
        Description: updateTemplate?.[0]?.Description || "",
        SendinOrder: updateTemplate?.[0]?.SendinOrder || false,
        AutomaticReminders: updateTemplate?.[0]?.AutomaticReminders,
        IsEnableOTP: updateTemplate?.[0]?.IsEnableOTP === true ? true : false,
        IsTourEnabled:
          updateTemplate?.[0]?.IsTourEnabled === true ? true : false,
        NotifyOnSignatures:
          updateTemplate?.[0]?.NotifyOnSignatures !== undefined
            ? updateTemplate?.[0]?.NotifyOnSignatures
            : false,
        TimeToCompleteDays:
          parseInt(updateTemplate?.[0]?.TimeToCompleteDays) || 15,
        ...Bcc,
        ...RedirectUrl
      };
      const updateTemplateObj = new Parse.Object("contracts_Template");
      updateTemplateObj.id = templateId;
      for (const key in data) {
        updateTemplateObj.set(key, data[key]);
      }
      await updateTemplateObj.save();
    } catch (err) {
      console.log("error in save template", err);
    }
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
                    layout: layout,
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
                  isReadOnly: defaultdata?.isReadOnly || false,
                  validation:
                        {},
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black"
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
                    isSubscribe && inputype
                      ? {
                          type: inputype,
                          pattern:
                            inputype === "regex" ? defaultdata.textvalidate : ""
                        }
                      : {},
                  isReadOnly: defaultdata?.isReadOnly || false,
                  fontSize:
                    fontSize || currWidgetsDetails?.options?.fontSize || 12,
                  fontColor:
                    fontColor ||
                    currWidgetsDetails?.options?.fontColor ||
                    "black"
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
  const setCellCount = (key, newCount) => {
    const updated = signerPos.map((signer) => {
      if (signer.Id !== uniqueId) return signer;
      const placeHolder = signer.placeHolder.map((ph) => {
        if (ph.pageNumber !== pageNumber) return ph;
        const pos = ph.pos.map((p) =>
          p.key === key
            ? { ...p, options: { ...p.options, cellCount: newCount } }
            : p
        );
        return { ...ph, pos };
      });
      return { ...signer, placeHolder };
    });
    setSignerPos(updated);
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
  const signatureWidgetTour = [
    {
      selector: '[data-tut="isSignatureWidget"]',
      content: t("signature-field-widget", { signersName }),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  const textFieldTour = [
    {
      selector: '[data-tut="IsSigned"]',
      content: t("text-field-tour"),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  return (
    <>
      <Title title={"Template"} />
      <DndProvider backend={HTML5Backend}>
        {isLoading.isLoad ? (
          <LoaderWithMsg isLoading={isLoading} />
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
              {isSendAlert && (
                <Tour
                  onRequestClose={() => setIsSendAlert(false)}
                  steps={signatureWidgetTour}
                  isOpen={true}
                  rounded={5}
                  closeWithMask={false}
                /> // this is the tour for add signature widget for all role
              )}
              {unSignedWidgetId && (
                <Tour
                  onRequestClose={() => setUnSignedWidgetId("")}
                  steps={textFieldTour}
                  isOpen={true}
                  rounded={5}
                  closeWithMask={false}
                />
              )}

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
              <div className=" w-full md:w-[57%] flex mr-4">
                <PdfZoom
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
                />
                <div className="w-full md:w-[95%]">
                  <ModalUi
                    isOpen={!IsReceipent}
                    title={t("roles")}
                    handleClose={() => setIsReceipent(true)}
                  >
                    <div className="h-full p-[20px] text-center font-medium">
                      <p>{t("template-role-alert")}</p>
                    </div>
                  </ModalUi>
                  {/* this modal is used show send mail  message and after send mail success message */}
                  <ModalUi
                    isOpen={isCreateDocModal}
                    title={t("create-document")}
                    handleClose={() => {
                      setIsCreateDocModal(false);
                      navigate("/report/6TeaPr321t");
                    }}
                  >
                    <div className="h-full p-[20px] mb-2 text-base-content">
                      <p>{t("template-created-alert")}</p>
                      <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                      <div className="flex gap-1 flex-col md:flex-row">
                        <button
                          onClick={() => handleCreateDocModal()}
                          type="button"
                          className="op-btn op-btn-sm op-btn-primary"
                        >
                          {t("create-document")}
                        </button>
                      </div>
                    </div>
                  </ModalUi>
                  {isCreateDoc && <LoaderWithMsg isLoading={isLoading} />}
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
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontColor={fontColor}
                    setFontColor={setFontColor}
                    isShowAdvanceFeature={true}
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
                  />
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
                    alertSendEmail={alertSendEmail}
                    isShowHeader={true}
                    currentSigner={true}
                    setIsEditTemplate={handleEditTemplateModal}
                    dataTut4="reactourFour"
                    handleRotationFun={handleRotationFun}
                    clickOnZoomIn={clickOnZoomIn}
                    clickOnZoomOut={clickOnZoomOut}
                    setSignerPos={setSignerPos}
                    setIsUploadPdf={setIsUploadPdf}
                    pdfArrayBuffer={pdfArrayBuffer}
                    setPdfArrayBuffer={setPdfArrayBuffer}
                    setPdfBase64Url={setPdfBase64Url}
                    userId={uniqueId}
                    pdfBase64={pdfBase64Url}
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
                        isDragging={isDragging}
                        setShowDropdown={setShowDropdown}
                        setCurrWidgetsDetails={setCurrWidgetsDetails}
                        setIsRadio={setIsRadio}
                        setIsCheckbox={setIsCheckbox}
                        handleNameModal={setIsNameModal}
                        pdfOriginalWH={pdfOriginalWH}
                        setScale={setScale}
                        scale={scale}
                        setIsSelectId={setIsSelectId}
                        pdfBase64Url={pdfBase64Url}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        setCellCount={setCellCount}
                        fontColor={fontColor}
                        setFontColor={setFontColor}
                        isResize={isResize}
                        divRef={divRef}
                        uniqueId={uniqueId}
                        unSignedWidgetId={unSignedWidgetId}
                        currWidgetsDetails={currWidgetsDetails}
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
                    handleDivClick={handleDivClick}
                    handleMouseLeave={handleMouseLeave}
                    isSignYourself={false}
                    addPositionOfSignature={addPositionOfSignature}
                    signerPos={signerPos}
                    signersdata={signersdata}
                    isSelectListId={isSelectListId}
                    setIsSelectId={setIsSelectId}
                    isSigners={isSigners}
                    setIsShowEmail={setIsShowEmail}
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
                    sendInOrder={pdfDetails[0].SendinOrder}
                    setSignersData={setSignersData}
                    blockColor={blockColor}
                    setBlockColor={setBlockColor}
                    setSignerPos={setSignerPos}
                    uniqueId={uniqueId}
                    isTemplateFlow={true}
                  />
                </div>
              ) : (
                <div className="w-[23%] bg-base-100 min-h-screen overflow-y-auto hide-scrollbar">
                  <div className="max-h-screen">
                    <SignerListPlace
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
                        handleDivClick={handleDivClick}
                        handleMouseLeave={handleMouseLeave}
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
          {isAddUser && isAddUser[uniqueId] && (
            <LinkUserModal
              handleAddUser={handleAddUser}
              uniqueId={uniqueId}
              closePopup={closePopup}
              signersData={signersdata}
              signerPos={signerPos}
              setSignerPos={setSignerPos}
              setSignersData={setSignersData}
              isRemove={true}
            />
          )}
        </div>
        {isEditTemplate && (
          <EditTemplate
            title={t("edit-template")}
            handleClose={handleEditTemplateModal}
            pdfbase64={pdfBase64Url}
            template={pdfDetails?.[0]}
            onSuccess={handleEditTemplateForm}
            setPdfArrayBuffer={setPdfArrayBuffer}
            setPdfBase64Url={setPdfBase64Url}
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
        />
        <RotateAlert
          showRotateAlert={showRotateAlert.status}
          setShowRotateAlert={setShowRotateAlert}
          handleRemoveWidgets={handleRemovePlaceholder}
        />
      </DndProvider>
    </>
  );
};

export default TemplatePlaceholder;
