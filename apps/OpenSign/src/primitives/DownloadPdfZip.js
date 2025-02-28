import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalUi from "./ModalUi";
import {
  getSignedUrl,
  handleDownloadCertificate,
  handleDownloadPdf,
  sanitizeFileName
} from "../constant/Utils";
import Loader from "./Loader";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function DownloadPdfZip(props) {
  const { t } = useTranslation();
  const [selectType, setSelectType] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadType = [
    { id: 1, label: t("download-pdf") },
    { id: 2, label: t("pdf-certificate") }
  ];

  const handleDownload = async () => {
    if (selectType === 1) {
      await handleDownloadPdf(props.pdfDetails, setIsDownloading);
      setSelectType(1);
      props.setIsDownloadModal(false);
    } else if (selectType === 2) {
      setIsDownloading("pdf");
      const zip = new JSZip();
      const pdfDetails = props.pdfDetails;
      const pdfName = pdfDetails?.[0]?.Name || "Document";
      const pdfUrl = pdfDetails?.[0]?.SignedUrl || "";

      try {
        // Fetch the first PDF (Signed Document)
        const docId = pdfDetails?.[0]?.objectId || "";
        const fileAdapterId = pdfDetails?.[0]?.FileAdapterId
          ? pdfDetails?.[0]?.FileAdapterId
          : "";
        console.log("pdfDetails?.[0] ", pdfDetails?.[0]);
        const signedUrl = await getSignedUrl(pdfUrl, docId, fileAdapterId);
        console.log("signedUrl ", signedUrl);
        const pdf1Response = await fetch(signedUrl);
        if (!pdf1Response.ok) {
          throw new Error(`Failed to fetch PDF: ${signedUrl}`);
        }
        const pdf1Blob = await pdf1Response.blob();
        const isZip = true;
        // Fetch the Certificate (or generate its URL dynamically)
        const certificateUrl = await handleDownloadCertificate(
          pdfDetails,
          setIsDownloading,
          isZip
        );
        const pdf2Response = await fetch(certificateUrl);
        if (!pdf2Response.ok) {
          throw new Error(`Failed to fetch certificate PDF: ${certificateUrl}`);
        }
        const pdf2Blob = await pdf2Response.blob();
        // Add files to ZIP
        zip.file(
          `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`,
          pdf1Blob
        );
        zip.file("Certificate_signed_by_OpenSign™.pdf", pdf2Blob);

        // Generate the ZIP and trigger download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(
          zipBlob,
          `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.zip`
        );
        setSelectType(1);
        props.setIsDownloadModal(false);
        setIsDownloading("");
      } catch (error) {
        console.error("Error creating ZIP file:", error);
      }
    }
  };
  return (
    <ModalUi
      isOpen={props.isDownloadModal}
      title={t("download-files")}
      handleClose={() => props.setIsDownloadModal(false)}
    >
      <div className="p-[20px] h-full">
        {downloadType.map((data, ind) => {
          return (
            <label
              key={ind}
              className="flex items-center gap-1 mb-2 cursor-pointer"
            >
              <input
                className="mr-[8px] op-radio op-radio-xs"
                type="radio"
                value={data.id}
                onChange={() => setSelectType(data.id)}
                checked={selectType === data.id}
              />
              {data.label}
            </label>
          );
        })}
        <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
        <button
          onClick={() => handleDownload()}
          type="submit"
          className="op-btn op-btn-primary"
        >
          {t("download")}
        </button>
      </div>
      {isDownloading === "pdf" && (
        <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <ModalUi
        isOpen={isDownloading === "certificate"}
        title={
          isDownloading === "certificate"
            ? t("generating-certificate")
            : t("pdf-download")
        }
        handleClose={() => setIsDownloading("")}
      >
        <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
          {isDownloading === "certificate"}{" "}
          <p>{t("generate-certificate-alert")}</p>
        </div>
      </ModalUi>
    </ModalUi>
  );
}

export default DownloadPdfZip;
