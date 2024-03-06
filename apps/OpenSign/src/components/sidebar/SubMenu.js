import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Submenu = ({ item, closeSidebar }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { title, icon, children } = item;

  const toggleSubmenu = () => {
    setSubmenuOpen(!submenuOpen);
  };

  return (
    <li role="none">
      <button
        onClick={toggleSubmenu}
        className="w-full flex items-center text-left text-[#444] p-3 lg:p-4 hover:bg-[#eef1f5] focus:ring-2 focus:ring-blue-600"
        aria-expanded={submenuOpen}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
      >
        <i className={`${icon} text-[18px]`}></i>
        <div className="flex justify-between items-center w-full">
          <span className="ml-3 lg:ml-4">{title}</span>
          <i
            className={`${
              submenuOpen ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"
            }`}
            aria-hidden="true"
          ></i>
        </div>
      </button>
      {submenuOpen && (
        <ul id={`submenu-${title}`} role="menu" aria-label={`${title} submenu`}>
          {children.map((childItem) => (
            <li key={childItem.title} role="none">
              <NavLink
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                className="block pl-6 md:pl-8 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
                onClick={closeSidebar}
                role="menuitem"
                tabIndex={submenuOpen ? 0 : -1}
              >
                <i
                  className={`${childItem.icon} text-[18px]`}
                  aria-hidden="true"
                ></i>
                <span className="ml-3 lg:ml-4">{childItem.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Submenu;
