import React from "react";
import { NavLink } from "react-router-dom";

const Menu = ({ item, isOpen, closeSidebar }) => {
  return (
    <li key={item.title} role="none">
      <NavLink
        to={
          item.pageType
            ? `/${item.pageType}/${item.objectId}`
            : `/${item.objectId}`
        }
        className="mx-auto flex items-center hover:bg-[#eef1f5] p-3 lg:p-4 cursor-pointer  focus:text-[#0056b3] focus:bg-[#eef1f5]"
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
