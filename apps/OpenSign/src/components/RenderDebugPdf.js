import React from "react";
import { Document, Page } from "react-pdf";
import { Stage, Layer, Rect } from "react-konva";
const RenderDebugPdf = (props) => {
  return (
    <div>
      <div className="sticky top-0 p-[10px] z-10 bg-white border-[1px] border-[gray] my-[5px]">
        {`Co-ordinates: X - ${props.hoverCoordinates.x}, Y - ${props.hoverCoordinates.y}`}
      </div>
      <div
        className="relative flex-1 cursor-crosshair border-[1px] border-[gray] overflow-auto"
        onMouseMove={props.handleMouseMoveDiv}
      >
        <Document
          onLoadError={() => {
            const load = {
              status: false,
              type: "failed"
            };
            props.setPdfLoadFail(load);
          }}
          loading={"Loading Document.."}
          onLoadSuccess={props.pageDetails}
          ref={props.pdfRef}
          file={props.pdfUrl}
        >
          <Page
            onLoadSuccess={props.handlePageLoadSuccess}
            pageNumber={props.pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            onGetAnnotationsError={(error) => {
              console.log("annotation error", error);
            }}
          />
        </Document>

        <Stage
          onMouseMove={props.handleMouseMove}
          onMouseDown={props.handleMouseDown}
          onMouseUp={props.handleMouseUp}
          width={props.pdfDimension.width}
          height={props.pdfDimension.height}
          className="absolute top-0 right-0"
        >
          <Layer>
            {props.annotations
              .filter((value) => value.page === props.pageNumber)
              .map((value) => {
                return (
                  <Rect
                    key={value.key}
                    x={value.x}
                    y={value.y}
                    width={value.width}
                    height={value.height}
                    fill="transparent"
                    stroke="black"
                  />
                );
              })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default RenderDebugPdf;
