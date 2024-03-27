import React, { useEffect, useState, forwardRef, useRef } from "react";
import {
  getMonth,
  getYear,
  isMobile,
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

function PlaceholderType(props) {
  const type = props?.pos?.type;
  const [selectOption, setSelectOption] = useState("");
  const [validatePlaceholder, setValidatePlaceholder] = useState("");
  const inputRef = useRef(null);
  const [textValue, setTextValue] = useState();
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const years = range(1990, getYear(new Date()) + 16, 1);
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
    let regexObject = regexValidation;
    if (props.pos?.options.validation.type === "regex") {
      regexObject = RegexParser(regexValidation);
    }
    // new RegExp(regexValidation);
    let isValidate = regexObject.test(textValue);
    if (!isValidate) {
      props?.setValidateAlert(true);
      inputRef.current.focus();
    }
  };

  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
    const validateType = props.pos?.options?.validation?.type;
    let regexValidation;
    if (validateType) {
      switch (validateType) {
        case "email":
          regexValidation = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          validateExpression(regexValidation);
          break;
        case "number":
          regexValidation = /^\d+$/;
          validateExpression(regexValidation);
          break;
        case "text":
          regexValidation = /^[a-zA-Z\s]+$/;
          validateExpression(regexValidation);
          break;
        default:
          regexValidation = props.pos?.options.validation.pattern;
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
      case textInputWidget:
        setValidatePlaceholder("enter text");
        break;
      default:
        setValidatePlaceholder("enter text");
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
  }, [props.pos]);

  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      className="inputPlaceholder"
      style={{ overflow: "hidden", fontSize: calculateFontSize() }}
      onClick={onClick}
      ref={ref}
    >
      {value}
      <i className="fa-regular fa-calendar" style={{ marginLeft: "5px" }}></i>
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

  const calculateFontSize = () => {
    const fontSize = 10 + Math.min(props.pos.Width, props.pos.Height) * 0.1;
    const size = fontSize ? fontSize : 12;
    return size + "px";
  };
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
    const height = 15;
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
          alt="signimg"
          draggable="false"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div style={{ fontSize: 11, color: "black", justifyContent: "center" }}>
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              props?.pos?.type
            )}
        </div>
      );
    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          draggable="false"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div style={{ fontSize: 11, color: "black", justifyContent: "center" }}>
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              props?.pos?.type
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
                    // width: props.pos.Width,
                    display: "flex",
                    justifyContent: "center",
                    marginTop: ind === 0 ? 0 : "5px"
                  }}
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
                  <label className="text-xs mb-0 text-center">{data}</label>
                )}
              </div>
            );
          })}
        </div>
      );
    case textInputWidget:
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          ref={inputRef}
          placeholder={validatePlaceholder}
          style={{ fontSize: calculateFontSize() }}
          value={textValue}
          type="text"
          tabIndex="0"
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isPlaceholder
          }
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
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: calculateFontSize()
          }}
        >
          <span>{type}</span>
        </div>
      );
    case "dropdown":
      return props.data?.signerObjId === props.signerObjId ? (
        <select
          className="inputPlaceholder"
          id="myDropdown"
          style={{ fontSize: "12px" }}
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
          <option value="" disabled hidden>
            {props?.pos?.options?.name}
          </option>

          {props.pos?.options?.values.map((data, ind) => {
            return (
              <option key={ind} value={data}>
                {data}
              </option>
            );
          })}
        </select>
      ) : (
        <div
          className="inputPlaceholder"
          style={{ fontSize: calculateFontSize() }}
        >
          {props.pos?.options?.name ? props.pos.options.name : type}
        </div>
      );
    case "initials":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          draggable="false"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div style={{ fontSize: 11, color: "black", justifyContent: "center" }}>
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              props?.pos?.type
            )}
        </div>
      );
    case "name":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          tabIndex="0"
          ref={inputRef}
          placeholder={"name"}
          style={{ fontSize: calculateFontSize() }}
          className="inputPlaceholder"
          type="text"
          value={textValue}
          onBlur={handleInputBlur}
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
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: calculateFontSize()
          }}
        >
          <span>{type}</span>
        </div>
      );
    case "company":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          ref={inputRef}
          placeholder={"company"}
          style={{ fontSize: calculateFontSize() }}
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
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: calculateFontSize()
          }}
        >
          <span>{type}</span>
        </div>
      );
    case "job title":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          ref={inputRef}
          placeholder={"job title"}
          style={{ fontSize: calculateFontSize() }}
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
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: calculateFontSize()
          }}
        >
          <span>{type}</span>
        </div>
      );
    case "date":
      return (
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
            className="inputPlaceholder"
            style={{ outlineColor: "#007bff" }}
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
      );
    case "image":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          draggable="false"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div style={{ fontSize: 11, color: "black", justifyContent: "center" }}>
          {props?.handleUserName &&
            props?.handleUserName(
              props?.data?.Id,
              props?.data?.Role,
              props?.pos?.type
            )}
        </div>
      );
    case "email":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          ref={inputRef}
          placeholder={"email"}
          style={{ fontSize: calculateFontSize() }}
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
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: calculateFontSize()
          }}
        >
          <span>{type}</span>
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
                    width: props.pos.Width,
                    display: "flex",
                    justifyContent: "center",
                    marginTop: ind === 0 ? 0 : "5px"
                  }}
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
                  <label className="text-xs mb-0">{data}</label>
                )}
              </div>
            );
          })}
        </div>
      );
    case textWidget:
      return (
        <textarea
          placeholder="Enter label"
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
          className={
            isMobile
              ? "labelTextArea labelWidthMobile"
              : "labelTextArea labelWidthDesktop"
          }
          style={{ whiteSpace: "pre-wrap" }}
          cols="50"
        />
      );
    default:
      return props.pos.SignUrl ? (
        <div style={{ pointerEvents: "none" }}>
          <img
            alt="signimg"
            draggable="false"
            src={props.pos.SignUrl}
            style={{
              width: "99%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        </div>
      ) : (
        <div
          style={{
            fontSize: "10px",
            color: "black",
            justifyContent: "center"
          }}
        >
          {props.pos.isStamp ? <div>stamp</div> : <div>signature</div>}
          {props?.handleUserName &&
            props?.handleUserName(props?.data?.Id, props?.data?.Role)}
        </div>
      );
  }
}

export default PlaceholderType;
