import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
function DefaultSignature(props) {
  const { t } = useTranslation();
  const defaultSignImg = useSelector((state) => state.widget.defaultSignImg);
  const myInitial = useSelector((state) => state.widget.myInitial);
  const tabName = ["my-signature", "my-initials"];
  const [activeTab, setActiveTab] = useState(0);
  const confirmToaddDefaultSign = (type) => {
    if (props?.xyPosition.length > 0) {
      //check signature or initial widgets exist or not for auto signing
      const getCurrentSignerXY = props?.xyPosition.filter(
        (data) => data.Id === props.uniqueId
      );
      const checkIsSignInitialExist = getCurrentSignerXY?.every(
        (placeholderObj) =>
          placeholderObj?.placeHolder?.some((placeholder) =>
            placeholder?.pos?.some((posItem) => posItem?.type === type)
          )
      );
      if (checkIsSignInitialExist) {
        props?.setDefaultSignAlert({
          isShow: true,
          alertMessage: t("default-sign-alert", { widgetsType: type }),
          type: type
        });
      } else {
        props?.setDefaultSignAlert({
          isShow: true,
          alertMessage: t("defaultSign-alert", { widgetsType: type })
        });
      }
    } else {
      props?.setDefaultSignAlert({
        isShow: true,
        alertMessage: t("please-select-position!")
      });
    }
  };

  return (
    <div data-tut="reactourThird">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        <p className="text-base-content">{t("signature")}</p>
      </div>
      <div className="flex justify-center items-center mt-2">
        <div role="tablist" className="op-tabs op-tabs-bordered">
          {tabName.map((tabData, ind) => (
            <div
              onClick={() => setActiveTab(ind)}
              key={ind}
              role="tab"
              className={`${
                activeTab === ind ? "op-tab-active" : ""
              } op-tab flex items-center pb-10 md:pb-0`}
            >
              <span className="ml-1 text-[7px] font-medium md:font-normal md:text-[12px]">
                {t(`${tabData}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center mt-[10px] font-semibold relative">
        <div className="op-card shadow-md h-[111px] w-[90%] p-2">
          {activeTab === 0 ? (
            <img
              alt="signature"
              className="w-full h-full object-contain"
              src={defaultSignImg}
            />
          ) : (
            activeTab === 1 &&
            (myInitial ? (
              <img
                alt="signature"
                className="w-full h-full object-contain"
                src={myInitial}
              />
            ) : (
              <div className="flex justify-center items-center h-full">
                <span>{t("initial-alert")}</span>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="op-btn op-btn-primary op-btn-sm mt-[10px]"
          onClick={() =>
            confirmToaddDefaultSign(
              activeTab === 0 ? "signature" : activeTab === 1 && "initials"
            )
          }
          disabled={
            activeTab === 0 && !props?.isDefault
              ? true
              : activeTab === 1 && !myInitial
                ? true
                : false
          }
        >
          {t("auto-sign-all")}
        </button>
        {!props.isDefault && (
          <div className="absolute bg-black/70 text-white w-full h-full flex items-center justify-center text-[11px] cursor-default">
            <span className="-rotate-45">
              Document creator has disabled this option
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultSignature;
