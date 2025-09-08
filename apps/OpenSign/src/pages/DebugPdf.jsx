import { useEffect, useState } from "react";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import RenderDebugPdf from "../components/RenderDebugPdf";
import { pdfjs } from "react-pdf";
import ModalUi from "../primitives/ModalUi";
import Alert from "../primitives/Alert";
import HandleError from "../primitives/HandleError";
import { useWindowSize } from "../hook/useWindowSize";
import { useTranslation } from "react-i18next";

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
const DebugPdf = () => {
  const {t} = useTranslation()
  const { width } = useWindowSize();
  const [pdf, setPdf] = useState("");
  const [isModal, setIsModal] = useState(true);
  const [allPages, setAllPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
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
  const [pdfDimension, setPdfDimension] = useState({ width: 0, height: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pdf && pdf.name) {
      const fetchPdfMetadata = async () => {
        try {
          const pdfDataURL = URL.createObjectURL(pdf); // Convert File to data URL
          // console.log("pdfDataURL ", pdfDataURL);
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
      const firstPage = await pdf.getPage(pdf?.numPages > 1 ? 2 : 1);
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
      {copied && <Alert type="success">{t("copied")}</Alert>}
      {width < 800 ? (
        <HandleError handleError={"Debug PDF only availble for PC"} />
      ) : (
        <>
          {!isModal && (
            <div className="flex flex-row justify-between">
              {/* this component used to render all pdf pages in left side */}
              <RenderAllPdfPage
                pdfBase64Url={pdfDetails.base64}
                allPages={allPages}
                setAllPages={setAllPages}
                setPageNumber={setPageNumber}
                pageNumber={pageNumber}
              />
              {/* pdf render view */}
              <div>
                <div data-tut="reactourThird">
                  <RenderDebugPdf
                    pdfUrl={pdf}
                    pageDetails={pageDetails}
                    pageNumber={pageNumber}
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
                </div>
              </div>
              <div className="w-[220px] bg-base-100">
                <div className="text-[18px] font-medium py-[10px] px-[12px] border-b-[1px] border-[gray]">
                  PDF details
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  Name: {pdfDetails?.name}
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  Pdf type: {pdfDetails?.pdftype}
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  Total Pages: {pdfDetails?.totalPages}
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  Current Page: {pdfDetails?.currentPage}
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  Base64 : {pdfDetails?.base64.slice(0, 10)}...
                  <span
                    className="op-btn op-btn-outline op-btn-primary op-btn-xs rounded-md w-[25px] h-[25px] text-[12px] m-[2px] "
                    onClick={() => copytoclipboard(pdfDetails?.base64)}
                  >
                    <i className="fa-light fa-copy"></i>
                  </span>
                </div>
                <div className="text-[18px] font-medium py-[10px] px-[12px] border-b-[1px] border-[gray]">
                  Last click
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  x co-ordinate: {pdfDetails?.x}
                </div>
                <div className="text-[14px] py-[5px] px-[12px]">
                  y co-ordinate: {pdfDetails?.y}
                </div>
                <div className="text-[18px] font-medium py-[10px] px-[12px] border-y-[1px] border-[gray]">
                  Annotation
                </div>
                <ul className=" list-none p-[10px] h-[500px] overflow-y-auto">
                  {annotations.map((coord, index) => (
                    <li key={index}>
                      <span className="text-[13px] font-medium">{`Box ${
                        index + 1
                      }:`}</span>
                      <code className="text-[12px] text-base-content select-none">
                        {` ["page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}]`}
                      </code>
                      <div>
                        <span
                          className="op-btn op-btn-outline op-btn-primary op-btn-xs rounded-md w-[23px] h-[20px] text-[12px] m-[2px] "
                          onClick={() =>
                            copytoclipboard(
                              `"page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}`
                            )
                          }
                        >
                          <i className="fa-light fa-copy"></i>
                        </span>
                        <span
                          className="op-btn op-btn-outline op-btn-error op-btn-xs rounded-md w-[23px] h-[20px] text-[12px] m-[2px] "
                          onClick={() => handleDelete(coord.key)}
                        >
                          <i className="fa-light fa-trash-can"></i>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <ModalUi title={"Select PDF"} isOpen={isModal}>
            <form onSubmit={handleSubmit} className="m-[10px]">
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files)}
                className="op-file-input op-file-input-bordered op-file-input-sm focus:outline-none hover:border-base-content w-full h-[40px] text-xs"
                accept=".pdf"
                required
              />
              <button
                className="op-btn op-btn-primary w-full mt-3 mb-1"
                type="submit"
              >
                Submit
              </button>
            </form>
          </ModalUi>
        </>
      )}
    </div>
  );
};

export default DebugPdf;
