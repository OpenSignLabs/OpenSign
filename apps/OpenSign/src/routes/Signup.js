import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Parse from "parse";
import axios from "axios";
import Title from "../components/Title";
import { fetchAppInfo, showTenantName } from "../redux/actions";
import { useNavigate, NavLink } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";

const Signup = (props) => {
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
    hideNav: "",
    loading: false,
    toastColor: "#5cb85c",
    toastDescription: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const image = props.appInfo.applogo;

  const handleSubmit = (event) => {
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
            let roleurl = `${parseBaseUrl}functions/AddUserToRole`;
            const headers = {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId,
              sessionToken:
                r.getSessionToken() || localStorage.getItem("accesstoken")
            };
            let body = {
              appName: props.appInfo.appname,
              roleName: props.appInfo.defaultRole,
              userId: r.id
            };
            await axios.post(roleurl, body, { headers: headers });

            let roleData = props.appInfo.settings;
            if (roleData && roleData.length > 0) {
              roleData.forEach((rld) => {
                if (rld.role === props.appInfo.defaultRole) {
                  const extCls = Parse.Object.extend(rld.extended_class);
                  const newObj = new extCls();
                  newObj.set("UserId", {
                    __type: "Pointer",
                    className: "_User",
                    objectId: r.id
                  });
                  newObj.set("UserRole", props.appInfo.defaultRole);
                  newObj.set("Email", email);
                  newObj.set("Name", name);
                  newObj.set("Phone", phone);
                  newObj.set("Company", company);
                  newObj.set("JobTitle", jobTitle);
                  newObj
                    .save()
                    .then((ex) => {
                      if (ex) {
                        handleNavigation(r.getSessionToken());
                      }
                    })
                    .catch((err) => {
                      alert(err.message);
                      setState({ loading: false });
                    });
                }
              });
            }
          }
        })
        .catch(async (err) => {
          if (err.code === 202) {
            const userQuery = new Parse.Query("contracts_Users");
            userQuery.equalTo("Email", email);
            const res = await userQuery.first();
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
                      alert("Email has been sent to your mail!");
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

                      if (element.enableCart) {
                        localStorage.setItem("EnableCart", element.enableCart);
                        props.setEnableCart(element.enableCart);
                      } else {
                        localStorage.removeItem("EnableCart");
                      }
                      // Get TenentID from Extendend Class
                      localStorage.setItem(
                        "extended_class",
                        element.extended_class
                      );
                      localStorage.setItem("userpointer", element.userpointer);

                      const extendedClass = Parse.Object.extend(
                        element.extended_class
                      );
                      let query = new Parse.Query(extendedClass);
                      query.equalTo("UserId", Parse.User.current());
                      query.include("TenantId");
                      await query.find().then(
                        (results) => {
                          let tenentInfo = [];
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
                                navigate("/subscription");
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
                              navigate("/subscription");
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
    window.addEventListener("resize", resize);
    props.fetchAppInfo(
      localStorage.getItem("domain"),
      localStorage.getItem("BaseUrl12"),
      localStorage.getItem("AppID12")
    );
    return () => {
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line
  }, []);

  const resize = () => {
    let currentHideNav = window.innerWidth <= 760;
    if (currentHideNav !== state.hideNav) {
      setState({ hideNav: currentHideNav });
    }
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
              {state.hideNav ? (
                <img src={image} width="100%" alt="" />
              ) : (
                <img src={image} width="100%" alt="" />
              )}
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
                          onChange={(e) => setPassword(e.target.value)}
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
                      style={state.hideNav ? { textAlign: "center" } : {}}
                    >
                      Login
                    </NavLink>
                  </div>
                </form>
              </div>
              {!state.hideNav && (
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
