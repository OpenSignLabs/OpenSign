import React from "react";
import { getWidgetType } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

function WidgetList(props) {
  const { t } = useTranslation();

  return props.updateWidgets.map((item, ind) => {
    return (
      <div className="2xl:p-3 mb-[5px]" key={ind}>
        <div
          className="select-none mx-[2px] md:mx-0 cursor-all-scroll"
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => {
            if (!props.isMobile) {
              item.ref(element);
              if (element) {
                if (props?.signRef) {
                  props.signRef.current = element;
                }
              }
            }
          }}
          onMouseMove={props?.handleDivClick}
          onMouseDown={() => props?.handleMouseLeave()}
          onTouchStart={props?.handleDivClick}
        >
          {item.ref && getWidgetType(item, t(`widgets-name.${item.type}`))}
        </div>
      </div>
    );
  });
}

export default WidgetList;
