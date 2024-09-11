import React, { useState } from "react";
import PrevNext from "./PrevNext";
import {
  handleDownloadCertificate,
  handleDownloadPdf,
  handleToPrint
} from "../../constant/Utils";
import "../../styles/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ModalUi from "../../primitives/ModalUi";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";

function Header({
  isPdfRequestFiles,
  isPlaceholder,
  setIsDecline,
  pageNumber,
  allPages,
  changePage,
  pdfUrl,
  embedWidgetsData,
  pdfDetails,
  signerPos,
  signersdata,
  isMailSend,
  alertSendEmail,
  isCompleted,
  isShowHeader,
  decline,
  currentSigner,
  alreadySign,
  isSignYourself,
  setIsEmail,
  completeBtnTitle,
  setIsEditTemplate,
  isPublicTemplate,
  clickOnZoomIn,
  clickOnZoomOut,
  handleRotationFun,
  isDisableRotate,
  templateId
}) {
  const { t } = useTranslation();
  const filterPrefill =
    signerPos && signerPos?.filter((data) => data.Role !== "prefill");
  const isMobile = window.innerWidth < 767;
  const [isDownloading, setIsDownloading] = useState("");
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    const currentDecline = { currnt: "Sure", isDeclined: true };
    setIsDecline(currentDecline);
  };
  return (
    <div className="flex py-[5px]">
      {isMobile && isShowHeader ? (
        <div
          id="navbar"
          className={isGuestSigner ? "stickySignerHead" : "stickyHead"}
          style={{
            width: isGuestSigner
              ? window.innerWidth
              : window.innerWidth - 30 + "px"
          }}
        >
          <div className="flex justify-between items-center py-[5px] px-[10px] ">
            <div onClick={() => window.history.go(-2)}>
              <i
                className="fa-light fa-arrow-left text-base-content"
                aria-hidden="true"
              ></i>
            </div>
            <PrevNext
              pageNumber={pageNumber}
              allPages={allPages}
              changePage={changePage}
            />
            {isCompleted || alreadySign ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="op-link op-link-primary no-underline text-[16px] font-semibold pr-[3px] pl-[5px]">
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
                      onClick={() =>
                        handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                      }
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-arrow-down mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {t("download")}
                      </div>
                    </DropdownMenu.Item>
                    {isCompleted && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() =>
                          handleDownloadCertificate(
                            pdfDetails,
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
                    {isSignYourself && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() => setIsEmail(true)}
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
                        handleToPrint(e, pdfUrl, setIsDownloading)
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
                {currentSigner && (
                  <div className="flex items-center" data-tut="reactourFifth">
                    {decline && (
                      <div
                        onClick={() => handleDeclinePdfAlert()}
                        className="text-[red] border-none font-[650] text-[14px] mr-2"
                      >
                        {t("decline")}
                      </div>
                    )}
                    {isPlaceholder ? (
                      <div
                        onClick={() => {
                          if (!isMailSend) {
                            alertSendEmail();
                          }
                        }}
                        className={`${
                          isMailSend ? "" : "op-link-primary"
                        } op-link no-underline font-[650] text-[14px]`}
                        data-tut="headerArea"
                      >
                        {completeBtnTitle ? completeBtnTitle : t("send")}
                      </div>
                    ) : (
                      <div
                        data-tut="reactourThird"
                        onClick={() => embedWidgetsData()}
                        className="border-none font-[650] text-[14px] op-link op-link-primary no-underline"
                      >
                        {t("finish")}
                      </div>
                    )}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <div className="font-[650] text-[18px] px-2 ml-[4px] text-base-content no-underline">
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
                          <DropdownMenu.Item
                            className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                            onClick={() =>
                              handleDownloadPdf(
                                pdfDetails,
                                pdfDetails[0]?.URL,
                                setIsDownloading
                              )
                            }
                          >
                            <i
                              className="fa-light fa-arrow-down mr-[3px]"
                              aria-hidden="true"
                            ></i>
                            <span className="font-[500]">{t("download")}</span>
                          </DropdownMenu.Item>
                          {!isDisableRotate && (
                            <>
                              <DropdownMenu.Item
                                className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                                onClick={() => handleRotationFun(90)}
                              >
                                <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                <span className="font-[500]">
                                  {t("rotate-right")}
                                </span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                                onClick={() => handleRotationFun(-90)}
                              >
                                <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                <span className="font-[500]">
                                  {t("rotate-left")}
                                </span>
                              </DropdownMenu.Item>
                            </>
                          )}

                          <DropdownMenu.Item
                            className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                            onClick={() => clickOnZoomIn()}
                          >
                            <i className="fa-light fa-magnifying-glass-plus text-gray-500 2xl:text-[30px]"></i>
                            <span className="font-[500]">{t("zoom-in")}</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                            onClick={() => clickOnZoomOut()}
                          >
                            <i className="fa-light fa-magnifying-glass-minus text-gray-500 2xl:text-[30px]"></i>
                            <span className="font-[500]">{t("zoom-out")}</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
                {isPublicTemplate && (
                  <div
                    data-tut="reactourThird"
                    onClick={() => embedWidgetsData()}
                    className="border-none font-[650] text-[14px] op-link op-link-primary no-underline"
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
            pageNumber={pageNumber}
            allPages={allPages}
            changePage={changePage}
          />
          {isPlaceholder ? (
            <>
              <div className="flex mx-[100px] lg:mx-0 order-last lg:order-none">
                {!isMailSend &&
                  signersdata.length > 0 &&
                  signersdata.length !== filterPrefill.length && (
                    <div>
                      {filterPrefill.length === 0 ? (
                        <span className="text-[13px] text-[#f5405e]">
                          {t("add")} {signersdata.length - filterPrefill.length}{" "}
                          {t("recipients")} {t("widgets-name.signature")}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#f5405e]">
                          {t("add")} {signersdata.length - filterPrefill.length}{" "}
                          {t("more")}
                          {t("recipients")} {t("widgets-name.signature")}
                        </span>
                      )}
                    </div>
                  )}
              </div>
              <div className="flex">
                {setIsEditTemplate && (
                  <button
                    onClick={() => setIsEditTemplate(true)}
                    className="outline-none border-none text-center mr-[3px]"
                  >
                    <i className="fa-light fa-gear fa-lg"></i>
                  </button>
                )}
                <button
                  onClick={() => window.history.go(-2)}
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                >
                  {t("back")}
                </button>
                <button
                  disabled={isMailSend && true}
                  data-tut="headerArea"
                  className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                  onClick={() => alertSendEmail()}
                >
                  {completeBtnTitle
                    ? completeBtnTitle
                    : isMailSend
                      ? t("sent")
                      : t("send")}
                </button>
              </div>
            </>
          ) : isPdfRequestFiles ? (
            alreadySign ? (
              <div className="flex flex-row">
                <button
                  onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                  type="button"
                  className="op-btn op-btn-neutral op-btn-sm mr-[3px] shadow"
                >
                  <i
                    className="fa-light fa-print py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">{t("print")}</span>
                </button>
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCertificate(pdfDetails, setIsDownloading)
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
                  onClick={() =>
                    handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                  }
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
                {!templateId && (
                  <button
                    onClick={() => window.history.go(-2)}
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                  >
                    {t("back")}
                  </button>
                )}
                {currentSigner && (
                  <>
                    {templateId && (
                      <button
                        onClick={() =>
                          handleDownloadPdf(
                            pdfDetails,
                            pdfUrl,
                            setIsDownloading
                          )
                        }
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                      >
                        <span className="hidden lg:block">{t("download")}</span>
                      </button>
                    )}
                    <button
                      className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                      onClick={() => handleDeclinePdfAlert()}
                    >
                      {t("decline")}
                    </button>
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                      onClick={() => embedWidgetsData()}
                    >
                      {t("finish")}
                    </button>
                    {!templateId && (
                      <button
                        type="button"
                        className="op-btn op-btn-neutral op-btn-sm mr-[3px] shadow"
                        onClick={() =>
                          handleDownloadPdf(
                            pdfDetails,
                            pdfUrl,
                            setIsDownloading
                          )
                        }
                      >
                        <i className="fa-light fa-arrow-down font-semibold lg:hidden"></i>
                        <span className="hidden lg:block">{t("download")}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          ) : isCompleted ? (
            <div className="flex flex-row">
              {isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadCertificate(pdfDetails, setIsDownloading)
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
                onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                type="button"
                className="op-btn op-btn-neutral op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
              >
                <i className="fa-light fa-print" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("print")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() =>
                  handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                }
              >
                <i className="fa-light fa-download" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("download")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-info op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => setIsEmail(true)}
              >
                <i className="fa-light fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{t("mail")}</span>
              </button>
            </div>
          ) : isPublicTemplate ? (
            <div className="flex">
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm  shadow"
                onClick={() => embedWidgetsData()}
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
                onClick={() => embedWidgetsData()}
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
    </div>
  );
}

export default Header;
