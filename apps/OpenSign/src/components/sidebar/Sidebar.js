import React, { useState, useEffect } from "react";

import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "./SocialMedia";

import Parse from "parse";
import dp from "../../assets/images/dp.png";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  let username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("TenantName");

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const menuItem = async () => {
    try {
      var sideMenu = Parse.Object.extend("w_menu");
      var query = new Parse.Query(sideMenu);
      query.equalTo("objectId", localStorage.getItem("defaultmenuid"));
      const results = await query.first();
      const resultjson = results.toJSON();
      let result = resultjson;
      setmenuList(result.menuItems);
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
  return (
    <aside
      className={`absolute md:relative bg-base-100 h-screen overflow-y-auto transition-all z-40 hide-scrollbar
     ${isOpen ? "w-full md:w-[300px]" : "w-0"}`}
    >
      <div className="flex px-2 py-3 gap-2 items-center shadow-md">
        <div className="w-[75px] h-[75px] rounded-full ring-[2px] ring-offset-2 ring-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-contain"
            src={image}
            alt="Profile"
          />
        </div>
        <div>
          <p className="text-[14px] font-bold">{username}</p>
          <p className={`text-[12px] ${tenantname ? "mt-2" : ""}`}>
            {tenantname}
          </p>
        </div>
      </div>
      <nav aria-label="OpenSign Sidebar Navigation">
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
