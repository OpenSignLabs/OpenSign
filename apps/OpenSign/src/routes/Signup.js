import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Parse from "parse";
import axios from "axios";
import Title from "../components/Title";
import { fetchAppInfo, showTenantName } from "../redux/actions";
import { useNavigate, NavLink } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";
import { useWindowSize } from "../hook/useWindowSize";

const Signup = (props) => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [state, setState] = useState({
    loading: false,
    toastColor: "#5cb85c",
    toastDescription: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const image = props.appInfo.applogo;

  const clearStorage = async () => {
    if (Parse.User.current()) {
      await Parse.User.logOut();
    }
    let baseUrl = localStorage.getItem("BaseUrl12");
    let appid = localStorage.getItem("AppID12");
    let applogo = localStorage.getItem("appLogo");
    let domain = localStorage.getItem("domain");
    let appversion = localStorage.getItem("appVersion");
    let appTitle = localStorage.getItem("appTitle");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let _appName = localStorage.getItem("_appName");
    let _app_objectId = localStorage.getItem("_app_objectId");
    let appName = localStorage.getItem("appName");
    let userSettings = localStorage.getItem("userSettings");

    localStorage.clear();

    localStorage.setItem("BaseUrl12", baseUrl);
    localStorage.setItem("AppID12", appid);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("domain", domain);
    localStorage.setItem("appversion", appversion);
    localStorage.setItem("appTitle", appTitle);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("_appName", _appName);
    localStorage.setItem("_app_objectId", _app_objectId);
    localStorage.setItem("appName", appName);
    localStorage.setItem("userSettings", userSettings);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
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
        Parse.serverURL = parseBaseUrl;
        Parse.initialize(parseAppId);
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
              let roleData = props.appInfo.settings;
              if (roleData && roleData.length > 0) {
                const params = {
                  userDetails: {
                    jobTitle: jobTitle,
                    company: company,
                    name: name,
                    email: email,
                    phone: phone,
                    role: props.appInfo.defaultRole
                  }
                };
                try {
                  const usersignup = await Parse.Cloud.run(
                    "usersignup",
                    params
                  );
                  if (usersignup) {
                    handleNavigation(r.getSessionToken());
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
                alert("User already exists with this username!");
                setState({ loading: false });
              } else {
                let baseUrl = localStorage.getItem("BaseUrl12");
                let parseAppId = localStorage.getItem("AppID12");
                // console.log("state.email ", email);
                try {
                  Parse.serverURL = baseUrl;
                  Parse.initialize(parseAppId);
                  await Parse.User.requestPasswordReset(email).then(
                    async function (res1) {
                      if (res1.data === undefined) {
                        alert(
                          "Verification mail has been sent to your E-mail!"
                        );
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

  const handleNavigation = async (sessionToken) => {
    const baseUrl = localStorage.getItem("BaseUrl12");
    const parseAppId = localStorage.getItem("AppID12");
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
      localStorage.setItem("userEmail", _user.email);
      localStorage.setItem("username", _user.name);
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", true);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      // Check extended class user role and tenentId
      try {
        let userRoles = [];
        if (props.appInfo.settings) {
          let userSettings = props.appInfo.settings;

          //Get Current user roles
          let url = `${baseUrl}functions/UserGroups`;
          const headers = {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId,
            sessionToken: _user.sessionToken
          };

          let body = {
            appname: localStorage.getItem("_appName")
          };
          await axios
            .post(url, JSON.stringify(body), { headers: headers })
            .then((roles) => {
              if (roles) {
                userRoles = roles.data.result;
                let _currentRole = "";
                if (userRoles.length > 1) {
                  if (
                    userRoles[0] ===
                    `${localStorage.getItem("_appName")}_appeditor`
                  ) {
                    _currentRole = userRoles[1];
                  } else {
                    _currentRole = userRoles[0];
                  }
                } else {
                  _currentRole = userRoles[0];
                }
                if (
                  _currentRole !==
                  `${localStorage.getItem("_appName")}_appeditor`
                ) {
                  userSettings.forEach(async (element) => {
                    if (element.role === _currentRole) {
                      let _role = _currentRole.replace(
                        `${localStorage.getItem("_appName")}_`,
                        ""
                      );
                      localStorage.setItem("_user_role", _role);
                      // Get TenentID from Extendend Class
                      localStorage.setItem(
                        "extended_class",
                        element.extended_class
                      );
                      localStorage.setItem("userpointer", element.userpointer);

                      await Parse.Cloud.run("getUserDetails", {
                        email: email
                      }).then(
                        (result) => {
                          let tenentInfo = [];
                          const results = [result];
                          if (results) {
                            let extendedInfo_stringify =
                              JSON.stringify(results);
                            localStorage.setItem(
                              "Extand_Class",
                              extendedInfo_stringify
                            );
                            let extendedInfo = JSON.parse(
                              extendedInfo_stringify
                            );
                            if (extendedInfo.length > 1) {
                              extendedInfo.forEach((x) => {
                                if (x.TenantId) {
                                  let obj = {
                                    tenentId: x.TenantId.objectId,
                                    tenentName: x.TenantId.TenantName || ""
                                  };
                                  tenentInfo.push(obj);
                                }
                              });
                              if (tenentInfo.length) {
                                props.showTenantName(
                                  tenentInfo[0].tenentName || ""
                                );
                                localStorage.setItem(
                                  "TenantName",
                                  tenentInfo[0].tenentName || ""
                                );
                              }

                              localStorage.setItem("showpopup", true);
                              localStorage.setItem(
                                "IncludedApps",
                                JSON.stringify(tenentInfo)
                              );

                              localStorage.setItem(
                                "PageLanding",
                                element.pageId
                              );
                              localStorage.setItem(
                                "defaultmenuid",
                                element.menuId
                              );
                              localStorage.setItem(
                                "pageType",
                                element.pageType
                              );
                              setState({ loading: false });
                              navigate("/");
                            } else {
                              extendedInfo.forEach((x) => {
                                if (x.TenantId) {
                                  let obj = {
                                    tenentId: x.TenantId.objectId,
                                    tenentName: x.TenantId.TenantName || ""
                                  };
                                  localStorage.setItem(
                                    "TenetId",
                                    x.TenantId.objectId
                                  );
                                  tenentInfo.push(obj);
                                }
                              });
                              if (tenentInfo.length) {
                                props.showTenantName(
                                  tenentInfo[0].tenentName || ""
                                );
                                localStorage.setItem(
                                  "TenantName",
                                  tenentInfo[0].tenentName || ""
                                );
                              }
                              localStorage.setItem(
                                "PageLanding",
                                element.pageId
                              );
                              localStorage.setItem(
                                "defaultmenuid",
                                element.menuId
                              );
                              localStorage.setItem(
                                "pageType",
                                element.pageType
                              );
                              setState({ loading: false });
                              if (process.env.REACT_APP_ENABLE_SUBSCRIPTION) {
                                navigate(`/subscription`, { replace: true });
                              } else {
                                alert("Registered user successfully");
                                navigate(
                                  `/${element.pageType}/${element.pageId}`
                                );
                              }
                            }
                          } else {
                            alert("Registered user successfully");
                            localStorage.setItem("PageLanding", element.pageId);
                            localStorage.setItem(
                              "defaultmenuid",
                              element.menuId
                            );
                            localStorage.setItem("pageType", element.pageType);
                            setState({ loading: false });
                            if (process.env.REACT_APP_ENABLE_SUBSCRIPTION) {
                              navigate(`/subscription`, { replace: true });
                            } else {
                              navigate(
                                `/${element.pageType}/${element.pageId}`
                              );
                            }
                          }
                        },
                        (error) => {
                          /*   alert(
                          "You dont have access to this application."
                        ); */
                          setState({
                            loading: false,
                            toastColor: "#d9534f",
                            toastDescription:
                              "You dont have access to this application."
                          });
                          const x = document.getElementById("snackbar");
                          x.className = "show";
                          setTimeout(function () {
                            x.className = x.className.replace("show", "");
                          }, 2000);
                          localStorage.setItem("accesstoken", null);
                          console.error("Error while fetching Follow", error);
                        }
                      );
                    }
                  });
                } else {
                  setState({
                    loading: false,
                    toastColor: "#d9534f",
                    toastDescription: "User Role Not Found."
                  });
                  const x = document.getElementById("snackbar");
                  x.className = "show";
                  setTimeout(function () {
                    x.className = x.className.replace("show", "");
                  }, 2000);
                }
              } else {
                setState({
                  loading: false,
                  toastColor: "#d9534f",
                  toastDescription: "User Role Not Found."
                });
                const x = document.getElementById("snackbar");
                x.className = "show";
                setTimeout(function () {
                  x.className = x.className.replace("show", "");
                }, 2000);
              }
            })
            .catch((err) => {
              console.log("err", err);
              setState({
                loading: false,
                toastColor: "#d9534f",
                toastDescription: `Does not have permissions to access this application.`
              });
              const x = document.getElementById("snackbar");
              x.className = "show";
              setTimeout(function () {
                x.className = x.className.replace("show", "");
              }, 2000);
            });
        }
      } catch (error) {
        // alert(`${error.message}`);
        setState({
          loading: false,
          toastColor: "#d9534f",
          toastDescription: `${error.message}`
        });
        const x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () {
          x.className = x.className.replace("show", "");
        }, 2000);
        console.log(error);
      }
    }
  };
  useEffect(() => {
    props.fetchAppInfo(
      localStorage.getItem("domain"),
      localStorage.getItem("BaseUrl12"),
      localStorage.getItem("AppID12")
    );
    // eslint-disable-next-line
  }, []);

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
    <div className="bg-white">
      {state.loading && (
        <div
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.2)",
            top: 0,
            left: 0,
            zIndex: 2
          }}
        >
          <div
            style={{
              position: "fixed",
              fontSize: "50px",
              color: "#3ac9d6",
              top: "50%",
              left: "45%"
            }}
            className="loader-37"
          ></div>
        </div>
      )}

      <Title title={"Signup page"} />

      {props.isloginVisible && props.isloginVisible ? (
        <div>
          <div className="md:m-10 lg:m-16 md:p-4 lg:p-10 p-5 bg-[#ffffff] md:border-[1px] md:border-gray-400 ">
            <div className="w-[250px] h-[66px] inline-block">
              <img src={image} width="100%" alt="" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
              <div className="">
                <form onSubmit={handleSubmit}>
                  <h2 className="text-[30px] mt-6">Create Account !</h2>
                  <div className="outline outline-1 outline-slate-300/50 shadow-md rounded my-4">
                    <div className="px-6 py-4 text-xs">
                      <label className="block ">
                        Name{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        Email{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <input
                        id="email"
                        type="text"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        Phone{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        Company{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        Job Title{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                      />
                      <hr className="my-2 border-none" />
                      <label>
                        Password{" "}
                        <span style={{ color: "red", fontSize: 13 }}>*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                          name="password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e)}
                          required
                        />
                        <span
                          className={`absolute top-[50%] right-[10px] -translate-y-[50%] cursor-pointer ${
                            showPassword ? "text-[#007bff]" : "text-black"
                          }`}
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <i className="fa fa-eye-slash" /> // Close eye icon
                          ) : (
                            <i className="fa fa-eye" /> // Open eye icon
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
                            {lengthValid ? "✓" : "✗"} Password should be 8
                            characters long
                          </p>
                          <p
                            className={`${
                              caseDigitValid ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {caseDigitValid ? "✓" : "✗"} Password should contain
                            uppercase letter, lowercase letter, digit
                          </p>
                          <p
                            className={`${
                              specialCharValid
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {specialCharValid ? "✓" : "✗"} Password should
                            contain special character
                          </p>
                          {/* </>
                          )} */}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-center text-xs font-bold mt-2">
                    <button
                      type="submit"
                      className="rounded-sm bg-[#3ac9d6] text-white w-full py-3 shadow uppercase"
                      disabled={state.loading}
                    >
                      {state.loading ? "Loading..." : "Register"}
                    </button>
                    <NavLink
                      className="rounded-sm cursor-pointer bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] w-full py-3 shadow uppercase"
                      to="/"
                      style={width < 768 ? { textAlign: "center" } : {}}
                    >
                      Login
                    </NavLink>
                  </div>
                </form>
              </div>
              {width >= 768 && (
                <div className="self-center">
                  <div className="mx-auto md:w-[300px] lg:w-[400px] xl:w-[500px]">
                    <img src={login_img} alt="bisec" width="100%" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div id="snackbar" style={{ backgroundColor: state.toastColor }}>
            {state.toastDescription}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "fixed",
            fontSize: "50px",
            color: "#3ac9d6",
            top: "50%",
            left: "45%"
          }}
          className="loader-37"
        ></div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  if (Object.keys(state.appInfo).length !== 0) {
    return { appInfo: state.appInfo, isloginVisible: true };
  } else {
    return { appInfo: state.appInfo, isloginVisible: false };
  }
};

export default connect(mapStateToProps, {
  fetchAppInfo,
  showTenantName
})(Signup);
