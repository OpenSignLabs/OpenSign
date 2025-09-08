import ReactTour from "reactour";

export default function Tour({
  steps,
  isOpen,
  rounded,
  className,
  showNumber,
  closeWithMask = false,
  onRequestClose,
  showNavigation,
  showCloseButton,
  showNavigationNumber,
  disableKeyboardNavigation
}) {
  const radius = rounded || 5;
  return (
    <ReactTour
      className={className}
      steps={steps}
      isOpen={isOpen}
      rounded={radius}
      scrollOffset={-100}
      closeWithMask={closeWithMask}
      disableKeyboardNavigation={disableKeyboardNavigation}
      showCloseButton={showCloseButton}
      onRequestClose={onRequestClose}
      showNumber={showNumber}
      showNavigation={showNavigation}
      showNavigationNumber={showNavigationNumber}
    />
  );
}
