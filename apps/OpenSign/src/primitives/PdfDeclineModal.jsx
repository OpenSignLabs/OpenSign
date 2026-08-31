import React, { useState } from "react";
import "../styles/signature.css";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";

function CustomModal(props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [isExtendExpiry, setIsExtendExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const localuser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );

  const currentUser = JSON.parse(localuser);
  const isCreator = props?.doc
    ? props?.doc?.CreatedBy?.objectId === currentUser?.objectId &&
      localStorage.getItem("_user_role") !== "Guest"
    : false;
  const handleExtendBtn = () => setIsExtendExpiry(!isExtendExpiry);

  const handleUpdateExpiry = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      props.handleExpiry && props.handleExpiry(expiryDate);
    } else {
      alert(t("expiry-date-error"));
    }
  };

  return (
    props.show && (
      <dialog className="op-modal op-modal-open" style={{ zIndex: 448 }}>
        <div className="w-[90%] max-w-[440px] op-modal-box p-6 bg-base-100 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar text-sm">
          {props?.isLoader && (
            <div className="absolute inset-0 flex flex-col justify-center items-center z-[999] bg-base-100/80 backdrop-blur-sm rounded-2xl">
              <Loader />
            </div>
          )}

          {/* Close button for info-only state */}
          {!props.footerMessage && !isCreator && !props.isDownloadBtn && (
            <button
              className="text-base-content/60 hover:text-base-content op-btn op-btn-xs op-btn-circle op-btn-ghost absolute right-3.5 top-3.5 z-40"
              onClick={() => props.setIsDecline && props.setIsDecline({ isDeclined: false })}
            >
              ✕
            </button>
          )}

          {/* Header Title */}
          <div className="mb-3">
            <h3 className="text-base-content font-bold text-lg leading-snug">
              {props?.headMsg && props.headMsg}
            </h3>
          </div>

          {/* Body message */}
          {!isExtendExpiry && props.bodyMssg && (
            <div className="text-sm leading-relaxed text-base-content/80 mb-4">
              {props.bodyMssg}
            </div>
          )}

          {/* Buttons for Creator Extend / Download */}
          {!isExtendExpiry && (isCreator || props.isDownloadBtn) && (
            <div className="flex flex-row items-center justify-end gap-2 mt-4">
              {isCreator && (
                <button
                  className="op-btn op-btn-primary op-btn-sm rounded-xl px-4 font-semibold"
                  onClick={() => handleExtendBtn()}
                >
                  {t("extend")}
                </button>
              )}
              {props.isDownloadBtn && (
                <button
                  className="op-btn op-btn-secondary op-btn-sm rounded-xl px-4 font-semibold"
                  onClick={() => props.handleDownloadBtn()}
                >
                  {t("download")}
                </button>
              )}
            </div>
          )}

          {/* Decline Confirmation Form */}
          {props.footerMessage && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
                {t("reason")} <span className="font-normal text-base-content/50">({t("optional")})</span>
              </label>
              <textarea
                rows={3}
                placeholder={t("reason")}
                className="px-3.5 py-2.5 op-textarea op-textarea-bordered w-full text-xs rounded-xl focus:outline-none hover:border-base-content transition-all resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex flex-row items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm rounded-xl font-semibold text-base-content"
                  onClick={() => {
                    setReason("");
                    props.setIsDecline({ isDeclined: false });
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm rounded-xl px-5 font-semibold"
                  onClick={() => {
                    props.declineDoc(reason);
                    setReason("");
                  }}
                >
                  {t("yes")}
                </button>
              </div>
            </div>
          )}

          {/* Extend Expiry Form */}
          {isExtendExpiry && (
            <form className="mt-3" onSubmit={handleUpdateExpiry}>
              <label htmlFor="expiryDate" className="block text-xs font-semibold text-base-content/70 mb-1.5">
                {t("expiry-date")} (dd-mm-yyyy)
              </label>
              <input
                id="expiryDate"
                type="date"
                onClick={(e) => e?.currentTarget?.showPicker?.()}
                className="w-full px-3.5 py-2 rounded-xl op-input op-input-bordered text-xs text-base-content focus:outline-none hover:border-base-content"
                defaultValue={props?.doc?.ExpiryDate?.iso?.split("T")?.[0]}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <div className="flex flex-row items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm rounded-xl font-semibold text-base-content"
                  onClick={() => {
                    setExpiryDate("");
                    setIsExtendExpiry(false);
                  }}
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="op-btn op-btn-primary op-btn-sm rounded-xl px-5 font-semibold">
                  {t("update")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Backdrop overlay */}
        {!props.footerMessage && (
          <div
            className="op-modal-backdrop"
            onClick={() => props.setIsDecline && props.setIsDecline({ isDeclined: false })}
          />
        )}
      </dialog>
    )
  );
}

export default CustomModal;
