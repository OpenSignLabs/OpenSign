import React, { useState } from "react";
import "../styles/signature.css";

function CustomModal({
  show,
  headMsg,
  bodyMssg,
  footerMessage,
  declineDoc,
  setIsDecline
}) {
  const [reason, setReason] = useState("");
  return (
    show && (
      <dialog className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
          <h3 className="text-[#de4337] font-bold text-lg pt-[15px] px-[20px]">
            {headMsg && headMsg}
          </h3>
          <div className="p-[10px] px-[20px]">
            <p className="text-[15px]">{bodyMssg && bodyMssg}</p>
          </div>
          {footerMessage && (
            <>
              <div className="mx-3">
                <textarea
                  rows={3}
                  placeholder="Reason (optional)"
                  className="px-4 op-textarea op-textarea-bordered focus:outline-none hover:border-base-content w-full text-xs"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              {/* <div className="h-[1px] bg-[#9f9f9f] w-full"></div> */}
              <div className="m-[15px]">
                <button
                  className="op-btn op-btn-primary mr-2 px-6"
                  type="button"
                  onClick={() => {
                    setReason("");
                    declineDoc(reason);
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary"
                  onClick={() => {
                    setReason("");
                    setIsDecline({ isDeclined: false });
                  }}
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
