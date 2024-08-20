import React, { useState, useEffect } from "react";
import Parse from "parse";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";
const AddContact = (props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addYourself, setAddYourself] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);
  useEffect(() => {
    checkUserExist();
  }, []);
  // Load user details from localStorage when the component mounts
  useEffect(() => {
    const savedUserDetails = JSON.parse(
      localStorage.getItem("UserInformation")
    );
    if (savedUserDetails && addYourself) {
      setName(savedUserDetails.name);
      setPhone(savedUserDetails?.phone || "");
      setEmail(savedUserDetails.email);
    }
  }, [addYourself]);

  const checkUserExist = async () => {
    const user = Parse.User.current();
    try {
      const query = new Parse.Query("contracts_Contactbook");
      query.equalTo("CreatedBy", user);
      query.notEqualTo("IsDeleted", true);
      query.equalTo("Email", user.getEmail());
      const res = await query.first();
      // console.log(res);
      if (!res) {
        setIsUserExist(true);
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
    if (localStorage.getItem("TenantId")) {
      try {
        const user = Parse.User.current();
        const query = new Parse.Query("contracts_Contactbook");
        query.equalTo("CreatedBy", user);
        query.notEqualTo("IsDeleted", true);
        query.equalTo("Email", email);
        const res = await query.first();
        if (!res) {
          const contactQuery = new Parse.Object("contracts_Contactbook");
          contactQuery.set("Name", name);
          if (phone) {
            contactQuery.set("Phone", phone);
          }
          contactQuery.set("Email", email);
          contactQuery.set("UserRole", "contracts_Guest");

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
              props.details(parseData);
              if (props.closePopup) {
                props.closePopup();
              }

              setIsLoader(false);
              // Reset the form fields
              setAddYourself(false);
              setName("");
              setPhone("");
              setEmail("");
            }
          } catch (err) {
            console.log("err ", err);
            if (err.code === 202) {
              const params = { email: email };
              const userRes = await Parse.Cloud.run("getUserId", params);
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
                props.details(parseData);
              }

              if (props.closePopup) {
                props.closePopup();
              }
              setIsLoader(false);
              // Reset the form fields
              setAddYourself(false);
              setName("");
              setPhone("");
              setEmail("");
            }
          }
        } else {
          alert(t("add-signer-alert"));
          setIsLoader(false);
        }
      } catch (err) {
        // console.log("err", err);
        setIsLoader(false);
        alert(t("something-went-wrong-mssg"));
      }
    } else {
      setIsLoader(false);
      alert(t("something-went-wrong-mssg"));
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleAddYourselfChange = () => {
    if (addYourself) {
      setAddYourself(false);
      setName("");
      setPhone("");
      setEmail("");
    } else {
      setAddYourself(true);
    }
  };
  const handleReset = () => {
    setAddYourself(false);
  };

  return (
    <div className="h-full px-[20px] py-[10px]">
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto p-[8px]">
        <div className="text-[14px] font-[700]">{t("add-contact")}</div>
        {isUserExist && (
          <div className="mb-[0.75rem] flex items-center mt-1">
            <input
              type="checkbox"
              id="addYourself"
              checked={addYourself}
              onChange={handleAddYourselfChange}
              className="op-checkbox op-checkbox-sm"
            />
            <label
              htmlFor="addYourself"
              className="ml-[0.5rem] text-base-content mb-0"
            >
              {t("add-yourself")}
            </label>
          </div>
        )}
        <form className="text-base-content" onSubmit={handleSubmit}>
          <div className="mb-[0.75rem]">
            <label htmlFor="name" className="text-[13px]">
              {t("name")}
              <span className="text-[13px] text-[red]"> *</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="email" className="text-[13px]">
              {t("email")}
              <span className="text-[13px] text-[red]"> *</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
              }
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs lowercase"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="phone" className="text-[13px]">
              {t("phone")}
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>

          <div className="mt-6 flex justify-start gap-2">
            <button type="submit" className="op-btn op-btn-primary">
              {t("submit")}
            </button>
            <button
              type="button"
              onClick={() => handleReset()}
              className="op-btn op-btn-secondary"
            >
              {t("reset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;
