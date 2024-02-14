import React, { useEffect } from "react";
import ModalUi from "../../premitives/ModalUi";
import { themeColor } from "../../utils/ThemeColor/backColor";

function CheckboxStatus(props) {
  const checkboxType = ["Optional", "Required", "Read only"];

  useEffect(() => {
    if (props.currWidgetsDetails?.widgetStatus) {
      props.setSelectRequiredType(props.currWidgetsDetails?.widgetStatus);
    }
  }, [props.currWidgetsDetails]);

  return (
    <ModalUi isOpen={props.isCheckboxRequired} title={"Checkbox"}>
      <div style={{ height: "100%", padding: 20 }}>
        {checkboxType.map((data, ind) => {
          return (
            <div key={ind} style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "16px", fontWeight: "500" }}>
                <input
                  style={{ accentColor: "red", marginRight: "10px" }}
                  type="radio"
                  value={data}
                  onChange={() => props.setSelectRequiredType(data)}
                  checked={props.selectRequiredType === data}
                />

                {data}
              </label>
            </div>
          );
        })}

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
            props.handleApplyWidgetsStatus();
          }}
          style={{
            background: themeColor()
          }}
          type="button"
          className="finishBtn"
        >
          Apply
        </button>
        {props.currWidgetsDetails?.widgetStatus && (
          <button
            type="submit"
            className="finishBtn cancelBtn"
            onClick={() => {
              props.setCurrWidgetsDetails([]);
              props.setIsCheckboxRequired(false);
              props.setSelectRequiredType("Optional");
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </ModalUi>
  );
}

export default CheckboxStatus;
