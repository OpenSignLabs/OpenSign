import React, { useEffect, useState } from "react";
import Parse from "parse";
import Title from "./Title";
import Loader from "../primitives/Loader";
import { copytoData } from "../constant/Utils";
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
  const [isLoader, setIsLoader] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const role = ["OrgAdmin", "Editor", "User"];

  useEffect(() => {
    getTeamList();
  }, []);

  const getTeamList = async () => {
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
    setIsLoader(true);
    const res = await checkUserExist();
    if (res) {
      props.setIsAlert({ type: "danger", msg: t("user-already-exist") });
      setIsLoader(false);
      setTimeout(() => {
        props.setIsAlert({ type: "success", msg: "" });
      }, 1000);
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

            setIsLoader(false);
            setFormdata({
              name: "",
              email: "",
              phone: "",
              team: "",
              role: ""
            });
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
            setIsLoader(false);
            setFormdata({
              name: "",
              email: "",
              phone: "",
              team: "",
              role: ""
            });
          }
        }
      } catch (err) {
        console.log("err", err);
        setIsLoader(false);
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
    setFormdata({
      name: "",
      email: "",
      phone: "",
      team: "",
      role: ""
    });
    if (props.closePopup) {
      props.closePopup();
    }
  };
  const handleChange = (e) => {
    setFormdata((prev) => ({
      ...prev,
      [e.target.name]: e.target.value?.toLowerCase()?.replace(/\s/g, "")
    }));
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    props.setIsAlert({ type: "success", msg: t("copied") });
    setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 1500); // Reset copied state after 1.5 seconds
  };
  return (
    <div className="shadow-md rounded-box my-[1px] p-3 bg-[#ffffff]">
      <Title title={"Add User"} />
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50 rounded-box">
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
              {t("name")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
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
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
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
                Team<span className="text-[red] text-[13px]"> *</span>
              </label>
              <select
                value={formdata.team}
                onChange={(e) => handleChange(e)}
                name="team"
                className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              >
                <option defaultValue={""} value={""}>
                  select
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
              Role<span className="text-[red] text-[13px]"> *</span>
            </label>
            <select
              value={formdata.role}
              onChange={(e) => handleChange(e)}
              name="role"
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            >
              <option defaultValue={""} value={""}>
                select
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
              Submit
            </button>
            <div
              type="button"
              onClick={() => handleReset()}
              className="op-btn op-btn-secondary"
            >
              Cancel
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
