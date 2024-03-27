import React from "react";

const PremiumAlertHeader = ({ message }) => (
  <marquee className="bg-yellow-300 text-black px-2">
    {message
      ? message
      : "Currently free in Beta, this feature will incur a fee later."}
  </marquee>
);

export default PremiumAlertHeader;
