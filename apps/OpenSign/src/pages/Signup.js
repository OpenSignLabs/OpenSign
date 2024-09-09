import React, { useState, useEffect } from "react";
import Parse from "parse";
import axios from "axios";
import Title from "../components/Title";
import { useNavigate, useLocation } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";
import { useWindowSize } from "../hook/useWindowSize";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { useDispatch } from "react-redux";
import { fetchAppInfo } from "../redux/reducers/infoReducer";
import { showTenant } from "../redux/reducers/ShowTenant";
import { isEnableSubscription } from "../constant/const";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";
const Signup = () => {
  const { width } = useWindowSize();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [image, setImage] = useState();
  const [state, setState] = useState({
    loading: false,
    alertType: "success",
    alertMsg: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);
  const [isAuthorize, setIsAuthorize] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const clearStorage = async () => {
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    }
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let userSettings = localStorage.getItem("userSettings");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", userSettings);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
  };

  const handleFreePlan = async (id) => {
    try {
      const params = { userId: id };
      const res = await Parse.Cloud.run("freesubscription", params);
      if (res.status === "error") {
        alert(res.result);
      }
    } catch (err) {
      console.log("err in free subscribe", err.message);
      alert(t("something-went-wrong-mssg"));
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (lengthValid && caseDigitValid && specialCharValid) {
      clearStorage();
      setState({ loading: true });
      const userDetails = {
        name: name,
        email: email,
        phone: phone,
        company: company,
        jobTitle: jobTitle
      };
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      try {
        event.preventDefault();
        var user = new Parse.User();
        user.set("name", name);
        user.set("email", email);
        user.set("password", password);
        user.set("phone", phone);
        user.set("username", email);
        let res = user.save();
        res
          .then(async (r) => {
            if (r) {
              let roleData = appInfo.settings;
              if (roleData && roleData.length > 0) {
                const params = {
                  userDetails: {
                    jobTitle: jobTitle,
                    company: company,
                    name: name,
                    email: email,
                    phone: phone,
                    role: appInfo.defaultRole
                  }
                };
                try {
                  const usersignup = await Parse.Cloud.run(
                    "usersignup",
                    params
                  );
                  if (usersignup) {
                    const param = new URLSearchParams(location.search);
                    const isFreeplan =
                      param?.get("subscription") === "freeplan";
                    if (isFreeplan) {
                      await handleFreePlan(r.id);
                    }
                    handleNavigation(r.getSessionToken(), isFreeplan);
                  }
                } catch (err) {
                  alert(err.message);
                  setState({ loading: false });
                }
              }
            }
          })
          .catch(async (err) => {
            if (err.code === 202) {
              const params = { email: email };
              const res = await Parse.Cloud.run("getUserDetails", params);
              // console.log("Res ", res);
              if (res) {
                alert(t("user-already-exist-name"));
                setState({ loading: false });
              } else {
                // console.log("state.email ", email);
                try {
                  await Parse.User.requestPasswordReset(email).then(
                    async function (res1) {
                      if (res1.data === undefined) {
                        alert(t("verification-code-sent"));
                      }
                    }
                  );
                } catch (err) {
                  console.log(err);
                }
                setState({ loading: false });
              }
            } else {
              alert(err.message);
              setState({ loading: false });
            }
          });
      } catch (error) {
        console.log("err ", error);
      }
    }
  };

  const handleNavigation = async (sessionToken, isFreeplan = false) => {
    const baseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    const res = await axios.get(baseUrl + "users/me", {
      headers: {
        "X-Parse-Session-Token": sessionToken,
        "X-Parse-Application-Id": parseAppId
      }
    });
    await Parse.User.become(sessionToken).then(() => {
      window.localStorage.setItem("accesstoken", sessionToken);
    });
    // console.log("me res ", res);
    if (res.data) {
      let _user = res.data;
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", true);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      // Check extended class user role and tenentId
      try {
        const userSettings = appInfo.settings;
        await Parse.Cloud.run("getUserDetails")
          .then(async (extUser) => {
            if (extUser) {
              const IsDisabled = extUser?.get("IsDisabled") || false;
              if (!IsDisabled) {
                const userRole = extUser?.get("UserRole");
                const menu =
                  userRole &&
                  userSettings.find((menu) => menu.role === userRole);
                if (menu) {
                  const _currentRole = userRole;
                  const _role = _currentRole.replace("contracts_", "");
                  localStorage.setItem("_user_role", _role);
                  const extInfo_stringify = JSON.stringify([extUser]);
                  localStorage.setItem("Extand_Class", extInfo_stringify);
                  const extInfo = JSON.parse(JSON.stringify(extUser));
                  localStorage.setItem("userEmail", extInfo?.Email);
                  localStorage.setItem("username", extInfo?.Name);
                  if (extInfo?.TenantId) {
                    const tenant = {
                      Id: extInfo?.TenantId?.objectId || "",
                      Name: extInfo?.TenantId?.TenantName || ""
                    };
                    localStorage.setItem("TenantId", tenant?.Id);
                    dispatch(showTenant(tenant?.Name));
                    localStorage.setItem("TenantName", tenant?.Name);
                  }
                  localStorage.setItem("PageLanding", menu.pageId);
                  localStorage.setItem("defaultmenuid", menu.menuId);
                  localStorage.setItem("pageType", menu.pageType);
                  setState({ loading: false });
                  if (isEnableSubscription) {
                    if (isFreeplan) {
                      navigate(`/${menu.pageType}/${menu.pageId}`);
                    } else {
                      navigate(`/subscription`, { replace: true });
                    }
                  } else {
                    alert(t("registered-user-successfully"));
                    navigate(`/${menu.pageType}/${menu.pageId}`);
                  }
                } else {
                  setState({
                    loading: false,
                    alertType: "danger",
                    alertMsg: t("role-not-found")
                  });
                  setTimeout(() => {
                    setState({ loading: false, alertMsg: "" });
                  }, 2000);
                }
              } else {
                setState({
                  loading: false,
                  alertType: "danger",
                  alertMsg: t("do-not-access-contact-admin")
                });
                setTimeout(() => {
                  setState({ loading: false, alertMsg: "" });
                }, 2000);
              }
            }
          })
          .catch((error) => {
            console.log("error in fetch extuser", error);
            setState({
              loading: false,
              alertType: "danger",
              alertMsg: t("do-not-access-contact-admin")
            });
            setTimeout(() => {
              setState({ loading: false, alertMsg: "" });
            }, 2000);
          });
      } catch (error) {
        // alert(`${error.message}`);
        setState({
          loading: false,
          alertType: "danger",
          alertMsg: `${error.message}`
        });
        setTimeout(() => {
          setState({ loading: false, alertMsg: "" });
        }, 2000);
        console.log(error);
      }
    }
  };
  useEffect(() => {
    dispatch(fetchAppInfo());
    saveLogo();
    // eslint-disable-next-line
  }, []);

  const saveLogo = async () => {
    if (isEnableSubscription) {
      const app = await getAppLogo();
      if (app?.logo) {
        setImage(app?.logo);
      } else {
        setImage(appInfo?.applogo || undefined);
      }
    } else {
      setImage(appInfo?.applogo || undefined);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };
  return (
    <div className="">
      {state.loading && (
        <div className="fixed w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-50">
          <Loader />
        </div>
      )}
      <Title title="Signup page" />
      {appInfo && appInfo.applogo ? (
        <div className="md:p-10 lg:p-16">
          <div className="md:p-4 lg:p-10 p-4 bg-base-100 text-base-content op-card">
            <div className="w-[250px] h-[66px] inline-block overflow-hidden">
              {image && (
                <img src={image} className="object-contain h-full" alt="logo" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
              <div>
                <form onSubmit={handleSubmit}>
                  <h2 className="text-[30px] mt-6">{t("create-account")}!</h2>
                  <div className="w-full my-4 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50">
                    <div className="px-6 py-4 text-xs">
                      <label className="block ">
                        {t("name")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <input
                        type="text"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        {t("email")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value?.toLowerCase()?.replace(/\s/g, "")
                          )
                        }
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        {t("phone")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <input
                        type="tel"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        {t("company")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <input
                        type="text"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        {t("job-title")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <input
                        type="text"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        {t("password")}{" "}
                        <span className="text-[red] text-[13px]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          name="password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e)}
                          onInvalid={(e) =>
                            e.target.setCustomValidity(t("input-required"))
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          required
                        />
                        <span
                          className={`absolute top-[50%] right-[10px] -translate-y-[50%] cursor-pointer text-base-content`}
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <i className="fa-light fa-eye-slash" /> // Close eye icon
                          ) : (
                            <i className="fa-light fa-eye" /> // Open eye icon
                          )}
                        </span>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-1 text-[11px]">
                          <p
                            className={`${
                              lengthValid ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {lengthValid ? "✓" : "✗"}
                            {t("password-length")}
                          </p>
                          <p
                            className={`${
                              caseDigitValid ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {caseDigitValid ? "✓" : "✗"}
                            {t("password-case")}
                          </p>
                          <p
                            className={`${
                              specialCharValid
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {specialCharValid ? "✓" : "✗"}{" "}
                            {t("password-special-char")}
                          </p>
                        </div>
                      )}
                      <div className="mt-2.5 ml-1 flex flex-row items-center">
                        <input
                          type="checkbox"
                          className="op-checkbox op-checkbox-sm"
                          id="termsandcondition"
                          checked={isAuthorize}
                          onChange={(e) => setIsAuthorize(e.target.checked)}
                          onInvalid={(e) =>
                            e.target.setCustomValidity(t("input-required"))
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          required
                        />
                        <label
                          className="text-xs cursor-pointer ml-1 mb-0"
                          htmlFor="termsandcondition"
                        >
                          {t("agreee")}
                        </label>
                        <span
                          className="underline cursor-pointer ml-1"
                          onClick={() =>
                            openInNewTab(
                              "https://www.opensignlabs.com/terms-and-conditions"
                            )
                          }
                        >
                          {t("term")}
                        </span>
                        <span>.</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center text-xs font-bold mt-2">
                    <button
                      type="submit"
                      className="op-btn op-btn-primary"
                      disabled={state.loading}
                    >
                      {state.loading ? t("loading") : t("register")}
                    </button>
                    <button
                      type="button"
                      className="op-btn op-btn-secondary"
                      disabled={state.loading}
                      onClick={() =>
                        navigate(location.search ? "/" + location.search : "/")
                      }
                    >
                      {t("login")}
                    </button>
                  </div>
                </form>
              </div>
              {width >= 768 && (
                <div className="self-center">
                  <div className="mx-auto md:w-[300px] lg:w-[400px] xl:w-[500px]">
                    <img src={login_img} alt="loader" width="100%" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <SelectLanguage />
          <Alert type={state.alertType}>{state.alertMsg}</Alert>
        </div>
      ) : (
        <div className="fixed w-full h-full flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Signup;
