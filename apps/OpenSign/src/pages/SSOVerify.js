import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Parse from "parse";
import { appInfo } from "../constant/appinfo";
import { isEnableSubscription } from "../constant/const";
import { fetchSubscription } from "../constant/Utils";
import { useDispatch } from "react-redux";
import { showTenant } from "../redux/reducers/ShowTenant";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const SSOVerify = () => {
  const { t } = useTranslation();
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
  const handlePaidRoute = () => {
    navigate("/subscription");
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
          alert(t("something-went-wrong-mssg"));
          setIsLoader(false);
        }
      } else {
        localStorage.removeItem("accesstoken");
        alert(t("server-error"));
        setIsLoader(false);
      }
    } else {
      alert(t("filed-required-correctly"));
      setIsLoader(false);
    }
  };
  // `thirdpartyLoginfn` is used to save necessary parameters locally for the logged-in user
  const thirdpartyLoginfn = async (sessionToken) => {
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
                      location?.state?.from ||
                      `/${menu.pageType}/${menu.pageId}`;
                    const _role = _currentRole.replace("contracts_", "");
                    localStorage.setItem("_user_role", _role);
                    const extUser_stringify = JSON.stringify([extUser]);
                    localStorage.setItem("Extand_Class", extUser_stringify);
                    const _extUser = JSON.parse(JSON.stringify(extUser));
                    localStorage.setItem("userEmail", _extUser.Email);
                    localStorage.setItem("username", _extUser.Name);
                    localStorage.setItem("scriptId", true);
                    if (_extUser.TenantId) {
                      const tenant = {
                        Id: _extUser?.TenantId?.objectId || "",
                        Name: _extUser?.TenantId?.TenantName || ""
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
                          handlePaidRoute(plan);
                        }
                      } else {
                        handlePaidRoute(plan);
                      }
                    } else {
                      navigate(redirectUrl);
                    }
                  }
                } else {
                  alert(t("do-not-access-contact-admin"));
                  setMessage(t("do-not-access-contact-admin"));
                }
              }
            })
            .catch((error) => {
              console.error("Err in fetch extuser", error);
              alert(t("user-not-exist"));
              setMessage(t("user-not-exist"));
            });
        } catch (err) {
          console.log("err in getuserdetails", err);
        }
      }
    } catch (err) {
      console.log("Err in become method", err);
    }
  };
  // `handleCloseModal` is triggered when the user wants to close the new user flow modal
  const handleCloseModal = async () => {
    setIsModal(false);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
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
        {message === "Verifying SSO..." && <Loader />}
        <div className="text-base-content">{message}</div>
      </div>
      <ModalUi isOpen={isModal} title="Additional Info" showClose={false}>
        <div className="relative">
          {isLoader && (
            <div className="absolute w-full h-full bg-black bg-opacity-25 flex justify-center items-center">
              <Loader />
            </div>
          )}
          <form
            className="px-4 py-3 text-base-content"
            onSubmit={handleSubmitbtn}
          >
            <div className="mb-3">
              <label htmlFor="Company" className="block text-xs font-semibold">
                {t("phone")} <span className="text-[13px] text-[red]">*</span>
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
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
              <p className="text-[10px] text-[red] ml-2">
                {!validateInput(userDetails.phone) && "Invalid phone value"}
              </p>
            </div>
            <div className="mb-3">
              <label htmlFor="Company" className="block text-xs font-semibold">
                {t("company")} <span className="text-[13px] text-[red]">*</span>
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
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="JobTitle" className="block text-xs font-semibold">
                {t("job-title")}
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
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="mt-4">
              <button type="submit" className="op-btn op-btn-primary">
                {t("login")}
              </button>
              <button
                type="button"
                className="op-btn op-btn-ghost ml-2"
                onClick={handleCloseModal}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </ModalUi>
    </div>
  );
};

export default SSOVerify;
