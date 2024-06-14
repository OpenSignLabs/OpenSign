import React, { useEffect, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import "../../styles/AddUser.css";
import RegexParser from "regex-parser";
import { textInputWidget } from "../../constant/Utils";
import PremiumAlertHeader from "../../primitives/PremiumAlertHeader";
import Upgrade from "../../primitives/Upgrade";
import { isEnableSubscription } from "../../constant/const";
import Tooltip from "../../primitives/Tooltip";

const WidgetNameModal = (props) => {
  const [formdata, setFormdata] = useState({
    name: "",
    defaultValue: "",
    status: "required",
    hint: "",
    textvalidate: ""
  });
  const [isValid, setIsValid] = useState(true);
  const statusArr = ["Required", "Optional"];
  const inputOpt = ["text", "email", "number"];

  useEffect(() => {
    if (props.defaultdata) {
      setFormdata({
        name: props.defaultdata?.options?.name || props?.widgetName || "",
        defaultValue: props.defaultdata?.options?.defaultValue || "",
        status: props.defaultdata?.options?.status || "required",
        hint: props.defaultdata?.options?.hint || "",
        textvalidate:
          props.defaultdata?.options?.validation?.type === "regex"
            ? props.defaultdata?.options?.validation?.pattern
            : props.defaultdata?.options?.validation?.type || ""
      });
    } else {
      setFormdata({
        ...formdata,
        name: props.defaultdata?.options?.name || props?.widgetName || ""
      });
    }
    // eslint-disable-next-line
  }, [props.defaultdata, props.widgetName]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.handleData) {
      props.handleData(formdata);
      setFormdata({
        name: "",
        defaultValue: "",
        status: "required",
        hint: "",
        textvalidate: ""
      });
    }
  };
  const handleChange = (e) => {
    if (e) {
      setFormdata({ ...formdata, [e.target.name]: e.target.value });
    } else {
      setFormdata({ ...formdata, textvalidate: "" });
    }
  };

  const handledefaultChange = (e) => {
    if (formdata.textvalidate) {
      const regexObject = RegexParser(handleValidation(formdata.textvalidate));
      const isValidate = regexObject?.test(e.target.value);
      setIsValid(isValidate);
    } else {
      setIsValid(true);
    }
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  function handleValidation(type) {
    switch (type) {
      case "email":
        return "/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/";
      case "number":
        return "/^\\d+$/";
      case "text":
        return "/^[a-zA-Zs]+$/";
      default:
        return type;
    }
  }

  function handleBlurRegex() {
    if (!formdata.textvalidate) {
      setFormdata({ ...formdata, textvalidate: "" });
    } else {
      if (formdata.defaultValue) {
        const regexObject = RegexParser(
          handleValidation(formdata.textvalidate)
        );
        const isValidate = regexObject?.test(formdata.defaultValue);
        if (isValidate === false) {
          setFormdata({ ...formdata, defaultValue: "" });
        }
      }
    }
  }
  return (
    <ModalUi
      isOpen={props.isOpen}
      handleClose={props.handleClose && props.handleClose}
      title={"Widget info"}
    >
      {(props.defaultdata?.type === textInputWidget ||
        props.widgetName === textInputWidget) &&
        !isEnableSubscription && (
          <PremiumAlertHeader
            message={
              "Field validations are free in beta, this feature will incur a fee later."
            }
          />
        )}
      <form
        onSubmit={handleSubmit}
        className={`${
          props.defaultdata?.type === textInputWidget ||
          props.widgetName === textInputWidget
            ? "pt-0"
            : ""
        } p-[20px] text-base-content`}
      >
        <div className="mb-[0.75rem] text-[13px]">
          <label htmlFor="name">
            Name
            <span className="text-[red]"> *</span>
          </label>
          <input
            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            name="name"
            value={formdata.name}
            onChange={(e) => handleChange(e)}
            required
          />
        </div>
        {(props.defaultdata?.type === textInputWidget ||
          props.widgetName === textInputWidget) && (
          <>
            <div className="mb-[0.75rem]">
              <div className="flex items-center gap-1">
                <label
                  htmlFor="textvalidate"
                  className={`${
                    !props.isSubscribe && isEnableSubscription
                      ? "bg-opacity-50 pointer-events-none"
                      : ""
                  } text-[13px]`}
                >
                  Validation
                </label>
                <Tooltip
                  url={"https://www.w3schools.com/jsref/jsref_obj_regexp.asp"}
                />
                {!props.isSubscribe && isEnableSubscription && <Upgrade />}
              </div>
              <div
                className={`${
                  !props.isSubscribe && isEnableSubscription
                    ? "bg-opacity-50 pointer-events-none"
                    : ""
                } flex flex-row gap-[10px] mb-[0.5rem]`}
              >
                <div className="w-full relative group">
                  <input
                    className="z-20 relative op-input op-input-bordered rounded-r-none op-input-sm focus:outline-none group-hover:border-base-content w-[87%] md:w-[92%] text-xs"
                    name="textvalidate"
                    placeholder="Enter custom regular expression"
                    value={formdata.textvalidate}
                    onChange={(e) => handleChange(e)}
                    // onBlur={() => handleBlurRegex()}
                  />
                  <select
                    className="validationlist op-input op-input-bordered op-input-sm focus:outline-none group-hover:border-base-content w-full text-xs"
                    name="textvalidate"
                    value={formdata.textvalidate}
                    onChange={(e) => handleChange(e)}
                    onBlur={() => handleBlurRegex()}
                  >
                    <option
                      disabled={formdata?.textvalidate}
                      className="text-[13px]"
                    >
                      Select...
                    </option>
                    {inputOpt.map((data, ind) => {
                      return (
                        <option className="text-[13px]" key={ind} value={data}>
                          {data}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-[0.75rem]">
              <label htmlFor="name" className="text-[13px]">
                Default value
              </label>
              <input
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                name="defaultValue"
                value={formdata.defaultValue}
                onChange={(e) => handledefaultChange(e)}
                autoComplete="off"
                onBlur={() => {
                  if (isValid === false) {
                    setFormdata({ ...formdata, defaultValue: "" });
                    setIsValid(true);
                  }
                }}
              />
              {isValid === false && (
                <div
                  className="warning defaultvalueWarning"
                  style={{ fontSize: 12 }}
                >
                  <i
                    className="fas fa-exclamation-circle text-[15px]"
                    style={{ color: "#fab005" }}
                  ></i>
                  invalid default value
                </div>
              )}
            </div>
          </>
        )}
        <div className="mb-[0.75rem]">
          <div className="flex flex-row gap-[10px] mb-[0.5rem]">
            {statusArr.map((data, ind) => {
              return (
                <div key={ind} className="flex flex-row gap-[5px] items-center">
                  <input
                    className="mr-[2px] op-radio op-radio-xs"
                    type="radio"
                    name="status"
                    onChange={() =>
                      setFormdata({ ...formdata, status: data.toLowerCase() })
                    }
                    checked={
                      formdata.status.toLowerCase() === data.toLowerCase()
                    }
                  />
                  <div className="text-[13px] font-medium">{data}</div>
                </div>
              );
            })}
          </div>
        </div>
        {(props.defaultdata?.type === textInputWidget ||
          props?.widgetName === textInputWidget) && (
          <div className="mb-[0.75rem]">
            <label htmlFor="hint" className="text-[13px]">
              Hint
            </label>
            <input
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              name="hint"
              value={formdata.hint}
              onChange={(e) => handleChange(e)}
            />
          </div>
        )}
        <div className="h-[1px] w-full mb-[16px] bg-[#b7b3b3]"></div>
        <button type="submit" className="op-btn op-btn-primary">
          Save
        </button>
      </form>
    </ModalUi>
  );
};

export default WidgetNameModal;
