import React, {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect
} from "react";
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
import usePdfPinchZoom from "../../hook/usePdfPinchZoom";
import { useDispatch, useSelector } from "react-redux";
import Guidelines from "./Guidelines";
import { useGuidelinesContext } from "../../context/GuidelinesContext";
import { toggleSidebar } from "../../redux/reducers/sidebarReducer";

function RenderPdf(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [scaledHeight, setScaledHeight] = useState();
  const { guideline } = useGuidelinesContext();
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");
  const scrollTriggerId = useSelector((state) => state.widget.scrollTriggerId);
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const scrollRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    dispatch(toggleSidebar(false));
    return () => {
      dispatch(toggleSidebar(true));
    };
  }, []);

  // enable pinch to zoom only on actual pdf wrapper
  usePdfPinchZoom(
    pdfContainerRef,
    props.scale,
    props.setScale,
    props.setZoomPercent
  );

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

  // `smoothScrollTo` is used to provide smooth scrolling while focus on widget
  const smoothScrollTo = (targetY, duration = 500) => {
    const sb = scrollRef.current;
    if (!sb) return;
    const start = sb.scrollTop;
    const change = targetY - start;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeInOutQuad
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      sb.scrollTo(sb.scrollLeft, start + change * ease);
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // `scrollToTarget` is used to focus on widget and scroll to top
  const scrollToTarget = useCallback(() => {
    // Get the scrollbar container ref
    const sb = scrollRef.current;
    // If there's no content element or no widget details, bail out
    if (!sb?.contentElement || !props.currWidgetsDetails) return;

    // The absolute Y position (relative to the document) where we want to scroll
    const yPosition = props?.currWidgetsDetails?.yPosition || 0;
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );

    const targetTop = yPosition * containerScale * props.scale;
    // The Y offset of the scrollable content container itself
    const { offsetTop } = sb.contentElement;

    // Account for the header height + a little extra padding
    // Different header height if user is a guest signer
    const headerOffset = isGuestSigner ? 10 : 79;
    // Compute the scroll position inside the container
    const positionTop = targetTop - offsetTop - headerOffset;

    const pageNumber = props.pageNumber > 0 ? props.pageNumber - 1 : 0;
    const ogH = props.pdfOriginalWH[pageNumber]?.height;
    // If the modal for this widget is open, we may need to expand the PDF container
    if (props.isShowModal[scrollTriggerId]) {
      // Original PDF height for this page
      if (pdfContainerRef?.current) {
        // Increase container height to include the area up to the target
        pdfContainerRef.current.style.height = `${ogH + (targetTop - offsetTop)}px`;
      }
    } else {
      // Otherwise, reset any inline height override
      if (pdfContainerRef?.current) {
        pdfContainerRef.current.style.height = "";
      }
    }
    // Actually perform the scroll: keep the same horizontal scroll, scroll vertically
    if (targetTop > ogH * 0.75 && !isGuestSigner && isOpen) {
      smoothScrollTo(positionTop - 300);
    } else if (targetTop > ogH * 0.75 && !isGuestSigner && !isOpen) {
      smoothScrollTo(positionTop - 100);
    } else {
      smoothScrollTo(positionTop);
    }

    // Highlight only the target widget; reset others to default border
    document.querySelectorAll(".signYourselfBlock").forEach((w) => {
      w.style.border =
        w.id === String(scrollTriggerId)
          ? "1.5px solid red" // active widget in red
          : "1.5px solid #007bff"; // others in blue
    });
  }, [
    scrollTriggerId,
    props.currWidgetsDetails?.yPosition,
    props.isShowModal,
    props.pdfOriginalWH,
    props.pageNumber
  ]);

  useLayoutEffect(() => {
    // Whenever scrollTriggerId changes, fire off the scroll in the next rAF
    // to ensure the DOM has painted/layout is stable before scrolling
    if (scrollTriggerId) {
      scrollToTarget();
    }
  }, [scrollTriggerId, scrollToTarget]);

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
                      handleTabDrag={props.handleTabDrag}
                      handleStop={props.handleStop}
                      setUniqueId={props.setUniqueId}
                      setIsSelectId={props.setIsSelectId}
                      handleDeleteWidget={props.handleDeleteWidget}
                      setIsPageCopy={props.setIsPageCopy}
                      handleTextSettingModal={props.handleTextSettingModal}
                      handleCellSettingModal={props.handleCellSettingModal}
                      setIsCheckbox={props.setIsCheckbox}
                      isFreeResize={props.isSelfSign ? true : false}
                      isOpenSignPad={true}
                      assignedWidgetId={props.assignedWidgetId}
                      setCellCount={props.setCellCount}
                      setFontSize={props.setFontSize}
                      fontSize={props.fontSize}
                      fontColor={props.fontColor}
                      setFontColor={props.setFontColor}
                      setIsReqSignTourDisabled={props.setIsReqSignTourDisabled}
                      calculateFontsize={calculateFontsize}
                      currWidgetsDetails={props?.currWidgetsDetails}
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
        ref={scrollRef}
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
              ? `${isGuestSigner ? "30px" : ""} border-[0.1px] border-[#ebe8e8] overflow-x-auto relative`
              : "relative"
          }
          style={{
            width:
              props.containerWH?.width && props.containerWH?.width * props.scale
          }}
          ref={(node) => {
            pdfContainerRef.current = node;
            props.drop && props.drop(node);
          }}
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
                                        handleDeleteWidget={
                                          props.handleDeleteWidget
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
                                        setRoleName={props?.setRoleName}
                                        pdfDetails={props.pdfDetails}
                                        setIsReqSignTourDisabled={
                                          props.setIsReqSignTourDisabled
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
                                    handleDeleteWidget={
                                      props.handleDeleteWidget
                                    }
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
                                    setIsReqSignTourDisabled={
                                      props.setIsReqSignTourDisabled
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
          {guideline.show && (
            <Guidelines
              x1={guideline.x1}
              x2={guideline.x2}
              y1={guideline.y1}
              y2={guideline.y2}
            />
          )}
        </div>
      </RSC>
    </>
  );
}

export default RenderPdf;
