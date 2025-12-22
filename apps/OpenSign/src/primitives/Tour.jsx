import { TourProvider, useTour } from "@reactour/tour";
import { useEffect, useRef } from "react";
import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll
} from "body-scroll-lock";

function TourStateSync({ isOpen, onRequestClose }) {
  const { isOpen: contextIsOpen, setIsOpen } = useTour();
  const previousIsOpen = useRef(contextIsOpen);

  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (previousIsOpen.current && !contextIsOpen && onRequestClose) {
      onRequestClose();
    }
    previousIsOpen.current = contextIsOpen;
  }, [contextIsOpen, onRequestClose]);
  return null;
}

export default function Tour({
  steps,
  isOpen,
  rounded = 5,
  className,
  showNumber,
  onRequestClose,
  showNavigation,
  showCloseButton,
  showNavigationNumber
}) {
  function disableBody() {
    if (typeof window !== "undefined") {
      disableBodyScroll(document.body);
    }
  }

  function enableBody() {
    if (typeof window !== "undefined") {
      enableBodyScroll(document.body);
      clearAllBodyScrollLocks();
    }
  }
  return (
    <TourProvider
      className={className}
      steps={steps}
      defaultOpen={isOpen}
      // scrollOffset={-100} // available only for v1
      inViewThreshold={{ y: 150 }}
      onClickMask={() => {}}
      disableKeyboardNavigation={["esc"]}
      showBadge={showNumber}
      showNavigation={showNavigation}
      showPrevNextButtons={showNavigation}
      showDots={showNavigationNumber ?? showNavigation}
      showCloseButton={showCloseButton}
      padding={rounded}
      onClickClose={(clickProps) => {
        clickProps.setIsOpen(false);
      }}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: rounded,
          padding: "18px",
          fontSize: "13px"
        }),
        maskArea: (base) => ({ ...base, rx: rounded }),
        close: (base) => ({ ...base, right: 10, top: 10, outline: "none" })
      }}
      afterOpen={disableBody}
      beforeClose={enableBody}
      scrollSmooth
    >
      <TourStateSync isOpen={isOpen} onRequestClose={onRequestClose} />
    </TourProvider>
  );
}
