import React from "react";
import "../css/ModalUi.css";
const ModalUi = ({ children, title, isOpen, handleClose, headerColor }) => {
  return (
    <>
      {isOpen && (
        <div className="modaloverlay">
          <div className="modalcontainer">
           {title && <div
              style={{ background: headerColor ? headerColor : "#32a3ac" }}
              className="modalheader"
            >
              <div className="modaltitle">{title}</div>
              <div
                className="closebtn"
                onClick={() => handleClose && handleClose()}
              >
                &times;
              </div>
            </div>}
            <div>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalUi;
