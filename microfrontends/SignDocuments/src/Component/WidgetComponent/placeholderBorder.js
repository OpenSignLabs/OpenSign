import React from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { defaultWidthHeight, resizeBorderExtraWidth } from "../../utils/Utils";
function PlaceholderBorder(props) {
  const getResizeBorderExtraWidth = resizeBorderExtraWidth();
  const defaultWidth =
    props.pos.type === "checkbox" && props.isPlaceholder
      ? 50
      : defaultWidthHeight(props.pos.type).width;
  const defaultHeight =
    props.pos.type === "checkbox" && props.isPlaceholder
      ? 50
      : defaultWidthHeight(props.pos.type).height;

  return (
    <div
      className="borderResize"
      style={{
        borderColor: themeColor(),
        borderStyle: "dashed",

        width: props.pos.Width
          ? props.pos.Width + getResizeBorderExtraWidth
          : defaultWidth + getResizeBorderExtraWidth,
        height: props.pos.Height
          ? props.pos.Height + getResizeBorderExtraWidth
          : defaultHeight + getResizeBorderExtraWidth,
        borderWidth: "0.2px",
        overflow: "hidden"
      }}
    ></div>
  );
}

export default PlaceholderBorder;
