import React from "react";
import { openInNewTab } from "../constant/Utils";
import { useTranslation } from "react-i18next";

function Upgrade({ message }) {
  const { t } = useTranslation();
  return (
    <sup>
      <span
        onClick={() => {
          const url = window.location.origin + "/subscription";
          openInNewTab(url);
        }}
        className="op-link op-link-accent text-sm"
      >
        {message ? message : t("upgrade-now")}
      </span>
    </sup>
  );
}

export default Upgrade;
