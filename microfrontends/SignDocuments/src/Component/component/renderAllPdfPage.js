import React from "react";
import RSC from "react-scrollbars-custom";
import { Document, Page, pdfjs } from "react-pdf";
import { themeColor } from "../../utils/ThemeColor/backColor";

function RenderAllPdfPage({
  pdfUrl,
  signPdfUrl,
  allPages,
  setAllPages,
  setPageNumber,
  setSignBtnPosition,
  pageNumber
}) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  //set all number of pages after load pdf
  function onDocumentLoad({ numPages }) {
    setAllPages(numPages);
  }

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
              background: themeColor()
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
                file={pdfUrl ? pdfUrl : signPdfUrl}
                //   file="https://api.printnode.com/static/test/pdf/multipage.pdf"
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
                      contain: "content"
                    }}
                    onClick={() => {
                      setPageNumber(index + 1);
                      if (setSignBtnPosition) {
                        setSignBtnPosition([]);
                      }
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
