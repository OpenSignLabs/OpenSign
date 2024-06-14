import React, { useState } from "react";
import Parse from "parse";
import axios from "axios";
import Title from "./Title";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";

const AddUser = (props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);
  const parseBaseUrl = localStorage.getItem("baseUrl");
  const parseAppId = localStorage.getItem("parseAppId");

  const checkUserExist = async () => {
    try {
      const res = await Parse.Cloud.run("getUserDetails", {
        email: email,
        userId: Parse.User.current().id
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
        const contactQuery = new Parse.Object("contracts_Users");
        contactQuery.set("Name", name);
        contactQuery.set("Phone", phone);
        contactQuery.set("Email", email);
        contactQuery.set("UserRole", "contracts_User");

        if (localStorage.getItem("TenantId")) {
          contactQuery.set("TenantId", {
            __type: "Pointer",
            className: "partners_Tenant",
            objectId: localStorage.getItem("TenantId")
          });
        }

        try {
          const _users = Parse.Object.extend("User");
          const _user = new _users();
          _user.set("name", name);
          _user.set("username", email);
          _user.set("email", email);
          _user.set("password", email);
          if (phone) {
            _user.set("phone", phone);
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
            contactQuery.set(
              "CreatedBy",
              Parse.User.createWithoutData(currentUser.id)
            );

            contactQuery.set("UserId", user);
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);

            contactQuery.setACL(acl);

            const res = await contactQuery.save();

            const parseData = JSON.parse(JSON.stringify(res));
            if (props.details) {
              props.details({
                value: parseData[props.valueKey],
                label: parseData[props.displayKey]
              });
            }
            if (props.closePopup) {
              props.closePopup();
            }
            if (props.handleUserData) {
              props.handleUserData(parseData);
            }

            setIsLoader(false);

            setName("");
            setPhone("");
            setEmail("");
          }
        } catch (err) {
          console.log("err ", err);
          if (err.code === 202) {
            const params = { email: email };
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
            contactQuery.set(
              "CreatedBy",
              Parse.User.createWithoutData(currentUser.id)
            );

            contactQuery.set("UserId", {
              __type: "Pointer",
              className: "_User",
              objectId: userRes.id
            });
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);

            contactQuery.setACL(acl);
            const res = await contactQuery.save();

            const parseData = JSON.parse(JSON.stringify(res));
            if (props.details) {
              props.details({
                value: parseData[props.valueKey],
                label: parseData[props.displayKey]
              });
            }
            if (props.closePopup) {
              props.closePopup();
            }
            if (props.handleUserData) {
              props.handleUserData(parseData);
            }
            setIsLoader(false);
            setName("");
            setPhone("");
            setEmail("");
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
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div className="shadow-md rounded my-2 p-3 bg-[#ffffff] md:border-[1px] md:border-gray-600/50">
      <Title title={"Add User"} />
      {isUserExist && <Alert type="danger">User already exists!</Alert>}
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
          <h1 className="text-[20px] font-semibold mb-4">Add User</h1>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>

          <div className="flex items-center mt-3 gap-2 text-white">
            <button
              type="submit"
              className="bg-[#1ab6ce] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white py-1.5 px-2.5 focus:outline-none"
            >
              Submit
            </button>
            <div
              type="button"
              onClick={() => handleReset()}
              className="bg-[#188ae2] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white py-1.5 px-2.5 text-center ml-[2px] focus:outline-none"
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
