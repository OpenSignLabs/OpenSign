import { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import { useTranslation } from "react-i18next";
import { appInfo } from "../constant/appinfo";

const Header = ({ showSidebar, setIsMenu, isConsole }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [applogo, setAppLogo] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (width <= 768) {
      setIsMenu(false);
    }
  };
  useEffect(() => {
    initializeHead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function initializeHead() {
      const applogo = await getAppLogo();
      if (applogo?.logo) {
        setAppLogo(applogo?.logo);
      } else {
        const logo = localStorage.getItem("appLogo") || appInfo.applogo;
        setAppLogo(logo);
      }
  }

  const closeDropdown = async () => {
    setIsOpen(false);
    try {
      await Parse.User.logOut();
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


  useEffect(() => {
    const updateLogoForTheme = () => {
      const isDarkMode =
        document.documentElement.getAttribute("data-theme") === "opensigndark";
      const logo = isDarkMode
        ? "/static/js/assets/images/logo-dark.png" // Path to the dark mode logo
        : appInfo.applogo; // Use current logo for light mode
      if (applogo !== logo) {
        setAppLogo(logo);
      }
    };

    // Set the logo immediately based on the current theme
    updateLogoForTheme();

    const observer = new MutationObserver(() => {
      updateLogoForTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, [applogo]);

  return (
    <div>
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
            {applogo && (
              <img
                className="object-contain h-full w-auto"
                src={applogo}
                alt="logo"
              />
            )}
          </div>
        </div>
        <div id="profile-menu" className="flex-none gap-2">
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
              role="button"
              tabIndex="0"
              className="cursor-pointer text-base-content text-sm"
            >
              {username && username}
            </div>
          )}
          <div
            className="op-dropdown op-dropdown-open op-dropdown-end"
            id="profile-menu"
          >
            <div
              tabIndex={0}
              role="button"
              onClick={toggleDropdown}
              className="op-btn op-btn-ghost op-btn-xs w-[10px] h-[20px] hover:bg-transparent"
            >
              <i className="fa-light fa-angle-down text-base-content"></i>
            </div>
            <ul
              tabIndex={0}
              className={`mt-3 z-[1] p-2 shadow op-dropdown-open op-menu op-menu-sm op-dropdown-content text-base-content bg-base-100 rounded-box w-56 ${
                isOpen ? "" : "hidden"
              }`}
            >
              {!isConsole && (
                <>
                    <li
                      onClick={() =>
                        openInNewTab("https://docs.opensignlabs.com")
                      }
                    >
                      <span>
                        <i className="fa-light fa-book"></i> {t("docs")}
                      </span>
                    </li>
                  <li
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <span>
                      <i className="fa-light fa-user"></i> {t("profile")}
                    </span>
                  </li>
                    <li
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/changepassword");
                      }}
                    >
                      <span>
                        <i className="fa-light fa-lock"></i>{" "}
                        {t("change-password")}
                      </span>
                    </li>
                  <li
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/verify-document");
                    }}
                  >
                    <span>
                      <i className="fa-light fa-check-square"></i>{" "}
                      {t("verify-document")}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="fa-light fa-moon"></i>
                      {t("dark-mode")}
                      <span className="text-[10px] font-semibold bg-base-300 text-base-content px-1 rounded-md">
                        BETA
                      </span>
                      <ThemeToggle />
                    </span>
                  </li>
                </>
              )}
              <li onClick={closeDropdown}>
                <span>
                  <i className="fa-light fa-arrow-right-from-bracket"></i>{" "}
                  {t("log-out")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
