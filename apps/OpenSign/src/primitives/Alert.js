import React from "react";

const Alert = ({ children, type }) => {
  const textcolor = type ? theme(type) : theme();
  function theme(color) {
    switch (color) {
      case "success":
        return "border-[#c3e6cb] bg-[#d4edda] text-[#155724]";
      case "info":
        return "border-[#adcdeb] bg-[#c1daf0] text-[#153756]";
      case "danger":
        return "border-[#f0a8a8] bg-[#f4bebe] text-[#c42121]";
      default:
        return "border-[#d6d6d6] bg-[#d9d9d9] text-[#575757]";
    }
  }
  return (
    <>
      {children && (
        <div
          className={`z-[1000] fixed top-20 left-1/2 transform -translate-x-1/2 border-[1px] text-sm ${textcolor} rounded py-[.75rem] px-[1.25rem] z-50`}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default Alert;
