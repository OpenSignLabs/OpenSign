import React, { useState } from "react";
import RSC from "react-scrollbars-custom";
import { Document, Page } from "react-pdf";
import {
  defaultWidthHeight,
  getContainerScale,
  handleImageResize,
  handleSignYourselfImageResize,
  isMobile
} from "../../constant/Utils";
import Placeholder from "./Placeholder";
import Alert from "../../primitives/Alert";
import { useTranslation } from "react-i18next";

function RenderPdf(props) {
  const { t } = useTranslation();
  const [scaledHeight, setScaledHeight] = useState();
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  // handle signature block width and height according to screen
  const posWidth = (pos, signYourself) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const defaultWidth = defaultWidthHeight(pos.type).width;
    const posWidth = pos.Width ? pos.Width : defaultWidth;
    if (signYourself) {
      return posWidth * props.scale * containerScale;
    } else {
      if (pos.isMobile && pos.scale) {
        if (pos.IsResize) {
          if (props.scale > 1) {
            return posWidth * pos.scale * containerScale * props.scale;
          } else {
            return posWidth * containerScale;
          }
        } else {
          if (props.scale > 1) {
            return posWidth * pos.scale * containerScale * props.scale;
          } else {
            return posWidth * pos.scale * containerScale;
          }
        }
      } else {
        return posWidth * props.scale * containerScale;
      }
    }
  };
  const posHeight = (pos, signYourself) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const posHeight = pos.Height || defaultWidthHeight(pos.type).height;
    if (signYourself) {
      return posHeight * props.scale * containerScale;
    } else {
      if (pos.isMobile && pos.scale) {
        if (pos.IsResize) {
          if (props.scale > 1) {
            return posHeight * pos.scale * containerScale * props.scale;
          } else {
            return posHeight * containerScale;
          }
        } else {
          if (props.scale > 1) {
            return posHeight * pos.scale * containerScale * props.scale;
          } else {
            return posHeight * pos.scale * containerScale;
          }
        }
      } else {
        return posHeight * props.scale * containerScale;
      }
    }
  };

  // function for render placeholder block over pdf document (all signing flow)
  const checkSignedSigners = (data) => {
    let checkSign = [];
    //condition to handle quick send flow and using normal request sign flow
    checkSign = props.signedSigners
      ? props.signedSigners?.filter(
          (sign) =>
            sign?.Id === data?.Id || sign?.objectId === data?.signerObjId
        )
      : [];
    return (
      checkSign.length === 0 &&
      data?.placeHolder?.map((placeData, key) => (
        <React.Fragment key={key}>
          {placeData.pageNumber === props.pageNumber &&
            placeData.pos.map(
              (pos, ind) =>
                pos && (
                  <React.Fragment key={ind}>
                    <Placeholder
                      pos={pos}
                      handleSignYourselfImageResize={handleImageResize}
                      index={props.pageNumber}
                      xyPosition={props.signerPos}
                      setXyPosition={props.setSignerPos}
                      data={data}
                      setIsResize={props.setIsResize}
                      isShowBorder={props.isSelfSign}
                      isAlllowModify={props.isAlllowModify}
                      signerObjId={props.signerObjectId}
                      isShowDropdown={true}
                      isNeedSign={props.pdfRequest}
                      isSelfSign={true}
                      isSignYourself={false}
                      posWidth={posWidth}
                      posHeight={posHeight}
                      isDragging={props.isDragging}
                      pdfDetails={props.pdfDetails}
                      unSignedWidgetId={props.unSignedWidgetId}
                      setCurrWidgetsDetails={props.setCurrWidgetsDetails}
                      uniqueId={props.uniqueId}
                      scale={props.scale}
                      containerWH={props.containerWH}
                      pdfOriginalWH={props.pdfOriginalWH}
                      pageNumber={props.pageNumber}
                      ispublicTemplate={props.ispublicTemplate}
                      handleUserDetails={props.handleUserDetails}
                      isResize={props.isResize}
                      setIsAgreeTour={props.setIsAgreeTour}
                      isAgree={props.isAgree}
                      handleTabDrag={props.handleTabDrag}
                      handleStop={props.handleStop}
                      setUniqueId={props.setUniqueId}
                      setIsSelectId={props.setIsSelectId}
                      handleDeleteSign={props.handleDeleteSign}
                      setIsPageCopy={props.setIsPageCopy}
                      handleTextSettingModal={props.handleTextSettingModal}
                      handleCellSettingModal={props.handleCellSettingModal}
                      setIsCheckbox={props.setIsCheckbox}
                      isFreeResize={props.isSelfSign ? true : false}
                      isOpenSignPad={true}
                      assignedWidgetId={props.assignedWidgetId}
                      isApplyAll={true}
                      setCellCount={props.setCellCount}
                      setFontSize={props.setFontSize}
                      fontSize={props.fontSize}
                      fontColor={props.fontColor}
                      setFontColor={props.setFontColor}
                      setRequestSignTour={props.setRequestSignTour}
                      calculateFontsize={calculateFontsize}
                      currWidgetsDetails={props?.currWidgetsDetails}
                      setTempSignerId={props.setTempSignerId}
                    />
                  </React.Fragment>
                )
            )}
        </React.Fragment>
      ))
    );
  };

  const calculateFontsize = (pos) => {
    const width = posWidth(pos);
    const height = posHeight(pos);

    if (height === width || height < width) {
      return `${height / 5}px`;
    } else if (width < height) {
      return `${width / 10}px`;
    }
  };
  const pdfDataBase64 = `data:application/pdf;base64,${props.pdfBase64Url}`;
  // calculate render height of pdf in mobile view
  const handlePageLoadSuccess = (page) => {
    if (isMobile) {
      const containerWidth = props.divRef.current.offsetWidth; // Get container width
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width; // Scale to fit container width
      const scaleHeight = viewport.height * scale;
      setScaledHeight(scaleHeight);
    }
  };
  return (
    <>
      {props.successEmail && (
        <Alert type={"success"}>{t("success-email-alert")}</Alert>
      )}
      <RSC
        style={{
          position: "relative",
          boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
          height: isMobile
            ? isGuestSigner
              ? window.innerHeight - 49 // 49 is height of header
              : scaledHeight
            : `${window.innerHeight}px`,
          zIndex: 0
        }}
        noScrollY={isMobile ? props.scale === 1 : false}
        noScrollX={props.scale === 1}
      >
        <div
          data-tut={isMobile ? "reactourForth" : undefined}
          className={
            isMobile
              ? `${isGuestSigner ? "30px" : ""} border-[0.1px] border-[#ebe8e8] overflow-x-auto`
              : ""
          }
          style={{
            width:
              props.containerWH?.width && props.containerWH?.width * props.scale
          }}
          ref={props.drop}
          id="container"
        >
          {props.pdfLoad !== false &&
            props.containerWH?.width &&
            props.pdfOriginalWH.length > 0 && (
              <>
                {props.pdfRequest || props.isSelfSign
                  ? // request sign, guest sign,
                    props.signerPos?.map((data, key) => (
                      <React.Fragment key={key}>
                        {checkSignedSigners(data)}
                      </React.Fragment>
                    ))
                  : props.placeholder // placeholdersign document, draft document, create template, draft template
                    ? props.signerPos?.map((data, ind) => (
                        <React.Fragment key={ind}>
                          {data?.placeHolder &&
                            data?.placeHolder.map((placeData, index) => (
                              <React.Fragment key={index}>
                                {placeData.pageNumber === props.pageNumber &&
                                  placeData.pos.map((pos) => (
                                    <React.Fragment key={pos.key}>
                                      <Placeholder
                                        pos={pos}
                                        setIsPageCopy={props.setIsPageCopy}
                                        handleDeleteSign={
                                          props.handleDeleteSign
                                        }
                                        handleTabDrag={props.handleTabDrag}
                                        handleStop={props.handleStop}
                                        handleSignYourselfImageResize={
                                          handleImageResize
                                        }
                                        index={props.pageNumber}
                                        xyPosition={props.signerPos}
                                        setXyPosition={props.setSignerPos}
                                        data={data}
                                        setIsResize={props.setIsResize}
                                        setShowDropdown={props.setShowDropdown}
                                        isShowBorder={true}
                                        isPlaceholder={true}
                                        setUniqueId={props.setUniqueId}
                                        handleLinkUser={props.handleLinkUser}
                                        isSignYourself={false}
                                        posWidth={posWidth}
                                        posHeight={posHeight}
                                        isDragging={props.isDragging}
                                        setIsValidate={props.setIsValidate}
                                        setIsRadio={props.setIsRadio}
                                        setIsCheckbox={props.setIsCheckbox}
                                        setCurrWidgetsDetails={
                                          props.setCurrWidgetsDetails
                                        }
                                        handleNameModal={props.handleNameModal}
                                        setTempSignerId={props.setTempSignerId}
                                        uniqueId={props.uniqueId}
                                        handleTextSettingModal={
                                          props.handleTextSettingModal
                                        }
                                        handleCellSettingModal={
                                          props.handleCellSettingModal
                                        }
                                        scale={props.scale}
                                        containerWH={props.containerWH}
                                        pdfOriginalWH={props.pdfOriginalWH}
                                        pageNumber={props.pageNumber}
                                        setIsSelectId={props.setIsSelectId}
                                        fontSize={props.fontSize}
                                        setFontSize={props.setFontSize}
                                        setCellCount={props.setCellCount}
                                        fontColor={props.fontColor}
                                        setFontColor={props.setFontColor}
                                        isResize={props.isResize}
                                        unSignedWidgetId={
                                          props.unSignedWidgetId
                                        }
                                        isFreeResize={true}
                                        calculateFontsize={calculateFontsize}
                                        currWidgetsDetails={
                                          props?.currWidgetsDetails
                                        }
                                      />
                                    </React.Fragment>
                                  ))}
                              </React.Fragment>
                            ))}
                        </React.Fragment>
                      ))
                    : !props.pdfDetails?.[0]?.IsCompleted && // signyourself flow
                      props.xyPosition?.map((data, ind) => (
                        <React.Fragment key={ind}>
                          {data.pageNumber === props.pageNumber &&
                            data.pos.map(
                              (pos, id) =>
                                pos && (
                                  <Placeholder
                                    key={id}
                                    pos={pos}
                                    setIsPageCopy={props.setIsPageCopy}
                                    handleDeleteSign={props.handleDeleteSign}
                                    handleTabDrag={props.handleTabDrag}
                                    handleStop={props.handleStop}
                                    handleSignYourselfImageResize={
                                      handleSignYourselfImageResize
                                    }
                                    index={props.index}
                                    xyPosition={props.xyPosition}
                                    setXyPosition={props.setXyPosition}
                                    containerWH={props.containerWH}
                                    isShowBorder={true}
                                    isSignYourself={true}
                                    posWidth={posWidth}
                                    posHeight={posHeight}
                                    pdfDetails={props.pdfDetails[0]}
                                    isDragging={props.isDragging}
                                    setIsCheckbox={props.setIsCheckbox}
                                    setCurrWidgetsDetails={
                                      props.setCurrWidgetsDetails
                                    }
                                    handleTextSettingModal={
                                      props.handleTextSettingModal
                                    }
                                    handleCellSettingModal={
                                      props.handleCellSettingModal
                                    }
                                    scale={props.scale}
                                    pdfOriginalWH={props.pdfOriginalWH}
                                    pageNumber={props.pageNumber}
                                    fontSize={props.fontSize}
                                    setFontSize={props.setFontSize}
                                    fontColor={props.fontColor}
                                    setFontColor={props.setFontColor}
                                    isResize={props.isResize}
                                    setIsResize={props.setIsResize}
                                    isFreeResize={true}
                                    isOpenSignPad={true}
                                    calculateFontsize={calculateFontsize}
                                    currWidgetsDetails={
                                      props?.currWidgetsDetails
                                    }
                                  />
                                )
                            )}
                        </React.Fragment>
                      ))}
              </>
            )}
          <Document
            error={<p className="mx-2">{t("failed-to-load-refresh-page")}</p>}
            onLoadError={(e) => {
              console.log("PDF load error", e);
              props.setPdfLoad(false);
            }}
            loading={t("loading-doc")}
            onLoadSuccess={(pdf) => {
              props.setPdfLoad(true);
              props.pageDetails(pdf);
            }}
            onClick={() =>
              props.setCurrWidgetsDetails && props.setCurrWidgetsDetails({})
            }
            file={pdfDataBase64}
          >
            <Page
              key={props.index}
              onLoadSuccess={handlePageLoadSuccess}
              width={props.containerWH.width}
              scale={props.scale || 1}
              className={isMobile ? "select-none touch-callout-none" : "-z-[1]"}
              pageNumber={props.pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              onGetAnnotationsError={(error) => {
                console.log("annotation error", error);
              }}
            />
          </Document>
        </div>
      </RSC>
    </>
  );
}

export default RenderPdf;
