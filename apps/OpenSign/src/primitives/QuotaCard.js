import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const QuotaCard = ({ isPaidInfo, handlClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return isPaidInfo ? (
    <>
      <div
        className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-primary-content absolute right-2 top-2 z-40"
        onClick={() => handlClose && handlClose()}
      >
        ✕
      </div>
      <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
        <div className="op-card-body">
          <h2 className="op-card-title">{t("quota-mail-info-head")}</h2>
          <p>{t("quota-mail-info")}</p>
          <p>
            <Trans i18nKey={"quota-mail-tip"}>
              Tip: You can still sign <strong>unlimited documents</strong> by
              manually sharing the signing request links.
            </Trans>
          </p>
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
          <p>{t("quota-mail")}</p>
          <p>{t("quota-mail-tip")}</p>
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
