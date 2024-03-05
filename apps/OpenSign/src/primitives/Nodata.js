import React from "react";

function Nodata() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
      }}
    >
      <span style={{ fontWeight: "bold" }}>No Data Found!</span>
    </div>
  );
}

export default Nodata;
