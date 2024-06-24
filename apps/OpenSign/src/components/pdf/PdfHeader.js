import React, { useState } from "react";
import PrevNext from "./PrevNext";
import {
  handleDownloadCertificate,
  handleDownloadPdf,
  handleToPrint
} from "../../constant/Utils";
import "../../styles/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import ModalUi from "../../primitives/ModalUi";
import Loader from "../../primitives/Loader";

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
  setIsEditTemplate
}) {
  const filterPrefill =
    signerPos && signerPos?.filter((data) => data.Role !== "prefill");
  const isMobile = window.innerWidth < 767;
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState("");
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    const currentDecline = {
      currnt: "Sure",
      isDeclined: true
    };
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
            <div onClick={() => navigate(-1)}>
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
            {pdfUrl && alreadySign ? (
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
                        Download
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
                          Certificate
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
                          Mail
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
                        Print
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
                        Decline
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
                        {completeBtnTitle ? completeBtnTitle : "Send"}
                      </div>
                    ) : (
                      <div
                        data-tut="reactourThird"
                        onClick={() => {
                          if (!pdfUrl) {
                            embedWidgetsData();
                          } else if (isPdfRequestFiles) {
                            embedWidgetsData();
                          }
                        }}
                        className="border-none font-[650] text-[14px] op-link op-link-primary no-underline"
                      >
                        Finish
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
                          className="bg-white shadow-md rounded px-2 py-1"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item
                            className="flex flex-row justify-center items-center text-[13px] focus:outline-none cursor-pointer"
                            onClick={() =>
                              handleDownloadPdf(
                                pdfDetails,
                                pdfUrl,
                                setIsDownloading
                              )
                            }
                          >
                            <i
                              className="fa-light fa-arrow-down mr-[3px]"
                              aria-hidden="true"
                            ></i>
                            <span className="font-[500]">Download</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
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
                          Add {signersdata.length - filterPrefill.length}{" "}
                          recipients signature
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#f5405e]">
                          Add {signersdata.length - filterPrefill.length} more
                          recipients signature
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
                  onClick={() => navigate(-1)}
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                >
                  Back
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
                      ? "Sent"
                      : "Send"}
                </button>
              </div>
            </>
          ) : isPdfRequestFiles ? (
            alreadySign ? (
              <div className="flex flex-row">
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
                    <span className="hidden lg:block">Certificate</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                  type="button"
                  className="op-btn op-btn-neutral op-btn-sm mr-[3px] shadow"
                >
                  <i
                    className="fa-light fa-print py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block">Print</span>
                </button>

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
                  <span className="hidden lg:block">Download</span>
                </button>
              </div>
            ) : (
              <div className="flex" data-tut="reactourFifth">
                <button
                  onClick={() => navigate(-1)}
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                >
                  Back
                </button>
                {currentSigner && (
                  <>
                    <button
                      className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                      onClick={() => handleDeclinePdfAlert()}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                      onClick={() => embedWidgetsData()}
                    >
                      Finish
                    </button>
                    <div className="op-dropdown op-dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="op-btn op-btn-info op-btn-sm shadow"
                      >
                        <i
                          className="fa-light fa-ellipsis-v"
                          aria-hidden="true"
                        ></i>
                      </div>
                      <ul
                        tabIndex={0}
                        className="op-dropdown-content z-[1] op-menu op-menu-sm p-1 shadow bg-base-100 rounded-box mt-1"
                      >
                        <li
                          onClick={() =>
                            handleDownloadPdf(
                              pdfDetails,
                              pdfUrl,
                              setIsDownloading
                            )
                          }
                        >
                          <span className="font-semibold text-[12px]">
                            <i
                              className="fa-light fa-arrow-down"
                              aria-hidden="true"
                            ></i>{" "}
                            Download
                          </span>
                        </li>
                      </ul>
                    </div>
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
                  <span className="hidden lg:block ml-1">Certificate</span>
                </button>
              )}
              <button
                onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                type="button"
                className="op-btn op-btn-neutral op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
              >
                <i className="fa-light fa-print" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Print</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() =>
                  handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                }
              >
                <i className="fa-light fa-download" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Download</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-info op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => setIsEmail(true)}
              >
                <i className="fa-light fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Mail</span>
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
              >
                Back
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                onClick={() => {
                  if (!pdfUrl) {
                    embedWidgetsData();
                  }
                }}
              >
                Finish
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
            ? "Generating certificate"
            : "PDF Download"
        }
        handleClose={() => setIsDownloading("")}
      >
        <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
          {isDownloading === "certificate"}{" "}
          <p>
            Your completion certificate is being generated. Please wait
            momentarily. If the download doesn&apos;t start shortly, click the
            button again.
          </p>
        </div>
      </ModalUi>
    </div>
  );
}

export default Header;
