import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import Submenu from "./SubMenu";
import dp from "../../assets/images/dp.png";
import Parse from "parse";
const Sidebar = ({ isOpen, closeSidebar }) => {
  let username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("TenantName");
  const [menuList, setmenuList] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);
  const menuItem = async () => {
    const parseBaseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    try {
      Parse.serverURL = parseBaseUrl;
      Parse.initialize(parseAppId);
      var sideMenu = Parse.Object.extend("w_menu");
      var query = new Parse.Query(sideMenu);
      query.equalTo("objectId", localStorage.getItem("defaultmenuid"));
      //	query.equalTo("objectId", "46X9z6lAv2");
      const results = await query.first();
      const resultjson = results.toJSON();
      // console.log("resultjson ", resultjson);
      let result = resultjson;
      setmenuList(result.menuItems);
    } catch (e) {
      console.error("Problem", e);
    }
  };

  return (
    <div
      className={`${
        isOpen ? "block" : "hidden"
      } bg-white text-[#444] h-screen w-full md:w-[300px] overflow-y-auto transform transition-transform z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex px-2 py-3 gap-2 items-center shadow-md">
        <div className="w-[75px] h-[75px] rounded-full ring-[2px] ring-offset-2 ring-gray-400 overflow-hidden">
          <img className="w-full h-full object-contain" src={image} alt="img" />
        </div>
        <div>
          <p className="text-[14px] font-bold">{username && username}</p>
          <p
            className={`text-[12px] ${tenantname && tenantname ? "mt-2" : ""}`}
          >
            {tenantname && tenantname}
          </p>
        </div>
      </div>
      <ul className="text-sm">
        {menuList.length > 0 && (
          <>
            {menuList.map((item) =>
              !item.children ? (
                <li key={item.title} onClick={() => closeSidebar()}>
                  <Link
                    className={`mx-auto flex items-center hover:bg-[#eef1f5] p-3 lg:p-4 hover:no-underline cursor-pointer`}
                    to={`/${item.pageType}/${item.objectId}`}
                  >
                    <i className={item.icon + " text-[18px]"}></i>
                    <span title={item.description} className="ml-3 lg:ml-4">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ) : (
                <Submenu key={item.title} icon={item.icon} title={item.title}>
                  {item.children.map((item) => (
                    <li key={item.title} onClick={() => closeSidebar()} className="pl-6 md:pl-8 hover:bg-[#eef1f5] cursor-pointer">
                      <Link
                        className={`mx-auto flex items-center p-2 lg:p-3 hover:no-underline`}
                        to={`/${item.pageType}/${item.objectId}`}
                      >
                        <i className={item.icon + " text-[18px]"}></i>
                        <span title={item.description} className="ml-3 lg:ml-4">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </Submenu>
              )
            )}
          </>
        )}
      </ul>
      <div className="mt-4 flex justify-center items-center text-[25px] text-black gap-3">
        <NavLink to="https://github.com/opensignlabs/opensign" target="_blank">
          <i className="fa-brands fa-github"></i>
        </NavLink>
        <NavLink
          to="https://www.linkedin.com/company/opensign%E2%84%A2/"
          target="_blank"
        >
          <i className="fa-brands fa-linkedin"></i>
        </NavLink>
        <NavLink to="https://www.twitter.com/opensignlabs" target="_blank">
          <i className="fa-brands fa-square-x-twitter"></i>
        </NavLink>
        <NavLink to="https://discord.com/invite/xe9TDuyAyj" target="_blank">
          <i className="fa-brands fa-discord"></i>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
