import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AgreementContent from "./AgreementContent";

function AgreementSign(props) {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const [isShowAgreeTerms, setIsShowAgreeTerms] = useState(false);

  return (
    <>
      <div className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box overflow-y-auto hide-scrollbar text-sm p-4">
          <div className="flex flex-row items-center">
            <label className="inline-flex justify-center items-center cursor-pointer mb-0">
              {/* 1) This div becomes the “fake” checkbox */}
              <div
                data-tut="IsAgree"
                className={`w-6 h-6 border-2 mr-3 rounded-full flex text-center items-center justify-center ${isChecked ? "op-border-primary" : "border-red-500"}`}
              >
                {isChecked ? (
                  <span className="op-text-primary text-sm font-bold">✓</span>
                ) : (
                  <span className="text-red-500 text-sm font-bold">X</span>
                )}
              </div>
              {/* 2) Visually hide the native checkbox but keep it in the DOM */}
              <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                  if (e.target.checked) {
                    props.setIsAgreeTour(false);
                  }
                  props.showFirstWidget();
                }}
              />
            </label>
            <div className="text-[11px] md:text-base text-base-content">
              <span>{t("agree-p1")}</span>
              <span
                className="font-bold text-blue-600 cursor-pointer"
                onClick={() => {
                  setIsShowAgreeTerms(true);
                  props.setIsAgreeTour(false);
                }}
              >
                {t("agree-p2")}
              </span>
              <span> {t("agree-p3")}</span>
            </div>
          </div>
          <div className="flex ml-[35px] mt-3">
            <button
              onClick={() => {
                if (isChecked) {
                  props.setIsAgreeTour(false);
                  props.setIsAgree(true);
                } else {
                  props.setIsAgreeTour(true);
                }
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
          setIsAgreeTour={props.setIsAgreeTour}
          setIsAgree={props.setIsAgree}
          setIsShowAgreeTerms={setIsShowAgreeTerms}
          showFirstWidget={props.showFirstWidget}
        />
      )}
    </>
  );
}

export default AgreementSign;
