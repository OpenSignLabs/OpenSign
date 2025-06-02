import React, { useRef, useState } from "react";
import PrevNext from "./PrevNext";
import {
  base64ToArrayBuffer,
  deletePdfPage,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleRemoveWidgets,
  handleToPrint
} from "../../constant/Utils";
import "../../styles/signature.css";
import { DropdownMenu } from "radix-ui";
import ModalUi from "../../primitives/ModalUi";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import { PDFDocument } from "pdf-lib";
import { maxFileSize } from "../../constant/const";

function Header(props) {
  const { t } = useTranslation();
  const filterPrefill =
    props?.signerPos &&
    props?.signerPos?.filter((data) => data.Role !== "prefill");
  const isMobile = window.innerWidth < 767;
  const [isDownloading, setIsDownloading] = useState("");
  const [isDeletePage, setIsDeletePage] = useState(false);
  const mergePdfInputRef = useRef(null);
  const enabledBackBtn = props?.disabledBackBtn === true ? false : true;
  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    if (props?.handleDecline) {
      props.handleDecline();
    } else {
      const currentDecline = { currnt: "Sure", isDeclined: true };
      props?.setIsDecline(currentDecline);
    }
  };
  const handleDetelePage = async () => {
    props?.setIsUploadPdf && props?.setIsUploadPdf(true);
    const pdfupdatedData = await deletePdfPage(
      props?.pdfArrayBuffer,
      props?.pageNumber
    );
    if (pdfupdatedData?.totalPages === 1) {
      alert(t("delete-alert"));
    } else {
      props?.setPdfBase64Url(pdfupdatedData.base64);
      props?.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
      setIsDeletePage(false);
      handleRemoveWidgets(
        props?.setSignerPos,
        props?.signerPos,
        props?.pageNumber
      );
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
    <div className="flex py-[5px]">
      {isMobile && props?.isShowHeader ? (
        <div
          id="navbar"
          className="stickyHead"
          style={{
            width: window.innerWidth + "px"
          }}
        >
          <div className="flex justify-between items-center py-[5px] pl-[10px] ">
            <div onClick={() => window.history.go(-2)}>
              <i
                className="fa-light fa-arrow-left text-base-content"
                aria-hidden="true"
              ></i>
            </div>
            <PrevNext
              pageNumber={props?.pageNumber}
              allPages={props?.allPages}
              changePage={props?.changePage}
            />
            {props?.isCompleted || props?.alreadySign ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="op-link op-link-primary no-underline text-[16px] font-semibold px-3">
                    <i
                      className="fa-light fa-ellipsis-v"
                      aria-hidden="true"
                    ></i>
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={() => {
                        if (props?.isCompleted) {
                          props?.setIsDownloadModal(true);
                        } else {
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          );
                        }
                      }}
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-arrow-down mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {t("download")}
                      </div>
                    </DropdownMenu.Item>
                    {props?.isCompleted && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() =>
                          handleDownloadCertificate(
                            props?.pdfDetails,
                            setIsDownloading
                          )
                        }
                      >
                        <div className="border-none bg-[#fff]">
                          <i
                            className="fa-light fa-award mr-[3px]"
                            aria-hidden="true"
                          ></i>
                          {t("certificate")}
                        </div>
                      </DropdownMenu.Item>
                    )}
                    {props?.isSignYourself && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() => props?.setIsEmail(true)}
                      >
                        <div className="flex flex-row">
                          <i
                            className="fa-light fa-envelope mr-[3px]"
                            aria-hidden="true"
                          ></i>
                          {t("mail")}
                        </div>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={(e) =>
                        handleToPrint(e, setIsDownloading, props?.pdfDetails)
                      }
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-print mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {t("print")}
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex justify-around items-center">
                {/* current signer is checking user send request and check status of pdf sign than if current 
                user exist than show finish button else no
                */}
                {props?.currentSigner && (
                  <div className="flex items-center" data-tut="reactourFifth">
                    {props?.decline && (
                      <div
                        onClick={() => handleDeclinePdfAlert()}
                        className="text-[red] border-none font-[650] text-[14px] mr-2"
                      >
                        {t("decline")}
                      </div>
                    )}
                    {props?.isPlaceholder ? (
                      <div
                        onClick={() => {
                          if (!props?.isMailSend) {
                            props?.alertSendEmail();
                          }
                        }}
                        className={`${
                          props?.isMailSend ? "" : "op-link-primary"
                        } op-link no-underline font-[650] text-[14px]`}
                        data-tut="headerArea"
                      >
                        {props?.completeBtnTitle
                          ? props?.completeBtnTitle
                          : t("send")}
                      </div>
                    ) : (
                      <div
                        data-tut="reactourThird"
                        onClick={() => props?.embedWidgetsData()}
                        className="border-none font-[650] text-[14px] op-link op-link-primary no-underline"
                      >
                        {t("finish")}
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      ref={mergePdfInputRef}
                      onChange={handleFileUpload}
                    />
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <div className="font-[650] text-[18px] px-3  text-base-content no-underline">
                          <i
                            className="fa-light fa-ellipsis-v"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-white shadow-md rounded-md px-3 py-2"
                          sideOffset={5}
                        >
                          {props?.setIsEditTemplate && (
                            <DropdownMenu.Item
                              className="DropdownMenuItem"
                              onClick={() => props?.setIsEditTemplate(true)}
                            >
                              <div className="flex flex-row">
                                <i
                                  className="fa-light fa-gear mr-[3px]"
                                  aria-hidden="true"
                                ></i>
                                <span className="font-[500]">{t("Edit")}</span>
                              </div>
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() =>
                              handleDownloadPdf(
                                props?.pdfDetails,
                                setIsDownloading,
                                props.pdfBase64
                              )
                            }
                          >
                            <div className="flex flex-row">
                              <i
                                className="fa-light fa-arrow-down mr-[3px]"
                                aria-hidden="true"
                              ></i>
                              <span className="font-[500]">
                                {t("download")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                          {!props?.isDisablePdfEditTools && (
                            <>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => mergePdfInputRef.current.click()}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-plus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("add-pages")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => setIsDeletePage(true)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-trash text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("delete-page")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>

                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("rotate-right")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(-90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {t("rotate-left")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                            </>
                          )}

                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomIn()}
                          >
                            <div className="flex flex-row">
                              <i className="fa-light fa-magnifying-glass-plus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                              <span className="font-[500]">{t("zoom-in")}</span>
                            </div>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomOut()}
                          >
                            <div className="flex flex-row">
                              <i className="fa-light fa-magnifying-glass-minus text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                              <span className="font-[500]">
                                {t("zoom-out")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
                {props?.isPublicTemplate && (
                  <div
                    data-tut="reactourThird"
                    onClick={() => props?.embedWidgetsData()}
                    className="border-none font-[650] text-[14px] pr-2 op-link op-link-primary no-underline"
                  >
                    {t("sign-now")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-between items-center w-full gap-y-1 ml-1">
          <PrevNext
            pageNumber={props?.pageNumber}
            allPages={props?.allPages}
            changePage={props?.changePage}
          />
          {props?.isPlaceholder ? (
            <>
              <div className="flex mx-[100px] lg:mx-0 order-last lg:order-none">
                {!props?.isMailSend &&
                  props?.signersdata.length > 0 &&
                  props?.signersdata.length !== filterPrefill.length && (
                    <div>
                      {filterPrefill.length === 0 ? (
                        <span className="text-[13px] text-[#f5405e]">
                          {t("add")}{" "}
                          {props?.signersdata.length - filterPrefill.length}{" "}
                          {t("recipients")} {t("widgets-name.signature")}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#f5405e]">
                          {t("add")}{" "}
                          {props?.signersdata.length - filterPrefill.length}{" "}
                          {t("more")}
                          {t("recipients")} {t("widgets-name.signature")}
                        </span>
                      )}
                    </div>
                  )}
              </div>
              <div className="flex">
                {props?.setIsEditTemplate && (
                  <button
                    onClick={() => props?.setIsEditTemplate(true)}
                    className="outline-none border-none text-center mr-[3px]"
                  >
                    <i className="fa-light fa-gear fa-lg"></i>
                  </button>
                )}
                {enabledBackBtn && (
                  <button
                    onClick={() => window.history.go(-2)}
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                  >
                    {t("back")}
                  </button>
                )}
                <button
                  disabled={props?.isMailSend && true}
                  data-tut="headerArea"
                  className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                  onClick={() => props?.alertSendEmail()}
                >
                  {props?.completeBtnTitle
                    ? props?.completeBtnTitle
                    : props?.isMailSend
                      ? t("sent")
                      : t("send")}
                </button>
              </div>
            </>
          ) : props?.isPdfRequestFiles || props?.isSelfSign ? (
            props?.alreadySign || (props?.isSelfSign && props?.isCompleted) ? (
              <div className="flex flex-row">
                <button
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, props?.pdfDetails)
                  }
                  type="button"
                  className="op-btn op-btn-neutral op-btn-sm mr-[3px] shadow"
                >
                  <i
                    className="fa-light fa-print py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">{t("print")}</span>
                </button>
                {props?.isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCertificate(
                        props?.pdfDetails,
                        setIsDownloading
                      )
                    }
                    className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                  >
                    <i
                      className="fa-light fa-award py-[3px]"
                      aria-hidden="true"
                    ></i>
                    <span className="hidden lg:block">{t("certificate")}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                  onClick={() => {
                    if (props?.isCompleted) {
                      props?.setIsDownloadModal(true);
                    } else {
                      handleDownloadPdf(
                        props?.pdfDetails,
                        setIsDownloading,
                        props.pdfBase64
                      );
                    }
                  }}
                >
                  <i
                    className="fa-light fa-download py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">{t("download")}</span>
                </button>
              </div>
            ) : (
              <div className="flex" data-tut="reactourFifth">
                {props?.currentSigner && (
                  <>
                    {props?.templateId && (
                      <button
                        onClick={() =>
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          )
                        }
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                      >
                        <span className="hidden lg:block">{t("download")}</span>
                      </button>
                    )}
                    {!props?.isSelfSign && (
                      <button
                        className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                        onClick={() => handleDeclinePdfAlert()}
                      >
                        {t("decline")}
                      </button>
                    )}
                    {!props?.templateId && (
                      <button
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                        onClick={() =>
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          )
                        }
                      >
                        <i className="fa-light fa-arrow-down font-semibold lg:hidden"></i>
                        <span className="hidden lg:block">{t("download")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                      onClick={() => props?.embedWidgetsData()}
                    >
                      {t("finish")}
                    </button>
                  </>
                )}
              </div>
            )
          ) : props?.isCompleted ? (
            <div className="flex flex-row">
              {props?.isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadCertificate(
                      props?.pdfDetails,
                      setIsDownloading
                    )
                  }
                  className="op-btn op-btn-secondary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                >
                  <i className="fa-light fa-award" aria-hidden="true"></i>
                  <span className="hidden lg:block ml-1">
                    {t("certificate")}
                  </span>
                </button>
              )}
              <button
                onClick={(e) =>
                  handleToPrint(e, setIsDownloading, props?.pdfDetails)
                }
                type="button"
                className="op-btn op-btn-neutral op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
              >
                <i className="fa-light fa-print" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("print")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => props?.setIsDownloadModal(true)}
              >
                <i className="fa-light fa-download" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("download")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-info op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => props?.setIsEmail(true)}
              >
                <i className="fa-light fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("mail")}</span>
              </button>
            </div>
          ) : props?.isPublicTemplate ? (
            <div className="flex">
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm  shadow"
                onClick={() => props?.embedWidgetsData()}
              >
                {t("sign-now")}
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => window.history.go(-2)}
                type="button"
                className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
              >
                {t("back")}
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                onClick={() => props?.embedWidgetsData()}
              >
                {t("finish")}
              </button>
            </div>
          )}
        </div>
      )}
      {isDownloading === "pdf" && (
        <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <ModalUi
        isOpen={
          isDownloading === "certificate" || isDownloading === "certificate_err"
        }
        title={
          isDownloading === "certificate" || isDownloading === "certificate_err"
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
            className="op-btn op-btn-ghost"
          >
            {t("no")}
          </button>
        </div>
      </ModalUi>
    </div>
  );
}

export default Header;
