import React, { useState } from "react";
import Parse from "parse";
import "../../../styles/AddUser.css";
import AsyncSelect from "react-select/async";

const customStyles = {
  control: (provided) => ({
    ...provided,
    fontSize: "13px" // Font size for the control
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "13px" // Font size for the options
  })
};
const SelectSigners = (props) => {
  const [userList, setUserList] = useState([]);
  const [selected, setSelected] = useState();
  const [userData, setUserData] = useState({});
  const [isError, setIsError] = useState(false);
  // `handleOptions` is used to set just save from quick form to selected option in dropdown
  const handleOptions = (item) => {
    setSelected(item);
    const userData = userList.find((x) => x.objectId === item.value);
    if (userData) {
      setUserData(userData);
    }
  };
  const handleAdd = () => {
    if (userData && userData.objectId) {
      props.details(userData);
      if (props.closePopup) {
        props.closePopup();
      }
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 1000);
    }
  };

  const loadOptions = async (inputValue) => {
    try {
      const currentUser = Parse.User.current();
      const contactbook = new Parse.Query("contracts_Contactbook");
      contactbook.equalTo(
        "CreatedBy",
        Parse.User.createWithoutData(currentUser.id)
      );
      if (inputValue.length > 1) {
        contactbook.matches("Name", new RegExp(inputValue, "i"));
      }
      contactbook.notEqualTo("IsDeleted", true);
      const contactRes = await contactbook.find();
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        // console.log("userList ", res);
        setUserList(res);
        return await res.map((item) => ({
          label: item.Email,
          value: item.objectId
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  return (
    <div className="addusercontainer">
      <div className="form-wrapper">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 14, fontWeight: "700" }}>Choose User</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            value={selected}
            loadingMessage={() => "Loading..."}
            noOptionsMessage={() => "User not Found"}
            loadOptions={loadOptions}
            onChange={handleOptions}
            styles={customStyles}
          />
        </div>
        {isError ? (
          <p style={{ color: "red", fontSize: "12px", margin: "5px" }}>
            Please select signer
          </p>
        ) : (
          <p style={{ color: "transparent", fontSize: "12px", margin: "5px" }}>
            .
          </p>
        )}
        <div>
          <button className="submitbutton" onClick={() => handleAdd()}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSigners;
