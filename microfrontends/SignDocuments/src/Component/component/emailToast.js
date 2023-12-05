import React from "react";
import "../../css/signature.css";

function EmailToast({ isShow }) {
  return (
    <div
      style={{ display: isShow ? "flex" : "none", justifyContent: "center" }}
    >
      <div className="emailToast">
        <span style={{ fontSize: "12px", fontWeight: "500" }}>
          Email sent successfully!
        </span>
      </div>
    </div>
  );
}

export default EmailToast;
