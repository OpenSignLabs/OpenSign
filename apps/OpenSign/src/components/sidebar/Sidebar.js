import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "./SocialMedia";
import dp from "../../assets/images/dp.png";
import sidebarList from "../../json/menuJson";
import { useNavigate } from "react-router-dom";
import { isEnableSubscription } from "../../constant/const";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("Extand_Class")
    ? JSON.parse(localStorage.getItem("Extand_Class"))?.[0]?.Company
    : "";

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        // console.log("extClass ", extClass);
        let userRole = "contracts_User";
        if (extClass && extClass.length > 0) {
          userRole = extClass[0].UserRole;
        }
        if (
          userRole === "contracts_Admin" ||
          userRole === "contracts_OrgAdmin"
        ) {
          const newSidebarList = sidebarList.map((item) => {
            if (item.title === "Settings") {
              // Make a shallow copy of the item
              const newItem = { ...item };
              if (isEnableSubscription) {
                newItem.children = [
                  ...newItem.children,
                  {
                    icon: "fa-light fa-building-memo",
                    title: "Teams",
                    target: "_self",
                    pageType: "",
                    description: "",
                    objectId: "teams"
                  },
                  {
                    icon: "fa-light fa-users fa-fw",
                    title: "Users",
                    target: "_self",
                    pageType: "",
                    description: "",
                    objectId: "users"
                  }
                ];
              } else {
                const arr = newItem.children.slice(1, 2);
                newItem.children = [
                  ...arr,
                  {
                    icon: "fa-light fa-users fa-fw",
                    title: "Users",
                    target: "_self",
                    pageType: "",
                    description: "",
                    objectId: "users"
                  }
                ];
              }
              return newItem;
            }
            return item;
          });
          setmenuList(newSidebarList);
        } else {
          setmenuList(sidebarList);
        }
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    setSubmenuOpen({ [title]: !submenuOpen[title] });
  };

  const handleMenuItem = () => {
    closeSidebar();
    setSubmenuOpen({});
  };
  const handleProfile = () => {
    navigate("/profile");
  };
  return (
    <aside
      className={`absolute lg:relative bg-base-100 h-screen overflow-y-auto transition-all z-[500] shadow-lg hide-scrollbar
     ${isOpen ? "w-full md:w-[300px]" : "w-0"}`}
    >
      <div className="flex px-2 py-3 gap-2 items-center shadow-md">
        <div
          onClick={() => handleProfile()}
          className="w-[75px] h-[75px] rounded-full ring-[2px] ring-offset-2 ring-gray-400 overflow-hidden cursor-pointer"
        >
          <img
            className="w-full h-full object-contain"
            src={image}
            alt="Profile"
          />
        </div>
        <div>
          <p
            onClick={handleProfile}
            className="text-[14px] font-bold text-base-content cursor-pointer"
          >
            {username}
          </p>
          <p
            onClick={handleProfile}
            className={`cursor-pointer text-[12px] text-base-content ${
              tenantname ? "mt-2" : ""
            }`}
          >
            {tenantname}
          </p>
        </div>
      </div>
      <nav
        className="op-menu op-menu-sm"
        aria-label="OpenSign Sidebar Navigation"
      >
        <ul
          className="text-sm"
          role="menubar"
          aria-label="OpenSign Sidebar Navigation"
        >
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
      <footer className="mt-4 flex justify-center items-center text-[25px] text-base-content gap-3">
        <SocialMedia />
      </footer>
    </aside>
  );
};

export default Sidebar;
