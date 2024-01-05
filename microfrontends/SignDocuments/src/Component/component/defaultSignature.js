import React from "react";

function DefaultSignature({
  themeColor,
  defaultSignImg,
  xyPostion,
  setDefaultSignAlert
}) {
  const confirmToaddDefaultSign = () => {
    if (xyPostion.length > 0) {
      setDefaultSignAlert({
        isShow: true,
        alertMessage:
          "Are you sure you want to auto sign at requested all locations?"
      });
    } else {
      setDefaultSignAlert({
        isShow: true,
        alertMessage: "please select position!"
      });
    }
  };

  return (
    <div>
      <div
        style={{
          background: themeColor(),
          color: "white",
          padding: "5px",
          fontFamily: "sans-serif",
          marginTop: "5px"
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
              cursor: "pointer",
              marginBottom: "10px"
            }}
            type="button"
            className="finishBtn finishnHover"
            onClick={() => confirmToaddDefaultSign()}
          >
            Auto Sign All
          </button>
        </>
      </div>
    </div>
  );
}

export default DefaultSignature;
