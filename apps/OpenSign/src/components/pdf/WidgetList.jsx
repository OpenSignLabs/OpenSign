import { isMobile } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import getWidgetType from "./getWidgetType";

function WidgetList(props) {
  const { t } = useTranslation();
  const isMobile = props.isMobile;
  const getWidgetList = props.updateWidgets();
  return getWidgetList?.map((item, ind) => {
    const widgetName = t(`widgets-name.${item.type}`);
    return (
      <div className="2xl:p-1 mb-[5px]" key={ind}>
        <button
          type="button"
         data-tut={
                "isSignatureWidget"
          }
          aria-label={widgetName}
          className="os-widget-button select-none mx-[2px] md:mx-0 min-h-[44px] min-w-[44px] w-fit md:w-full cursor-all-scroll appearance-none border-0 bg-transparent p-0"
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => !isMobile && item.ref(element)}
          onMouseMove={(e) => !isMobile && props?.handleDivClick(e)}
          onMouseDown={() => !isMobile && props?.handleMouseLeave()}
          onTouchStart={(e) => !isMobile && props?.handleDivClick(e)}
        >
          {item.ref && getWidgetType(item, widgetName, isMobile)}
        </button>
      </div>
    );
  });
}

export default WidgetList;
