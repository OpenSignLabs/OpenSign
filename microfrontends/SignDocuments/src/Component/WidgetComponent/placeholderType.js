import React, { useEffect, useState, forwardRef, useRef } from "react";
import { onChangeInput } from "../../utils/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/signature.css";

function PlaceholderType(props) {
  const type = props.pos.type;
  const [selectOption, setSelectOption] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [validatePlaceholder, setValidatePlaceholder] = useState("");
  const inputRef = useRef(null);
  const [textValue, setTextValue] = useState("");
  const [checkedValue, setCheckedValue] = useState(false);
  const [isCheckedRadio, setIsCheckedRadio] = useState({
    isChecked: false,
    selectValue: ""
  });

  const validateExpression = (regexValidation) => {
    const regexObject = new RegExp(regexValidation);

    let isValidate = regexObject.test(textValue);
    if (!isValidate) {
      props.setValidateAlert(true);
      inputRef.current.focus();
    }
  };

  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
    const validateType = props.pos?.options.validation.type;

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

  const handleTextValid = (e, regx) => {
    const textInput = e.target.value;
    setTextValue(textInput);
    // console.log('textInput',textInput)
    // let isValidate = regx.test(textValue);
    // console.log('isValidate',isValidate,regx)
    // if (isValidate) {
    //   const sanitizedValue = textInput.replace(regx, "");
    //   setTextValue(sanitizedValue);
    // } else {
    //   setTextValue('');
    // }
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
        setValidatePlaceholder("enter text");
      default:
        setValidatePlaceholder("enter text");
    }
  }
  useEffect(() => {
    if (props.pos?.options?.validation?.type) {
      checkRegularExpress(props.pos?.options?.validation?.type);
    }
  }, []);

  useEffect(() => {
    if (props.isNeedSign && props.pos.type === "date") {
      const updateDate = new Date();
      setStartDate(updateDate);
    }
  }, []);

  useEffect(() => {
    if (props.pos?.type && props.pos.type === "radio" && props.isNeedSign) {
      onChangeInput(
        isCheckedRadio.selectValue,
        props.pos.key,
        props.xyPostion,
        props.index,
        props.setXyPostion,
        props.data && props.data.Id,
        false
      );
    }
  }, [isCheckedRadio]);
  useEffect(() => {
    if (props.pos?.type && props.pos.type === "date") {
      if (props.selectDate) {
        const updateDate = new Date(props.saveDateFormat);
        setStartDate(updateDate);
        const dateObj = {
          date: props.saveDateFormat,
          format: props.selectDate
            ? props.selectDate?.format
            : props.pos?.options?.validation?.format
              ? props.pos?.options?.validation?.format
              : "MM/dd/YYYY"
        };
        props.setSelectDate(dateObj);
      }

      onChangeInput(
        props.saveDateFormat,
        props.pos.key,
        props.xyPostion,
        props.index,
        props.setXyPostion,
        props.data && props.data.Id,
        false,
        props.selectDate?.format
          ? props.selectDate.format
          : props.pos?.options?.validation?.format
            ? props.pos?.options?.validation?.format
            : "MM/dd/YYYY"
      );
    }
  }, [props.saveDateFormat]);

  const dateValue = (value) => {
    props.setSaveDateFormat(value);
    return <span>{value}</span>;
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      className="inputPlaceholder"
      style={{ overflow: "hidden", fontSize: calculateFontSize() }}
      onClick={onClick}
      ref={ref}
    >
      {dateValue(value)}
      <i className="fa-solid fa-calendar" style={{ marginLeft: "5px" }}></i>
    </div>
  ));

  useEffect(() => {
    if (props.pos?.type) {
      const senderUser = localStorage.getItem(`Extand_Class`);
      const jsonSender = JSON.parse(senderUser);

      if (props.isNeedSign && props.data?.signerObjId === props.signerObjId) {
        onChangeInput(
          jsonSender && jsonSender[0],
          null,
          props.xyPostion,
          null,
          props.setXyPostion,
          props.data.Id,
          true
        );
      }
    }
  }, [type]);

  const calculateFontSize = () => {
    const fontSize = 10 + Math.min(props.pos.Width, props.pos.Height) * 0.1;
    const size = fontSize ? fontSize : 12;
    return size + "px";
  };

  const handleChecked = () => {
    if (props.isPlaceholder) {
      if (props.pos?.options?.status === "Read only") {
        if (checkedValue) {
          return checkedValue;
        } else {
          const isChecked = true;
          return isChecked;
        }
      } else {
        if (checkedValue) {
          return !checkedValue;
        } else {
          return false;
        }
      }
    } else {
      return props.pos?.options?.response;
    }
  };

  switch (props.pos.type) {
    case "signature":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "10px",

            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );

    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "12px",
            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );

    case "checkbox":
      return (
        <input
          className="inputPlaceholder"
          style={{ outlineColor: "#007bff" }}
          type="checkbox"
          defaultChecked={props.pos?.options?.status === "Read only"}
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isNeedSign &&
                props.pos?.options?.status === "Read only" &&
                true
            // : props.isPlaceholder
          }
          onBlur={handleInputBlur}
          checked={handleChecked()}
          onChange={(e) => {
            let isChecked = e.target.checked;
            if (props.isPlaceholder) {
              if (props.pos?.options?.status === "Read only") {
                setCheckedValue(true);
                isChecked = true;
              } else {
                setCheckedValue(false);
                isChecked = false;
              }
            }

            onChangeInput(
              isChecked,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.Id,
              false
            );
          }}
        />
      );
    case "text":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          ref={inputRef}
          placeholder={validatePlaceholder}
          style={{ fontSize: calculateFontSize() }}
          value={
            props.pos?.options?.validation
              ? textValue
                ? textValue
                : props.pos.options?.response && props.pos.options.response
              : textValue
          }
          type="text"
          tabIndex="0"
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isPlaceholder
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            // props.pos?.validation && handleTextValid(e, props.pos?.validation);
            // if (!props.pos.options?.validation) {
            //   setTextValue(e.target.value);
            // }
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
          <span>{props.pos.type}</span>
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
            {props.pos.options.name}
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
          {props.pos?.options?.name ? props.pos.options.name : props.pos.type}
        </div>
      );
    case "initials":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "10px",
            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.Id, props?.data.Role)}
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
          value={
            textValue
              ? textValue
              : props.pos.options.response && props.pos.options.response
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            handleTextValid(e, /[^a-zA-Z\s]/g);
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
          <span>{props.pos.type}</span>
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
          value={
            textValue
              ? textValue
              : props.pos.options.response && props.pos.options.response
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            handleTextValid(e, /[^a-zA-Z\s]/g);
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
          <span>{props.pos.type}</span>
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
          value={
            textValue
              ? textValue
              : props.pos.options.response && props.pos.options.response
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            handleTextValid(e, /[^a-zA-Z\s]/g);
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
          <span>{props.pos.type}</span>
        </div>
      );
    case "date":
      return (
        <div>
          <DatePicker
            disabled={
              props.isNeedSign && props.data?.signerObjId !== props.signerObjId
            }
            onBlur={handleInputBlur}
            closeOnScroll={true}
            className="inputPlaceholder"
            style={{ outlineColor: "#007bff" }}
            selected={
              startDate
                ? startDate
                : props.pos.options?.response &&
                  new Date(props.pos.options.response)
            }
            onChange={(date) => {
              setStartDate(date);
            }}
            popperPlacement="top-end"
            customInput={<ExampleCustomInput />}
            dateFormat={
              props.selectDate
                ? props.selectDate?.format
                : props.pos?.options?.validation?.format
                  ? props.pos?.options?.validation?.format
                  : "dd MMMM, YYYY"
            }
          />
        </div>
      );

    case "image":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "10px",
            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.Id, props?.data.Role)}
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
          value={
            textValue
              ? textValue
              : props.pos.options?.response && props.pos.options.response
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            handleTextValid(
              e,
              /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            );
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
          <span>{props.pos.type}</span>
        </div>
      );
    case "radio":
      return (
        <div>
          {props.pos.options?.values.map((data, ind) => {
            return (
              <input
                key={ind}
                style={{
                  width: props.pos.Width,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "6px",
                  marginTop: "5px"
                }}
                type="radio"
                checked={isCheckedRadio.selectValue === data}
                // checked={isCheckedRadio.isChecked}
                onClick={() => {
                  setIsCheckedRadio({
                    isChecked: !isCheckedRadio,
                    selectValue: data
                  });
                }}
              />
            );
          })}
        </div>
      );
    case "label":
      return (
        <textarea
          onChange={(e) => {
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
          className="labelTextArea"
          cols="50"
          style={{
            zIndex: "99",
            height: "100%",
            width: "100%",
            resize: "none"
          }}
        />
      );
    default:
      return props.pos.SignUrl ? (
        <div style={{ pointerEvents: "none" }}>
          <img
            alt="signimg"
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );
  }
}

export default PlaceholderType;
