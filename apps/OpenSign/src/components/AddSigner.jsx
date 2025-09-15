import React, { useState, useEffect } from "react";
import Parse from "parse";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { emailRegex } from "../constant/const";

const AddSigner = (props) => {
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
      setEmail(savedUserDetails.email?.toLowerCase()?.replace(/\s/g, ""));
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
    if (!emailRegex.test(email)) {
      alert(t("valid-email-alert"));
    } else {
      setIsLoader(true);
      if (localStorage.getItem("TenantId")) {
        try {
          const user = Parse.User.current();
          const query = new Parse.Query("contracts_Contactbook");
          query.equalTo("CreatedBy", user);
          query.notEqualTo("IsDeleted", true);
          query.equalTo("Email", email);
          const res = await query.first();
          // console.log(res);
          if (!res) {
            const contactQuery = new Parse.Object("contracts_Contactbook");
            contactQuery.set("Name", name);
            if (phone) {
              contactQuery.set("Phone", phone);
            }
            contactQuery.set("Email", email);
            contactQuery.set("UserRole", "contracts_Guest");

            contactQuery.set("TenantId", {
              __type: "Pointer",
              className: "partners_Tenant",
              objectId: localStorage.getItem("TenantId")
            });

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
                if (props.details) {
                  props.details({
                    value: parseData[props.valueKey],
                    label: parseData[props.displayKey],
                    email: parseData?.Email
                  });
                }
                if (props.closePopup) {
                  props.closePopup();
                }
                if (props.handleUserData) {
                  props.handleUserData(parseData);
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
                  props.details({
                    value: parseData[props.valueKey],
                    label: parseData[props.displayKey],
                    email: parseData?.Email
                  });
                }
                if (props.closePopup) {
                  props.closePopup();
                }
                if (props.handleUserData) {
                  props.handleUserData(parseData);
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
          console.log("err in fetch contact", err);
          setIsLoader(false);
          alert(t("something-went-wrong-mssg"));
        }
      } else {
        setIsLoader(false);
        alert(t("something-went-wrong-mssg"));
      }
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
    <div className="h-full p-[20px]">
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto p-2 text-base-content">
        <p className="mb-3 text-xs text-gray-500">{t("add-signer-note")}</p>
        {isUserExist && (
          <div className="mb-3 flex items-center">
            <input
              type="checkbox"
              id="addYourself"
              checked={addYourself}
              onChange={handleAddYourselfChange}
              className="op-checkbox op-checkbox-sm"
            />
            <label htmlFor="addYourself" className="ml-2 mb-0">
              {t("add-yourself")}
            </label>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="block text-xs font-semibold">
              {t("name")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={addYourself}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("enter-name")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="block text-xs font-semibold">
              {t("email")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
              }
              required
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("enter-email")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="block text-xs font-semibold">
              {t("phone")}
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("phone-optional")}
            />
          </div>
          <div className="mt-4 flex gap-x-2 justify-start">
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

export default AddSigner;
