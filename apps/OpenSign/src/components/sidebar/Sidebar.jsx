import { useState, useEffect } from "react";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "../SocialMedia";
import dp from "../../assets/images/dp.png";
import sidebarList, { subSetting } from "../../json/menuJson";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useWindowSize } from "../../hook/useWindowSize";
import {
  setSelectedMenu,
  toggleSidebar
} from "../../redux/reducers/sidebarReducer";
import { getSidebarNavigationLabel } from "../../constant/brandPresentation";

const Sidebar = () => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const sidebarNavigationLabel = getSidebarNavigationLabel();
  const tenantname = localStorage.getItem("Extand_Class")
    ? JSON.parse(localStorage.getItem("Extand_Class"))?.[0]?.Company
    : "";

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const closeSidebar = () => {
    dispatch(setSelectedMenu(true));
    if (width <= 1023) {
      dispatch(toggleSidebar(false));
    }
  };

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        const userRole = extClass?.[0]?.UserRole || "contracts_User";
        const isAdmin =
          userRole === "contracts_Admin" || userRole === "contracts_OrgAdmin";
        const newSidebarList = sidebarList.map((item) => {
          if (item.title !== "Settings") return item;
          const newItem = { ...item };
          const baseChildren = isAdmin ? subSetting : subSetting?.slice(0, 1);
            const mysignature = newItem.children.slice(0, 1);
            newItem.children = [...mysignature, ...baseChildren];
          return newItem;
        });
        setmenuList(newSidebarList);
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    dispatch(setSelectedMenu(false));
    setSubmenuOpen((previous) => ({ [title]: !previous[title] }));
  };

  const handleMenuItem = () => {
    dispatch(setSelectedMenu(true));
    closeSidebar();
    setSubmenuOpen({});
  };
  const handleProfile = () => {
    closeSidebar();
    navigate("/profile");
  };
  return (
    <aside
      className={`os-sidebar os-shell-sidebar absolute inset-y-0 lg:relative overflow-y-auto transition-all z-[500] shadow-lg hide-scrollbar
     ${isOpen ? "w-full md:w-64" : "w-0"}`}
    >
      <div className="os-sidebar-identity flex px-2 py-3 gap-2 items-center shadow-md">
        <button
          type="button"
          onClick={() => handleProfile()}
          aria-label={t("profile")}
          className="os-sidebar-avatar"
        >
          <img className="os-sidebar-avatar-image" src={image} alt="Profile" />
        </button>
        <div className="os-sidebar-identity-info">
          <button
            type="button"
            onClick={handleProfile}
            className="os-sidebar-identity-button os-sidebar-identity-name"
          >
            {username}
          </button>
          <button
            type="button"
            onClick={handleProfile}
            className="os-sidebar-identity-button os-sidebar-identity-tenant"
          >
            {tenantname}
          </button>
        </div>
      </div>
      <nav
        className="os-sidebar-nav op-menu op-menu-sm"
        aria-label={sidebarNavigationLabel}
        role="menubar"
      >
        <ul className="text-sm">
          {menuList.map((item) =>
            !item.children ? (
              <Menu
                key={item.title}
                item={item}
                isOpen={isOpen}
                closeSidebar={handleMenuItem}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
                toggleSubmenu={toggleSubmenu}
                submenuOpen={submenuOpen}
              />
            )
          )}
        </ul>
      </nav>
        <footer className="my-3 flex justify-center items-center text-[25px] text-base-content gap-3">
          <SocialMedia />
        </footer>
    </aside>
  );
};

export default Sidebar;
