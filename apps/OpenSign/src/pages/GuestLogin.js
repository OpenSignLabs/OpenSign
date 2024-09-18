import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { isEnableSubscription } from "../constant/const";
import {
  contractUsers,
  getAppLogo,
  saveLanguageInLocal
} from "../constant/Utils";
import logo from "../assets/images/logo.png";
import { appInfo } from "../constant/appinfo";
import Parse from "parse";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";

function GuestLogin() {
  const { t, i18n } = useTranslation();
  const { id, userMail, contactBookId, base64url } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(userMail);
  const [OTP, setOTP] = useState("");
  const [EnterOTP, setEnterOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appLogo, setAppLogo] = useState("");
  const [documentId, setDocumentId] = useState(id);
  const [contactId, setContactId] = useState(contactBookId);
  const [sendmail, setSendmail] = useState();
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const navigateToDoc = async (docId, contactId) => {
    try {
      const docDetails = await Parse.Cloud.run("getDocument", {
        docId: docId
      });
      if (!docDetails.error) {
        if (sendmail === "false") {
          navigate(
            `/load/recipientSignPdf/${docId}/${contactId}?sendmail=${sendmail}`
          );
        } else {
          navigate(`/load/recipientSignPdf/${docId}/${contactId}`);
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("err while getting doc", err);
      return false;
    }
  };
  useEffect(() => {
    handleServerUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = async () => {
    if (isEnableSubscription) {
      const app = await getAppLogo();
      if (app?.logo) {
        setAppLogo(app?.logo);
      } else {
        setAppLogo(logo);
      }
    } else {
      setAppLogo(logo);
    }

    localStorage.clear();
    saveLanguageInLocal(i18n);
    const parseId = appInfo.appId;
    const newServer = `${appInfo.baseUrl}/`;
    localStorage.setItem("baseUrl", newServer);
    localStorage.setItem("parseAppId", parseId);
    //this condition is used decode base64 to string and get userEmail,documentId, contactBoookId data.
    if (!id) {
      //`atob` function is used to decode base64
      const decodebase64 = atob(base64url);
      //split url in array from '/'
      const checkSplit = decodebase64.split("/");
      setDocumentId(checkSplit[0]);
      setContact((prev) => ({ ...prev, email: checkSplit[1] }));
      setEmail(checkSplit[1]);
      const contactId = checkSplit?.[2];
      setSendmail(checkSplit[3]);
      if (!contactId) {
        const params = { email: checkSplit[1], docId: checkSplit[0] };
        try {
          const linkContactRes = await Parse.Cloud.run(
            "linkcontacttodoc",
            params
          );
          setContactId(linkContactRes?.contactId);
          await navigateToDoc(checkSplit[0], linkContactRes?.contactId);
        } catch (err) {
          console.log("Err in link ext contact", err);
        }
      } else {
        setContactId(checkSplit[2]);
        await navigateToDoc(checkSplit[0], checkSplit[2]);
      }
    }

    setIsLoading(false);
  };

  //send email OTP function
  const SendOtp = async () => {
    setLoading(true);
    setEmail(email);
    try {
      const params = { email: email.toString(), docId: documentId };
      const Otp = await Parse.Cloud.run("SendOTPMailV1", params);
      if (Otp) {
        setLoading(false);
        setEnterOtp(true);
      }
    } catch (error) {
      alert(t("something-went-wrong-mssg"));
    }
  };

  const handleSendOTPBtn = async (e) => {
    e.preventDefault();
    await SendOtp();
  };

  //verify OTP send on via email
  const VerifyOTP = async (e) => {
    e.preventDefault();
    const serverUrl =
      localStorage.getItem("baseUrl") && localStorage.getItem("baseUrl");
    const parseId =
      localStorage.getItem("parseAppId") && localStorage.getItem("parseAppId");
    if (OTP) {
      setLoading(true);
      try {
        let url = `${serverUrl}functions/AuthLoginAsMail`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId
        };
        let body = { email: email, otp: OTP };
        let user = await axios.post(url, body, { headers: headers });
        if (user.data.result === "Invalid Otp") {
          alert(t("invalid-otp"));
          setLoading(false);
        } else if (user.data.result === "user not found!") {
          alert(t("user-not-found"));
          setLoading(false);
        } else {
          let _user = user.data.result;
          await Parse.User.become(_user.sessionToken);
          const parseId = localStorage.getItem("parseAppId");
          const contractUserDetails = await contractUsers();
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem(
            `Parse/${parseId}/currentUser`,
            JSON.stringify(_user)
          );
          if (contractUserDetails && contractUserDetails.length > 0) {
            localStorage.setItem(
              "Extand_Class",
              JSON.stringify(contractUserDetails)
            );
          }

          localStorage.setItem("username", _user.name);
          localStorage.setItem("accesstoken", _user.sessionToken);
          //save isGuestSigner true in local to handle login flow header in mobile view
          localStorage.setItem("isGuestSigner", true);
          setLoading(false);
          if (sendmail === "false") {
            navigate(
              `/load/recipientSignPdf/${documentId}/${contactId}?sendmail=${sendmail}`
            );
          } else {
            navigate(`/load/recipientSignPdf/${documentId}/${contactId}`);
          }
        }
      } catch (error) {
        console.log("err ", error);
      }
    } else {
      alert(t("enter-otp-alert"));
    }
  };
  const handleUserData = async (e) => {
    e.preventDefault();
    const params = { ...contact, docId: documentId };
    try {
      setLoading(true);
      const linkContactRes = await Parse.Cloud.run("linkcontacttodoc", params);
      setContactId(linkContactRes.contactId);
      const IsEnableOTP = await navigateToDoc(
        documentId,
        linkContactRes.contactId
      );
      if (!IsEnableOTP) {
        setEnterOtp(true);
        await SendOtp();
      }
    } catch (err) {
      setLoading(false);
      alert(t("something-went-wrong-mssg"));
      console.log("Err in link ext contact", err);
    }
  };
  const handleInputChange = (e) => {
    setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <div className="p-14">
      <div>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[100vh]">
            <Loader />
            <span className="text-[13px] text-[gray]">{isLoading.message}</span>
          </div>
        ) : (
          <div className="m-1 md:m-2 p-[30px] text-base-content bg-base-100 op-card shadow-md">
            <div className="md:w-[250px] md:h-[66px] inline-block overflow-hidden mt-2 mb-11">
              {appLogo && (
                <img src={appLogo} className="object-contain" alt="logo" />
              )}
            </div>
            {contactId ? (
              <>
                {!EnterOTP ? (
                  <div className="w-full md:w-[50%] text-base-content">
                    <h1 className="text-2xl md:text-[30px]">{t("welcome")}</h1>
                    <legend className="text-[12px] text-[#878787] mt-2 mb-1">
                      {t("get-otp-alert")}
                    </legend>
                    <div className="p-[20px] outline outline-1 outline-slate-300/50 my-2 op-card shadow-md">
                      <input
                        type="email"
                        name="email"
                        value={email}
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full disabled:text-[#5c5c5c] text-xs"
                        disabled
                      />
                    </div>
                    <div className="mt-3">
                      <button
                        className="op-btn op-btn-primary"
                        onClick={(e) => handleSendOTPBtn(e)}
                        disabled={loading}
                      >
                        {loading ? t("loading") : t("get-verification-code")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    className="w-full md:w-[50%] text-base-content"
                    onSubmit={VerifyOTP}
                  >
                    <h1 className="text-2xl md:text-[30px]">{t("welcome")}</h1>
                    <legend className="text-[12px] text-[#878787] mt-2">
                      {t("guest-email-alert")}
                    </legend>
                    <div className="p-[20px] pt-[15px] outline outline-1 outline-slate-300/50 op-card my-2 shadow-md">
                      <p className="text-sm">{t("enter-verification-code")}</p>
                      <input
                        type="number"
                        className="mt-2 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        name="OTP"
                        value={OTP}
                        onChange={(e) => setOTP(e.target.value)}
                      />
                    </div>
                    <div className="mt-2.5">
                      <button
                        className="op-btn op-btn-primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? t("loading") : t("verify")}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="w-full md:w-[50%] text-base-content">
                <h1 className="text-2xl md:text-[30px]">{t("welcome")}</h1>
                <legend className="text-[12px] text-[#878787] mt-2">
                  {t("provide-your-details")}
                </legend>
                <form
                  className="p-[20px] pt-[15px] outline outline-1 outline-slate-300/50 my-2 op-card shadow-md"
                  onSubmit={handleUserData}
                >
                  <div className="mb-2">
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
                      value={contact.name}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      disabled={loading}
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                    />
                  </div>
                  <div className="mb-2">
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
                      value={contact.email}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      required
                      disabled
                    />
                  </div>
                  <div className="mt-2.5">
                    <label
                      htmlFor="phone"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("phone")}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={contact.phone}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      disabled={loading}
                    />
                  </div>
                  <div className="mt-2 flex justify-start">
                    <button
                      type="submit"
                      className="op-btn op-btn-primary"
                      disabled={loading}
                    >
                      {loading ? t("loading") : t("next")}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      <SelectLanguage />
    </div>
  );
}

export default GuestLogin;
