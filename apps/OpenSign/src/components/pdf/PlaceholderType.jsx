import { useEffect, useState, useRef } from "react";
import {
  onChangeInput,
  defaultWidthHeight,
  isRadioSelected,
  textInputWidget,
  isBase64,
  changeDateToMomentFormat
} from "../../constant/Utils";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import moment from "moment";
import { updateLinkedFields } from "../../utils/linkedFields";
import { renderSignature } from "./PlaceholderTypeSignature";
import { renderField } from "./PlaceholderTypeFields";
import { renderText } from "./PlaceholderTypeText";
import { renderFallback } from "./PlaceholderTypeSignature";
import { renderRadio } from "./PlaceholderTypeRadio";
import { renderCheckbox } from "./PlaceholderTypeCheckbox";
import { renderDate } from "./PlaceholderTypeDate";

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
  const defaultData = props?.pos?.options?.defaultValue;
  const response = props?.pos?.options?.response;
  const type = props?.pos?.type;
  const iswidgetEnable =
    props.isSignYourself ||
    ((props.isSelfSign || props.isNeedSign) &&
      props.data?.signerObjId === props.signerObjId);
  const isReadOnly =
    props?.data?.Role !== "prefill" &&
    (props.pos.options?.isReadOnly ||
      props.data?.signerObjId !== props.signerObjId);
  // In-field editing: the signer edits their own widgets, and the authoring
  // flows edit placeholders directly on the page.
  const isOwnWidget =
    props.data?.signerObjId &&
    props.data?.signerObjId === props.signerObjId &&
    !props.pos?.options?.isReadOnly;
  const canEditInline =
    (props.isPlaceholder && !props.isNeedSign) ||
    ((props.isNeedSign || props.isSelfSign || props.isSignYourself) &&
      iswidgetEnable &&
      !isReadOnly) ||
    !!isOwnWidget;
  // prefer the latest response value over any default value
  //props?.isPrefillModal is used to handle in create template flow when user use use-template button
  //then prefill details should not be reflect on pdf document it should only show in modal
  const widgetData = !props?.isPrefillModal
    ? (props.pos?.options?.response ?? props.pos?.options?.defaultValue ?? "")
    : "";
  const [widgetValue, setwidgetValue] = useState();
  const [inlineError, setInlineError] = useState(false);
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [date, setDate] = useState("");
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
    if (!props?.isPrefillModal) {
      if (type !== "date") {
        if (type && type === "checkbox") {
          setSelectedCheckbox(response || defaultData || []);
        } else {
          // keep displayed value in sync with the stored response
          setwidgetValue(widgetData);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pos, widgetData, type]);

  const persistInlineValue = (
    value,
    position,
    positions,
    index,
    setter,
    userId,
    ...rest
  ) => {
    const update = (change) =>
      setter((previous) => {
        const next = typeof change === "function" ? change(previous) : change;
        return updateLinkedFields(next, {
          key: position.key,
          name: position.options?.name,
          value,
          signerId: userId
        });
      });
    onChangeInput(value, position, positions, index, update, userId, ...rest);
  };

  useEffect(() => {
    if (!canEditInline) {
      setInlineError(false);
      return;
    }
    const validation = props.pos?.options?.validation;
    const pattern = validation?.pattern;
    const validationType = validation?.type;
    if (!widgetValue) {
      setInlineError(false);
      return;
    }
    let regex = null;
    if (validationType === "email") regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    else if (validationType === "number") regex = /^[0-9\s]*$/;
    else if (validationType === "ssn") regex = /^\d{3}-?\d{2}-?\d{4}$/;
    else if (pattern) {
      try {
        const literal = String(pattern).match(/^\/(.*)\/([a-z]*)$/);
        regex = literal
          ? new RegExp(literal[1], literal[2])
          : new RegExp(pattern);
      } catch {
        regex = null;
      }
    }
    setInlineError(regex ? !regex.test(String(widgetValue)) : false);
  }, [widgetValue, canEditInline, props.pos?.options?.validation]);

  const handleInlineTextChange = (event) => {
    if (!canEditInline) return;
    const value = event.target.value;
    setwidgetValue(value);
    if (props.setXyPosition) {
      persistInlineValue(
        value,
        props.pos,
        props.xyPosition,
        props.index,
        props.setXyPosition,
        props.data?.Id || props.uniqueId,
        false,
        null,
        props.pos?.options?.fontSize || 12,
        props.pos?.options?.fontColor || "black",
        null,
        null
      );
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
    if (!props?.isPrefillModal) {
      loadImage();
    }
  }, [props.pos.SignUrl]);

  const formatWidgetName = () => {
    const widgetName = props?.pos?.options?.name;
    const name = widgetName ? widgetName?.split(`-`) : ["-", "-", "-"];
    const lastWord = name.length > 1 ? `-${name[name.length - 1]}` : "";
    const title =
      props?.pos?.type === name[0] ? `${name[0]}${lastWord}` : widgetName;
    return defaultData || props?.pos?.options?.hint || title;
  };
  // Inline text stays fixed-height until a newline needs additional space.
  useEffect(() => {
    if (canEditInline && !(widgetValue && String(widgetValue).includes("\n"))) {
      return;
    }
    if (!textRef.current) return;
    if (
      (type === "text" || type === textInputWidget) &&
      textRef.current &&
      (widgetValue ?? widgetData)
    ) {
      const lines = String(widgetValue ?? widgetData).split("\n").length;
      const containerScale = parseFloat(props.calculateFont(1));
      const style = window.getComputedStyle(textRef.current);
      const lineHeight =
        style.lineHeight === "normal"
          ? parseFloat(style.fontSize) * 1.5
          : parseFloat(style.lineHeight);
      const textWidgetHeight = (lines * lineHeight) / containerScale;
      const dimension = [90, 270].includes(props.pos.options?.rotation)
        ? "Width"
        : "Height";
      const currentHeight =
        props.pos[dimension] ||
        defaultWidthHeight(type)[dimension.toLowerCase()];
      if (textWidgetHeight <= currentHeight) return;

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

  useEffect(() => {
    if (props?.startDate) {
      const format =
        props?.selectDate?.format ||
        props.pos?.options?.validation?.format ||
        "MM/dd/yyyy";
      const momentFormat = changeDateToMomentFormat(format);
      const updatedDate = moment(props?.startDate).format(momentFormat);
      setDate(updatedDate);
    } else {
      setDate("");
    }
  }, [props?.startDate, props?.selectDate?.format]);

  /** Label of a radio option, which may be a string or { name }. */
  const getRadioLabel = (data) => {
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && data.name != null)
      return String(data.name);
    return "";
  };

  /** Whether a radio option matches the current response or the default (#65). */
  const handleRadioCheck = (data) => {
    if (props?.isPrefillModal) return false;
    const current = widgetValue ? widgetValue : props.pos?.options?.defaultValue;
    return isRadioSelected(current, data);
  };

  const renderContext = {
    props,
    widgetCls,
    formatWidgetName,
    prefillImgLoad,
    imgUrl,
    widgetValue,
    fontSize,
    fontColor,
    selectedCheckbox,
    setSelectedCheckbox,
    canEditInline,
    isReadOnly,
    iswidgetEnable,
    widgetData,
    textRef,
    inlineError,
    textWidgetStyle,
    handleInlineTextChange,
    persistInlineValue,
    t,
    setwidgetValue,
    date,
    defaultData,
    response,
    selectWidgetCls,
    handleRadioCheck,
    getRadioLabel
  };
  return (
    renderSignature(type, renderContext) ??
    renderField(type, renderContext) ??
    renderCheckbox(type, renderContext) ??
    renderRadio(type, renderContext) ??
    renderText(type, renderContext) ??
    renderDate(type, renderContext) ??
    renderFallback(renderContext)
  );
}

export default PlaceholderType;
