import React from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import ModalUi from "../../premitives/ModalUi";

function InputValidation(props) {
  const options = ["email", "number", "text"];
  return (
    <ModalUi
      isOpen={props.isValidate}
      handleClose={() => {
        props.setIsValidate(false);
      }}
      title={"Validation"}
    >
      <div style={{ height: "100%", padding: 20 }}>
        <div className="validateText">
          <label
            style={{
              marginRight: "5px",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Regular expression:
          </label>

          <div style={{ position: "relative" }}>
            <input
              value={props.textValidate}
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                height: "100%"
              }}
              placeholder="Enter custom regular expression"
              className="drodown-input validateInputText"
              onChange={(e) => props.setTextValidate(e.target.value)}
            />
            <select
              value=""
              className="regxSelect"
              onChange={(e) => props.setTextValidate(e.target.value)}
            >
              {options.map((data) => {
                return <option value={data}>{data}</option>;
              })}
            </select>
          </div>
          {/* {validateError && (
            <p style={{ color: "red", fontSize: "12px" }}>{validateError}</p>
          )} */}

          {/* <CustomSelect/> */}
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#9f9f9f",
            width: "100%",
            marginTop: "15px",
            marginBottom: "15px"
          }}
        ></div>
        <button
          onClick={() => {
            props.handleValidateInput();
          }}
          style={{
            background: themeColor()
          }}
          type="button"
          // disabled={!selectCopyType}
          className="finishBtn"
        >
          Apply
        </button>
      </div>
    </ModalUi>
  );
}

export default InputValidation;
