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
  handleHeighlightWidget,
  onChangeInput,
  radioButtonWidget,
  textInputWidget,
  cellsWidget,
  textWidget,
  selectFormat,
  randomId
} from "../../constant/Utils";
import PlaceholderType from "./PlaceholderType";
import moment from "moment";
import "../../styles/opensigndrive.css";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsShowModal,
  setPrefillImg
} from "../../redux/reducers/widgetSlice";
import { themeColor } from "../../constant/const";
import { useGuidelinesContext } from "../../context/GuidelinesContext";

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
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const { showGuidelines } = useGuidelinesContext();
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
    "DD MMMM, YYYY",
    "DD.MM.YYYY",
    "DD/MM/YYYY"
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
      } else if (selectDate && selectDate.format === "dd.MM.yyyy") {
        const [day, month, year] = selectDate.date.split(".");
        date = new Date(`${year}.${month}.${day}`);
      } else if (selectDate && selectDate.format === "dd/MM/yyyy") {
        const [day, month, year] = selectDate.date.split("/");
        date = new Date(`${year}/${month}/${day}`);
      } else {
        date = new Date(selectDate?.date);
      }
      const milliseconds = date.getTime();
      const newDate = moment(milliseconds).format(data);
      const dateObj = { date: newDate, format: selectFormat(data) };
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

  const handleOnClickPlaceholder = async () => {
    props?.setIsReqSignTourDisabled && props?.setIsReqSignTourDisabled(true);
    //'props.isOpenSignPad' variable is used to check flow to open signature pad for finish document
    //request sign, signyourself, selfsign,public-sign, kiosk mode
    if (
      props.isOpenSignPad &&
      !props.isDragging &&
      !props.pos.options?.isReadOnly &&
      props?.data?.Role !== "prefill" &&
      props.data?.Id === props.uniqueId
    ) {
      props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
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
    }
    //placeholder, template flow
    else if (props.isPlaceholder && !props.isDragging) {
      props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
      if (
        props.pos.key === props?.currWidgetsDetails?.key &&
        props?.data?.Role !== "prefill"
      ) {
        props.handleLinkUser(props.data.Id);
        props.setUniqueId(props.data.Id);
        const checkIndex = props.xyPosition.findIndex(
          (data) => data.Id === props.data.Id
        );
        props.setIsSelectId(checkIndex || 0);
      } else if (props?.data?.Role === "prefill") {
        dispatch(setIsShowModal({ [props.pos.key]: true }));
        props.setUniqueId(props?.data?.Id);
        props?.setRoleName("prefill");
      }
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
    if (props.data && props?.data?.Role !== "prefill") {
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPosition
        .filter((data) => data?.Role !== "prefill")
        .findIndex((data) => data.Id === props.data.Id);
      props.setIsSelectId && props.setIsSelectId(checkIndex || 0);
    } else if (
      !props.isSelfSign &&
      props.data &&
      props.pos.type === "prefill"
    ) {
      props.setUniqueId(props?.data?.Id);
    }
    props.setCurrWidgetsDetails(props.pos);
  };
  //function to set required state value onclick on widget's copy icon
  const handleCopyPlaceholder = (e) => {
    e.stopPropagation();
    //condition to handle text widget signer obj id and unique id
    //when user click on copy icon of text widget in that condition text widget does not have any signerObjId
    if (props.data && props?.data?.Role !== "prefill") {
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPosition
        .filter((data) => data?.Role !== "prefill")
        .findIndex((data) => data.Id === props.data.Id);
      props.setIsSelectId && props.setIsSelectId(checkIndex || 0);
    } else if (
      !props.isSelfSign &&
      props.data &&
      props.pos.type === "prefill"
    ) {
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
      const newId = randomId();
      //function to create new widget next to just widget
      handleCopyNextToWidget(
        newId,
        props.pos,
        props.xyPosition,
        props.index,
        props.setXyPosition,
        props.data && props.data?.Id
      );
      //condiiton is used to store copied prefill image base64 url in redux for display image
      if (props?.data?.Role === "prefill") {
        const getPrefillImg = prefillImg?.find((x) => x.id === props.pos.key);
        dispatch(
          setPrefillImg({
            id: newId,
            base64: getPrefillImg?.base64
          })
        );
      }
    }
  };

  //function to save date and format on local array onchange date and onclick format
  const handleSaveDate = (data, isDateChange) => {
    const isSpecialDateFormat =
      data?.format &&
      ["dd-MM-yyyy", "dd.MM.yyyy", "dd/MM/yyyy"].includes(data?.format);
    let updateDate = data.date;
    let date;
    if (isSpecialDateFormat) {
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
      props.pos,
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
                  className="fa-light fa-gear icon text-[#188ae2] right-[29px] -top-[19px] z-[99] pointer-events-auto"
                ></i>
              ) : (
                /* condition to add setting icon for placeholder & template flow for all widgets except signature and date */
                !props.isSignYourself &&
                !props.isSelfSign &&
                props?.pos?.type &&
                !["date"].includes(props.pos.type) && (
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
                    className="fa-light fa-gear icon text-[#188ae2] -top-[19px] z-[99] pointer-events-auto"
                    style={{
                      right: props?.data?.Role === "prefill" ? "32px" : "51px"
                    }}
                  ></i>
                )
              )}
              {/* condition for usericon to display for all widgets except prefill widgets, signyour-self and self-sign flow */}
              {!props.isSignYourself &&
                !props.isSelfSign &&
                props?.data?.Role !== "prefill" && (
                  <i
                    data-tut="assignSigner"
                    className="fa-light fa-user icon text-[#188ae2] right-[32px] -top-[18px]"
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
                right:
                  props.isPlaceholder && props?.data?.Role !== "prefill"
                    ? "50px"
                    : "30px"
              }}
              className="fa-light fa-gear icon text-[#188ae2] text-[14px] z-[99] -top-[18px] pointer-events-auto"
            ></i>
          )}
          {/* copy icon for all widgets */}
          <i
            className="fa-light fa-copy icon text-[#188ae2] right-[12px] -top-[18px] "
            onClick={(e) => handleCopyPlaceholder(e)}
            onTouchEnd={(e) => handleCopyPlaceholder(e)}
          ></i>
          {/* delete icon for all widgets */}
          <i
            className="fa-light fa-circle-xmark icon text-[#188ae2] -right-[8px] -top-[18px] "
            onClick={(e) => {
              e.stopPropagation();
              //condition for template and placeholder flow
              if (props.data) {
                props.handleDeleteWidget(props.pos.key, props.data.Id);
              }
              //condition for signyour-self flow
              else {
                props.handleDeleteWidget(props.pos.key);
              }
            }}
            //for mobile and tablet touch event
            onTouchEnd={(e) => {
              e.stopPropagation();
              //condition for template and placeholder flow
              if (props.data) {
                props.handleDeleteWidget(props.pos.key, props.data?.Id);
              }
              //condition for signyour-self flow
              else {
                props.handleDeleteWidget(props.pos.key);
              }
            }}
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
        return resizePos * containerScale * props.scale;
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
      } else {
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
            border: "1.5px solid #007bff",
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
            background:
              props?.data?.Role === "prefill"
                ? "transparent"
                : handleBackground() //handle block color of widget for
          }}
          onDrag={(_, d) => {
            props?.handleTabDrag?.(props.pos.key);
            showGuidelines(
              true,
              d.x,
              d.y,
              d.node.offsetWidth,
              d.node.offsetHeight
            );
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
          onResizeStart={(e, dir, ref) => {
            props?.setIsResize?.(true);
            showGuidelines(
              true,
              xPos(props.pos, props.isSignYourself),
              yPos(props.pos, props.isSignYourself),
              ref.offsetWidth,
              ref.offsetHeight
            );
          }}
          onResize={(e, dir, ref, delta, position) => {
            showGuidelines(
              true,
              position.x,
              position.y,
              ref.offsetWidth,
              ref.offsetHeight
            );
          }}
          onResizeStop={(e, direction, ref) => {
            setTimeout(() => props?.setIsResize?.(false), 50);
            props?.handleSignYourselfImageResize?.(
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
            showGuidelines(false);
          }}
          onDragStop={(event, dragElement) => {
            if (props?.isDragging) {
              showGuidelines(false);
            }
            props?.handleStop?.(
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

          {/* 1- Show a ouline if props.pos.key === props?.currWidgetsDetails?.key, indicating the current user's selected widget.
            2- If props.isShowBorder is true, display ouline for all widgets. 
            3- Use the combination of props?.isAlllowModify and !props?.assignedWidgetId.includes(props.pos.key) to determine when to show ouline:
              3.1- When isAlllowModify is true, show ouline.
              3.2- Do not display ouline for widgets already assigned (props.assignedWidgetId.includes(props.pos.key) is true). 
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
              isAllowModify={
                props.isShowBorder ||
                (props?.isAlllowModify &&
                  !props?.assignedWidgetId.includes(props.pos.key))
              }
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
          {props?.isPlaceholder && props?.data?.Role !== "prefill" && (
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
