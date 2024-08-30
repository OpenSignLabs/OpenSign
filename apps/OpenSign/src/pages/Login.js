import React, { useEffect, useState } from "react";
import Parse from "parse";
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
import {
  fetchSubscription,
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";

function Login() {
  const { t, i18n } = useTranslation();
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
    checkUserExt();
    // eslint-disable-next-line
  }, []);

  const checkUserExt = async () => {
    const app = await getAppLogo();
    if (!isEnableSubscription && app?.user === "not_exist") {
      navigate("/addadmin");
    }
    if (app?.logo) {
      setImage(app?.logo);
    } else {
      setImage(appInfo?.applogo || undefined);
    }
    if (localStorage.getItem("accesstoken")) {
      setState({ ...state, loading: true });
      GetLoginData();
    }
    dispatch(fetchAppInfo());
  };
  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setState({ ...state, [name]: value });
  };
  const handlePaidRoute = () => {
    navigate("/subscription");
  };
  const handleSubmit = async (event) => {
    localStorage.removeItem("accesstoken");
    event.preventDefault();
    const { email, password } = state;
    if (email && password) {
      try {
        setState({ ...state, loading: true });
        localStorage.setItem("appLogo", appInfo.applogo);
        // Pass the username and password to logIn function
        const user = await Parse.User.logIn(email, password);
        if (user) {
          let _user = user.toJSON();
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem("userEmail", email);
          localStorage.setItem("accesstoken", _user.sessionToken);
          localStorage.setItem("scriptId", true);
          if (_user.ProfilePic) {
            localStorage.setItem("profileImg", _user.ProfilePic);
          } else {
            localStorage.setItem("profileImg", "");
          }
          // Check extended class user role and tenentId
          try {
            const userSettings = appInfo.settings;
            await Parse.Cloud.run("getUserDetails")
              .then(async (extUser) => {
                if (extUser) {
                  // console.log("extUser", extUser, extUser?.get("IsDisabled"));
                  const IsDisabled = extUser?.get("IsDisabled") || false;
                  if (!IsDisabled) {
                    const userRole = extUser?.get("UserRole");
                    const menu =
                      userRole &&
                      userSettings.find((menu) => menu.role === userRole);
                    if (menu) {
                      const _currentRole = userRole;
                      const redirectUrl =
                        location?.state?.from ||
                        `/${menu.pageType}/${menu.pageId}`;
                      let _role = _currentRole.replace("contracts_", "");
                      localStorage.setItem("_user_role", _role);
                      const checkLanguage = extUser?.get("Language");
                      if (checkLanguage) {
                        checkLanguage && i18n.changeLanguage(checkLanguage);
                      }

                      const results = [extUser];
                      const extUser_str = JSON.stringify(results);

                      localStorage.setItem("Extand_Class", extUser_str);
                      const extInfo = JSON.parse(JSON.stringify(extUser));
                      localStorage.setItem("userEmail", extInfo.Email);
                      localStorage.setItem("username", extInfo.Name);
                      if (extInfo?.TenantId) {
                        const tenant = {
                          Id: extInfo?.TenantId?.objectId || "",
                          Name: extInfo?.TenantId?.TenantName || ""
                        };
                        localStorage.setItem("TenantId", tenant?.Id);
                        dispatch(showTenant(tenant?.Name));
                        localStorage.setItem("TenantName", tenant?.Name);
                      }
                      localStorage.setItem("PageLanding", menu.pageId);
                      localStorage.setItem("defaultmenuid", menu.menuId);
                      localStorage.setItem("pageType", menu.pageType);
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
                        const plan = res.plan;
                        const billingDate = res.billingDate;
                        if (plan === "freeplan") {
                          setState({ ...state, loading: false });
                          navigate(redirectUrl);
                        } else if (billingDate) {
                          if (new Date(billingDate) > new Date()) {
                            localStorage.removeItem("userDetails");
                            // Redirect to the appropriate URL after successful login                              setState({ ...state, loading: false });
                            setState({ ...state, loading: false });
                            navigate(redirectUrl);
                          } else {
                            setState({ ...state, loading: false });
                            handlePaidRoute(plan);
                          }
                        } else {
                          setState({ ...state, loading: false });
                          handlePaidRoute(plan);
                        }
                      } else {
                        setState({ ...state, loading: false });
                        // Redirect to the appropriate URL after successful login
                        navigate(redirectUrl);
                      }
                    } else {
                      setState({ ...state, loading: false });
                      setIsModal(true);
                    }
                  } else {
                    setState({
                      ...state,
                      loading: false,
                      alertType: "danger",
                      alertMsg:
                        "You don't have access, please contact the admin."
                    });
                    logOutUser();
                  }
                } else {
                  if (isEnableSubscription) {
                    setState({ ...state, loading: false });
                    setIsModal(true);
                  } else {
                    setState({ ...state, loading: false });
                    setState({
                      ...state,
                      loading: false,
                      alertType: "danger",
                      alertMsg: "User not found."
                    });
                    logOutUser();
                  }
                }
              })
              .catch((error) => {
                // const payload = { sessionToken: user.getSessionToken() };
                // handleSubmitbtn(payload);
                setState({
                  ...state,
                  loading: false,
                  alertType: "danger",
                  alertMsg: `Something went wrong.`
                });
                setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
                console.error("Error while fetching Follow", error);
              });
          } catch (error) {
            setState({
              ...state,
              loading: false,
              alertType: "danger",
              alertMsg: `${error.message}`
            });
            console.log(error);
            setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
          }
        }
      } catch (error) {
        setState({
          ...state,
          loading: false,
          alertType: "danger",
          alertMsg: "Invalid username or password!"
        });
        console.error("Error while logging in user", error);
      } finally {
        setTimeout(() => setState((prev) => ({ ...prev, alertMsg: "" })), 2000);
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
      alert(t("something-went-wrong-mssg"));
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
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", true);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      // Check extended class user role and tenentId
      try {
        const userSettings = appInfo.settings;
        await Parse.Cloud.run("getUserDetails")
          .then(async (extUser) => {
            if (extUser) {
              const IsDisabled = extUser?.get("IsDisabled") || false;
              if (!IsDisabled) {
                const userRole = extUser?.get("UserRole");
                const menu =
                  userRole &&
                  userSettings.find((menu) => menu.role === userRole);
                if (menu) {
                  const _currentRole = userRole;
                  const redirectUrl =
                    location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
                  const _role = _currentRole.replace("contracts_", "");
                  localStorage.setItem("_user_role", _role);
                  const results = [extUser];
                  const extUser_stringify = JSON.stringify(results);
                  localStorage.setItem("Extand_Class", extUser_stringify);
                  const extInfo = JSON.parse(JSON.stringify(extUser));
                  localStorage.setItem("userEmail", extInfo?.Email);
                  localStorage.setItem("username", extInfo?.Name);
                  if (extInfo?.TenantId) {
                    const tenant = {
                      Id: extInfo?.TenantId?.objectId || "",
                      Name: extInfo?.TenantId?.TenantName || ""
                    };
                    localStorage.setItem("TenantId", tenant?.Id);
                    dispatch(showTenant(tenant?.Name));
                    localStorage.setItem("TenantName", tenant?.Name);
                  }
                  localStorage.setItem("PageLanding", menu.pageId);
                  localStorage.setItem("defaultmenuid", menu.menuId);
                  localStorage.setItem("pageType", menu.pageType);
                  if (isEnableSubscription) {
                    const res = await fetchSubscription();
                    const plan = res.plan;
                    const billingDate = res.billingDate;
                    if (plan === "freeplan") {
                      navigate(redirectUrl);
                    } else if (billingDate) {
                      if (new Date(billingDate) > new Date()) {
                        localStorage.removeItem("userDetails");
                        navigate(redirectUrl);
                      } else {
                        if (isFreeplan) {
                          navigate(redirectUrl);
                        } else {
                          handlePaidRoute(plan);
                        }
                      }
                    } else {
                      if (isFreeplan) {
                        navigate(redirectUrl);
                      } else {
                        handlePaidRoute(plan);
                      }
                    }
                  } else {
                    navigate(redirectUrl);
                  }
                } else {
                  setState({
                    ...state,
                    loading: false,
                    alertType: "danger",
                    alertMsg: "Role not found."
                  });
                  logOutUser();
                }
              } else {
                setState({
                  ...state,
                  loading: false,
                  alertType: "danger",
                  alertMsg: "You don't have access, please contact the admin."
                });
                logOutUser();
              }
            } else {
              setState({
                ...state,
                alertType: "danger",
                alertMsg: "User not found."
              });
              logOutUser();
            }
          })
          .catch((err) => {
            console.error("err in fetching extUser", err);
            setState({
              ...state,
              alertType: "danger",
              alertMsg: `${err.message}`
            });
            const payload = { sessionToken: sessionToken };
            handleSubmitbtn(payload);
          });
      } catch (error) {
        setState({
          ...state,
          alertType: "danger",
          alertMsg: `${error.message}`
        });
        console.log(error);
      } finally {
        setThirdpartyLoader(false);
        setState({ ...state, loading: false });
        setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
      }
    }
  };

  const GetLoginData = async () => {
    setState({ ...state, loading: true });
    try {
      const user = await Parse.User.become(localStorage.getItem("accesstoken"));
      const _user = user.toJSON();
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", true);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      const userSettings = appInfo.settings;
      await Parse.Cloud.run("getUserDetails").then(async (extUser) => {
        if (extUser) {
          const IsDisabled = extUser?.get("IsDisabled") || false;
          if (!IsDisabled) {
            const userRole = extUser.get("UserRole");
            const _currentRole = userRole;
            const menu =
              userRole && userSettings.find((menu) => menu.role === userRole);
            if (menu) {
              const _role = _currentRole.replace("contracts_", "");
              localStorage.setItem("_user_role", _role);
              const redirectUrl =
                location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
              const results = [extUser];
              const extendedInfo_stringify = JSON.stringify(results);
              localStorage.setItem("Extand_Class", extendedInfo_stringify);
              const extInfo = JSON.parse(JSON.stringify(extUser));
              localStorage.setItem("userEmail", extInfo.Email);
              localStorage.setItem("username", extInfo.Name);
              if (extInfo?.TenantId) {
                const tenant = {
                  Id: extInfo?.TenantId?.objectId || "",
                  Name: extInfo?.TenantId?.TenantName || ""
                };
                localStorage.setItem("TenantId", tenant?.Id);
                dispatch(showTenant(tenant?.Name));
                localStorage.setItem("TenantName", tenant?.Name);
              }
              localStorage.setItem("PageLanding", menu.pageId);
              localStorage.setItem("defaultmenuid", menu.menuId);
              localStorage.setItem("pageType", menu.pageType);
              if (isEnableSubscription) {
                const userInfo = {
                  name: results[0].get("Name"),
                  email: results[0].get("Email"),
                  phone: results[0]?.get("Phone") || "",
                  company: results[0]?.get("Company")
                };
                localStorage.setItem("userDetails", JSON.stringify(userInfo));
                const res = await fetchSubscription();
                const billingDate = res.billingDate;
                const plan = res.plan;
                if (plan === "freeplan") {
                  navigate(redirectUrl);
                } else if (billingDate) {
                  if (new Date(billingDate) > new Date()) {
                    localStorage.removeItem("userDetails");
                    // Redirect to the appropriate URL after successful login
                    navigate(redirectUrl);
                  } else {
                    handlePaidRoute(plan);
                  }
                } else {
                  handlePaidRoute(plan);
                }
              } else {
                // Redirect to the appropriate URL after successful login
                navigate(redirectUrl);
              }
            } else {
              setState({ ...state, loading: false });
              logOutUser();
            }
          } else {
            setState({
              ...state,
              loading: false,
              alertType: "danger",
              alertMsg: "You don't have access, please contact the admin."
            });
            logOutUser();
          }
        } else {
          setState({
            ...state,
            alertType: "danger",
            alertMsg: "User not found."
          });
          logOutUser();
        }
      });
    } catch (error) {
      setState({
        ...state,
        alertType: "danger",
        alertMsg: "Something went wrong, please try again later."
      });
      console.log("err", error);
    } finally {
      setState({ ...state, loading: false });
      setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
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
        alert(t("server-error"));
      }
    } else {
      setState({
        ...state,
        loading: false,
        alertType: "warning",
        alertMsg: "Please fill required details."
      });
      setTimeout(() => setState((prev) => ({ ...prev, alertMsg: "" })), 2000);
    }
  };

  const logOutUser = () => {
    setIsModal(false);
    if (Parse?.User?.current()) {
      Parse.User.logOut();
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();
    saveLanguageInLocal(i18n);

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
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
        alert(t("provide-email"));
      }
    }
  };

  return (
    <div>
      <Title title={"Login Page"} />
      {state.loading && (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-50"
        >
          <Loader />
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
                    <h1 className="text-[30px] mt-6">{t("welcome")}</h1>
                    <fieldset>
                      <legend className="text-[12px] text-[#878787]">
                        {t("Login-to-your-account")}
                      </legend>
                      <div className="w-full px-6 py-3 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50">
                        <label className="block text-xs" htmlFor="email">
                          {t("email")}
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          name="email"
                          autoComplete="username"
                          value={state.email}
                          onChange={handleChange}
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity(t("input-required"))
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                        />
                        <hr className="my-1 border-none" />
                        {!isLoginSSO && (
                          <>
                            <label className="block text-xs" htmlFor="password">
                              {t("password")}
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
                                autoComplete="current-password"
                                onChange={handleChange}
                                onInvalid={(e) =>
                                  e.target.setCustomValidity(
                                    t("input-required")
                                  )
                                }
                                onInput={(e) => e.target.setCustomValidity("")}
                                required
                              />
                              <span
                                className="absolute cursor-pointer top-[50%] right-[10px] -translate-y-[50%] text-base-content"
                                onClick={togglePasswordVisibility}
                              >
                                {state.passwordVisible ? (
                                  <i className="fa-light fa-eye-slash text-xs pb-1" /> // Close eye icon
                                ) : (
                                  <i className="fa-light fa-eye text-xs pb-1 " /> // Open eye icon
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
                            {t("forgot-password")}
                          </NavLink>
                        </div>
                      </div>
                    </fieldset>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center text-xs font-bold mt-2">
                      <button
                        type="submit"
                        className="op-btn op-btn-primary"
                        disabled={state.loading}
                      >
                        {state.loading ? t("loading") : t("login")}
                      </button>
                      {isEnableSubscription && (
                        <button
                          type="button"
                          className="op-btn op-btn-accent"
                          disabled={state.loading}
                          onClick={() =>
                            navigate(
                              location.search
                                ? "/signup" + location.search
                                : "/signup"
                            )
                          }
                        >
                          {t("create-account")}
                        </button>
                      )}
                    </div>
                  </form>
                  {(appInfo.googleClietId || isEnableSubscription) && (
                    <div className="op-divider my-4 text-sm">{t("or")}</div>
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
                        {t("sign-SSO")}
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
            <SelectLanguage />
            {state.alertMsg && (
              <Alert type={state.alertType}>{state.alertMsg}</Alert>
            )}
          </div>
          <ModalUi
            isOpen={isModal}
            title={t("additional-info")}
            showClose={false}
          >
            <form className="px-4 py-3 text-base-content">
              <div className="mb-3">
                <label
                  htmlFor="Company"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  {t("company")}{" "}
                  <span className="text-[red] text-[13px]">*</span>
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
                  onInvalid={(e) =>
                    e.target.setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="JobTitle"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  {t("job-title")}
                  <span className="text-[red] text-[13px]">*</span>
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
                  onInvalid={(e) =>
                    e.target.setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                />
              </div>
              <div className="mt-4 gap-2 flex flex-row">
                <button
                  type="button"
                  className="op-btn op-btn-primary"
                  onClick={(e) => handleSubmitbtn(e)}
                >
                  {t("login")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-ghost"
                  onClick={logOutUser}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </ModalUi>
        </>
      ) : (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center z-50"
        >
          <Loader />
        </div>
      )}
    </div>
  );
}
export default Login;
