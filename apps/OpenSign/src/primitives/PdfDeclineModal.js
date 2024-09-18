import React, { useState } from "react";
import "../styles/signature.css";
import { useTranslation } from "react-i18next";

function CustomModal(props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  return (
    props.show && (
      <dialog className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
          <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
            {props?.headMsg && props?.headMsg}
          </h3>
          <div className="p-[10px] px-[20px]">
            <p className="text-[15px]">{props.bodyMssg && props.bodyMssg}</p>
          </div>
          {props.isDownloadBtn && (
            <div className="flex justify-start w-full ml-[20px] mb-3 mt-1">
              <button
                className="op-btn op-btn-primary "
                onClick={() => props.handleDownloadBtn()}
              >
                Download
              </button>
            </div>
          )}
          {props.footerMessage && (
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
              <div className="m-[15px]">
                <button
                  className="op-btn op-btn-primary mr-2 px-6"
                  type="button"
                  onClick={() => {
                    props.declineDoc(reason);
                    setReason("");
                  }}
                >
                  {t("yes")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary"
                  onClick={() => {
                    setReason("");
                    props.setIsDecline({ isDeclined: false });
                  }}
                >
                  {t("close")}
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
