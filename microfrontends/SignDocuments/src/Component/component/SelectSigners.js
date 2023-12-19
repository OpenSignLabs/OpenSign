import React, { useState, useEffect } from "react";
import Parse from "parse";
import "../../css/AddUser.css";

const SelectSigners = (props) => {
  const [userList, setUserList] = useState([]);
  const [selected, setSelected] = useState();
  const [userData, setUserData] = useState({});
  const parseBaseUrl = localStorage.getItem("baseUrl");
  const parseAppId = localStorage.getItem("parseAppId");
  Parse.serverURL = parseBaseUrl;
  Parse.initialize(parseAppId);

  const GetUserList = async () => {
    try {
      const currentUser = Parse.User.current();
      const contactbook = new Parse.Query("contracts_Contactbook");
      contactbook.equalTo(
        "CreatedBy",
        Parse.User.createWithoutData(currentUser.id)
      );
      contactbook.notEqualTo("IsDeleted", true);
      const contactRes = await contactbook.find();
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        
        console.log("userList ", res)
        setUserList(res);
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  useEffect(() => {
    GetUserList();
  }, []);

  // `handleOptions` is used to set just save from quick form to selected option in dropdown

  const handleOptions = (e) => {
    setSelected(e.target.value);
    const userData = userList.filter((x) => x.objectId === e.target.value);
    if(userData.length > 0){
      setUserData(userData[0]);
    }
  };
  const handleAdd = () => {
    if (props.closePopup) {
      props.closePopup();
    }
    console.log("userData ", userData)
    props.details(userData);
  };
  return (
    <div className="addusercontainer">
      <div className="form-wrapper">
        <div className="form-section">
          <label style={{ fontSize: 14 }}>Choose User</label>
          <select
            value={selected}
            onChange={handleOptions}
            className="addUserInput"
          >
            <option>select</option>
            {userList.length > 0 &&
              userList.map((x) => (
                <option key={x.objectId} value={x.objectId}>
                  {x.Name}
                </option>
              ))}
          </select>
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
