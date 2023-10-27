import React from "react";

function HandleError({ handleError }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <span style={{ fontSize: "20px", color: "gray" }}>{handleError}</span>
    </div>
  );
}

export default HandleError;
