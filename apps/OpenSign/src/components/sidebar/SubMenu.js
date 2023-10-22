import React, { useState } from "react";

const Submenu = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleSubmenu}
        className="w-full mx-auto flex items-center text-left text-[#444] p-3 lg:p-4 hover:bg-[#eef1f5] focus:outline-none"
      >
        <i className={icon + " text-[18px]"}></i>
        <div className="flex justify-between items-center w-full">
          <span className="ml-3 lg:ml-4">{title}</span>
          <i
            className={
              isOpen ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"
            }
          ></i>
        </div>
      </button>
      {isOpen && <ul className="pl-6 lg:pl-8">{children}</ul>}
    </div>
  );
};

export default Submenu;
