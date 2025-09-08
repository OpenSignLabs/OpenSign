import { isMobile } from "../../constant/Utils";

// `getWidgetType` is used to load ui of widget in side list
const getWidgetType = (item, widgetName) => {
  return (
    <div className="op-btn w-fit md:w-[100%] op-btn-primary op-btn-outline op-btn-sm focus:outline-none outline outline-[1.5px] ml-[6px] md:ml-0 p-0 overflow-hidden">
      <div className="w-full h-full flex md:justify-between items-center">
        <div className="flex justify-start items-center text-[13px] ml-1">
          {!isMobile && <i className="fa-light fa-grip-vertical ml-[3px]"></i>}
          <span className="md:inline-block text-center text-[15px] ml-[5px] font-semibold pr-1 md:pr-0">
            {widgetName}
          </span>
        </div>
        <div className="text-[20px] op-btn op-btn-primary rounded-none w-[40px] h-full flex justify-center items-center">
          <i className={item.icon}></i>
        </div>
      </div>
    </div>
  );
};
export default getWidgetType;
