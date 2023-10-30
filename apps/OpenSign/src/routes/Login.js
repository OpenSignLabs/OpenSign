import React, { useEffect, useState } from "react";
import Parse from "parse";
import "../styles/toast.css";
import "../styles/loader.css";
import { connect } from "react-redux";
import { fetchAppInfo, showTenantName } from "../redux/actions";
import axios from "axios";
import Title from "../components/Title";
import GoogleSignInBtn from "../components/LoginGoogle";
import LoginFacebook from "../components/LoginFacebook";
import { NavLink, useNavigate } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";

function Login(props) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    email: "",
    toastColor: "#5cb85c",
    toastDescription: "",
    password: "",
    passwordVisible: false,
    mobile: "",
    phone: "",
    OTP: "",
    hideNav: "",
    scanResult: "",
    baseUrl: localStorage.getItem("baseUrl"),
    parseAppId: localStorage.getItem("parseAppId"),
    loading: false,
    thirdpartyLoader: false,
    orgModal: false,
    ReqOtp: ""
  });

  const image = props?.appInfo?.applogo || undefined;

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      setState({ ...state, loading: true });
      GetLoginData();
    }
    props.fetchAppInfo(
      localStorage.getItem("domain"),
      localStorage.getItem("BaseUrl12"),
      localStorage.getItem("AppID12")
    );
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize());
    return () => {
      window.removeEventListener("resize", resize());
    };
    // eslint-disable-next-line
  }, []);
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
    localStorage.removeItem("accesstoken");
    event.preventDefault();
    const { email, password } = state;
    if (email && password) {
      try {
        setState({ ...state, loading: true });
        let baseUrl = localStorage.getItem("baseUrl");
        let parseAppId = localStorage.getItem("parseAppId");
        localStorage.setItem("appLogo", props.appInfo.applogo);
        localStorage.setItem("appName", props.appInfo.appname);
        Parse.serverURL = localStorage.getItem("baseUrl");
        Parse.initialize(localStorage.getItem("parseAppId"));
        // Pass the username and password to logIn function
        await Parse.User.logIn(email, password)
          .then(async (user) => {
            if (user) {
              let _user = user.toJSON();
              localStorage.setItem("UserInformation", JSON.stringify(_user));
              localStorage.setItem("userEmail", email);
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
                              localStorage.setItem(
                                "userpointer",
                                element.userpointer
                              );

                              const extendedClass = Parse.Object.extend(
                                element.extended_class
                              );
                              let query = new Parse.Query(extendedClass);
                              query.equalTo("UserId", Parse.User.current());
                              query.include("TenantId");
                              await query.find().then(
                                (results) => {
                                  // console.log("results ", results);
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
                                            tenentName:
                                              x.TenantId.TenantName || ""
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
                                      setState({ ...state, loading: false });
                                      navigate("/");
                                    } else {
                                      extendedInfo.forEach((x) => {
                                        if (x.TenantId) {
                                          let obj = {
                                            tenentId: x.TenantId.objectId,
                                            tenentName:
                                              x.TenantId.TenantName || ""
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
                                      setState({ ...state, loading: false });
                                      if (
                                        process.env
                                          .REACT_APP_ENABLE_SUBSCRIPTION
                                      ) {
                                        const LocalUserDetails = {
                                          name: results[0].get("Name"),
                                          email: results[0].get("Email"),
                                          phone: results[0].get("Phone"),
                                          company: results[0].get("Company")
                                        };
                                        localStorage.setItem(
                                          "userDetails",
                                          JSON.stringify(LocalUserDetails)
                                        );
                                        const billingDate =
                                          results[0].get("Next_billing_date") &&
                                          results[0].get("Next_billing_date");
                                        if (billingDate) {
                                          if (billingDate > new Date()) {
                                            localStorage.removeItem(
                                              "userDetails"
                                            );
                                            navigate(
                                              `/${element.pageType}/${element.pageId}`
                                            );
                                          } else {
                                            navigate(`/subscription`);
                                          }
                                        } else {
                                          navigate(`/subscription`);
                                        }
                                      } else {
                                        navigate(
                                          `/${element.pageType}/${element.pageId}`
                                        );
                                      }
                                    }
                                  } else {
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
                                    setState({ ...state, loading: false });
                                    if (
                                      process.env.REACT_APP_ENABLE_SUBSCRIPTION
                                    ) {
                                      const LocalUserDetails = {
                                        name: _user.name,
                                        email: email,
                                        phone: _user.phone
                                        // company: results.get("Company"),
                                      };
                                      localStorage.setItem(
                                        "userDetails",
                                        JSON.stringify(LocalUserDetails)
                                      );
                                      const billingDate = "";
                                      if (billingDate) {
                                        navigate(`/subscription`);
                                      }
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
                                    ...state,
                                    loading: false,
                                    toastColor: "#d9534f",
                                    toastDescription:
                                      "You dont have access to this application."
                                  });
                                  const x = document.getElementById("snackbar");
                                  x.className = "show";
                                  setTimeout(function () {
                                    x.className = x.className.replace(
                                      "show",
                                      ""
                                    );
                                  }, 2000);
                                  localStorage.setItem("accesstoken", null);
                                  console.error(
                                    "Error while fetching Follow",
                                    error
                                  );
                                }
                              );
                            }
                          });
                        } else {
                          setState({
                            ...state,
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
                          ...state,
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
                      setState({
                        ...state,
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
                setState({
                  ...state,
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
          })
          .catch((error) => {
            setState({
              ...state,
              loading: false,
              toastColor: "#d9534f",
              toastDescription: "Login failed: Invalid username or password."
            });
            const x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function () {
              x.className = x.className.replace("show", "");
            }, 2000);
            console.error("Error while logging in user", error);
          });
      } catch (error) {
        console.log(error.message);
        setState({ ...state, loading: false });
      }
    }
  };

  const setThirdpartyLoader = (value) => {
    setState({ ...state, thirdpartyLoader: value });
  };
  const thirdpartyLoginfn = async (sessionToken, billingDate) => {
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
                              setThirdpartyLoader(false);
                              setState({ ...state, loading: false });
                              navigate(`/`);
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
                              setThirdpartyLoader(false);
                              setState({ ...state, loading: false });
                              if (billingDate) {
                                if (billingDate > new Date()) {
                                  localStorage.removeItem("userDetails");
                                  navigate(
                                    `/${element.pageType}/${element.pageId}`
                                  );
                                } else {
                                  navigate(`/subscription`);
                                }
                              } else {
                                navigate(`/subscription`);
                              }
                            }
                          } else {
                            localStorage.setItem("PageLanding", element.pageId);
                            localStorage.setItem(
                              "defaultmenuid",
                              element.menuId
                            );
                            localStorage.setItem("pageType", element.pageType);
                            setState({ ...state, loading: false });
                            setThirdpartyLoader(false);
                            if (billingDate) {
                              if (billingDate > new Date()) {
                                localStorage.removeItem("userDetails");
                                navigate(
                                  `/${element.pageType}/${element.pageId}`
                                );
                              } else {
                                navigate(`/subscription`);
                              }
                            } else {
                              navigate(`/subscription`);
                            }
                          }
                        },
                        (error) => {
                          /*   alert(
                          "You dont have access to this application."
                        ); */
                          setThirdpartyLoader(false);

                          setState({
                            ...state,
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
                  setThirdpartyLoader(false);
                  setState({
                    ...state,
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
                setThirdpartyLoader(false);
                setState({
                  ...state,
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
              setThirdpartyLoader(false);
              setState({
                ...state,
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
        setThirdpartyLoader(false);
        setState({
          ...state,
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

  const GetLoginData = async () => {
    try {
      Parse.serverURL = localStorage.getItem("baseUrl");
      Parse.initialize(localStorage.getItem("parseAppId"));
      const user = await Parse.User.become(localStorage.getItem("accesstoken"));
      let _usss = user.toJSON();
      localStorage.setItem("UserInformation", JSON.stringify(_usss));
      localStorage.setItem("username", _usss.name);
      localStorage.setItem("accesstoken", _usss.sessionToken);
      localStorage.setItem("scriptId", true);
      if (_usss.ProfilePic) {
        localStorage.setItem("profileImg", _usss.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      let userRoles = [];

      if (localStorage.getItem("userSettings")) {
        let userSettings = localStorage.getItem("userSettings");

        //Get Current user roles
        let url = `${localStorage.getItem("baseUrl")}functions/UserGroups`;
        const headers1 = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessionToken: _usss.sessionToken
        };

        let body = {
          appname: localStorage.getItem("_appName")
        };

        await axios
          .post(url, JSON.stringify(body), { headers: headers1 })
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
              let SettingsUser = JSON.parse(userSettings);
              SettingsUser.forEach(async (element) => {
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
                        let extendedInfo_stringify = JSON.stringify(results);
                        let extendedInfo = JSON.parse(extendedInfo_stringify);
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

                          localStorage.setItem("showpopup", true);
                          localStorage.setItem("PageLanding", element.pageId);
                          localStorage.setItem("defaultmenuid", element.menuId);
                          localStorage.setItem("pageType", element.pageType);
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
                          localStorage.setItem("PageLanding", element.pageId);
                          localStorage.setItem("defaultmenuid", element.menuId);
                          localStorage.setItem("pageType", element.pageType);
                          navigate(`/${element.pageType}/${element.pageId}`);
                        }
                      } else {
                        localStorage.setItem("PageLanding", element.pageId);
                        localStorage.setItem("defaultmenuid", element.menuId);
                        localStorage.setItem("pageType", element.pageType);
                        navigate(`/${element.pageType}/${element.pageId}`);
                      }
                    },
                    (error) => {
                      setState({
                        ...state,
                        loading: false,
                        toastColor: "#d9534f",
                        toastDescription:
                          "You don`t have access to this application."
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
              console.log("User Role Not Found.");
            }
          })
          .catch((err) => {
            setState({ ...state, loading: false });
            console.log("err", err);
          });
      }
    } catch (error) {
      setState({ ...state, loading: false });
      console.log("err", error);
    }
  };

  const togglePasswordVisibility = () => {
    setState({ ...state, passwordVisible: !state.passwordVisible });
  };

  return (
    <div className="bg-white">
      <Title title={"Login Page"} />
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
                <div>
                  <form onSubmit={handleSubmit}>
                    <h2 className="text-[30px] mt-6">Welcome Back !</h2>
                    <span className="text-[12px] text-[#878787]">
                      Login to your account
                    </span>
                    <div className="shadow-md rounded my-4">
                      <div className="px-6 py-4">
                        <label className="block text-xs">Username</label>
                        <input
                          type="text"
                          className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                          name="email"
                          value={state.email}
                          onChange={handleChange}
                          required
                        />
                        <hr className="my-2 border-none" />
                        <label className="block text-xs">Password</label>
                        <div className="relative">
                          <input
                            type={state.passwordVisible ? "text" : "password"}
                            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                            name="password"
                            value={state.password}
                            onChange={handleChange}
                            required
                          />
                          <span
                            className={`absolute top-[50%] right-[10px] -translate-y-[50%] cursor-pointer ${
                              state.passwordVisible
                                ? "text-[#007bff]"
                                : "text-black"
                            }`}
                            onClick={togglePasswordVisibility}
                          >
                            {state.passwordVisible ? (
                              <i className="fa fa-eye-slash text-xs pb-1" /> // Close eye icon
                            ) : (
                              <i className="fa fa-eye text-xs pb-1 " /> // Open eye icon
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center text-xs px-4 py-2">
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            value=""
                          />
                          <span className="text-center pl-1">
                            Remember Password
                          </span>
                        </label>
                      </div>
                      <div>
                        <span className="text-[13px]">
                          <NavLink to={`/forgetpassword`}>
                            Forgot Password ?
                          </NavLink>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-center text-xs font-bold mt-2">
                      <button
                        type="submit"
                        className="rounded-sm bg-[#3ac9d6] text-white w-full py-3 shadow uppercase"
                        disabled={state.loading}
                      >
                        {state.loading ? "Loading..." : "Login"}
                      </button>
                      <NavLink
                        className="rounded-sm cursor-pointer bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] w-full py-3 shadow uppercase"
                        to="/signup"
                        style={state.hideNav ? { textAlign: "center" } : {}}
                      >
                        Create Account
                      </NavLink>
                    </div>
                  </form>
                  <br />
                  {(props.appInfo.fbAppId || props.appInfo.googleClietId) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      className="text-sm"
                    >
                      <hr
                        className={"border-[1px] border-gray-300 w-full"}
                        style={{ color: "grey" }}
                      />
                      <span style={{ color: "grey" }} className="px-2 ">
                        OR
                      </span>
                      <hr
                        className={"border-[1px] border-gray-300 w-full"}
                        style={{ color: "grey" }}
                      />
                    </div>
                  )}
                  <br />
                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {props.appInfo.fbAppId && props.appInfo.fbAppId !== "" ? (
                      <LoginFacebook
                        FBCred={props.appInfo.fbAppId}
                        thirdpartyLoginfn={thirdpartyLoginfn}
                        thirdpartyLoader={state.thirdpartyLoader}
                        setThirdpartyLoader={setThirdpartyLoader}
                      />
                    ) : null}
                  </div>
                  <div style={{ margin: "10px 0" }}></div>
                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {props.appInfo.googleClietId &&
                    props.appInfo.googleClietId !== "" ? (
                      <GoogleSignInBtn
                        GoogleCred={props.appInfo.googleClietId}
                        thirdpartyLoginfn={thirdpartyLoginfn}
                        thirdpartyLoader={state.thirdpartyLoader}
                        setThirdpartyLoader={setThirdpartyLoader}
                      />
                    ) : null}
                  </div>
                </div>
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
  // }
}

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
})(Login);
