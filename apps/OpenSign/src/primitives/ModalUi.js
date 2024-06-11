import React from "react";
import { isEnableSubscription } from "../constant/const";
import PremiumAlertHeader from "./PremiumAlertHeader";

const ModalUi = ({
  children,
  title,
  isOpen,
  headColor,
  handleClose,
  showHeader = true,
  showClose = true,
  reduceWidth,
  showHeaderMessage
}) => {
  const headerColor = headColor ? `text-${headColor}` : "text-base-content";
  return (
    <>
      {isOpen && (
        <dialog className="op-modal op-modal-open">
          <div
            className={`${
              reduceWidth || "md:min-w-[500px]"
            } op-modal-box p-0 max-h-90 min-w-[90%] overflow-y-auto hide-scrollbar text-sm`}
          >
            {showHeader && (
              <>
                <h3
                  className={`${headerColor} font-bold text-lg pt-[15px] px-[20px]`}
                >
                  {title}
                </h3>
                {showClose && (
                  <button
                    className="op-btn op-btn-sm op-btn-circle op-btn-ghost absolute right-2 top-2"
                    onClick={() => handleClose && handleClose()}
                  >
                    ✕
                  </button>
                )}
              </>
            )}
            {!isEnableSubscription && showHeaderMessage && (
              <PremiumAlertHeader
                message={
                  "Cutomize Email is free in beta, this feature will incur a fee later."
                }
              />
            )}
            <div>{children}</div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default ModalUi;
