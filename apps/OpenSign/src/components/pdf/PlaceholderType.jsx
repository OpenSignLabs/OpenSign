import React, { useEffect, useState, forwardRef, useRef } from "react";
import {
  getMonth,
  getYear,
  radioButtonWidget,
  textInputWidget,
  textWidget,
  months,
  years,
  selectCheckbox,
  checkRegularExpress
} from "../../constant/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
const textWidgetCls =
  "w-full h-full md:min-w-full md:min-h-full z-[999] text-[12px] rounded-[2px] border-[1px] border-[#007bff] overflow-hidden resize-none outline-none text-base-content item-center whitespace-pre-wrap bg-white";
const selectWidgetCls =
  "w-full h-full absolute left-0 top-0 border-[1px] border-[#007bff] rounded-[2px] focus:outline-none text-base-content";
const widgetCls =
  "select-none-cls overflow-hidden w-full h-full text-black flex flex-col justify-center items-center";
function PlaceholderType(props) {
  const { t } = useTranslation();
  const type = props?.pos?.type;
  const iswidgetEnable =
    props.isSignYourself ||
    ((props.isSelfSign || props.isNeedSign) &&
      props.data?.signerObjId === props.signerObjId);
  const widgetData =
    props.pos?.options?.defaultValue || props.pos?.options?.response;
  const widgetTypeTranslation = t(`widgets-name.${props?.pos?.type}`);
  const inputRef = useRef(null);
  const [widgetValue, setwidgetValue] = useState();
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const [hint, setHint] = useState("");
  const fontSize = props.calculateFont(props.pos.options?.fontSize);
  const fontColor = props.pos.options?.fontColor || "black";
  const textWidgetStyle = {
    fontSize: fontSize,
    color: fontColor,
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
    textAlign: "start",
    width: "100%",
    display: "flex",
    height: "100%"
  };

  useEffect(() => {
    if (type !== "date") {
      if (type && type === "checkbox") {
        setSelectedCheckbox(
          props?.pos?.options?.response ||
            props?.pos?.options?.defaultValue ||
            []
        );
      } else {
        if (widgetData) {
          setwidgetValue(widgetData);
        }
      }
      if (props.pos?.options?.hint) {
        setHint(props.pos?.options.hint);
      } else if (props.pos?.options?.validation?.type) {
        checkRegularExpress(props.pos?.options?.validation?.type, setHint);
      } else {
        setHint(props.pos?.type);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pos]);
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{
        fontSize: fontSize,
        color: fontColor,
        fontFamily: "Arial, sans-serif"
      }}
      className={`${selectWidgetCls} overflow-hidden`}
      onClick={onClick}
      ref={ref}
    >
      {value}
      <i className="fa-light fa-calendar ml-[5px]"></i>
    </div>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";

  const handleRadioCheck = (data) => {
    const defaultData = props.pos.options?.defaultValue;
    if (widgetValue === data) {
      return true;
    } else if (defaultData === data) {
      return true;
    } else {
      return false;
    }
  };

  switch (type) {
    case "signature":
      return props.pos.SignUrl ? (
        <img
          alt="signature"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full select-none-cls "
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium"
            >
              {hint || widgetTypeTranslation}
            </div>
          )}
        </div>
      );
    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="stamp"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full select-none-cls"
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium"
            >
              {hint || widgetTypeTranslation}
            </div>
          )}
        </div>
      );
    case "checkbox":
      return (
        <div style={{ zIndex: props.isSignYourself && "99" }}>
          {props.pos.options?.values?.map((data, ind) => {
            return (
              <div key={ind} className="select-none-cls pointer-events-none">
                <label
                  htmlFor={`checkbox-${props.pos.key + ind}`}
                  style={{ fontSize: fontSize, color: fontColor }}
                  className={`mb-0 flex items-center gap-1 ${
                    ind > 0 ? "mt-[3px]" : "mt-[0px]"
                  }`}
                >
                  <input
                    id={`checkbox-${props.pos.key + ind}`}
                    style={{
                      width: fontSize,
                      height: fontSize
                    }}
                    className="op-checkbox rounded-[1px]"
                    disabled={
                      props.isNeedSign &&
                      (props.pos.options?.isReadOnly ||
                        props.data?.signerObjId !== props.signerObjId)
                    }
                    type="checkbox"
                    readOnly
                    checked={!!selectCheckbox(ind, selectedCheckbox)}
                  />
                  {!props.pos.options?.isHideLabel && (
                    <span className="leading-none">{data}</span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      );
    case textInputWidget:
      return props.isSignYourself || iswidgetEnable ? (
        <textarea
          ref={inputRef}
          placeholder={hint || t("widgets-name.text")}
          rows={1}
          value={widgetValue}
          className={`${
            props.pos.options?.isReadOnly ||
            props.data?.signerObjId !== props.signerObjId
              ? "select-none"
              : textWidgetCls
          }`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: props.data?.blockColor,
            pointerEvents: "none"
          }}
          readOnly
          disabled={
            props.isNeedSign &&
            (props.pos.options?.isReadOnly ||
              props.data?.signerObjId !== props.signerObjId)
          }
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case "dropdown":
      return (
        <div
          style={textWidgetStyle}
          className="select-none-cls flex justify-between items-center"
        >
          {widgetData || hint || widgetTypeTranslation}
          <i className="fa-light fa-circle-chevron-down mr-1 "></i>
        </div>
      );
    case "initials":
      return props.pos.SignUrl ? (
        <img
          alt="initials"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full select-none-cls"
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium text-center"
            >
              {hint || widgetTypeTranslation}
            </div>
          )}
        </div>
      );
    case "name":
      return iswidgetEnable ? (
        <textarea
          readOnly
          ref={inputRef}
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor,
            pointerEvents: "none"
          }}
          cols="50"
        />
      ) : (
        <div className="flex h-full select-none-cls" style={textWidgetStyle}>
          <span> {props.pos?.options?.hint || widgetTypeTranslation}</span>
        </div>
      );
    case "company":
      return iswidgetEnable ? (
        <textarea
          readOnly
          ref={inputRef}
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor,
            pointerEvents: "none"
          }}
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case "job title":
      return iswidgetEnable ? (
        <textarea
          readOnly
          ref={inputRef}
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor,
            pointerEvents: "none"
          }}
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case "date":
      return iswidgetEnable ? (
        <DatePicker
          renderCustomHeader={({ date, changeYear, changeMonth }) => (
            <div className="flex justify-start ml-2 ">
              <select
                className="bg-transparent outline-none"
                value={months[getMonth(date)]}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="bg-transparent outline-none"
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(value)}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          disabled={true}
          closeOnScroll={true}
          className={`${selectWidgetCls} outline-[#007bff]`}
          selected={props?.startDate}
          popperPlacement="top-end"
          customInput={<ExampleCustomInput />}
          dateFormat={
            props.selectDate
              ? props.selectDate?.format
              : props.pos?.options?.validation?.format
                ? props.pos?.options?.validation?.format
                : "MM/dd/yyyy"
          }
        />
      ) : (
        <div
          style={textWidgetStyle}
          className="select-none-cls overflow-hidden"
        >
          <span>
            {props.selectDate
              ? props.selectDate?.format
              : props.pos?.options?.validation?.format
                ? props.pos?.options?.validation?.format
                : "MM/dd/yyyy"}
          </span>
        </div>
      );
    case "image":
      return props.pos.SignUrl ? (
        <img
          alt="image"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full select-none-cls"
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium text-center"
            >
              {hint || widgetTypeTranslation}
            </div>
          )}
        </div>
      );
    case "email":
      return iswidgetEnable ? (
        <textarea
          readOnly
          ref={inputRef}
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif",
            pointerEvents: "none"
          }}
          disabled
          cols="1"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case radioButtonWidget:
      return (
        <div>
          {props.pos.options?.values.map((data, ind) => {
            return (
              <div key={ind} className="select-none-cls pointer-events-none">
                <label
                  htmlFor={`radio-${props.pos.key + ind}`}
                  style={{
                    fontSize: fontSize,
                    color: fontColor,
                    marginTop: ind > 0 ? "5px" : "0px"
                  }}
                  className="text-xs mb-0 flex items-center gap-1 "
                >
                  <input
                    readOnly
                    id={`radio-${props.pos.key + ind}`}
                    style={{
                      width: fontSize,
                      height: fontSize,
                      lineHeight: 2
                    }}
                    className={`op-radio rounded-full border- border-black appearance-none bg-white inline-block align-middle relative ${
                      handleRadioCheck(data) ? "checked-radio" : ""
                    }`}
                    type="radio"
                    disabled={
                      props.isNeedSign &&
                      (props.pos.options?.isReadOnly ||
                        props.data?.signerObjId !== props.signerObjId)
                    }
                    checked={handleRadioCheck(data)}
                  />
                  {!props.pos.options?.isHideLabel && (
                    <span className="leading-none">{data}</span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      );
    case textWidget:
      return (
        <textarea
          readOnly
          placeholder={t("widgets-name.text")}
          rows={1}
          value={widgetValue}
          className={textWidgetCls}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: fontSize,
            color: fontColor
          }}
          cols="50"
        />
      );
    default:
      return props.pos.SignUrl ? (
        <div className="pointer-events-none">
          <img
            alt="image"
            draggable="false"
            src={props.pos.SignUrl}
            className="w-full h-full "
          />
        </div>
      ) : (
        <div className={widgetCls}>
          {props.pos.isStamp ? <div>stamp</div> : <div>signature</div>}
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium"
            >
              {hint || widgetTypeTranslation}
            </div>
          )}
        </div>
      );
  }
}

export default PlaceholderType;
