import React, { useState } from "react";
import RSC from "react-scrollbars-custom";
import { Document, Page } from "react-pdf";

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
  const [bookmarkColor, setBookmarkColor] = useState("");
  //set all number of pages after load pdf
  function onDocumentLoad({ numPages }) {
    setAllPages(numPages);
    //check if signerPos array exist then save page number exist in signerPos array to show bookmark icon
    if (signerPos) {
      const checkUser = signerPos.filter(
        (data) => data.signerObjId === signerObjectId
      );
      setBookmarkColor(checkUser[0]?.blockColor);
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
        <div className="absolute z-20 top-[1px] -right-[13px] -translate-x-1/2 -translate-y-1/2">
          <i
            style={{ color: bookmarkColor || "red" }}
            className="fa-solid fa-bookmark"
          ></i>
        </div>
      )
    );
  };
  return (
    <div>
      <div className=" hidden md:flex flex-row bg-base-100 h-full">
        <div className="w-[140px]">
          <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
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
                    className={`${
                      pageNumber - 1 === index
                        ? "border-[red]"
                        : "border-[#878787]"
                    } border-2 w-[100px] m-[10px] flex justify-center items-center relative`}
                    onClick={() => {
                      setPageNumber(index + 1);
                      if (setSignBtnPosition) {
                        setSignBtnPosition([]);
                      }
                    }}
                  >
                    {signerPos && addSignatureBookmark(index)}

                    <div className="relative z-[1] overflow-hidden">
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
