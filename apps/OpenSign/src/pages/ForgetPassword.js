import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";
import Parse from "parse";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { useDispatch } from "react-redux";
import { fetchAppInfo } from "../redux/reducers/infoReducer";

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState({
    email: "",
    password: "",
    hideNav: ""
  });
  const [sentStatus, setSentStatus] = useState("");
  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const resize = () => {
    let currentHideNav = window.innerWidth <= 760;
    if (currentHideNav !== state.hideNav) {
      setState({ ...state, hideNav: currentHideNav });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    localStorage.setItem("appLogo", appInfo.applogo);
    localStorage.setItem("appName", appInfo.appname);
    // localStorage.setItem("defaultmenuid", props.appInfo.defaultmenuid);
    // localStorage.setItem("PageLanding", props.appInfo.LandingPageId);
    localStorage.setItem("userSettings", JSON.stringify(appInfo.settings));
    if (state.email) {
      const username = state.email;
      try {
        await Parse.User.requestPasswordReset(username);
        setSentStatus("success");
      } catch (err) {
        console.log("err ", err.code);
        setSentStatus("failed");
      } finally {
        setTimeout(() => setSentStatus(""), 1000);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchAppInfo());
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line
  }, []);

  let image = appInfo.applogo;
  return (
    <div>
      <Title title="Forgot password page" />
      {sentStatus === "success" && (
        <Alert type="success">
          Reset password link has been sent to your email id
        </Alert>
      )}
      {sentStatus === "failed" && (
        <Alert type={"danger"}>Please setup email adapter </Alert>
      )}
      <div className="md:p-10 lg:p-16">
        <div className=" md:p-4 lg:p-10 p-5 bg-base-100 text-base-content md:border-[1px] md:border-gray-400 ">
          <div className="w-[250px] h-[66px] inline-block">
            {state.hideNav ? (
              <img src={image} width="100%" alt="" />
            ) : (
              <img src={image} width="100%" alt="" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
            <div>
              <form onSubmit={handleSubmit}>
                <h2 className="text-[30px] mt-6">Welcome Back !</h2>
                <span className="text-[12px] text-[#878787]">
                  Reset Your Password
                </span>
                <div className="shadow-md rounded my-4">
                  <div className="px-6 py-4">
                    <label className="block text-xs">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="op-input op-input-bordered op-input-sm w-full"
                      value={state.email}
                      onChange={handleChange}
                      required
                    />
                    <hr className="my-2 border-none" />
                  </div>
                </div>
                <div className="flex justify-between items-center px-4">
                  <button type="submit" className="op-btn op-btn-primary">
                    Submit
                  </button>
                  <button
                    onClick={() => navigate("/", { replace: true })}
                    className="op-btn op-btn-secondary"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
            {!state.hideNav && (
              <div className="self-center">
                <div className="mx-auto md:w-[300px] lg:w-[500px]">
                  <img src={login_img} alt="bisec" width="100%" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
