import React from "react";
import { useNavigate } from "react-router-dom";
import { openInNewTab } from "../constant/Utils";

function Upgrade({ message, newWindow }) {
  const navigation = useNavigate();

  return (
    <sup>
      <span
        onClick={() => {
          if (newWindow) {
            const url = window.location.origin + "/subscription";
            openInNewTab(url);
          } else {
            navigation("/subscription");
          }
        }}
        className="text-blue-800 text-sm cursor-pointer underline"
      >
        {message ? message : "Upgrade now"}
      </span>
    </sup>
  );
}

export default Upgrade;
