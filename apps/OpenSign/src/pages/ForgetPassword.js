import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { fetchAppInfo, forgetPassword } from "../redux/actions";
import Title from "../components/Title";
import { NavLink } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";
import Parse from "parse";
import Alert from "../primitives/Alert";
function ForgotPassword(props) {
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
    localStorage.setItem("appLogo", props.appInfo.applogo);
    localStorage.setItem("appName", props.appInfo.appname);
    localStorage.setItem("defaultmenuid", props.appInfo.defaultmenuid);
    localStorage.setItem("PageLanding", props.appInfo.LandingPageId);
    localStorage.setItem(
      "userSettings",
      JSON.stringify(props.appInfo.settings)
    );
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
    props.fetchAppInfo();
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line
  }, []);

  let image = props.appInfo.applogo;
  return (
    <div className="bg-white">
      <Title title="Forgot password page" />
      {sentStatus === "success" && (
        <Alert type="success">
          Reset password link has been sent to your email id
        </Alert>
      )}
      {sentStatus === "failed" && (
        <Alert type={"danger"}>Please setup email adapter </Alert>
      )}
      <div>
        <div className="md:m-10 lg:m-16 md:p-4 lg:p-10 p-5 bg-[#ffffff] md:border-[1px] md:border-gray-400 ">
          <div className="w-[250px] h-[66px] inline-block">
            {state.hideNav ? (
              <img src={image} width="100%" alt="" />
            ) : (
              <img src={image} width="100%" alt="" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
            <div className="">
              <form onSubmit={handleSubmit}>
                <h2 className="text-[30px] mt-6">Welcome Back !</h2>
                <span className="text-[12px] text-[#878787]">
                  Reset Your Password
                </span>
                <div className="shadow-md rounded my-4">
                  <div className="px-6 py-4">
                    <label className="block text-xs">Email</label>
                    <input
                      type="text"
                      className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                      name="email"
                      value={state.email}
                      onChange={handleChange}
                      required
                    />
                    <hr className="my-2 border-none" />
                  </div>
                </div>
                <div className="flex justify-between items-center px-4">
                  <button
                    type="submit"
                    className="rounded-sm bg-[#3ac9d6] text-white px-4 py-3 text-xs font-semibold shadow uppercase"
                  >
                    Submit
                  </button>
                  <NavLink
                    to="/"
                    className="rounded-sm bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] px-4 py-3 text-xs font-semibold shadow uppercase"
                  >
                    Login
                  </NavLink>
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

const mapStateToProps = (state) => {
  return { appInfo: state.appInfo, forgotPassword: state.forgotPassword };
};

export default connect(mapStateToProps, { fetchAppInfo, forgetPassword })(
  ForgotPassword
);
