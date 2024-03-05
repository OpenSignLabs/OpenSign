import React, { useState } from "react";
import { saveAs } from "file-saver";
import celebration from "../../assets/images/newCeleb.gif";
import axios from "axios";
import { getBase64FromUrl } from "../../constant/Utils";
import { themeColor } from "../../constant/const";
import printModule from "print-js";
import loader from "../../assets/images/loader2.gif";

function EmailComponent({
  isEmail,
  pdfUrl,
  isCeleb,
  setIsEmail,
  setSuccessEmail,
  pdfName,
  sender,
  setIsAlert
}) {
  const [emailList, setEmailList] = useState([]);
  const [emailValue, setEmailValue] = useState();
  const [isLoading, setIsLoading] = useState(false);
  //function for send email
  const sendEmail = async () => {
    setIsLoading(true);
    let sendMail;
    for (let i = 0; i < emailList.length; i++) {
      try {
        const imgPng =
          "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png";
        // "https://qikinnovation.ams3.digitaloceanspaces.com/mailLogo_2023-08-18T12%3A51%3A31.573Z.png";

        let url = `${localStorage.getItem("baseUrl")}functions/sendmailv3/`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessionToken: localStorage.getItem("accesstoken")
        };
        const openSignUrl = "https://www.opensignlabs.com/contact-us";
        const themeBGcolor = themeColor;
        let params = {
          pdfName: pdfName,
          url: pdfUrl,
          recipient: emailList[i],
          subject: `${sender.name} has signed the doc - ${pdfName}`,
          from: sender.email,
          html:
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
            imgPng +
            "  height='50' style='padding:20px,width:170px,height:40px'/> </div><div style='padding:2px;font-family:system-ui; background-color:" +
            themeBGcolor +
            ";'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>  Document Copy</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>A copy of the document <strong>" +
            pdfName +
            " </strong>is attached to this email. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
            sender.email +
            " directly. If you think this email is inappropriate or spam, you may file a complaint with OpenSign™  <a href= " +
            openSignUrl +
            " target=_blank>here</a> </p></div></div></body></html>"
        };
        sendMail = await axios.post(url, params, { headers: headers });
      } catch (error) {
        console.log("error", error);
        setIsLoading(false);
        setIsEmail(false);
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong"
        });
      }
    }

    if (sendMail && sendMail.data.result.status === "success") {
      setSuccessEmail(true);
      setTimeout(() => {
        setSuccessEmail(false);
        setIsEmail(false);
        setEmailValue("");
        setEmailList([]);
      }, 1500);

      setIsLoading(false);
    } else if (sendMail && sendMail.data.result.status === "error") {
      setIsLoading(false);
      setIsEmail(false);
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong"
      });
      setEmailValue("");
      setEmailList([]);
    } else {
      setIsLoading(false);
      setIsEmail(false);
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong"
      });
      setEmailValue("");
      setEmailList([]);
    }
  };

  //function for remove email
  const removeChip = (index) => {
    const updateEmailCount = emailList.filter((data, key) => key !== index);
    setEmailList(updateEmailCount);
  };
  //function for get email value
  const handleEmailValue = (e) => {
    const value = e.target.value;
    setEmailValue(value);
  };

  //function for save email in array after press enter
  const handleEnterPress = (e) => {
    if (e.key === "Enter" && emailValue) {
      setEmailList((prev) => [...prev, emailValue]);
      setEmailValue("");
    } else if (e === "add" && emailValue) {
      setEmailList((prev) => [...prev, emailValue]);
      setEmailValue("");
    }
  };

  // function for print signed pdf
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
    saveAs(pdfUrl, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
  };

  const sanitizeFileName = (pdfName) => {
    // Replace spaces with underscore
    return pdfName.replace(/ /g, "_");
  };

  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <div>
      {/* isEmail */}
      {isEmail && (
        <div className="modaloverlay">
          <div className="modalcontainer">
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: "20",
                  backgroundColor: "#e6f2f2",
                  opacity: 0.8
                }}
              >
                <img
                  alt="no img"
                  src={loader}
                  style={{ width: "70px", height: "70px" }}
                />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                  This might take some time
                </span>
              </div>
            )}
            <div style={{ background: "#32a3ac" }} className="modalheader">
              <span style={{ color: "white" }}>Successfully signed!</span>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <div></div>
                {!isAndroid && (
                  <button
                    onClick={handleToPrint}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                    className="btn btn-primary btn-sm"
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
                )}

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDownloadPdf()}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "10px"
                  }}
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
            </div>
            <div style={{ height: "100%", padding: 20 }}>
              {isCeleb && (
                <div
                  style={{
                    position: "absolute",
                    marginLeft: "50px"
                  }}
                >
                  <img
                    alt="print img"
                    width={300}
                    height={250}
                    // style={styles.gifCeleb}
                    src={celebration}
                  />
                </div>
              )}
              <p
                style={{
                  fontFamily: "system-ui",
                  verticalAlign: "baseline",
                  fontWeight: "500",
                  color: "#403f3e",
                  fontSize: "15px",
                  marginBottom: "5px"
                }}
              >
                Recipients added here will get a copy of the signed document.
              </p>
              {emailList.length > 0 ? (
                <>
                  <div className="addEmail">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",

                        flexWrap: "wrap"
                      }}
                    >
                      {emailList.map((data, ind) => {
                        return (
                          <div
                            className="emailChip"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center"
                            }}
                            key={ind}
                          >
                            <span
                              style={{
                                color: "white",
                                fontSize: "13px"
                              }}
                            >
                              {data}
                            </span>
                            <span
                              style={{
                                color: "white",
                                fontSize: 13,
                                fontWeight: 600,
                                marginLeft: 7,
                                cursor: "pointer"
                              }}
                              onClick={() => removeChip(ind)}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {emailList.length <= 9 && (
                      <input
                        type="text"
                        value={emailValue}
                        className="addEmailInput"
                        onChange={handleEmailValue}
                        onKeyDown={handleEnterPress}
                        onBlur={() => {
                          if (emailValue) {
                            handleEnterPress("add");
                          }
                        }}
                        required
                      />
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <input
                    type="text"
                    value={emailValue}
                    className="emailInput"
                    onChange={handleEmailValue}
                    onKeyDown={handleEnterPress}
                    placeholder="Add the email addresses"
                    onBlur={() => {
                      if (emailValue) {
                        handleEnterPress("add");
                      }
                    }}
                    required
                  />
                </div>
              )}
              <span
                style={{
                  cursor: emailValue && "pointer"
                }}
                onClick={() => {
                  if (emailValue) {
                    handleEnterPress("add");
                  }
                }}
              >
                <i
                  style={{
                    backgroundColor: themeColor,
                    padding: "5px 7px",
                    marginTop: "10px",
                    color: "white",
                    borderRadius: "2px"
                  }}
                  className="fa fa-plus"
                  aria-hidden="true"
                ></i>
              </span>

              <div
                style={{
                  background: "#e3e2e1",
                  marginTop: "10px",
                  padding: "5px",
                  borderRadius: "3px"
                }}
              >
                <span style={{ fontWeight: "700" }}>Note:</span>
                <span style={{ fontSize: "15px" }}>
                  {" "}
                  You can only send to ten recipients at a time.
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#9f9f9f",
                  width: "100%",
                  marginTop: "15px",
                  marginBottom: "15px"
                }}
              ></div>
              <button
                disabled={emailList.length === 0 && true}
                style={{
                  background: themeColor,
                  color: "white"
                }}
                type="button"
                className={emailList.length === 0 ? "defaultBtn" : "finishBtn"}
                onClick={() => sendEmail()}
              >
                Send
              </button>
              <button
                type="button"
                className="finishBtn cancelBtn"
                onClick={() => {
                  setIsEmail(false);
                  setEmailValue("");
                  setEmailList([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailComponent;
