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
  const [inputValue, setInputValue] = useState("");
  const [isCheckedRadio, setIsCheckedRadio] = useState(false);

  const validateExpression = (regexValidation) => {
    let isValidate = regexValidation.test(inputValue);
    if (!isValidate) {
      props.setValidateAlert(true);
      inputRef.current.focus();
    }
  };

  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
    const validateType = props.pos?.validation;
    let regexValidation;
    if (props.pos?.validation) {
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
      }
    }
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
    }
  }
  useEffect(() => {
    if (props.pos.validation) {
      checkRegularExpress(props.pos.validation);
    }
  }, []);

  useEffect(() => {
    if (props.isNeedSign) {
      const updateDate = new Date(props.pos.widgetValue);
      setStartDate(updateDate);
    }
  }, []);

  useEffect(() => {
    onChangeInput(
      isCheckedRadio,
      props.pos.key,
      props.xyPostion,
      props.index,
      props.setXyPostion,
      props.data && props.data.signerObjId,
      false
    );
  }, [isCheckedRadio]);
  useEffect(() => {
    if (props.selectDate) {
      const updateDate = new Date(props.saveDateFormat);
      setStartDate(updateDate);
      const dateObj = {
        date: props.saveDateFormat,
        format: props.selectDate
          ? props.selectDate?.format
          : props.pos?.dateFormat
            ? props.pos?.dateFormat
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
      props.data && props.data.signerObjId,
      false,
      props.selectDate?.format
        ? props.selectDate.format
        : props.pos?.dateFormat
          ? props.pos?.dateFormat
          : "MM/dd/YYYY"
    );
  }, [props.saveDateFormat]);

  const dateValue = (value) => {
    props.setSaveDateFormat(value);
    return <span>{value}</span>;
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      className="inputPlaceholder"
      style={{ overflow: "hidden" }}
      onClick={onClick}
      ref={ref}
    >
      {dateValue(value)}
      <i class="fa-solid fa-calendar" style={{ marginLeft: "5px" }}></i>
    </div>
  ));

  useEffect(() => {
    const senderUser = localStorage.getItem(`Extand_Class`);
    const jsonSender = JSON.parse(senderUser);

    if (props.isNeedSign && props.data?.signerObjId === props.signerObjId) {
      onChangeInput(
        jsonSender && jsonSender[0],
        null,
        props.xyPostion,
        null,
        props.setXyPostion,
        props.signerObjId,
        true
      );
    }
  }, [type]);

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
          defaultChecked={props.pos?.widgetStatus === "Read only"}
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isNeedSign && props.pos?.widgetStatus === "Read only"
                ? true
                : props.isPlaceholder
          }
          onBlur={handleInputBlur}
          checked={props.pos.widgetValue}
          onChange={(e) =>
            onChangeInput(
              e.target.checked,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      );
    case "text":
      return (
        <input
          className="inputPlaceholder"
          ref={inputRef}
          placeholder={validatePlaceholder}
          type="text"
          tabIndex="0"
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isPlaceholder
          }
          onBlur={handleInputBlur}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            );
          }}
        />
      );
    case "dropdown":
      return props.data?.signerObjId === props.signerObjId ? (
        <select
          className="inputPlaceholder"
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
              props.data && props.data.signerObjId,
              false
            );
          }}
        >
          {/* Default/Title option */}
          <option value="" disabled hidden>
            {props.pos.widgetName}
          </option>

          {props.pos.widgetOption.map((data, ind) => {
            return <option value={data}>{data}</option>;
          })}
        </select>
      ) : (
        <div className="inputPlaceholder">
          {props.pos.widgetName ? props.pos.widgetName : props.pos.type}
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
          className="inputPlaceholder"
          type="text"
          value={props.pos.widgetValue}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
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
          value={props.pos.widgetValue && props.pos.widgetValue}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
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
          value={props.pos.widgetValue && props.pos.widgetValue}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.type}</span>
        </div>
      );
    case "date":
      return (
        <div>
          {/* <input
            placeholder="mm/dd/yyyy"
            className="inputPlaceholder"
            style={{ outlineColor: "#007bff" }}
            type="date"
            disabled={props.isPlaceholder ? true : false}
            onBlur={handleInputBlur}
            //  value={props.selectDate && formatDate(props.selectDate)}
            // value={props.selectDate && props.selectDate}
            onChange={(e) => {
              props.setSelectDate(e.target.value);
              onChangeInput(
                e.target.value,
                props.pos.key,
                props.xyPostion,
                props.index,
                props.setXyPostion,
                props.data && props.data.signerObjId,
                false
              );
            }}
          /> */}
          <DatePicker
            disabled={
              props.isNeedSign && props.data?.signerObjId !== props.signerObjId
            }
            // disabled={props.isPlaceholder ? true : false}
            onBlur={handleInputBlur}
            closeOnScroll={true}
            className="inputPlaceholder"
            style={{ outlineColor: "#007bff" }}
            selected={
              // props.pos?.widgetValue ? props.pos.widgetValue :
              startDate
                ? startDate
                : props.pos?.widgetValue && new Date(props.pos.widgetValue)
            }
            onChange={(date) => {
              setStartDate(date);

              // onChangeInput(
              //   props.saveDateFormat,
              //   props.pos.key,
              //   props.xyPostion,
              //   props.index,
              //   props.setXyPostion,
              //   props.data && props.data.signerObjId,
              //   false,
              //   props.selectDate?.format
              //     ? props.selectDate.format
              //     : "MM/dd/YYYY"
              // );
            }}
            popperPlacement="top-end"
            customInput={<ExampleCustomInput />}
            dateFormat={
              props.selectDate
                ? props.selectDate?.format
                : props.pos?.dateFormat
                  ? props.pos?.dateFormat
                  : "dd MMMM, YYYY"
            }
          />
          {/* <div style={{ position: "absolute" }}>{props.selectDate}</div> */}
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
          value={props.pos.widgetValue && props.pos.widgetValue}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.type}</span>
        </div>
      );
    case "radio":
      return (
        <label
          style={{ borderRadius: "50%", textAlign: "center" }}
          className="inputPlaceholder"
        >
          <input
            type="radio"
            checked={isCheckedRadio}
            onClick={() => {
              setIsCheckedRadio(!isCheckedRadio);
            }}
          />
        </label>
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
