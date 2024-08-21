import React from "react";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";

function VerifyEmail(props) {
  const { t } = useTranslation();
  return (
    <dialog className="op-modal op-modal-open absolute z-[1999]">
      <div className="md:w-[40%] w-[80%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
        <h3 className="font-bold text-lg pt-[15px] px-[20px] text-base-content">
          {t("otp-verification")}
        </h3>
        {props.isVerifyModal ? (
          <form
            onSubmit={(e) => {
              props.setIsVerifyModal(false);
              props.handleVerifyEmail(e);
            }}
          >
            <div className="px-6 py-3 text-base-content">
              <label className="mb-2">{t("enter-otp")}</label>
              <input
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
                type="tel"
                pattern="[0-9]{4}"
                className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                placeholder={t("otp-placeholder")}
                value={props.otp}
                onChange={(e) => props.setOtp(e.target.value)}
              />
            </div>
            <div className="px-6 my-3">
              <button type="submit" className="op-btn op-btn-primary">
                {t("verify")}
              </button>
              <button
                className="op-btn op-btn-secondary ml-2"
                onClick={(e) => props.handleResend(e)}
              >
                {t("resend")}
              </button>
            </div>
          </form>
        ) : props.otpLoader ? (
          <div className="h-[150px] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="px-6 py-3 text-base-content">
            <p className="mb-2 text-sm">{t("verify-email")}</p>
            <div className="px-0 mt-3">
              <button
                className="op-btn op-btn-primary"
                type="submit"
                onClick={() => props.handleVerifyBtn()}
              >
                {t("send-otp")}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default VerifyEmail;
