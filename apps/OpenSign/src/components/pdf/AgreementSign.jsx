import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AgreementContent from "./AgreementContent";

function AgreementSign(props) {
  const { t } = useTranslation();
  const [isShowAgreeTerms, setIsShowAgreeTerms] = useState(false);

  return (
    <>
      <div className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box overflow-y-auto hide-scrollbar text-sm p-4">
          <div className="flex flex-row items-center">
            <div className="text-[11px] md:text-base text-base-content">
              <span>{t("agree-p1")}</span>
              <span
                className="font-bold text-blue-600 cursor-pointer"
                onClick={() => {
                  setIsShowAgreeTerms(true);
                }}
              >
                {t("agree-p2")}
              </span>
              <span> {t("agree-p3")}</span>
            </div>
          </div>
          <div className="flex mt-3">
            <button
              onClick={() => {
                props.setIsAgree(true);
                props.showFirstWidget();
              }}
              className="op-btn op-btn-primary op-btn-sm w-full md:w-auto"
            >
              {t("agrre-button")}
            </button>
          </div>
          <div className="mt-2  text-base-content">
            <span className="text-[11px]">{t("agreement-note")}</span>
          </div>
        </div>
      </div>
      {isShowAgreeTerms && (
        <AgreementContent
          setIsAgree={props.setIsAgree}
          setIsShowAgreeTerms={setIsShowAgreeTerms}
          showFirstWidget={props.showFirstWidget}
        />
      )}
    </>
  );
}

export default AgreementSign;
