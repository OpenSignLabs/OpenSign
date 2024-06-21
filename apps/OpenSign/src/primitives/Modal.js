import React, { useState } from "react";

const Modal = ({ children, Title }) => {
  const [isOpen, SetIsOpen] = useState(false);
  return (
    <>
      {children && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 border-[1px] text-sm bg-white rounded `}
        >
          <div className="flex justify-between items-center py-[.75rem] px-[1.25rem] ">
            <div className="font-semibold text-xl text-black">{Title}</div>
            <div
              onClick={() => SetIsOpen()}
              className="px-2 py-1 bg-gray-400 rounded cursor-pointer"
            >
              <i className="fa-light fa-xmark"></i>
            </div>
          </div>
          <hr />
          {isOpen && <div>{children}</div>}
        </div>
      )}
    </>
  );
};

export default Modal;
