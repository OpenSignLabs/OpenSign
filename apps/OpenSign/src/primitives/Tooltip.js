import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { openInNewTab } from "../constant/Utils";
const Tooltip = ({ id, message, url, iconColor, isSubscribe }) =>
  url ? (
    <button
      onClick={() => openInNewTab(url)}
      className={
        isSubscribe
          ? "text-center"
          : "text-center opacity-20 pointer-events-none"
      }
    >
      <sup>
        <i
          className="fa-solid fa-question rounded-full"
          style={{
            borderColor: iconColor ? iconColor : "#33bbff",
            color: iconColor ? iconColor : "#33bbff",
            fontSize: 13,
            borderWidth: 1.5,
            padding: "1.5px 4px"
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
            className="fa-solid fa-question rounded-full"
            style={{
              borderColor: iconColor ? iconColor : "#33bbff",
              color: iconColor ? iconColor : "#33bbff",
              fontSize: 13,
              borderWidth: 1.5,
              padding: "1.5px 4px"
            }}
          ></i>
        </sup>
      </a>
      <ReactTooltip id={id ? id : "my-tooltip"} className="max-w-[200px]" />
    </>
  );

export default Tooltip;
