import React from "react";
import { getWidgetType } from "../../constant/Utils";

function WidgetList(props) {
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
          {item.ref && getWidgetType(item)}
        </div>
      </div>
    );
  });
}

export default WidgetList;
