import React from "react";
import { themeColor } from "../../constant/const";
import {
  defaultWidthHeight,
  radioButtonWidget,
  resizeBorderExtraWidth
} from "../../constant/Utils";
function PlaceholderBorder(props) {
  const getResizeBorderExtraWidth =
    props.pos.type === "checkbox" || props.pos.type === radioButtonWidget
      ? 38
      : resizeBorderExtraWidth();
  const defaultWidth = defaultWidthHeight(props.pos.type).width;
  const defaultHeight = defaultWidthHeight(props.pos.type).height;

  const handleMinWidth = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return "120%";
    } else {
      return props.pos.Width
        ? props.pos.Width + getResizeBorderExtraWidth
        : defaultWidth + getResizeBorderExtraWidth;
    }
  };
  const handleMinHeight = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return "120%";
    } else {
      return props.pos.Height
        ? props.pos.Height + getResizeBorderExtraWidth
        : defaultHeight + getResizeBorderExtraWidth;
    }
  };
  return (
    <div
      onMouseEnter={props?.setDraggingEnabled(true)}
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
