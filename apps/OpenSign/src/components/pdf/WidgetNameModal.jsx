import React, { useEffect, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import "../../styles/AddUser.css";
import RegexParser from "regex-parser";
import {
  signatureTypes,
  textInputWidget,
  cellsWidget,
  textWidget
} from "../../constant/Utils";
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
    textvalidate: "",
    isReadOnly: false,
    cellCount: 5
  });
  const [isValid, setIsValid] = useState(true);
  const statusArr = ["Required", "Optional"];
  const [signatureType, setSignatureType] = useState([]);

  const handleHint = () => {
    const type = props.defaultdata?.type;

    if (type === "signature") {
      return t("draw-signature");
    } else if (type === "stamp" || type === "image") {
      return type === "stamp" ? t("upload-stamp-image") : t("upload-image");
    } else if (type === "initials") {
      return t("draw-initials");
    } else if (type === textInputWidget) {
      return t("enter-text");
    } else {
      return t("enter-widgettype", { widgetType: type });
    }
  };
  useEffect(() => {
    if (props.defaultdata) {
      setFormdata({
        name: props.defaultdata?.options?.name || "",
        defaultValue: props.defaultdata?.options?.defaultValue || "",
        status: props.defaultdata?.options?.status || "required",
        hint: props.defaultdata?.options?.hint || handleHint(),
        textvalidate:
          props.defaultdata?.options?.validation?.type === "regex"
            ? props.defaultdata?.options?.validation?.pattern
            : props.defaultdata?.options?.validation?.type || "",
        isReadOnly: props.defaultdata?.options?.isReadOnly || false,
        cellCount: props.defaultdata?.options?.cellCount || 5
      });
    } else {
      setFormdata({
        ...formdata,
        name: props.defaultdata?.options?.name || "",
        cellCount: props.defaultdata?.options?.cellCount || 5
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
          alert(t("expect-default-one-signature-type"));
        } else {
          const data = { ...formdata, signatureType };
          props.handleData(data, props.defaultdata?.type);
        }
      } else {
        const isTextInput = [textInputWidget, cellsWidget].includes(
          props.defaultdata?.type
        );
        const { isReadOnly, defaultValue, status } = formdata;
        // If it’s a text‐input widget, enforce that read-only fields have
        // either a defaultValue or an "optional" status.
        if (isTextInput) {
          const readOnlyWithoutValue =
            isReadOnly && !defaultValue && status !== "optional";
          if (readOnlyWithoutValue) {
            alert(t("readonly-error", { widgetName: props.defaultdata?.type }));
            return;
          }
        }
        props.handleData(formdata);
      }
      setFormdata({
        isReadOnly: false,
        name: "",
        defaultValue: "",
        status: "required",
        hint: "",
        textvalidate: "",
        cellCount: 5
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

  const handleChangeValidateInput = (e) => {
    if (e) {
      if (e.target.value === "ssn") {
        setFormdata({
          ...formdata,
          [e.target.name]: e.target.value,
          hint: "xxx-xx-xxxx",
          cellCount: 11
        });
      } else {
        setFormdata({ ...formdata, [e.target.name]: e.target.value });
      }
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
    const val =
      props.defaultdata?.type === cellsWidget
        ? e.target.value.slice(0, formdata.cellCount)
        : e.target.value;
    setFormdata({ ...formdata, [e.target.name]: val });
  };

  function handleValidation(type) {
    switch (type) {
      case "email":
        return "/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/";
      case "number":
        return "/^\\d+$/";
      case "text":
        //allow space in text regex
        return "/^[a-zA-Z ]+$/";
      case "ssn":
        return "/^(?!000|666|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0000)\\d{4}$/";
      default:
        return type;
    }
  }


  const handleCheckboxChange = (index) => {
    // Update the state with the modified array
    setSignatureType((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };
  return (
    <ModalUi
      isOpen={props.isOpen}
      handleClose={props.handleClose && props.handleClose}
      title={
        ["signature", "initials"].includes(props.defaultdata?.type)
          ? t("signature-setting")
          : t("widget-info")
      }
    >
      <form
        onSubmit={handleSubmit}
        className={`${
          [textInputWidget, cellsWidget].includes(props.defaultdata?.type)
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
        {props.defaultdata?.type === cellsWidget && (
          <div className="mb-[0.75rem] text-[13px]">
            <label htmlFor="cellCount">{t("cell-count")}</label>
            <input
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              type="number"
              min="1"
              name="cellCount"
              value={formdata.cellCount}
              onChange={(e) => handleChange(e)}
              required
            />
          </div>
        )}
        {[textInputWidget, cellsWidget].includes(props.defaultdata?.type) &&
          props?.roleName !== "prefill" && (
            <>
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
                  maxLength={
                    props.defaultdata?.type === cellsWidget
                      ? formdata.cellCount
                      : undefined
                  }
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
        {!["signature", "initials"].includes(props.defaultdata?.type) &&
          props?.roleName !== "prefill" && (
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
                          setFormdata({
                            ...formdata,
                            status: data.toLowerCase()
                          })
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
              {[textInputWidget, cellsWidget].includes(
                props.defaultdata?.type
              ) &&
                props?.roleName !== "prefill" && (
                  <div className="flex items-center">
                    <input
                      id="isReadOnly"
                      name="isReadOnly"
                      type="checkbox"
                      checked={formdata.isReadOnly}
                      className="op-checkbox op-checkbox-xs"
                      onChange={() =>
                        setFormdata((prev) => ({
                          ...formdata,
                          isReadOnly: !prev.isReadOnly
                        }))
                      }
                    />
                    <label
                      className="ml-1.5 mb-0 capitalize text-[13px]"
                      htmlFor="isreadonly"
                    >
                      {t("read-only")}
                    </label>
                  </div>
                )}
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
        {props?.roleName !== "prefill" && (
          <div className="mb-[0.75rem]">
            <label htmlFor="hint" className="text-[13px]">
              {t("hint")}
            </label>
            <input
              maxLength={40}
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
          cellsWidget,
          "name",
          "company",
          "job title",
          "email"
        ].includes(props.defaultdata?.type) && (
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
            <div className="flex items-center gap-2 ">
              <span className="whitespace-nowrap">{t("font-size")}: </span>
              <select
                className="ml-[7px] w-[60%] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
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
            </div>
            <div className="flex items-center">
              <span>{t("color")}: </span>
              <select
                value={
                  props.fontColor ||
                  props.defaultdata?.options?.fontColor ||
                  "black"
                }
                onChange={(e) => props.setFontColor(e.target.value)}
                className="ml-[33px] md:ml-4 w-[65%] md:w-[full] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
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
