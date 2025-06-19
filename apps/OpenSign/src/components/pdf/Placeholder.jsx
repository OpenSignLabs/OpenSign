import { useState, useEffect } from "react";
import BorderResize from "./BorderResize";
import { Rnd } from "react-rnd";
import {
  changeDateToMomentFormat,
  defaultWidthHeight,
  fontColorArr,
  fontsizeArr,
  getContainerScale,
  handleCopyNextToWidget,
  handleCopySignUrl,
  handleHeighlightWidget,
  onChangeInput,
  radioButtonWidget,
  textInputWidget,
  cellsWidget,
  textWidget
} from "../../constant/Utils";
import PlaceholderType from "./PlaceholderType";
import moment from "moment";
import "../../styles/opensigndrive.css";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setIsShowModal } from "../../redux/reducers/widgetSlice";
import { themeColor } from "../../constant/const";

const selectFormat = (data) => {
  switch (data) {
    case "L":
      return "MM/dd/yyyy";
    case "MM/DD/YYYY":
      return "MM/dd/yyyy";
    case "DD-MM-YYYY":
      return "dd-MM-yyyy";
    case "DD/MM/YYYY":
      return "dd/MM/yyyy";
    case "LL":
      return "MMMM dd, yyyy";
    case "DD MMM, YYYY":
      return "dd MMM, yyyy";
    case "YYYY-MM-DD":
      return "yyyy-MM-dd";
    case "MM-DD-YYYY":
      return "MM-dd-yyyy";
    case "MM.DD.YYYY":
      return "MM.dd.yyyy";
    case "MMM DD, YYYY":
      return "MMM dd, yyyy";
    case "MMMM DD, YYYY":
      return "MMMM dd, yyyy";
    case "DD MMMM, YYYY":
      return "dd MMMM, yyyy";
    default:
      return "MM/dd/yyyy";
  }
};

//function to get default format
const getDefaultFormat = (dateFormat) => dateFormat || "MM/dd/yyyy";

//function to convert formated date to new Date() format
const getDefaultDate = (dateStr, format) => {
  //get valid date format for moment to convert formated date to new Date() format
  const formats = changeDateToMomentFormat(format);
  const parsedDate = moment(dateStr, formats);
  let date;
  if (parsedDate.isValid()) {
    date = new Date(parsedDate.toISOString());
    return date;
  } else {
    date = new Date();
    return date;
  }
};

function Placeholder(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const widgetData =
    props.pos?.options?.defaultValue || props.pos?.options?.response;
  const [isDateModal, setIsDateModal] = useState(false);
  const [containerScale, setContainerScale] = useState();
  const [selectDate, setSelectDate] = useState({});
  const [dateFormat, setDateFormat] = useState([]);
  const [clickonWidget, setClickonWidget] = useState({});
  const [isDateReadOnly, setIsDateReadOnly] = useState(
    props?.pos?.options?.isReadOnly || false
  );
  const startDate = props?.pos?.options?.response
    ? getDefaultDate(
        props?.pos?.options?.response,
        props.pos?.options?.validation?.format
      )
    : new Date();

  useEffect(() => {
    const getPdfPageWidth = props.pdfOriginalWH.find(
      (data) => data.pageNumber === props.pageNumber
    );
    setContainerScale(props.containerWH.width / getPdfPageWidth.width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.containerWH.width, props.pdfOriginalWH]);
  const dateFormatArr = [
    "L",
    "DD-MM-YYYY",
    "YYYY-MM-DD",
    "MM.DD.YYYY",
    "MM-DD-YYYY",
    "MMM DD, YYYY",
    "LL",
    "DD MMM, YYYY",
    "DD MMMM, YYYY"
  ];

  useEffect(() => {
    if (props?.pos?.type === "date") {
      const isDateChange = true;
      const dateObj = {
        date: startDate,
        format: getDefaultFormat(props.pos?.options?.validation?.format)
      };
      handleSaveDate(dateObj, isDateChange); //function to save date and format in local array
    }
  }, [widgetData]);

  //function change format array list with selected date and format
  const changeDateFormat = () => {
    const updateDate = [];
    dateFormatArr.map((data) => {
      let date;
      if (selectDate && selectDate.format === "dd-MM-yyyy") {
        const [day, month, year] = selectDate.date.split("-");
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(selectDate?.date);
      }
      const milliseconds = date.getTime();
      const newDate = moment(milliseconds).format(data);
      const dateObj = {
        date: newDate,
        format: selectFormat(data)
      };
      updateDate.push(dateObj);
    });
    setDateFormat(updateDate);
  };

  useEffect(() => {
    if (props.isPlaceholder || props.isSignYourself || props.isSelfSign) {
      selectDate && changeDateFormat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectDate]);

  //`handleWidgetIdandPopup` is used to set current widget id and open relative popup
  const handleWidgetIdandPopup = async () => {
    //'props.isOpenSignPad' variable is used to check flow to open signature pad for finish document
    if (
      props.isOpenSignPad &&
      !props.isDragging &&
      !props.pos.options?.isReadOnly &&
      props.pos.type !== textWidget
    ) {
      if (props?.ispublicTemplate) {
        props.handleUserDetails();
      } else {
          if (props?.isNeedSign) {
            //funcion is used to highlight widgets on top when click any widget if two widgets on overlap
            const getCurrentSignerPos = props.xyPosition.find(
              (x) => x.Id === props.uniqueId
            );
            const updateZindex = handleHeighlightWidget(
              getCurrentSignerPos,
              props.pos.key,
              props.pageNumber
            );
            const updatesignerPos = props.xyPosition.map((x) =>
              x.Id === props.uniqueId ? { ...x, placeHolder: updateZindex } : x
            );
            props.setXyPosition(updatesignerPos);
          }
          dispatch(setIsShowModal({ [props.pos.key]: true }));
      }
    } else if (
      props.isPlaceholder &&
      !props.isDragging &&
      props.pos.type !== textWidget
    ) {
      if (props.pos.key === props?.currWidgetsDetails?.key) {
        props.handleLinkUser(props.data.Id);
        props.setUniqueId(props.data.Id);
        const checkIndex = props.xyPosition.findIndex(
          (data) => data.Id === props.data.Id
        );
        props.setIsSelectId(checkIndex || 0);
      }
      //handle prefill 'text widget' click then save previos in tem variable after save or close button again assign current selected userId
    } else if (props.pos.type === textWidget) {
      dispatch(setIsShowModal({ [props.pos.key]: true }));
      props.setTempSignerId(props?.uniqueId);
      props.setUniqueId(props?.data?.Id);
    }
  };

  const widgetClickHandler = () => {
    props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
    //condition to check in request signing flow user click on agree or not
    if (props?.data?.signerObjId === props?.signerObjId && !props.isDragging) {
      if (!props.isAgree && !props.isSelfSign) {
        props.setIsAgreeTour && props.setIsAgreeTour(true);
      } else {
        handleWidgetIdandPopup();
      }
    } //condition for open contact details popup when sign templet from public signing flow
    else if (props?.uniqueId && props.data?.Id === props?.uniqueId) {
      handleWidgetIdandPopup();
    }
  };

  const handleOnClickPlaceholder = () => {
    //'props.isDragging' variable is used to checking if user take any widget and try to drag then in that case
    //onclick event call. so to prevent onclick and do not open unecessary modal open.
    //condition only for request signing flow and self signing flow then apply one click copy sign url of previous drawn signature
    if (props.isApplyAll) {
      props.setRequestSignTour && props.setRequestSignTour(true);
      let isCopySignature = false;
      let existSignPosition = "";
      //condition for 'signature','initials','stamp' widgets only
      if (["signature", "initials", "stamp"].includes(props.pos.type)) {
        const widgetKey = props.pos.key;
        let exitLoop = false;
        const placeholders = props.data.placeHolder;
        //check onclick current widget signature/stamp/initials signature url exist or not
        placeholders?.forEach((holder) => {
          holder?.pos?.forEach((posItem) => {
            if (posItem.SignUrl && posItem.type === props.pos.type) {
              existSignPosition = posItem;
              return; // Break out of the current iteration
            }
          });
          if (existSignPosition) {
            return;
          }
        });
        //case:-
        //1- Open signpad once when if there are no any signature url draw
        //2- If multiple signature widgets are present, clicking on the next widget should copy the signature URL from the previously drawn signature
        //3- If the user attempts to edit the signature, open the signature pad to allow drawing a new signature upon clicking.
        for (const placeholderObj of props.data.placeHolder || []) {
          for (const posItem of placeholderObj.pos || []) {
            if (posItem.key === widgetKey) {
              //This condition is used to open signature pad to draw signature in some case
              //case-1 : The condition (!posItem.SignUrl && !existSignPosition) checks if the current widget being clicked does not have a drawn signature and no signature URL exists for any signature widget.
              //case-2 : The condition posItem.SignUrl is used to verify if the current widget already has a drawn signature and if the user is attempting to edit it
              if ((!posItem.SignUrl && !existSignPosition) || posItem.SignUrl) {
                exitLoop = true;
              } else {
                //else condition is used to copy the signature URL from the previously drawn signature
                exitLoop = true;
                isCopySignature = true;
                break;
              }
            }
          }
          if (exitLoop) {
            break; // Stop iterating through placeholders if exitLoop true
          }
        }
        //existSignPosition.type === props.pos.type ensures that the current widget's type matches the type of the widget associated with the existing signature URL during the click event
        if (
          existSignPosition.type === props.pos.type &&
          existSignPosition &&
          isCopySignature
        ) {
          props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
          //function to copy the signature URL from the previously drawn signature when clicking on the next widget.
          handleCopySignUrl(
            props.pos, //currect widget position details
            existSignPosition, //exist sign url widget's position details
            props.setXyPosition, //used to update Placeholders details
            props.xyPosition, //keep Placeholders details
            props.pageNumber, //current page number
            props.signerObjId //current signer's object id
          );
          existSignPosition = "";
        } else {
          widgetClickHandler();
        }
      } else {
        widgetClickHandler();
      }
    } else {
      //The else condition is used to handle the case when the user clicks on a widget and open signature pad to draw sign
      props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
      handleWidgetIdandPopup();
    }
  };
  //`handleOnClickSettingIcon` is used set current widget details and open setting of it
  const handleOnClickSettingIcon = () => {
    if (props.pos.type === radioButtonWidget) {
      props.setIsRadio(true);
    } else if (props.pos.type === "dropdown") {
      props?.setShowDropdown(true);
    } else if (props.pos.type === "checkbox") {
      props?.setIsCheckbox(true);
    }
    // cells widget settings in sign yourself flow
    else if (
      props.pos.type === cellsWidget &&
      (props.isSignYourself || props.isSelfSign)
    ) {
      props.handleCellSettingModal && props.handleCellSettingModal();
    }
    //condition to handle setting icon for signyour-self flow for all type text widgets
    else if (
      [
        textInputWidget,
        textWidget,
        "name",
        "company",
        "job title",
        "email"
      ].includes(props.pos.type) &&
      (props.isSignYourself || props.isSelfSign)
    ) {
      props.handleTextSettingModal(true);
    } else {
      props?.handleNameModal && props?.handleNameModal(true);
    }

    //condition for only placeholder and template flow
    if (props.data && props?.pos?.type !== textWidget) {
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPosition
        .filter((data) => data.Role !== "prefill")
        .findIndex((data) => data.Id === props.data.Id);
      props.setIsSelectId && props.setIsSelectId(checkIndex || 0);
    }
    //condition to handle in placeholder and template flow for text widget signerId for text widgets i have to set uniqueId in tempSignerId because
    //it does not have any signer user and any signerobjId
    else if (props.data && props.pos.type === textWidget && !props.isSelfSign) {
      props.setTempSignerId(props.uniqueId);
      props.setUniqueId(props?.data?.Id);
    }
    props.setCurrWidgetsDetails(props.pos);
  };
  //function to set required state value onclick on widget's copy icon
  const handleCopyPlaceholder = (e) => {
    e.stopPropagation();
    //condition to handle text widget signer obj id and unique id
    //when user click on copy icon of text widget in that condition text widget does not have any signerObjId
    //in that case i have to save in tempSignerId as a unique id of previous select signer's unique id
    //and on save or cancel button of copy all page popup i have set this temp signer Id in unique id

    if (props.data && props?.pos?.type !== textWidget) {
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPosition
        .filter((data) => data.Role !== "prefill")
        .findIndex((data) => data.Id === props.data.Id);
      props.setIsSelectId && props.setIsSelectId(checkIndex || 0);
    } else if (
      props.data &&
      props.pos.type === textWidget &&
      !props.isSelfSign
    ) {
      props.setTempSignerId(props.uniqueId);
      props.setUniqueId(props?.data?.Id);
    }

    //checking widget's type and open widget copy modal for required widgets
    if (
      ["signature", textInputWidget, textWidget, "stamp", "initials"].includes(
        props.pos.type
      )
    ) {
      props.setIsPageCopy(true);
      props.setCurrWidgetsDetails(props.pos);
    } else {
      //function to create new widget next to just widget
      handleCopyNextToWidget(
        props.pos,
        props.pos.type,
        props.xyPosition,
        props.index,
        props.setXyPosition,
        props.data && props.data?.Id
      );
    }
  };

  //function to save date and format on local array onchange date and onclick format
  const handleSaveDate = (data, isDateChange) => {
    let updateDate = data.date;
    let date;
    if (data?.format === "dd-MM-yyyy") {
      date = isDateChange
        ? moment(updateDate).format(changeDateToMomentFormat(data.format))
        : updateDate;
    } else {
      //using moment package is used to change date as per the format provided in selectDate obj e.g. - MM/dd/yyyy -> 03/12/2024
      const newDate = new Date(updateDate);
      date = moment(newDate.getTime()).format(
        changeDateToMomentFormat(data?.format)
      );
    }
    //`onChangeInput` is used to save data related to date in a placeholder field
    onChangeInput(
      date,
      props.pos.key,
      props.xyPosition,
      props.index,
      props.setXyPosition,
      props.data && props.data.Id,
      false,
      data?.format,
      props.fontSize || props.pos?.options?.fontSize || 12,
      props.fontColor || props.pos?.options?.fontColor || "black",
      isDateReadOnly || false
    );
    setSelectDate({ date: date, format: data?.format });
  };

  const setCellCount = (key, newCount) => {
    props.setXyPosition((prev) => {
      const isSignerList = prev.some((d) => d.signerPtr);
      if (isSignerList) {
        const signerId = props.data?.Id || props.uniqueId;
        const filterSignerPos = prev.filter((d) => d.Id === signerId);
        if (filterSignerPos.length > 0) {
          const getPlaceHolder = filterSignerPos[0].placeHolder;
          const updatedPlaceHolder = getPlaceHolder.map((ph) => {
            if (ph.pageNumber !== props.pageNumber) return ph;
            const newPos = ph.pos.map((p) =>
              p.key === key
                ? { ...p, options: { ...p.options, cellCount: newCount } }
                : p
            );
            return { ...ph, pos: newPos };
          });
          return prev.map((obj) =>
            obj.Id === signerId
              ? { ...obj, placeHolder: updatedPlaceHolder }
              : obj
          );
        }
      } else {
        const updatePos = prev[props.index].pos.map((p) =>
          p.key === key
            ? { ...p, options: { ...p.options, cellCount: newCount } }
            : p
        );
        return prev.map((obj, ind) =>
          ind === props.index ? { ...obj, pos: updatePos } : obj
        );
      }
      return prev;
    });
  };
  const PlaceholderIcon = () => {
    const isSettingForCells =
      props?.isAlllowModify && !props?.assignedWidgetId.includes(props.pos.key)
        ? []
        : [cellsWidget];

    // 1- If props.isShowBorder is true, display border's icon for all widgets. OR
    // 2- Use the combination of props?.isAlllowModify and !props?.assignedWidgetId.includes(props.pos.key) to determine when to show border's icon:
    //    1- When isAlllowModify is true, show border's icon.
    //    2- Do not display border's icon for widgets already assigned (props.assignedWidgetId.includes(props.pos.key) is true).
    return (
      (props.isShowBorder ||
        (props?.isAlllowModify &&
          !props?.assignedWidgetId.includes(props.pos.key))) && (
        <>
          {(props.isPlaceholder ||
            props.isSignYourself ||
            props.isSelfSign) && (
            <>
              {/* condition to add setting icon for signyour-self flow for particular text widgets
            and also it have diffrent position 
            */}
              {[
                "checkbox",
                textInputWidget,
                textWidget,
                "name",
                "company",
                "job title",
                "email",
                ...isSettingForCells
              ].includes(props.pos.type) &&
              (props.isSignYourself || props.isSelfSign) ? (
                <i
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleOnClickSettingIcon();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOnClickSettingIcon();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleOnClickSettingIcon();
                  }}
                  className="fa-light fa-gear icon"
                  style={{
                    color: "#188ae2",
                    right: "29px",
                    top: "-19px",
                    cursor: "pointer",
                    zIndex: 99,
                    pointerEvents: "auto"
                  }}
                ></i>
              ) : (
                /* condition to add setting icon for placeholder & template flow for all widgets except signature and date */
                ((!props?.pos?.type && props.pos.isStamp) ||
                  (props?.pos?.type &&
                    !["date"].includes(props.pos.type) &&
                    !props.isSignYourself &&
                    !props.isSelfSign)) && (
                  <i
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleOnClickSettingIcon();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOnClickSettingIcon();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleOnClickSettingIcon();
                    }}
                    className="fa-light fa-gear icon"
                    style={{
                      color: "#188ae2",
                      right: props?.pos?.type === textWidget ? "32px" : "51px",
                      top: "-19px",
                      cursor: "pointer",
                      zIndex: 99,
                      pointerEvents: "auto"
                    }}
                  ></i>
                )
              )}
              {/* condition for usericon for all widgets except text widgets and signyour-self flow */}
              {props.pos.type !== textWidget &&
                !props.isSignYourself &&
                !props.isSelfSign && (
                  <i
                    data-tut="assignSigner"
                    className="fa-light fa-user icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.handleLinkUser(props.data.Id);
                      props.setUniqueId(props.data.Id);
                      const checkIndex = props.xyPosition.findIndex(
                        (data) => data.Id === props.data.Id
                      );
                      props.setIsSelectId(checkIndex || 0);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      props.handleLinkUser(props.data.Id);
                      props.setUniqueId(props.data.Id);
                      const checkIndex = props.xyPosition.findIndex(
                        (data) => data.Id === props.data.Id
                      );
                      props.setIsSelectId(checkIndex || 0);
                    }}
                    style={{ color: "#188ae2", right: "32px", top: "-18px" }}
                  ></i>
                )}
            </>
          )}
          {/* setting icon only for date widgets */}
          {props.pos.type === "date" && selectDate && (
            <i
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                props.setCurrWidgetsDetails(props.pos);
                setIsDateModal(!isDateModal);
                e.stopPropagation();
                setClickonWidget(props.pos);
                if (props.data) {
                  props.setCurrWidgetsDetails(props.pos);
                  props.setUniqueId(props.data.Id);
                  const checkIndex = props.xyPosition.findIndex(
                    (data) => data.Id === props.data.Id
                  );
                  props.setIsSelectId(checkIndex || 0);
                }
              }}
              onTouchEnd={(e) => {
                props.setCurrWidgetsDetails(props.pos);
                e.stopPropagation();
                setIsDateModal(!isDateModal);
                if (props.data) {
                  props.setCurrWidgetsDetails(props.pos);
                  props.setUniqueId(props.data.Id);
                  const checkIndex = props.xyPosition.findIndex(
                    (data) => data.Id === props.data.Id
                  );
                  props.setIsSelectId(checkIndex || 0);
                }
              }}
              style={{
                zIndex: "99",
                top: "-18px",
                right: props.isPlaceholder ? "50px" : "30px",
                color: "#188ae2",
                fontSize: "14px",
                cursor: "pointer",
                pointerEvents: "auto"
              }}
              className="fa-light fa-gear icon"
            ></i>
          )}
          {/* copy icon for all widgets */}
          <i
            className="fa-light fa-copy icon"
            onClick={(e) => handleCopyPlaceholder(e)}
            onTouchEnd={(e) => handleCopyPlaceholder(e)}
            style={{ color: "#188ae2", right: "12px", top: "-18px" }}
          ></i>
          {/* delete icon for all widgets */}
          <i
            className="fa-light fa-circle-xmark icon"
            onClick={(e) => {
              e.stopPropagation();
              //condition for template and placeholder flow
              if (props.data) {
                props.handleDeleteSign(props.pos.key, props.data.Id);
              }
              //condition for signyour-self flow
              else {
                props.handleDeleteSign(props.pos.key);
              }
            }}
            //for mobile and tablet touch event
            onTouchEnd={(e) => {
              e.stopPropagation();
              //condition for template and placeholder flow
              if (props.data) {
                props.handleDeleteSign(props.pos.key, props.data?.Id);
              }
              //condition for signyour-self flow
              else {
                props.handleDeleteSign(props.pos.key);
              }
            }}
            style={{ color: "#188ae2", right: "-8px", top: "-18px" }}
          ></i>
        </>
      )
    );
  };
  const xPos = (pos, signYourself) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const resizePos = pos.xPosition;
    if (signYourself) {
      return resizePos * containerScale * props.scale;
    } else {
      //checking both condition mobile and desktop view
      if (pos.isMobile && pos.scale) {
        if (props.scale > 1) {
          return resizePos * pos.scale * containerScale * props.scale;
        } else {
          return resizePos * pos.scale * containerScale;
        }
      } else {
        // if (pos.scale === containerScale) {
        //   return resizePos * pos.scale * props.scale;
        // } else {
        return resizePos * containerScale * props.scale;
        // }
      }
    }
  };
  const yPos = (pos, signYourself) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const resizePos = pos.yPosition;

    if (signYourself) {
      return resizePos * containerScale * props.scale;
    } else {
      //checking both condition mobile and desktop view
      if (pos.isMobile && pos.scale) {
        if (props.scale > 1) {
          return resizePos * pos.scale * containerScale * props.scale;
        } else {
          return resizePos * pos.scale * containerScale;
        }
      }
      // else if (pos.scale === containerScale) {
      //   if (props.scale > 1) {
      //     return resizePos * pos.scale * props.scale;
      //   } else {
      //     return resizePos * pos.scale;
      //   }
      // }
      else {
        return resizePos * containerScale * props.scale;
      }
    }
  };
  //function to calculate font size
  const calculateFont = (size, isMinHeight) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const fontSize = (size || 12) * containerScale * props.scale;
    //isMinHeight to set text box minimum height
    if (isMinHeight) {
      return fontSize * 1.5 + "px";
    } else {
      return fontSize + "px";
    }
  };

  const getCursor = () => {
    if (props.data && props.isNeedSign) {
      if (props?.signerObjId && props.data?.signerObjId === props.signerObjId) {
        return "pointer";
      } else if (props?.uniqueId && props.data?.Id === props.uniqueId) {
        return "pointer";
      } else {
        return "not-allowed";
      }
    } else {
      return "move";
    }
  };

  //function to handle widget background color
  const handleBackground = () => {
    if (props.data) {
      if (props.isNeedSign) {
        if (props.data?.Id === props?.uniqueId) {
          return props.data?.blockColor + "b0";
        } else {
          return "#dedddc";
        }
      } else {
        return props.data?.blockColor + "b0";
      }
    } else {
      return "rgba(203, 233, 237, 0.69)";
    }
  };

  const fontSize = calculateFont(props.pos.options?.fontSize);
  const fontColor = props.pos.options?.fontColor || "black";

  const handleDragging = () => {
    //condition for request signing flow
    if (props.isNeedSign) {
      //enable dragging functionality only if isAlllowModify true on tab that widget and hold 1sec
      if (
        props.isAlllowModify &&
        !props?.assignedWidgetId.includes(props.pos.key) &&
        props.data?.signerObjId === props.signerObjId
      ) {
        return false;
      } else {
        //if 'isAlllowModify' is false then disbale dragging functionality
        return true;
      }
    } else {
      return false;
    }
  };
  return (
    <>
      {/*  Check if a text widget (prefill type) exists. Once the user enters a value and clicks outside or the widget becomes non-selectable, it should appear as plain text (just like embedded text in a document). When the user clicks on the text again, it should become editable. */}
      {props.pos?.options?.response &&
      props.pos.key !== props?.currWidgetsDetails?.key &&
      props.pos.type === textWidget ? (
        <span
          onClick={() => {
            props.setCurrWidgetsDetails &&
              props.setCurrWidgetsDetails(props.pos);
          }}
          style={{
            fontFamily: "Arial, sans-serif",
            position: "absolute",
            left: xPos(props.pos, props.isSignYourself),
            top: yPos(props.pos, props.isSignYourself),
            fontSize: fontSize,
            color: fontColor,
            zIndex: 99
          }}
        >
          {props.pos?.options?.response}
        </span>
      ) : (
        <Rnd
          id={props.pos.key}
          data-tut={props.pos.key === props.unSignedWidgetId ? "IsSigned" : ""}
          key={props.pos.key}
          cancel=".cell-size-handle, .icon"
          lockAspectRatio={
            props?.isAlllowModify &&
            !props?.assignedWidgetId.includes(props.pos.key)
              ? false
              : !props.isFreeResize &&
                (props.pos.Width
                  ? props.pos.Width / props.pos.Height
                  : defaultWidthHeight(props.pos.type).width /
                    defaultWidthHeight(props.pos.type).height)
          }
          enableResizing={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight:
              props.data && props.isNeedSign
                ? props.data?.signerObjId === props.signerObjId &&
                  props.pos.type !== "checkbox" &&
                  props.pos.type !== radioButtonWidget
                  ? true
                  : false
                : props.pos.type !== radioButtonWidget &&
                  props.pos.type !== "checkbox" &&
                  props.pos.key === props?.currWidgetsDetails?.key &&
                  true,
            bottomLeft: false,
            topLeft: false
          }}
          bounds="parent"
          className="signYourselfBlock"
          style={{
            border: "1px solid #007bff",
            borderRadius: "2px",
            cursor: getCursor(),
            zIndex:
              props.pos.type === "date"
                ? props.pos.key === props?.currWidgetsDetails?.key
                  ? 99 + 1
                  : 99
                : props?.pos?.zIndex
                  ? props.pos.zIndex
                  : "5",
            opacity:
              props.isNeedSign && props.data?.Id !== props?.uniqueId && "0.4",
            background: handleBackground()
          }}
          onDrag={() => {
            props.handleTabDrag && props.handleTabDrag(props.pos.key);
          }}
          size={{
            width:
              props.pos.type === radioButtonWidget ||
              props.pos.type === "checkbox"
                ? "auto"
                : props.posWidth(props.pos, props.isSignYourself),
            height:
              props.pos.type === radioButtonWidget ||
              props.pos.type === "checkbox"
                ? "auto"
                : props.posHeight(props.pos, props.isSignYourself)
          }}
          minHeight={
            props.pos.type === cellsWidget
              ? calculateFont(props.pos.options?.fontSize, true)
              : props.pos.type !== "checkbox" &&
                calculateFont(props.pos.options?.fontSize, true)
          }
          maxHeight="auto"
          onResizeStart={() => {
            props.setIsResize && props.setIsResize(true);
          }}
          onResizeStop={(e, direction, ref) => {
            setTimeout(() => {
              props.setIsResize && props.setIsResize(false);
            }, 50);
            props.handleSignYourselfImageResize &&
              props.handleSignYourselfImageResize(
                ref,
                props.pos.key,
                props.xyPosition,
                props.setXyPosition,
                props.index,
                containerScale,
                props.scale,
                props.data && props.data.Id,
                props.isResize
              );
          }}
          onDragStop={(event, dragElement) => {
            props.handleStop &&
              props.handleStop(
                event,
                dragElement,
                props.data?.Id,
                props.pos?.key
              );
          }}
          position={{
            x: xPos(props.pos, props.isSignYourself),
            y: yPos(props.pos, props.isSignYourself)
          }}
          disableDragging={handleDragging()}
        >
          {props.pos.key === props?.currWidgetsDetails?.key &&
          ((props.isShowBorder &&
            ![radioButtonWidget, "checkbox"].includes(props.pos.type)) ||
            (props?.isAlllowModify &&
              !props?.assignedWidgetId.includes(props.pos.key))) ? (
            <BorderResize
              right={-12}
              top={-11}
              pos={props.pos}
              posHeight={props.posHeight}
              isSignYourself={props.isSignYourself || props.isSelfSign}
            />
          ) : props.data &&
            props.isNeedSign &&
            props.pos.type !== "checkbox" ? (
            props.data?.signerObjId === props.signerObjId &&
            ![radioButtonWidget, "checkbox"].includes(props.pos.type) ? (
              <BorderResize
                posHeight={props.posHeight}
                isSignYourself={props.isSignYourself || props.isSelfSign}
                pos={props.pos}
              />
            ) : (
              <></>
            )
          ) : (
            ![radioButtonWidget, "checkbox"].includes(props.pos.type) &&
            props.pos.key === props?.currWidgetsDetails?.key && <BorderResize />
          )}

          {/* 1- Show a border if props.pos.key === props?.currWidgetsDetails?.key, indicating the current user's selected widget.
              2- If props.isShowBorder is true, display border for all widgets. 
              3- Use the combination of props?.isAlllowModify and !props?.assignedWidgetId.includes(props.pos.key) to determine when to show border:
                3.1- When isAlllowModify is true, show border.
                3.2- Do not display border for widgets already assigned (props.assignedWidgetId.includes(props.pos.key) is true). 
            */}
          {props.pos.key === props?.currWidgetsDetails?.key &&
            (props.isShowBorder ||
              (props?.isAlllowModify &&
                !props?.assignedWidgetId.includes(props.pos.key))) && (
              <div
                style={{ borderColor: themeColor }}
                className="w-[calc(100%+21px)] h-[calc(100%+21px)] cursor-move absolute inline-block border-[1px] border-dashed"
              ></div>
            )}
          <div
            className="flex items-stretch justify-center"
            style={{
              left: xPos(props.pos, props.isSignYourself),
              top: yPos(props.pos, props.isSignYourself),
              width: "100%",
              height: "100%",
              zIndex: "10"
            }}
            onTouchEnd={() => handleOnClickPlaceholder()}
            onClick={() => handleOnClickPlaceholder()}
          >
            {props.pos.key === props?.currWidgetsDetails?.key && (
              <PlaceholderIcon />
            )}
            <PlaceholderType
              pos={props.pos}
              xyPosition={props.xyPosition}
              index={props.index}
              setXyPosition={props.setXyPosition}
              data={props.data}
              isShowDropdown={props?.isShowDropdown}
              isPlaceholder={props.isPlaceholder}
              isSignYourself={props.isSignYourself}
              isSelfSign={props.isSelfSign}
              signerObjId={props.signerObjId}
              calculateFontsize={props.calculateFontsize}
              pdfDetails={props?.pdfDetails && props?.pdfDetails[0]}
              isNeedSign={props.isNeedSign}
              setSelectDate={setSelectDate}
              selectDate={selectDate}
              startDate={startDate}
              handleSaveDate={handleSaveDate}
              xPos={props.xPos}
              calculateFont={calculateFont}
              setCellCount={setCellCount}
            />
          </div>
        </Rnd>
      )}

      <ModalUi isOpen={isDateModal} title={t("widget-info")} showClose={false}>
        <div className="text-base-content h-[100%] p-[20px]">
          <div className="flex flex-col md:flex-row md:items-center gap-y-3">
            <div className="flex flex-row items-center gap-x-1">
              <span className="capitalize">{t("format")} :</span>
              <select
                className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
                defaultValue={""}
                onChange={(e) => {
                  const selectedIndex = e.target.value;
                  e.stopPropagation();
                  setSelectDate(dateFormat[selectedIndex]);
                }}
              >
                <option value="" disabled>
                  {t("select-date-format")}
                </option>
                {dateFormat.map((data, ind) => {
                  return (
                    <option className="text-[13px]" value={ind} key={ind}>
                      {data?.date ? data?.date : "nodata"}
                    </option>
                  );
                })}
              </select>
            </div>
            <span className="text-xs text-gray-400 ml-1">
              {selectDate.format}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0 gap-x-2 mt-3">
            <div className="flex flex-row items-center">
              <span className="capitalize">{t("font-size")} :</span>
              <select
                className="ml-[3px] md:ml:[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
                value={props.fontSize || clickonWidget.options?.fontSize || 12}
                onChange={(e) => props.setFontSize(parseInt(e.target.value))}
              >
                {fontsizeArr.map((size, ind) => (
                  <option className="text-[13px]" value={size} key={ind}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <span className="capitalize">{t("color")} :</span>
              <select
                value={
                  props.fontColor || clickonWidget.options?.fontColor || "black"
                }
                onChange={(e) => props.setFontColor(e.target.value)}
                className="ml-[4px] md:ml[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              >
                {fontColorArr.map((color, ind) => (
                  <option value={color} key={ind}>
                    {t(`color-type.${color}`)}
                  </option>
                ))}
              </select>
              <span
                style={{
                  background:
                    props.fontColor || props.pos.options?.fontColor || "black"
                }}
                className="w-5 h-[19px] ml-1"
              ></span>
            </div>
          </div>
          {props?.isPlaceholder && (
            <div className="flex items-center mt-3">
              <input
                id="isReadOnly"
                name="isReadOnly"
                type="checkbox"
                checked={
                  isDateReadOnly || props.pos.options?.isReadOnly || false
                }
                className="op-checkbox op-checkbox-xs"
                onChange={() => setIsDateReadOnly(!isDateReadOnly)}
              />
              <label
                className="ml-1.5 mb-0 capitalize text-[13px]"
                htmlFor="isreadonly"
              >
                {t("read-only")}
              </label>
            </div>
          )}
          <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
          <button
            type="button"
            className="op-btn op-btn-primary"
            onClick={() => {
              setIsDateModal(false);
              handleSaveDate(selectDate);
              props.setFontColor("");
              props.setFontSize("");
            }}
          >
            {t("save")}
          </button>
        </div>
      </ModalUi>
    </>
  );
}

export default Placeholder;
