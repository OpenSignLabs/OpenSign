import React from "react";
import { getWidgetType } from "../../utils/Utils";

function AllWidgets(props) {
  return props.updateWidgets.map((item, ind) => {
    return (
      <div
        key={ind}
        ref={(element) => {
          item.ref(element);
          if (element) {
            if (props?.signRef) {
              props.signRef.current = element;
            }
          }
        }}
        onMouseMove={props?.handleDivClick}
        onMouseDown={props?.handleMouseLeave}
      >
        {item.ref && getWidgetType(item, props?.marginLeft)}
      </div>
    );
  });
}

export default AllWidgets;
