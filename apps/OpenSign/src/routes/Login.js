import React, { Component } from "react";
import Parse from "parse";
import "../styles/toast.css";
import "../styles/loader.css";
import { connect } from "react-redux";
import { fetchAppInfo, setEnableCart, showTenantName } from "../redux/actions";
import axios from "axios";
import Title from "../components/Title";
import GoogleSignInBtn from "../components/LoginGoogle";
import LoginFacebook from "../components/LoginFacebook";
import { NavLink, Navigate } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";

class Login extends Component {
  state = {
    email: "",
    toastColor: "#5cb85c",
    toastDescription: "",
    password: "",
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
    roleModal: false,
    ReqOtp: ""
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  resize = () => {
    let currentHideNav = window.innerWidth <= 760;
    if (currentHideNav !== this.state.hideNav) {
      this.setState({ hideNav: currentHideNav });
    }
  };

  setLocalIframe = (iframeUrl) => {
    try {
      let data = {
        accesstoken: localStorage.getItem("accesstoken"),
        baseUrl: localStorage.getItem("baseUrl"),
        parseAppId: localStorage.getItem("parseAppId"),
        extended_class: localStorage.getItem("extended_class"),
        extend_details: localStorage.getItem("Extand_Class"),
        userSettings: localStorage.getItem("userSettings"),
        username: localStorage.getItem("username"),
        _appName: localStorage.getItem("_appName"),
        TenetId: localStorage.getItem("TenetId")
      };
      let storage = JSON.stringify({
        key: "storage",
        method: "set",
        data: data
      });
      var iframe = document.getElementById("def_iframe");
      iframe.contentWindow.postMessage(storage, "*");
      setTimeout(() => {
        <Navigate to={`/microapp/${iframeUrl}`} />;
      }, 4000);
    } catch (error) {
      console.log(error);
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = this.state;
    if (email && password) {
      try {
        this.setState({ loading: true });
        let baseUrl = localStorage.getItem("baseUrl");
        let parseAppId = localStorage.getItem("parseAppId");
        localStorage.setItem("appLogo", this.props.appInfo.applogo);
        localStorage.setItem("appName", this.props.appInfo.appname);
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
                if (this.props.appInfo.settings) {
                  let userSettings = this.props.appInfo.settings;

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
                                localStorage.setItem(
                                  "EnableCart",
                                  element.enableCart
                                );
                                this.props.setEnableCart(element.enableCart);
                              } else {
                                localStorage.removeItem("EnableCart");
                              }
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
                                        this.props.showTenantName(
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
                                      this.setState({ loading: false });
                                      return <Navigate to={`/`} />;
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
                                        this.props.showTenantName(
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
                                      this.setState({ loading: false });
                                      if (
                                        localStorage.getItem("domain") ===
                                        "contracts"
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
                                            if (
                                              element.pageType === "microapp"
                                            ) {
                                              this.setLocalIframe(
                                                element.pageId
                                              );
                                            } else {
                                              return (
                                                <Navigate
                                                  to={`/${element.pageType}/${element.pageId}`}
                                                />
                                              );
                                            }
                                          } else {
                                            return (
                                              <Navigate to={`/subscription`} />
                                            );
                                          }
                                        } else {
                                          return (
                                            <Navigate to={`/subscription`} />
                                          );
                                        }
                                      } else {
                                        if (element.pageType === "microapp") {
                                          this.setLocalIframe(element.pageId);
                                        } else {
                                          return (
                                            <Navigate
                                              to={`/${element.pageType}/${element.pageId}`}
                                            />
                                          );
                                        }
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
                                    this.setState({ loading: false });
                                    if (
                                      localStorage.getItem("domain") ===
                                      "contracts"
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
                                        return (
                                          <Navigate to={`/subscription`} />
                                        );
                                      }
                                    } else {
                                      if (element.pageType === "microapp") {
                                        this.setLocalIframe(element.pageId);
                                      } else {
                                        return (
                                          <Navigate
                                            to={`/${element.pageType}/${element.pageId}`}
                                          />
                                        );
                                      }
                                    }
                                  }
                                },
                                (error) => {
                                  /*   alert(
                                  "You dont have access to this application."
                                ); */
                                  this.setState(
                                    {
                                      loading: false,
                                      toastColor: "#d9534f",
                                      toastDescription:
                                        "You dont have access to this application."
                                    },
                                    () => {
                                      var x =
                                        document.getElementById("snackbar");
                                      x.className = "show";
                                      setTimeout(function () {
                                        x.className = x.className.replace(
                                          "show",
                                          ""
                                        );
                                      }, 5000);
                                      localStorage.setItem("accesstoken", null);
                                    }
                                  );

                                  console.error(
                                    "Error while fetching Follow",
                                    error
                                  );
                                }
                              );
                            }
                          });
                        } else {
                          this.setState(
                            {
                              loading: false,
                              toastColor: "#d9534f",
                              toastDescription: "User Role Not Found."
                            },
                            () => {
                              var x = document.getElementById("snackbar");
                              x.className = "show";
                              setTimeout(function () {
                                x.className = x.className.replace("show", "");
                              }, 5000);
                            }
                          );
                        }
                      } else {
                        this.setState(
                          {
                            loading: false,
                            toastColor: "#d9534f",
                            toastDescription: "User Role Not Found."
                          },
                          () => {
                            var x = document.getElementById("snackbar");
                            x.className = "show";
                            setTimeout(function () {
                              x.className = x.className.replace("show", "");
                            }, 5000);
                          }
                        );
                      }
                    })
                    .catch((err) => {
                      this.setState(
                        {
                          loading: false,
                          toastColor: "#d9534f",
                          toastDescription: `Does not have permissions to access this application.`
                        },
                        () => {
                          var x = document.getElementById("snackbar");
                          x.className = "show";
                          setTimeout(function () {
                            x.className = x.className.replace("show", "");
                          }, 5000);
                        }
                      );
                    });
                }
              } catch (error) {
                this.setState(
                  {
                    loading: false,
                    toastColor: "#d9534f",
                    toastDescription: `${error.message}`
                  },
                  () => {
                    var x = document.getElementById("snackbar");
                    x.className = "show";
                    setTimeout(function () {
                      x.className = x.className.replace("show", "");
                    }, 5000);
                  }
                );

                console.log(error);
              }
            }
          })
          .catch((error) => {
            this.setState(
              {
                loading: false,
                toastColor: "#d9534f",
                toastDescription: "Login failed: Invalid username or password."
              },
              () => {
                var x = document.getElementById("snackbar");
                x.className = "show";
                setTimeout(function () {
                  x.className = x.className.replace("show", "");
                }, 5000);
              }
            );
            console.error("Error while logging in user", error);
          });
      } catch (error) {
        console.log(error.message);
        this.setState({ loading: false });
      }
    }
  };

  setThirdpartyLoader = (value) => {
    this.setState({ thirdpartyLoader: value });
  };
  thirdpartyLoginfn = async (sessionToken, billingDate) => {
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
        if (this.props.appInfo.settings) {
          let userSettings = this.props.appInfo.settings;

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
                        this.props.setEnableCart(element.enableCart);
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
                                this.props.showTenantName(
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
                              this.setThirdpartyLoader(false);
                              this.setState({ loading: false });
                              return <Navigate to={`/login`} />;
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
                                this.props.showTenantName(
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
                              this.setThirdpartyLoader(false);
                              this.setState({ loading: false });
                              if (billingDate) {
                                if (billingDate > new Date()) {
                                  localStorage.removeItem("userDetails");
                                  if (element.pageType === "microapp") {
                                    this.setLocalIframe(element.pageId);
                                  } else {
                                    return (
                                      <Navigate
                                        to={`/${element.pageType}/${element.pageId}`}
                                      />
                                    );
                                  }
                                } else {
                                  return (
                                    <Navigate
                                      to={`/${element.pageType}/${element.pageId}`}
                                    />
                                  );
                                }
                              } else {
                                return (
                                  <Navigate
                                    to={`/${element.pageType}/${element.pageId}`}
                                  />
                                );
                              }
                            }
                          } else {
                            localStorage.setItem("PageLanding", element.pageId);
                            localStorage.setItem(
                              "defaultmenuid",
                              element.menuId
                            );
                            localStorage.setItem("pageType", element.pageType);
                            this.setState({ loading: false });
                            this.setThirdpartyLoader(false);
                            if (billingDate) {
                              if (billingDate > new Date()) {
                                localStorage.removeItem("userDetails");
                                if (element.pageType === "microapp") {
                                  this.setLocalIframe(element.pageId);
                                } else {
                                  return (
                                    <Navigate
                                      to={`/${element.pageType}/${element.pageId}`}
                                    />
                                  );
                                }
                              } else {
                                return (
                                  <Navigate
                                    to={`/${element.pageType}/${element.pageId}`}
                                  />
                                );
                              }
                            } else {
                              return (
                                <Navigate
                                  to={`/${element.pageType}/${element.pageId}`}
                                />
                              );
                            }
                          }
                        },
                        (error) => {
                          /*   alert(
                          "You dont have access to this application."
                        ); */
                          this.setThirdpartyLoader(false);

                          this.setState(
                            {
                              loading: false,
                              toastColor: "#d9534f",
                              toastDescription:
                                "You dont have access to this application."
                            },
                            () => {
                              var x = document.getElementById("snackbar");
                              x.className = "show";
                              setTimeout(function () {
                                x.className = x.className.replace("show", "");
                              }, 5000);
                              localStorage.setItem("accesstoken", null);
                            }
                          );

                          console.error("Error while fetching Follow", error);
                        }
                      );
                    }
                  });
                } else {
                  this.setThirdpartyLoader(false);
                  this.setState(
                    {
                      loading: false,
                      toastColor: "#d9534f",
                      toastDescription: "User Role Not Found."
                    },
                    () => {
                      var x = document.getElementById("snackbar");
                      x.className = "show";
                      setTimeout(function () {
                        x.className = x.className.replace("show", "");
                      }, 5000);
                    }
                  );
                }
              } else {
                this.setThirdpartyLoader(false);
                this.setState(
                  {
                    loading: false,
                    toastColor: "#d9534f",
                    toastDescription: "User Role Not Found."
                  },
                  () => {
                    var x = document.getElementById("snackbar");
                    x.className = "show";
                    setTimeout(function () {
                      x.className = x.className.replace("show", "");
                    }, 5000);
                  }
                );
              }
            })
            .catch((err) => {
              this.setThirdpartyLoader(false);
              this.setState(
                {
                  loading: false,
                  toastColor: "#d9534f",
                  toastDescription: `Does not have permissions to access this application.`
                },
                () => {
                  var x = document.getElementById("snackbar");
                  x.className = "show";
                  setTimeout(function () {
                    x.className = x.className.replace("show", "");
                  }, 5000);
                }
              );
            });
        }
      } catch (error) {
        this.setThirdpartyLoader(false);
        this.setState(
          {
            loading: false,
            toastColor: "#d9534f",
            toastDescription: `${error.message}`
          },
          () => {
            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function () {
              x.className = x.className.replace("show", "");
            }, 5000);
          }
        );

        console.log(error);
      }
    }
  };

  GetLoginData = async () => {
    try {
      Parse.serverURL = localStorage.getItem("baseUrl");
      Parse.initialize(localStorage.getItem("parseAppId"));
      await Parse.User.become(localStorage.getItem("accesstoken")).then(
        async (user) => {
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
          try {
            let userRoles = [];

            if (localStorage.getItem("userSettings")) {
              let userSettings = localStorage.getItem("userSettings");

              //Get Current user roles
              let url = `${localStorage.getItem(
                "baseUrl"
              )}functions/UserGroups`;
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

                        if (element.enableCart) {
                          localStorage.setItem(
                            "EnableCart",
                            element.enableCart
                          );
                          this.props.setEnableCart(element.enableCart);
                        } else {
                          localStorage.removeItem("EnableCart");
                        }
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
                              let extendedInfo_stringify =
                                JSON.stringify(results);
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
                                return <Navigate to={`/login`} />;
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
                                localStorage.removeItem("SwitcherApp");
                                if (element.pageType === "microapp") {
                                  this.setLocalIframe(element.pageId);
                                } else {
                                  return (
                                    <Navigate
                                      to={`/${element.pageType}/${element.pageId}`}
                                    />
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
                              localStorage.removeItem("SwitcherApp");
                              if (element.pageType === "microapp") {
                                this.setLocalIframe(element.pageId);
                              } else {
                                return (
                                  <Navigate
                                    to={`/${element.pageType}/${element.pageId}`}
                                  />
                                );
                              }
                            }
                          },
                          (error) => {
                            this.setState(
                              {
                                loading: false,
                                toastColor: "#d9534f",
                                toastDescription:
                                  "You don`t have access to this application."
                              },
                              () => {
                                var x = document.getElementById("snackbar");
                                x.className = "show";
                                setTimeout(function () {
                                  x.className = x.className.replace("show", "");
                                }, 5000);
                                localStorage.setItem("accesstoken", null);
                                localStorage.removeItem("SwitcherApp");
                              }
                            );

                            console.error("Error while fetching Follow", error);
                          }
                        );
                      }
                    });
                  } else {
                    console.log("User Role Not Found.");
                    localStorage.removeItem("SwitcherApp");
                  }
                })
                .catch((err) => {
                  this.setState({ roleModal: true });
                  localStorage.removeItem("SwitcherApp");
                });
            }
          } catch (error) {
            localStorage.removeItem("SwitcherApp");
          }
        }
      );
    } catch (error) {
      console.log("err", error);
    }
  };

  sendAddRoleRequest = (e) => {
    try {
      e.preventDefault();
      let _user = JSON.parse(localStorage.getItem("UserInformation"));
      Parse.serverURL = localStorage.getItem("baseUrl");
      Parse.initialize(localStorage.getItem("parseAppId"));
      const role_req = Parse.Object.extend("partners_Request");
      const myNewObject = new role_req();
      myNewObject.set("AppName", localStorage.getItem("_appName"));
      myNewObject.set("Status", "Pending");
      myNewObject.set("UserId", {
        __type: "Pointer",
        className: "_User",
        objectId: _user.objectId
      });
      myNewObject.set("TenetId", {
        __type: "Pointer",
        className: "partners_Tenant",
        objectId: localStorage.getItem("TenetId")
      });
      /*  myNewObject.set("AppId", {
        __type: "Pointer",
        className: "elearning_BuildConfig",
        objectId: localStorage.getItem("TenetId")
      }); */
      myNewObject
        .save()
        .then((result) => {
          if (result) {
            alert("Request sended successfully.");
            this.setState({ roleModal: false });
          }
        })
        .catch((err) => {
          alert(err.message);
          this.setState({ roleModal: false });
        });
    } catch (error) {
      alert(error.message);
      this.setState({ roleModal: false });
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    if (
      localStorage.getItem("accesstoken") &&
      localStorage.getItem("SwitcherApp")
    ) {
      this.GetLoginData();
    }
    this.props.fetchAppInfo(
      localStorage.getItem("domain"),
      localStorage.getItem("BaseUrl12"),
      localStorage.getItem("AppID12")
    );
    this.resize();
  }

  render() {
    if (
      localStorage.getItem("accesstoken") &&
      localStorage.getItem("pageType")
    ) {
      if (localStorage.getItem("pageType") === "microapp") {
        this.setLocalIframe(localStorage.getItem("PageLanding"));
      } else {
        let _redirect = `/${localStorage.getItem(
          "pageType"
        )}/${localStorage.getItem("PageLanding")}`;
        return <Navigate to={_redirect} />;
      }
    }

    const { email, password } = this.state;
    let image = this.props.appInfo.applogo;
    let settings = this.props.appInfo.settings || undefined;
    return (
      <div className="bg-white">
        {settings &&
          settings.map((x) => {
            return x.pageType === "microapp" ? (
              <iframe
                key={x.pageId}
                id="def_iframe"
                src={x.pageId}
                height="0px"
                width="0px"
                title="micro"
              />
            ) : null;
          })}

        <Title title={"Login Page"} />

        {this.props.isloginVisible && this.props.isloginVisible ? (
          <div>
            <div className="md:m-10 lg:m-16 md:p-4 lg:p-10 p-5 bg-[#ffffff] md:border-[1px] md:border-gray-400 ">
              <div className="w-[250px] h-[66px] inline-block">
                {this.state.hideNav ? (
                  <img src={image} width="100%" alt="" />
                ) : (
                  <img src={image} width="100%" alt="" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <div className="">
                  <div>
                    <form onSubmit={this.handleSubmit}>
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
                            value={email}
                            onChange={this.handleChange}
                            required
                          />
                          <hr className="my-2 border-none" />
                          <label className="block text-xs">Password</label>
                          <input
                            type="password"
                            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                            required
                          />
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
                            {/* <a href="/ForgotPassword" >Forgot Password ?</a></span> */}
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
                          disabled={this.state.loading}
                        >
                          {this.state.loading ? "Loading..." : "Login"}
                        </button>
                        <NavLink
                          className="rounded-sm cursor-pointer bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] w-full py-3 shadow uppercase"
                          to="/signup"
                          style={
                            this.state.hideNav ? { textAlign: "center" } : {}
                          }
                        >
                          Create Account
                        </NavLink>
                      </div>
                    </form>
                    <br />
                    {(this.props.appInfo.fbAppId ||
                      this.props.appInfo.googleClietId) && (
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
                      {this.props.appInfo.fbAppId &&
                      this.props.appInfo.fbAppId !== "" ? (
                        <LoginFacebook
                          FBCred={this.props.appInfo.fbAppId}
                          thirdpartyLoginfn={this.thirdpartyLoginfn}
                          thirdpartyLoader={this.state.thirdpartyLoader}
                          setThirdpartyLoader={this.setThirdpartyLoader}
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
                      {this.props.appInfo.googleClietId &&
                      this.props.appInfo.googleClietId !== "" ? (
                        <GoogleSignInBtn
                          GoogleCred={this.props.appInfo.googleClietId}
                          thirdpartyLoginfn={this.thirdpartyLoginfn}
                          thirdpartyLoader={this.state.thirdpartyLoader}
                          setThirdpartyLoader={this.setThirdpartyLoader}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
                {!this.state.hideNav && (
                  <div className="self-center">
                    <div className="mx-auto md:w-[300px] lg:w-[500px]">
                      <img src={login_img} alt="bisec" width="100%" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {this.state.roleModal && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                {/* <!-- Modal Container --> */}
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs md:min-w-[500px] md:max-w-md">
                  {/* <!-- Modal Header --> */}
                  <div className="flex justify-between w-full items-center border-b-2 mb-2">
                    <h2 className="text-md md:text-xl font-semibold">
                      Request for Access Application
                    </h2>
                    <button
                      className="text-black focus:outline-none"
                      id="closeModal"
                      onClick={(e) => {
                        e.preventDefault();
                        this.setState({ roleModal: false });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {/* <!-- Modal Body --> */}
                  <div className="p-4">
                    <p>{`Are you sure to send request for access ${localStorage.getItem(
                      "appTitle"
                    )} application.`}</p>
                    <button
                      type="button"
                      onClick={this.sendAddRoleRequest}
                      className="px-6 py-2 bg-[#2abfcc] text-white rounded shadow"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              id="snackbar"
              style={{ backgroundColor: this.state.toastColor }}
            >
              {this.state.toastDescription}
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
  }
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
  setEnableCart,
  showTenantName
})(Login);
