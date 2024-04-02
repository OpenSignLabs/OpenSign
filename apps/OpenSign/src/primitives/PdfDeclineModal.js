import React from "react";
import "../styles/signature.css";
import { rejectBtn } from "../constant/const";

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
      <div className="bg-black bg-opacity-[75%] absolute z-[999] flex flex-col items-center justify-center w-full h-full rounded">
        <div className="bg-white rounded outline-none md:w-[40%] w-[80%]">
          <div className="bg-[#de4337] text-white p-[10px] rounded-t">
            {headMsg && headMsg}
          </div>
          <div className="p-[15px]">
            <p className="text-[15px]">{bodyMssg && bodyMssg}</p>
          </div>
          {footerMessage && (
            <>
              <div className="h-[1px] bg-[#9f9f9f] w-full"></div>
              <div className="m-[15px] ">
                <button
                  className={`${rejectBtn} text-white mr-2`}
                  style={{ background: "#de4337" }}
                  type="button"
                  onClick={() => declineDoc()}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={rejectBtn}
                  onClick={() => setIsDecline({ isDeclined: false })}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
}

export default CustomModal;
