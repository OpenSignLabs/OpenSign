import React from "react";
import { useTranslation } from "react-i18next";
function DefaultSignature({ defaultSignImg, xyPostion, setDefaultSignAlert }) {
  const { t } = useTranslation();

  const confirmToaddDefaultSign = () => {
    if (xyPostion.length > 0) {
      setDefaultSignAlert({
        isShow: true,
        alertMessage: t("default-sign-alert")
      });
    } else {
      setDefaultSignAlert({
        isShow: true,
        alertMessage: t("please-select-position!")
      });
    }
  };

  return (
    <div data-tut="reactourThird">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        {t("signature")}
      </div>
      <div className="flex flex-col items-center mt-[10px] font-semibold">
        <p className="text-base-content">{t("Your-Signature")}</p>
        <div className="op-card shadow-md h-[111px] w-[90%] p-2">
          <img
            alt="signature"
            className="w-full h-full object-contain"
            src={defaultSignImg}
          />
        </div>
        <button
          type="button"
          className="op-btn op-btn-primary op-btn-sm mt-[10px]"
          onClick={() => confirmToaddDefaultSign()}
        >
          {t("auto-sign-all")}
        </button>
      </div>
    </div>
  );
}

export default DefaultSignature;
