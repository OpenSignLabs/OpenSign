import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const QuotaCard = ({ isSignyourself, handlClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return isSignyourself ? (
    <>
      <div
        className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-primary-content absolute right-2 top-2 z-40"
        onClick={() => handlClose && handlClose()}
      >
        ✕
      </div>
      <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
        <div className="op-card-body">
          <h2 className="op-card-title">
            {t("upgrade-to") + " Paid " + t("plan")}
          </h2>
          <p>{t("quotamailselfsign")}</p>
          <div className="op-card-actions justify-end">
            <button
              onClick={() => navigate("/subscription")}
              className="op-btn op-btn-accent"
            >
              {t("upgrade-now")}
            </button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
        <div className="op-card-body">
          <p>{t("quotamail")}</p>
          <p>{t("quotamailTip")}</p>
          <div className="op-card-actions justify-end">
            <button
              onClick={() => navigate("/subscription")}
              className="op-btn op-btn-accent"
            >
              {t("upgrade-now")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotaCard;
