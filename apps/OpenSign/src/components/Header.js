import React, { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import { useNavigate } from "react-router-dom";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import {
  checkIsSubscribed,
  checkIsSubscribedTeam,
  getAppLogo,
  openInNewTab
} from "../constant/Utils";
import { isEnableSubscription, isStaging } from "../constant/const";

const Header = ({ showSidebar }) => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  let username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isTeam, setIsTeam] = useState(false);
  const [applogo, setAppLogo] = useState(
    localStorage.getItem("appLogo") || " "
  );

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
      const getIsTeam = await checkIsSubscribedTeam();
      if (getIsSubscribe) {
        const applogo = await getAppLogo();
        if (applogo?.logo) {
          setAppLogo(applogo?.logo);
        } else {
          setAppLogo(localStorage.getItem("appLogo") || "");
        }
      }
      setIsPro(getIsSubscribe);
      setIsTeam(getIsTeam);
      setIsSubscribe(getIsSubscribe);
    }
  }

  const closeDropdown = () => {
    setIsOpen(false);
    if (Parse?.User?.current()) {
      try {
        Parse.User.logOut();
      } catch (err) {
        console.log("Err", err);
      }
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
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
  const handleConsoleRedirect = () => {
    if (isStaging) {
      window.open(" https://staging-console.opensignlabs.com/");
    } else {
      window.open("https://console.opensignlabs.com/");
    }
  };
  return (
    <div className="op-navbar bg-base-100 shadow">
      <div className="flex-none">
        <button
          className="op-btn op-btn-square op-btn-ghost focus:outline-none hover:bg-transparent op-btn-sm no-animation"
          onClick={showSidebar}
        >
          <i className="fa-light fa-bars text-xl text-base-content"></i>
        </button>
      </div>
      <div className="flex-1 ml-2">
        <div className="h-[25px] md:h-[40px] w-auto overflow-hidden">
          <img
            className="object-contain h-full w-auto"
            src={applogo}
            alt="img"
          />
        </div>
      </div>
      <div id="profile-menu" className="flex-none gap-2">
        {!isSubscribe && (
          <div>
            <button
              className="text-xs md:text-sm shadow op-btn op-btn-outline op-btn-sm md:op-btn-md op-btn-accent"
              onClick={() => navigate("/subscription")}
            >
              Upgrade Now
            </button>
          </div>
        )}
        {!isTeam && isPro && (
          <div className="w-[35px] h-[35px] bg-white rounded-full ring-[1px] ring-offset-2 ring-[#002862] text-[#002862] overflow-hidden font-semibold flex items-center justify-center">
            PRO
          </div>
        )}
        {isTeam && (
          <div className="w-[35px] h-[35px] bg-white rounded-full ring-[1px] text-[13px] ring-offset-2 ring-[#002862] text-[#002862] overflow-hidden font-semibold flex items-center justify-center">
            TEAM
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
          <div
            onClick={toggleDropdown}
            className="cursor-pointer text-base-content text-sm"
          >
            {username && username}
          </div>
        )}
        <div className="op-dropdown op-dropdown-end" id="profile-menu">
          <div
            tabIndex={0}
            role="button"
            className="op-btn op-btn-ghost op-btn-xs w-[10px] h-[20px] hover:bg-transparent"
          >
            <i
              tabIndex={0}
              role="button"
              onClick={toggleDropdown}
              className="fa-light fa-angle-down text-base-content"
            ></i>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow op-menu op-menu-sm op-dropdown-content text-base-content bg-base-100 rounded-box w-52"
          >
            <li onClick={() => openInNewTab("https://docs.opensignlabs.com")}>
              <span>
                <i className="fa-light fa-book"></i> Docs
              </span>
            </li>
            <li
              onClick={() => {
                setIsOpen(false);
                navigate("/profile");
              }}
            >
              <span>
                <i className="fa-light fa-user"></i> Profile
              </span>
            </li>
            <li
              onClick={() => {
                setIsOpen(false);
                navigate("/changepassword");
              }}
            >
              <span>
                <i className="fa-light fa-lock"></i> Change Password
              </span>
            </li>
            <li
              onClick={() => {
                handleConsoleRedirect();
              }}
            >
              <span>
                <i className="fa-light fa-id-card"></i> Console
              </span>
            </li>
            <li onClick={closeDropdown}>
              <span>
                <i className="fa-light fa-arrow-right-from-bracket"></i> Log Out
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
