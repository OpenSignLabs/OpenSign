import React, { useState } from "react";
import { saveAs } from "file-saver";
import celebration from "../../assests/newCeleb.gif";
import close from "../../assests/close.png";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import axios from "axios";
import { getBase64FromUrl } from "../../utils/Utils";
import { themeColor } from "../../utils/ThemeColor/backColor";
import printModule from "print-js";
import loader from "../../assests/loader2.gif";

function EmailComponent({
  isEmail,
  pdfUrl,
  isCeleb,
  setIsEmail,
  setSuccessEmail,
  signObjId,
  pdfName,
  sender
}) {
  const [emailCount, setEmailCount] = useState([]);
  const [emailValue, setEmailValue] = useState();
  const [isLoading, setIsLoading] = useState(false);
  //function for send email
  const sendEmail = async () => {
    setIsLoading(true);
    let sendMail, recipent;
    for (let i = 0; i < emailCount.length; i++) {
       
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
        
        const themeBGcolor = themeColor();
        let params = {
          pdfName: pdfName,
          url: pdfUrl,
          recipient: emailCount[i],
          subject: `${sender.name} has signed the doc - ${pdfName}`,
          from: sender.email,
          html:
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
            imgPng +
            "  height='50' style='padding:20px,width:170px,height:40px'/> </div><div style='padding:2px;font-family:system-ui; background-color:" +
            themeBGcolor +
            ";'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>  Document Copy</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>A copy of the document " +
            pdfName +
            " Standard is attached to this email. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from Open Sign. For any queries regarding this email, please contact the sender " +
            sender.email +
            " directly. If you think this email is inappropriate or spam, you may file a complaint with Open Sign here.</p></div></div></body></html>"
        };
        sendMail = await axios.post(url, params, { headers: headers });
      } catch (error) {
        console.log("error", error);
        setIsLoading(false);
        alert("Something went wrong!");
      }
    }

    if (sendMail.data.result.status === "success") {
      setIsEmail(false);
      setSuccessEmail(true);
      setTimeout(() => {
        setSuccessEmail(false);
      }, 3000);
      setIsLoading(false);
    } else if (sendMail.data.result.status === "error") {
      setIsLoading(false);
      alert("Something went wrong!");
    } else {
      setIsLoading(false);
      alert("Something went wrong!");
    }
  };
  //function for remove email
  const removeChip = (index) => {
    const updateEmailCount = emailCount.filter((data, key) => key !== index);
    setEmailCount(updateEmailCount);
  };
  //function for get email value
  const handleEmailValue = (e) => {
    const value = e.target.value;
    setEmailValue(value);
  };

  //function for save email in array after press enter
  const handleEnterPress = (e) => {
    if (e.key === "Enter" && emailValue) {
      setEmailCount((prev) => [...prev, emailValue]);
      setEmailValue("");
    } else if (e === "add" && emailValue) {
      setEmailCount((prev) => [...prev, emailValue]);
      setEmailValue("");
    }
  };

  // function for print signed pdf
  const handleToPrint = async (event) => {
    event.preventDefault();

    const isAndroidDevice = navigator.userAgent.match(/Android/i);
    const isAppleDevice = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream
    if (isAndroidDevice || isAppleDevice) {
      const byteArray = Uint8Array.from(atob(pdf).split('').map(char => char.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      printModule({ printable: pdf, type: "pdf", base64: true });
    }

  };

  //handle download signed pdf
  const handleDownloadPdf = () => {
    saveAs(pdfUrl, `${pdfName}_signed_by_OpenSign™.pdf`);
  };

  const isAndroid = /Android/i.test(navigator.userAgent);

  
  return (
    <div>
      {/* isEmail */}
      <Modal show={isEmail}>
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

        <ModalHeader style={{ background: themeColor() }}>
          <span style={{ color: "white" }}>Email Documents</span>

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
        </ModalHeader>

        <Modal.Body>
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
              fontSize: "15px"
            }}
          >
            Recipients added here will get a copy of the signed document.
          </p>
          {emailCount.length > 0 ? (
            <>
              <div className="addEmail">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                 
                    flexWrap: "wrap"
                  }}
                >
                  {emailCount.map((data, ind) => {
                    return (
                      <div className="emailChip" 
                      style={{display:"flex", flexDirection:"row", alignItems:"center"}}
                      key={ind}>
                        <span
                          style={{
                            color: "white",
                            fontSize: "13px",
                            marginRight: "20px"
                          }}
                        >
                          {data}
                        </span>

                        <img
                          alt="print img"
                          onClick={() => removeChip(ind)}
                          src={close}
                          width={10}
                          height={10}
                          style={{ fontWeight: "600" }}
                        />
                      </div>
                    );
                  })}
                </div>
                {emailCount.length <= 9 && (
                  <input
                    type="text"
                    value={emailValue}
                    className="addEmailInput"
                    onChange={handleEmailValue}
                    onKeyDown={handleEnterPress}
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
                backgroundColor: themeColor(),
                padding: "2px 10px",
                marginTop: "10px",
                color: "white"
              }}
              className="fa fa-plus"
              aria-hidden="true"
            ></i>
          </span>

          <div
            style={{
              background: "#e3e2e1",
              marginTop: "30px",
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
        </Modal.Body>

        <Modal.Footer>
          <button
            style={{
              color: "black"
            }}
            type="button"
            className="finishBtn"
            onClick={() => setIsEmail(false)}
          >
            Close
          </button>
          <button
            disabled={emailCount.length === 0 && true}
            style={{
              background: themeColor(),
              color: "white"
            }}
            type="button"
            className={emailCount.length === 0 ? "defaultBtn" : "finishBtn"}
            onClick={() => sendEmail()}
          >
            Send
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EmailComponent;
