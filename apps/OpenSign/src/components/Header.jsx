import { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import { BrandMark } from "./BrandHero";
import { bs } from "../theme/md3Theme";
import FullScreenButton from "./FullScreenButton";
import ThemeToggle from "./ThemeToggle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
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
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/reducers/sidebarReducer";
import { sessionStatus } from "../redux/reducers/userReducer";

const Header = ({ isConsole, setIsLoggingOut }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [applogo, setAppLogo] = useState("");
  const [isCustomLogo, setIsCustomLogo] = useState(false);

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
        setIsCustomLogo(applogo.logo !== appInfo.applogo);
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


  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minHeight: 60,
          px: { xs: 1, md: 2 },
          bgcolor: bs.ink2,
          color: "#fff",
          boxShadow: "0 1px 0 rgba(255,255,255,0.08)",
          touchAction: "none"
        }}
      >
        <Box sx={{ flex: "none" }}>
          <IconButton
            onClick={showSidebar}
            size="small"
            aria-label="Toggle navigation"
            sx={{
              color: "rgba(255,255,255,0.78)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            <i className="fa-light fa-bars" style={{ fontSize: "1.25rem" }}></i>
          </IconButton>
        </Box>
        <Box
          sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1.25 }}
        >
          <BrandMark
            label="Open BetterSign home"
            onClick={() => navigate("/dashboard/35KBoSgoAK")}
          />
          {isCustomLogo && (
            <Box
              sx={{
                height: { xs: "22px", md: "32px" },
                ml: 1,
                pl: 1.5,
                borderLeft: "1px solid rgba(255,255,255,0.16)",
                display: { xs: "none", md: "block" }
              }}
            >
              <Box
                component="img"
                sx={{ objectFit: "contain", height: "100%", width: "auto" }}
                src={applogo}
                alt="logo"
              />
            </Box>
          )}
        </Box>
        <Box
          id="profile-menu"
          sx={{ flex: "none", display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box>
            <FullScreenButton />
          </Box>
          {width >= 768 && (
            <Avatar
              onClick={toggleDropdown}
              src={image}
              alt="img"
              sx={{
                width: 35,
                height: 35,
                cursor: "pointer",
                border: "2px solid rgba(127,240,207,0.4)"
              }}
            />
          )}
          {width >= 768 && (
            <Box
              onClick={toggleDropdown}
              role="button"
              tabIndex="0"
              sx={{
                cursor: "pointer",
                color: "rgba(255,255,255,0.86)",
                fontSize: "0.875rem",
                fontWeight: 600
              }}
            >
              {username && username}
            </Box>
          )}
          <Box sx={{ position: "relative" }} id="profile-menu">
            <IconButton
              tabIndex={0}
              role="button"
              onClick={toggleDropdown}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.78)",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }
              }}
            >
              <i className="fa-light fa-angle-down"></i>
            </IconButton>
            {isOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  right: 0,
                  mt: 2,
                  zIndex: 1,
                  width: 224,
                  borderRadius: "14px",
                  border: 1,
                  borderColor: "divider",
                  boxShadow: bs.shadow,
                  color: "text.primary"
                }}
              >
                <MenuList dense>
                  {!isConsole && (
                    <>
                      <MenuItem
                        onClick={() =>
                          openInNewTab("https://docs.opensignlabs.com")
                        }
                      >
                        <i className="fa-light fa-book"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("docs")}
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <i className="fa-light fa-user"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("profile")}
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/verify-document");
                        }}
                      >
                        <i className="fa-light fa-check-square"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("verify-document")}
                        </Box>
                      </MenuItem>
                      <MenuItem disableRipple sx={{ gap: 1 }}>
                        <i className="fa-light fa-moon"></i>
                        <Box component="span">{t("dark-mode")}</Box>
                        <Chip
                          label="BETA"
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "10px",
                            fontWeight: 600,
                            bgcolor: "surface.containerHighest",
                            color: "text.primary"
                          }}
                        />
                        <ThemeToggle />
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <i className="fa-light fa-arrow-right-from-bracket"></i>
                    <Box component="span" sx={{ ml: 1 }}>
                      {t("log-out")}
                    </Box>
                  </MenuItem>
                </MenuList>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
