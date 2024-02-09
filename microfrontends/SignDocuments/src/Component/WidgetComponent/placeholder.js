import React, { useState, useEffect } from "react";
import BorderResize from "../component/borderResize";
import PlaceholderBorder from "./placeholderBorder";
import { Rnd } from "react-rnd";
import { defaultWidthHeight, isMobile, onChangeInput } from "../../utils/Utils";
import PlaceholderType from "./placeholderType";
import moment from "moment";
import "../LegaDrive/LegaDrive.css";

function Placeholder(props) {
  const [isDraggingEnabled, setDraggingEnabled] = useState(true);
  const [isShowDateFormat, setIsShowDateFormat] = useState(false);
  const [selectDate, setSelectDate] = useState();
  const [dateFormat, setDateFormat] = useState([]);
  const [saveDateFormat, setSaveDateFormat] = useState("");
  const dateFormatArr = [
    "L",
    // "DD/MM/YYYY",
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
    }
  };

  //function for add selected date and format in selectFormat
  const changeDateFormat = () => {
    const updateDate = [];
    dateFormatArr.map((data) => {
      const date = new Date(selectDate?.date);
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
    //set default current date and default format MM/dd/yyyy
    if (props.isPlaceholder || props.isSignYourself) {
      const date = new Date();
      const milliseconds = date.getTime();
      const newDate = moment(milliseconds).format("MM/DD/YYYY");
      const dateObj = {
        date: newDate,
        format: "MM/dd/YYYY"
      };
      setSelectDate(dateObj);
    }
  }, []);
  useEffect(() => {
    if (props.isPlaceholder || props.isSignYourself) {
      selectDate && changeDateFormat();
    }
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
      props.pos.type === "dropdown" &&
      !props.isDragging
    ) {
      props?.setShowDropdown(true);
      props?.setSignKey(props.pos.key);
      props.setUniqueId(props.data.Id);
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

  const PlaceholderIcon = () => {
    return (
      props.isShowBorder && (
        <>
          {props.isPlaceholder && (
            <>
              {[
                "checkbox",
                "text",
                "email",
                "name",
                "company",
                "job title",
                "dropdown",
                "radio"
              ].includes(props.pos.type) && (
                <i
                  onClick={(e) => {
                    e.stopPropagation();
                    if (props.pos.type === "checkbox") {
                      props.setIsCheckboxRequired(true);
                    } else if (props.pos.type === "radio") {
                      props.setIsRadio(true);
                    } else if (props.pos.type === "dropdown") {
                      props?.setShowDropdown(true);
                    } else {
                      props.setIsValidate(true);
                    }

                    props.setSignKey(props.pos.key);
                    props.setUniqueId(props.data.Id);
                    props.setWidgetType(props.pos.type);
                    props.setCurrWidgetsDetails(props.pos);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (props.pos.type === "checkbox") {
                      props.setIsCheckboxRequired(true);
                    }
                    if (props.pos.type === "radio") {
                      props.setIsRadio(true);
                    } else {
                      props.setIsValidate(true);
                    }

                    props.setSignKey(props.pos.key);
                    props.setUniqueId(props.data.Id);
                    props.setWidgetType(props.pos.type);
                    props.setCurrWidgetsDetails(props.pos);
                  }}
                  className="fa-solid fa-gear settingIcon"
                  style={{
                    color: "#188ae2",
                    right:
                      props.pos.type === "text" ||
                      props.pos.type === "email" ||
                      props.pos.type === "name" ||
                      props.pos.type === "company" ||
                      props.pos.type === "job title" ||
                      props.pos.type === "dropdown"
                        ? "49px"
                        : "23px",
                    top:
                      props.pos.type === "text" ||
                      props.pos.type === "email" ||
                      props.pos.type === "name" ||
                      props.pos.type === "company" ||
                      props.pos.type === "job title" ||
                      props.pos.type === "dropdown"
                        ? "-17px"
                        : "-28px"
                  }}
                ></i>
              )}

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
                    props.pos.type === "checkbox" || props.pos.type === "radio"
                      ? "8px"
                      : "32px",
                  top:
                    props.pos.type === "checkbox" || props.pos.type === "radio"
                      ? "-28px"
                      : "-18px"
                }}
              ></i>
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
                props.setSignKey(props.pos.key);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                setIsShowDateFormat(!isShowDateFormat);
                props.setSignKey(props.pos.key);
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

                        // {
                        //   props.isPlaceholder &&
                        //     onChangeInput(
                        //       data.date,
                        //       props.pos.key,
                        //       props.xyPostion,
                        //       props.index,
                        //       props.setXyPostion,
                        //       props.data && props.data.signerObjId,
                        //       false,
                        //       selectDate?.format
                        //         ? selectDate.format
                        //         : "MM/dd/YYYY"
                        //     );
                        // }
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
              }
              e.stopPropagation();
              props.setIsPageCopy(true);
              props.setSignKey(props.pos.key);
            }}
            onTouchEnd={(e) => {
              if (props.data) {
                props.setSignerObjId(props.data.signerObjId);
              }
              e.stopPropagation();
              props.setIsPageCopy(true);
              props.setSignKey(props.pos.key);
            }}
            style={{
              color: "#188ae2",
              right:
                (props.pos.type === "checkbox" || props.pos.type === "radio") &&
                props.isPlaceholder
                  ? "-9px"
                  : "12px",
              top:
                (props.pos.type === "checkbox" || props.pos.type === "radio") &&
                props.isPlaceholder
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
                props.handleDeleteSign(props.pos.key, props.data.Id);
              } else {
                props.handleDeleteSign(props.pos.key);
                props.setIsStamp(false);
              }
            }}
            style={{
              color: "#188ae2",
              right:
                (props.pos.type === "checkbox" || props.pos.type === "radio") &&
                props.isPlaceholder
                  ? "-27px"
                  : "-8px",
              top:
                (props.pos.type === "checkbox" || props.pos.type === "radio") &&
                props.isPlaceholder
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
      //   ref={nodeRef}
      key={props.pos.key}
      lockAspectRatio={
        props.pos.Width
          ? props.pos.Width / props.pos.Height
          : defaultWidthHeight(props.pos.type).width /
            defaultWidthHeight(props.pos.type).height
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
              props.pos.type !== "radio"
              ? true
              : false
            : props.pos.type !== "radio" && true,
        bottomLeft: false,
        topLeft: false
      }}
      bounds="parent"
      className="signYourselfBlock"
      style={{
        // borderRadius:"50%",
        // display:"flex",
        // alignItem:"center",
        border: "1px solid #007bff",
        borderRadius: "2px",
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
        zIndex: "1",
        background: props.data ? props.data.blockColor : "rgb(203 233 237)"
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
        props.handleStop(event, dragElement, props.signerObjId, props.pos.key)
      }
      default={{
        x: props.xPos(props.pos, props.isSignYourself),
        y: props.yPos(props.pos, props.isSignYourself)
      }}
      onResize={(e, direction, ref, delta, position) => {
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
        props.isNeedSign && props.data?.signerObjId === props.signerObjId
          ? handlePlaceholderClick()
          : props.isPlaceholder
            ? handlePlaceholderClick()
            : props.isSignYourself && handlePlaceholderClick();
      }}
    >
      {props.isShowBorder && props.pos.type !== "radio" ? (
        <BorderResize
          right={
            (props.pos.type === "checkbox" || props.pos.type === "radio") &&
            props.isPlaceholder
              ? -21
              : -12
          }
          top={
            (props.pos.type === "checkbox" || props.pos.type === "radio") &&
            props.isPlaceholder
              ? -21
              : -11
          }
        />
      ) : props.data && props.isNeedSign ? (
        props.data?.signerObjId === props.signerObjId &&
        props.pos.type !== "radio" ? (
          <BorderResize />
        ) : (
          <></>
        )
      ) : (
        props.pos.type !== "radio" && <BorderResize />
      )}

      {props.isShowBorder && (
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
            height: props.posHeight(props.pos, props.isSignYourself),
            zIndex: "10"
          }}
          onTouchEnd={(e) => {
            props.isNeedSign && props.data?.signerObjId === props.signerObjId
              ? handlePlaceholderClick()
              : props.isPlaceholder
                ? handlePlaceholderClick()
                : props.isSignYourself && handlePlaceholderClick();
          }}
        >
          <PlaceholderIcon />
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
          <PlaceholderIcon />

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
