import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page } from "react-pdf";
import { useSelector } from "react-redux";
import { PDFDocument } from "pdf-lib";
import { base64ToArrayBuffer } from "../../constant/Utils";

function RenderAllPdfPage(props) {
  const { t } = useTranslation();
  const pageContainer = useRef();
  const mergePdfInputRef = useRef(null);
  const [signPageNumber, setSignPageNumber] = useState([]);
  const [bookmarkColor, setBookmarkColor] = useState("");
  const isHeader = useSelector((state) => state.showHeader);
  const [pageWidth, setPageWidth] = useState("");

  //set all number of pages after load pdf
  function onDocumentLoad({ numPages }) {
    props?.setAllPages(numPages);
    //check if signerPos array exist then save page number exist in signerPos array to show bookmark icon
    if (props?.signerPos) {
      const checkUser = props?.signerPos.filter(
        (data) => data.Id === props?.id
      );
      setBookmarkColor(checkUser[0]?.blockColor);
      let pageNumberArr = [];
      if (checkUser?.length > 0) {
        checkUser[0]?.placeHolder?.map((data) => {
          pageNumberArr.push(data?.pageNumber);
        });

        setSignPageNumber(pageNumberArr);
      }
    }
  }

  useEffect(() => {
    const updateSize = () => {
      if (pageContainer.current) {
        setPageWidth(pageContainer.current.offsetWidth);
      }
    };

    // Use setTimeout to wait for the transition to complete
    const timer = setTimeout(updateSize, 100); // match the transition duration

    return () => clearTimeout(timer);
  }, [isHeader, pageContainer, props?.containerWH]);
  //'function `addSignatureBookmark` is used to display the page where the user's signature is located.
  const addSignatureBookmark = (index) => {
    const ispageNumber = signPageNumber.includes(index + 1);
    return (
      ispageNumber && (
        <div className="absolute z-20 top-[1px] -right-[13px] -translate-x-1/2 -translate-y-1/2">
          <i
            style={{ color: bookmarkColor || "red" }}
            className="fa-solid fa-bookmark"
          ></i>
        </div>
      )
    );
  };
  const pdfDataBase64 = `data:application/pdf;base64,${props?.pdfBase64Url}`;

  // `handleFileUpload` is trigger when user click on add pages btn and is used to merge multiple pdf
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
    <div ref={pageContainer} className="hidden w-[20%] bg-base-100 md:block">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        {t("pages")}
      </div>
      <div
        className={`flex h-[90%] flex-col items-center m-2  
         autoSignScroll hide-scrollbar max-h-[100vh] `}
      >
        <Document
          loading={t("loading-doc")}
          onLoadSuccess={onDocumentLoad}
          file={pdfDataBase64}
        >
          {Array.from(new Array(props?.allPages), (el, index) => (
            <div
              key={index}
              className={`${
                props?.pageNumber - 1 === index
                  ? "border-[red]"
                  : "border-[#878787]"
              } border-2 m-[10px] flex justify-center items-center relative`}
              onClick={() => {
                props?.setPageNumber(index + 1);
                if (props?.setSignBtnPosition) {
                  props?.setSignBtnPosition([]);
                }
              }}
            >
              {props?.signerPos && addSignatureBookmark(index)}
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth - 60}
                scale={1}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </Document>
        {props?.isMergePdfBtn && (
          <button
            className="mb-2 bg-base-100 px-2 py-2 ring-[0.5px] ring-base-content rounded-box flex gap-1 justify-center items-center"
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
            <i className="fa-light fa-plus text-gray-500"></i>
            <span className="text-xs lg:text-sm text-base-content ">
              Add pages
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default RenderAllPdfPage;
