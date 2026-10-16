import { TourProvider, useTour } from "@reactour/tour";
import { useEffect, useRef } from "react";

// Prevent background scroll on iOS while tour is open.
// Allows scrolling ONLY inside the tour popover.
const TOUR_POPOVER_SELECTOR = ".reactour__popover";
const TOUR_VIEWPORT_GAP = 16;

function getViewportPosition(position) {
  if (typeof position !== "string") return position;

  return ({
    top,
    right,
    bottom,
    left,
    width,
    height,
    windowWidth,
    windowHeight
  }) => {
    const popoverWidth = width || 353;
    const popoverHeight = height || 150;
    const availableSpace = {
      top,
      right: windowWidth - right,
      bottom: windowHeight - bottom,
      left
    };
    const fits = (side) =>
      availableSpace[side] >=
      (side === "left" || side === "right" ? popoverWidth : popoverHeight) +
        TOUR_VIEWPORT_GAP;
    const fallbackOrder = {
      top: ["bottom", "right", "left"],
      right: ["left", "bottom", "top"],
      bottom: ["top", "right", "left"],
      left: ["right", "bottom", "top"]
    };
    const selectedPosition = fits(position)
      ? position
      : fallbackOrder[position]?.find(fits);
    const clamp = (value, min, max) =>
      Math.min(Math.max(value, min), Math.max(max, min));
    const x = clamp(
      left + (right - left - popoverWidth) / 2,
      TOUR_VIEWPORT_GAP,
      windowWidth - popoverWidth - TOUR_VIEWPORT_GAP
    );
    const y = clamp(
      top + (bottom - top - popoverHeight) / 2,
      TOUR_VIEWPORT_GAP,
      windowHeight - popoverHeight - TOUR_VIEWPORT_GAP
    );

    if (!selectedPosition) return [x, y];

    const positionCoordinates = {
      top: [x, top - popoverHeight - TOUR_VIEWPORT_GAP],
      right: [right + TOUR_VIEWPORT_GAP, y],
      bottom: [x, bottom + TOUR_VIEWPORT_GAP],
      left: [left - popoverWidth - TOUR_VIEWPORT_GAP, y]
    };
    const [positionX, positionY] = positionCoordinates[selectedPosition];

    return [
      clamp(
        positionX,
        TOUR_VIEWPORT_GAP,
        windowWidth - popoverWidth - TOUR_VIEWPORT_GAP
      ),
      clamp(
        positionY,
        TOUR_VIEWPORT_GAP,
        windowHeight - popoverHeight - TOUR_VIEWPORT_GAP
      )
    ];
  };
}

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
  const viewportSafeSteps = steps?.map((step) => ({
    ...step,
    position: getViewportPosition(step.position)
  }));

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
      steps={viewportSafeSteps}
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
