import React from "react";
import loader from "../assets/images/loader2.gif";

function Loader({ isLoading }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column"
      }}
    >
      <img
        alt="no img"
        src={loader}
        style={{ width: "80px", height: "80px" }}
      />
      <span style={{ fontSize: "13px", color: "gray" }}>
        {isLoading.message}
      </span>
    </div>
  );
}

export default Loader;
