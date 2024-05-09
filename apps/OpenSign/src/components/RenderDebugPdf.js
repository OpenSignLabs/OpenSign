import React from "react";
import { Document, Page } from "react-pdf";
import { Stage, Layer, Rect } from "react-konva";
const RenderDebugPdf = (props) => {
  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          padding: 10,
          zIndex: 1,
          backgroundColor: "white",
          border: "1px solid grey",
          margin: "5px 0"
        }}
      >
        {`Co-ordinates: X - ${props.hoverCoordinates.x}, Y - ${props.hoverCoordinates.y}`}
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          border: "1px solid grey",
          overflow: "auto",
          cursor: "crosshair"
        }}
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
          style={{ position: "absolute", top: 0, left: 0 }}
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
