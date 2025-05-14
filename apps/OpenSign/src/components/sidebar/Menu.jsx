import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const Menu = ({ item, isOpen, closeSidebar }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  return (
    <li key={item.title} role="none" className="my-0.5">
      <NavLink
        to={
          item.pageType
            ? `/${item.pageType}/${item.objectId}`
            : `/${item.objectId}`
        }
        className={({ isActive }) =>
          `${
            isActive ? " bg-base-300 text-base-content" : ""
          } flex items-center justify-start text-left p-3 lg:p-4 text-base-content hover:text-base-content focus:bg-base-300 hover:bg-base-300 hover:no-underline focus:outline-none`
        }
        onClick={closeSidebar}
        tabIndex={isOpen ? 0 : -1}
        role="menuitem"
      >
        <span className="w-[20px] h-[20px] flex justify-center">
          <i className={`${item.icon} text-[18px]`} aria-hidden="true"></i>
        </span>
        <span className="ml-3 lg:ml-4">
          {t(`sidebar.${item.title}`, { appName: drivename })}
        </span>
      </NavLink>
    </li>
  );
};

export default Menu;
