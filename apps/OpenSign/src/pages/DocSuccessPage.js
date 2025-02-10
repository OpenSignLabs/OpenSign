import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getBase64FromUrl,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleToPrint
} from "../constant/Utils";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import DownloadPdfZip from "../primitives/DownloadPdfZip";

const DocSuccessPage = () => {
  const signed = window.location?.search?.includes("docid");
  const sent = window.location?.search?.includes("message");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [pdfDetails, setPdfDetails] = useState([]);
  const [pdfBase64Url, setPdfBase64Url] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    initialsetup();
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
        IsCompleted: completed
      };
      setPdfDetails([details]);
      const base64Pdf = await getBase64FromUrl(docUrl);
      if (base64Pdf) {
        setPdfBase64Url(base64Pdf);
      }
    }
  };
  const handleDownload = () => {
    if (pdfDetails?.[0]?.IsCompleted) {
      setIsDownloadModal(true);
    } else {
      handleDownloadPdf(pdfDetails, setIsDownloading, pdfBase64Url);
    }
  };
  return (
    <div className="flex h-screen justify-center items-center text-sm md:text-base">
      {sent ? (
        <div>{t("doc-sent")}</div>
      ) : signed ? (
        <div className="text-center">
          <p>
            {pdfDetails?.[0]?.IsCompleted
              ? t("document-signed-alert-4")
              : t("document-signed-alert")}
          </p>
          <div className="m-2">
            <button
              onClick={(e) => handleToPrint(e, setIsDownloading, pdfDetails)}
              type="button"
              className="font-[500] text-[13px] mr-[5px] op-btn op-btn-neutral"
            >
              <i className="fa-light fa-print" aria-hidden="true"></i>
              <span className="hidden lg:block">{t("print")}</span>
            </button>
            {pdfDetails?.[0]?.IsCompleted && (
              <button
                type="button"
                onClick={() =>
                  handleDownloadCertificate(pdfDetails, setIsDownloading)
                }
                className="font-[500] text-[13px] mr-[5px] op-btn op-btn-secondary"
              >
                <i
                  className="fa-light fa-award mx-[3px] lg:mx-0"
                  aria-hidden="true"
                ></i>
                <span className="hidden lg:block">{t("certificate")}</span>
              </button>
            )}
            <button
              type="button"
              className="font-[500] text-[13px] mr-[5px] op-btn op-btn-primary"
              onClick={() => handleDownload()}
            >
              <i className="fa-light fa-download" aria-hidden="true"></i>
              <span className="hidden lg:block">{t("download")}</span>
            </button>
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
            <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
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
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DocSuccessPage;
