import React, { useState } from "react";
import Parse from "parse";
import "../../../styles/AddUser.css";
import AsyncSelect from "react-select/async";

const customStyles = {
  control: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "inherit",
    borderRadius: 10,
    borderColor: "current"
  }),
  option: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "inherit"
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
        //compareArrays is a function where compare between two array (total signersList and dcument signers list)
        //and filter signers from total signer's list which already present in document's signers list
        const compareArrays = (res, signerObj) => {
          return res.filter(
            (item1) =>
              !signerObj.find((item2) => item2.objectId === item1.objectId)
          );
        };

        //get update signer's List if signersdata is present
        const updateSignersList =
          props?.signersData && compareArrays(res, props?.signersData);

        const result = updateSignersList ? updateSignersList : res;
        setUserList(result);
        return await result.map((item) => ({
          label: item.Email,
          value: item.objectId
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  return (
    <div className="h-full px-[20px] py-[10px] text-base-content">
      <div className="w-full mx-auto p-[8px]">
        <div className="mb-0">
          <label className="text-[14px] font-bold">Choose User</label>
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
        <p
          className={`${
            isError ? "text-[red]" : "text-transparent"
          } text-[12px] m-[5px]`}
        >
          Please select signer
        </p>
        <div>
          <button className="op-btn op-btn-primary" onClick={() => handleAdd()}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSigners;
