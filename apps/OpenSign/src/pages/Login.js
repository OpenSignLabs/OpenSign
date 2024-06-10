import React, { useEffect, useState } from "react";
import Parse from "parse";
import "../styles/loader.css";
import { useDispatch } from "react-redux";
import axios from "axios";
import Title from "../components/Title";
import GoogleSignInBtn from "../components/LoginGoogle";
// import LoginFacebook from "../components/LoginFacebook";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";
import { useWindowSize } from "../hook/useWindowSize";
import ModalUi from "../primitives/ModalUi";
import { isEnableSubscription } from "../constant/const";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { fetchAppInfo } from "../redux/reducers/infoReducer";
import { showTenant } from "../redux/reducers/ShowTenant";
import { fetchSubscription, getAppLogo, openInNewTab } from "../constant/Utils";
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [state, setState] = useState({
    email: "",
    alertType: "success",
    alertMsg: "",
    password: "",
    passwordVisible: false,
    mobile: "",
    phone: "",
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
  const [image, setImage] = useState();
  const [isLoginSSO, setIsLoginSSO] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      setState({ ...state, loading: true });
      GetLoginData();
    }
    dispatch(fetchAppInfo());
    saveLogo();

    // eslint-disable-next-line
  }, []);

  const saveLogo = async () => {
    if (isEnableSubscription) {
      const logo = await getAppLogo();
      if (logo) {
        setImage(logo);
      } else {
        setImage(appInfo?.applogo || undefined);
      }
    } else {
      setImage(appInfo?.applogo || undefined);
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
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
        localStorage.setItem("appLogo", appInfo.applogo);
        localStorage.setItem("appName", appInfo.appname);
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
                if (appInfo.settings) {
                  let userSettings = appInfo.settings;

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
                            const redirectUrl =
                              location?.state?.from ||
                              `/${element.pageType}/${element.pageId}`;
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
                              const currentUser = Parse.User.current();
                              await Parse.Cloud.run("getUserDetails", {
                                email: currentUser.get("email")
                              }).then(
                                async (result) => {
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
                                            tenentName:
                                              x.TenantId.TenantName || ""
                                          };
                                          tenentInfo.push(obj);
                                        }
                                      });
                                      if (tenentInfo.length) {
                                        dispatch(
                                          showTenant(
                                            tenentInfo[0].tenentName || ""
                                          )
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
                                            "TenantId",
                                            x.TenantId.objectId
                                          );
                                          tenentInfo.push(obj);
                                        }
                                      });
                                      if (tenentInfo.length) {
                                        dispatch(
                                          showTenant(
                                            tenentInfo[0].tenentName || ""
                                          )
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
                                      if (isEnableSubscription) {
                                        const LocalUserDetails = {
                                          name: results[0].get("Name"),
                                          email: results[0].get("Email"),
                                          phone: results[0]?.get("Phone") || "",
                                          company: results[0].get("Company")
                                        };
                                        localStorage.setItem(
                                          "userDetails",
                                          JSON.stringify(LocalUserDetails)
                                        );
                                        const res = await fetchSubscription();
                                        const freeplan = res.plan;
                                        const billingDate = res.billingDate;
                                        if (freeplan === "freeplan") {
                                          navigate(redirectUrl);
                                        } else if (billingDate) {
                                          if (
                                            new Date(billingDate) > new Date()
                                          ) {
                                            localStorage.removeItem(
                                              "userDetails"
                                            );
                                            // Redirect to the appropriate URL after successful login
                                            navigate(redirectUrl);
                                          } else {
                                            navigate(`/subscription`, {
                                              replace: true
                                            });
                                          }
                                        } else {
                                          navigate(`/subscription`, {
                                            replace: true
                                          });
                                        }
                                      } else {
                                        // Redirect to the appropriate URL after successful login
                                        navigate(redirectUrl);
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
                                    if (isEnableSubscription) {
                                      const LocalUserDetails = {
                                        name: _user.name,
                                        email: email,
                                        phone: _user?.phone || ""
                                        // company: results.get("Company"),
                                      };
                                      localStorage.setItem(
                                        "userDetails",
                                        JSON.stringify(LocalUserDetails)
                                      );
                                      const billingDate = "";
                                      if (billingDate) {
                                        navigate(`/subscription`, {
                                          replace: true
                                        });
                                      }
                                    } else {
                                      // Redirect to the appropriate URL after successful login
                                      navigate(redirectUrl);
                                    }
                                  }
                                },
                                (error) => {
                                  const payload = {
                                    sessionToken: user.getSessionToken()
                                  };
                                  handleSubmitbtn(payload);
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
                  alertType: "danger",
                  alertMsg: `${error.message}`
                });
                setTimeout(function () {
                  setState({
                    ...state,
                    loading: false,
                    alertType: "danger",
                    alertMsg: ""
                  });
                }, 2000);
                console.log(error);
              }
            }
          })
          .catch((error) => {
            setState({
              ...state,
              loading: false,
              alertType: "danger",
              alertMsg: "Invalid username or password!"
            });
            setTimeout(function () {
              setState({
                ...state,
                loading: false,
                alertType: "danger",
                alertMsg: ""
              });
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
  const handleFreePlan = async (id) => {
    try {
      const params = { userId: id };
      const res = await Parse.Cloud.run("freesubscription", params);
      if (res.status === "error") {
        alert(res.result);
      }
    } catch (err) {
      console.log("err in free subscribe", err.message);
      alert("Somenthing went wrong, please try again later!");
    }
  };
  const thirdpartyLoginfn = async (sessionToken) => {
    const baseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    const res = await axios.get(baseUrl + "users/me", {
      headers: {
        "X-Parse-Session-Token": sessionToken,
        "X-Parse-Application-Id": parseAppId
      }
    });
    const param = new URLSearchParams(location.search);
    const isFreeplan = param?.get("subscription") === "freeplan";
    if (isFreeplan) {
      await handleFreePlan(res.data.objectId);
    }
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
        if (appInfo.settings) {
          let userSettings = appInfo.settings;

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
                    const redirectUrl =
                      location?.state?.from ||
                      `/${element.pageType}/${element.pageId}`;
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
                      const currentUser = Parse.User.current();
                      await Parse.Cloud.run("getUserDetails", {
                        email: currentUser.get("email")
                      }).then(
                        async (result) => {
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
                                dispatch(
                                  showTenant(tenentInfo[0].tenentName || "")
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
                              extendedInfo.forEach(async (x) => {
                                if (x.TenantId) {
                                  let obj = {
                                    tenentId: x.TenantId.objectId,
                                    tenentName: x.TenantId.TenantName || ""
                                  };
                                  localStorage.setItem(
                                    "TenantId",
                                    x.TenantId.objectId
                                  );
                                  tenentInfo.push(obj);
                                }
                              });
                              if (tenentInfo.length) {
                                dispatch(
                                  showTenant(tenentInfo[0].tenentName || "")
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
                              if (isEnableSubscription) {
                                const res = await fetchSubscription();
                                const freeplan = res.plan;
                                const billingDate = res.billingDate;
                                if (freeplan === "freeplan") {
                                  navigate(redirectUrl);
                                } else if (billingDate) {
                                  if (new Date(billingDate) > new Date()) {
                                    localStorage.removeItem("userDetails");
                                    navigate(redirectUrl);
                                  } else {
                                    if (isFreeplan) {
                                      navigate(redirectUrl);
                                    } else {
                                      navigate(`/subscription`, {
                                        replace: true
                                      });
                                    }
                                  }
                                } else {
                                  if (isFreeplan) {
                                    navigate(redirectUrl);
                                  } else {
                                    navigate(`/subscription`, {
                                      replace: true
                                    });
                                  }
                                }
                              } else {
                                navigate(redirectUrl);
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
                            if (isEnableSubscription) {
                              const res = await fetchSubscription();
                              const freeplan = res.plan;
                              const billingDate = res.billingDate;
                              if (freeplan === "freeplan") {
                                navigate(redirectUrl);
                              } else if (billingDate) {
                                if (new Date(billingDate) > new Date()) {
                                  localStorage.removeItem("userDetails");
                                  // Redirect to the appropriate URL after successful login
                                  navigate(redirectUrl);
                                } else {
                                  if (isFreeplan) {
                                    navigate(redirectUrl);
                                  } else {
                                    navigate(`/subscription`, {
                                      replace: true
                                    });
                                  }
                                }
                              } else {
                                if (isFreeplan) {
                                  navigate(redirectUrl);
                                } else {
                                  navigate(`/subscription`, {
                                    replace: true
                                  });
                                }
                              }
                            } else {
                              navigate(redirectUrl);
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
          alertType: "danger",
          alertMsg: `${error.message}`
        });
        setTimeout(function () {
          setState({
            ...state,
            loading: false,
            alertType: "danger",
            alertMsg: ""
          });
        }, 2000);
        console.log(error);
      }
    }
  };

  const GetLoginData = async () => {
    setState({ ...state, loading: true });
    try {
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
          .then((axiosres) => {
            const roles = axiosres.data.result;
            if (roles) {
              userRoles = roles;
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
                      alertType: "danger",
                      alertMsg:
                        "Does not have permissions to access this application!"
                    });
                    setTimeout(function () {
                      setState({
                        ...state,
                        loading: false,
                        alertType: "danger",
                        alertMsg: ""
                      });
                    }, 2000);
                  }
                  // _currentRole = userRoles[0];
                }
              } else {
                _currentRole = userRoles[0];
              }
              if (_currentRole && _currentRole !== "contracts_Guest") {
                let SettingsUser = JSON.parse(userSettings);
                SettingsUser.forEach(async (item) => {
                  if (item.role === _currentRole) {
                    let _role = _currentRole.replace(`${appInfo.appname}_`, "");
                    localStorage.setItem("_user_role", _role);
                    // Get TenentID from Extendend Class
                    localStorage.setItem("extended_class", item.extended_class);
                    const currentUser = Parse.User.current();
                    const userSettings = appInfo.settings;
                    const setting = userSettings.find(
                      (x) => x.role === _currentRole
                    );
                    const redirectUrl =
                      location?.state?.from ||
                      `/${setting.pageType}/${setting.pageId}`;
                    await Parse.Cloud.run("getUserDetails", {
                      email: currentUser.get("email")
                    }).then(
                      async (result) => {
                        let tenentInfo = [];
                        const results = [result];
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
                            localStorage.setItem("PageLanding", item.pageId);
                            localStorage.setItem("defaultmenuid", item.menuId);
                            localStorage.setItem("pageType", item.pageType);
                            navigate("/");
                          } else {
                            extendedInfo.forEach((x) => {
                              if (x.TenantId) {
                                let obj = {
                                  tenentId: x.TenantId.objectId,
                                  tenentName: x.TenantId.TenantName || ""
                                };
                                localStorage.setItem(
                                  "TenantId",
                                  x.TenantId.objectId
                                );
                                tenentInfo.push(obj);
                              }
                            });
                            localStorage.setItem("PageLanding", setting.pageId);
                            localStorage.setItem(
                              "defaultmenuid",
                              setting.menuId
                            );
                            localStorage.setItem("pageType", setting.pageType);
                            if (isEnableSubscription) {
                              const LocalUserDetails = {
                                name: results[0].get("Name"),
                                email: results[0].get("Email"),
                                phone: results[0]?.get("Phone") || "",
                                company: results[0].get("Company")
                              };
                              localStorage.setItem(
                                "userDetails",
                                JSON.stringify(LocalUserDetails)
                              );
                              const res = await fetchSubscription();
                              const billingDate = res.billingDate;
                              const freeplan = res.plan;
                              if (freeplan === "freeplan") {
                                navigate(redirectUrl);
                              } else if (billingDate) {
                                if (new Date(billingDate) > new Date()) {
                                  localStorage.removeItem("userDetails");
                                  // Redirect to the appropriate URL after successful login
                                  navigate(redirectUrl);
                                } else {
                                  navigate(`/subscription`);
                                }
                              } else {
                                navigate(`/subscription`);
                              }
                            } else {
                              // Redirect to the appropriate URL after successful login
                              navigate(redirectUrl);
                            }
                          }
                        } else {
                          localStorage.setItem("PageLanding", setting.pageId);
                          localStorage.setItem("defaultmenuid", setting.menuId);
                          localStorage.setItem("pageType", setting.pageType);
                          setState({ ...state, loading: false });
                          if (isEnableSubscription) {
                            const LocalUserDetails = {
                              name: results[0].get("Name"),
                              email: results[0].get("Email"),
                              phone: results[0]?.get("Phone") || ""
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
                            // Redirect to the appropriate URL after successful login
                            navigate(redirectUrl);
                          }
                        }
                      },
                      (error) => {
                        setState({
                          ...state,
                          loading: false,
                          alertType: "danger",
                          alertMsg: "You don`t have access to this application!"
                        });
                        setTimeout(function () {
                          setState({
                            ...state,
                            loading: false,
                            alertType: "danger",
                            alertMsg: ""
                          });
                        }, 2000);
                        localStorage.setItem("accesstoken", null);
                        console.error("Error while fetching Follow", error);
                      }
                    );
                  }
                });
              } else {
                setState({ ...state, loading: false });
                handleCloseModal();
              }
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
            phone: userInformation?.phone || "",
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
            phone: userInformation?.phone || "",
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
    if (Parse?.User?.current()) {
      Parse.User.logOut();
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let appName = localStorage.getItem("appName");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let domain = localStorage.getItem("domain");
    let _appName = localStorage.getItem("_appName");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("appName", appName);
    localStorage.setItem("_appName", _appName);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("domain", domain);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
  };

  // `handleSignInWithSSO` is trigger when user click sign in with sso and open sso authorize endpoint
  const handleSignInWithSSO = () => {
    if (isLoginSSO === false) {
      if (state?.email) {
        setIsLoginSSO(true);
        const encodedEmail = encodeURIComponent(state.email);
        const clientUrl = window.location.origin;
        const domain = state.email.split("@")?.pop();
        const ssoApiUrl =
          process.env.SSO_API_URL || "https://sso.opensignlabs.com/api";
        openInNewTab(
          `${ssoApiUrl}/oauth/authorize?response_type=code&provider=saml&tenant=${domain}&product=OpenSign&redirect_uri=${clientUrl}/sso&state=${encodedEmail}`,
          "_self"
        );
      } else {
        alert("Please provide email.");
      }
    }
  };
  return (
    <div>
      <Title title={"Login Page"} />
      {state.loading && (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-20 text-[50px] text-[#3ac9d6]"
        >
          <div role="status" className="loader-37">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {appInfo && appInfo.appId ? (
        <>
          <div
            aria-labelledby="loginHeading"
            role="region"
            className="md:p-10 lg:p-16"
          >
            <div className="md:p-4 lg:p-10 p-4 bg-base-100 text-base-content op-card">
              <div className="w-[250px] h-[66px] inline-block overflow-hidden">
                {image && (
                  <img
                    src={image}
                    className="object-contain h-full"
                    alt="applogo"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <div>
                  <form onSubmit={handleSubmit} aria-label="Login Form">
                    <h1 className="text-[30px] mt-6">Welcome Back!</h1>
                    <fieldset>
                      <legend className="text-[12px] text-[#878787]">
                        Login to your account
                      </legend>
                      <div className="w-full px-6 py-3 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50">
                        <label className="block text-xs" htmlFor="email">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          name="email"
                          value={state.email}
                          onChange={handleChange}
                          required
                        />
                        <hr className="my-1 border-none" />
                        {!isLoginSSO && (
                          <>
                            <label className="block text-xs" htmlFor="password">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                id="password"
                                type={
                                  state.passwordVisible ? "text" : "password"
                                }
                                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                                name="password"
                                value={state.password}
                                onChange={handleChange}
                                required
                              />
                              <span
                                className="absolute cursor-pointer top-[50%] right-[10px] -translate-y-[50%] text-base-content"
                                onClick={togglePasswordVisibility}
                              >
                                {state.passwordVisible ? (
                                  <i className="fa fa-eye-slash text-xs pb-1" /> // Close eye icon
                                ) : (
                                  <i className="fa fa-eye text-xs pb-1 " /> // Open eye icon
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="relative mt-1">
                          <NavLink
                            to="/forgetpassword"
                            className="text-[13px] op-link op-link-primary underline-offset-1 focus:outline-none ml-1"
                          >
                            Forgot Password?
                          </NavLink>
                        </div>
                      </div>
                    </fieldset>
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
                        to={
                          location.search
                            ? "/signup" + location.search
                            : "/signup"
                        }
                        style={width < 768 ? { textAlign: "center" } : {}}
                      >
                        Create Account
                      </NavLink>
                    </div>
                  </form>
                  {(appInfo.googleClietId || isEnableSubscription) && (
                    <div className="op-divider my-4 text-sm">OR</div>
                  )}
                  <div className="flex flex-col justify-center items-center gap-y-3">
                    {/* {appInfo?.fbAppId && (
                      <LoginFacebook
                        FBCred={appInfo.fbAppId}
                        thirdpartyLoginfn={thirdpartyLoginfn}
                        thirdpartyLoader={state.thirdpartyLoader}
                        setThirdpartyLoader={setThirdpartyLoader}
                      />
                    )} */}
                    {appInfo?.googleClietId && (
                      <GoogleSignInBtn
                        GoogleCred={appInfo.googleClietId}
                        thirdpartyLoginfn={thirdpartyLoginfn}
                        thirdpartyLoader={state.thirdpartyLoader}
                        setThirdpartyLoader={setThirdpartyLoader}
                      />
                    )}
                    {isEnableSubscription && (
                      <div
                        className="cursor-pointer border-[1px] border-gray-300 rounded px-[40px] py-2 font-semibold text-sm hover:border-[#d2e3fc] hover:bg-[#ecf3feb7]"
                        onClick={() => handleSignInWithSSO()}
                      >
                        Sign in with SSO
                      </div>
                    )}
                  </div>
                </div>
                {width >= 768 && (
                  <div className="place-self-center">
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
            <Alert type={state.alertType}>{state.alertMsg}</Alert>
          </div>
          <ModalUi isOpen={isModal} title="Additional Info" showClose={false}>
            <form className="px-4 py-3 text-base-content">
              <div className="mb-3">
                <label
                  htmlFor="Company"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  Company <span style={{ fontSize: 13, color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
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
              <div className="mb-3">
                <label
                  htmlFor="JobTitle"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  Job Title
                  <span style={{ fontSize: 13, color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  id="JobTitle"
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
              <div className="mt-4 gap-2 flex flex-row">
                <button
                  type="button"
                  className="op-btn op-btn-primary"
                  onClick={(e) => handleSubmitbtn(e)}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-ghost"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </ModalUi>
        </>
      ) : (
        <div
          className="loader-37 fixed top-[50%] left-[45%] text-[50px] text-[#3ac9d6]"
          style={{ color: "#3ac9d6" }}
        ></div>
      )}
    </div>
  );
}
export default Login;
