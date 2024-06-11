import React from "react";
import "../styles/signature.css";

function CustomModal({
  show,
  headMsg,
  bodyMssg,
  footerMessage,
  declineDoc,
  setIsDecline
}) {
  return (
    show && (
      <dialog className="op-modal op-modal-open absolute z-[1999]">
        <div className="w-[80%] md:w-[40%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
          <h3 className="text-[#de4337] font-bold text-lg pt-[15px] px-[20px]">
            {headMsg && headMsg}
          </h3>
          <div className="p-[10px] px-[20px]">
            <p className="text-[15px]">{bodyMssg && bodyMssg}</p>
          </div>
          {footerMessage && (
            <>
              <div className="h-[1px] bg-[#9f9f9f] w-full"></div>
              <div className="m-[15px] ">
                <button
                  className="op-btn op-btn-primary mr-2"
                  type="button"
                  onClick={() => declineDoc()}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary"
                  onClick={() => setIsDecline({ isDeclined: false })}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    )
  );
}

export default CustomModal;
