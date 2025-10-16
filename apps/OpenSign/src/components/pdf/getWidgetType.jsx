import { isMobile } from "../../constant/Utils";

// `getWidgetType` is used to load ui of widget in side list
const getWidgetType = (item, widgetName) => {
  return (
    <div
      title={widgetName}
      className="op-btn w-fit md:w-[100%] op-btn-primary op-btn-outline op-btn-sm focus:outline-none ml-[6px] outline outline-[1px] md:ml-0 p-0 overflow-hidden"
    >
      <div className="w-full h-full flex md:justify-between items-center">
        <div className="flex justify-start items-center ml-1 overflow-hidden">
          {!isMobile && (
            <i className="fa-light fa-grip-vertical ml-[3px] text-[13px]"></i>
          )}
          <span className="md:inline-block text-center text-[11px] mx-[3px] truncate font-medium capitalize">
            {widgetName}
          </span>
        </div>
        <div className="text-[13px] op-btn op-btn-primary rounded-none w-[20px] h-full flex justify-center items-center">
          <i className={item.icon}></i>
        </div>
      </div>
    </div>
  );
};
export default getWidgetType;
