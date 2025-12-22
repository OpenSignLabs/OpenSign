import {
  useEffect,
  useState,
  forwardRef,
  useRef
} from "react";
import {
  onChangeInput,
  getMonth,
  getYear,
  radioButtonWidget,
  textInputWidget,
  cellsWidget,
  textWidget,
  months,
  years,
  selectCheckbox,
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
  const textRef = useRef();
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const prefillImgLoad = useSelector((state) => state.widget.prefillImgLoad);
  const type = props?.pos?.type;
  const iswidgetEnable =
    props.isSignYourself ||
    ((props.isSelfSign || props.isNeedSign) &&
      props.data?.signerObjId === props.signerObjId);
  const isReadOnly =
    props?.data?.Role !== "prefill" &&
    (props.pos.options?.isReadOnly ||
      props.data?.signerObjId !== props.signerObjId);
  // prefer the latest response value over any default value
  const widgetData =
    props.pos?.options?.response ?? props.pos?.options?.defaultValue ?? "";
  const [widgetValue, setwidgetValue] = useState();
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
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
      }
      else {
        // keep displayed value in sync with the stored response
        setwidgetValue(widgetData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pos, widgetData, type]);


  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{
        fontSize: fontSize,
        color: fontColor,
        fontFamily: "Arial, sans-serif"
      }}
      className={`${isReadOnly ? `select-none opacity-25` : ``} ${selectWidgetCls} overflow-hidden`}
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

  const formatWidgetName = () => {
    const widgetName = props?.pos?.options?.name;
    const name = widgetName ? widgetName?.split(`-`) : ["-", "-", "-"];
    const lastWord = name.length > 1 ? `-${name[name.length - 1]}` : "";
    const title =
      props?.pos?.type === name[0] ? `${name[0]}${lastWord}` : widgetName;
    return props?.pos?.options?.hint || title;
  };
  //useEffect is used to increase auto height of text/textInput widget when user using multiline option and enter value in next line
  useEffect(() => {
    if (!textRef.current) return;
    if (
      (type === "text" || type === textInputWidget) &&
      textRef.current &&
      widgetValue
    ) {
      const el = textRef.current;
      // Count actual number of lines
      const lines = widgetValue?.split("\n")?.length || props.pos?.Height;
      // Get line height from computed style
      const lineHeight = parseInt(window.getComputedStyle(el).lineHeight);

      const textWidgetHeight = lines * lineHeight;
      // Set widget box height (your logic)
      onChangeInput(
        null,
        props.pos,
        props?.xyPosition,
        props.index,
        props?.setXyPosition,
        props.data && props.data.Id,
        null,
        null,
        null,
        null,
        null,
        textWidgetHeight
      );
    }
  }, [widgetValue]);

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
              {formatWidgetName()}
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
              {formatWidgetName()}
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
          placeholder={formatWidgetName()}
          ref={textRef}
          rows={50}
          value={
                widgetValue
          }
          className={`w-full resize-none overflow-hidden text-base-content item-center outline-none ${isReadOnly ? "select-none" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: "none"
          }}
          name="text"
          readOnly
          disabled={props.isNeedSign && isReadOnly}
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span className="ml-0.5">{formatWidgetName()}</span>
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
          value={
                cells.join("")
          }
          editable={isEditable}
          resizable={props?.isAllowModify}
          fontSize={fontSize}
          fontColor={fontColor}
          hint={formatWidgetName()}
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
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    case "name":
      return iswidgetEnable ? (
        <textarea
          readOnly
          placeholder={formatWidgetName()}
          rows={1}
          value={
                widgetValue
          }
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
          <span className="ml-0.5">{formatWidgetName()}</span>
        </div>
      );
    case "company":
      return iswidgetEnable ? (
        <textarea
          readOnly
          placeholder={formatWidgetName()}
          rows={1}
          value={
                widgetValue
          }
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
          <span className="ml-0.5">{formatWidgetName()}</span>
        </div>
      );
    case "job title":
      return iswidgetEnable ? (
        <textarea
          readOnly
          placeholder={formatWidgetName()}
          rows={1}
          value={
                widgetValue
          }
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
          <span className="ml-0.5">{formatWidgetName()}</span>
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
            props?.selectDate?.format ||
            props.pos?.options?.validation?.format ||
            "MM/dd/yyyy"
          }
        />
      ) : (
        <div
          style={textWidgetStyle}
          className="select-none-cls overflow-hidden"
        >
          <span>
            {props?.selectDate?.format ||
              props.pos?.options?.validation?.format ||
              "MM/dd/yyyy"}
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
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    case "email":
      return iswidgetEnable ? (
        <textarea
          readOnly
          placeholder={formatWidgetName()}
          rows={1}
          value={
                widgetValue
          }
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
          <span className="ml-0.5">{formatWidgetName()}</span>
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
          name="text"
          ref={textRef}
          readOnly
          placeholder={t("widgets-name.text")}
          rows={50}
          cols={50}
          defaultValue={
                widgetValue
          }
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: fontSize,
            color: fontColor,
            background: "white"
          }}
          className="w-full resize-none overflow-hidden text-base-content item-center outline-none"
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
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
  }
}

export default PlaceholderType;
