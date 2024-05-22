import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/loginPage.css";
import loader from "../assets/images/loader2.gif";
import axios from "axios";
import { isEnableSubscription, themeColor } from "../constant/const";
import { contractUsers, getAppLogo } from "../constant/Utils";
import logo from "../assets/images/logo.png";
import { appInfo } from "../constant/appinfo";

function GuestLogin() {
  const { id, userMail, contactBookId, base64url } = useParams();
  let navigate = useNavigate();
  const [email, setEmail] = useState(userMail);
  const [OTP, setOTP] = useState("");
  const [EnterOTP, setEnterOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appLogo, setAppLogo] = useState("");
  const [documentId, setDocumentId] = useState(id);
  const [contactId, setContactId] = useState(contactBookId);
  const [sendmail, setSendmail] = useState();
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
      setEmail(checkSplit[1]);
      setContactId(checkSplit[2]);
      setSendmail(checkSplit[3]);
    }

    setIsLoading(false);
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setOTP(value);
  };

  //send email OTP function
  const SendOtp = async (e) => {
    const serverUrl =
      localStorage.getItem("baseUrl") && localStorage.getItem("baseUrl");
    const parseId =
      localStorage.getItem("parseAppId") && localStorage.getItem("parseAppId");
    if (serverUrl && localStorage) {
      setLoading(true);
      e.preventDefault();
      setEmail(email);

      try {
        let url = `${serverUrl}functions/SendOTPMailV1/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId
        };
        let body = {
          email: email.toString(),
          docId: documentId
        };
        let Otp = await axios.post(url, body, { headers: headers });

        if (Otp) {
          setLoading(false);
          setEnterOtp(true);
        }
      } catch (error) {
        alert("something went wrong!");
      }
    } else {
      alert("something went wrong!");
    }
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
          if (contractUserDetails) {
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

  return (
    <div style={{ padding: "2rem", background: "white" }}>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column"
          }}
        >
          <img
            alt="no img"
            src={loader}
            style={{ width: "80px", height: "80px" }}
          />
          <span style={{ fontSize: "13px", color: "gray" }}>
            {isLoading.message}
          </span>
        </div>
      ) : (
        <div
          style={{
            margin: "10px",
            border: "0.5px solid #c5c7c9",
            padding: "30px",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
          }}
        >
          <div className="main_head">
            <div className="w-[250px] h-[66px] inline-block overflow-hidden">
              {appLogo && (
                <img
                  src={appLogo}
                  className="object-contain h-full"
                  alt="logo"
                />
              )}
            </div>
          </div>

          {!EnterOTP ? (
            <div className="row">
              <div className="col-sm-6 KLO">
                <span className="welcomeText">Welcome Back !</span>
                <br />
                <span className="KNLO">
                  Verification code is sent to your email
                </span>
                <div className="card card-box" style={{ borderRadius: "0px" }}>
                  <div className="card-body">
                    <input
                      type="email"
                      name="mobile"
                      value={email}
                      disabled
                      className="loginInput"
                    />
                    <br />
                  </div>
                </div>
                <div className="btnContainer">
                  {loading ? (
                    <button
                      type="button"
                      style={{
                        background: themeColor,
                        color: "white"
                      }}
                      className="verifyBtn"
                      disabled
                    >
                      <span
                        className="spinner-border spinner-border-sm "
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </button>
                  ) : (
                    <button
                      className="verifyBtn"
                      style={{
                        background: themeColor,
                        color: "white",
                        marginLeft: "0px !important"
                      }}
                      onClick={(e) => SendOtp(e)}
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-sm-6 KLO">
                <span className="welcomeText">Welcome Back !</span>
                <br />
                <span className="KNLO">You will get a OTP via Email</span>
                <div className="card card-box">
                  <div className="card-body">
                    <label>Enter Verification Code</label>
                    <input
                      type="number"
                      className="loginInput"
                      name="OTP"
                      value={OTP}
                      onChange={handleChange}
                    />

                    <br />
                  </div>
                </div>
                <div>
                  {loading ? (
                    <button
                      style={{
                        background: themeColor,
                        color: "white"
                      }}
                      className="verifyBtn"
                      type="button"
                      disabled
                    >
                      <span
                        className="spinner-border spinner-border-sm "
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => VerifyOTP(e)}
                      style={{
                        background: themeColor,
                        color: "white"
                      }}
                      className="verifyBtn"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GuestLogin;
