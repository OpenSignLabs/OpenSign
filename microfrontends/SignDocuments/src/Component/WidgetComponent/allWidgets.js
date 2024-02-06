import React, { useRef, useState } from "react";
import { getWidgetType } from "../../utils/Utils";

function AllWidgets(props) {
  return props.updateWidgets.map((item, ind) => {
    return (
      <div key={ind} style={{ marginBottom: "10px" }}>
        <div
          className="widgets"
          onClick={(e) => {
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

export default AllWidgets;
