import React, { useEffect, useState } from "react";
import Parse from "parse";
import axios from "axios";
import Title from "./Title";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";

const AddUser = (props) => {
  const [formdata, setFormdata] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
    role: ""
  });
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const parseBaseUrl = localStorage.getItem("baseUrl");
  const parseAppId = localStorage.getItem("parseAppId");

  useEffect(() => {
    getDepartmentList();
  }, []);

  const getDepartmentList = async () => {
    const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    console.log("extUser ", extUser);
    const department = new Parse.Query("contracts_Departments");
    department.equalTo("OrganizationId", {
      __type: "Pointer",
      className: "contracts_Organizations",
      objectId: extUser.OrganizationId.objectId
    });
    const departmentRes = await department.find();
    if (departmentRes.length > 0) {
      const _departmentRes = JSON.parse(JSON.stringify(departmentRes));
      setDepartmentList(_departmentRes);
    }
  };
  const checkUserExist = async () => {
    const user = Parse.User.current();
    try {
      const res = await Parse.Cloud.run("getUserDetails", {
        email: user.get("email"),
        userId: user.id
      });
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoader(true);
    const res = await checkUserExist();
    if (res) {
      setIsUserExist(true);
      setIsLoader(false);
      setTimeout(() => {
        setIsUserExist(false);
      }, 1000);
    } else {
      try {
        const extUser = new Parse.Object("contracts_Users");
        extUser.set("Name", formdata.name);
        if (formdata.phone) {
          extUser.set("Phone", formdata.phone);
        }
        extUser.set("Email", formdata.email);
        extUser.set("UserRole", "contracts_User");

        if (localStorage.getItem("TenantId")) {
          extUser.set("TenantId", {
            __type: "Pointer",
            className: "partners_Tenant",
            objectId: localStorage.getItem("TenantId")
          });
        }

        try {
          const _users = Parse.Object.extend("User");
          const _user = new _users();
          _user.set("name", formdata.name);
          _user.set("username", formdata.email);
          _user.set("email", formdata.email);
          _user.set("password", formdata.email);
          if (formdata.phone) {
            _user.set("phone", formdata.phone);
          }

          const user = await _user.save();
          if (user) {
            const roleurl = `${parseBaseUrl}functions/AddUserToRole`;
            const headers = {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId,
              sessionToken: localStorage.getItem("accesstoken")
            };
            const body = {
              appName: localStorage.getItem("_appName"),
              roleName: "contracts_User",
              userId: user.id
            };
            await axios.post(roleurl, body, { headers: headers });
            const currentUser = Parse.User.current();
            extUser.set(
              "CreatedBy",
              Parse.User.createWithoutData(currentUser.id)
            );

            extUser.set("UserId", user);
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);

            extUser.setACL(acl);

            const res = await extUser.save();

            const parseData = JSON.parse(JSON.stringify(res));

            if (props.closePopup) {
              props.closePopup();
            }
            if (props.handleUserData) {
              props.handleUserData(parseData);
            }

            setIsLoader(false);
            setFormdata({
              name: "",
              email: "",
              phone: "",
              department: "",
              role: ""
            });
          }
        } catch (err) {
          console.log("err ", err);
          if (err.code === 202) {
            const user = Parse.User.current();
            const params = { email: user.get("email") };
            const userRes = await Parse.Cloud.run("getUserId", params);
            const roleurl = `${parseBaseUrl}functions/AddUserToRole`;
            const headers = {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId,
              sessionToken: localStorage.getItem("accesstoken")
            };
            const body = {
              appName: localStorage.getItem("_appName"),
              roleName: "contracts_User",
              userId: userRes.id
            };
            await axios.post(roleurl, body, { headers: headers });
            const currentUser = Parse.User.current();
            extUser.set(
              "CreatedBy",
              Parse.User.createWithoutData(currentUser.id)
            );

            extUser.set("UserId", {
              __type: "Pointer",
              className: "_User",
              objectId: userRes.id
            });
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);

            extUser.setACL(acl);
            const res = await extUser.save();

            const parseData = JSON.parse(JSON.stringify(res));
            if (props.closePopup) {
              props.closePopup();
            }
            if (props.handleUserData) {
              props.handleUserData(parseData);
            }
            setIsLoader(false);
            setFormdata({
              name: "",
              email: "",
              phone: "",
              department: "",
              role: ""
            });
          }
        }
      } catch (err) {
        // console.log("err", err);
        setIsLoader(false);
        alert("something went wrong!");
      }
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleReset = () => {
    setFormdata({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: ""
    });
  };
  const handleChange = (e) => {
    setFormdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="shadow-md rounded-box my-[1px] p-3 bg-[#ffffff]">
      <Title title={"Add User"} />
      {isUserExist && <Alert type="danger">User already exists!</Alert>}
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
          {/* <h1 className="text-[20px] font-semibold mb-4">Add User</h1> */}
          <div className="mb-3">
            <label
              htmlFor="name"
              className="block text-xs text-gray-700 font-semibold"
            >
              Name
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              id="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              required
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="email"
              className="block text-xs text-gray-700 font-semibold"
            >
              Email
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="email"
              id="email"
              value={formdata.email}
              onChange={(e) => handleChange(e)}
              required
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="phone"
              className="block text-xs text-gray-700 font-semibold"
            >
              Phone
              {/* <span className="text-[red] text-[13px]"> *</span> */}
            </label>
            <input
              type="text"
              id="phone"
              value={formdata.phone}
              onChange={(e) => handleChange(e)}
              // required
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="phone"
              className="block text-xs text-gray-700 font-semibold"
            >
              Department
              {/* <span className="text-[red] text-[13px]"> *</span> */}
            </label>
            <select
              value={formdata.department}
              onChange={(e) => handleChange(e)}
              id="department"
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
            >
              <option>select</option>
              {departmentList.length > 0 &&
                departmentList.map((x) => (
                  <option key={x.objectId} value={x.objectId}>
                    {x.Name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center mt-3 gap-2 text-white">
            <button type="submit" className="op-btn op-btn-primary">
              Submit
            </button>
            <div
              type="button"
              onClick={() => handleReset()}
              className="op-btn op-btn-secondary"
            >
              Reset
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
