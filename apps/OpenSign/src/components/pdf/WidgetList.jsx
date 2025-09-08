import { isMobile } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import getWidgetType from "./getWidgetType";

function WidgetList(props) {
  const { t } = useTranslation();
  const getWidgetList = props.updateWidgets();
  return getWidgetList?.map((item, ind) => {
    return (
      <div className="2xl:p-1 mb-[5px]" key={ind}>
        <div
          data-tut="isSignatureWidget"
          className="select-none mx-[2px] md:mx-0 cursor-all-scroll"
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => !isMobile && item.ref(element)}
          onMouseMove={(e) => !isMobile && props?.handleDivClick(e)}
          onMouseDown={() => !isMobile && props?.handleMouseLeave()}
          onTouchStart={(e) => !isMobile && props?.handleDivClick(e)}
        >
          {item.ref && getWidgetType(item, t(`widgets-name.${item.type}`))}
        </div>
      </div>
    );
  });
}

export default WidgetList;
