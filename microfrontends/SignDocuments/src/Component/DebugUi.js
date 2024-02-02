import React, { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import "../css/./signature.css";
import { pdfNewWidthFun } from "../utils/Utils";
import "../css/AddUser.css";
import Title from "./component/Title";
import ModalUi from "../premitives/ModalUi";
import RenderDebugPdf from "./component/RenderDebugPdf";
import { pdfjs } from "react-pdf";
import Alert from "../premitives/Alert";

function processDimensions(x, y, width, height) {
  if (width < 0) {
    x -= Math.abs(width);
    width = Math.abs(width);
  }

  if (height < 0) {
    y -= Math.abs(height);
    height = Math.abs(height);
  }

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(width),
    height: Math.floor(height)
  };
}
const DebugUi = () => {
  const divRef = useRef(null);
  const isMobile = window.innerWidth < 767;
  const [pdf, setPdf] = useState("");
  const [isModal, setIsModal] = useState(true);
  const [allPages, setAllPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [containerWH, setContainerWH] = useState();
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [pdfDetails, setPdfDetails] = useState({
    name: "",
    pdftype: "",
    totalPages: "",
    currentPage: 1,
    x: 0,
    y: 0,
    base64: ""
  });
  const [hoverCoordinates, setHoverCoordinates] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);
  const [pdfDimension, setPdfDimension] = useState({ width: 0, height: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (divRef.current) {
      const pdfWidth = pdfNewWidthFun(divRef);
      setPdfNewWidth(pdfWidth);
      setContainerWH({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight
      });
    }
  }, [divRef.current]);

  useEffect(() => {
    if (pdf && pdf.name) {
      const fetchPdfMetadata = async () => {
        try {
          const pdfDataURL = URL.createObjectURL(pdf); // Convert File to data URL
          console.log("pdfDataURL ", pdfDataURL);
          const pdfInfo = await pdfjs.getDocument({ url: pdfDataURL }).promise;
          const pdfType = await inferPdfType(pdfInfo);
          setPdfDetails((prevDetails) => ({
            ...prevDetails,
            pdftype: pdfType
          }));
        } catch (error) {
          console.error("Error fetching PDF metadata:", error);
        }
      };

      fetchPdfMetadata();
    }
  }, [pdf]);

  const inferPdfType = async (pdf) => {
    try {
      const firstPage = await pdf.getPage(1);
      const scale = 1;
      const { width, height } = firstPage.getViewport({ scale });
      setPdfDimension({ width: width, height: height });

      // Assuming a standard DPI of 72, you can adjust this value if needed
      const dpi = 72;

      const widthInInches = width / dpi;
      const heightInInches = height / dpi;

      const isA1 = widthInInches > 23.39 && heightInInches > 16.54;
      const isA2 = widthInInches > 16.54 && heightInInches > 11.69;
      const isA3 = widthInInches > 11.69 && heightInInches > 8.27;
      const isA4 = widthInInches > 8.27 && heightInInches > 5.83;
      const isLegal = widthInInches > 8.5 && heightInInches > 14;
      const isLetter = widthInInches > 8.5 && heightInInches > 11;
      const isLedger = widthInInches > 11 && heightInInches > 17;

      if (isA1) return "A1";
      if (isA2) return "A2";
      if (isA3) return "A3";
      if (isA4) return "A4";
      if (isLegal) return "Legal";
      if (isLetter) return "Letter";
      if (isLedger) return "Ledger";

      return "Unknown";
    } catch (error) {
      console.error("Error getting page dimensions:", error);
      return "Unknown";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModal(false);
    setPdfDetails((prevData) => ({ ...prevData, name: pdf?.name }));
  };

  //function for get pdf page details
  const pageDetails = async ({ numPages }) => {
    const load = {
      status: true
    };
    setPdfDetails((prevDetails) => ({ ...prevDetails, totalPages: numPages }));
    setPdfLoadFail(load);
  };

  const handleMouseMoveDiv = (event) => {
    setHoverCoordinates({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY
    });
  };
  const handleMouseDown = (event) => {
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
        { x, y, width: 0, height: 0, key: "0", page: pageNumber }
      ]);
    }
  };

  const handleMouseUp = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const result = processDimensions(sx, sy, x - sx, y - sy);
      const annotationToAdd = {
        ...result,
        key: annotations.length + 1,
        page: pageNumber
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
      setPdfDetails((prevDetails) => ({
        ...prevDetails,
        x: result.x,
        y: result.y
      }));
    }
  };

  const handleMouseMove = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          page: pageNumber,
          key: "0"
        }
      ]);
    }
  };

  const annotationsToDraw = [...annotations, ...newAnnotation];

  const handlePageLoadSuccess = (page) => {
    setPdfDetails((prevDetails) => ({
      ...prevDetails,
      currentPage: page.pageNumber
    }));
  };

  const copytoclipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset copied state after 1.5 seconds
  };
  const handleFileChange = (files) => {
    const file = files[0];
    setPdf(file);

    if (file && file.type === "application/pdf") {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setPdfDetails((prevdata) => ({ ...prevdata, base64: base64String }));
      };

      reader.readAsDataURL(file);
    }
  };
  const handleDelete = (key) => {
    const updateAnnotations = annotations.filter((x) => x.key !== key);
    setAnnotations(updateAnnotations);
  };
  return (
    <div>
      {copied && <Alert type="success">Copied</Alert>}
      <Title title={"Debug Pdf"} />
      {!isModal && (
        <div className="signatureContainer" ref={divRef}>
          {/* this component used to render all pdf pages in left side */}
          <RenderAllPdfPage
            signPdfUrl={pdf}
            allPages={allPages}
            setAllPages={setAllPages}
            setPageNumber={setPageNumber}
            pageNumber={pageNumber}
          />
          {/* pdf render view */}
          <div
            style={{
              marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
              marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
            }}
          >
            <div data-tut="reactourThird">
              {containerWH && (
                <RenderDebugPdf
                  pdfUrl={pdf}
                  pageDetails={pageDetails}
                  pageNumber={pageNumber}
                  pdfOriginalWidth={pdfOriginalWidth}
                  pdfNewWidth={pdfNewWidth}
                  setPdfLoadFail={setPdfLoadFail}
                  pdfLoadFail={pdfLoadFail}
                  handlePageLoadSuccess={handlePageLoadSuccess}
                  handleMouseMove={handleMouseMove}
                  handleMouseUp={handleMouseUp}
                  handleMouseDown={handleMouseDown}
                  hoverCoordinates={hoverCoordinates}
                  annotations={annotationsToDraw}
                  pdfDimension={pdfDimension}
                  handleMouseMoveDiv={handleMouseMoveDiv}
                />
              )}
            </div>
          </div>
          <div style={{ backgroundColor: "white", width: 220 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                padding: "10px 12px",
                borderBottom: "1px solid grey"
              }}
            >
              PDF details
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              Name: {pdfDetails?.name}
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              Pdf type: {pdfDetails?.pdftype}
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              Total Pages: {pdfDetails?.totalPages}
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              Current Page: {pdfDetails?.currentPage}
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              Base64 : {pdfDetails?.base64.slice(0, 10)}...
              <span
                style={{
                  borderRadius: 4,
                  padding: "3px 5px",
                  border: "1px solid gray",
                  fontSize: 12,
                  margin: 2,
                  cursor: "pointer"
                }}
                onClick={() => copytoclipboard(pdfDetails?.base64)}
              >
                <i className="fa-solid fa-copy"></i>
              </span>
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                padding: "10px 12px",
                borderBottom: "1px solid grey"
              }}
            >
              Last click
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              x co-ordinate: {pdfDetails?.x}
            </div>
            <div style={{ fontSize: 14, padding: "5px 12px" }}>
              y co-ordinate: {pdfDetails?.y}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                padding: "10px 12px",
                borderBottom: "1px solid grey",
                borderTop: "1px solid grey"
              }}
            >
              Annotation
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 10,
                height: 500,
                overflowY: "auto",
                scrollbarWidth: 5
              }}
            >
              {annotations.map((coord, index) => (
                <li key={index}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{`Box ${
                    index + 1
                  }:`}</span>
                  <code
                    style={{ fontSize: 12, color: "black", cursor: "pointer" }}
                  >
                    {` ["page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}]`}
                  </code>
                  <div>
                    <span
                      style={{
                        borderRadius: 4,
                        padding: "3px 5px",
                        border: "1px solid gray",
                        fontSize: 12,
                        margin: 2,
                        cursor: "pointer"
                      }}
                      onClick={() =>
                        copytoclipboard(
                          `"page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}`
                        )
                      }
                    >
                      <i className="fa-solid fa-copy"></i>
                    </span>
                    <span
                      style={{
                        borderRadius: 4,
                        padding: "3px 5px",
                        border: "1px solid gray",
                        fontSize: 12,
                        margin: 2,
                        cursor: "pointer"
                      }}
                      onClick={() => handleDelete(coord.key)}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <ModalUi title={"Select PDF"} isOpen={isModal}>
        <form onSubmit={handleSubmit} style={{ margin: "10px" }}>
          <input
            type="file"
            onChange={(e) => handleFileChange(e.target.files)}
            style={{
              width: "100%",
              border: "1px solid grey",
              borderRadius: "4px",
              padding: "5px",
              fontSize: 12
            }}
            accept=".pdf"
            required
          />
          <div style={{ borderTop: "1px solid grey", margin: "10px 0" }}></div>
          <button
            style={{
              background: "#32a3ac",
              borderRadius: "2px",
              boxShadow:
                "0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.18)",
              border: "none",
              textTransform: "uppercase",
              fontSize: "13px",
              fontWeight: "600",
              padding: "0.375rem 0.75rem",
              textAlign: "center",
              color: "#ffffff",
              outline: "none"
            }}
            type="submit"
          >
            Submit
          </button>
        </form>
      </ModalUi>
    </div>
  );
};

export default DebugUi;
