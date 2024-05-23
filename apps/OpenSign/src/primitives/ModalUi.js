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
  return (
    <>
      {isOpen && (
        <div className="fixed z-[999] top-0 left-0 w-[100%] h-[100%] bg-black bg-opacity-[75%]">
          <div
            className={`${
              reduceWidth ? "md:min-w-[430px]" : "md:min-w-[500px]"
            } fixed z-[1000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm bg-white rounded shadow-md max-h-90 min-w-[90%]   overflow-y-auto hide-scrollbar `}
          >
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
            {!isEnableSubscription && showHeaderMessage && (
              <PremiumAlertHeader
                message={
                  "Cutomize Email is free in beta, this feature will incur a fee later."
                }
              />
            )}
            <div>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalUi;
