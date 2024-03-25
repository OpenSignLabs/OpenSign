import React, { useEffect, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import "../../styles/AddUser.css";
import RegexParser from "regex-parser";
import { textInputWidget } from "../../constant/Utils";
import PremiumAlertHeader from "../../primitives/PremiumAlertHeader";

const WidgetNameModal = (props) => {
  const [formdata, setFormdata] = useState({
    name: "",
    defaultValue: "",
    status: "required",
    hint: "",
    textvalidate: "text"
  });
  const [isValid, setIsValid] = useState(true);
  const statusArr = ["Required", "Optional"];
  const inputOpt = ["email", "number"];

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
        textvalidate: "text"
      });
    }
  };
  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
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
      case textInputWidget:
        return "/^[a-zA-Zs]+$/";
      default:
        return type;
    }
  }

  function handleBlurRegex() {
    if (!formdata.textvalidate) {
      setFormdata({ ...formdata, textvalidate: "text" });
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
        props.widgetName === textInputWidget) && (
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
        } p-[20px]`}
      >
        <div className="form-section">
          <label htmlFor="name" style={{ fontSize: 13 }}>
            Name
            <span style={{ color: "red", fontSize: 13 }}> *</span>
          </label>
          <input
            className="addUserInput"
            name="name"
            value={formdata.name}
            onChange={(e) => handleChange(e)}
            required
          />
        </div>
        {(props.defaultdata?.type === textInputWidget ||
          props.widgetName === textInputWidget) && (
          <>
            <div className="form-section">
              <label htmlFor="textvalidate" style={{ fontSize: 13 }}>
                Validation
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 10,
                  marginBottom: "0.5rem"
                }}
              >
                <div style={{ width: "100%", position: "relative" }}>
                  <input
                    className="relative z-20 w-[87%] md:w-[92%] p-2.5 border-[1px] border-[#d1d5db] rounded-l-md outline-none text-xs"
                    name="textvalidate"
                    placeholder="Enter custom expression"
                    value={formdata.textvalidate}
                    onChange={(e) => handleChange(e)}
                    // onBlur={() => handleBlurRegex()}
                  />
                  <select
                    className="validationlist addUserInput"
                    name="textvalidate"
                    value={formdata.textvalidate}
                    onChange={(e) => handleChange(e)}
                    onBlur={() => handleBlurRegex()}
                  >
                    <option disabled style={{ fontSize: "13px" }}>
                      Select...
                    </option>
                    {inputOpt.map((data, ind) => {
                      return (
                        <option
                          style={{ fontSize: "13px" }}
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
            <div className="form-section">
              <label htmlFor="name" style={{ fontSize: 13 }}>
                Default value
              </label>
              <input
                className="addUserInput"
                name="defaultValue"
                value={formdata.defaultValue}
                onChange={(e) => handledefaultChange(e)}
                onBlur={() =>
                  isValid === false &&
                  setFormdata({ ...formdata, defaultValue: "" })
                }
              />
              {isValid === false ? (
                <p style={{ color: "Red", fontSize: 8 }}>
                  invalid default value
                </p>
              ) : (
                <p
                  style={{
                    color: "transparent",
                    fontSize: 10,
                    margin: "3px 8px"
                  }}
                >
                  .
                </p>
              )}
            </div>
          </>
        )}
        <div className="form-section">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              marginBottom: "0.5rem"
            }}
          >
            {statusArr.map((data, ind) => {
              return (
                <div
                  key={ind}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center"
                  }}
                >
                  <input
                    style={{ accentColor: "red", marginRight: "10px" }}
                    type="radio"
                    name="status"
                    onChange={() =>
                      setFormdata({ ...formdata, status: data.toLowerCase() })
                    }
                    checked={
                      formdata.status.toLowerCase() === data.toLowerCase()
                    }
                  />
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {data}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {(props.defaultdata?.type === textInputWidget ||
          props?.widgetName === textInputWidget) && (
          <div className="form-section">
            <label htmlFor="hint" style={{ fontSize: 13 }}>
              Hint
            </label>
            <input
              className="addUserInput"
              name="hint"
              value={formdata.hint}
              onChange={(e) => handleChange(e)}
            />
          </div>
        )}
        <div
          style={{
            height: 1,
            backgroundColor: "#b7b3b3",
            width: "100%",
            marginBottom: "16px"
          }}
        ></div>
        <button
          style={{
            color: "white",
            padding: "5px 20px",
            backgroundColor: "#32a3ac"
          }}
          type="submit"
          className="finishBtn"
        >
          Save
        </button>
      </form>
    </ModalUi>
  );
};

export default WidgetNameModal;
