import React, { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import { useNavigate } from "react-router-dom";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import { checkIsSubscribed, openInNewTab } from "../constant/Utils";
import { isEnableSubscription } from "../constant/const";

const Header = ({ showSidebar }) => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  let applogo = localStorage.getItem("appLogo") || "";
  let username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;

  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function checkSubscription() {
    if (isEnableSubscription) {
      const getIsSubscribe = await checkIsSubscribed();
      setIsSubscribe(getIsSubscribe);
    }
  }
  const closeDropdown = () => {
    setIsOpen(false);
    Parse.User.logOut();
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

    navigate("/");
  };

  //handle to close profile drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="flex flex-row justify-between items-center gap-x-3 md:gap-x-4 bg-white md:px-4 px-2 shadow h-[50px] md:w-full ">
      <button
        className="cursor-pointer focus:outline-none"
        onClick={showSidebar}
      >
        <i className={`fa-solid fa-bars text-xl `}></i>
      </button>
      <div className="flex-1">
        <div className="h-[25px] md:h-[40px] w-auto overflow-hidden">
          <img
            className="object-contain h-full w-auto"
            src={applogo}
            alt="img"
          />
        </div>
      </div>
      <div
        id="profile-menu"
        className="flex justify-between items-center gap-x-3"
      >
        {!isSubscribe && (
          <div>
            <button
              className="text-xs bg-[#002864] p-2 text-white rounded shadow"
              onClick={() => navigate("/subscription")}
            >
              Upgrade Now
            </button>
          </div>
        )}
        <div>
          <FullScreenButton />
        </div>
        {width >= 768 && (
          <div
            onClick={toggleDropdown}
            className="cursor-pointer w-[35px] h-[35px] rounded-full ring-[1px] ring-offset-2 ring-gray-400 overflow-hidden"
          >
            <img
              className="w-[35px] h-[35px] object-contain"
              src={image}
              alt="img"
            />
          </div>
        )}
        {width >= 768 && (
          <div onClick={toggleDropdown} className="cursor-pointer text-sm">
            {username && username}
          </div>
        )}
        <div className="relative">
          <div className="cursor-pointer">
            <i onClick={toggleDropdown} className="fa-solid fa-angle-down"></i>
          </div>
          <div
            className={`dropdown absolute text-sm text-gray-700 font-light right-0 mt-4 p-1 w-48 bg-white border rounded-lg shadow-lg z-10 ${
              isOpen ? "block" : "hidden"
            }`}
          >
            <ul>
              <li
                className="hover:bg-gray-100 rounded-t-lg py-1 px-2 cursor-pointer font-normal"
                onClick={() => openInNewTab("https://docs.opensignlabs.com")}
              >
                <i className="fa-solid fa-book"></i> Docs
              </li>
              <li
                className="hover:bg-gray-100 py-1 px-2 cursor-pointer font-normal"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile");
                }}
              >
                <i className="fa-regular fa-user"></i> Profile
              </li>
              <li
                className="hover:bg-gray-100 py-1 px-2 cursor-pointer font-normal"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/changepassword");
                }}
              >
                <i className="fa-solid fa-lock"></i> Change Password
              </li>
              <li
                className="hover:bg-gray-100 rounded-b-lg py-1 px-2 cursor-pointer font-normal"
                onClick={closeDropdown}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
