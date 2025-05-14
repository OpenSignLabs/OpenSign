import React from "react";

const Alert = ({ children, type, className }) => {
  const textcolor = type ? theme(type) : theme();
  function theme(color) {
    switch (color) {
      case "success":
        return "op-alert-success";
      case "info":
        return "op-alert-info";
      case "danger":
        return "op-alert-error";
      case "warning":
        return "op-alert-warning text-black";
      default:
        return "";
    }
  }
  return (
    children && (
      <div
        className={`${
          className
            ? className
            : "z-[1000] fixed top-20 left-1/2 transform -translate-x-1/2 text-sm"
        }  `}
      >
        <div className={`op-alert ${textcolor} flex justify-center`}>
          <span className="px-1">{children}</span>
        </div>
      </div>
    )
  );
};

export default Alert;
