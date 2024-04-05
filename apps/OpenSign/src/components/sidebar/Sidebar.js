import React, { useState, useEffect } from "react";

import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "./SocialMedia";

import Parse from "parse";
import dp from "../../assets/images/dp.png";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [menuList, setmenuList] = useState([]);
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

  return (
    <aside
      className={`bg-white text-[#444] h-screen w-full md:w-[300px] overflow-y-auto transform transition-transform z-40 md:translate-x-0
      ${isOpen ? "translate-x-0 block" : "-translate-x-full hidden"}`}
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
                closeSidebar={closeSidebar}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
              />
            )
          )}
        </ul>
      </nav>
      <footer className="mt-4 flex justify-center items-center text-[25px] text-black gap-3">
        <SocialMedia />
      </footer>
    </aside>
  );
};

export default Sidebar;
