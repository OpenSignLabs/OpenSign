import React, { useEffect, useState } from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import ModalUi from "../../premitives/ModalUi";
function DropdownWidgetOption(props) {
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "option-1",
    "option-2"
  ]);

  const [dropdownName, setDropdownName] = useState("Field-1");

  useEffect(() => {
    if (
      props.currWidgetsDetails?.widgetName &&
      props.currWidgetsDetails?.widgetOption
    ) {
      setDropdownName(props.currWidgetsDetails?.widgetName);
      setDropdownOptionList(props.currWidgetsDetails?.widgetOption);
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
    props.handleSaveWidgetsOptions(null, null, flage, false);
  };

  const handleDeleteInput = (ind) => {
    const flage = true;
    const getUpdatedOptions = dropdownOptionList.filter(
      (data, index) => index !== ind
    );
    setDropdownOptionList(getUpdatedOptions);
    props.handleSaveWidgetsOptions(null, null, false, flage);
  };
  const handleSaveOption = () => {
    props.handleSaveWidgetsOptions(dropdownName, dropdownOptionList);
    props.setShowDropdown(false);
    setDropdownOptionList(["option-1", "option-2"]);
    setDropdownName("Field-1");
  };

  return (
    //props.showDropdown
    <ModalUi
      dropdownModal={"dropdownModal"}
      isOpen={props.showDropdown}
      title={props.title}
      closeOff={true}
      // handleClose={() => props.setShowDropdown(false)}
    >
      <div style={{ height: "100%", padding: 20 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveOption();
          }}
        >
          <div className="dropdownContainer">
            <label style={{ fontSize: "13px", fontWeight: "600" }}>Name</label>
            <input
              required
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
        </form>
      </div>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
