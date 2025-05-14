import React from "react";
import { Document, Page } from "react-pdf";
import { Stage, Layer, Rect, Text } from "react-konva";
import { useTranslation } from "react-i18next";
const RenderDebugPdf = (props) => {
  const { t } = useTranslation();
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
          onLoadError={() => props.setPdfLoadFail(false)}
          loading={t("loading-doc")}
          error={<p className="mx-2">{t("failed-to-load-refresh-page")}</p>}
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
                const textX = value.x + value.width / 3;
                const textY = value.y + value.height / 2.5;
                return (
                  <React.Fragment key={value.key}>
                    <Rect
                      x={value.x}
                      y={value.y}
                      width={value.width}
                      height={value.height}
                      fill="#cbe9ed"
                      stroke="black"
                    />
                    <Text
                      x={textX}
                      y={textY}
                      text={
                        value?.key > 0 ? "box " + value.key.toString() : "box"
                      }
                      fontSize={16}
                      fill="black"
                      align="center"
                      verticalAlign="middle"
                    />
                  </React.Fragment>
                );
              })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default RenderDebugPdf;
