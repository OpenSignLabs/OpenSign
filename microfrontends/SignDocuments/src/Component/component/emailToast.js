import React from "react";
import "../../css/signature.css";

function EmailToast({ isShow }) {
  return (
    <>
      {isShow && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="alert alert-success successBox"
            style={{ zIndex: "1051" }}
          >
            Email sent successfully!
          </div>
        </div>
      )}
    </>
  );
}

export default EmailToast;
