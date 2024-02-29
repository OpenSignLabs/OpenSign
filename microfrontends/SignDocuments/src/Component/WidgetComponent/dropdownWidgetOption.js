import React, { useEffect, useState } from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import ModalUi from "../../premitives/ModalUi";
function DropdownWidgetOption(props) {
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "option-1",
    "option-2"
  ]);
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [dropdownName, setDropdownName] = useState(props.type);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [status, setStatus] = useState("required");
  const [defaultValue, setDefaultValue] = useState("");
  const statusArr = ["required", "optional"];

  useEffect(() => {
    if (
      props.currWidgetsDetails?.options?.name &&
      props.currWidgetsDetails?.options?.values
    ) {
      setDropdownName(props.currWidgetsDetails?.options?.name);
      setDropdownOptionList(props.currWidgetsDetails?.options?.values);
      setMinCount(
        props.currWidgetsDetails?.options?.validation?.minRequiredCount
      );
      setMaxCount(
        props.currWidgetsDetails?.options?.validation?.maxRequiredCount
      );
      setIsReadOnly(props.currWidgetsDetails?.options?.isReadOnly);
      setStatus(props.currWidgetsDetails?.options?.status || "required");
      setDefaultValue(props.currWidgetsDetails?.options?.defaultValue);
    } else {
      setStatus("required");
    }
  }, [props.currWidgetsDetails]);
  const handleInputChange = (index, value) => {
    setDropdownOptionList((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = value;
      return newInputs;
    });
  };

  const handleAddInput = () => {
    const flage = true;
    setDropdownOptionList((prevInputs) => [...prevInputs, ""]);
    props.handleSaveWidgetsOptions(null, null, null, null, null, flage, false);
  };

  const handleDeleteInput = (ind) => {
    const flage = true;
    const getUpdatedOptions = dropdownOptionList.filter(
      (data, index) => index !== ind
    );
    setDropdownOptionList(getUpdatedOptions);
    props.handleSaveWidgetsOptions(null, null, null, null, null, false, flage);
  };
  const handleSaveOption = () => {
    props.handleSaveWidgetsOptions(
      dropdownName,
      dropdownOptionList,
      minCount,
      maxCount,
      isReadOnly,
      null,
      null,
      status,
      defaultValue
    );
    props.setShowDropdown(false);
    setDropdownOptionList(["option-1", "option-2"]);
    setDropdownName(props.type);
    props.setCurrWidgetsDetails([]);
    setIsReadOnly(false);
    setMinCount(0);
    setMaxCount(0);
  };

  const handleSetMinMax = (e) => {
    const minValue = e.target.value;
    if (minValue > dropdownOptionList.length) {
      return "";
    } else {
      return minValue;
    }
  };
  return (
    //props.showDropdown
    <ModalUi
      dropdownModal={"dropdownModal"}
      isOpen={props.showDropdown}
      title={props.title}
      closeOff={true}
    >
      <div style={{ height: "100%", padding: 20 }}>
        {props.type === "checkbox" && !props.isSignYourself && (
          <>
            <input
              type="checkbox"
              checked={isReadOnly}
              onChange={(e) => {
                setIsReadOnly(e.target.checked);
              }}
            />

            <label style={{ marginLeft: "10px" }}>Is read only</label>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveOption();
          }}
        >
          <div className="dropdownContainer">
            <label style={{ fontSize: "13px", fontWeight: "600" }}>
              Name<span style={{ color: "red", fontSize: 13 }}> *</span>
            </label>
            <input
              required
              defaultValue={dropdownName}
              value={dropdownName}
              onChange={(e) => setDropdownName(e.target.value)}
              className="drodown-input"
            />
            {props.type !== "checkbox" && (
              <>
                <label
                  style={{ fontSize: "13px", fontWeight: "600", marginTop: 2 }}
                >
                  status
                </label>
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
                          style={{ accentColor: "red" }}
                          type="radio"
                          name="status"
                          onChange={(e) => setStatus(data.toLowerCase())}
                          checked={status.toLowerCase() === data.toLowerCase()}
                        />
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>
                          {data}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {props.type !== "checkbox" && (
              <>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Default value
                </label>
                <input
                  // defaultValue={dropdownName}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  className="drodown-input"
                />
              </>
            )}
            {props.type === "checkbox" && !props.isSignYourself && (
              <>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Minimun required count
                </label>
                <input
                  required
                  defaultValue={0}
                  value={minCount}
                  onChange={(e) => {
                    const count = handleSetMinMax(e);
                    setMinCount(count);
                  }}
                  className="drodown-input"
                />
                <label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Maximum required count
                </label>
                <input
                  required
                  defaultValue={0}
                  value={maxCount}
                  onChange={(e) => {
                    const count = handleSetMinMax(e);
                    setMaxCount(count);
                  }}
                  className="drodown-input"
                />
              </>
            )}
            <label
              style={{ fontSize: "13px", fontWeight: "600", marginTop: "5px" }}
            >
              Options
            </label>

            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              {dropdownOptionList.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "5px",
                    alignItems: "center"
                  }}
                >
                  <input
                    required
                    className="drodown-input"
                    type="text"
                    value={option}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />

                  <i
                    className="fa-solid fa-rectangle-xmark"
                    onClick={() => handleDeleteInput(index)}
                    style={{
                      color: "red",
                      fontSize: "25px",
                      marginLeft: "10px"
                    }}
                  ></i>
                </div>
              ))}

              <i
                onClick={handleAddInput}
                style={{
                  cursor: "pointer",
                  color: themeColor(),
                  fontSize: "25px",
                  marginLeft: "10px"
                }}
                className="fa-solid fa-square-plus"
              ></i>
            </div>
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
            // onClick={() => handleSaveOption()}
            disabled={dropdownOptionList.length === 0 && true}
            style={{
              background: themeColor(),
              color: "white"
            }}
            type="submit"
            className={"finishBtn"}
          >
            Save
          </button>
          {props.currWidgetsDetails?.options?.values?.length > 0 && (
            <button
              type="submit"
              className="finishBtn cancelBtn"
              onClick={() => {
                setDropdownOptionList(["option-1", "option-2"]);
                setDropdownName(props.type);
                props.setCurrWidgetsDetails([]);
                props.setShowDropdown(false);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
