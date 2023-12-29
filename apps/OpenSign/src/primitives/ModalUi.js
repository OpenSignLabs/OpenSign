import React from "react";
const ModalUi = ({
  children,
  title,
  isOpen,
  headColor,
  handleClose,
  showHeader = true,
  showClose = true
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed z-[999] top-0 left-0 w-[100%] h-[100%] bg-black bg-opacity-[75%]">
          <div className="fixed z-[1000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm bg-white rounded shadow-md max-h-90 md:min-w-[500px] overflow-y-auto hide-scrollbar">
            {showHeader && (
              <div
                className="flex justify-between rounded-t items-center py-[15px] px-[20px] text-white"
                style={{ background: headColor ? headColor : "#32a3ac" }}
              >
                <div className="text-[1.2rem] font-normal">{title}</div>
                {showClose && (
                  <div
                    className="text-[1.5rem] cursor-pointer"
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
