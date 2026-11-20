import { useState } from "react";
import Parse from "parse";
import axios from "axios";
import { useTranslation } from "react-i18next";
import VerifyEmail from "./VerifyEmail";
import { handleSendOTP } from "../../constant/Utils";

const EmailVerificationModal = ({ isOpen, onVerified, email, jwttoken }) => {
  const { t } = useTranslation();
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const verificationEmail = email || Parse.User.current()?.getEmail();

  if (!isOpen) return null;

  const sendOtp = async () => {
    setIsVerifyModal(true);
    await handleSendOTP(verificationEmail);
  };

  const resendOtp = async (event) => {
    event.preventDefault();
    setOtpLoader(true);
    await handleSendOTP(verificationEmail);
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    setOtpLoader(true);
    try {
      let response;
      if (jwttoken) {
        const url = `${localStorage.getItem("baseUrl")}functions/verifyemail`;
        const result = await axios.post(
          url,
          { otp, email: verificationEmail },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              jwttoken
            }
          }
        );
        response = result.data?.result;
      } else {
        response = await Parse.Cloud.run("verifyemail", {
          otp,
          email: verificationEmail
        });
      }
      if (
        response?.message === "Email is verified." ||
        response?.message === "Email is already verified."
      ) {
        Parse.User.current()?.set("emailVerified", true);
        setOtp("");
        onVerified();
        alert(
          response.message === "Email is verified."
            ? t("Email-verified-alert-1")
            : t("Email-verified-alert-2")
        );
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };

  return (
    <VerifyEmail
      isVerifyModal={isVerifyModal}
      otp={otp}
      setOtp={setOtp}
      otpLoader={otpLoader}
      isStandalone
      handleVerifyEmail={verifyEmail}
      handleResend={resendOtp}
      handleVerifyBtn={sendOtp}
    />
  );
};

export default EmailVerificationModal;
