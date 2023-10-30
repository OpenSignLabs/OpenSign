import React, { useState } from "react";
import "../css/LoginPage.css";
import loader from "../assests/loader2.gif";
import axios from "axios";
import { useParams } from "react-router-dom";
import { themeColor } from "../utils/ThemeColor/backColor";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
function Login() {
  const { id, userMail, serverUrl } = useParams();
  let navigate = useNavigate();
  //   const history = useHistory();

  const [email, setEmail] = useState(userMail);
  const [OTP, setOTP] = useState("");
  const [EnterOTP, setEnterOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleServerUrl();
  }, []);
  //https://qik-ai-org.github.io/Sign-MicroappV2/#/login/LqgGeZHd17/raktima.c@qik.ai/https:%2F%2Fserver3.qik.ai%2Fdefaultssty%2F&defaultssty&contracts
  // login/LqgGeZHd17/raktima.c@qik.ai/https:%2F%2Fserver3.qik.ai%2Fdefaultssty&defaultssty&contracts
  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = () => {
    // console.log("params", serverUrl);
    //split url in array from '&'
    localStorage.clear();
    const checkSplit = serverUrl.split("&");
    const server = checkSplit[0];
    const parseId = checkSplit[1];
    const appName = checkSplit[2];
    // console.log("appName", appName);

    const newServer = server.replaceAll("%2F", "/");
    localStorage.setItem("baseUrl", newServer);
    localStorage.setItem("parseAppId", parseId);
    localStorage.setItem("_appName", appName);
    setIsLoading(false);
    // console.log("checkSPlit", newServer, parseId, appName);
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
    // console.log("server",serverUrl)
    if (serverUrl && localStorage) {
      setLoading(true);
      e.preventDefault();
      setEmail(email);

      try {
        //   const { baseUrl, parseAppId, mobile } = this.state;
        let url = `${serverUrl}functions/SendOTPMailV1/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId,
        };
        let body = {
          email: email.toString(),
          // appId: {
          //   __type: "Pointer",
          //   className: "w_appinfo",
          //   objectId: localStorage.getItem("_app_objectId"),
          // },
        };
        let Otp = await axios.post(url, body, { headers: headers });

        if (Otp) {
          setLoading(false);
          setEnterOtp(true);
        }
      } catch (error) {
        //   this.setState({ loading: false });
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
        //	AuthLoginAs
        let url = `${serverUrl}functions/AuthLoginAsMail/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseId,
        };
        let body = {
          email: email,
          // email,
          otp: OTP,
        };
        let user = await axios.post(url, body, { headers: headers });
        // console.log("user", user.data.result);
        if (user.data.result === "Invalid Otp") {
          alert("Invalid Otp");
          setLoading(false);
        }else if(user.data.result === "user not found!"){
          alert("User not found!");
          setLoading(false);
        }
         else {
          let _user = user.data.result;

          localStorage.setItem("UserInformation", JSON.stringify(_user));
          // localStorage.setItem("userEmail", email);
          localStorage.setItem("username", _user.name);
          // console.log("session token", _user.sessionToken);
          localStorage.setItem("accesstoken", _user.sessionToken);

          setLoading(false);
          //navigate user to on signature page
          //  history.push(`/recipientSignPdf/${id}/${_user.phone}`);
          navigate(`/recipientSignPdf/${id}/${_user.phone}`);
        }
      } catch (error) {}
    } else {
      alert("Please Enter OTP!");
    }
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
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
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
            // box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
          }}
        >
          <div className="main_head">
            <div className="main-logo">
              <img alt="sign img" src="https://qikinnovation.ams3.digitaloceanspaces.com/logo.png" width="100%" />
            </div>
          </div>

          {!EnterOTP ? (
            <form>
              <div className="row">
                <div className="col-sm-6 KLO">
                  <h2>Welcome Back !</h2>
                  <span className="KNLO">
                    Verification code is sent to your email
                  </span>
                  <div className="card card-box">
                    <div className="card-body">
                      <input
                        type="email"
                        className="form-control"
                        name="mobile"
                        value={email}
                        disabled
                        height={30}
                        style={{ fontSize: "20px", fontWeight: "600" }}
                      />
                      <br />
                    </div>
                  </div>
                  <div
                    className="col-md-4 col-sm-4"
                    style={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading ? (
                      <button
                        className="btn btn-info loadinBtn "
                        type="button"
                        style={{ marginBottom: "4px", width: "210px" }}
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
                        className="btn btn-sm otpButton"
                        onClick={(e) => SendOtp(e)}
                        style={{
                          marginBottom: "4px",
                          width: "210px",
                          background: themeColor(),
                          color: "white",
                          fontWeight: "600",
                        }}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form>
              <div className="row">
                <div className="col-sm-6 KLO">
                  <h2>Welcome Back !</h2>
                  <span className="KNLO">You will get a OTP via Email</span>
                  <div className="card card-box">
                    <div className="card-body">
                      <label>Enter Verification Code</label>
                      <input
                        type="number"
                        className="form-control"
                        name="OTP"
                        value={OTP}
                        min="4"
                        max="4"
                        onChange={handleChange}
                      />

                      <br />
                    </div>
                  </div>
                  <div
                    className="col-md-4 col-sm-4"
                    style={{ textAlign: "center" }}
                  >
                    {loading ? (
                      <button
                        className="btn btn-info "
                        type="button"
                        style={{ marginBottom: "4px", width: "210px" }}
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
                        className="btn btn-info login-btn"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Login;
