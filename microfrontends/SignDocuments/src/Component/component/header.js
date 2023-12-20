import React from "react";
import PrevNext from "./prevNext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Certificate from "../Certificate/Certificate";
import printModule from "print-js";
import { getBase64FromUrl } from "../../utils/Utils";
import { saveAs } from "file-saver";
import "../../css/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { themeColor } from "../../utils/ThemeColor/backColor";

function Header({
  isPdfRequestFiles,
  isPlaceholder,
  recipient,
  setIsDecline,
  pageNumber,
  isAlreadySign,
  allPages,
  changePage,
  pdfUrl,
  documentStatus,
  embedImages,
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
  completeBtnTitle
}) {
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
  //certificate generate and download component in mobile view
  const CertificateDropDown = () => {
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
        {({ blob, url, loading, error }) => (
          <>
            {loading ? (
              <div
                style={{
                  border: "none",
                  backgroundColor: "#fff"
                }}
              >
                <i
                  className="fa fa-certificate"
                  style={{
                    marginRight: "2px"
                  }}
                  aria-hidden="true"
                ></i>
                Certificate
              </div>
            ) : (
              <div
                style={{
                  border: "none",
                  backgroundColor: "#fff"
                }}
                onClick={() =>
                  handleDownload(
                    blob,
                    `completion certificate-${
                      pdfDetails[0] && pdfDetails[0].Name
                    }.pdf`
                  )
                }
              >
                <i
                  className="fa fa-certificate"
                  style={{
                    marginRight: "2px"
                  }}
                  aria-hidden="true"
                ></i>
                Certificate
              </div>
            )}
          </>
        )}
      </PDFDownloadLink>
    );
  };
  const CertificateComponent = () => {
    return (
      <PDFDownloadLink
        style={{ textDecoration: "none" }}
        document={<Certificate pdfData={pdfDetails} />}
        fileName={`completion certificate-${
          pdfDetails[0] && pdfDetails[0].Name
        }.pdf`}
      >
        {({ blob, url, loading, error }) =>
          loading ? (
            <button
              type="button"
              className="defaultBtn certificateBtn"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <i
                className="fa fa-certificate"
                style={{
                  color: "white",
                  fontSize: "15px",
                  marginRight: "3px"
                }}
                aria-hidden="true"
              ></i>
              Certificate
            </button>
          ) : (
            <button
              type="button"
              className="defaultBtn certificateBtn"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <i
                className="fa fa-certificate"
                style={{
                  color: "white",
                  fontSize: "15px",
                  marginRight: "3px"
                }}
                aria-hidden="true"
              ></i>
              Certificate
            </button>
          )
        }
      </PDFDownloadLink>
    );
  };
  return (
    <div
      style={{ padding: !isGuestSigner && "5px 0px 5px 0px" }}
      className="mobileHead"
    >
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
            <div
              onClick={() => {
                navigate(-1);
              }}
            >
              <i
                className="fa fa-arrow-left"
                aria-hidden="true"
                style={{ color: themeColor(), cursor: "pointer" }}
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
                      color: themeColor(),
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
                    {recipient && pdfDetails[0] && pdfDetails.length > 0 ? (
                      <DropdownMenu.Item className="DropdownMenuItem">
                        <CertificateDropDown />
                      </DropdownMenu.Item>
                    ) : isPdfRequestFiles &&
                      alreadySign &&
                      isCompleted.isCertificate ? (
                      <DropdownMenu.Item className="DropdownMenuItem">
                        <CertificateDropDown />
                      </DropdownMenu.Item>
                    ) : (
                      isSignYourself && (
                        <>
                          <DropdownMenu.Item className="DropdownMenuItem">
                            <CertificateDropDown />
                          </DropdownMenu.Item>
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
                                class="fa fa-envelope"
                                style={{ marginRight: "2px" }}
                                aria-hidden="true"
                              ></i>
                              Mail
                            </div>
                          </DropdownMenu.Item>
                        </>
                      )
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
                        {" "}
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
                          color: isMailSend ? "gray" : themeColor(),
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
                            embedImages();
                          } else if (isPdfRequestFiles) {
                            embedImages();
                          }
                        }}
                        style={{
                          color: themeColor(),
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
        <div className="signatureHeader headerBtn">
          <PrevNext
            pageNumber={pageNumber}
            allPages={allPages}
            changePage={changePage}
          />

          {recipient ? (
            pdfUrl || isAlreadySign.mssg ? (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {pdfDetails[0] && pdfDetails.length > 0 && (
                  <CertificateComponent />
                )}
                <button
                  onClick={handleToPrint}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                  className="defaultBtn printBtn"
                >
                  <i
                    className="fa fa-print"
                    style={{
                      fontSize: "15px",
                      marginRight: "3px",
                      color: "white"
                    }}
                    aria-hidden="true"
                  ></i>
                  Print
                </button>

                <button
                  type="button"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                  className="defaultBtn downloadBtn"
                  onClick={() => handleDownloadPdf()}
                >
                  <i
                    className="fa fa-download"
                    style={{
                      color: "white",
                      fontSize: "15px",
                      marginRight: "3px"
                    }}
                    aria-hidden="true"
                  ></i>
                  Download
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <button
                  style={{
                    background: "#de4337"
                  }}
                  className="finishBtn hoverCss"
                  onClick={() => {
                    handleDeclinePdfAlert();
                  }}
                >
                  Decline
                </button>

                <button
                  data-tut="reactourThird"
                  style={{
                    background: !pdfUrl ? "#188ae2" : "#d3edeb"
                  }}
                  className="finishBtn sendHover"
                  onClick={() => {
                    if (!pdfUrl) {
                      embedImages();
                    }
                  }}
                >
                  Finish
                </button>
              </div>
            )
          ) : isPlaceholder ? (
            <>
              {!isMailSend &&
                signersdata.length > 0 &&
                signersdata.length !== signerPos.length && (
                  <div>
                    {signerPos.length === 0 ? (
                      <span style={{ fontSize: "13px", color: "#f5405e" }}>
                        Add all {signersdata.length - signerPos.length}{" "}
                        recipients signature
                      </span>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#f5405e" }}>
                        Add {signersdata.length - signerPos.length} more
                        recipients signature
                      </span>
                    )}
                  </div>
                )}

              <div>
                <button
                  onClick={() => {
                    navigate(-1);
                  }}
                  type="button"
                  className="defaultBtn backBtn"
                >
                  Back
                </button>

                <button
                  disabled={isMailSend && true}
                  data-tut="reactourFour"
                  style={{
                    background: isMailSend ? "rgb(203, 203, 203)" : "#188ae2",
                    color: isMailSend && "rgb(77, 75, 75)"
                  }}
                  onClick={() => {
                    alertSendEmail();
                  }}
                  className={isMailSend ? "sendMail" : "sendMail sendHover"}
                >
                  {completeBtnTitle ? completeBtnTitle : "Send"}
                </button>
              </div>
            </>
          ) : isPdfRequestFiles ? (
            alreadySign ? (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {isCompleted.isCertificate && <CertificateComponent />}
                <button
                  onClick={handleToPrint}
                  type="button"
                  className="defaultBtn printBtn"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <i
                    className="fa fa-print"
                    style={{
                      fontSize: "15px",
                      marginRight: "3px",
                      color: "white"
                    }}
                    aria-hidden="true"
                  ></i>
                  Print
                </button>

                <button
                  type="button"
                  className="defaultBtn downloadBtn"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                  onClick={() => handleDownloadPdf()}
                >
                  <i
                    className="fa fa-download"
                    style={{
                      color: "white",
                      fontSize: "15px",
                      marginRight: "3px"
                    }}
                    aria-hidden="true"
                  ></i>
                  Download
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    navigate(-1);
                  }}
                  type="button"
                  className="defaultBtn backBtn"
                >
                  Back
                </button>
                {currentSigner && (
                  <>
                    <button
                      style={{
                        background: "#de4337"
                      }}
                      className="finishBtn hoverCss"
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
                      className="finishBtn sendHover"
                      onClick={() => {
                        embedImages();
                      }}
                    >
                      Finish
                    </button>
                  </>
                )}
              </div>
            )
          ) : pdfUrl || (documentStatus && documentStatus.isCompleted) ? (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <CertificateComponent />
              <button
                onClick={handleToPrint}
                type="button"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center"
                }}
                className="defaultBtn printBtn"
              >
                <i
                  className="fa fa-print"
                  style={{
                    fontSize: "15px",
                    marginRight: "3px",
                    color: "white"
                  }}
                  aria-hidden="true"
                ></i>
                Print
              </button>
              <button
                type="button"
                className="defaultBtn downloadBtn"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: "10px"
                }}
                onClick={() => handleDownloadPdf()}
              >
                <i
                  className="fa fa-download"
                  style={{
                    color: "white",
                    fontSize: "15px",
                    marginRight: "3px"
                  }}
                  aria-hidden="true"
                ></i>
                Download
              </button>
              <button
                type="button"
                className="defaultBtn mailBtn"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: "10px"
                }}
                onClick={() => setIsEmail(true)}
              >
                <i
                  class="fa fa-envelope"
                  style={{
                    color: "white",
                    fontSize: "15px",
                    marginRight: "3px"
                  }}
                  aria-hidden="true"
                ></i>
                Mail
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  navigate(-1);
                }}
                type="button"
                className="defaultBtn backBtn"
              >
                Back
              </button>

              <button
                style={{
                  background: "#188ae2"
                }}
                type="button"
                className="finishBtn sendHover"
                onClick={() => {
                  if (!pdfUrl) {
                    embedImages();
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
