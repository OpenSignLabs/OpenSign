import React from "react";
import { NavLink } from "react-router-dom";

const Submenu = ({ item, closeSidebar, toggleSubmenu, submenuOpen }) => {
  const { title, icon, children } = item;
  return (
    <li role="none">
      <button
        onClick={() => toggleSubmenu(item.title)}
        className="w-full flex items-center text-left text-base-content p-3 lg:p-4 hover:bg-base-300 focus:outline-none hover:text-base-content "
        aria-expanded={submenuOpen}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
      >
        <i className={`${icon} text-[18px]`}></i>
        <div className="flex justify-between items-center w-full">
          <span className="ml-3 lg:ml-4">{title}</span>
          <i
            className={`${
              submenuOpen[item.title]
                ? "fa-solid fa-angle-down"
                : "fa-solid fa-angle-right"
            }`}
            aria-hidden="true"
          ></i>
        </div>
      </button>
      {submenuOpen[item.title] && (
        <ul id={`submenu-${title}`} role="menu" aria-label={`${title} submenu`}>
          {children.map((childItem) => (
            <li key={childItem.title} role="none">
              <NavLink
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                className={({ isActive }) =>
                  `${
                    isActive ? "bg-base-300" : ""
                  } mx-auto text-base-content hover:text-base-content hover:bg-base-300 block pl-6 md:pl-8 py-2 text-sm cursor-pointer hover:no-underline`
                }
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
