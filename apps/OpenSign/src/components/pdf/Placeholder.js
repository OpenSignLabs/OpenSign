import React, { useState, useEffect } from "react";
import BorderResize from "./BorderResize";
import PlaceholderBorder from "./PlaceholderBorder";
import { Rnd } from "react-rnd";
import { defaultWidthHeight, isMobile } from "../../constant/Utils";
import PlaceholderType from "./PlaceholderType";
import moment from "moment";
import "../../styles/opensigndrive.css";

function Placeholder(props) {
  const [isDraggingEnabled, setDraggingEnabled] = useState(true);
  const [isShowDateFormat, setIsShowDateFormat] = useState(false);
  const [selectDate, setSelectDate] = useState();
  const [dateFormat, setDateFormat] = useState([]);
  const [saveDateFormat, setSaveDateFormat] = useState("");
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
        return "dd MMM, YYYY";
      case "YYYY-MM-DD":
        return "YYYY-MM-dd";
      case "MM-DD-YYYY":
        return "MM-dd-YYYY";
      case "MM.DD.YYYY":
        return "MM.dd.YYYY";
      case "MMM DD, YYYY":
        return "MMM dd, YYYY";
      case "DD MMMM, YYYY":
        return "dd MMMM, YYYY";
      default:
        return "dd/MM/yyyy";
    }
  };

  useEffect(() => {
    //set default current date and default format MM/dd/yyyy
    if (props.isSignYourself) {
      const date = new Date();
      const milliseconds = date.getTime();
      const newDate = moment(milliseconds).format("MM/DD/YYYY");
      const dateObj = {
        date: newDate,
        format: "MM/dd/YYYY"
      };
      setSelectDate(dateObj);
    } else {
      const defaultRes = props?.pos?.options?.response;
      const defaultFormat = props.pos?.options?.validation?.format;
      const updateDate = defaultRes
        ? new Date(props?.pos?.options?.response)
        : new Date();
      const dateFormat = defaultFormat ? defaultFormat : "MM/DD/YYYY";
      const milliseconds = updateDate.getTime();
      const newDate = moment(milliseconds).format(dateFormat);
      const dateObj = {
        date: newDate,
        format: props.pos?.options?.validation?.format
          ? props.pos?.options?.validation?.format
          : "MM/dd/YYYY"
      };
      setSelectDate(dateObj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function for add selected date and format in selectFormat
  const changeDateFormat = () => {
    const updateDate = [];
    dateFormatArr.map((data) => {
      let date;
      if (selectDate.format === "dd-MM-yyyy") {
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
  //handle to close drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isShowDateFormat && !e.target.closest("#menu-container")) {
        setIsShowDateFormat(!isShowDateFormat);
      }
    };
    document.addEventListener("click", closeMenuOnOutsideClick);
    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isShowDateFormat]);

  //onclick placeholder function to open signature pad
  const handlePlaceholderClick = () => {
    if (props.setSelectWidgetId) {
      props.setSelectWidgetId(props.pos.key);
    }

    const widgetTypeExist = [
      "text",
      "checkbox",
      "name",
      "company",
      "job title",
      "date",
      "email"
    ].includes(props.pos.type);

    if (widgetTypeExist) {
      setDraggingEnabled(false);
    }
    if ((props.isNeedSign || props.isSignYourself) && !props.isDragging) {
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
    } else if (
      props.isPlaceholder &&
      !props.isDragging &&
      props.pos.type !== "label"
    ) {
      if (props.pos.key === props.selectWidgetId) {
        props.handleLinkUser(props.data.Id);
        props.setUniqueId(props.data.Id);
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

  const handleWidgetsOnclick = () => {
    if (props.pos.type === "radio") {
      props.setIsRadio(true);
    } else if (props.pos.type === "dropdown") {
      props?.setShowDropdown(true);
    } else if (props.pos.type === "checkbox") {
      props?.setIsCheckbox(true);
    } else {
      props?.handleNameModal(true);
    }

    if (props.isPlaceholder) {
      props.setUniqueId(props.data.Id);
    }
    props.setSignKey(props.pos.key);
    props.setWidgetType(props.pos.type);
    props.setCurrWidgetsDetails(props.pos);
  };
  const PlaceholderIcon = () => {
    return (
      props.isShowBorder && (
        <>
          {(props.isPlaceholder || props.isSignYourself) && (
            <>
              {props.pos.type === "checkbox" && props.isSignYourself ? (
                <i
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWidgetsOnclick();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleWidgetsOnclick();
                  }}
                  className="fa-solid fa-gear settingIcon"
                  style={{
                    color: "#188ae2",
                    right: "9px",
                    top: "-28px"
                  }}
                ></i>
              ) : (
                props.pos.type !== "date" &&
                props.pos.type !== "label" &&
                props.pos.type !== "signature" &&
                !props.isSignYourself && (
                  <i
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWidgetsOnclick();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleWidgetsOnclick();
                    }}
                    className="fa-solid fa-gear settingIcon"
                    style={{
                      color: "#188ae2",
                      right: ["checkbox", "radio"].includes(props.pos.type)
                        ? "24px"
                        : "47px",
                      top: ["checkbox", "radio"].includes(props.pos.type)
                        ? "-28px"
                        : "-19px"
                    }}
                  ></i>
                )
              )}

              {props.pos.type !== "label" && !props.isSignYourself && (
                <i
                  data-tut="reactourLinkUser"
                  className="fa-regular fa-user signUserIcon"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleLinkUser(props.data.Id);
                    props.setUniqueId(props.data.Id);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    props.handleLinkUser(props.data.Id);
                    props.setUniqueId(props.data.Id);
                  }}
                  style={{
                    color: "#188ae2",
                    right:
                      props.pos.type === "checkbox" ||
                      props.pos.type === "radio"
                        ? "8px"
                        : "32px",
                    top:
                      props.pos.type === "checkbox" ||
                      props.pos.type === "radio"
                        ? "-28px"
                        : "-18px"
                  }}
                ></i>
              )}
            </>
          )}
          {props.pos.type === "date" && selectDate && (
            <div
              id="menu-container"
              style={{
                zIndex: "99",
                top: "-19px",
                right: props.isPlaceholder ? "60px" : "44px"
              }}
              className={
                isShowDateFormat
                  ? "dropdown signUserIcon show"
                  : "dropdown signUserIcon"
              }
              onClick={(e) => {
                setIsShowDateFormat(!isShowDateFormat);
                e.stopPropagation();
                if (props.data) {
                  props.setSignKey(props.pos.key);
                  props.setUniqueId(props.data.Id);
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                setIsShowDateFormat(!isShowDateFormat);
                if (props.data) {
                  props.setSignKey(props.pos.key);
                  props.setUniqueId(props.data.Id);
                }
              }}
            >
              <i
                className="fa-solid fa-gear settingIcon"
                style={{
                  color: "#188ae2",
                  fontSize: "14px"
                }}
              ></i>
              <div
                className={
                  isShowDateFormat ? "dropdown-menu show" : "dropdown-menu"
                }
                aria-labelledby="dropdownMenuButton"
                aria-expanded={isShowDateFormat ? "true" : "false"}
              >
                {dateFormat.map((data, ind) => {
                  return (
                    <span
                      key={ind}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        setIsShowDateFormat(!isShowDateFormat);
                        setSelectDate(data);
                      }}
                      onClick={() => {
                        setIsShowDateFormat(!isShowDateFormat);
                        setSelectDate(data);
                      }}
                      className="dropdown-item itemColor"
                      style={{ fontSize: "12px" }}
                    >
                      {data?.date ? data?.date : "nodata"}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <i
            className="fa-regular fa-copy signCopy"
            onClick={(e) => {
              if (props.data) {
                props.setSignerObjId(props.data.signerObjId);
                props.setUniqueId(props.data.Id);
              }
              e.stopPropagation();
              props.setIsPageCopy(true);
              props.setSignKey(props.pos.key);
            }}
            onTouchEnd={(e) => {
              if (props.data) {
                props.setSignerObjId(props.data.signerObjId);
                props.setUniqueId(props.data.Id);
              }
              e.stopPropagation();
              props.setIsPageCopy(true);
              props.setSignKey(props.pos.key);
            }}
            style={{
              color: "#188ae2",
              right:
                props.pos.type === "checkbox" || props.pos.type === "radio"
                  ? "-9px"
                  : "12px",
              top:
                props.pos.type === "checkbox" || props.pos.type === "radio"
                  ? "-28px"
                  : "-18px"
            }}
          ></i>
          <i
            className="fa-regular fa-circle-xmark signCloseBtn"
            onClick={(e) => {
              e.stopPropagation();

              if (props.data) {
                props.handleDeleteSign(props.pos.key, props.data.Id);
              } else {
                props.handleDeleteSign(props.pos.key);
                props.setIsStamp(false);
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              if (props.data) {
                props.handleDeleteSign(props.pos.key, props.data?.Id);
              } else {
                props.handleDeleteSign(props.pos.key);
                props.setIsStamp(false);
              }
            }}
            style={{
              color: "#188ae2",
              right:
                props.pos.type === "checkbox" || props.pos.type === "radio"
                  ? "-27px"
                  : "-8px",
              top:
                props.pos.type === "checkbox" || props.pos.type === "radio"
                  ? "-28px"
                  : "-18px"
            }}
          ></i>
        </>
      )
    );
  };

  return (
    <Rnd
      data-tut={props.pos.key === props.unSignedWidgetId ? "IsSigned" : ""}
      //ref={nodeRef}
      key={props.pos.key}
      lockAspectRatio={
        props.pos.type !== "label" &&
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
              props.pos.type !== "radio"
              ? true
              : false
            : props.pos.type !== "radio" &&
              props.pos.type !== "checkbox" &&
              props.pos.key === props.selectWidgetId &&
              true,
        bottomLeft: false,
        topLeft: false
      }}
      bounds="parent"
      className="signYourselfBlock"
      style={{
        border: props.pos.type !== "checkbox" && "1px solid #007bff",
        borderRadius: props.pos.type !== "checkbox" && "2px",
        textAlign:
          props.pos.type !== "name" &&
          props.pos.type !== "company" &&
          props.pos.type !== "job title" &&
          "center",
        cursor:
          props.data && props.isNeedSign
            ? props.data?.signerObjId === props.signerObjId
              ? "pointer"
              : "not-allowed"
            : "all-scroll",
        zIndex:
          props.pos.type === "date"
            ? "99"
            : props?.pos?.zIndex
              ? props.pos.zIndex
              : "5",
        background: props.data
          ? props.data.blockColor
          : props.pos.type !== "checkbox" && "rgb(203 233 237)"
      }}
      onDrag={() => {
        setDraggingEnabled(true);
        props.handleTabDrag && props.handleTabDrag(props.pos.key);
      }}
      size={{
        width: props.posWidth(props.pos, props.isSignYourself),
        height: props.posHeight(props.pos, props.isSignYourself)
      }}
      onResizeStart={() => {
        setDraggingEnabled(true);
        props.setIsResize && props.setIsResize(true);
      }}
      onResizeStop={() => {
        props.setIsResize && props.setIsResize(false);
      }}
      disableDragging={
        props.isNeedSign
          ? true
          : props.isPlaceholder && props.pos.type !== "date"
            ? false
            : !isDraggingEnabled
      }
      onDragStop={(event, dragElement) =>
        props.handleStop &&
        props.handleStop(event, dragElement, props.data?.Id, props.pos?.key)
      }
      default={{
        x: props.xPos(props.pos, props.isSignYourself),
        y: props.yPos(props.pos, props.isSignYourself)
      }}
      onResize={(e, direction, ref) => {
        props.handleSignYourselfImageResize &&
          props.handleSignYourselfImageResize(
            ref,
            props.pos.key,
            props.xyPostion,
            props.setXyPostion,
            props.index,
            props.data && props.data.Id,
            false
          );
      }}
      onClick={() => {
        !props.isNeedSign && props.setWidgetType(props.pos.type);
        props.isNeedSign && props.data?.signerObjId === props.signerObjId
          ? handlePlaceholderClick()
          : props.isPlaceholder
            ? handlePlaceholderClick()
            : props.isSignYourself && handlePlaceholderClick();
      }}
    >
      {props.isShowBorder &&
      props.pos.type !== "radio" &&
      props.pos.type !== "checkbox" &&
      props.pos.key === props.selectWidgetId ? (
        <BorderResize
          right={
            props.pos.type === "checkbox" || props.pos.type === "radio"
              ? -21
              : -12
          }
          top={
            props.pos.type === "checkbox" || props.pos.type === "radio"
              ? -21
              : -11
          }
        />
      ) : props.data && props.isNeedSign && props.pos.type !== "checkbox" ? (
        props.data?.signerObjId === props.signerObjId &&
        props.pos.type !== "radio" &&
        props.pos.type !== "checkbox" ? (
          <BorderResize />
        ) : (
          <></>
        )
      ) : (
        props.pos.type !== "radio" &&
        props.pos.type !== "checkbox" &&
        props.pos.key === props.selectWidgetId && <BorderResize />
      )}

      {props.isShowBorder && props.pos.key === props.selectWidgetId && (
        <PlaceholderBorder
          setDraggingEnabled={setDraggingEnabled}
          pos={props.pos}
          isPlaceholder={props.isPlaceholder}
        />
      )}
      {isMobile ? (
        <div
          style={{
            left: props.xPos(props.pos, props.isSignYourself),
            top: props.yPos(props.pos, props.isSignYourself),
            width: props.posWidth(props.pos, props.isSignYourself),
            // height: props.posHeight(props.pos, props.isSignYourself),
            zIndex: "10"
          }}
          onTouchEnd={() => {
            !props.isNeedSign && props.setWidgetType(props.pos.type);
            props.isNeedSign && props.data?.signerObjId === props.signerObjId
              ? handlePlaceholderClick()
              : props.isPlaceholder
                ? handlePlaceholderClick()
                : props.isSignYourself && handlePlaceholderClick();
          }}
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
            setSaveDateFormat={setSaveDateFormat}
            saveDateFormat={saveDateFormat}
            setValidateAlert={props.setValidateAlert}
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
            setSaveDateFormat={setSaveDateFormat}
            saveDateFormat={saveDateFormat}
            setValidateAlert={props.setValidateAlert}
          />
        </>
      )}
    </Rnd>
  );
}

export default Placeholder;
