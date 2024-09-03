import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const SubscribeCard = ({ plan, price }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handlePaidRoute = () => navigate("/subscription");
  const premiumPrice = price ? "$" + price : "$9.99";
  const addonPrice = "$0.15";
  const plandName = plan ? plan.toLowerCase() : "Paid";
  return (
    <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
      <div className="op-card-body">
        <h2 className="op-card-title">
          {t("upgrade-to")} {plan ? plan : "Paid"} {t("plan")}
        </h2>
        <p>
          {plandName?.includes("team")
            ? t("subscribe-card-teamplan")
            : t("subscribe-card-plan", { premiumPrice, addonPrice })}
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
