import React from "react";
import { themeColor } from "../../constant/const";
import {
  defaultWidthHeight,
  isMobile,
  radioButtonWidget,
  resizeBorderExtraWidth,
  textWidget
} from "../../constant/Utils";
function PlaceholderBorder(props) {
  const getResizeBorderExtraWidth = resizeBorderExtraWidth();
  const defaultWidth = defaultWidthHeight(props.pos.type).width;
  const defaultHeight = defaultWidthHeight(props.pos.type).height;
  const width = () => {
    const getWidth =
      props.placeholderBorder.w || props.pos.Width || defaultWidth;
    return (
      getWidth * props.scale * props.containerScale + getResizeBorderExtraWidth
    );
  };
  const height = () => {
    const getHeight =
      props.placeholderBorder.h || props.pos.Height || defaultHeight;

    return (
      getHeight * props.scale * props.containerScale + getResizeBorderExtraWidth
    );
  };

  const handleMinWidth = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return props.getCheckboxRenderWidth.width + getResizeBorderExtraWidth;
    } else {
      return width();
    }
  };
  const handleMinHeight = () => {
    if (props.pos.type === "checkbox" || props.pos.type === radioButtonWidget) {
      return props.getCheckboxRenderWidth.height + getResizeBorderExtraWidth;
    } else {
      return height();
    }
  };
  return (
    <div
      onMouseEnter={() => !isMobile && props?.setDraggingEnabled(true)}
      onTouchEnd={() =>
        props.pos.type === textWidget && props?.setDraggingEnabled(true)
      }
      className="absolute inline-block w-[14px] h-[14px] hover:cursor-sw-resize"
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
