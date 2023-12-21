import React from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { resizeBorderExtraWidth } from "../../utils/Utils";
function PlaceholderBorder(props) {
  const getResizeBorderExtraWidth = resizeBorderExtraWidth();

  return (
    <div
      className="borderResize"
      style={{
        borderColor: themeColor(),
        borderStyle: "dashed",
        width: props.pos.Width
          ? props.pos.Width + getResizeBorderExtraWidth
          : 150 + getResizeBorderExtraWidth,
        height: props.pos.Height
          ? props.pos.Height + getResizeBorderExtraWidth
          : 60 + getResizeBorderExtraWidth,
        borderWidth: "0.2px",
        overflow: "hidden"
      }}
    ></div>
  );
}

export default PlaceholderBorder;
