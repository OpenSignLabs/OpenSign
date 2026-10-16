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
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../redux/reducers/sidebarReducer";
import { sessionStatus } from "../redux/reducers/userReducer";
import InlineMarkdown from "./InlineMarkdown";
import { resolveAnnouncementTranslation } from "../constant/announcement";

const Header = ({ isConsole, setIsLoggingOut }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const isSidebarVisible = useSelector((state) => state.sidebar.isOpen);
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [applogo, setAppLogo] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    closeSidebar();
  };
  const closeSidebar = () => {
    if (width && width <= 768) {
      dispatch(toggleSidebar(false));
    }
  };

  useEffect(() => {
    initializeHead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [width]);

  const showSidebar = () => {
    dispatch(toggleSidebar());
  };


  async function initializeHead() {
      const applogo = await getAppLogo();
      if (applogo?.logo) {
        setAppLogo(applogo?.logo);
      } else {
        const logo = localStorage.getItem("appLogo") || appInfo.applogo;
        setAppLogo(logo);
      }
  }
  const handleLogout = async () => {
    setIsOpen(false);
    setIsLoggingOut(true);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    } finally {
      dispatch(sessionStatus(true));
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");
    let favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("favicon", favicon);
    setIsLoggingOut(false);
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
    const updateThemeStatus = () => {
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "opensigndark";
      setIsDarkTheme(isDarkTheme);
    };
    updateThemeStatus();

    const observer = new MutationObserver(() => {
      updateThemeStatus();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="op-navbar os-navbar touch-none">
        <div className="os-navbar-leading">
          <div className="flex-none">
            <button
              type="button"
              aria-label={t("open-navigation")}
              aria-expanded={isSidebarVisible}
              className="os-menu-button op-btn op-btn-square op-btn-ghost hover:bg-transparent op-btn-sm no-animation"
              onClick={showSidebar}
            >
              <i className="fa-light fa-bars text-xl text-base-content"></i>
            </button>
          </div>
          <div className="os-shell-brand flex-1 min-w-0 ml-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/35KBoSgoAK")}
              className="os-shell-logo w-auto overflow-hidden cursor-pointer border-0 bg-transparent p-0"
            >
              {applogo && (
                <img
                  className="object-contain h-full w-auto"
                  src={
                        applogo
                  }
                  alt="logo"
                />
              )}
            </button>
          </div>
        </div>
        <div id="profile-menu" className="os-shell-actions flex-none gap-2">
          <div>
              <FullScreenButton />
          </div>
          {width >= 768 && (
            <button
              type="button"
              aria-label={t("profile")}
              onClick={toggleDropdown}
              className="cursor-pointer w-[44px] h-[44px] rounded-full ring-[1px] ring-offset-2 ring-gray-400 overflow-hidden border-0 bg-transparent p-0"
            >
              <img
                className="w-[44px] h-[44px] object-contain"
                src={image}
                alt="img"
              />
            </button>
          )}
          {width >= 768 && (
            <button
              type="button"
              aria-label={t("open-profile-menu")}
              onClick={toggleDropdown}
              className="os-profile-trigger cursor-pointer border-0 bg-transparent p-2 text-left text-sm"
            >
              {username && username}
            </button>
          )}
          <div className="op-dropdown op-dropdown-open op-dropdown-end">
            <button
              type="button"
              aria-label={t("open-profile-menu")}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              aria-controls="profile-menu-list"
              onClick={toggleDropdown}
              className="op-btn op-btn-ghost op-btn-xs min-h-[44px] min-w-[44px] hover:bg-transparent"
            >
              <i className="fa-light fa-angle-down text-base-content"></i>
            </button>
            <ul
              id="profile-menu-list"
              role="menu"
              className={`mt-4 z-[1] p-2 shadow op-dropdown-open op-menu op-menu-sm op-dropdown-content text-base-content bg-base-100 rounded-box w-56 ${
                isOpen ? "" : "hidden"
              }`}
            >
              {!isConsole && (
                <>
                    <li>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() =>
                          openInNewTab(
                            getDeploymentLink(
                              "docs",
                              "https://docs.opensignlabs.com"
                            )
                          )
                        }
                      >
                        <i className="fa-light fa-book"></i> {t("docs")}
                      </button>
                    </li>
                  <li>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <i className="fa-light fa-user"></i> {t("profile")}
                    </button>
                  </li>
                    <li>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/changepassword");
                        }}
                      >
                        <i className="fa-light fa-lock"></i>{" "}
                        {t("change-password")}
                      </button>
                    </li>
                  <li>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/verify-document");
                      }}
                    >
                      <i className="fa-light fa-check-square"></i>{" "}
                      {t("verify-document")}
                    </button>
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
              <li>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={handleLogout}
                >
                  <i className="fa-light fa-arrow-right-from-bracket"></i>{" "}
                  {t("log-out")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
