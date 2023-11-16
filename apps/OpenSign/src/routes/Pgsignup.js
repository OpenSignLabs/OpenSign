import React, { useState, useEffect } from "react";
import "../styles/pgsignup.css";
import Parse from "parse";
import axios from "axios";
import { fetchAppInfo, showTenantName } from "../redux/actions/index";
import { connect } from "react-redux";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";

const appId = localStorage.getItem("AppID12");
const server = localStorage.getItem("BaseUrl12");
Parse.serverURL = server;
Parse.initialize(appId);
const PgSignUp = (props) => {
  const navigate = useNavigate();
  const [parseBaseUrl] = useState(localStorage.getItem("BaseUrl12"));
  const [parseAppId] = useState(localStorage.getItem("AppID12"));
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoader, setIsLoader] = useState(true);

  // below useEffect is used to fetch App data and save to redux state
  useEffect(() => {
    // Parse.User.logOut()
    props.fetchAppInfo(
      localStorage.getItem("domain"),
      localStorage.getItem("BaseUrl12"),
      localStorage.getItem("AppID12")
    );
    handleSignedUpUser();
    // eslint-disable-next-line
  }, []);

  //`handleSignedUpUser` is called first time and it only work for user who comes from login with google, facebook or normal sign up flow
  const handleSignedUpUser = async () => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));

    if (userDetails && userDetails.email) {
      try {
        const url = window.location.href;
        let paramString = url.split("?")[1];
        let queryString = new URLSearchParams(paramString);
        // console.log("url ", queryString);

        let obj = { ...formData };
        for (let pair of queryString.entries()) {
          // console.log("Key is: " + pair[0]);
          // console.log("Value is: " + pair[1]);
          obj = { ...obj, [pair[0]]: pair[1] };
        }
        const zohoRes = await axios.post(
          parseBaseUrl + "functions/zohodetails",
          {
            hostedpagesId: obj.hostedpage_id
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId
            }
          }
        );
        // console.log("zohoRes ", zohoRes);
        const userSettings = JSON.parse(localStorage.getItem("userSettings"));
        const extClass = userSettings[0].extended_class;
        // console.log("extClass ", extClass);
        const params = { email: userDetails.email };
        const res = await Parse.Cloud.run("getUserDetails", params);
        // console.log("res", res);
        if (res) {
          const checkUser = new Parse.Query(extClass);
          const updateQuery = await checkUser.get(res.id);
          updateQuery.set(
            "Next_billing_date",
            new Date(zohoRes.data.result.nextBillingDate)
          );
          updateQuery.set("Plan", zohoRes.data.result.plan);
          updateQuery.set("Customer_id", zohoRes.data.result.customer_id);
          updateQuery.set(
            "Subscription_id",
            zohoRes.data.result.subscription_id
          );
          const updateRes = await updateQuery.save();
          if (updateRes) {
            localStorage.removeItem("userDetails");
            navigate(
              "/" + userSettings[0].pageType + "/" + userSettings[0].pageId
            );
            setIsLoader(false);
          }
        }
      } catch (err) {
        console.log("err ", err);
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };

  // "handleSubmit" is used to save user details signup him/her who come from plan-pricing page
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoader(true);
    if (formData.password === formData.confirmPassword) {
      const url = window.location.href;
      let paramString = url.split("?")[1];
      let queryString = new URLSearchParams(paramString);
      // console.log("url ", queryString);

      let obj = { ...formData };
      for (let pair of queryString.entries()) {
        // console.log("Key is: " + pair[0]);
        // console.log("Value is: " + pair[1]);
        obj = { ...obj, [pair[0]]: pair[1] };
      }
      saveUser(obj);
      // console.log("obj ", obj);}
    }
  };
  const saveUser = async (obj) => {
    // const domain = localStorage.getItem("domain");
    // console.log("domain", domain)
    try {
      const zohoRes = await axios.post(
        parseBaseUrl + "functions/zohodetails",
        {
          hostedpagesId: obj.hostedpage_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId
          }
        }
      );

      const user = new Parse.User();
      user.set("username", zohoRes.data.result.email);
      user.set("password", obj.password);
      user.set("email", zohoRes.data.result.email);
      user.set("phone", zohoRes.data.result.phone);
      user.set("name", zohoRes.data.result.name);

      const res = await user.signUp();
      // console.log("res ", res);

      if (res) {
        const params = {
          userDetails: {
            company: zohoRes.data.result.company,
            name: zohoRes.data.result.name,
            email: zohoRes.data.result.email,
            phone: zohoRes.data.result.phone,
            role: obj.role
            // "pincode": "",
            // "address": "",
            // "country": "",
            // "state": "",
            // "city": ""
          },

          planDetails: {
            plan: zohoRes.data.result.plan || {},
            nextBillingDate: zohoRes.data.result.nextBillingDate || "",
            customer_id: zohoRes.data.result.customer_id || "",
            subscription_id: zohoRes.data.result.subscription_id || ""
          }
        };
        const usersignup = await Parse.Cloud.run("usersignup", params);
        // console.log("usersignup ", usersignup);
        if (usersignup && usersignup.sessionToken) {
          handleNavigation(usersignup.sessionToken);
        }
      }
      // setIsLoader(false);
    } catch (error) {
      console.log("err ", error);
      if (error.message === "Account already exists for this username.") {
        alert("Account already exists!");
        navigate("/");
      } else {
        setIsLoader(false);
        alert("Something went wrong, please try again later!");
      }
    }
  };

  const handlePassowordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validatePasswords(newPassword, formData.confirmPassword);
  };
  const handleConFirmPassowordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validatePasswords(formData.password, newConfirmPassword);
  };
  const validatePasswords = (newPassword, newConfirmPassword) => {
    if (newPassword === newConfirmPassword) {
      setValidationMessage("Passwords match!");
    } else {
      setValidationMessage("Passwords not match!");
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
                              setIsLoader(false);
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
                              setIsLoader(false);
                              alert("Registered user successfully");
                              navigate(
                                `/${element.pageType}/${element.pageId}`
                              );
                            }
                          } else {
                            alert("Registered user successfully");
                            localStorage.setItem("PageLanding", element.pageId);
                            localStorage.setItem(
                              "defaultmenuid",
                              element.menuId
                            );
                            localStorage.setItem("pageType", element.pageType);
                            setIsLoader(false);
                            navigate(`/${element.pageType}/${element.pageId}`);
                          }
                        },
                        (error) => {
                          setIsLoader(false);
                          console.error("Error while fetching Follow", error);
                        }
                      );
                    }
                  });
                } else {
                  setIsLoader(false);
                }
              } else {
                setIsLoader(false);
              }
            })
            .catch((err) => {
              console.log('err', err)
              setIsLoader(false);
            });
        }
      } catch (error) {
        setIsLoader(false);
        console.log(error);
      }
    }
  };
  return (
    <div className="bg-white">
      <Title title={"Pgsignup page"} />
      {isLoader ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <form id="signup" className="pgsignup-content" onSubmit={handleSubmit}>
          <div className="pgsignup-container">
            <h1 className="text-4xl font-bold">Choose Password</h1>
            <hr className="hrt" />
            <label htmlFor="password">
              <b>Password</b>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              className="inputt"
              value={formData.password}
              onChange={handlePassowordChange}
              required
            />

            <label htmlFor="confirmPassword">
              <b>Confirm Password</b>
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              className="confirmInputt"
              style={{
                border: validationMessage
                  ? validationMessage === "Passwords match!"
                    ? "2px solid green"
                    : "2px solid red"
                  : "2px solid transparent",
                outline: "none"
              }}
              value={formData.confirmPassword}
              onChange={handleConFirmPassowordChange}
              required
            />
            <div
              className="icon"
              style={{
                margin: validationMessage ? "0 2px 0 2px" : "0 2px 22px 2px",
                color:
                  validationMessage === "Passwords match!" ? "green" : "red",
                fontSize: 11
              }}
            >
              {validationMessage}
            </div>
            <div className="clearfix">
              <button type="submit" className="signupbtn">
                Submit
              </button>
            </div>
          </div>
        </form>
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
})(PgSignUp);
