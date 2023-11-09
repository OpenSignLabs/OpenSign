import React, { useEffect, useState } from "react";
import Parse from "parse";
import "../styles/toast.css";
import "../styles/loader.css";
import { connect } from "react-redux";
import { fetchAppInfo, showTenantName } from "../redux/actions";
import axios from "axios";
import Title from "../components/Title";
import GoogleSignInBtn from "../components/LoginGoogle";
// import LoginFacebook from "../components/LoginFacebook";
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
    hideNav: "",
    scanResult: "",
    baseUrl: localStorage.getItem("baseUrl"),
    parseAppId: localStorage.getItem("parseAppId"),
    loading: false,
    thirdpartyLoader: false
  });
  const [userDetails, setUserDetails] = useState({
    Company: "",
    Destination: ""
  });
  const [isModal, setIsModal] = useState(false);
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
                    .then((axiosRes) => {
                      const roles = axiosRes.data.result;
                      if (roles) {
                        userRoles = roles;
                        let _currentRole = "";
                        const valuesToExclude = [
                          "contracts_Guest",
                          `${localStorage.getItem("_appName")}_appeditor`
                        ];
                        if (userRoles.length > 1) {
                          const rolesfiltered = userRoles.filter(
                            (x) => !valuesToExclude.includes(x)
                          );
                          if (rolesfiltered.length > 0) {
                            _currentRole = rolesfiltered[0];
                          } 
                        } else {
                          const rolesfiltered = userRoles.filter(
                            (x) => !valuesToExclude.includes(x)
                          );
                          if (rolesfiltered.length > 0) {
                            _currentRole = userRoles[0];
                          } else {
                            _currentRole = "";
                          }
                        }
                        if (
                          _currentRole &&
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
                                  const payload = {
                                    sessionToken: user.getSessionToken()
                                  };
                                  handleSubmitbtn(payload);
                                  // setState({
                                  //   ...state,
                                  //   loading: false,
                                  //   toastColor: "#d9534f",
                                  //   toastDescription:
                                  //     "You dont have access to this application."
                                  // });

                                  // const x = document.getElementById("snackbar");
                                  // x.className = "show";
                                  // setTimeout(function () {
                                  //   x.className = x.className.replace(
                                  //     "show",
                                  //     ""
                                  //   );
                                  // }, 2000);
                                  // localStorage.setItem("accesstoken", null);
                                  console.error(
                                    "Error while fetching Follow",
                                    error
                                  );
                                }
                              );
                            }
                          });
                        } else {
                          setState({ ...state, loading: false });
                          setIsModal(true);
                        }
                      } else {
                        setState({ ...state, loading: false });
                        setIsModal(true);
                      }
                    })
                    .catch((err) => {
                      console.log("err", err);
                      setState({ ...state, loading: false });
                      setIsModal(true);
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
            .then((axiosRes) => {
              const roles = axiosRes.data.result;
              if (roles) {
                userRoles = roles;
                let _currentRole = "";
                const valuesToExclude = [
                  "contracts_Guest",
                  `${localStorage.getItem("_appName")}_appeditor`
                ];
                if (userRoles.length > 1) {
                  const rolesfiltered = userRoles.filter(
                    (x) => !valuesToExclude.includes(x)
                  );
                  if (rolesfiltered.length > 0) {
                    _currentRole = rolesfiltered[0];
                  } 
                } else {
                  const rolesfiltered = userRoles.filter(
                    (x) => !valuesToExclude.includes(x)
                  );
                  if (rolesfiltered.length > 0) {
                    _currentRole = userRoles[0];
                  } else {
                    _currentRole = "";
                  }
                }
                if (
                  _currentRole &&
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
                              setThirdpartyLoader(false);
                              setState({ ...state, loading: false });
                              if (process.env.REACT_APP_ENABLE_SUBSCRIPTION) {
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
                            if (process.env.REACT_APP_ENABLE_SUBSCRIPTION) {
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
                        }
                      },
                        (error) => {
                          const payload = {
                            sessionToken: sessionToken
                          };
                          setThirdpartyLoader(false);
                          handleSubmitbtn(payload);

                          // localStorage.setItem("accesstoken", null);
                          console.error("Error while fetching Follow", error);
                        }
                      );
                    }
                  });
                } else {
                  setThirdpartyLoader(false);
                  setState({ ...state, loading: false });
                }
              } else {
                setThirdpartyLoader(false);
                setState({ ...state, loading: false });
               
              }
            })
            .catch((err) => {
              console.log("err", err);
              setThirdpartyLoader(false);
              setState({ ...state, loading: false });
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
    setState({ ...state, loading: true });
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
                  const rolesfiltered = userRoles.filter(
                    (x) => x !== "contracts_Guest"
                  );
                  if (rolesfiltered.length > 0) {
                    _currentRole = rolesfiltered[0];
                  } else {
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
                  }
                  // _currentRole = userRoles[0];
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

  const handleSubmitbtn = async (e) => {
    e.preventDefault();
    if (userDetails.Destination && userDetails.Company) {
      setThirdpartyLoader(true);
      // console.log("handelSubmit", userDetails);
      // const payload = await Parse.User.logIn(state.email, state.password);
      const payload = { sessionToken: localStorage.getItem("accesstoken") };
      const userInformation = JSON.parse(
        localStorage.getItem("UserInformation")
      );
      // console.log("payload ", payload);
      if (payload && payload.sessionToken) {
        const params = {
          userDetails: {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation.phone,
            role: "contracts_User",
            company: userDetails.Company,
            jobTitle: userDetails.Destination
          }
        };
        const userSignUp = await Parse.Cloud.run("usersignup", params);
        // console.log("userSignUp ", userSignUp);
        if (userSignUp && userSignUp.sessionToken) {
          const LocalUserDetails = {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation.phone,
            company: userDetails.Company,
            jobTitle: userDetails.JobTitle
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
        alert("Internal server error !");
      }
    } else {
      alert("Please fill required details!");
    }
  };

  const handleCloseModal = () => {
    setIsModal(false);
    Parse.User.logOut();

    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let appName = localStorage.getItem("appName");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let domain = localStorage.getItem("domain");
    let _appName = localStorage.getItem("_appName");
    let baseUrl = localStorage.getItem("BaseUrl12");
    let appid = localStorage.getItem("AppID12");

    localStorage.clear();

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("appName", appName);
    localStorage.setItem("_appName", _appName);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("domain", domain);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("BaseUrl12", baseUrl);
    localStorage.setItem("AppID12", appid);
  };
  return (
    <div className="bg-white">
      <Title title={"Login Page"} />
      {state.loading && (
        <div
          aria-live="assertive"
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
            role="status"
            style={{
              position: "fixed",
              fontSize: "50px",
              color: "#3ac9d6",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
            className="loader-37"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {props.isloginVisible && props.isloginVisible ? (
        <>
          <div aria-labelledby="loginHeading" role="region">
            <div className="md:m-10 lg:m-16 md:p-4 lg:p-10 p-4 bg-[#ffffff] md:border-[1px] md:border-gray-400 ">
              <div className="w-[250px] h-[66px] inline-block">
                <img
                  src={image}
                  width="100%"
                  alt="The image displays the OpenSign logo with a stylized blue square with an open corner, accompanied by the tagline Seal the Deal, Openly."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <div>
                  <div>
                    <form onSubmit={handleSubmit} aria-label="Login Form">
                      <h1 className="text-[30px] mt-6">Welcome Back!</h1>
                      <fieldset>
                        <legend className="text-[12px] text-[#878787]">
                          Login to your account
                        </legend>
                        <div className="px-6 py-4 outline outline-1 outline-slate-300/50 my-2 rounded shadow-md">
                          <label className="block text-xs" htmlFor="email">
                            Username
                          </label>
                          <input
                            id="email"
                            type="text"
                            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded text-xs"
                            name="email"
                            value={state.email}
                            onChange={handleChange}
                            required
                          />
                          <hr className="my-2 border-none" />
                          <label className="block text-xs" htmlFor="password">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              type={state.passwordVisible ? "text" : "password"}
                              className="px-3 py-2 w-full border-[1px] border-gray-300 rounded text-xs"
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
                      </fieldset>
                      <div className="flex flex-row justify-between items-center ml-4 py-2">
                        <div>
                          <label
                            className="form-check-label inline-block cursor-pointer"
                            htmlFor="rememberpassword"
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mr-1"
                              value=""
                              id="rememberpassword"
                            />
                            <span className="text-[13px]">
                              Remember Password
                            </span>
                          </label>
                        </div>
                        <div>
                          <NavLink
                            to="/forgetpassword"
                            className="text-[13px] underline focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            Forgot Password ?
                          </NavLink>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-center text-xs font-bold mt-2">
                        <button
                          type="submit"
                          className="rounded-sm bg-[#3ac9d6] text-white w-full py-3 shadow outline-none uppercase focus:ring-2 focus:ring-blue-600"
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
                      {/* {props.appInfo.fbAppId && props.appInfo.fbAppId !== "" ? (
                      <LoginFacebook
                        FBCred={props.appInfo.fbAppId}
                        thirdpartyLoginfn={thirdpartyLoginfn}
                        thirdpartyLoader={state.thirdpartyLoader}
                        setThirdpartyLoader={setThirdpartyLoader}
                      />
                    ) : null} */}
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
                    <div className="mx-auto md:w-[300px] lg:w-[400px] xl:w-[500px]">
                      <img
                        src={login_img}
                        alt="The image illustrates a person from behind, seated at a desk with a four-monitor computer setup, in an environment with a light blue and white color scheme, featuring a potted plant to the right."
                        width="100%"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              id="snackbar"
              role="alert"
              style={{ backgroundColor: state.toastColor }}
            >
              {state.toastDescription}
            </div>
          </div>
          {isModal && (
            <div
              className="modal fade show"
              id="exampleModal"
              tabIndex="-1"
              role="dialog"
              style={{
                display: "block",
                zIndex: 1,
                backgroundColor: "rgba(0,0,0,0.5)"
              }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Login form</h5>
                    <span>
                      <span></span>
                    </span>
                  </div>
                  <div className="modal-body">
                    <form className="text-sm">
                      <div className="form-group">
                        <label
                          htmlFor="Company"
                          style={{ display: "flex" }}
                          className="col-form-label"
                        >
                          Company{" "}
                          <span style={{ fontSize: 13, color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="Company"
                          value={userDetails.Company}
                          onChange={(e) =>
                            setUserDetails({
                              ...userDetails,
                              Company: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="Destination"
                          style={{ display: "flex" }}
                          className="col-form-label"
                        >
                          Destination{" "}
                          <span style={{ fontSize: 13, color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="Destination"
                          value={userDetails.Destination}
                          onChange={(e) =>
                            setUserDetails({
                              ...userDetails,
                              Destination: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="bg-[#6c757d] text-sm p-2 text-white rounded uppercase"
                          onClick={handleCloseModal}
                          style={{ marginRight: 10, width: 90 }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="bg-[#17a2b8] text-sm p-2 text-white rounded uppercase"
                          onClick={(e) => handleSubmitbtn(e)}
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
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
