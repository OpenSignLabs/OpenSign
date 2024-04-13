import React from "react";
import { useNavigate } from "react-router-dom";

function Upgrade({ message }) {
  const navigation = useNavigate();

  return (
    <sup>
      <span
        onClick={() => navigation("/subscription")}
        className="text-blue-800 text-sm cursor-pointer underline"
      >
        {message ? message : "Upgrade now"}
      </span>
    </sup>
  );
}

export default Upgrade;
