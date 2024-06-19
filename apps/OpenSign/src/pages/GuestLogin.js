import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { isEnableSubscription } from "../constant/const";
import { contractUsers, getAppLogo } from "../constant/Utils";
import logo from "../assets/images/logo.png";
import { appInfo } from "../constant/appinfo";
import Parse from "parse";
import Loader from "../primitives/Loader";

function GuestLogin() {
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
  useEffect(() => {
    handleServerUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = async () => {
    if (isEnableSubscription) {
      const applogo = await getAppLogo();
      if (applogo) {
        setAppLogo(applogo);
      } else {
        setAppLogo(logo);
      }
    } else {
      setAppLogo(logo);
    }

    localStorage.clear();
    const parseId = appInfo.appId;
    const newServer = `${appInfo.baseUrl}/`;
    const appName = appInfo.appname;
    localStorage.setItem("baseUrl", newServer);
    localStorage.setItem("parseAppId", parseId);
    localStorage.setItem("_appName", appName);
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
          // console.log("linkContactRes ", linkContactRes);
          setContactId(linkContactRes?.contactId);
        } catch (err) {
          console.log("Err in link ext contact", err);
        }
      } else {
        setContactId(checkSplit[2]);
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
      alert("something went wrong!");
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
        let url = `${serverUrl}functions/AuthLoginAsMail/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId
        };
        let body = {
          email: email,
          otp: OTP
        };
        let user = await axios.post(url, body, { headers: headers });
        if (user.data.result === "Invalid Otp") {
          alert("Invalid Otp");
          setLoading(false);
        } else if (user.data.result === "user not found!") {
          alert("User not found!");
          setLoading(false);
        } else {
          let _user = user.data.result;
          const parseId = localStorage.getItem("parseAppId");
          const contractUserDetails = await contractUsers(_user.email);
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem(
            `Parse/${parseId}/currentUser`,
            JSON.stringify(_user)
          );
          // console.log("contractUserDetails ", contractUserDetails);
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
      alert("Please Enter OTP!");
    }
  };
  const handleUserData = async (e) => {
    e.preventDefault();
    const params = { ...contact, docId: documentId };
    try {
      setLoading(true);
      const linkContactRes = await Parse.Cloud.run("linkcontacttodoc", params);
      // console.log("linkContactRes ", linkContactRes);
      setContactId(linkContactRes.contactId);
      setEnterOtp(true);
      await SendOtp();
    } catch (err) {
      setLoading(false);
      alert("something went wron, please try agian later.");
      console.log("Err in link ext contact", err);
    }
  };
  const handleInputChange = (e) => {
    setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <div className="p-[2rem]">
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
                  <h1 className="text-2xl md:text-[30px]">Welcome Back!</h1>
                  <legend className="text-[12px] text-[#878787] mt-2 mb-1">
                    Verification code is sent to your email
                  </legend>
                  <div className="p-[20px] outline outline-1 outline-slate-300/50 my-2 op-card shadow-md">
                    <input
                      type="email"
                      name="mobile"
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
                      {loading ? "Loading..." : "Get verification code"}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  className="w-full md:w-[50%] text-base-content"
                  onSubmit={VerifyOTP}
                >
                  <h1 className="text-2xl md:text-[30px]">Welcome Back!</h1>
                  <legend className="text-[12px] text-[#878787] mt-2">
                    You will get a verification code via Email
                  </legend>
                  <div className="p-[20px] pt-[15px] outline outline-1 outline-slate-300/50 op-card my-2 shadow-md">
                    <p className="text-sm">Enter Verification Code</p>
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
                      {loading ? "Loading..." : "Verify"}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="w-full md:w-[50%] text-base-content">
              <h1 className="text-2xl md:text-[30px]">Welcome</h1>
              <legend className="text-[12px] text-[#878787] mt-2">
                Provide your details
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
                    Name
                    <span className="text-[red] text-[13px]"> *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contact.name}
                    onChange={handleInputChange}
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label
                    htmlFor="email"
                    className="block text-xs text-gray-700 font-semibold"
                  >
                    Email
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
                    Phone
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
                    {loading ? "Loading..." : "Next"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GuestLogin;
