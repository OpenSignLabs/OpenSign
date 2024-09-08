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
      Parse?.User?.logOut();
    } catch (err) {
      console.log("Err", err);
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
          <div className="block my-2">
            <div className="flex flex-col justify-center items-center w-full relative">
              <button
                className="md:hidden op-btn op-btn-primary op-btn-sm h-[40px] w-[250px] shadow-lg"
                onClick={() => handleLogout()}
              >
                Log out
              </button>
              <div
                role="tablist"
                className="op-tabs op-tabs-boxed bg-base-100 my-2 shadow-lg transition-all"
              >
                <a
                  onClick={() => setYearlyVisible(false)}
                  role="tab"
                  className={`${!yearlyVisible ? "op-tab-active" : ""} op-tab`}
                >
                  {t("monthly")}
                </a>
                <a
                  onClick={() => setYearlyVisible(true)}
                  role="tab"
                  className={`${yearlyVisible ? "op-tab-active" : ""} op-tab`}
                >
                  {t("yearly-upto")}
                </a>
              </div>
              <ul className="op-card flex flex-col md:flex-row h-full bg-base-100 justify-center shadow-lg">
                <button
                  className="hidden md:block -top-12 right-1 absolute w-[150px] h-[40px] op-btn op-btn-primary op-btn-sm shadow-lg"
                  onClick={() => handleLogout()}
                >
                  {t("log-out")}
                </button>
                {plansArr.map((item) => (
                  <li
                    className="flex flex-col text-center border-collapse border-[1px] border-gray-300 max-w-[250px]"
                    key={item.planName}
                  >
                    <div className="p-2 flex flex-col justify-center items-center max-h-[310px]">
                      <h3 className="text-[#002862] uppercase">
                        {item.planName}
                      </h3>
                      <div className="w-[120px] h-[120px] overflow-hidden">
                        <img
                          className="w-full h-full object-contain"
                          src={require(`../assets/images/${item?.img}`)}
                          alt="img"
                        />
                      </div>
                      <div>
                        <span className="text-3xl">
                          {item.currency && <small>{item.currency}</small>}
                          {yearlyVisible ? (
                            <>
                              {item?.yearlyPrice.includes("<") ? (
                                <div
                                  className="inline-block"
                                  dangerouslySetInnerHTML={{
                                    __html: item?.yearlyPrice
                                  }}
                                />
                              ) : (
                                <span>{item?.yearlyPrice}</span>
                              )}
                            </>
                          ) : (
                            <>
                              {item?.monthlyPrice.includes("<") ? (
                                <div
                                  className="inline-block"
                                  dangerouslySetInnerHTML={{
                                    __html: item?.monthlyPrice
                                  }}
                                />
                              ) : (
                                <span>{item?.monthlyPrice}</span>
                              )}
                            </>
                          )}
                        </span>
                        <p className="font-semibold pt-2 text-sm">
                          {yearlyVisible
                            ? t("billed-yearly")
                            : t("billed-monthly")}
                        </p>
                        <div className="max-w-[250px] h-[40px] text-center text-sm my-2">
                          <div
                            style={{
                              textAlign: "center",
                              backgroundColor: item.subtitlecolor
                                ? item.subtitlecolor
                                : "white"
                            }}
                          >
                            {item.subtitle.includes("<") ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: item.subtitle
                                }}
                              />
                            ) : (
                              <span>{item.subtitle}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`${
                          item?.btn?.color ? item?.btn?.color : "op-btn-primary"
                        } w-full text-white py-2 op-btn uppercase hover:text-white cursor-pointer`}
                        onClick={() => handleFreePlan(item)}
                      >
                        {item?.btn?.text}
                      </button>
                    </div>
                    <hr className="w-full bg-gray-300 h-[0.5px]" />
                    <ul className="mx-1 p-3 text-left break-words text-sm list-none">
                      {!yearlyVisible &&
                        item.benefits.map((subitem, index) => (
                          <li style={listItemStyle} key={index} className="m-1">
                            <span className="relative">{subitem}</span>
                          </li>
                        ))}
                      {yearlyVisible &&
                        item?.yearlyBenefits?.map((subitem, index) => (
                          <li style={listItemStyle} key={index} className="m-1">
                            <span className="relative">{subitem}</span>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm flex justify-center items-center mt-3 mb-2">
              <hr className="border-[2px] border-gray-350 w-[20%]" />
              <span className="px-2 text-base-content cursor-default">or</span>
              <hr className="border-[2px] border-gray-350 w-[20%]" />
            </div>
            <div className="flex flex-col justify-center items-center">
              <h3 className="text-[#002862] mt-1 mb-2">
                {t("plansubscription-1")}
              </h3>
              <div
                className="op-btn op-btn-primary w-[200px]"
                onClick={() =>
                  openInNewTab("https://github.com/OpenSignLabs/OpenSign")
                }
              >
                {t("visit-github")}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PlanSubscriptions;
