import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  base64ToArrayBuffer,
  deletePdfPage,
  handleRemoveWidgets
} from "../../constant/Utils";
import ModalUi from "../../primitives/ModalUi";
import { PDFDocument } from "pdf-lib";
import { maxFileSize } from "../../constant/const";

function PdfZoom(props) {
  const { t } = useTranslation();
  const mergePdfInputRef = useRef(null);
  const [isDeletePage, setIsDeletePage] = useState(false);
  const handleDetelePage = async () => {
    props.setIsUploadPdf && props.setIsUploadPdf(true);
    try {
      const pdfupdatedData = await deletePdfPage(
        props.pdfArrayBuffer,
        props.pageNumber
      );
      if (pdfupdatedData?.totalPages === 1) {
        alert(t("delete-alert"));
      } else {
        props.setPdfBase64Url(pdfupdatedData.base64);
        props.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
        setIsDeletePage(false);
        handleRemoveWidgets(
          props.setSignerPos,
          props.signerPos,
          props.pageNumber
        );
        props.setAllPages(pdfupdatedData.remainingPages || 1);
        if (props.allPages === props.pageNumber) {
          props.setPageNumber(props.pageNumber - 1);
        } else if (props.allPages > 2) {
          props.setPageNumber(props.pageNumber);
        }
      }
    } catch (e) {
      console.log("error in delete pdf page", e);
    }
  };

  // `removeFile` is used to  remove file if exists
  const removeFile = (e) => {
    if (e) {
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please upload a valid PDF file.");
      return;
    }
    if (!file.type.includes("pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }
    const mb = Math.round(file?.size / Math.pow(1024, 2));
    if (mb > maxFileSize) {
      alert(`${t("file-alert-1")} ${maxFileSize} MB`);
      removeFile(e);
      return;
    }
    try {
      const uploadedPdfBytes = await file.arrayBuffer();
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes, {
        ignoreEncryption: true
      });
      const basePdfDoc = await PDFDocument.load(props.pdfArrayBuffer);

      // Copy pages from the uploaded PDF to the base PDF
      const uploadedPdfPages = await basePdfDoc.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPdfPages.forEach((page) => basePdfDoc.addPage(page));
      // Save the updated PDF
      const pdfBase64 = await basePdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const pdfBuffer = base64ToArrayBuffer(pdfBase64);
      props.setPdfArrayBuffer(pdfBuffer);
      props.setPdfBase64Url(pdfBase64);
      props.setIsUploadPdf && props.setIsUploadPdf(true);
      mergePdfInputRef.current.value = "";
    } catch (error) {
      mergePdfInputRef.current.value = "";
      console.error("Error merging PDF:", error);
    }
  };

  return (
    <>
      <span className="hidden md:flex flex-col gap-1 text-center md:w-[5%] mt-[42px]">
        {!props.isDisableEditTools && (
          <>
            <span
              className="bg-gray-50 px-[4px]  2xl:py-[10px] cursor-pointer"
              onClick={() => mergePdfInputRef.current.click()}
              title={t("add-pages")}
            >
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                ref={mergePdfInputRef}
                onChange={handleFileUpload}
              />
              <i className="fa-light fa-plus text-gray-500 2xl:text-[25px]"></i>
            </span>
            <span
              className="bg-gray-50 px-[4px]  2xl:py-[10px] cursor-pointer"
              onClick={() => setIsDeletePage(true)}
              title={t("delete-page")}
            >
              <i className="fa-light fa-trash text-gray-500 2xl:text-[25px]"></i>
            </span>
          </>
        )}
        <span
          className="bg-gray-50 px-[4px] 2xl:py-[10px] cursor-pointer"
          onClick={() => props.clickOnZoomIn()}
          title={t("zoom-in")}
        >
          <i className="fa-light fa-magnifying-glass-plus text-gray-500 2xl:text-[25px]"></i>
        </span>

        {!props.isDisableEditTools && (
          <>
            <span
              className="bg-gray-50 px-[4px] 2xl:py-[10px] cursor-pointer"
              onClick={() => props.handleRotationFun(90)}
              title={t("rotate-right")}
            >
              <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[25px]"></i>
            </span>
            <span
              className="bg-gray-50 px-[4px] 2xl:py-[10px] cursor-pointer"
              title={t("rotate-left")}
              onClick={() => props.handleRotationFun(-90)}
            >
              <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[25px]"></i>
            </span>
          </>
        )}
        <span
          className="bg-gray-50 px-[4px]  2xl:py-[10px]"
          onClick={() => props.clickOnZoomOut()}
          style={{
            cursor: props.zoomPercent > 0 ? "pointer" : "default"
          }}
          title={t("zoom-out")}
        >
          <i className="fa-light fa-magnifying-glass-minus text-gray-500 2xl:text-[30px]"></i>
        </span>
      </span>

      <ModalUi
        isOpen={isDeletePage}
        title={t("delete-page")}
        handleClose={() => setIsDeletePage(false)}
      >
        <div className="h-[100%] p-[20px]">
          <p className="font-medium">{t("delete-alert-2")}</p>
          <p className="pt-3">{t("delete-note")}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() => handleDetelePage()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {t("yes")}
          </button>
          <button
            onClick={() => setIsDeletePage(false)}
            type="button"
            className="op-btn op-btn-ghost ml-1"
          >
            {t("no")}
          </button>
        </div>
      </ModalUi>
    </>
  );
}

export default PdfZoom;
