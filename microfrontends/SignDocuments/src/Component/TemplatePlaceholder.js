import React, { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/./signature.css";
import sign from "../assests/sign3.png";
import stamp from "../assests/stamp2.png";
import { themeColor } from "../utils/ThemeColor/backColor";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import FieldsComponent from "./component/fieldsComponent";
import Tour from "reactour";
import Loader from "./component/loader";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import SignerListPlace from "./component/signerListPlace";
import Header from "./component/header";
import {
  pdfNewWidthFun,
  contractUsers,
  getHostUrl,
  randomId,
  addZIndex,
  createDocument
} from "../utils/Utils";
import RenderPdf from "./component/renderPdf";
import "../css/AddUser.css";
import Title from "./component/Title";
import LinkUserModal from "./component/LinkUserModal";
import EditTemplate from "./component/EditTemplate";
import ModalUi from "../premitives/ModalUi";
import AddRoleModal from "./component/AddRoleModal";
import PlaceholderCopy from "./component/PlaceholderCopy";
import ModalComponent from "./component/modalComponent";
import TourContentWithBtn from "../premitives/TourContentWithBtn";
const TemplatePlaceholder = () => {
  const navigate = useNavigate();
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
  const [noData, setNoData] = useState(false);
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
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
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
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
  const [{ isOver }, drop] = useDrop({
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
      text: "drag me"
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
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStamp: !!monitor.isDragging()
    })
  });

  const [{ isDragSignatureSS }, dragSignatureSS] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 3,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragSignatureSS: !!monitor.isDragging()
    })
  });

  const [{ isDragStampSS }, dragStampSS] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 4,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStampSS: !!monitor.isDragging()
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
    // eslint-disable-next-line
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
  }, [divRef.current]);

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
          } else {
            const updatedSigners = documentData[0].Signers.map((x, index) => ({
              ...x,
              Id: randomId(),
              Role: "User " + (index + 1)
            }));
            setSignersData(updatedSigners);
            setUniqueId(updatedSigners[0].Id);
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
        setNoData(true);

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
          (data) => data.templatetour
        );
        if (checkTourRecipients && checkTourRecipients.length > 0) {
          setCheckTourStatus(checkTourRecipients[0].templatetour);
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
      setNoData(true);

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

  // `getSignerPos` is used to get placeholder position when user place it and save it in array
  const getSignerPos = (item, monitor) => {
    if (uniqueId) {
      const signer = signersdata.find((x) => x.Id === uniqueId);
      if (signer) {
        const posZIndex = zIndex + 1;
        setZIndex(posZIndex);
        const newWidth = containerWH.width;
        const scale = pdfOriginalWidth / newWidth;
        const key = randomId();
        // let filterSignerPos = signerPos.filter(
        //   (data) => data.signerObjId === signerObjId
        // );
        let filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
        let dropData = [];
        let placeHolder;
        if (item === "onclick") {
          const dropObj = {
            xPosition: window.innerWidth / 2 - 100,
            yPosition: window.innerHeight / 2 - 60,
            isStamp: monitor,
            key: key,
            isDrag: false,
            scale: scale,
            isMobile: isMobile,
            yBottom: window.innerHeight / 2 - 60,
            zIndex: posZIndex
          };
          dropData.push(dropObj);
          placeHolder = {
            pageNumber: pageNumber,
            pos: dropData
          };
        } else if (item.type === "BOX") {
          const offset = monitor.getClientOffset();
          //adding and updating drop position in array when user drop signature button in div
          const containerRect = document
            .getElementById("container")
            .getBoundingClientRect();
          const x = offset.x - containerRect.left;
          const y = offset.y - containerRect.top;
          const ybottom = containerRect.bottom - offset.y;

          const dropObj = {
            xPosition: signBtnPosition[0] ? x - signBtnPosition[0].xPos : x,
            yPosition: signBtnPosition[0] ? y - signBtnPosition[0].yPos : y,
            isStamp: isDragStamp || isDragStampSS ? true : false,
            key: key,
            isDrag: false,
            firstXPos: signBtnPosition[0] && signBtnPosition[0].xPos,
            firstYPos: signBtnPosition[0] && signBtnPosition[0].yPos,
            yBottom: ybottom,
            scale: scale,
            isMobile: isMobile,
            zIndex: posZIndex
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
        setIsMailSend(false);
      } else {
        setIsReceipent(false);
      }
    }
  };
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
  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key) => {
    setDragKey(key);
  };

  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement, signerId, key) => {
    if (!isResize) {
      const dataNewPlace = addZIndex(signerPos, key, setZIndex);
      let updateSignPos = [...signerPos];
      updateSignPos.splice(0, updateSignPos.length, ...dataNewPlace);
      // signerPos.splice(0, signerPos.length, ...dataNewPlace);
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();
      const signId = signerId; //? signerId : signerObjId;
      const keyValue = key ? key : dragKey;
      const ybottom = containerRect.height - dragElement.y;

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
            const addSignPos = getPosData.map((url, ind) => {
              if (url.key === keyValue) {
                return {
                  ...url,
                  xPosition: dragElement.x,
                  yPosition: dragElement.y,
                  isDrag: true,
                  yBottom: ybottom
                };
              }
              return url;
            });

            const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
              if (obj.pageNumber === pageNumber) {
                return { ...obj, pos: addSignPos };
              }
              return obj;
            });
            const newUpdateSigner = updateSignPos.map((obj, ind) => {
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
          (data, ind) => data.key !== key
        );

        if (getXYdata.length > 0) {
          updateData.push(getXYdata);
          const newUpdatePos = getPlaceHolder.map((obj, ind) => {
            if (obj.pageNumber === pageNumber) {
              return { ...obj, pos: updateData[0] };
            }
            return obj;
          });

          const newUpdateSigner = signerPos.map((obj, ind) => {
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
            const newUpdatePos = filterSignerPos.map((obj, ind) => {
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

  //function for capture position on hover signature button
  const handleDivClick = (e) => {
    const divRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - divRect.left;
    const mouseY = e.clientY - divRect.top;

    const xyPosition = {
      xPos: mouseX,
      yPos: mouseY
    };

    setXYSignature(xyPosition);
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = (e) => {
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
          SignedUrl: pdfDetails[0].URL,
          Signers: signers,
          Name: pdfDetails[0]?.Name || "",
          Note: pdfDetails[0]?.Note || "",
          Description: pdfDetails[0]?.Description || ""
        };

        await axios
          .put(
            `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
              "_appName"
            )}_Template/${templateId}`,
            data,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                "X-Parse-Session-Token": localStorage.getItem("accesstoken")
              }
            }
          )
          .then((result) => {
            setIsCreateDocModal(true);
            setIsMailSend(true);
            const loadObj = {
              isLoad: false
            };
            setIsLoading(loadObj);
          })
          .catch((err) => {
            console.log("axois err ", err);
          });
      } catch (e) {
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
          message={`Select a recipient from this list to add a place-holder where he is supposed to sign.The placeholder will appear in the same colour as the recipient name once you drop it on the document.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" },
      action: () => handleCloseRoleModal()
    },
    {
      selector: '[data-tut="reactourSecond"]',
      content: () => (
        <TourContentWithBtn
          message={`Drag the signature or stamp placeholder onto the PDF to choose your desired signing location.`}
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
          message={`Drag the placeholder for a recipient anywhere on the document.Remember, it will appear in the same colour as the name of the recipient for easy reference.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourFour"]',
      content: () => (
        <TourContentWithBtn
          message={`Clicking "Save" button will save the template and will ask you for creating new document.`}
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
      const extUserClass = localStorage.getItem("extended_class");
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const templatetourIndex = tourStatus.findIndex(
          (obj) => obj["templatetour"] === false || obj["templatetour"] === true
        );
        if (templatetourIndex !== -1) {
          updatedTourStatus[templatetourIndex] = { templatetour: true };
        } else {
          updatedTourStatus.push({ templatetour: true });
        }
      } else {
        updatedTourStatus = [{ templatetour: true }];
      }
      await axios
        .put(
          `${localStorage.getItem(
            "baseUrl"
          )}classes/${extUserClass}/${signerUserId}`,
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
        .then((Listdata) => {
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
    const hostUrl = getHostUrl();
    // handle create document
    const res = await createDocument(pdfDetails, signerPos, signersdata);
    if (res.status === "success") {
      navigate(`${hostUrl}placeHolderSign/${res.id}`, {
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
    } else {
      setUniqueId(updateSigner[index]?.Id || "");
      setIsSelectId(index);
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

  return (
    <div>
      <Title title={"Template"} />
      <DndProvider backend={HTML5Backend}>
        {isLoading.isLoad ? (
          <Loader isLoading={isLoading} />
        ) : handleError ? (
          <HandleError handleError={handleError} />
        ) : noData ? (
          <Nodata />
        ) : (
          <div className="signatureContainer" ref={divRef}>
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
            <div
              style={{
                marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
                marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
              }}
            >
              {/* this modal is used show alert set placeholder for all signers before send mail */}
              <ModalUi
                headerColor={"#dc3545"}
                isOpen={isSendAlert}
                title={"Fields required"}
                handleClose={() => setIsSendAlert(false)}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>Please add field for all recipients.</p>
                </div>
              </ModalUi>
              <ModalUi
                headerColor={"#dc3545"}
                isOpen={!IsReceipent}
                title={"Receipent required"}
                handleClose={() => setIsReceipent(true)}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>Please add receipent.</p>
                </div>
              </ModalUi>
              {/* this modal is used show send mail  message and after send mail success message */}
              <ModalUi
                isOpen={isCreateDocModal}
                title={"Create Document"}
                handleClose={() => setIsCreateDocModal(false)}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>
                    Do you want to create a document using the template you just
                    created ?
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
                  {currentEmail.length > 0 && (
                    <>
                      <button
                        onClick={() => {
                          handleCreateDocModal();
                        }}
                        style={{
                          background: themeColor(),
                          color: "white"
                        }}
                        type="button"
                        className="finishBtn"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => {
                          setIsCreateDocModal(false);
                        }}
                        style={{
                          color: "black"
                        }}
                        type="button"
                        className="finishBtn"
                      >
                        No
                      </button>
                    </>
                  )}
                </div>
              </ModalUi>
              {isCreateDoc && <Loader isLoading={isLoading} />}
              <ModalComponent
                isShow={isShowEmail}
                type={"signersAlert"}
                setIsShowEmail={setIsShowEmail}
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
                completeBtnTitle={"Save"}
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
              <div data-tut="reactourThird">
                {containerWH && (
                  <RenderPdf
                    pageNumber={pageNumber}
                    pdfOriginalWidth={pdfOriginalWidth}
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
                    setPdfLoadFail={setPdfLoadFail}
                    pdfLoadFail={pdfLoadFail}
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
                  />
                )}
              </div>
            </div>
            {/* signature button */}
            {isMobile ? (
              <div>
                <FieldsComponent
                  dataTut="reactourFirst"
                  dataTut2="reactourSecond"
                  pdfUrl={isMailSend}
                  sign={sign}
                  stamp={stamp}
                  dragSignature={dragSignature}
                  signRef={signRef}
                  handleDivClick={handleDivClick}
                  handleMouseLeave={handleMouseLeave}
                  isDragSign={isDragSign}
                  themeColor={themeColor}
                  dragStamp={dragStamp}
                  dragRef={dragRef}
                  isDragStamp={isDragStamp}
                  isSignYourself={true}
                  isDragSignatureSS={isDragSignatureSS}
                  dragSignatureSS={dragSignatureSS}
                  dragStampSS={dragStampSS}
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
                />
              </div>
            ) : (
              <div>
                <div className="signerComponent">
                  <SignerListPlace
                    signerPos={signerPos}
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
                  />
                  <div data-tut="reactourSecond">
                    <FieldsComponent
                      pdfUrl={isMailSend}
                      sign={sign}
                      stamp={stamp}
                      dragSignature={dragSignature}
                      signRef={signRef}
                      handleDivClick={handleDivClick}
                      handleMouseLeave={handleMouseLeave}
                      isDragSign={isDragSign}
                      themeColor={themeColor}
                      dragStamp={dragStamp}
                      dragRef={dragRef}
                      isDragStamp={isDragStamp}
                      isSignYourself={false}
                      addPositionOfSignature={addPositionOfSignature}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DndProvider>
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
    </div>
  );
};

export default TemplatePlaceholder;
