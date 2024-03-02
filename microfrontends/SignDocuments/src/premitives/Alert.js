import React from "react";

const Alert = ({ children, type }) => {
  const textcolor = type ? theme(type) : theme();
  function theme(color) {
    switch (color) {
      case "success":
        return {
          border: `1px solid #c3e6cb`, // Border color
          backgroundColor: "#d4edda", // Background color
          color: "#155724" // Text color
        };

      case "info":
        return {
          border: `1px solid #adcdeb`, // Border color
          backgroundColor: "#c1daf0", // Background color
          color: "#153756" // Text color
        };
      case "danger":
        return {
          border: `1px solid #f0a8a8`, // Border color
          backgroundColor: "#f4bebe", // Background color
          color: "#c42121" // Text color
        };
      default:
        return {
          border: `1px solid #d6d6d6`, // Border color
          backgroundColor: "#d9d9d9", // Background color
          color: "#575757" // Text color
        };
    }
  }
  return (
    <>
      {children && (
        <div
          style={{
            ...textcolor,
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.875rem", // Corresponds to text-sm in Tailwind CSS
            borderRadius: "5px", // Rounded corners
            padding: "10px 15px", // Padding
            zIndex: 40
          }}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default Alert;
