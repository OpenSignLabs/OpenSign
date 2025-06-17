import React, { useState } from "react";
import {
  handleToPrint,
} from "../../constant/Utils";
import {
  emailRegex,
} from "../../constant/const";
import Loader from "../../primitives/Loader";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Parse from "parse";

function EmailComponent({
  isEmail,
  setIsEmail,
  setSuccessEmail,
  pdfDetails,
  setIsAlert,
  setIsDownloadModal
}) {
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState([]);
  const [emailValue, setEmailValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [isDownloading, setIsDownloading] = useState("");
  const isAndroid = /Android/i.test(navigator.userAgent);

  //function for send email
  const sendEmail = async () => {
    setIsLoading(true);
    const params = { docId: pdfDetails?.[0]?.objectId, recipients: emailList };
    const sendmail = await Parse.Cloud.run("forwarddoc", params);
    console.log("sendmail ", sendmail);
    if (sendmail?.status === "success") {
      setSuccessEmail(true);
      setIsEmail(false);
      setTimeout(() => {
        setSuccessEmail(false);
        setEmailValue("");
        setEmailList([]);
      }, 1500);
      setIsLoading(false);
    }
    else {
      setIsLoading(false);
      setIsEmail(false);
      setIsAlert({
        isShow: true,
        alertMessage: t("something-went-wrong-mssg")
      });
      setEmailValue("");
      setEmailList([]);
    }
  };

  //function for remove email
  const removeChip = (index) => {
    const updateEmailCount = emailList.filter((data, key) => key !== index);
    setEmailList(updateEmailCount);
  };
  //function for get email value
  const handleEmailValue = (e) => {
    const value = e.target.value?.toLowerCase()?.replace(/\s/g, "");
    setEmailErr(false);
    setEmailValue(value);
  };

  //function for save email in array after press enter
  const handleEnterPress = (e) => {
    const pattern = emailRegex;
    const validate = emailValue?.match(pattern);
    if (e.key === "Enter" && emailValue) {
      if (validate) {
        const emailLowerCase = emailValue?.toLowerCase();
        setEmailList((prev) => [...prev, emailLowerCase]);
        setEmailValue("");
      } else {
        setEmailErr(true);
      }
    } else if (e === "add" && emailValue) {
      if (validate) {
        const emailLowerCase = emailValue?.toLowerCase();
        setEmailList((prev) => [...prev, emailLowerCase]);
        setEmailValue("");
      } else {
        setEmailErr(true);
      }
    }
  };
  const handleClose = () => {
    setIsEmail(false);
    setEmailValue("");
    setEmailList([]);
  };
  return (
    <div>
      {/* isEmail */}
      {isEmail && (
        <ModalUi isOpen showHeader={false}>
          {isLoading && (
            <div className="absolute w-full h-full flex flex-col justify-center items-center z-[20] bg-[#e6f2f2]/70">
              <Loader />
              <span className="text-[12px] text-base-content">
                {t("loader")}
              </span>
            </div>
          )}
          {isDownloading === "pdf" && (
            <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30">
              <Loader />
            </div>
          )}
          <div className="flex justify-between items-center py-[10px] px-[20px] border-b-[1px] border-base-content">
            <span className="text-base-content font-bold text-sm md:text-lg">
              {t("successfully-signed")}
            </span>
            <div className="flex flex-row">
              {!isAndroid && (
                <button
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, pdfDetails)
                  }
                  className="op-btn op-btn-neutral op-btn-sm text-xs md:text-[15px]"
                >
                  <i className="fa-light fa-print" aria-hidden="true"></i>
                  {t("print")}
                </button>
              )}
              <button
                className="op-btn op-btn-primary op-btn-sm text-xs md:text-[15px] ml-2"
                onClick={() => {
                  handleClose();
                  setIsDownloadModal(true);
                }}
              >
                <i className="fa-light fa-download" aria-hidden="true"></i>
                {t("download")}
              </button>
            </div>
          </div>
          <div className="h-full p-[20px]">
            <p className="font-medium text-[15px] mb-[5px] text-base-content align-baseline">
              {t("email-mssg")}
            </p>
            {emailList.length > 0 ? (
              <div className="p-0 border-[1px] op-border-primary w-full rounded-md text-[15px] overflow-hidden">
                <div className="flex flex-row flex-wrap">
                  {emailList.map((data, ind) => {
                    return (
                      <div
                        className="flex flex-row items-center op-bg-primary mx-[2px] mt-[2px] rounded-md py-[5px] px-[10px]"
                        key={ind}
                      >
                        <span className="text-base-100 text-[13px]">
                          {data}
                        </span>
                        <span
                          className="text-base-100 text-[13px] font-semibold ml-[7px] cursor-pointer"
                          onClick={() => removeChip(ind)}
                        >
                          <i className="fa-light fa-xmark"></i>
                        </span>
                      </div>
                    );
                  })}
                </div>
                {emailList.length <= 9 && (
                  <input
                    type="email"
                    value={emailValue}
                    className="p-[10px] rounded-md w-full text-[15px] bg-transparent outline-none"
                    onChange={handleEmailValue}
                    onKeyDown={handleEnterPress}
                    onBlur={() => emailValue && handleEnterPress("add")}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(t("input-required"))
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                )}
              </div>
            ) : (
              <div>
                <input
                  type="email"
                  value={emailValue}
                  className="p-[10px] pb-[20px] text-base-content rounded-md w-full text-[15px] outline-none bg-transparent border-[1px] op-border-primary"
                  onChange={handleEmailValue}
                  onKeyDown={handleEnterPress}
                  placeholder={t("enter-email-plaholder")}
                  onBlur={() => emailValue && handleEnterPress("add")}
                  onInvalid={(e) =>
                    e.target.setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                />
              </div>
            )}
            {emailErr && (
              <p className="text-xs text-[red] ml-1.5 mt-0.5">
                {t("email-error-1")}
              </p>
            )}
            <div className="mt-2">
              <button
                type="button"
                className="op-btn op-btn-secondary"
                onClick={() => emailList.length > 0 && sendEmail()}
              >
                {t("send")}
              </button>
              <button
                type="button"
                className="op-btn op-btn-ghost text-base-content ml-2"
                onClick={() => handleClose()}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </ModalUi>
      )}
    </div>
  );
}

export default EmailComponent;
