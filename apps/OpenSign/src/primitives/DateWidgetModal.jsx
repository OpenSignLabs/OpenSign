import "../styles/signature.css";
import { createPortal } from "react-dom";

const DateWidgetModal = ({
  children,
  title,
  isOpen
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div id="dateWidgetModal" className="items-center op-modal op-modal-open">
      <div className="md:min-w-[500px] op-modal-box p-0 max-h-90 overflow-y-auto hide-scrollbar text-sm">
        {title && (
          <h3 className="text-base-content text-left font-bold text-lg pt-[15px] px-[20px]">
            {title}
          </h3>
        )}

        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default DateWidgetModal;
