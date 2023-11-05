import React, { useEffect } from "react";
import axios from "axios";

function DefaultSignature({
  themeColor,
  defaultSignImg,
  setShowAlreadySignDoc,
  xyPostion
}) {
  const confirmToaddDefaultSign = () => {
    if (xyPostion.length > 0) {
      const alreadySign = {
        status: true,
        mssg: "Are you sure you want to sign at requested locations?",
        sure: true
      };
      setShowAlreadySignDoc(alreadySign);
    } else {
      alert("please select position!");
    }
  };

  return (
    <div className="signerComponent">
      <div
        style={{
          background: themeColor(),
          color: "white",
          padding: "5px",
          fontFamily: "sans-serif"
        }}
      >
        Signature
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "10px",
          fontWeight: "600"
        }}
      >
        {defaultSignImg ? (
          <>
            <p>Your Signature</p>
            <div className="defaultSignBox">
              <img
                alt="default img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
                src={defaultSignImg}
              />
            </div>
            <button
              style={{
                background: themeColor(),
                color: "white",
                marginTop: "20px",
                cursor: "pointer"
              }}
              type="button"
              className="finishBtn finishnHover"
              onClick={() => confirmToaddDefaultSign()}
            >
              Auto Sign All
            </button>
          </>
        ) : (
          <div style={{ margin: "10px" }}>
            <span>
              Click a signature placeholder to start signing the document!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultSignature;
