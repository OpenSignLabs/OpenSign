import React, { useState } from "react";
import PrevNext from "./PrevNext";
import printModule from "print-js";
import { getBase64FromUrl } from "../../constant/Utils";
import { saveAs } from "file-saver";
import "../../styles/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { themeColor } from "../../constant/const";
import axios from "axios";
import ModalUi from "../../primitives/ModalUi";
import Parse from "parse";

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
  const [isCertificate, setIsCertificate] = useState(false);
  const isGuestSigner = localStorage.getItem("isGuestSigner");
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }
  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    const currentDecline = {
      currnt: "Sure",
      isDeclined: true
    };
    setIsDecline(currentDecline);
  };

  //function for print digital sign pdf
  const handleToPrint = async (event) => {
    event.preventDefault();

    try {
      const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
      const pdf = await getBase64FromUrl(url);
      const isAndroidDevice = navigator.userAgent.match(/Android/i);
      const isAppleDevice =
        (/iPad|iPhone|iPod/.test(navigator.platform) ||
          (navigator.platform === "MacIntel" &&
            navigator.maxTouchPoints > 1)) &&
        !window.MSStream;
      if (isAndroidDevice || isAppleDevice) {
        const byteArray = Uint8Array.from(
          atob(pdf)
            .split("")
            .map((char) => char.charCodeAt(0))
        );
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else {
        printModule({ printable: pdf, type: "pdf", base64: true });
      }
    } catch (err) {
      console.log("err in getsignedurl", err);
      alert("something went wrong, please try again later.");
    }
  };

  //handle download signed pdf
  const handleDownloadPdf = async () => {
    const pdfName = pdfDetails[0] && pdfDetails[0].Name;
    try {
      const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
      saveAs(url, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
    } catch (err) {
      console.log("err in getsignedurl", err);
      alert("something went wrong, please try again later.");
    }
  };

  const sanitizeFileName = (pdfName) => {
    // Replace spaces with underscore
    return pdfName.replace(/ /g, "_");
  };

  //handle download signed pdf
  const handleDownloadCertificate = async () => {
    if (pdfDetails?.length > 0 && pdfDetails[0]?.CertificateUrl) {
      try {
        await fetch(pdfDetails[0] && pdfDetails[0]?.CertificateUrl);
        const certificateUrl = pdfDetails[0] && pdfDetails[0]?.CertificateUrl;
        saveAs(certificateUrl, `Certificate_signed_by_OpenSign™.pdf`);
      } catch (err) {
        console.log("err in download in certificate", err);
      }
    } else {
      setIsCertificate(true);
      try {
        const data = {
          docId: pdfDetails[0]?.objectId
        };
        const docDetails = await axios.post(
          `${localStorage.getItem("baseUrl")}functions/getDocument`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              sessionToken: localStorage.getItem("accesstoken")
            }
          }
        );
        if (docDetails.data && docDetails.data.result) {
          const doc = docDetails.data.result;
          if (doc?.CertificateUrl) {
            await fetch(doc?.CertificateUrl);
            const certificateUrl = doc?.CertificateUrl;
            saveAs(certificateUrl, `Certificate_signed_by_OpenSign™.pdf`);
            setIsCertificate(false);
          } else {
            setIsCertificate(true);
          }
        }
      } catch (err) {
        console.log("err in download in certificate", err);
        alert("something went wrong, please try again later.");
      }
    }
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
          <div className="preBtn2">
            <div onClick={() => navigate(-1)}>
              <i
                className="fa fa-arrow-left"
                aria-hidden="true"
                style={{ color: themeColor, cursor: "pointer" }}
              ></i>
            </div>
            <div>
              <i
                onClick={() => {
                  if (pageNumber > 1) {
                    previousPage();
                  }
                }}
                className="fa fa-backward"
                style={{ color: "gray", cursor: "pointer" }}
              ></i>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginLeft: "10px",
                  marginRight: "10px"
                }}
              >
                {pageNumber || (allPages ? 1 : "--")} of {allPages || "--"}
              </span>
              <i
                onClick={() => {
                  if (pageNumber < allPages) {
                    nextPage();
                  }
                }}
                className="fa fa-forward"
                style={{ color: "gray", cursor: "pointer" }}
              ></i>
            </div>
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
                      onClick={() => handleDownloadPdf()}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row"
                        }}
                      >
                        <i
                          className="fa fa-arrow-down"
                          aria-hidden="true"
                          style={{ marginRight: "2px" }}
                        ></i>
                        Download
                      </div>
                    </DropdownMenu.Item>
                    {isCompleted && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() => handleDownloadCertificate()}
                      >
                        <div
                          style={{
                            border: "none",
                            backgroundColor: "#fff"
                          }}
                        >
                          <i
                            className="fa-solid fa-award"
                            style={{ marginRight: "2px" }}
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row"
                          }}
                        >
                          <i
                            className="fa fa-envelope"
                            style={{ marginRight: "2px" }}
                            aria-hidden="true"
                          ></i>
                          Mail
                        </div>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={handleToPrint}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row"
                        }}
                      >
                        <i
                          className="fa fa-print"
                          aria-hidden="true"
                          style={{ marginRight: "2px" }}
                        ></i>
                        Print
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {/* current signer is checking user send request and check status of pdf sign than if current 
                user exist than show finish button else no
                */}
                {currentSigner && (
                  <>
                    {decline && (
                      <div
                        onClick={() => {
                          handleDeclinePdfAlert();
                        }}
                        style={{
                          color: "red",
                          border: "none",
                          fontWeight: "650",
                          fontSize: "16px",
                          marginRight: "10px"
                        }}
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
                        style={{
                          color: isMailSend ? "gray" : themeColor,
                          border: "none",
                          fontWeight: "650",
                          fontSize: "16px"
                        }}
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
                        style={{
                          color: themeColor,
                          border: "none",
                          fontWeight: "650",
                          fontSize: "16px"
                        }}
                      >
                        Finish
                      </div>
                    )}
                  </>
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
                        <span style={{ fontSize: "13px", color: "#f5405e" }}>
                          Add {signersdata.length - filterPrefill.length}{" "}
                          recipients signature
                        </span>
                      ) : (
                        <span style={{ fontSize: "13px", color: "#f5405e" }}>
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
                  className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-black font-[500] text-sm mr-[5px] bg-white"
                >
                  Back
                </button>
                <button
                  disabled={isMailSend && true}
                  data-tut="reactourFour"
                  className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] font-[500] text-sm mr-[5px]"
                  style={{
                    background: isMailSend ? "rgb(203, 203, 203)" : "#188ae2",
                    color: isMailSend ? "rgb(77, 75, 75)" : "white"
                  }}
                  onClick={() => {
                    alertSendEmail();
                  }}
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
              <div style={{ display: "flex", flexDirection: "row" }}>
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCertificate()}
                    className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#08bc66]"
                  >
                    <i
                      className="fa-solid fa-award py-[3px]"
                      aria-hidden="true"
                    ></i>
                    <span className="hidden lg:block ml-1">Certificate</span>
                  </button>
                )}

                <button
                  onClick={handleToPrint}
                  type="button"
                  className="flex flex-row items-center  shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#188ae2]"
                >
                  <i className="fa fa-print py-[3px]" aria-hidden="true"></i>
                  <span className="hidden lg:block ml-1">Print</span>
                </button>

                <button
                  type="button"
                  className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#f14343]"
                  onClick={() => handleDownloadPdf()}
                >
                  <i className="fa fa-download py-[3px]" aria-hidden="true"></i>
                  <span className="hidden lg:block ml-1">Download</span>
                </button>
              </div>
            ) : (
              <div className="flex">
                <button
                  onClick={() => navigate(-1)}
                  type="button"
                  className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-black font-[500] text-sm mr-[5px] bg-white"
                >
                  Back
                </button>
                {currentSigner && (
                  <>
                    <button
                      style={{ background: "#de4337" }}
                      className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-white font-[500] text-[13px] mr-[5px] bg-[#f14343]"
                      onClick={() => {
                        handleDeclinePdfAlert();
                      }}
                    >
                      Decline
                    </button>
                    <button
                      style={{
                        background: "#188ae2"
                      }}
                      type="button"
                      className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-white font-[500] text-[13px] mr-[5px] bg-[#188ae2]"
                      onClick={() => {
                        embedWidgetsData();
                      }}
                    >
                      Finish
                    </button>
                  </>
                )}
              </div>
            )
          ) : isCompleted ? (
            <div style={{ display: "flex", flexDirection: "row" }}>
              {isCompleted && (
                <button
                  type="button"
                  onClick={() => handleDownloadCertificate()}
                  className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#08bc66]"
                >
                  <i
                    className="fa-solid fa-award py-[3px]"
                    aria-hidden="true"
                  ></i>
                  <span className="hidden lg:block ml-1">Certificate</span>
                </button>
              )}
              <button
                onClick={handleToPrint}
                type="button"
                className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#188ae2]"
              >
                <i className="fa fa-print py-[3px]" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Print</span>
              </button>
              <button
                type="button"
                className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#f14343]"
                onClick={() => handleDownloadPdf()}
              >
                <i className="fa fa-download py-[3px]" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Download</span>
              </button>
              <button
                type="button"
                className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#3ba7e5]"
                onClick={() => setIsEmail(true)}
              >
                <i className="fa fa-envelope py-[3px]" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">Mail</span>
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => {
                  navigate(-1);
                }}
                type="button"
                className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-black font-[500] text-sm mr-[5px] bg-white"
              >
                Back
              </button>
              <button
                style={{
                  background: "#188ae2"
                }}
                type="button"
                className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[18px] text-white font-[500] text-[13px] mr-[5px] bg-[#188ae2]"
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
      <ModalUi
        isOpen={isCertificate}
        title={"Generating certificate"}
        handleClose={() => setIsCertificate(false)}
      >
        <div className="p-3 md:p-5 text-[13px] md:text-base text-center">
          <p>Completion certificate is generating,</p>
          <p>please wait for some time if not download try again later</p>
        </div>
      </ModalUi>
    </div>
  );
}

export default Header;
