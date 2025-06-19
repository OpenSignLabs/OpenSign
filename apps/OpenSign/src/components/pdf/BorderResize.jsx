import React from "react";

function BorderResize(props) {
  const getHeight = () => {
    const height = props.posHeight(props.pos, props.isSignYourself);
    if (height > 14) {
      return "14px";
    } else {
      return `${height}px`;
    }
  };

  return (
    <div
      style={{ width: getHeight() || "14px", height: getHeight() || "14px" }}
      className={`${props.right ? `-right-[12px]` : "-right-[2px]"} ${
        props.top ? `-bottom-[12px]` : "-bottom-[2px]"
      } absolute inline-block hover:cursor-sw-resize border-r-[3px] border-b-[3px] border-[#188ae2]`}
    ></div>
  );
}

export default BorderResize;
