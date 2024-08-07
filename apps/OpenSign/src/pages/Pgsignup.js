import React, { useState, useEffect } from "react";
import Parse from "parse";
import axios from "axios";
import { useDispatch } from "react-redux";
import Title from "../components/Title";
import { useNavigate, useLocation } from "react-router-dom";
import { appInfo } from "../constant/appinfo";
import { showTenant } from "../redux/reducers/ShowTenant";
import { fetchAppInfo } from "../redux/reducers/infoReducer";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const PgSignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);

  // below useEffect is used to fetch App data and save to redux state
  useEffect(() => {
    dispatch(fetchAppInfo());
    handleSignedUpUser();
    // eslint-disable-next-line
  }, []);

  //`handleSignedUpUser` is called first time and it only work for user who comes from login with google, facebook or normal sign up flow
  const handleSignedUpUser = async () => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));

    if (userDetails && userDetails.email) {
      try {
        const url = window.location.href;
        let paramString = url.split("?")[1];
        let queryString = new URLSearchParams(paramString);
        let obj = { ...formData };
        for (let pair of queryString.entries()) {
          obj = { ...obj, [pair[0]]: pair[1] };
        }
        const zohoRes = await axios.post(
          parseBaseUrl + "functions/zohodetails",
          {
            hostedpagesId: obj.hostedpage_id
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId
            }
          }
        );
        const userSettings = JSON.parse(localStorage.getItem("userSettings"));
        const params = { subscription: zohoRes.data.result.subscription };
        const baseurl = `${parseBaseUrl}functions/savesubscription`;
        try {
          const res = await axios.post(baseurl, params, {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId,
              sessiontoken: localStorage.getItem("accesstoken")
            }
          });
          if (res) {
            localStorage.removeItem("userDetails");
            try {
              const extUser = await Parse.Cloud.run("getUserDetails");
              const userRole = extUser?.get("UserRole");
              const _currentRole = userRole;
              const _role = _currentRole.replace("contracts_", "");
              localStorage.setItem("_user_role", _role);
              const extInfo_stringify = JSON.stringify([extUser]);
              localStorage.setItem("Extand_Class", extInfo_stringify);
            } catch (err) {
              console.log("Err in fetching extuser", err);
            }
            navigate(
              "/" + userSettings[0].pageType + "/" + userSettings[0].pageId
            );
            setIsLoader(false);
          }
        } catch (err) {
          console.log("err ", err.message);
          setIsLoader(false);
        }
      } catch (err) {
        console.log("err ", err);
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };

  // "handleSubmit" is used to save user details signup him/her who come from plan-pricing page
  const handleSubmit = (e) => {
    e.preventDefault();
    if (lengthValid && caseDigitValid && specialCharValid) {
      setIsLoader(true);
      if (formData.password === formData.confirmPassword) {
        const url = window.location.href;
        let paramString = url.split("?")[1];
        let queryString = new URLSearchParams(paramString);
        let obj = { ...formData };
        for (let pair of queryString.entries()) {
          obj = { ...obj, [pair[0]]: pair[1] };
        }
        saveUser(obj);
        // console.log("obj ", obj);}
      }
    }
  };
  const saveUser = async (obj) => {
    try {
      const zohoRes = await axios.post(
        parseBaseUrl + "functions/zohodetails",
        {
          hostedpagesId: obj.hostedpage_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId
          }
        }
      );

      const user = new Parse.User();
      user.set("username", zohoRes.data.result.email);
      user.set("password", obj.password);
      user.set("email", zohoRes.data.result.email);
      if (zohoRes?.data?.result?.phone) {
        user.set("phone", zohoRes.data.result.phone);
      }
      user.set("name", zohoRes.data.result.name);

      const res = await user.signUp();
      // console.log("res ", res);

      if (res) {
        const params = {
          userDetails: {
            jobTitle: zohoRes.data.result.jobTitle,
            company: zohoRes.data.result.company,
            name: zohoRes.data.result.name,
            email: zohoRes.data.result.email,
            phone: zohoRes?.data?.result?.phone || "",
            role: obj.role
          },
          subscription: zohoRes.data.result.subscription
        };
        const usersignup = await Parse.Cloud.run("usersignup", params);
        // console.log("usersignup ", usersignup);
        if (usersignup && usersignup.sessionToken) {
          handleNavigation(usersignup.sessionToken);
        }
      }
      // setIsLoader(false);
    } catch (error) {
      console.log("err ", error);
      if (error.message === "Account already exists for this username.") {
        alert(t("account-already-exists"));
        navigate("/", { replace: true });
      } else {
        setIsLoader(false);
        alert(t("something-went-wrong-mssg"));
      }
    }
  };

  const handlePassowordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validatePasswords(newPassword, formData.confirmPassword);

    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };
  const handleConFirmPassowordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validatePasswords(formData.password, newConfirmPassword);
  };
  const validatePasswords = (newPassword, newConfirmPassword) => {
    if (newPassword === newConfirmPassword) {
      setValidationMessage("Passwords match!");
    } else {
      setValidationMessage("Passwords not match!");
    }
  };

  const handleNavigation = async (sessionToken) => {
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
        const extUser = await Parse.Cloud.run("getUserDetails");
        if (extUser) {
          const IsDisabled = extUser?.get("IsDisabled") || false;
          if (!IsDisabled) {
            const userRole = extUser?.get("UserRole");
            const menu =
              userRole && userSettings.find((menu) => menu.role === userRole);
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
              setIsLoader(false);
              alert(t("registered-user-successfully"));
              const redirectUrl =
                location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
              // Redirect to the appropriate URL after successful login
              navigate(redirectUrl);
            }
          } else {
            setIsLoader(false);
          }
        }
      } catch (error) {
        setIsLoader(false);
        console.log("Err in fetch extuser", error);
      }
    }
  };
  return (
    <div className="w-full h-screen">
      <Title title={"Pgsignup page"} />
      {isLoader ? (
        <div className="flex justify-center items-center h-[100vh]">
          <Loader />
        </div>
      ) : (
        <div className="py-10 lg:p-16 flex justify-center">
          <form
            id="signup"
            className="w-[90%] md:w-[55%] bg-base-100 text-base-content op-card shadow-md"
            onSubmit={handleSubmit}
          >
            <div className="p-[16px]">
              <h1 className="text-2xl md:text-3xl font-bold">
                {t("choose-password")}
              </h1>
              <hr className="border-[1px] border-[#cecece] mb-[5px]" />
              <label htmlFor="password">
                <b className="text-[13px]">{t("password")}</b>
              </label>
              <input
                type="password"
                placeholder={t("enter-password")}
                name="password"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                value={formData.password}
                onChange={handlePassowordChange}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                required
              />
              <label htmlFor="confirmPassword">
                <b className="text-[13px]">{t("confirm-password")}</b>
              </label>
              <input
                type="password"
                placeholder={t("confirm-password")}
                name="confirmPassword"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                style={{
                  border: validationMessage
                    ? validationMessage === "Passwords match!"
                      ? "1px solid green"
                      : "1px solid red"
                    : ""
                }}
                value={formData.confirmPassword}
                onChange={handleConFirmPassowordChange}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                required
              />
              <div
                className={`${
                  validationMessage === "Passwords match!"
                    ? "text-[green]"
                    : "text-[red]"
                } ml-[13px] text-[11px]`}
              >
                {validationMessage}
              </div>
              {formData.password.length > 0 && (
                <div className="mt-1 text-[11px]">
                  <p
                    className={`${
                      lengthValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {lengthValid ? "✓" : "✗"} {t("password-length")}
                  </p>
                  <p
                    className={`${
                      caseDigitValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {caseDigitValid ? "✓" : "✗"} {t("password-case")}
                  </p>
                  <p
                    className={`${
                      specialCharValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {specialCharValid ? "✓" : "✗"} {t("password-special-char")}
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="op-btn op-btn-primary w-full mt-[8px]"
              >
                {t("submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PgSignUp;
