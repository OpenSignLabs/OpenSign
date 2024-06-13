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
import { themeColor } from "../../constant/const";
import ModalUi from "../../primitives/ModalUi";

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
  dataTut4,
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
    <div style={{ padding: "5px 0px 5px 0px" }} className="mobileHead">
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
                className="fa fa-arrow-left text-base-content"
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
                  <div
                    style={{
                      color: themeColor,
                      border: "none",
                      fontWeight: "650",
                      fontSize: "16px",
                      padding: "0px 3px 0px 5px"
                    }}
                  >
                    <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
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
                          className="fa fa-arrow-down mr-[2px]"
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
                            className="fa-solid fa-award mr-[2px]"
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
                            className="fa fa-envelope mr-[2px]"
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
                          className="fa fa-print mr-[2px]"
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
                        className="border-none font-[650] text-[14px]"
                        style={{ color: isMailSend ? "gray" : themeColor }}
                        data-tut={dataTut4}
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
                        style={{ color: themeColor }}
                        className="border-none font-[650] text-[14px]"
                      >
                        Finish
                      </div>
                    )}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <div
                          className="border-none font-[650] text-[18px] px-2 ml-[4px]"
                          style={{ color: themeColor }}
                        >
                          <i
                            className="fa fa-ellipsis-v"
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
                              className="fa fa-arrow-down mr-[5px]"
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
        <div className="flex flex-wrap justify-between items-center mt-[5px]">
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
                    className="outline-none border-none text-center mr-[5px]"
                  >
                    <i className="fa-solid fa-gear fa-lg"></i>
                  </button>
                )}
                <button
                  onClick={() => navigate(-1)}
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm mr-[5px]"
                >
                  Back
                </button>
                <button
                  disabled={isMailSend && true}
                  data-tut="reactourFour"
                  className="op-btn op-btn-primary op-btn-sm mr-[5px]"
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
                    className="op-btn op-btn-secondary op-btn-sm mr-[5px] shadow"
                  >
                    <i
                      className="fa-solid fa-award py-[3px]"
                      aria-hidden="true"
                    ></i>
                    <span className="hidden lg:block">Certificate</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                  type="button"
                  className="op-btn op-btn-neutral op-btn-sm mr-[5px] shadow"
                >
                  <i className="fa fa-print py-[3px]" aria-hidden="true"></i>
                  <span className="hidden lg:block">Print</span>
                </button>

                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm mr-[5px] shadow"
                  onClick={() =>
                    handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                  }
                >
                  <i className="fa fa-download py-[3px]" aria-hidden="true"></i>
                  <span className="hidden lg:block">Download</span>
                </button>
              </div>
            ) : (
              <div className="flex" data-tut="reactourFifth">
                <button
                  onClick={() => navigate(-1)}
                  type="button"
                  className="op-btn op-btn-ghost op-btn-sm mr-[5px]"
                >
                  Back
                </button>
                {currentSigner && (
                  <>
                    <button
                      className="op-btn op-btn-secondary op-btn-sm mr-[5px] shadow"
                      onClick={() => handleDeclinePdfAlert()}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm mr-[5px] shadow"
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
                        <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
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
                              className="fa fa-arrow-down"
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
                  className="op-btn op-btn-secondary op-btn-sm font-medium text-[13px] mr-[5px] shadow"
                >
                  <i className="fa-solid fa-award" aria-hidden="true"></i>
                  <span className="hidden lg:block">Certificate</span>
                </button>
              )}
              <button
                onClick={(e) => handleToPrint(e, pdfUrl, setIsDownloading)}
                type="button"
                className="op-btn op-btn-neutral op-btn-sm font-medium text-[13px] mr-[5px] shadow"
              >
                <i className="fa fa-print" aria-hidden="true"></i>
                <span className="hidden lg:block">Print</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm font-medium text-[13px] mr-[5px] shadow"
                onClick={() =>
                  handleDownloadPdf(pdfDetails, pdfUrl, setIsDownloading)
                }
              >
                <i className="fa fa-download" aria-hidden="true"></i>
                <span className="hidden lg:block">Download</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-info op-btn-sm font-medium text-[13px] mr-[5px] shadow"
                onClick={() => setIsEmail(true)}
              >
                <i className="fa fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block">Mail</span>
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="op-btn op-btn-ghost op-btn-sm mr-[5px]"
              >
                Back
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm mr-[5px]"
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
        <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30 text-[45px] text-[#3dd3e0]">
          <div className="loader-37"></div>
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
            momentarily.
          </p>
          <p>
            If the download doesn&apos;t start shortly, click the button again.
          </p>
        </div>
      </ModalUi>
    </div>
  );
}

export default Header;
