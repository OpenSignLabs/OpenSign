import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { paidUrl } from "../json/plansArr";
import { openInNewTab } from "../constant/Utils";

const SubscribeCard = ({ plan, price, plan_code }) => {
  const { t } = useTranslation();
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
        <h2 className="op-card-title">
          {t("upgrade-to")} {plan ? plan : "PRO"} {t("plan")}
        </h2>
        <p>
          ${price ? price : "29.99"}/month: {t("subscribe-card-plan")}
        </p>
        <div className="op-card-actions justify-end">
          <button
            onClick={() => handlePaidRoute()}
            className="op-btn op-btn-accent"
          >
            {t("upgrade-now")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeCard;
