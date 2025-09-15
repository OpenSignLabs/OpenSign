import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Confetti from "react-confetti"; // Import the confetti library
import {
  getBase64FromUrl,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleToPrint,
} from "../constant/Utils";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import DownloadPdfZip from "../primitives/DownloadPdfZip";
import CheckCircle from "../primitives/CheckCircle";

const DocSuccessPage = () => {
  const { t } = useTranslation();
  const signed = window.location?.search?.includes("docid");
  const sent = window.location?.search?.includes("message");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [pdfDetails, setPdfDetails] = useState([]);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const [showConfetti, setShowConfetti] = useState(true); // State to control confetti

  useEffect(() => {
    initialsetup();
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const initialsetup = async () => {
    const search = window.location.search.split("?")[1];
    if (search) {
      const urlParams = new URLSearchParams(search);
      const docId = urlParams.get("docid");
      const docUrl = urlParams.get("docurl");
      const certificate = urlParams.get("certificate");
      const completed = urlParams?.get("completed") || false;
      const details = {
        objectId: docId,
        SignedUrl: docUrl,
        CertificateUrl: certificate,
        IsCompleted: completed,
      };
      setPdfDetails([details]);
      const base64Pdf = await getBase64FromUrl(docUrl);
      if (base64Pdf) {
        setPdfBase64Url(base64Pdf);
      }
    }
  };

  const handleDownload = () => {
    if (
      pdfDetails?.[0]?.IsCompleted
    ) {
      setIsDownloadModal(true);
    } else {
      handleDownloadPdf(pdfDetails, setIsDownloading, pdfBase64Url);
    }
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      {sent ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-8 text-center">
          <div className="max-w-lg md:max-w-2xl bg-white rounded-lg shadow-lg p-3 md:p-10">
            {t("doc-sent")}
          </div>
        </div>
      ) : signed ? (
        <>
          <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-8 text-center">
            <div className="max-w-lg md:max-w-2xl bg-white rounded-lg shadow-lg p-3 md:p-10">
              <div className="flex flex-col items-center space-y-4 ">
                <CheckCircle className="text-green-500 w-12 h-12 md:w-14 md:h-14" />
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                  {pdfDetails?.[0]?.IsCompleted
                    ? t("document-has-been-signed")
                    : t("document-has-been-signed-by-you")}
                </h1>
                {pdfDetails?.[0]?.IsCompleted && (
                  <p className="text-sm md:text-base text-gray-600">
                    {t("participant-completed-signing")}
                  </p>
                )}
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="font-medium text-sm md:text-[13px] md:px-4 py-2 op-btn op-btn-primary"
                  onClick={() => handleDownload()}
                >
                  <i className="fa-light fa-download" aria-hidden="true"></i>
                  <span>{t("download")}</span>
                </button>

                {
                    pdfDetails?.[0]?.IsCompleted && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadCertificate(
                            pdfDetails,
                            setIsDownloading
                          )
                        }
                        className="font-medium text-sm md:text-[13px] md:px-4 py-2 op-btn op-btn-secondary"
                      >
                        <i
                          className="fa-light fa-award mx-[3px] md:mx-0"
                          aria-hidden="true"
                        ></i>
                        <span>{t("certificate")}</span>
                      </button>
                    )
                }
                <button
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, pdfDetails)
                  }
                  type="button"
                  className="font-medium text-sm md:text-[13px] px-4 py-2 op-btn op-btn-neutral"
                >
                  <i className="fa-light fa-print" aria-hidden="true"></i>
                  <span>{t("print")}</span>
                </button>
              </div>
              {/* Footer Message */}
              <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
                {t("you-will-receive-email-shortly")}
              </p>
            </div>
          </div>
          {isDownloading === "pdf" && (
            <div className="fixed z-[1000] inset-0 flex justify-center items-center bg-black bg-opacity-30">
              <Loader />
            </div>
          )}
          <ModalUi
            isOpen={
              isDownloading === "certificate" ||
              isDownloading === "certificate_err"
            }
            title={
              isDownloading === "certificate" ||
              isDownloading === "certificate_err"
                ? t("generating-certificate")
                : t("pdf-download")
            }
            handleClose={() => setIsDownloading("")}
          >
            <div className="p-3 md:p-5 text-sm md:text-base text-center text-base-content">
              {isDownloading === "certificate" ? (
                <p>{t("generate-certificate-alert")}</p>
              ) : (
                <p>{t("generate-certificate-err")}</p>
              )}
            </div>
          </ModalUi>
          <DownloadPdfZip
            setIsDownloadModal={setIsDownloadModal}
            isDownloadModal={isDownloadModal}
            pdfDetails={pdfDetails}
            isDocId={true}
            pdfBase64={pdfBase64Url}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DocSuccessPage;
