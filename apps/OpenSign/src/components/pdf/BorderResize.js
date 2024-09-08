import React from "react";

function BorderResize({ right, top }) {
  return (
    <div
      className={`${right ? `-right-[12px]` : "-right-[1px]"} ${
        top ? `-bottom-[11px]` : "-bottom-[1px]"
      } absolute inline-block w-[14px] h-[14px] hover:cursor-sw-resize border-r-[3px] border-b-[3px] border-[#188ae2]`}
    ></div>
  );
}

export default BorderResize;
