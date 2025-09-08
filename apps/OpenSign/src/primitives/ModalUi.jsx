import React from "react";
import "../styles/signature.css";

const ModalUi = ({
  children,
  title,
  isOpen,
  handleClose,
  showHeader = true,
  showClose = true,
  reduceWidth,
  position
}) => {
  const width = reduceWidth;
  const isBottom = position === "bottom" ? "items-end pb-2 !bg-black/10" : "";
  return (
    <>
      {isOpen && (
        <dialog
          id="selectSignerModal"
          className={`${isBottom} op-modal op-modal-open`}
          style={{
            overlay: { zIndex: 1000 },
            content: { zIndex: 1001, overflow: "visible" } // Ensure modal doesn’t clip content
          }}
        >
          <div
            className={`${
              width || "md:min-w-[500px]"
            } op-modal-box p-0 max-h-90 overflow-y-auto hide-scrollbar text-sm`}
          >
            {showHeader && (
              <>
                {title && (
                  <h3 className="text-base-content text-left font-bold text-lg pt-[15px] px-[20px]">
                    {title}
                  </h3>
                )}
                {showClose && (
                  <button
                    className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2"
                    onClick={() => handleClose && handleClose()}
                  >
                    ✕
                  </button>
                )}
              </>
            )}
            <div>{children}</div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default ModalUi;
