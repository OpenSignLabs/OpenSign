import React from "react";
import { themeColor } from "../../constant/const";
import {
  defaultWidthHeight,
  isMobile,
  radioButtonWidget,
  resizeBorderExtraWidth
} from "../../constant/Utils";
function PlaceholderBorder(props) {
  const getResizeBorderExtraWidth = resizeBorderExtraWidth();
  const defaultWidth = defaultWidthHeight(props.pos.type).width;
  const defaultHeight = defaultWidthHeight(props.pos.type).height;

  const handleMinWidth = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return props.getCheckboxRenderWidth.width + getResizeBorderExtraWidth;
    } else {
      return props.pos.Width
        ? props.pos.Width + getResizeBorderExtraWidth
        : defaultWidth + getResizeBorderExtraWidth;
    }
  };
  const handleMinHeight = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return props.getCheckboxRenderWidth.height + getResizeBorderExtraWidth;
    } else {
      return props.pos.Height
        ? props.pos.Height + getResizeBorderExtraWidth
        : defaultHeight + getResizeBorderExtraWidth;
    }
  };
  return (
    <div
      onMouseEnter={() => !isMobile && props?.setDraggingEnabled(true)}
      className="borderResize"
      style={{
        borderColor: themeColor,
        borderStyle: "dashed",
        minWidth: handleMinWidth(),
        minHeight: handleMinHeight(),
        borderWidth: "0.2px",
        overflow: "hidden"
      }}
    ></div>
  );
}

export default PlaceholderBorder;
