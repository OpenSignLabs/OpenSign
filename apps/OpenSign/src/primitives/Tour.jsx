import { TourProvider, useTour } from "@reactour/tour";
import { useEffect, useRef } from "react";

// Prevent background scroll on iOS while tour is open.
// Allows scrolling ONLY inside the tour popover.
const TOUR_POPOVER_SELECTOR = ".reactour__popover";

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
  function prevent(e) {
    // allow scrolling inside tour popover (adjust selector)
    if (e.target.closest?.(TOUR_POPOVER_SELECTOR)) return;
    // Otherwise block page scroll.
    e.preventDefault();
  }

  function lockTouchScroll() {
    // passive:false is required so preventDefault() works on iOS.
    document.addEventListener("touchmove", prevent, { passive: false });
  }

  function unlockTouchScroll() {
    // Restore normal scrolling.
    document.removeEventListener("touchmove", prevent);
  }
  return (
    <TourProvider
      className={className}
      steps={steps}
      defaultOpen={isOpen}
      // scrollOffset={-100} // available only for v1
      inViewThreshold={{ y: 150, x: 30 }}
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
      afterOpen={lockTouchScroll}
      beforeClose={unlockTouchScroll}
      scrollSmooth
    >
      <TourStateSync isOpen={isOpen} onRequestClose={onRequestClose} />
    </TourProvider>
  );
}
