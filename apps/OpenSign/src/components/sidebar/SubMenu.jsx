import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const Submenu = ({ item, closeSidebar, toggleSubmenu, submenuOpen }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const { title, icon, children } = item;
  return (
    <li role="none" className="my-0.5">
      <button
        onClick={() => toggleSubmenu(item.title)}
        className="flex items-center justify-start text-left p-3 lg:p-4 text-base-content hover:text-base-content focus:bg-base-300 hover:bg-base-300 hover:no-underline focus:outline-none "
        aria-expanded={submenuOpen}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
      >
        <span className="w-[20px] h-[20px] flex justify-center">
          <i className={`${icon} text-[18px]`}></i>
        </span>
        <div className="flex justify-between items-center w-full">
          <span className="ml-3 lg:ml-4 text-start">
            {t(`sidebar.${item.title}`, { appName })}
          </span>
          <i
            className={`${
              submenuOpen[item.title]
                ? "fa-light fa-angle-down"
                : "fa-light fa-angle-right"
            }`}
            aria-hidden="true"
          ></i>
        </div>
      </button>
      {submenuOpen[item.title] && (
        <ul id={`submenu-${title}`} role="menu" aria-label={`${title} submenu`}>
          {children.map((childItem) => (
            <li key={childItem.title} role="none" className="my-0.5">
              <NavLink
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                className={({ isActive }) =>
                  `${
                    isActive ? "bg-base-300 text-base-content" : ""
                  } flex items-center justify-start text-left pl-6 md:pl-8 py-2 text-sm cursor-pointer text-base-content hover:text-base-content focus:bg-base-300 hover:bg-base-300 hover:no-underline focus:outline-none`
                }
                onClick={closeSidebar}
                role="menuitem"
                tabIndex={submenuOpen ? 0 : -1}
              >
                <span className="w-[15px] h-[15px] flex justify-center">
                  <i
                    className={`${childItem.icon} text-[18px]`}
                    aria-hidden="true"
                  ></i>
                </span>
                <span className="ml-3 lg:ml-4">
                  {t(`sidebar.${item.title}-Children.${childItem.title}`, {
                    appName: drivename
                  })}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Submenu;
