import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../css/./signature.css";
import { themeColor } from "../utils/ThemeColor/backColor";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import FieldsComponent from "./component/fieldsComponent";
import Tour from "reactour";
import { useLocation, useParams } from "react-router-dom";
import Loader from "./component/loader";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import SignerListPlace from "./component/signerListPlace";
import Header from "./component/header";
import {
  pdfNewWidthFun,
  contractDocument,
  contractUsers,
  getHostUrl,
  addZIndex,
  randomId
} from "../utils/Utils";
import RenderPdf from "./component/renderPdf";
import { useNavigate } from "react-router-dom";
import PlaceholderCopy from "./component/PlaceholderCopy";
import LinkUserModal from "./component/LinkUserModal";
import Title from "./component/Title";
import TourContentWithBtn from "../premitives/TourContentWithBtn";
import ModalUi from "../premitives/ModalUi";
import DropdownWidgetOption from "../Component/WidgetComponent/dropdownWidgetOption";

function PlaceHolderSign() {
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
  const [noData, setNoData] = useState(false);
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
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
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isAddUser, setIsAddUser] = useState({});
  const [signerExistModal, setSignerExistModal] = useState(false);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const [{ isDragSignatureSS }, dragSignatureSS] = useDrag({
    type: "BOX",
    item: {
      id: 3,
      text: "signature"
    },
    collect: (monitor) => ({
      isDragSignatureSS: !!monitor.isDragging()
    })
  });

  const [{ isDragStampSS }, dragStampSS] = useDrag({
    type: "BOX",
    item: {
      id: 4,
      text: "stamp"
    },
    collect: (monitor) => ({
      isDragStampSS: !!monitor.isDragging()
    })
  });

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
  //function for get document details
  const getDocumentDetails = async () => {
    //getting document details
    const documentData = await contractDocument(documentId);
    if (documentData && documentData.length > 0) {
      // const alreadyPlaceholder =
      //   documentData[0].Placeholders && documentData[0].Placeholders;
      // if (alreadyPlaceholder && alreadyPlaceholder.length > 0) {
      //   setIsAlreadyPlace(true);
      // }
      // setSignersData(documentData[0]);
      // setIsSelectId(0);
      // setSignerObjId(documentData[0].Signers[0].objectId);
      // setContractName(documentData[0].Signers[0].className);
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
          setSignersData(updatedSigners);
          setIsSelectId(0);
          setUniqueId(updatedSigners[0].Id);
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
    const res = await contractUsers(jsonSender.email);
    if (res[0] && res.length) {
      setSignerUserId(res[0].objectId);
      const tourstatus = res[0].TourStatus && res[0].TourStatus;
      if (tourstatus && tourstatus.length > 0) {
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

  const getSignerPos = (item, monitor) => {
    setSignerObjId("");
    setContractName("");
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
            //onclick put placeholder center on pdf
            xPosition: window.innerWidth / 2 - 100,
            yPosition: window.innerHeight / 2 - 60,
            isStamp:
              (monitor.type === "stamp" || monitor.type === "image") && true,
            key: key,
            isDrag: false,
            scale: scale,
            isMobile: isMobile,
            yBottom: window.innerHeight / 2 - 60,
            zIndex: posZIndex,
            type: monitor.type
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
            isStamp: (item.text === "stamp" || item.text === "image") && true,
            key: key,
            isDrag: false,
            firstXPos: signBtnPosition[0] && signBtnPosition[0].xPos,
            firstYPos: signBtnPosition[0] && signBtnPosition[0].yPos,
            yBottom: ybottom,
            scale: scale,
            isMobile: isMobile,
            zIndex: posZIndex,
            type: item.text
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
        if (item.text === "dropdown" || monitor.type === "dropdown") {
          setShowDropdown(true);
          setSignKey(key);
        }
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
  const handleTabDrag = (key, signerId) => {
    setDragKey(key);
    setIsDragging(true);
  };

  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement, signerId, key) => {
    if (!isResize && isDragging) {
      const dataNewPlace = addZIndex(signerPos, key, setZIndex);
      let updateSignPos = [...signerPos];
      updateSignPos.splice(0, updateSignPos.length, ...dataNewPlace);
      // signerPos.splice(0, signerPos.length, ...dataNewPlace);
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();
      const signId = signerId ? signerId : uniqueId; //? signerId : signerObjId;
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
    if (signerPos.length === signersdata.length) {
      const IsSignerNotExist = signerPos?.some((x) => !x.signerObjId);
      if (IsSignerNotExist) {
        setSignerExistModal(true);
      } else {
        const alert = {
          mssg: "confirm",
          alert: true
        };
        setIsSendAlert(alert);
      }
    } else {
      const alert = {
        mssg: "sure",
        alert: true
      };

      setIsSendAlert(alert);
    }
  };
  const sendEmailToSigners = async () => {
    const loadObj = {
      isLoad: true,
      message: "This might take some time"
    };
    setIsLoading(loadObj);
    setIsSendAlert({});

    let sendMail;
    // console.log("pdfDetails", pdfDetails);
    const expireDate = pdfDetails?.[0].ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    let sender = pdfDetails?.[0].ExtUserPtr.Email;
    const signerMail = signersdata;

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
        const serverUrl = localStorage.getItem("baseUrl");
        const newServer = serverUrl.replaceAll("/", "%2F");
        const objectId = signerMail[i].objectId;
        const serverParams = `${newServer}&${localStorage.getItem(
          "parseAppId"
        )}&${localStorage.getItem("_appName")}`;

        const hostUrl = window.location.origin + "/loadmf/signmicroapp";
        let signPdf = `${hostUrl}/login/${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}/${serverParams}`;
        const openSignUrl = "https://www.opensignlabs.com/";
        const orgName = pdfDetails[0]?.ExtUserPtr.Company
          ? pdfDetails[0].ExtUserPtr.Company
          : "";
        const themeBGcolor = themeColor();
        let params = {
          recipient: signerMail[i].Email,
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
            "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expire on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
            localExpireDate +
            "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
            signPdf +
            "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
            sender +
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
      let updateExpiryDate, data;
      updateExpiryDate = new Date();
      updateExpiryDate.setDate(updateExpiryDate.getDate() + addExtraDays);

      try {
        if (updateExpiryDate) {
          data = {
            Placeholders: signerPos,
            SignedUrl: pdfDetails[0].URL,
            Signers: signers,
            ExpiryDate: {
              iso: updateExpiryDate,
              __type: "Date"
            }
          };
        } else {
          data = {
            Placeholders: signerPos,
            SignedUrl: pdfDetails[0].URL,
            Signers: signers
          };
        }

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
          .then((result) => {
            setIsSend(true);
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
    }
  };
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  //here you can add your messages in content and selector is key of particular steps

  const tourConfig = [
    {
      selector: '[data-tut="reactourFirst"]',
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
          message={`The PDF content area already displays the template's existing placeholders. For your convenience, these placeholders will match the color of the recipient's name, making them easily identifiable.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourLinkUser"]',
      content: () => (
        <TourContentWithBtn
          message={`Use this icon to assign a new signer or change the existing one for the placeholder.`}
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
          message={`Clicking "Send" button will share the document with all the recipients.It will also send out emails to everyone on the recipients list.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  const handleSaveDropdownOptions = (dropdownName, dropdownOptions) => {
    const filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
    if (filterSignerPos.length > 0) {
      const getPlaceHolder = filterSignerPos[0].placeHolder;

      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;

        const getPosData = getXYdata;
        const addSignPos = getPosData.map((position, ind) => {
          if (position.key === signKey) {
            return {
              ...position,
              widgetName: dropdownName,
              widgetOption: dropdownOptions
            };
          }
          return position;
        });

        const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
          if (obj.pageNumber === pageNumber) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });
        const newUpdateSigner = signerPos.map((obj, ind) => {
          if (obj.Id === uniqueId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });

        setSignerPos(newUpdateSigner);
      }
    }
  };

  //function for update TourStatus
  const closeTour = async () => {
    setPlaceholderTour(false);
    if (isDontShow) {
      const extUserClass = localStorage.getItem("extended_class");
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
  const handleRecipientSign = () => {
    const hostUrl = getHostUrl();
    navigate(`${hostUrl}recipientSignPdf/${documentId}/${currentId}`);
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
      // console.log("updatePlaceHolder ", updatePlaceHolder);
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
      // console.log("updateSigner ", updateSigner);

      setSignersData(updateSigner);
      const index = signersdata.findIndex((x) => x.Id === uniqueId);
      setIsSelectId(index);
    }
  };

  const closePopup = () => {
    setIsAddUser({});
  };
  return (
    <>
      <Title title={state?.title ? state.title : "New Document"} />
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
                isOpen={placeholderTour}
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
                headerColor={
                  isSendAlert.mssg === "sure"
                    ? "#dc3545"
                    : isSendAlert.mssg === "confirm" && themeColor()
                }
                isOpen={isSendAlert.alert}
                title={
                  isSendAlert.mssg === "sure"
                    ? "Fields required"
                    : isSendAlert.mssg === "confirm" && "Send Mail"
                }
                handleClose={() => setIsSendAlert({})}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  {isSendAlert.mssg === "sure" ? (
                    <p>Please add field for all recipients.</p>
                  ) : (
                    isSendAlert.mssg === "confirm" && (
                      <p>
                        Are you sure you want to send out this document for
                        signatures?
                      </p>
                    )
                  )}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#9f9f9f",
                      width: "100%",
                      marginTop: "15px",
                      marginBottom: "15px"
                    }}
                  ></div>

                  {isSendAlert.mssg === "confirm" && (
                    <button
                      onClick={() => sendEmailToSigners()}
                      style={{
                        background: themeColor()
                      }}
                      type="button"
                      className="finishBtn"
                    >
                      Yes
                    </button>
                  )}
                  <button
                    onClick={() => setIsSendAlert({})}
                    type="button"
                    className="finishBtn cancelBtn"
                  >
                    Close
                  </button>
                </div>
              </ModalUi>

              {/* this modal is used show send mail  message and after send mail success message */}
              <ModalUi
                isOpen={isSend}
                title={"Mails Sent"}
                handleClose={() => {
                  setIsSend(false);
                  setSignerPos([]);
                }}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>You have successfully sent mails to all recipients!</p>
                  {currentId && (
                    <p>Do you want to sign documents right now ?</p>
                  )}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#9f9f9f",
                      width: "100%",
                      marginTop: "15px",
                      marginBottom: "15px"
                    }}
                  ></div>
                  {currentId ? (
                    <>
                      <button
                        onClick={() => {
                          handleRecipientSign();
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
                          setIsSend(false);
                          setSignerPos([]);
                        }}
                        type="button"
                        className="finishBtn cancelBtn"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSend(false);
                        setSignerPos([]);
                      }}
                      type="button"
                      className="finishBtn cancelBtn"
                    >
                      Close
                    </button>
                  )}
                </div>
              </ModalUi>

              {/* <ModalComponent isShow={isAlreadyPlace} type={"alreadyPlace"} /> */}
              <ModalUi
                headerColor={"#dc3545"}
                isOpen={isShowEmail}
                title={"signersAlert"}
                handleClose={() => {
                  setIsShowEmail(false);
                }}
              >
                <div style={{ height: "100%", padding: 20 }}>
                  <p>Please select signer for add placeholder!</p>

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
                      setIsShowEmail(false);
                    }}
                    type="button"
                    className="finishBtn cancelBtn"
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
                // signerObjId={signerObjId}
                Id={uniqueId}
              />
              <DropdownWidgetOption
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                handleSaveDropdownOptions={handleSaveDropdownOptions}
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
                    setIsPageCopy={setIsPageCopy}
                    signersdata={signersdata}
                    setSignKey={setSignKey}
                    setSignerObjId={setSignerObjId}
                    handleLinkUser={handleLinkUser}
                    setUniqueId={setUniqueId}
                    isDragging={isDragging}
                    setShowDropdown={setShowDropdown}
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
                  isSigners={true}
                  setIsShowEmail={setIsShowEmail}
                  isMailSend={isMailSend}
                  setSelectedEmail={setSelectedEmail}
                  selectedEmail={selectedEmail}
                  setUniqueId={setUniqueId}
                  setRoleName={setRoleName}
                  initial={true}
                />
              </div>
            ) : (
              <div>
                <div className="signerComponent">
                  <div
                    style={{ maxHeight: window.innerHeight - 70 + "px" }}
                    className="autoSignScroll"
                  >
                    <SignerListPlace
                      signerPos={signerPos}
                      signersdata={signersdata}
                      isSelectListId={isSelectListId}
                      setSignerObjId={setSignerObjId}
                      setIsSelectId={setIsSelectId}
                      setContractName={setContractName}
                      setUniqueId={setUniqueId}
                      setRoleName={setRoleName}
                      // handleAddSigner={handleAddSigner}
                    />
                    <div data-tut="reactourSecond">
                      <FieldsComponent
                        pdfUrl={isMailSend}
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
                        initial={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DndProvider>
      <div>
        <ModalUi
          headerColor={"#dc3545"}
          isOpen={signerExistModal}
          title={"Users required"}
          handleClose={() => {
            setSignerExistModal(false);
          }}
        >
          <div style={{ height: "100%", padding: 20 }}>
            <p>Please assign signers to all placeholders</p>

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
              onClick={() => setSignerExistModal(false)}
              type="button"
              className="finishBtn cancelBtn"
            >
              Close
            </button>
          </div>
        </ModalUi>
        <LinkUserModal
          handleAddUser={handleAddUser}
          isAddUser={isAddUser}
          uniqueId={uniqueId}
          closePopup={closePopup}
        />
      </div>
    </>
  );
}

export default PlaceHolderSign;
