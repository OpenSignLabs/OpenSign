import React from "react";
import { themeColor } from "../../constant/const";
import "../../styles/signature.css";
function Signedby({ pdfDetails }) {
  const getFirstLetter = (name) => {
    const firstLetter = name.charAt(0);
    return firstLetter;
  };

  return (
    <div className="signerComponent">
      <div
        style={{
          background: themeColor,
          color: "white"
        }}
        className="signedStyle"
      >
        Signed By
      </div>
      <div style={{ marginTop: "2px", background: "white" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            padding: "10px",

            background: "#93a3db"
          }}
        >
          <div
            className="signerStyle"
            style={{
              background: "#abd1d0",
              width: 20,
              height: 20,
              display: "flex",
              borderRadius: 30 / 2,
              justifyContent: "center",
              alignItems: "center",
              marginRight: "20px",
              marginTop: "5px"
            }}
          >
            <span
              style={{
                fontSize: "8px",
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              {" "}
              {getFirstLetter(pdfDetails.ExtUserPtr.Name)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="userName">{pdfDetails.ExtUserPtr.Name}</span>
            <span className="useEmail">{pdfDetails.ExtUserPtr.Email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signedby;
