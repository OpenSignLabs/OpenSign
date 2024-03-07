import React from "react";

function BorderResize({ right, top }) {
  return (
    <div
      className="borderResize"
      style={{
        right: right ? right + "px" : "-1px",
        bottom: top ? top + "px" : "-1px",
        borderRight: "3px solid  #188ae2",
        borderBottom: "3px solid #188ae2"
      }}
    ></div>
  );
}

export default BorderResize;
