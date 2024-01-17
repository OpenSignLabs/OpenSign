import React, { useState } from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import ModalUi from "../../premitives/ModalUi";
function DropdownWidgetOption(props) {
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "option-1",
    "option-2"
  ]);

  const [dropdownName, setDropdownName] = useState("Dropdown-1");
  const [error, setError] = useState("");
  const handleInputChange = (index, value) => {
    setDropdownOptionList((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = value;
      return newInputs;
    });
  };

  const handleAddInput = () => {
    setDropdownOptionList((prevInputs) => [...prevInputs, ""]);
  };

  const handleDeleteInput = (ind) => {
    const getUpdatedOptions = dropdownOptionList.filter(
      (data, index) => index !== ind
    );
    setDropdownOptionList(getUpdatedOptions);
  };
  const handleSaveOption = () => {
    const existEmptyOption = dropdownOptionList.some((data) => data === "");

    if (existEmptyOption) {
      setError("Enter all option");
      setTimeout(() => {
        setError("");
      }, 1000);
    } else {
      props.handleSaveDropdownOptions(dropdownName, dropdownOptionList);
      props.setShowDropdown(false);
    }
  };

  return (
    //props.showDropdown
    <ModalUi
      dropdownModal={"dropdownModal"}
      isOpen={props.showDropdown}
      title={"Dropdown options"}
      closeOff={true}
      // handleClose={() => props.setShowDropdown(false)}
    >
      <div style={{ height: "100%", padding: 20 }}>
        <div className="dropdownContainer">
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Name</label>
          <input
            defaultValue={dropdownName}
            value={dropdownName}
            onChange={(e) => setDropdownName(e.target.value)}
            className="drodown-input"
          />
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
                  marginBottom: "5px"
                }}
              >
                <input
                  className="drodown-input"
                  type="text"
                  value={option}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />

                <i
                  className="fa-solid fa-rectangle-xmark"
                  onClick={() => handleDeleteInput(index)}
                  style={{ color: "red", fontSize: "25px", marginLeft: "10px" }}
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
        <span style={{ fontSize: "13px", color: "red" }}>{error}</span>
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
          onClick={() => handleSaveOption()}
          disabled={dropdownOptionList.length === 0 && true}
          style={{
            background: themeColor(),
            color: "white"
          }}
          type="button"
          className={"finishBtn"}
        >
          Save
        </button>
        {/* <button
          onClick={() => props.setShowDropdown(false)}
          style={{
            color: "black"
          }}
          type="button"
          className="finishBtn"
        >
          cancel
        </button> */}
      </div>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
