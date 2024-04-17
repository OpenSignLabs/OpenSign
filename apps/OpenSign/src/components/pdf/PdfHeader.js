import React from "react";
import PrevNext from "./PrevNext";
import printModule from "print-js";
import { getBase64FromUrl } from "../../constant/Utils";
import { saveAs } from "file-saver";
import "../../styles/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { themeColor } from "../../constant/const";
import Certificate from "./Certificate";
import { PDFDownloadLink } from "@react-pdf/renderer";

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

    const pdf = await getBase64FromUrl(pdfUrl);
    const isAndroidDevice = navigator.userAgent.match(/Android/i);
    const isAppleDevice =
      (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
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
  };

  //handle download signed pdf
  const handleDownloadPdf = () => {
    const pdfName = pdfDetails[0] && pdfDetails[0].Name;
    saveAs(pdfUrl, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
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
    }
  };

  const GenerateCertificate = () => {
    //after generate download certifcate pdf
    const handleDownload = (pdfBlob, fileName) => {
      if (pdfBlob) {
        const url = window.URL.createObjectURL(pdfBlob);
        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        // Append the anchor to the body
        document.body.appendChild(link);
        // Programmatically click the anchor to trigger the download
        link.click();
        // Remove the anchor from the body
        document.body.removeChild(link);
        // Release the object URL to free up resources
        window.URL.revokeObjectURL(url);
      }
    };

    return (
      <PDFDownloadLink
        onClick={(e) => e.preventDefault()}
        style={{ textDecoration: "none", zIndex: "35" }}
        document={<Certificate pdfData={pdfDetails} />}
      >
        {({ blob, loading }) => (
          <button
            onClick={() =>
              handleDownload(
                blob,
                `completion certificate-${
                  pdfDetails[0] && pdfDetails[0].Name
                }.pdf`
              )
            }
            disabled={loading}
            className=" md:bg-[#08bc66] border-none focus:outline-none flex flex-row items-center md:shadow md:rounded-[3px] py-[3px] md:px-[11px] md:text-white text-black md:font-[500] text-[13px] mr-[5px]"
          >
            <i className="fa-solid fa-award py-[3px]" aria-hidden="true"></i>
            <span className="md:hidden lg:block ml-1">Certificate</span>
          </button>
        )}
      </PDFDownloadLink>
    );
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
                      <>
                        {pdfDetails[0] && pdfDetails[0]?.CertificateUrl ? (
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
                        ) : (
                          <DropdownMenu.Item className="DropdownMenuItem">
                            <GenerateCertificate />
                          </DropdownMenu.Item>
                        )}
                      </>
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
                  <>
                    {pdfDetails[0] && pdfDetails[0]?.CertificateUrl ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate()}
                        className="flex flex-row items-center shadow rounded-[3px] py-[3px] px-[11px] text-white font-[500] text-[13px] mr-[5px] bg-[#08bc66]"
                      >
                        <i
                          className="fa-solid fa-award py-[3px]"
                          aria-hidden="true"
                        ></i>
                        <span className="hidden lg:block ml-1">
                          Certificate
                        </span>
                      </button>
                    ) : (
                      <GenerateCertificate />
                    )}
                  </>
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
                <>
                  {pdfDetails[0] && pdfDetails[0]?.CertificateUrl ? (
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
                  ) : (
                    <GenerateCertificate />
                  )}
                </>
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
    </div>
  );
}

export default Header;
