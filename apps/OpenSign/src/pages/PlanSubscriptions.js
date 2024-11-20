import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkmark from "../assets/images/checkmark.png";
import plansArr from "../json/plansArr";
import Title from "../components/Title";
import Parse from "parse";
import { openInNewTab, saveLanguageInLocal } from "../constant/Utils";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
const listItemStyle = {
  paddingLeft: "20px", // Add padding to create space for the image
  backgroundImage: `url(${checkmark})`, // Set your image as the list style image
  backgroundPosition: "left",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px 16px" // Adjust the size of the image
};

const PlanSubscriptions = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [yearlyVisible, setYearlyVisible] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  const extUser =
    localStorage.getItem("Extand_Class") &&
    JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
  const user = {
    name: extUser?.Name,
    email: extUser?.Email,
    company: extUser?.Company,
    phone: extUser?.Phone
  };
  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || user;
  // console.log("userDetails ", userDetails);
  const fullname =
    userDetails && userDetails.name ? userDetails.name.split(" ") : "";
  const firstname = fullname?.[0]
    ? "first_name=" + encodeURIComponent(fullname?.[0])
    : "";
  const lastname = fullname?.[1]
    ? "&last_name=" + encodeURIComponent(fullname?.[1])
    : "";
  const name = firstname ? firstname + lastname : "";
  const email =
    userDetails && userDetails.email
      ? "&email=" + encodeURIComponent(userDetails.email)
      : "";
  const company =
    userDetails && userDetails.company
      ? "&company_name=" + encodeURIComponent(userDetails.company)
      : "";
  const phone =
    userDetails && userDetails.phone
      ? "&mobile=" + encodeURIComponent(userDetails.phone)
      : "";

  useEffect(() => {
    setIsLoader(false);
    detectLanguage();
    // eslint-disable-next-line
  }, []);
  const detectLanguage = () => {
    const detectedLanguage = i18n.language || "en";
    i18n.changeLanguage(detectedLanguage);
    localStorage.setItem("i18nextLng", detectedLanguage);
  };

  const handleFreePlan = async (item) => {
    if (item.url) {
      const code = yearlyVisible ? item.code.yearly : item.code.monthly;
      const allowedUsers =
        localStorage.getItem("allowedUsers") &&
        localStorage.getItem("allowedUsers") > 0
          ? localStorage.getItem("allowedUsers") - 1
          : "";
      const teamperiod = {
        "team-weekly": "monthly",
        "team-yearly": "yearly",
        "teams-monthly": "monthly",
        "teams-yearly": "yearly"
      };
      const period = teamperiod[code] || "";

      const quantity =
        allowedUsers && period
          ? `addon_code%5B0%5D=extra-teams-users-${period}&addon_quantity%5B0%5D=${allowedUsers}&`
          : "";

      const details =
        "?shipping_country_code=US&billing_country_code=US&billing_state_code=CA&" +
        quantity +
        name +
        email +
        company +
        phone;
      const url = yearlyVisible ? item.yearlyUrl + details : item.url + details;
      if (user) {
        localStorage.setItem("userDetails", JSON.stringify(user));
      }
      openInNewTab(url, item?.target);
    } else {
      setIsLoader(true);
      try {
        const params = { userId: Parse.User.current().id };
        const res = await Parse.Cloud.run("freesubscription", params);
        if (res.status === "success" && res.result === "already subscribed!") {
          setIsLoader(false);
          alert(t("subscribed-alert"));
        } else if (res.status === "success") {
          setIsLoader(false);
          navigate("/");
        } else if (res.status === "error") {
          setIsLoader(false);
          alert(res.result);
        }
      } catch (err) {
        setIsLoader(false);
        console.log("err in free subscribe", err.message);
        alert(t("something-went-wrong-mssg"));
      }
    }
  };
  const handleLogout = async () => {
    try {
      await Parse?.User?.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
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

    navigate("/");
  };
  return (
    <>
      <Title title={"Subscriptions"} />
      {isLoader ? (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      ) : (
        <div className="overflow-y-auto max-h-full">
          <div className="my-2">
            <div className="flex flex-col justify-center items-center w-full">
             
                <button
                  className=" md:block -top-12 right-1 w-[150px] h-[40px] op-btn op-btn-primary op-btn-sm shadow-lg"
                  onClick={() => handleLogout()}
                >
                  {t("log-out")}
                </button>
              
              <div className="card" style={{padding: "50px", margin: "20px", borderRadius: "6px"}}>
                <p>Please contact Effi support team to active your account.</p>
              </div>
            </div>
          
          </div>
        </div>
      )}
    </>
  );
};
export default PlanSubscriptions;
