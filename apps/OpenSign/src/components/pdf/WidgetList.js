import React from "react";
import { getWidgetType } from "../../constant/Utils";

function WidgetList(props) {
  return props.updateWidgets.map((item, ind) => {
    return (
      <div key={ind} className="mb-[5px]">
        <div
          className="select-none"
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
          onMouseDown={() => {
            props?.handleMouseLeave();
          }}
        >
          {item.ref && getWidgetType(item, props?.marginLeft)}
        </div>
      </div>
    );
  });
}

export default WidgetList;
