import React from "react";
import "../../css/customModal.css";
import "../../css/signature.css";

function CustomModal({
  show,
  headMsg,
  bodyMssg,
  footerMessage,
  declineDoc,
  setIsDecline,
  containerWH
}) {
  const isMobile = window.innerWidth < 767;
  return (
    show && (
      <div
        className="parentDiv"
        style={{
          width: containerWH && containerWH.width,
          height: isMobile ? "100%" : containerWH && containerWH.height
        }}
      >
        <div className="childDiv">
          <div className="modalHeadDiv bg-danger">{headMsg && headMsg}</div>
          <div className="modalBodyDIv">
            <p className="pTagBody">{bodyMssg && bodyMssg}</p>
          </div>
          {footerMessage && (
            <div className="modalFooterDiv">
              <button
                style={{
                  color: "black"
                }}
                type="button"
                className="finishBtn"
                onClick={() => setIsDecline({ isDeclined: false })}
              >
                Close
              </button>
              <button
                style={{
                  background: "#de4337"
                }}
                type="button"
                className="finishBtn"
                onClick={() => declineDoc()}
              >
                Yes
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default CustomModal;
