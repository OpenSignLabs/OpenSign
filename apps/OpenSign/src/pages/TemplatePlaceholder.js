import React, { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/signature.css";
import { isEnableSubscription } from "../constant/const";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import WidgetComponent from "../components/pdf/WidgetComponent";
import Tour from "reactour";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import HandleError from "../primitives/HandleError";
import SignerListPlace from "../components/pdf/SignerListPlace";
import Header from "../components/pdf/PdfHeader";
import WidgetNameModal from "../components/pdf/WidgetNameModal";
import {
  pdfNewWidthFun,
  contractUsers,
  randomId,
  addZIndex,
  createDocument,
  defaultWidthHeight,
  addWidgetOptions,
  textInputWidget,
  radioButtonWidget,
  fetchSubscription
} from "../constant/Utils";
import RenderPdf from "../components/pdf/RenderPdf";
import "../styles/AddUser.css";
import Title from "../components/Title";
import LinkUserModal from "../primitives/LinkUserModal";
import EditTemplate from "../components/pdf/EditTemplate";
import ModalUi from "../primitives/ModalUi";
import AddRoleModal from "../components/pdf/AddRoleModal";
import PlaceholderCopy from "../components/pdf/PlaceholderCopy";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import DropdownWidgetOption from "../components/pdf/DropdownWidgetOption";
import Parse from "parse";
import { useSelector } from "react-redux";
import TextFontSetting from "../components/pdf/TextFontSetting";
import PdfZoom from "../components/pdf/PdfZoom";
const TemplatePlaceholder = () => {
  const navigate = useNavigate();
  const isHeader = useSelector((state) => state.showHeader);
  const { templateId } = useParams();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isMailSend, setIsMailSend] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const [dragKey, setDragKey] = useState();
  const [signersdata, setSignersData] = useState([]);
  const [signerObjId, setSignerObjId] = useState();
  const [signerPos, setSignerPos] = useState([]);
  const [isSelectListId, setIsSelectId] = useState();
  const [isSendAlert, setIsSendAlert] = useState(false);
  const [isCreateDocModal, setIsCreateDocModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [handleError, setHandleError] = useState();
  const [currentEmail, setCurrentEmail] = useState();
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [templateTour, setTemplateTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [contractName, setContractName] = useState("");
  const [containerWH, setContainerWH] = useState();
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const divRef = useRef(null);
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
  const color = [
    "#93a3db",
    "#e6c3db",
    "#c0e3bc",
    "#bce3db",
    "#b8ccdb",
    "#ceb8db",
    "#ffccff",
    "#99ffcc",
    "#cc99ff",
    "#ffcc99",
    "#66ccff",
    "#ffffcc"
  ];
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
  const [uniqueId, setUniqueId] = useState("");
  const [isModalRole, setIsModalRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [isCreateDoc, setIsCreateDoc] = useState(false);
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
  const senderUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonSender = JSON.parse(senderUser);

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
  // `fetchTemplate` function in used to get Template from server and setPlaceholder ,setSigner if present
  const fetchTemplate = async () => {
    try {
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
        if (isEnableSubscription) {
          checkIsSubscribed(documentData[0]?.ExtUserPtr?.Email);
        }
        setPdfDetails(documentData);
        setIsSigners(true);
        if (documentData[0].Signers && documentData[0].Signers.length > 0) {
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
              return {
                Role: x.Role,
                Id: x.Id,
                blockColor: x.blockColor
              };
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
    } catch (err) {
      console.log("err ", err);
      if (err?.response?.data?.code === 101) {
        setHandleError("Error: Template not found!");
      } else {
        setHandleError("Error: Something went wrong!");
      }
    }
    const res = await contractUsers(jsonSender.email);
    if (res[0] && res.length) {
      setSignerUserId(res[0].objectId);
      setCurrentEmail(res[0].Email);
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
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (res === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
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
        const getPdfPageWidth = pdfOriginalWH.find(
          (data) => data.pageNumber === pageNumber
        );
        const containerScale = containerWH.width / getPdfPageWidth?.width || 1;
        const key = randomId();
        let filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
        const dragTypeValue = item?.text ? item.text : monitor.type;
        const widgetWidth = defaultWidthHeight(dragTypeValue).width;
        const widgetHeight = defaultWidthHeight(dragTypeValue).height;
        let dropData = [];
        let placeHolder;
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
          placeHolder = {
            pageNumber: pageNumber,
            pos: dropData
          };
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
            const updatesignerPos = signerPos.map((x) =>
              x.Id === uniqueId ? { ...x, placeHolder: updatePlace } : x
            );
            setSignerPos(updatesignerPos);
          } else {
            const updatesignerPos = signerPos.map((x) =>
              x.Id === uniqueId
                ? { ...x, placeHolder: [...x.placeHolder, placeHolder] }
                : x
            );
            setSignerPos(updatesignerPos);
          }
        } else {
          //adding new placeholder for selected signer in pos array (placeholder)
          let placeHolderPos;
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
          setSignerPos((prev) => [...prev, placeHolderPos]);
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
      content: "You need to add a role before you can add fields for it. ",
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
      const getPdfPageWidth = pdfOriginalWH.find(
        (data) => data.pageNumber === pageNumber
      );
      const containerScale = containerWH.width / getPdfPageWidth?.width || 1;
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
    setTimeout(() => {
      setIsDragging(false);
    }, 200);
  };
  //function for delete signature block
  const handleDeleteSign = (key, Id) => {
    const updateData = [];
    // const filterSignerPos = signerPos.filter(
    //   (data) => data.signerObjId === signerId
    // );

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

  const alertSendEmail = async () => {
    if (signerPos.length !== signersdata.length) {
      setIsSendAlert(true);
    } else {
      handleSaveTemplate();
    }
  };
  const handleSaveTemplate = async () => {
    if (signersdata?.length) {
      const loadObj = {
        isLoad: true,
        message: "This might take some time"
      };
      setIsLoading(loadObj);
      setIsSendAlert(false);
      let signers = [];
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
        const data = {
          Placeholders: signerPos,
          Signers: signers,
          Name: pdfDetails[0]?.Name || "",
          Note: pdfDetails[0]?.Note || "",
          Description: pdfDetails[0]?.Description || "",
          SendinOrder: pdfDetails[0]?.SendinOrder || false,
          AutomaticReminders: pdfDetails[0]?.AutomaticReminders,
          RemindOnceInEvery: parseInt(pdfDetails[0]?.RemindOnceInEvery),
          NextReminderDate: pdfDetails[0]?.NextReminderDate
        };
        const updateTemplate = new Parse.Object("contracts_Template");
        updateTemplate.id = templateId;
        for (const key in data) {
          updateTemplate.set(key, data[key]);
        }
        await updateTemplate.save(null, {
          sessionToken: localStorage.getItem("accesstoken")
        });

        setIsCreateDocModal(true);
        setIsMailSend(true);
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      } catch (e) {
        setIsLoading(false);
        alert("Something went wrong, please try again later.");
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
          message={`Clicking "Add role" button will allow you to add various signer roles. You can attach users to each role in subsequent steps.`}
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
          message={`Once roles are added, select a role from list to add a place-holder where he is supposed to sign. The placeholder will appear in the same colour as the role name once you drop it on the document.`}
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
          message={`Drag or click on a field to add it to the document.`}
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
          message={`Drag the placeholder for a role anywhere on the document.Remember, it will appear in the same colour as the name of the recipient for easy reference.`}
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
          message={`Clicking ‘Next’ will store the current template. After saving, you’ll be prompted to create a new document from this template if you wish.`}
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

  // `handleCreateDocModal` is used to create Document from template when user click on yes from modal
  const handleCreateDocModal = async () => {
    setIsCreateDocModal(false);
    setIsCreateDoc(true);
    // handle create document
    const res = await createDocument(pdfDetails, signerPos, signersdata);
    if (res.status === "success") {
      navigate(`/placeHolderSign/${res.id}`, {
        state: { title: "Use Template" }
      });
      setIsCreateDoc(false);
    } else {
      setHandleError("Error: Something went wrong!");
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
    setSignerObjId("");
    setContractName("");
    const count = signersdata.length > 0 ? signersdata.length + 1 : 1;
    const Id = randomId();
    const index = signersdata.length;
    const obj = {
      Role: roleName || "User " + count,
      Id: Id,
      blockColor: color[index]
    };
    setSignersData((prevArr) => [...prevArr, obj]);
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

  //  `handleLinkUser` is used to open Add/Choose Signer Modal when user can link existing or new User with placeholder
  // and update entry in signersList
  const handleLinkUser = (id) => {
    setIsAddUser({ [id]: true });
  };
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

  const handleEditTemplateModal = () => {
    setIsEditTemplate(!isEditTemplate);
  };

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
                    isHideLabel: isHideLabel || false
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
                      : {}
                }
              };
            } else {
              return {
                ...position,
                options: {
                  ...position.options,
                  name: defaultdata.name,
                  status: defaultdata.status,
                  defaultValue: defaultdata.defaultValue
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
  };
  const handleNameModal = () => {
    setIsNameModal(false);
    setCurrWidgetsDetails({});
    setShowDropdown(false);
    setIsRadio(false);
    setIsCheckbox(false);
  };
  const handleSaveFontSize = () => {
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
            return {
              ...position,
              options: {
                ...position.options,
                fontSize:
                  fontSize || currWidgetsDetails?.options?.fontSize || "12",
                fontColor:
                  fontColor || currWidgetsDetails?.options?.fontColor || "black"
              }
            };
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

    handleTextSettingModal(false);
  };
  const handleTextSettingModal = (value) => {
    setIsTextSetting(value);
  };
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
                    isOpen={isSendAlert}
                    title={"Fields required"}
                    handleClose={() => setIsSendAlert(false)}
                  >
                    <div className="h-full p-[20px]">
                      <p>
                        Please add at least one signature field for all roles.
                      </p>
                    </div>
                  </ModalUi>
                  <ModalUi
                    isOpen={!IsReceipent}
                    title={"Roles"}
                    handleClose={() => setIsReceipent(true)}
                  >
                    <div className="h-full p-[20px] text-center font-medium">
                      <p>Please add roles first</p>
                    </div>
                  </ModalUi>
                  {/* this modal is used show send mail  message and after send mail success message */}
                  <ModalUi
                    isOpen={isCreateDocModal}
                    title={"Create Document"}
                    handleClose={() => setIsCreateDocModal(false)}
                  >
                    <div className="h-full p-[20px]">
                      <p>
                        Do you want to create a document using the template you
                        just created ?
                      </p>
                      <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                      {currentEmail.length > 0 && (
                        <>
                          <button
                            onClick={() => {
                              handleCreateDocModal();
                            }}
                            type="button"
                            className="op-btn op-btn-primary"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => {
                              setIsCreateDocModal(false);
                              navigate("/report/6TeaPr321t");
                            }}
                            type="button"
                            className="op-btn op-btn-secondary ml-2"
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  </ModalUi>
                  {isCreateDoc && <LoaderWithMsg isLoading={isLoading} />}
                  <ModalUi
                    isOpen={isShowEmail}
                    title={"signers alert"}
                    handleClose={() => {
                      setIsShowEmail(false);
                    }}
                  >
                    <div className="h-full p-[20px]">
                      <p>Please select signer for add placeholder!</p>
                      <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
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
                  <PlaceholderCopy
                    isPageCopy={isPageCopy}
                    setIsPageCopy={setIsPageCopy}
                    xyPostion={signerPos}
                    setXyPostion={setSignerPos}
                    allPages={allPages}
                    pageNumber={pageNumber}
                    signKey={signKey}
                    // signerObjId={signerObjId}
                    Id={uniqueId}
                  />
                  {/* pdf header which contain funish back button */}
                  <Header
                    completeBtnTitle={"Next"}
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
                        setSignerObjId={setSignerObjId}
                        isDragging={isDragging}
                        setShowDropdown={setShowDropdown}
                        setCurrWidgetsDetails={setCurrWidgetsDetails}
                        setWidgetType={setWidgetType}
                        setIsRadio={setIsRadio}
                        setSelectWidgetId={setSelectWidgetId}
                        selectWidgetId={selectWidgetId}
                        setIsCheckbox={setIsCheckbox}
                        handleNameModal={setIsNameModal}
                        handleTextSettingModal={handleTextSettingModal}
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
                    setSignerObjId={setSignerObjId}
                    setIsSelectId={setIsSelectId}
                    setContractName={setContractName}
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
                    title={"Roles"}
                    initial={true}
                    isTemplateFlow={true}
                    sendInOrder={pdfDetails[0].SendinOrder}
                    setSignersData={setSignersData}
                    blockColor={blockColor}
                    setBlockColor={setBlockColor}
                  />
                </div>
              ) : (
                <div
                  className={`w-[23%] bg-[#FFFFFF] min-h-screen overflow-y-auto hide-scrollbar`}
                >
                  <div className={`max-h-screen`}>
                    <SignerListPlace
                      isMailSend={isMailSend}
                      signerPos={signerPos}
                      setSignerPos={setSignerPos}
                      signersdata={signersdata}
                      isSelectListId={isSelectListId}
                      setSignerObjId={setSignerObjId}
                      setRoleName={setRoleName}
                      setIsSelectId={setIsSelectId}
                      setContractName={setContractName}
                      handleAddSigner={handleAddSigner}
                      setUniqueId={setUniqueId}
                      handleDeleteUser={handleDeleteUser}
                      handleRoleChange={handleRoleChange}
                      handleOnBlur={handleOnBlur}
                      title={"Roles"}
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
                        title={"Roles"}
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
          />
        </div>
        <ModalUi
          title={"Edit Template"}
          isOpen={isEditTemplate}
          handleClose={handleEditTemplateModal}
        >
          <EditTemplate
            template={pdfDetails?.[0]}
            onSuccess={handleEditTemplateForm}
          />
        </ModalUi>
        <WidgetNameModal
          widgetName={widgetName}
          defaultdata={currWidgetsDetails}
          isOpen={isNameModal}
          handleClose={handleNameModal}
          handleData={handleWidgetdefaultdata}
          isSubscribe={isSubscribe}
        />
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
    </>
  );
};

export default TemplatePlaceholder;
