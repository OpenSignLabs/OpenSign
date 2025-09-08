import { useEffect, useState, forwardRef } from "react";
import {
  getMonth,
  getYear,
  radioButtonWidget,
  textInputWidget,
  cellsWidget,
  textWidget,
  months,
  years,
  selectCheckbox,
  checkRegularExpress,
  isBase64
} from "../../constant/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
import CellsWidget from "./CellsWidget";
import { useSelector } from "react-redux";
import Loader from "../../primitives/Loader";
const textWidgetCls =
  "w-full h-full md:min-w-full md:min-h-full z-[999] text-[12px] overflow-hidden resize-none outline-none text-base-content item-center whitespace-pre-wrap";
const widgetCls =
  "select-none-cls overflow-hidden w-full h-full text-black flex flex-col justify-center items-center";
function PlaceholderType(props) {
  const selectWidgetCls = `w-full h-full absolute left-0 top-0 focus:outline-none text-base-content`;
  const { t } = useTranslation();
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const prefillImgLoad = useSelector((state) => state.widget.prefillImgLoad);
  const type = props?.pos?.type;
  const iswidgetEnable =
    props.isSignYourself ||
    ((props.isSelfSign || props.isNeedSign) &&
      props.data?.signerObjId === props.signerObjId);
  const isReadOnly =
    props.pos.options?.isReadOnly ||
    props.data?.signerObjId !== props.signerObjId;
  // prefer the latest response value over any default value
  const widgetData =
    props.pos?.options?.response ?? props.pos?.options?.defaultValue ?? "";
  const widgetTypeTranslation = t(`widgets-name.${props?.pos?.type}`);
  const [widgetValue, setwidgetValue] = useState();
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const [hint, setHint] = useState("");
  const [imgUrl, setImgUrl] = useState("");
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
        // keep displayed value in sync with the stored response
        setwidgetValue(widgetData);
      }
      if (props.pos?.options?.hint) {
        setHint(props.pos?.options.hint);
      } else if (props.pos?.options?.validation?.type) {
        checkRegularExpress(props.pos?.options?.validation?.type, setHint);
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
      className={`${isReadOnly ? `select-none` : ``} ${selectWidgetCls} overflow-hidden`}
      disabled={isReadOnly}
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
  //function is used to get prefill image's signedUrl after expired
  useEffect(() => {
    const loadImage = async () => {
      const isBase64Url = isBase64(props?.pos?.SignUrl);
      if (
        props.pos.SignUrl &&
        props.pos.type === "image" &&
        props?.data?.Role === "prefill" &&
        !isBase64Url
      ) {
        const getPrefillImg = prefillImg?.find((x) => x.id === props.pos.key);
        if (getPrefillImg) {
          setImgUrl(getPrefillImg?.base64);
        }
      } else {
        setImgUrl(props.pos.SignUrl);
      }
    };
    loadImage();
  }, [props.pos.SignUrl]);

  switch (type) {
    case "signature":
      return props.pos.SignUrl ? (
        <img
          alt="signature"
          draggable="false"
          src={props.pos.SignUrl}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
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
          className="w-full h-full select-none-cls object-contain"
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
      const checkBoxLayout = props.pos.options?.layout || "vertical";
      const isMultipleCheckbox =
        props.pos.options?.values?.length > 0 ? true : false;
      const checkBoxWrapperClass = `flex items-start whitespace-pre-wrap ${
        checkBoxLayout === "horizontal"
          ? `flex-row flex-wrap lg:py-[1.6px] ${isMultipleCheckbox ? "gap-x-2" : ""}`
          : `flex-col ${isMultipleCheckbox ? "gap-y-[3px]" : ""}`
      }`; // Using gap-y-1 for consistency, adjust if needed

      return (
        <div
          className={checkBoxWrapperClass}
          style={{ zIndex: props.isSignYourself && "99" }}
        >
          {props.pos.options?.values?.map((data, ind) => (
            <div key={ind} className="select-none-cls pointer-events-none">
              <label
                htmlFor={`checkbox-${props.pos.key + ind}`}
                style={{ fontSize: fontSize, color: fontColor }}
                className={`mb-0 flex items-center gap-1`}
              >
                <input
                  id={`checkbox-${props.pos.key + ind}`}
                  style={{ width: fontSize, height: fontSize }}
                  className="op-checkbox rounded-[1px]"
                  disabled={props.isNeedSign && isReadOnly}
                  type="checkbox"
                  readOnly
                  checked={!!selectCheckbox(ind, selectedCheckbox)}
                />
                {!props.pos.options?.isHideLabel && (
                  <span className="leading-none">{data}</span>
                )}
              </label>
            </div>
          ))}
        </div>
      );
    case textInputWidget:
      return props.isSignYourself || iswidgetEnable ? (
        <textarea
          placeholder={hint || t("widgets-name.text")}
          rows={1}
          value={widgetValue}
          className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          readOnly
          disabled={props.isNeedSign && isReadOnly}
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case cellsWidget: {
      const count = props.pos.options?.cellCount || 5;
      const cells = (widgetValue || "").split("");
      const height = "100%";
      const fontSize = props.calculateFont(props.pos.options?.fontSize);
      const fontColor = props.pos.options?.fontColor || "black";
      const handleCellResize = (newCount) => {
        if (props.setCellCount) props.setCellCount(props.pos.key, newCount);
      };
      const isEditable =
        props.isPlaceholder || props.isSignYourself || props.isSelfSign;
      return (
        <CellsWidget
          isEnabled={iswidgetEnable}
          count={count}
          height={height}
          value={cells.join("")}
          editable={isEditable}
          resizable={props?.isAllowModify}
          fontSize={fontSize}
          fontColor={fontColor}
          hint={hint}
          onCellCountChange={handleCellResize}
        />
      );
    }
    case "dropdown":
      return (
        <div
          style={textWidgetStyle}
          className="select-none-cls flex justify-between items-center"
        >
          {widgetData || t("choose-one")}
          <i className="fa-light fa-circle-chevron-down mr-1 "></i>
        </div>
      );
    case "initials":
      return props.pos.SignUrl ? (
        <img
          alt="initials"
          draggable="false"
          src={props.pos.SignUrl}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
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
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          cols="50"
          disabled={props.isNeedSign && isReadOnly}
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
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          cols="50"
          disabled={props.isNeedSign && isReadOnly}
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
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          cols="50"
          disabled={props.isNeedSign && isReadOnly}
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case "date":
      return iswidgetEnable || props?.data?.Role === "prefill" ? (
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
      return prefillImgLoad[props.pos?.key] ? (
        <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-white/30 z-50">
          <Loader />
        </div>
      ) : imgUrl ? (
        <img
          alt="image"
          draggable="false"
          src={imgUrl}
          className="w-full h-full select-none-cls object-contain"
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
          placeholder={hint || widgetTypeTranslation}
          rows={1}
          value={widgetValue}
          className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          cols="1"
          disabled={props.isNeedSign && isReadOnly}
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span>{hint || widgetTypeTranslation}</span>
        </div>
      );
    case radioButtonWidget:
      const radioLayout = props.pos.options?.layout || "vertical";
      const isOnlyOneBtn = props.pos.options?.values?.length > 0 ? true : false;
      const radioWrapperClass = `flex items-start whitespace-pre-wrap ${
        radioLayout === "horizontal"
          ? `flex-row flex-wrap lg:py-[1.6px] ${isOnlyOneBtn ? "gap-x-[10px]" : ""}`
          : `flex-col ${isOnlyOneBtn ? "gap-y-[5px]" : ""}`
      }`; // Using gap-y-1 for consistency, adjust if needed
      return (
        <div className={radioWrapperClass}>
          {props.pos.options?.values.map((data, ind) => (
            <div key={ind} className="select-none-cls pointer-events-none">
              <label
                htmlFor={`radio-${props.pos.key + ind}`}
                style={{ fontSize: fontSize, color: fontColor }}
                className="text-xs mb-0 flex items-center gap-1"
              >
                <input
                  readOnly
                  id={`radio-${props.pos.key + ind}`}
                  style={{ width: fontSize, height: fontSize, lineHeight: 2 }}
                  className={`op-radio rounded-full border-black appearance-none bg-white inline-block align-middle relative ${
                    handleRadioCheck(data) ? "checked-radio" : ""
                  }`}
                  type="radio"
                  disabled={props.isNeedSign && isReadOnly}
                  checked={handleRadioCheck(data)}
                />
                {!props.pos.options?.isHideLabel && (
                  <span className="leading-none">{data}</span>
                )}
              </label>
            </div>
          ))}
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
            color: fontColor,
            background: "white"
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
