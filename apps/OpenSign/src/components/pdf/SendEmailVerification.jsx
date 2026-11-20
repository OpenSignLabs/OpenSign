import { useId, useState } from "react";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import { handleSendOTP } from "../../constant/Utils";

function SendEmailVerification({ onVerified }) {
  const { t } = useTranslation();
  const otpId = useId();
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const email = Parse.User.current()?.getEmail();

  const sendOtp = async () => {
    setIsBusy(true);
    setError("");
    setNotice("");
    try {
      if (!email) throw new Error(t("something-went-wrong-mssg"));
      await handleSendOTP(email, { throwOnError: true });
      setIsOtpSent(true);
      setOtp("");
      setNotice(t("otp-sent-alert"));
    } catch (err) {
      setError(err.message || t("something-went-wrong-mssg"));
    } finally {
      setIsBusy(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setError("");
    setNotice("");
    try {
      if (!email) throw new Error(t("something-went-wrong-mssg"));
      const result = await Parse.Cloud.run("verifyemail", { email, otp });
      if (
        result?.message !== "Email is verified." &&
        result?.message !== "Email is already verified."
      ) {
        throw new Error(t("something-went-wrong-mssg"));
      }
      onVerified();
    } catch (err) {
      setError(err.message || t("something-went-wrong-mssg"));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div aria-busy={isBusy}>
      <p className="mb-2">{t("verify-email")}</p>
      <p className="mb-2 break-all">{email}</p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {isOtpSent ? (
        <form onSubmit={verifyOtp}>
          <input
            id={otpId}
            required
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder={t("otp-placeholder")}
            className="w-full op-input op-input-bordered op-input-sm text-xs mt-2"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            disabled={isBusy}
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="op-btn op-btn-primary"
              disabled={isBusy}
            >
              {t("verify")}
            </button>
            <button
              type="button"
              className="op-btn op-btn-secondary"
              onClick={sendOtp}
              disabled={isBusy}
            >
              {t("resend")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="op-btn op-btn-primary mt-3"
          onClick={sendOtp}
          disabled={isBusy}
        >
          {t("send-otp")}
        </button>
      )}
    </div>
  );
}

export default SendEmailVerification;
