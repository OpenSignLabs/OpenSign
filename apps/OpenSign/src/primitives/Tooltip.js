import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { openInNewTab } from "../constant/Utils";
const Tooltip = ({ id, message, url, iconColor }) =>
  url ? (
    <button onClick={() => openInNewTab(url)} className={"text-center"}>
      <sup>
        <i
          className="fa-solid fa-question rounded-full border-[1.5px] py-[1.5px] px-[4px] text-[13px]"
          style={{
            borderColor: iconColor ? iconColor : "#33bbff",
            color: iconColor ? iconColor : "#33bbff"
          }}
        ></i>
      </sup>
    </button>
  ) : (
    <>
      <a
        data-tooltip-id={id ? id : "my-tooltip"}
        data-tooltip-content={message}
        className="z-50"
      >
        <sup>
          <i
            className="fa-solid fa-question rounded-full border-[1.5px] py-[1.5px] px-[4px] text-[13px]"
            style={{
              borderColor: iconColor ? iconColor : "#33bbff",
              color: iconColor ? iconColor : "#33bbff"
            }}
          ></i>
        </sup>
      </a>
      <ReactTooltip
        id={id ? id : "my-tooltip"}
        className="max-w-[200px]  z-[200]"
      />
    </>
  );

export default Tooltip;
