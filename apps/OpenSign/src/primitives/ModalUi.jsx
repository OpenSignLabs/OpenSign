import "../styles/signature.css";
import Loader from "./Loader";

const ModalUi = ({
  children,
  title,
  isOpen,
  handleClose,
  showHeader = true,
  showClose = true,
  reduceWidth,
  position,
  crossColor,
  showScrollBar = false,
  isLoader = false
}) => {
  const width = reduceWidth;
  const isBottom = position === "bottom" ? "items-end pb-2 !bg-black/10" : "";
  const crossBtnColor = crossColor ?? "text-base-content";
  const hideScrollBar = !showScrollBar ? "hide-scrollbar" : "";
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
          {isLoader && (
            <div className="absolute z-[999] h-full w-full flex justify-center items-center bg-black bg-opacity-30">
              <Loader />
            </div>
          )}
          <div
            className={`${width || "md:min-w-[500px]"} op-modal-box p-0 max-h-90 overflow-y-auto ${hideScrollBar} text-sm`}
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
                    className={`${crossBtnColor} op-btn op-btn-sm op-btn-circle op-btn-ghost absolute right-2 top-2 z-40`}
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
