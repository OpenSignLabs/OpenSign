import React, { useState } from "react";
import RSC from "react-scrollbars-custom";
import { Document, Page } from "react-pdf";
import { themeColor } from "../../constant/const";

function RenderAllPdfPage({
  signPdfUrl,
  allPages,
  setAllPages,
  setPageNumber,
  setSignBtnPosition,
  pageNumber,
  signerPos,
  signerObjectId
}) {
  const [signPageNumber, setSignPageNumber] = useState([]);
  //set all number of pages after load pdf
  function onDocumentLoad({ numPages }) {
    setAllPages(numPages);
    //check if signerPos array exist then save page number exist in signerPos array to show bookmark icon
    if (signerPos) {
      const checkUser = signerPos.filter(
        (data) => data.signerObjId === signerObjectId
      );
      let pageNumberArr = [];
      if (checkUser?.length > 0) {
        checkUser[0]?.placeHolder?.map((data) => {
          pageNumberArr.push(data?.pageNumber);
        });

        setSignPageNumber(pageNumberArr);
      }
    }
  }

  //'function `addSignatureBookmark` is used to display the page where the user's signature is located.
  const addSignatureBookmark = (index) => {
    const ispageNumber = signPageNumber.includes(index + 1);
    return (
      ispageNumber && (
        <div
          style={{
            position: "absolute",
            zIndex: 2,
            top: -12,
            right: -7,
            transform: "translate(50% -50%)"
          }}
        >
          <i className="fa-solid fa-bookmark text-red-500"></i>
        </div>
      )
    );
  };
  return (
    <div className="showPages">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
          backgroundColor: "white",
          height: "100%"
        }}
      >
        <div style={{ width: "140px" }}>
          <div
            style={{
              background: themeColor
              //  color:"white"
            }}
            className="signedStyle"
          >
            Pages
          </div>

          <div>
            <RSC
              id="RSC-Example"
              style={{
                width: "135px",
                height: window.innerHeight - 130 + "px"
              }}
            >
              <Document
                loading={"Loading Document.."}
                onLoadSuccess={onDocumentLoad}
                file={signPdfUrl}
              >
                {Array.from(new Array(allPages), (el, index) => (
                  <div
                    key={index}
                    style={{
                      width: "100px",
                      border:
                        pageNumber - 1 === index
                          ? "2px solid red"
                          : "2px solid #878787",
                      // padding: "5px",
                      margin: "10px",

                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",

                      position: "relative"
                    }}
                    onClick={() => {
                      setPageNumber(index + 1);
                      if (setSignBtnPosition) {
                        setSignBtnPosition([]);
                      }
                    }}
                  >
                    {signerPos && addSignatureBookmark(index)}

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        overflow: "hidden"
                      }}
                    >
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={100}
                        height={100}
                        scale={1}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </div>
                  </div>
                ))}
              </Document>
            </RSC>
          </div>
          <hr />
        </div>
      </div>
    </div>
  );
}

export default RenderAllPdfPage;
