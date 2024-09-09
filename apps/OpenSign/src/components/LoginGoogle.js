import React, { useState, useRef } from "react";
import Parse from "parse";
import { jwtDecode } from "jwt-decode";
import { useScript } from "../hook/useScript";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { saveLanguageInLocal } from "../constant/Utils";
/*
 * `GoogleSignInBtn`as it's name indicates it render google sign in button
 * and in this `useScript` in which we have created for generate google sign button
 * and when user click on sign in with google it will be verify on server side
 * and then generate token
 */
const GoogleSignInBtn = ({
  GoogleCred,
  thirdpartyLoginfn,
  thirdpartyLoader,
  setThirdpartyLoader
}) => {
  const { t, i18n } = useTranslation();
  const [isModal, setIsModal] = useState(false);
  const googleBtn = useRef();
  const [userDetails, setUserDetails] = useState({
    Phone: "",
    Company: "",
    Name: "",
    Email: "",
    Destination: ""
  });
  const [googleDetails, setGoogleDetails] = useState({
    Id: "",
    TokenId: "",
    Gmail: "",
    Name: ""
  });
  useScript("https://accounts.google.com/gsi/client", () => {
    window.google.accounts.id.initialize({
      client_id: GoogleCred,
      callback: responseGoogle,
      auto_select: false
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: "outline",
      size: "large",
      width: "187px"
    });
  });
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
  const responseGoogle = async (response) => {
    clearStorage();
    setThirdpartyLoader(true);
    // console.log("response ", response);
    if (response.credential) {
      const data = jwtDecode(response.credential);
      // console.log("data ", data);
      if (data.sub && data.email) {
        const details = { Email: data.email, Name: data.name };
        setUserDetails({ ...userDetails, ...details });
        const Gdetails = {
          Id: data.sub,
          TokenId: response.credential,
          Gmail: data.email,
          Name: data.name
        };
        setGoogleDetails({ ...googleDetails, ...Gdetails });
        await checkExtUser(Gdetails);
      }
    }
  };
  const checkExtUser = async (details) => {
    const params = { email: details.Gmail };
    const extRes = await Parse.Cloud.run("getUserDetails", params);
    if (extRes) {
      // const params = { ...details, Phone: extRes?.get("Phone") || "" };
      const params = { ...details, extUserId: extRes.objectId };
      const payload = await Parse.Cloud.run("googlesign", params);
      if (payload && payload.sessiontoken) {
        const LocalUserDetails = {
          name: details.Name,
          email: details.Gmail,
          phone: payload?.phone || "",
          company: payload.company
        };
        localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
        thirdpartyLoginfn(payload.sessiontoken);
      }
      return { msg: "exist" };
    } else {
      setIsModal(true);
      setThirdpartyLoader(false);
      return { msg: "notexist" };
    }
  };
  const handleSubmitbtn = async () => {
    if (userDetails.Phone && userDetails.Company) {
      setThirdpartyLoader(true);
      // e.preventDefault()
      // console.log("handelSubmit", userDetails);
      const params = { ...googleDetails, Phone: userDetails?.Phone };
      const payload = await Parse.Cloud.run("googlesign", params);

      // console.log("payload ", payload);
      if (payload && payload.sessiontoken) {
        const params = {
          userDetails: {
            name: userDetails.Name,
            email: userDetails.Email,
            // "passsword":userDetails.Phone,
            phone: userDetails?.Phone || "",
            role: "contracts_User",
            company: userDetails.Company,
            jobTitle: userDetails.Destination
          }
        };
        const userSignUp = await Parse.Cloud.run("usersignup", params);
        // console.log("userSignUp ", userSignUp);
        if (userSignUp && userSignUp.sessionToken) {
          const LocalUserDetails = {
            name: userDetails.Name,
            email: userDetails.Email,
            phone: userDetails?.Phone || "",
            company: userDetails.Company
            // jobTitle: userDetails.JobTitle
          };
          localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
          thirdpartyLoginfn(userSignUp.sessionToken);
        } else {
          alert(userSignUp.message);
        }
      } else if (
        payload &&
        payload.message.replace(/ /g, "_") === "Internal_server_err"
      ) {
        alert(t("server-error"));
      }
    } else {
      alert(t("fill-required-details!"));
    }
  };
  const handleCloseModal = async () => {
    setIsModal(false);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
  };
  return (
    <div className="relative">
      {thirdpartyLoader && (
        <div className="fixed flex justify-center items-center inset-0 bg-black bg-opacity-25 z-20 ">
          <Loader />
        </div>
      )}
      <div ref={googleBtn} className="text-sm"></div>
      <ModalUi showClose={false} isOpen={isModal} title={t("sign-up-form")}>
        <form className="px-4 py-3 text-base-content">
          <div className="mb-3">
            <label htmlFor="Phone" className="block text-xs font-semibold">
              {t("phone")} <span className="text-[13px] text-[red]">*</span>
            </label>
            <input
              type="tel"
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              id="Phone"
              value={userDetails.Phone}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  Phone: e.target.value
                })
              }
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Company" className="block text-xs font-semibold">
              {t("company")} <span className="text-[13px] text-[red]">*</span>
            </label>
            <input
              type="text"
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              id="Company"
              value={userDetails.Company}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  Company: e.target.value
                })
              }
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="JobTitle" className="block text-xs font-semibold">
              {t("job-title")} <span className="text-[13px] text-[red]">*</span>
            </label>
            <input
              type="text"
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              id="JobTitle"
              value={userDetails.Destination}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  Destination: e.target.value
                })
              }
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
          <div className="flex flex-row gap-2">
            <button
              type="button"
              className="op-btn op-btn-primary"
              onClick={() => handleSubmitbtn()}
            >
              {t("sign-up")}
            </button>
            <button
              type="button"
              className="op-btn op-btn-ghost"
              onClick={handleCloseModal}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </ModalUi>
    </div>
  );
};

export default GoogleSignInBtn;
