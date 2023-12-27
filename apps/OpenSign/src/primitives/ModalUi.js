import React from "react";
const ModalUi = ({ children, title, isOpen, handleClose }) => {

  return (
    <>
      {isOpen && (
        <div className="fixed z-[999] top-0 left-0 w-[100%] h-[100%] bg-black bg-opacity-[75%]">
          <div className="fixed z-[1000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm bg-white rounded shadow-md max-h-90 md:min-w-[500px] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between bg-[#32a3ac] rounded-t items-center py-[10px] px-[20px] text-white">
              <div className="text-[1.2rem] font-normal">{title}</div>
              <div
                className="text-[1.5rem] cursor-pointer"
                onClick={() => handleClose && handleClose()}
              >
                &times;
              </div>
            </div>
            <div >{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalUi;
