import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { openInNewTab } from "../constant/Utils";
const Tooltip = ({ children, id, message, url, iconColor }) =>
  url ? (
    <button onClick={() => openInNewTab(url)}>
      {children ? (
        children
      ) : (
        <i className="fa-solid fa-question border-[1.5px] px-1.5 py-0.5 rounded-full border-[#33bbff] text-xs text-[#33bbff]"></i>
      )}
    </button>
  ) : (
    <>
      <a
        data-tooltip-id={id ? id : "my-tooltip"}
        data-tooltip-content={message}
        className="z-50"
      >
        {children ? (
          children
        ) : (
          <i
            className="fa-solid fa-question z-50 border-[1.5px] px-1.5 py-0.5 rounded-full text-xs"
            style={{
              borderColor: iconColor ? iconColor : "#33bbff",
              color: iconColor ? iconColor : "#33bbff"
            }}
          ></i>
        )}
      </a>
      <ReactTooltip id={id ? id : "my-tooltip"} className="max-w-[200px]" />
    </>
  );

export default Tooltip;
