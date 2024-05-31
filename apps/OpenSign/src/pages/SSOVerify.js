// import axios from "axios";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Parse from "parse";
import axios from "axios";
import { appInfo } from "../constant/appinfo";
import { isEnableSubscription } from "../constant/const";
import { fetchSubscription } from "../constant/Utils";
import { useDispatch } from "react-redux";
import { showTenant } from "../redux/reducers/ShowTenant";
const SSOVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    getAccesstoken();
    // eslint-disable-next-line
  }, []);
  const getAccesstoken = async () => {
    const param = new URLSearchParams(location.search);
    const code = param?.get("code");
    const state = param?.get("state");
    // console.log("code ", code);
    try {
      const ssosign = await Parse.Cloud.run("ssosign", {
        code: code,
        email: state
      });
      await checkExtUser(ssosign);
      //   console.log("ssores ", ssosign);
    } catch (err) {
      console.log("err", err);
    }
  };
  const checkExtUser = async (ssosign) => {
    // const extUser = new Parse.Query("contracts_Users");
    // extUser.equalTo("Email", details.Gmail);
    // const extRes = await extUser.first();
    const params = { email: ssosign?.email };
    const extRes = await Parse.Cloud.run("getUserDetails", params);
    // console.log("extRes ", extRes);
    if (extRes) {
      if (ssosign && ssosign.sessiontoken) {
        const LocalUserDetails = {
          name: extRes.Name,
          email: extRes.email,
          phone: extRes?.get("Phone") || "",
          company: extRes.get("Company")
        };
        localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
        thirdpartyLoginfn(ssosign.sessiontoken);
      }
      return { msg: "exist" };
    } else {
      // setIsModal(true);
      // setThirdpartyLoader(false);
      console.log("not exist");
      return { msg: "notexist" };
    }
  };
  const thirdpartyLoginfn = async (sessionToken) => {
    const baseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    try {
      const validUser = await Parse.User.become(sessionToken);
      if (validUser) {
        localStorage.setItem("accesstoken", sessionToken);
        const _user = JSON.parse(JSON.stringify(validUser));
        // console.log("_user ", _user);
        localStorage.setItem("UserInformation", JSON.stringify(_user));
        if (_user.ProfilePic) {
          localStorage.setItem("profileImg", _user.ProfilePic);
        } else {
          localStorage.setItem("profileImg", "");
        }
        // Check extended class user role and tenentId
        try {
          let userRoles = [];
          if (appInfo.settings) {
            const userSettings = appInfo.settings;

            //Get Current user roles
            let url = `${baseUrl}functions/UserGroups`;
            const headers = {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId,
              sessionToken: _user.sessionToken
            };
            const body = { appname: appInfo.appname };
            const UserGroupsRes = await axios.post(url, JSON.stringify(body), {
              headers: headers
            });
            userRoles = (UserGroupsRes.data && UserGroupsRes.data.result) || [];
            if (userRoles) {
              let _currentRole = "";
              // const excludeRoles = ["contracts_Guest", `contracts_appeditor`];
              // const filteredRole = userRoles.filter(
              //   (x) => !excludeRoles.includes(x)
              // );
              // if (filteredRole?.length > 1) {
              //   _currentRole = userRoles.filter((x) => x === "contracts_User");
              // } else {
              //   _currentRole = rolesfiltered[0];
              // }
              _currentRole = userRoles?.find((x) => x === "contracts_User");
              if (_currentRole) {
                const roleSetting = userSettings?.find(
                  (setting) => setting.role === _currentRole
                );
                const redirectUrl =
                  location?.state?.from ||
                  `/${roleSetting.pageType}/${roleSetting.pageId}`;
                const _role = _currentRole.replace(`${appInfo.appname}_`, "");
                localStorage.setItem("_user_role", _role);
                // Get TenentID from Extendend Class
                localStorage.setItem(
                  "extended_class",
                  roleSetting.extended_class
                );
                try {
                  const extUser = await Parse.Cloud.run("getUserDetails", {
                    email: _user.email
                  });
                  if (extUser) {
                    const _extUser = JSON.parse(JSON.stringify(extUser));
                    localStorage.setItem("userEmail", _extUser.Email);
                    localStorage.setItem("username", _extUser.Name);
                    localStorage.setItem("scriptId", true);
                    // console.log("_extUser", _extUser);
                    let tenentInfo = [];
                    const results = [extUser];
                    if (results) {
                      let extendedInfo_stringify = JSON.stringify(results);
                      localStorage.setItem(
                        "Extand_Class",
                        extendedInfo_stringify
                      );
                      if (_extUser.TenantId) {
                        const obj = {
                          tenentId: _extUser.TenantId.objectId,
                          tenentName: _extUser.TenantId.TenantName || ""
                        };
                        localStorage.setItem("TenantId", obj.tenentId);
                        tenentInfo.push(obj);
                        dispatch(showTenant(obj.tenentName || ""));
                        localStorage.setItem(
                          "TenantName",
                          obj.tenentName || ""
                        );
                      }
                      localStorage.setItem("PageLanding", roleSetting.pageId);
                      localStorage.setItem("defaultmenuid", roleSetting.menuId);
                      localStorage.setItem("pageType", roleSetting.pageType);
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
                        navigate(redirectUrl);
                      }
                    }
                  }
                } catch (err) {
                  // const payload = {
                  //   sessionToken: sessionToken
                  // };
                  // setThirdpartyLoader(false);
                  // handleSubmitbtn(payload);

                  alert("ext user not exist.");
                  console.log("err in get extUser", err);
                }
              } else {
                alert("contracts_User role not exist");
              }
            } else {
              alert("contracts_User role not exist");
            }
          }
        } catch (err) {
          console.log("err in usergroups", err);
        }
      }
    } catch (err) {
      console.log("Err in me call", err);
    }
  };
  return <div>Verifying SSO....</div>;
};

export default SSOVerify;
