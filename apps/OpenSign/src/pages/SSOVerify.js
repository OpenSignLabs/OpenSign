import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Parse from "parse";
import axios from "axios";
import { appInfo } from "../constant/appinfo";
import { isEnableSubscription } from "../constant/const";
import { fetchSubscription } from "../constant/Utils";
import { useDispatch } from "react-redux";
import { showTenant } from "../redux/reducers/ShowTenant";
import ModalUi from "../primitives/ModalUi";
import loader from "../assets/images/loader2.gif";

const SSOVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModal, setIsModal] = useState(false);
  const [message, setMessage] = useState("Verifying SSO...");
  const [isLoader, setIsLoader] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    Destination: "",
    Company: ""
  });

  useEffect(() => {
    linkUserWithSSO();
    // eslint-disable-next-line
  }, []);

  // `linkUserWithSSO` is used to sign in or sign up a user using an SSO code and check if the user is present in the extended class
  const linkUserWithSSO = async () => {
    const param = new URLSearchParams(location.search);
    const code = param?.get("code");
    const state = param?.get("state");
    try {
      // The `ssosign` cloud function is used to sign in or sign up a user
      const ssosign = await Parse.Cloud.run("ssosign", {
        code: code,
        email: state
      });
      localStorage.setItem("accesstoken", ssosign.sessiontoken);
      // `checkExtUser` checks if the user is present in the extended class `contracts_Users` and if not, initiates the new user flow
      await checkExtUser(ssosign);
    } catch (err) {
      setMessage("Error: " + err.message);
      console.log("err", err.message);
    }
  };
  const checkExtUser = async (ssosign) => {
    const params = { email: ssosign?.email };
    try {
      // `isextenduser` checks if the current user is present in the extended class
      const extRes = await Parse.Cloud.run("isextenduser", params);
      if (extRes?.isUserExist) {
        // `getUserDetails` retrieves the current user's details from the extended class
        const extRes = await Parse.Cloud.run("getUserDetails", params);
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
      } else {
        setIsModal(true);
        setUserDetails((prev) => ({
          ...prev,
          name: ssosign.name,
          email: ssosign.email,
          phone: ssosign?.phone || ""
        }));
      }
    } catch (err) {
      console.log("Err in isextenduser or getuserdetails cloud function", err);
      setMessage("Error: " + err.message);
    }
  };
  // `handleSubmitbtn` is used to create a user in the extended class
  const handleSubmitbtn = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    let phone;
    if (userDetails?.phone) {
      phone = validateInput(userDetails?.phone);
    } else {
      phone = true;
    }
    if (userDetails.Destination && userDetails.Company && phone) {
      const payload = { sessionToken: localStorage.getItem("accesstoken") };
      if (payload && payload.sessionToken) {
        const params = {
          userDetails: {
            name: userDetails.name,
            email: userDetails.email,
            phone: userDetails?.phone || "",
            role: "contracts_User",
            company: userDetails.Company,
            jobTitle: userDetails.Destination
          }
        };
        try {
          const userSignUp = await Parse.Cloud.run("usersignup", params);
          if (userSignUp && userSignUp.sessionToken) {
            const LocalUserDetails = params.userDetails;
            localStorage.setItem(
              "userDetails",
              JSON.stringify(LocalUserDetails)
            );
            await thirdpartyLoginfn(userSignUp.sessionToken);
            setIsLoader(false);
          } else {
            alert(userSignUp.message);
            setIsLoader(false);
          }
        } catch (err) {
          console.log("error in usersignup", err);
          localStorage.removeItem("accesstoken");
          alert("Something went wrong.");
          setIsLoader(false);
        }
      } else {
        localStorage.removeItem("accesstoken");
        alert("Internal server error.");
        setIsLoader(false);
      }
    } else {
      alert("Please fill required details correctly.");
      setIsLoader(false);
    }
  };
  // `thirdpartyLoginfn` is used to save necessary parameters locally for the logged-in user
  const thirdpartyLoginfn = async (sessionToken) => {
    const baseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    try {
      const validUser = await Parse.User.become(sessionToken);
      if (validUser) {
        localStorage.setItem("accesstoken", sessionToken);
        const _user = JSON.parse(JSON.stringify(validUser));
        localStorage.setItem("UserInformation", JSON.stringify(_user));
        if (_user.ProfilePic) {
          localStorage.setItem("profileImg", _user.ProfilePic);
        } else {
          localStorage.setItem("profileImg", "");
        }
        // Check extended class user role and tenentId
        try {
          let userRoles = [];
          const userSettings = appInfo.settings;
          //Get Current user roles
          const url = `${baseUrl}functions/UserGroups`;
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
            const excludeRoles = ["contracts_Guest", `contracts_appeditor`];
            const filteredRole = userRoles.filter(
              (x) => !excludeRoles.includes(x)
            );
            if (filteredRole?.length > 1) {
              console.log("user has two roles");
              // _currentRole = filteredRole.filter((x) => x === "contracts_User");
            } else {
              _currentRole = filteredRole?.[0] || "";
            }
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
                      localStorage.setItem("TenantName", obj.tenentName || "");
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
                alert("user not exist.");
                setMessage("Error: User not exist.");
                console.log("err in get extUser", err);
              }
            } else {
              alert("Role does not exists.");
              setMessage("Error: Role does not exists.");
            }
          } else {
            alert("Role does not exists.");
            setMessage("Error: Role does not exists.");
          }
        } catch (err) {
          console.log("err in usergroups", err);
        }
      }
    } catch (err) {
      console.log("Err in become method", err);
    }
  };
  // `handleCloseModal` is triggered when the user wants to close the new user flow modal
  const handleCloseModal = () => {
    setIsModal(false);
    if (Parse?.User?.current()) {
      Parse.User.logOut();
    }
  };

  // `validateInput` is used to verify the phone pattern
  function validateInput(input) {
    if (input) {
      const pattern = /^(?!.*\+.*\+)[\d+-]*$/;
      return pattern.test(input);
    } else {
      return true;
    }
  }
  return (
    <div>
      <div className="w-full h-screen flex flex-col justify-center items-center text-sm md:text-xl ">
        {message === "Verifying SSO..." && (
          <img alt="loader" src={loader} className="w-[80px] h-[80px]" />
        )}
        <div className="text-base-content">{message}</div>
      </div>
      <ModalUi isOpen={isModal} title="Additional Info" showClose={false}>
        <div className="relative">
          {isLoader && (
            <div className="absolute w-full h-full bg-black bg-opacity-25 flex justify-center items-center text-[45px] text-[#3dd3e0]">
              <div className="loader-37"></div>
            </div>
          )}
          <form
            className="px-4 py-3 text-base-content"
            onSubmit={handleSubmitbtn}
          >
            <div className="mb-3">
              <label htmlFor="Company" className="block text-xs font-semibold">
                Phone <span className="text-[13px] text-[red]">*</span>
              </label>
              <input
                type="tel"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                id="Phone"
                value={userDetails.phone}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    phone: e.target.value
                  })
                }
                disabled={isLoader}
                required
              />
              <p className="text-[10px] text-[red] ml-2">
                {!validateInput(userDetails.phone) && "Invalid phone value"}
              </p>
            </div>
            <div className="mb-3">
              <label htmlFor="Company" className="block text-xs font-semibold">
                Company <span className="text-[13px] text-[red]">*</span>
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
                disabled={isLoader}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="JobTitle" className="block text-xs font-semibold">
                Job Title
                <span className="text-[13px] text-[red]">*</span>
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
                disabled={isLoader}
                required
              />
            </div>
            <div className="mt-4">
              <button type="submit" className="op-btn op-btn-primary">
                Login
              </button>
              <button
                type="button"
                className="op-btn op-btn-ghost ml-2"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </ModalUi>
    </div>
  );
};

export default SSOVerify;
