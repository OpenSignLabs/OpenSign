import React from "react";
import { useNavigate } from "react-router-dom";
import { paidUrl } from "../json/plansArr";
import { openInNewTab } from "../constant/Utils";

const SubscribeCard = ({ plan, price, plan_code }) => {
  const navigate = useNavigate();
  const handlePaidRoute = () => {
    const route = paidUrl(plan_code);
    if (route === "/subscription") {
      navigate(route);
    } else {
      openInNewTab(route, "_self");
    }
  };
  return (
    <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
      <div className="op-card-body">
        <h2 className="op-card-title">Upgrade to {plan ? plan : "PRO"} Plan</h2>
        <p>
          ${price ? price : "29.99"}/month: Sign 100 docs using API. Only
          $0.15/doc after that.
        </p>
        <div className="op-card-actions justify-end">
          <button
            onClick={() => handlePaidRoute()}
            className="op-btn op-btn-accent"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeCard;
