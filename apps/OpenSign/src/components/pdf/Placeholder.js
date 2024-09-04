import React, { useState, useEffect } from "react";
import BorderResize from "./BorderResize";
import PlaceholderBorder from "./PlaceholderBorder";
import { Rnd } from "react-rnd";
import {
  defaultWidthHeight,
  fontColorArr,
  fontsizeArr,
  getContainerScale,
  handleCopyNextToWidget,
  isTabAndMobile,
  onChangeInput,
  radioButtonWidget,
  textInputWidget,
  textWidget
} from "../../constant/Utils";
import PlaceholderType from "./PlaceholderType";
import moment from "moment";
import "../../styles/opensigndrive.css";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";

const selectFormat = (data) => {
  switch (data) {
    case "L":
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
    case "DD MMMM, YYYY":
      return "dd MMMM, yyyy";
    default:
      return "MM/dd/yyyy";
  }
};

const changeDateToMomentFormat = (format) => {
  switch (format) {
    case "MM/dd/yyyy":
      return "L";
    case "dd-MM-yyyy":
      return "DD-MM-YYYY";
    case "dd/MM/yyyy":
      return "DD/MM/YYYY";
    case "MMMM dd, yyyy":
      return "LL";
    case "dd MMM, yyyy":
      return "DD MMM, YYYY";
    case "yyyy-MM-dd":
      return "YYYY-MM-DD";
    case "MM-dd-yyyy":
      return "MM-DD-YYYY";
    case "MM.dd.yyyy":
      return "MM.DD.YYYY";
    case "MMM dd, yyyy":
      return "MMM DD, YYYY";
    case "dd MMMM, yyyy":
      return "DD MMMM, YYYY";
    default:
      return "L";
  }
};

//function to get default date
const getDefaultdate = (selectedDate, format = "dd-MM-yyyy") => {
  let date;
  if (format && format === "dd-MM-yyyy") {
    const newdate = selectedDate
      ? selectedDate
      : moment(new Date()).format(changeDateToMomentFormat(format));
    const [day, month, year] = newdate.split("-");
    date = new Date(`${year}-${month}-${day}`);
  } else {
    date = new Date(selectedDate);
  }
  const value = date;
  return value;
};
//function to get default format
const getDefaultFormat = (dateFormat) => dateFormat || "MM/dd/yyyy";

function Placeholder(props) {
  const { t } = useTranslation();
  const [placeholderBorder, setPlaceholderBorder] = useState({ w: 0, h: 0 });
  const [isDraggingEnabled, setDraggingEnabled] = useState(true);
  const [isDateModal, setIsDateModal] = useState(false);
  const [containerScale, setContainerScale] = useState();
  const [selectDate, setSelectDate] = useState({
    date:
      props.pos.type === "date"
        ? moment(
            getDefaultdate(
              props?.pos?.options?.response,
              props.pos?.options?.validation?.format
            ).getTime()
          ).format(
            changeDateToMomentFormat(props.pos?.options?.validation?.format)
          )
        : "",
    format:
      props.pos.type === "date"
        ? getDefaultFormat(props.pos?.options?.validation?.format)
        : ""
  });
  const [dateFormat, setDateFormat] = useState([]);
  const [clickonWidget, setClickonWidget] = useState({});
  const [startDate, setStartDate] = useState(
    props.pos.type === "date" &&
      getDefaultdate(
        props?.pos?.options?.response,
        props.pos?.options?.validation?.format
      )
  );
  const [getCheckboxRenderWidth, setGetCheckboxRenderWidth] = useState({
    width: null,
    height: null
  });

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
    const updateWidth = () => {
      const rndElement = document.getElementById(props.pos.key);
      if (rndElement) {
        const { width, height } = rndElement.getBoundingClientRect();
        setGetCheckboxRenderWidth({ width: width, height: height });
      }
    };

    // Delay to ensure rendering is complete
    const timer = setTimeout(updateWidth, 0);

    return () => clearTimeout(timer);
  }, [props.pos]);

  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (!isDraggingEnabled && !e.target.closest("#changeIsDragging")) {
        setDraggingEnabled(true);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isDraggingEnabled]);
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
    if (props.isPlaceholder || props.isSignYourself) {
      selectDate && changeDateFormat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectDate]);

  //`handleWidgetIdandPopup` is used to set current widget id and open relative popup
  const handleWidgetIdandPopup = () => {
    if (props.setSelectWidgetId) {
      props.setSelectWidgetId(props.pos.key);
    }

    const widgetTypeExist = [
      textInputWidget,
      "checkbox",
      "name",
      "company",
      "job title",
      "date",
      "email",
      textWidget
    ].includes(props.pos.type);

    if (widgetTypeExist) {
      setDraggingEnabled(false);
    }
    if ((props.isNeedSign || props.isSignYourself) && !props.isDragging) {
      if (props?.ispublicTemplate) {
        props.handleUserDetails();
      } else {
        if (props.pos.type) {
          if (
            props.pos.type === "signature" ||
            props.pos.type === "stamp" ||
            props.pos.type === "image"
          ) {
            props.setIsSignPad(true);
            props.setSignKey(props.pos.key);
            props.setIsStamp(props.pos.isStamp);
          } else if (props.pos.type === "initials") {
            props.setIsSignPad(true);
            props.setSignKey(props.pos.key);
            props.setIsStamp(props.pos.isStamp);
            props.setIsInitial(true);
          }
        } else {
          props.setIsSignPad(true);
          props.setSignKey(props.pos.key);
          props.setIsStamp(props.pos?.isStamp ? props.pos.isStamp : false);
        }
      }
    } else if (
      props.isPlaceholder &&
      !props.isDragging &&
      props.pos.type !== textWidget
    ) {
      if (props.pos.key === props.selectWidgetId) {
        props.handleLinkUser(props.data.Id);
        props.setUniqueId(props.data.Id);
        const checkIndex = props.xyPostion.findIndex(
          (data) => data.Id === props.data.Id
        );
        props.setIsSelectId(checkIndex || 0);
      }
    } else if (!props.pos.type) {
      if (
        !props.pos.type &&
        props.isNeedSign &&
        props.data.signerObjId === props.signerObjId
      ) {
        props.setIsSignPad(true);
        props.setSignKey(props.pos.key);
        props.setIsStamp(props.pos.isStamp);
      } else if (
        (props.isNeedSign && props.pos.type === "signature") ||
        props.pos.type === "stamp"
      ) {
        props.setIsSignPad(true);
        props.setSignKey(props.pos.key);
        props.setIsStamp(props.pos.isStamp);
      } else if (props.isNeedSign && props.pos.type === "dropdown") {
        props.setSignKey(props.pos.key);
      }
    }
  };
  const handleOnClickPlaceholder = () => {
    props.setCurrWidgetsDetails && props.setCurrWidgetsDetails(props.pos);
    if (!props.isNeedSign) {
      props.setWidgetType(props.pos.type);
    }
    if (props.isNeedSign && props.data?.signerObjId === props.signerObjId) {
      handleWidgetIdandPopup();
    } else if (
      props?.isNeedSign &&
      props?.uniqueId &&
      props.data?.Id === props?.uniqueId
    ) {
      handleWidgetIdandPopup();
    } else if (props.isPlaceholder || props.isSignYourself) {
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
      props.isSignYourself
    ) {
      props.handleTextSettingModal(true);
    } else {
      props?.handleNameModal && props?.handleNameModal(true);
    }

    //condition for only placeholder and template flow
    if (props.data && props?.pos?.type !== textWidget) {
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPostion.findIndex(
        (data) => data.Id === props.data.Id
      );

      props.setIsSelectId(checkIndex || 0);
    }
    //condition to handle in placeholder and template flow for text widget signerId for text widgets i have to set uniqueId in tempSignerId because
    //it does not have any signer user and any signerobjId
    else if (props.data && props.pos.type === textWidget) {
      props.setTempSignerId(props.uniqueId);
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPostion.findIndex(
        (data) => data.Id === props.data.Id
      );
      props.setIsSelectId(checkIndex || 0);
    }
    props.setSignKey(props.pos.key);
    props.setWidgetType(props.pos.type);
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
      const checkIndex = props.xyPostion.findIndex(
        (data) => data.Id === props.data.Id
      );

      props.setIsSelectId(checkIndex || 0);
    } else if (props.data && props.pos.type === textWidget) {
      props.setTempSignerId(props.uniqueId);
      props.setUniqueId(props?.data?.Id);
      const checkIndex = props.xyPostion.findIndex(
        (data) => data.Id === props.data.Id
      );
      props.setIsSelectId(checkIndex || 0);
    }

    //checking widget's type and open widget copy modal for required widgets
    if (
      ["signature", textWidget, "stamp", "initial"].includes(props.pos.type)
    ) {
      props.setIsPageCopy(true);
      props.setSignKey(props.pos.key);
    } else {
      //function to create new widget next to just widget
      handleCopyNextToWidget(
        props.pos,
        props.pos.type,
        props.xyPostion,
        props.index,
        props.setXyPostion,
        props.data && props.data?.Id
      );
    }
  };

  //function to save date and format on local array onchange date and onclick format
  const handleSaveDate = (data, isDateChange) => {
    let updateDate = data.date;
    //check if date change by user
    if (isDateChange) {
      //`changeDateToMomentFormat` is used to convert date as per required to moment package
      updateDate = moment(data.date).format(
        changeDateToMomentFormat(data.format)
      );
    }
    //using moment package is used to change date as per the format provided in selectDate obj e.g. - MM/dd/yyyy -> 03/12/2024
    //`getDefaultdate` is used to convert update date in new Date() format
    const date = moment(
      getDefaultdate(updateDate, data?.format).getTime()
    ).format(changeDateToMomentFormat(data?.format));

    //`onChangeInput` is used to save data related to date in a placeholder field
    onChangeInput(
      date,
      props.pos.key,
      props.xyPostion,
      props.index,
      props.setXyPostion,
      props.data && props.data.Id,
      false,
      data?.format,
      null,
      null,
      props.fontSize || props.pos?.options?.fontSize || "12",
      props.fontColor || props.pos?.options?.fontColor || "black"
    );
    setSelectDate({ date: date, format: data?.format });
  };
  const PlaceholderIcon = () => {
    return (
      props.isShowBorder && (
        <>
          {(props.isPlaceholder || props.isSignYourself) && (
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
                "email"
              ].includes(props.pos.type) && props.isSignYourself ? (
                <i
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
                    top: "-19px"
                  }}
                ></i>
              ) : (
                /* condition to add setting icon for placeholder & template flow for all widgets except signature and date */
                ((!props?.pos?.type && props.pos.isStamp) ||
                  (props?.pos?.type &&
                    !["date", "signature"].includes(props.pos.type) &&
                    !props.isSignYourself)) && (
                  <i
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
                      right: props?.pos?.type === textWidget ? "32px" : "47px",
                      top: "-19px"
                    }}
                  ></i>
                )
              )}
              {/* condition for usericon for all widgets except text widgets and signyour-self flow */}
              {props.pos.type !== textWidget && !props.isSignYourself && (
                <i
                  data-tut="assignSigner"
                  className="fa-light fa-user icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleLinkUser(props.data.Id);
                    props.setUniqueId(props.data.Id);
                    const checkIndex = props.xyPostion.findIndex(
                      (data) => data.Id === props.data.Id
                    );
                    props.setIsSelectId(checkIndex || 0);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    props.handleLinkUser(props.data.Id);
                    props.setUniqueId(props.data.Id);
                    const checkIndex = props.xyPostion.findIndex(
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
              onClick={(e) => {
                props.setCurrWidgetsDetails(props.pos);
                setIsDateModal(!isDateModal);
                e.stopPropagation();
                setClickonWidget(props.pos);
                if (props.data) {
                  props.setSignKey(props.pos.key);
                  props.setUniqueId(props.data.Id);
                  const checkIndex = props.xyPostion.findIndex(
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
                  props.setSignKey(props.pos.key);
                  props.setUniqueId(props.data.Id);
                  const checkIndex = props.xyPostion.findIndex(
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
                fontSize: "14px"
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
                props.setIsStamp(false);
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
                props.setIsStamp(false);
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
      return "all-scroll";
    }
  };

  return (
    <>
      <Rnd
        id={props.pos.key}
        data-tut={props.pos.key === props.unSignedWidgetId ? "IsSigned" : ""}
        key={props.pos.key}
        lockAspectRatio={
          ![
            textWidget,
            "email",
            "name",
            "company",
            "job title",
            textInputWidget
          ].includes(props.pos.type) &&
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
                props.pos.key === props.selectWidgetId &&
                true,
          bottomLeft: false,
          topLeft: false
        }}
        bounds="parent"
        className="signYourselfBlock"
        style={{
          border: "1px solid #007bff",
          borderRadius: "2px",
          textAlign:
            props.pos.type !== "name" &&
            props.pos.type !== "company" &&
            props.pos.type !== "job title" &&
            "center",
          cursor: getCursor(),
          zIndex:
            props.pos.type === "date"
              ? props.pos.key === props.selectWidgetId
                ? 99 + 1
                : 99
              : props?.pos?.zIndex
                ? props.pos.zIndex
                : "5",
          background: props.data ? props.data.blockColor : "rgb(203 233 237)"
        }}
        onDrag={() => {
          setDraggingEnabled(true);
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
        onResizeStart={() => {
          setDraggingEnabled(true);
          props.setIsResize && props.setIsResize(true);
        }}
        onResizeStop={(e, direction, ref) => {
          props.setIsResize && props.setIsResize(false);
          props.handleSignYourselfImageResize &&
            props.handleSignYourselfImageResize(
              ref,
              props.pos.key,
              props.xyPostion,
              props.setXyPostion,
              props.index,
              containerScale,
              props.scale,
              props.data && props.data.Id,
              props.isResize
            );
        }}
        disableDragging={
          props.isNeedSign
            ? true
            : props.isPlaceholder && ![textWidget].includes(props.pos.type)
              ? false
              : !isDraggingEnabled
        }
        onDragStop={(event, dragElement) =>
          props.handleStop &&
          props.handleStop(event, dragElement, props.data?.Id, props.pos?.key)
        }
        position={{
          x: xPos(props.pos, props.isSignYourself),
          y: yPos(props.pos, props.isSignYourself)
        }}
        onResize={(e, direction, ref) => {
          setPlaceholderBorder({
            w: ref.offsetWidth / (props.scale * containerScale),
            h: ref.offsetHeight / (props.scale * containerScale)
          });
        }}
        onClick={() => handleOnClickPlaceholder()}
      >
        {props.isShowBorder &&
        props.pos.type !== radioButtonWidget &&
        props.pos.type !== "checkbox" &&
        props.pos.key === props.selectWidgetId ? (
          <BorderResize right={-12} top={-11} />
        ) : props.data && props.isNeedSign && props.pos.type !== "checkbox" ? (
          props.data?.signerObjId === props.signerObjId &&
          props.pos.type !== radioButtonWidget &&
          props.pos.type !== "checkbox" ? (
            <BorderResize />
          ) : (
            <></>
          )
        ) : (
          props.pos.type !== radioButtonWidget &&
          props.pos.type !== "checkbox" &&
          props.pos.key === props.selectWidgetId && <BorderResize />
        )}

        {props.isShowBorder && props.pos.key === props.selectWidgetId && (
          <PlaceholderBorder
            setDraggingEnabled={setDraggingEnabled}
            pos={props.pos}
            isPlaceholder={props.isPlaceholder}
            getCheckboxRenderWidth={getCheckboxRenderWidth}
            scale={props.scale}
            containerScale={containerScale}
            placeholderBorder={placeholderBorder}
          />
        )}
        {isTabAndMobile ? (
          <div
            className="flex items-stretch"
            style={{
              left: xPos(props.pos, props.isSignYourself),
              top: yPos(props.pos, props.isSignYourself),
              width:
                props.pos.type === radioButtonWidget ||
                props.pos.type === "checkbox"
                  ? "auto"
                  : props.posWidth(props.pos, props.isSignYourself),
              height:
                props.pos.type === radioButtonWidget ||
                props.pos.type === "checkbox"
                  ? "auto"
                  : props.posHeight(props.pos, props.isSignYourself),
              zIndex: "10"
            }}
            onTouchEnd={() => handleOnClickPlaceholder()}
            onClick={() => handleOnClickPlaceholder()}
          >
            {props.pos.key === props.selectWidgetId && <PlaceholderIcon />}

            <PlaceholderType
              pos={props.pos}
              xyPostion={props.xyPostion}
              index={props.index}
              setXyPostion={props.setXyPostion}
              data={props.data}
              setSignKey={props.setSignKey}
              isShowDropdown={props?.isShowDropdown}
              isPlaceholder={props.isPlaceholder}
              isSignYourself={props.isSignYourself}
              signerObjId={props.signerObjId}
              handleUserName={props.handleUserName}
              setDraggingEnabled={setDraggingEnabled}
              pdfDetails={props?.pdfDetails && props?.pdfDetails[0]}
              isNeedSign={props.isNeedSign}
              setSelectDate={setSelectDate}
              selectDate={selectDate}
              setValidateAlert={props.setValidateAlert}
              setStartDate={setStartDate}
              startDate={startDate}
              handleSaveDate={handleSaveDate}
              xPos={props.xPos}
            />
          </div>
        ) : (
          <>
            {props.pos.key === props.selectWidgetId && <PlaceholderIcon />}
            <PlaceholderType
              pos={props.pos}
              xyPostion={props.xyPostion}
              index={props.index}
              setXyPostion={props.setXyPostion}
              data={props.data}
              setSignKey={props.setSignKey}
              isShowDropdown={props?.isShowDropdown}
              isPlaceholder={props.isPlaceholder}
              isSignYourself={props.isSignYourself}
              signerObjId={props.signerObjId}
              handleUserName={props.handleUserName}
              setDraggingEnabled={setDraggingEnabled}
              pdfDetails={props?.pdfDetails && props?.pdfDetails[0]}
              isNeedSign={props.isNeedSign}
              setSelectDate={setSelectDate}
              selectDate={selectDate}
              setValidateAlert={props.setValidateAlert}
              setStartDate={setStartDate}
              startDate={startDate}
              handleSaveDate={handleSaveDate}
              xPos={props.xPos}
            />
          </>
        )}
      </Rnd>
      <ModalUi isOpen={isDateModal} title={t("widget-info")} showClose={false}>
        <div className="h-[100%] p-[20px]">
          <div className="flex flex-row items-center">
            <span>{t("format")} : </span>
            <div className="flex">
              <select
                className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
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
          <div className="flex items-center mt-4 md:mt-2">
            <span>{t("font-size")} :</span>
            <select
              className="ml-[3px] md:ml:[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={props.fontSize || clickonWidget.options?.fontSize || "12"}
              onChange={(e) => props.setFontSize(e.target.value)}
            >
              {fontsizeArr.map((size, ind) => {
                return (
                  <option className="text-[13px]" value={size} key={ind}>
                    {size}
                  </option>
                );
              })}
            </select>
            <div className="flex flex-row gap-1 items-center ml-2 md:ml-4 ">
              <span>{t("color")}: </span>
              <select
                value={
                  props.fontColor || clickonWidget.options?.fontColor || "black"
                }
                onChange={(e) => props.setFontColor(e.target.value)}
                className="ml-[4px] md:ml[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              >
                {fontColorArr.map((color, ind) => {
                  return (
                    <option value={color} key={ind}>
                      {t(`color-type.${color}`)}
                    </option>
                  );
                })}
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
