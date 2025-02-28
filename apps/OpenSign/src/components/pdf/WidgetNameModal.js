import React, { useEffect, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import "../../styles/AddUser.css";
import RegexParser from "regex-parser";
import {
  signatureTypes,
  textInputWidget,
  textWidget
} from "../../constant/Utils";
import Upgrade from "../../primitives/Upgrade";
import { isEnableSubscription } from "../../constant/const";
import Tooltip from "../../primitives/Tooltip";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const WidgetNameModal = (props) => {
  const { t } = useTranslation();
  const signTypes = props?.signatureType || signatureTypes;
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
  const [signatureType, setSignatureType] = useState([]);

  useEffect(() => {
    if (props.defaultdata) {
      setFormdata({
        name: props.defaultdata?.options?.name || "",
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
        name: props.defaultdata?.options?.name || ""
      });
    }

    if (signTypes.length > 0) {
      const defaultSignatureType = signTypes || [];
      setSignatureType(defaultSignatureType);
    }
    // eslint-disable-next-line
  }, [props.defaultdata]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.handleData) {
      if (["signature", "initials"].includes(props.defaultdata?.type)) {
        const enabledSignTypes = signatureType?.filter((x) => x.enabled);
        const isDefaultSignTypeOnly =
          enabledSignTypes?.length === 1 &&
          enabledSignTypes[0]?.name === "default";
        if (enabledSignTypes.length === 0) {
          alert(t("at-least-one-signature-type"));
        } else if (isDefaultSignTypeOnly) {
          alert(t("expect-default-one-more-signature-type"));
        } else {
          const data = { ...formdata, signatureType };
          props.handleData(data, props.defaultdata?.type);
        }
      } else {
        props.handleData(formdata);
      }
      setFormdata({
        name: "",
        defaultValue: "",
        status: "required",
        hint: "",
        textvalidate: ""
      });
      setSignatureType(signTypes);
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

  const handleCheckboxChange = (index) => {
    // Create a copy of the signatureType array
    const updatedSignatureType = [...signatureType];
    // Toggle the enabled value for the clicked item
    updatedSignatureType[index].enabled = !updatedSignatureType[index].enabled;
    // Update the state with the modified array
    setSignatureType(updatedSignatureType);
  };
  return (
    <ModalUi
      isOpen={props.isOpen}
      handleClose={props.handleClose && props.handleClose}
      title={t("widget-info")}
    >
      <form
        onSubmit={handleSubmit}
        className={`${
          props.defaultdata?.type === textInputWidget
            ? "pt-0"
            : ["signature", "initials"].includes(props.defaultdata?.type)
              ? "pt-2"
              : ""
        } p-[20px] text-base-content`}
      >
        {!["signature", "initials"].includes(props.defaultdata?.type) && (
          <div className="mb-[0.75rem] text-[13px]">
            <label htmlFor="name">
              {t("name")}
              <span className="text-[red]"> *</span>
            </label>
            <input
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              name="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
        )}
        {props.defaultdata?.type === textInputWidget && (
          <>
            {isEnableSubscription && (
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
                    {t("validation")}
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
                          <option
                            className="text-[13px]"
                            key={ind}
                            value={data}
                          >
                            {data}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-[0.75rem]">
              <label htmlFor="name" className="text-[13px]">
                {t("default-value")}
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
                    className="fa-light fa-exclamation-circle text-[15px]"
                    style={{ color: "#fab005" }}
                  ></i>
                  {t("invalid-default-value")}
                </div>
              )}
            </div>
          </>
        )}
        {!["signature", "initials"].includes(props.defaultdata?.type) && (
          <div className="mb-[0.75rem]">
            <div className="flex flex-row gap-[10px] mb-[0.5rem]">
              {statusArr.map((data, ind) => {
                return (
                  <div
                    key={ind}
                    className="flex flex-row gap-[5px] items-center"
                  >
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
                    <div className="text-[13px] font-medium">
                      {t(`widget-status.${data}`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {["signature", "initials"].includes(props.defaultdata?.type) && (
          <div className="mb-[0.75rem]">
            <label htmlFor="signaturetype" className="text-[14px] mb-[0.7rem]">
              {t("allowed-signature-types")}
            </label>
            <div className=" ml-[7px] flex flex-col md:flex-row gap-[10px] mb-[0.7rem]">
              {signatureType.map((type, i) => {
                return (
                  <div key={i} className="flex flex-row gap-[5px] items-center">
                    <input
                      className="mr-[2px] op-checkbox op-checkbox-xs"
                      type="checkbox"
                      name="signaturetype"
                      onChange={() => handleCheckboxChange(i)}
                      checked={type.enabled}
                    />
                    <div
                      className="text-[13px] font-medium hover:underline underline-offset-2 cursor-default capitalize"
                      title={`Enabling this allow signers to ${type.name} signature`}
                    >
                      {type.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {props.defaultdata?.type === textInputWidget && (
          <div className="mb-[0.75rem]">
            <label htmlFor="hint" className="text-[13px]">
              {t("hint")}
            </label>
            <input
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              name="hint"
              value={formdata.hint}
              onChange={(e) => handleChange(e)}
            />
          </div>
        )}
        {[
          textInputWidget,
          textWidget,
          "name",
          "company",
          "job title",
          "email"
        ].includes(props.defaultdata?.type) && (
          <div className="flex items-center mb-[0.75rem]">
            <span>{t("font-size")}:</span>
            <select
              className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={
                props.fontSize || props.defaultdata?.options?.fontSize || 12
              }
              onChange={(e) => props.setFontSize(parseInt(e.target.value))}
            >
              {fontsizeArr.map((size, ind) => {
                return (
                  <option className="text-[13px]" value={size} key={ind}>
                    {size}
                  </option>
                );
              })}
            </select>
            <div className="flex flex-row gap-1 items-center ml-4">
              <span>{t("color")}: </span>
              <select
                value={
                  props.fontColor ||
                  props.defaultdata?.options?.fontColor ||
                  "black"
                }
                onChange={(e) => props.setFontColor(e.target.value)}
                className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              >
                {fontColorArr.map((color, ind) => {
                  return (
                    <option value={color} key={ind}>
                      {t(`color-type.${color}`)}
                    </option>
                  );
                })}
              </select>
              <span
                style={{
                  background:
                    props.fontColor ||
                    props.defaultdata?.options?.fontColor ||
                    "black"
                }}
                className="w-5 h-[19px] ml-1"
              ></span>
            </div>
          </div>
        )}

        <div className="h-[1px] w-full mb-[16px] bg-[#b7b3b3]"></div>
        <button type="submit" className="op-btn op-btn-primary">
          {t("save")}
        </button>
      </form>
    </ModalUi>
  );
};

export default WidgetNameModal;
