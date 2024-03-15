import React from "react";
import { getWidgetType } from "../../constant/Utils";

function WidgetList(props) {
  return props.updateWidgets.map((item, ind) => {
    return (
      <div key={ind} style={{ marginBottom: "5px" }}>
        <div
          className="widgets"
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
