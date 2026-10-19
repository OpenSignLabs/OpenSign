import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../styles/signature.css";
import Loader from "./Loader";
import Tooltip from "./Tooltip";

const ModalUi = ({
  id,
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
  portalToBody = false,
  isLoader = false,
  helpText = "",
  modalBoxClassName = ""
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const handleCloseRef = useRef(handleClose);
  const modalId = id || "selectSignerModal";
  const titleId = `${modalId}-title`;
  const width = reduceWidth;
  const isBottom = position === "bottom" ? "items-end pb-2 !bg-black/10" : "";
  const crossBtnColor = crossColor ?? "text-base-content";
  const hideScrollBar = !showScrollBar ? "hide-scrollbar" : "";
  const theme =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "opensigncss"
      : "opensigncss";

  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return undefined;

    const dialog = dialogRef.current;
    const previousActiveElement = document.activeElement;
    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const focusFirstElement = () => {
      const firstElement = getFocusableElements()[0];
      (firstElement || dialog).focus();
    };

    const animationFrame = requestAnimationFrame(focusFirstElement);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(animationFrame);
      dialog.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  // Keep bottom-sheet modals above the mobile virtual keyboard by tracking the
  // visual viewport (which shrinks when the keyboard opens) and adjusting the
  // dialog's height/top to match, so the modal never slides behind the keyboard.
  useEffect(() => {
    if (!isOpen || position !== "bottom" || !window.visualViewport) return;
    const vp = window.visualViewport;

    const updatePosition = () => {
      if (!dialogRef.current) return;
      dialogRef.current.style.height = `${vp.height}px`;
      dialogRef.current.style.top = `${vp.offsetTop}px`;
    };

    updatePosition();
    vp.addEventListener("resize", updatePosition);
    vp.addEventListener("scroll", updatePosition);

    return () => {
      vp.removeEventListener("resize", updatePosition);
      vp.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, position]);

  const modal = (
    <>
      {isOpen && (
        <dialog
          ref={dialogRef}
          id={modalId}
          open={isOpen}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          data-theme={theme}
          className={`${isBottom} op-modal op-modal-open`}
          style={{
            overlay: { zIndex: 1000 },
            content: { zIndex: 1001, overflow: "visible" } // Ensure modal doesn't clip content
          }}
        >
          {isLoader && (
            <div className="absolute z-[999] h-full w-full flex justify-center items-center bg-black bg-opacity-30">
              <Loader />
            </div>
          )}
          <div
            className={`${width || "md:min-w-[500px]"} ${modalBoxClassName} op-modal-box p-0 max-h-90 overflow-y-auto ${hideScrollBar} text-sm`}
          >
            {showHeader && (
              <>
                {title && (
                  <h3
                    id={titleId}
                    className="text-base-content text-left font-bold text-lg pt-[15px] px-[20px]"
                  >
                    {title}
                    {helpText && (
                      <span className="ml-0.5 text-sm font-medium">
                        <Tooltip id={title} message={t(helpText)} />
                      </span>
                    )}
                  </h3>
                )}
                {showClose && (
                  <button
                    type="button"
                    aria-label={t("close")}
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

  return portalToBody && typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
};

export default ModalUi;
