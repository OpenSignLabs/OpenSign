import { useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { EmailBody } from "./EmailBody";
import {
  contractDocument,
  sendEmailToSigners
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Loader from "../../primitives/Loader";
import { useNavigate } from "react-router";

function CustomizeMail(props) {
  const { t } = useTranslation();
  const editorRef = useRef();
  const navigate = useNavigate();
  const copyUrlRef = useRef(null);
  const [isCustomize, setIsCustomize] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const handleCloseSendmailModal = () => {
    if (props?.handleClose) {
      props?.handleClose();
      return;
    }
    props?.setIsMailModal(false);
    navigate("/report/1MwEuxLEkF");
  };
  const handleOnchangeRequest = () => {
    if (editorRef.current) {
      const html = editorRef.current.editor.root.innerHTML;
      props?.setCustomizeMail((prev) => ({
        ...prev,
        body: html
      }));
    }
  };
  const handleEmailSendToSigners = async () => {
    setIsLoader(true);
    const documentData = await contractDocument(props?.documentId);
    if (documentData && documentData?.length > 0) {
      props?.setDocumentDetails(documentData[0]);
      if (
        documentData?.[0]?.SendinOrder &&
        documentData?.[0]?.SendinOrder === true
      ) {
        const ownerEmail = documentData[0].ExtUserPtr.Email;
        const ownerDetails = documentData[0].Signers.find(
          (x) => x.Email === ownerEmail
        );
        props?.setCurrUserId(ownerDetails?.objectId);
      }
      //function is used to send email to signers for sign the document
      const mailRes = await sendEmailToSigners(
        documentData,
        props?.signerList,
        props?.customizeMail,
        props?.defaultMail,
        isCustomize,
      );
      props?.setIsMailModal(false);
      props?.setIsSend(true);
      setIsLoader(false);
      if (mailRes?.status === "success") {
        props?.setMailStatus("success");
      } else if (mailRes?.status === "quota-reached") {
        props?.setMailStatus("quotareached");
      } else if (mailRes?.status === "daily-quota-reached") {
        props?.setMailStatus("dailyquotareached");
      } else {
        props?.setMailStatus("failed");
      }
      // setMailStatus(mail_status);
    } else {
      alert("something-went-wrong-mssg");
    }
  };
  return (
    <>
      {isLoader ? (
        <div className="absolute w-full h-full flex justify-center items-center bg-black/30 rounded-box z-30">
          <Loader />
        </div>
      ) : (
        <ModalUi
          isOpen={props?.isMailModal}
          title={t("send-mail")}
          handleClose={() => handleCloseSendmailModal()}
        >
          <div className="max-h-96 overflow-y-scroll scroll-hide p-[20px] text-base-content">
            {!isCustomize && <span>{t("placeholder-alert-3")}</span>}
            {
                isCustomize && (
                  <>
                    <EmailBody
                      editorRef={editorRef}
                      requestBody={props?.customizeMail.body}
                      requestSubject={props?.customizeMail.subject}
                      handleOnchangeRequest={handleOnchangeRequest}
                      setCustomizeMail={props?.setCustomizeMail}
                    />
                    <div
                      className="flex justify-end items-center gap-1 mt-2 op-link op-link-primary"
                      onClick={() => {
                        props?.setCustomizeMail(props?.defaultMail);
                      }}
                    >
                      <span>{t("reset-to-default")}</span>
                    </div>
                  </>
                )
            }
            <div className="flex flex-row items-center gap-2 md:gap-6 mt-2">
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => handleEmailSendToSigners()}
                  className="op-btn op-btn-primary font-[500] text-sm shadow"
                >
                  {t("send")}
                </button>
                {isCustomize && (
                  <button
                    onClick={() => setIsCustomize(false)}
                    className="op-btn op-btn-ghost font-[500] text-sm"
                  >
                    {t("close")}
                  </button>
                )}
              </div>
              {
                  !isCustomize && (
                    <span
                      className="op-link op-link-accent text-sm"
                      onClick={() => setIsCustomize(!isCustomize)}
                    >
                      {t("cutomize-email")}
                    </span>
                  )
              }
            </div>

            <div className="flex justify-center items-center mt-3">
              <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
              <span className="ml-[5px] mr-[5px]">{t("or")}</span>
              <span className="h-[1px] w-[20%] bg-[#ccc]"></span>
            </div>
            <div className="my-3">{props?.handleShareList()}</div>
            <p id="copyUrl" ref={copyUrlRef} className="hidden"></p>
          </div>
        </ModalUi>
      )}
    </>
  );
}

export default CustomizeMail;
