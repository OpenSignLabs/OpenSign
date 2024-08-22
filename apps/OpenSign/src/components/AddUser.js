import React, { useEffect, useState } from "react";
import Parse from "parse";
import Title from "./Title";
import Loader from "../primitives/Loader";
import { copytoData, fetchSubscriptionInfo } from "../constant/Utils";
import { isEnableSubscription } from "../constant/const";
import { useTranslation } from "react-i18next";
function generatePassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const AddUser = (props) => {
  const { t } = useTranslation();
  const [formdata, setFormdata] = useState({
    name: "",
    phone: "",
    email: "",
    team: "",
    password: "",
    role: ""
  });
  const [amount, setAmount] = useState({ quantity: 1, price: 0 });
  const [planInfo, setPlanInfo] = useState({
    priceperUser: 0,
    price: 0,
    totalAllowedUser: 0
  });
  const [isFormLoader, setIsFormLoader] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [allowedUser, setAllowedUser] = useState(0);
  const [err, setErr] = useState("");
  const role = ["OrgAdmin", "Editor", "User"];

  useEffect(() => {
    getTeamList();
    // eslint-disable-next-line
  }, []);

  const getTeamList = async () => {
    if (isEnableSubscription) {
      try {
        setIsLoader(true);
        const resSub = await fetchSubscriptionInfo();
        if (!resSub.error) {
          setPlanInfo((prev) => ({
            ...prev,
            priceperUser: resSub.price,
            totalAllowedUser: resSub.totalAllowedUser
          }));
          setAmount((prev) => ({ ...prev, price: resSub.price }));
          const res = await Parse.Cloud.run("allowedusers");
          if (props.setFormHeader) {
            if (res > 0) {
              props.setFormHeader(t("add-user"));
            } else {
              props.setFormHeader(t("Add-seats"));
            }
          }
          setAllowedUser(res);
        } else {
          setAllowedUser(0);
        }
      } catch (err) {
        setAllowedUser(0);
        console.log("Err in alloweduser", err);
        setErr(err.message);
      } finally {
        setIsLoader(false);
      }
    }
    setFormdata((prev) => ({ ...prev, password: generatePassword(12) }));
    const teamRes = await Parse.Cloud.run("getteams", { active: true });
    if (teamRes.length > 0) {
      const _teamRes = JSON.parse(JSON.stringify(teamRes));
      setTeamList(_teamRes);
      if (!isEnableSubscription) {
        const allUserId =
          _teamRes.find((x) => x.Name === "All Users")?.objectId || "";
        setFormdata((prev) => ({ ...prev, team: allUserId }));
      }
    }
  };
  const checkUserExist = async () => {
    try {
      const res = await Parse.Cloud.run("getUserDetails", {
        email: formdata.email
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
    const localUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    setIsFormLoader(true);
    const res = await checkUserExist();
    if (res) {
      props.setIsAlert({ type: "danger", msg: t("user-already-exist") });
      setIsFormLoader(false);
      setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 1000);
    } else {
      try {
        const extUser = new Parse.Object("contracts_Users");
        extUser.set("Name", formdata.name);
        if (formdata.phone) {
          extUser.set("Phone", formdata.phone);
        }
        extUser.set("Email", formdata.email);
        extUser.set("UserRole", `contracts_${formdata.role}`);
        if (formdata?.team) {
          extUser.set("TeamIds", [
            {
              __type: "Pointer",
              className: "contracts_Teams",
              objectId: formdata.team
            }
          ]);
        }
        if (localUser && localUser.OrganizationId) {
          extUser.set("OrganizationId", {
            __type: "Pointer",
            className: "contracts_Organizations",
            objectId: localUser.OrganizationId.objectId
          });
        }
        if (localUser && localUser.Company) {
          extUser.set("Company", localUser.Company);
        }

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
          _user.set("password", formdata.password);
          if (formdata.phone) {
            _user.set("phone", formdata.phone);
          }

          const user = await _user.save();
          if (user) {
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
              if (formdata?.team) {
                const team = teamList.find((x) => x.objectId === formdata.team);
                parseData.TeamIds = parseData.TeamIds.map((y) =>
                  y.objectId === team.objectId ? team : y
                );
              }
              props.handleUserData(parseData);
            }

            setIsFormLoader(false);
            setFormdata({ name: "", email: "", phone: "", team: "", role: "" });
          }
        } catch (err) {
          console.log("err ", err);
          if (err.code === 202) {
            const params = { email: formdata.email };
            const userRes = await Parse.Cloud.run("getUserId", params);
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
              if (formdata?.team) {
                const team = teamList.find((x) => x.objectId === formdata.team);
                parseData.TeamIds = parseData.TeamIds.map((y) =>
                  y.objectId === team.objectId ? team : y
                );
              }
              props.handleUserData(parseData);
            }
            setIsFormLoader(false);
            setFormdata({ name: "", email: "", phone: "", team: "", role: "" });
          }
        }
      } catch (err) {
        console.log("err", err);
        setIsFormLoader(false);
        props.setIsAlert({
          type: "danger",
          msg: t("something-went-wrong-mssg")
        });
      } finally {
        setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 1500);
      }
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleReset = () => {
    setFormdata({ name: "", email: "", phone: "", team: "", role: "" });
    if (props.closePopup) {
      props.closePopup();
    }
  };
  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    props.setIsAlert({ type: "success", msg: t("copied") });
    setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 1500); // Reset copied state after 1.5 seconds
  };
  const handlePricePerUser = (e) => {
    const quantity = e.target.value;
    const price = e.target?.value > 0 ? planInfo.priceperUser * quantity : 0;
    setAmount((prev) => ({ ...prev, quantity: quantity, price: price }));
  };
  const handleAddOnSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFormLoader(true);
    try {
      const resAddon = await Parse.Cloud.run("buyaddonusers", {
        users: amount.quantity
      });
      if (resAddon) {
        const _resAddon = JSON.parse(JSON.stringify(resAddon));
        if (_resAddon.status === "success") {
          setAllowedUser(amount.quantity);
          setPlanInfo((obj) => ({ ...obj, totalAllowedUser: _resAddon.addon }));
        }
      }
    } catch (err) {
      console.log("Err in buy addon", err);
      props.setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
    } finally {
      setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 2000);
      setIsFormLoader(false);
    }
  };
  return (
    <div className="shadow-md rounded-box my-[1px] p-3 bg-base-100 relative">
      <Title title={t("add-user")} />
      {isFormLoader && (
        <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
          <Loader />
        </div>
      )}
      {!isLoader ? (
        <>
          {err ? (
            <div className="flex justify-center items-center h-[70px] text-[18px]">
              {err}
            </div>
          ) : (
            <div className="w-full mx-auto">
              {!isEnableSubscription || allowedUser > 0 ? (
                <form onSubmit={handleSubmit}>
                  {isEnableSubscription && (
                    <p className="flex justify-center mb-1">
                      {t("remaing-users")}{" "}
                      <span
                        className={`${
                          allowedUser < 2 ? "op-text-accent" : "op-text-primary"
                        } font-medium ml-1`}
                      >
                        {allowedUser} {t("of")} {planInfo.totalAllowedUser}
                      </span>
                    </p>
                  )}
                  <div className="mb-3">
                    <label
                      htmlFor="name"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("name")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formdata.name}
                      onChange={(e) => handleChange(e)}
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("email")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formdata.email}
                      onChange={(e) => handleChange(e)}
                      required
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-700 font-semibold">
                      {t("password")}
                    </label>
                    <div className="flex justify-between items-center op-input op-input-bordered op-input-sm text-base-content w-full h-full text-[13px]">
                      <div className="break-all">{formdata?.password}</div>
                      <i
                        onClick={() => copytoclipboard(formdata?.password)}
                        className="fa-light fa-copy rounded-full hover:bg-base-300 p-[8px] cursor-pointer "
                      ></i>
                    </div>
                    <div className="text-[12px] ml-2 mb-0 text-[red] select-none">
                      {t("password-generateed")}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="phone"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("phone")}
                      {/* <span className="text-[red] text-[13px]"> *</span> */}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="optional"
                      value={formdata.phone}
                      onChange={(e) => handleChange(e)}
                      // required
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    />
                  </div>
                  {isEnableSubscription && (
                    <div className="mb-3">
                      <label
                        htmlFor="phone"
                        className="block text-xs text-gray-700 font-semibold"
                      >
                        {t("team")}
                        <span className="text-[red] text-[13px]"> *</span>
                      </label>
                      <select
                        name="team"
                        value={formdata.team}
                        onChange={(e) => handleChange(e)}
                        className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      >
                        <option defaultValue={""} value={""}>
                          {t("Select")}
                        </option>
                        {teamList.length > 0 &&
                          teamList.map((x) => (
                            <option key={x.objectId} value={x.objectId}>
                              {x.Name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label
                      htmlFor="phone"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("Role")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <select
                      value={formdata.role}
                      onChange={(e) => handleChange(e)}
                      name="role"
                      className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                    >
                      <option defaultValue={""} value={""}>
                        {t("Select")}
                      </option>
                      {role.length > 0 &&
                        role.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center mt-3 gap-2 text-white">
                    <button type="submit" className="op-btn op-btn-primary">
                      {t("submit")}
                    </button>
                    <div
                      type="button"
                      onClick={() => handleReset()}
                      className="op-btn op-btn-secondary"
                    >
                      {t("cancel")}
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddOnSubmit}>
                  <p className="flex justify-center text-center mx-2 mb-3 text-base op-text-accent font-medium">
                    {t("additional-users")}
                  </p>
                  <div className="mb-3 flex justify-between">
                    <label
                      htmlFor="quantity"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("Quantity-of-users")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={amount.quantity}
                      onChange={(e) => handlePricePerUser(e)}
                      className="w-1/4 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                      required
                    />
                  </div>
                  <div className="mb-3 flex justify-between">
                    <label className="block text-xs text-gray-700 font-semibold">
                      {t("Price")} (1 * {planInfo.priceperUser})
                    </label>
                    <div className="w-1/4 flex justify-center items-center text-sm">
                      USD {amount.price}
                    </div>
                  </div>
                  <hr className="text-base-content mb-3" />
                  <button className="op-btn op-btn-primary w-full">
                    {t("Proceed")}
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-[200px] inset-0 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default AddUser;
