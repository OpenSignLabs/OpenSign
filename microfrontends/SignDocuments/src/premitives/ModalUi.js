import React from "react";
import "../css/ModalUi.css";
const ModalUi = ({
  children,
  title,
  isOpen,
  handleClose,
  headerColor,
  dropdownModal
}) => {
  return (
    <>
      {isOpen && (
        <div className="modaloverlay">
          <div className={dropdownModal ? dropdownModal : "modalcontainer"}>
            {title && (
              <div
                style={{ background: headerColor ? headerColor : "#32a3ac" }}
                className="modalheader"
              >
                <div className="modaltitle">{title}</div>
                {handleClose && (
                  <div
                    className="closebtn"
                    onClick={() => handleClose && handleClose()}
                  >
                    &times;
                  </div>
                )}
              </div>
            )}
            <div>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalUi;
