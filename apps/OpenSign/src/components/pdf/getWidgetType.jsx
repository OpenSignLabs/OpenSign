// `getWidgetType` is used to load ui of widget in side list
const getWidgetType = (item, widgetName = "", isMobile = false) => {
  const widget = typeof item === "string" ? { type: item } : item || {};
  const type = widget.type || "";
  const label = widgetName || type;

  return (
    <span
      title={label}
      className="os-widget-chip os-widget-tone-stamp op-btn w-fit md:w-[100%] op-btn-outline op-btn-sm ml-[6px] md:ml-0 p-0 overflow-hidden"
    >
      <span className="w-full self-stretch flex md:justify-between items-center">
        <span className="flex justify-start items-center ml-1 overflow-hidden">
          {!isMobile && (
            <i
              className="fa-light fa-grip-vertical ml-[3px] text-[13px] lg:text-[13px]"
              aria-hidden="true"
            ></i>
          )}
          <span className="md:inline-block text-center text-[11px] lg:text-[13px] mx-[3px] truncate font-medium capitalize">
            {label}
          </span>
        </span>
        {widget.icon && (
          <span className="os-widget-chip-icon text-[13px] lg:text-[14px] op-btn rounded-none w-[20px] h-full flex justify-center items-center">
            <i className={widget.icon} aria-hidden="true"></i>
          </span>
        )}
      </span>
    </span>
  );
};
export default getWidgetType;
