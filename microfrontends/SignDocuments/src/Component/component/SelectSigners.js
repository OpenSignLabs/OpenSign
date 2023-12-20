import React, { useState } from "react";
import Parse from "parse";
import "../../css/AddUser.css";
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
  const parseBaseUrl = localStorage.getItem("baseUrl");
  const parseAppId = localStorage.getItem("parseAppId");
  Parse.serverURL = parseBaseUrl;
  Parse.initialize(parseAppId);

  // `handleOptions` is used to set just save from quick form to selected option in dropdown
  const handleOptions = (item) => {
    setSelected(item);
    const userData = userList.filter((x) => x.objectId === item.value);
    if (userData.length > 0) {
      setUserData(userData[0]);
    }
  };
  const handleAdd = () => {
    props.details(userData);
    if (props.closePopup) {
      props.closePopup();
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
          label: item.Name,
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
        <div className="form-section">
          <label style={{ fontSize: 14 }}>Choose User</label>
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

        <div className="buttoncontainer">
          <button className="submitbutton" onClick={() => handleAdd()}>
            Add Signer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSigners;
