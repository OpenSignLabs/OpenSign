import React from "react";
import { NavLink } from "react-router-dom";

const Menu = ({ item, isOpen, closeSidebar }) => {
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
          } flex items-center text-left p-3 lg:p-4 text-base-content hover:text-base-content focus:bg-base-300 hover:bg-base-300 hover:no-underline focus:outline-none`
        }
        onClick={closeSidebar}
        tabIndex={isOpen ? 0 : -1}
        role="menuitem"
      >
        <i className={`${item.icon} text-[18px]`} aria-hidden="true"></i>
        <span className="ml-3 lg:ml-4">{item.title}</span>
      </NavLink>
    </li>
  );
};

export default Menu;
