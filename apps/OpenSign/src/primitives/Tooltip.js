import React from "react";
// import * as HoverCard from "@radix-ui/react-hover-card";
// import "../styles/opensigndrive.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
const Tooltip = ({ children, message }) => (
  <>
    <a data-tooltip-id="my-tooltip" data-tooltip-content={message}>
      {children ? (
        children
      ) : (
        <i className="fa-solid fa-question  border-[1.5px] px-1.5 py-0.5 rounded-full border-[#33bbff] text-xs text-[#33bbff]"></i>
      )}
    </a>
    <ReactTooltip id="my-tooltip" className="max-w-[200px]" />
  </>
);

export default Tooltip;
