import React from "react";
import { openInNewTab } from "../constant/Utils";

function Upgrade({ message }) {
  return (
    <sup>
      <span
        onClick={() => {
          const url = window.location.origin + "/subscription";
          openInNewTab(url);
        }}
        className="text-blue-800 text-sm cursor-pointer underline"
      >
        {message ? message : "Upgrade now"}
      </span>
    </sup>
  );
}

export default Upgrade;
