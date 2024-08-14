import React, { useEffect, useState, forwardRef, useRef } from "react";
import {
  getMonth,
  getYear,
  onChangeHeightOfTextArea,
  onChangeInput,
  radioButtonWidget,
  range,
  textInputWidget,
  textWidget
} from "../../constant/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/signature.css";
import RegexParser from "regex-parser";
import { emailRegex } from "../../constant/const";
import { useTranslation } from "react-i18next";
const textWidgetCls =
  "w-full h-full md:min-w-full md:min-h-full z-[999] text-[12px] rounded-[2px] border-[1px] border-[#007bff] overflow-hidden resize-none outline-none text-base-content item-center whitespace-pre-wrap bg-white";
const selectWidgetCls =
  "w-full h-full absolute left-0 top-0 border-[1px] border-[#007bff] rounded-[2px] focus:outline-none text-base-content";
function PlaceholderType(props) {
  const { t } = useTranslation();
  const type = props?.pos?.type;
  const widgetTypeTraslation = t(`widgets-name.${props?.pos?.type}`);
  const [selectOption, setSelectOption] = useState("");
  const [validatePlaceholder, setValidatePlaceholder] = useState("");
  const inputRef = useRef(null);
  const [textValue, setTextValue] = useState();
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const years = range(1990, getYear(new Date()) + 16, 1);
  const fontSize = (props.pos.options?.fontSize || "12") + "px";
  const fontColor = props.pos.options?.fontColor || "black";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const validateExpression = (regexValidation) => {
    if (textValue && regexValidation) {
      let regexObject = regexValidation;
      if (props.pos?.options?.validation?.type === "regex") {
        regexObject = RegexParser(regexValidation);
      }
      // new RegExp(regexValidation);
      let isValidate = regexObject.test(textValue);
      if (!isValidate) {
        props?.setValidateAlert(true);
        inputRef.current.focus();
      }
    }
  };

  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
    const validateType = props.pos?.options?.validation?.type;
    let regexValidation;
    if (validateType && validateType !== "text") {
      switch (validateType) {
        case "email":
          regexValidation = emailRegex;
          validateExpression(regexValidation);
          break;
        case "number":
          regexValidation = /^[0-9\s]*$/;
          validateExpression(regexValidation);
          break;
        default:
          regexValidation = props.pos?.options?.validation?.pattern || "";
          validateExpression(regexValidation);
      }
    }
  };

  const handleTextValid = (e) => {
    const textInput = e.target.value;
    setTextValue(textInput);
  };
  function checkRegularExpress(validateType) {
    switch (validateType) {
      case "email":
        setValidatePlaceholder("demo@gmail.com");
        break;
      case "number":
        setValidatePlaceholder("12345");
        break;
      case "text":
        setValidatePlaceholder("please enter text");
        break;
      default:
        setValidatePlaceholder("please enter value");
    }
  }

  useEffect(() => {
    if (type && type === "checkbox" && props.isNeedSign) {
      const isDefaultValue = props.pos.options?.defaultValue;
      if (isDefaultValue) {
        setSelectedCheckbox(isDefaultValue);
      }
    } else if (props.pos?.options?.hint) {
      setValidatePlaceholder(props.pos?.options.hint);
    } else if (props.pos?.options?.validation?.type) {
      checkRegularExpress(props.pos?.options?.validation?.type);
    }
    setTextValue(
      props.pos?.options?.response
        ? props.pos?.options?.response
        : props.pos?.options?.defaultValue
          ? props.pos?.options?.defaultValue
          : ""
    );
    setSelectOption(
      props.pos?.options?.response
        ? props.pos?.options?.response
        : props.pos?.options?.defaultValue
          ? props.pos?.options?.defaultValue
          : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      ["name", "email", "job title", "company"].includes(props.pos?.type) &&
      props.isNeedSign &&
      props.data?.signerObjId === props?.signerObjId
    ) {
      const defaultData = props.pos?.options?.defaultValue;
      if (defaultData) {
        setTextValue(defaultData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pos?.options?.defaultValue]);

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
      <i className="fa-light fa-calendar  ml-[5px]"></i>
    </div>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";

  useEffect(() => {
    if (
      ["name", "email", "job title", "company"].includes(type) &&
      props.isNeedSign &&
      props.data?.signerObjId === props.signerObjId
    ) {
      const isDefault = true;
      const senderUser = localStorage.getItem(`Extand_Class`);
      const jsonSender = JSON.parse(senderUser);
      onChangeInput(
        jsonSender && jsonSender[0],
        null,
        props.xyPostion,
        null,
        props.setXyPostion,
        props.data.Id,
        isDefault
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  //function for show checked checkbox
  const selectCheckbox = (ind) => {
    const res = props.pos.options?.response;
    const defaultCheck = props.pos.options?.defaultValue;
    if (res && res?.length > 0) {
      const isSelectIndex = res.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
      // }
    } else if (defaultCheck) {
      const isSelectIndex = defaultCheck.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleRadioCheck = (data) => {
    const defaultData = props.pos.options?.defaultValue;
    if (textValue === data) {
      return true;
    } else if (defaultData === data) {
      return true;
    } else {
      return false;
    }
  };

  //function for set checked and unchecked value of checkbox
  const handleCheckboxValue = (isChecked, ind) => {
    let updateSelectedCheckbox = [],
      checkedList;
    let isDefaultValue, isDefaultEmpty;
    if (type === "checkbox") {
      updateSelectedCheckbox = selectedCheckbox ? selectedCheckbox : [];

      if (isChecked) {
        updateSelectedCheckbox.push(ind);
        setSelectedCheckbox(updateSelectedCheckbox);
      } else {
        checkedList = selectedCheckbox.filter((data) => data !== ind);
        setSelectedCheckbox(checkedList);
      }
      if (props.isNeedSign) {
        isDefaultValue = props.pos.options?.defaultValue;
      }
      if (isDefaultValue && isDefaultValue.length > 0) {
        isDefaultEmpty = true;
      }
      onChangeInput(
        checkedList ? checkedList : updateSelectedCheckbox,
        props.pos.key,
        props.xyPostion,
        props.index,
        props.setXyPostion,
        props.data && props.data.Id,
        false,
        null,
        isDefaultEmpty
      );
    }
  };

  //function to handle select radio widget and set value seletced by user
  const handleCheckRadio = (isChecked, data) => {
    let isDefaultValue,
      isDefaultEmpty,
      isRadio = true;
    if (props.isNeedSign) {
      isDefaultValue = props.pos.options?.defaultValue;
    }
    if (isDefaultValue) {
      isDefaultEmpty = true;
    }
    if (isChecked) {
      setTextValue(data);
    } else {
      setTextValue("");
    }
    onChangeInput(
      data,
      props.pos.key,
      props.xyPostion,
      props.index,
      props.setXyPostion,
      props.data && props.data.Id,
      false,
      null,
      isDefaultEmpty,
      isRadio
    );
  };
  //function to set onchange date
  const handleOnDateChange = (date) => {
    props.setStartDate(date);
    const isDateChange = true;
    const dateObj = {
      date: date,
      format: props.selectDate.format
    };
    props.handleSaveDate(dateObj, isDateChange);
  };
  //handle height on enter press in text area
  const handleEnterPress = (e) => {
    const height = 18;
    if (e.key === "Enter") {
      //function to save height of text area
      onChangeHeightOfTextArea(
        height,
        props.pos.type,
        props.pos.key,
        props.xyPostion,
        props.index,
        props.setXyPostion,
        props.data && props.data?.Id
      );
    }
  };
  switch (type) {
    case "signature":
      return props.pos.SignUrl ? (
        <img
          alt="signature"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full "
        />
      ) : (
        <div className="text-[11px] w-full h-full text-black flex flex-col justify-center items-center">
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              widgetTypeTraslation
            )}
        </div>
      );
    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="stamp"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full"
        />
      ) : (
        <div className="text-[11px] w-full h-full text-black flex flex-col justify-center items-center">
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              widgetTypeTraslation
            )}
        </div>
      );
    case "checkbox":
      return (
        <div style={{ zIndex: props.isSignYourself && "99" }}>
          {props.pos.options?.values?.map((data, ind) => {
            return (
              <div key={ind} className="flex items-center text-center gap-0.5">
                <input
                  style={{
                    width: fontSize,
                    height: fontSize
                  }}
                  className={`${
                    ind === 0 ? "mt-0" : "mt-[5px]"
                  } flex justify-center op-checkbox rounded-[1px] `}
                  onBlur={handleInputBlur}
                  disabled={
                    props.isNeedSign &&
                    (props.pos.options?.isReadOnly ||
                      props.data?.signerObjId !== props.signerObjId)
                  }
                  type="checkbox"
                  checked={selectCheckbox(ind)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (!props.isPlaceholder) {
                        const maxRequired =
                          props.pos.options?.validation?.maxRequiredCount;
                        const maxCountInt =
                          maxRequired && parseInt(maxRequired);

                        if (maxCountInt > 0) {
                          if (
                            selectedCheckbox &&
                            selectedCheckbox?.length <= maxCountInt - 1
                          ) {
                            handleCheckboxValue(e.target.checked, ind);
                          }
                        } else {
                          handleCheckboxValue(e.target.checked, ind);
                        }
                      }
                    } else {
                      handleCheckboxValue(e.target.checked, ind);
                    }
                  }}
                />
                {!props.pos.options?.isHideLabel && (
                  <label
                    style={{
                      fontSize: fontSize,
                      color: fontColor
                    }}
                    className="text-xs mb-0 text-center"
                  >
                    {data}
                  </label>
                )}
              </div>
            );
          })}
        </div>
      );
    case textInputWidget:
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <textarea
          ref={inputRef}
          placeholder={validatePlaceholder || "please enter value"}
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onBlur={handleInputBlur}
          onChange={(e) => {
            setTextValue(e.target.value);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          cols="50"
        />
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            overflow: "hidden"
          }}
        >
          <span>{widgetTypeTraslation}</span>
        </div>
      );
    case "dropdown":
      return props.data?.signerObjId === props.signerObjId ? (
        <select
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          className={`${selectWidgetCls} text-[12px] bg-inherit`}
          id="myDropdown"
          value={selectOption}
          onChange={(e) => {
            setSelectOption(e.target.value);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
        >
          {/* Default/Title option */}
          <option
            style={{
              fontSize: fontSize,
              color: fontColor
            }}
            value=""
            disabled
            hidden
          >
            {props?.pos?.options?.name}
          </option>

          {props.pos?.options?.values?.map((data, ind) => {
            return (
              <option
                style={{
                  fontSize: fontSize,
                  color: fontColor
                }}
                key={ind}
                value={data}
              >
                {data}
              </option>
            );
          })}
        </select>
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          className=" overflow-hidden"
        >
          {props.pos?.options?.name
            ? props.pos.options.name
            : widgetTypeTraslation}
        </div>
      );
    case "initials":
      return props.pos.SignUrl ? (
        <img
          alt="initials"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full"
        />
      ) : (
        <div className="text-[11px] w-full h-full text-black flex flex-col justify-center items-center">
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              widgetTypeTraslation
            )}
        </div>
      );
    case "name":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <textarea
          ref={inputRef}
          placeholder={"name"}
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onChange={(e) => {
            const isDefault = false;
            handleTextValid(e);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              isDefault
            );
          }}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          cols="50"
        />
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif",
            overflow: "hidden"
          }}
        >
          <span>{widgetTypeTraslation}</span>
        </div>
      );
    case "company":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <textarea
          ref={inputRef}
          placeholder="Enter text"
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onChange={(e) => {
            handleTextValid(e);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          cols="50"
        />
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            overflow: "hidden",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <span>{widgetTypeTraslation}</span>
        </div>
      );
    case "job title":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <textarea
          ref={inputRef}
          placeholder={"job title"}
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onChange={(e) => {
            handleTextValid(e);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor
          }}
          cols="50"
        />
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif",
            overflow: "hidden"
          }}
        >
          <span>{widgetTypeTraslation}</span>
        </div>
      );
    case "date":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <div>
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
            disabled={
              props.isPlaceholder ||
              (props.isNeedSign &&
                props.data?.signerObjId !== props.signerObjId)
            }
            onBlur={handleInputBlur}
            closeOnScroll={true}
            className={`${selectWidgetCls} outline-[#007bff]`}
            selected={
              props?.startDate
                ? props?.startDate
                : props.pos.options?.response &&
                  new Date(props.pos.options.response)
            }
            onChange={(date) => handleOnDateChange(date)}
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
        </div>
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif"
          }}
          className="items-center overflow-hidden"
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
          className="w-full h-full"
        />
      ) : (
        <div className="text-[11px] w-full h-full text-black flex flex-col justify-center items-center">
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              widgetTypeTraslation
            )}
        </div>
      );
    case "email":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <textarea
          ref={inputRef}
          placeholder={"enter email"}
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onBlur={handleInputBlur}
          onChange={(e) => {
            handleTextValid(e);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
          className={textWidgetCls}
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif"
          }}
          cols="50"
        />
      ) : (
        <div
          style={{
            fontSize: fontSize,
            color: fontColor,
            fontFamily: "Arial, sans-serif",
            overflow: "hidden"
          }}
        >
          <span>{widgetTypeTraslation}</span>
        </div>
      );
    case radioButtonWidget:
      return (
        <div>
          {props.pos.options?.values.map((data, ind) => {
            return (
              <div key={ind} className="flex items-center text-center gap-0.5">
                <input
                  style={{
                    width: fontSize,
                    height: fontSize,
                    marginTop: ind > 0 ? "10px" : "0px"
                  }}
                  className={`flex justify-center op-radio`}
                  type="radio"
                  disabled={
                    props.isNeedSign &&
                    (props.pos.options?.isReadOnly ||
                      props.data?.signerObjId !== props.signerObjId)
                  }
                  checked={handleRadioCheck(data)}
                  onChange={(e) => {
                    if (!props.isPlaceholder) {
                      handleCheckRadio(e.target.checked, data);
                    }
                  }}
                />
                {!props.pos.options?.isHideLabel && (
                  <label
                    style={{
                      fontSize: fontSize,
                      color: fontColor
                    }}
                    className="text-xs mb-0"
                  >
                    {data}
                  </label>
                )}
              </div>
            );
          })}
        </div>
      );
    case textWidget:
      return (
        <textarea
          placeholder="Enter text"
          rows={1}
          onKeyDown={handleEnterPress}
          value={textValue}
          onBlur={handleInputBlur}
          onChange={(e) => {
            setTextValue(e.target.value);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data?.Id,
              false
            );
          }}
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
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="text-[11px] w-full h-full text-black flex flex-col justify-center items-center">
          {props.pos.isStamp ? <div>stamp</div> : <div>signature</div>}
          {props?.handleUserName &&
            props?.handleUserName(props?.data?.Id, props?.data?.Role)}
        </div>
      );
  }
}

export default PlaceholderType;
