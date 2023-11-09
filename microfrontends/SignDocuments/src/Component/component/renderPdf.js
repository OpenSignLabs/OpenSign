import React from "react";
import RSC from "react-scrollbars-custom";
import Toast from "react-bootstrap/Toast";
import { Rnd } from "react-rnd";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function RenderPdf({
  pageNumber,
  pdfOriginalWidth,
  pdfNewWidth,
  drop,
  signerPos,
  successEmail,
  nodeRef,
  handleTabDrag,
  handleStop,
  handleImageResize,
  isDragging,
  setIsSignPad,
  setIsStamp,
  handleDeleteSign,
  setSignKey,
  pdfDetails,
  xyPostion,
  pdfRef,
  pdfUrl,
  numPages,
  pageDetails,
  recipient,
  isAlreadySign,
  pdfRequest,
  setCurrentSigner,
  signerObjectId,
  signedSigners,
  setPdfLoadFail,
  placeholder,
  pdfLoadFail
}) {
  const isMobile = window.innerWidth < 767;
  const newWidth = window.innerWidth;
  const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
 
  // handle signature block width and height according to screen
  const posWidth = (pos) => {
    let width;
    if (isMobile) {
      if (!pos.isMobile) {
        width = pos.Width / scale ? pos.Width / scale : 150 / scale;
        return width;
      } else {
        width = pos.Width ? pos.Width : 150;
        return width;
      }
    } else {
      width = pos.Width ? pos.Width : 150;
      return width;
    }
  };
  const posHeight = (pos) => {
    let width;
    if (isMobile) {
      if (!pos.isMobile) {
        width = pos.Height / scale ? pos.Height / scale : 60 / scale;
        return width;
      } else {
        width = pos.Height ? pos.Height : 60;
        return width;
      }
    } else {
      width = pos.Height ? pos.Height : 60;
      return width;
    }
  };
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  //function for render placeholder block over pdf document
  const checkSignedSignes = (data) => {
    const checkSign = signedSigners.filter(
      (sign) => sign.objectId === data.signerObjId
    );
    if (data.signerObjId === signerObjectId) {
      setCurrentSigner(true);
    }
    const xPos = (pos) => {
      //checking both condition mobile and desktop view
      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (!pos.isMobile) {
          return pos.xPosition / scale - 20;
        }
        //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
        else {
          return pos.xPosition * (pos.scale / scale);
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

        if (pos.isMobile) {
          return pos.scale && pos.xPosition * pos.scale + 50;
        }
        //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
        else {
          return pos.xPosition;
        }
      }
    };
    const yPos = (pos) => {
      //checking both condition mobile and desktop view
      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (!pos.isMobile) {
          return pos.yPosition / scale;
        }
        //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
        else {
          return pos.yPosition * (pos.scale / scale);
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

        if (pos.isMobile) {
          return pos.scale && pos.yPosition * pos.scale + 50;
        }
        //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
        else {
          return pos.yPosition;
        }
      }
    };
    return (
      checkSign.length === 0 &&
      data.placeHolder.map((placeData, key) => {
        return (
          <React.Fragment key={key}>
            {placeData.pageNumber === pageNumber &&
              placeData.pos.map((pos, index) => {
                return pos && pos.SignUrl ? (
                  <React.Fragment key={pos.key}>
                    <Rnd
                      disableDragging={true}
                      enableResizing={{
                        top: false,
                        right: false,
                        bottom: false,
                        left: false,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: false,
                        topLeft: false
                      }}
                      bounds="parent"
                      style={{
                        padding: "0px",
                        cursor: "all-scroll",
                        zIndex: 1,
                        position: "absolute",
                        borderStyle: "dashed",
                        width: "150px",
                        height: "60px",
                        borderColor: themeColor(),
                        background: "#daebe0",
                        textAlign: "center",
                        justifyContent: "center",
                        borderWidth: "0.2px"
                      }}
                      size={{
                        width: posWidth(pos),
                        height: posHeight(pos)
                      }}
                      lockAspectRatio={pos.Width && 2.5}
                      default={{
                        x: xPos(pos),
                        y: yPos(pos)
                      }}
                      onClick={() => {
                        setIsSignPad(true);
                        setSignKey(pos.key);
                      }}
                    >
                      <div style={{ pointerEvents: "none" }}>
                        <img
                          alt="no img"
                          onClick={() => {
                            setIsSignPad(true);
                            setSignKey(pos.key);
                          }}
                          src={pos.SignUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                          }}
                        />
                      </div>
                    </Rnd>
                  </React.Fragment>
                ) : (
                  <Rnd
                    disableDragging={true}
                    enableResizing={{
                      top: false,
                      right: false,
                      bottom: false,
                      left: false,
                      topRight: false,
                      bottomRight: false,
                      bottomLeft: false,
                      topLeft: false
                    }}
                    key={pos.key}
                    bounds="parent"
                    onClick={() => {
                      if (data.signerObjId === signerObjectId) {
                        setIsSignPad(true);
                        setSignKey(pos.key);
                        setIsStamp(pos.isStamp);
                      }
                    }}
                    style={{
                      padding: "0px",
                      cursor: "all-scroll",
                      zIndex: 1,
                      position: "absolute",
                      borderStyle: "dashed",
                      width: "200px",
                      height: "30px",
                      borderColor: themeColor(),
                      background: data.blockColor,
                      textAlign: "center",
                      justifyContent: "center",
                      borderWidth: "0.2px"
                    }}
                    default={{
                      x: xPos(pos),
                      y: yPos(pos)
                    }}
                    size={{
                      width: posWidth(pos),
                      height: posHeight(pos)
                    }}
                    lockAspectRatio={pos.Width ? pos.Width / pos.Height : 2.5}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "black",
                        fontWeight: "600",

                        marginTop: "0px"
                      }}
                    >
                      {pos.isStamp ? "stamp" : "signature"}
                    </div>
                  </Rnd>
                );
              })}
          </React.Fragment>
        );
      })
    );
  };

  return (
    <>
      {isMobile && scale ? (
        <div
          style={{
            border: "0.1px solid #ebe8e8",
            marginTop: isGuestSigner && "30px"
          }}
          ref={drop}
          id="container"
        >
          <div className="d-flex justify-content-center">
            <Toast
              show={successEmail}
              delay={3000}
              autohide
              className="d-inline-block m-1"
              bg="success"
              style={{ background: "#348545" }}
            >
              <Toast.Body className={"text-white"}>
                Email sent successful!
              </Toast.Body>
            </Toast>
          </div>
          {pdfLoadFail.status &&
            (recipient
              ? !pdfUrl &&
                !isAlreadySign.mssg &&
                xyPostion.length > 0 &&
                xyPostion.map((data, ind) => {
                  return (
                    <React.Fragment key={ind}>
                      {data.pageNumber === pageNumber &&
                        data.pos.map((pos) => {
                          return pos && pos.SignUrl ? (
                            <Rnd
                              disableDragging={true}
                              enableResizing={{
                                top: false,
                                right: false,
                                bottom: false,
                                left: false,
                                topRight: false,
                                bottomRight: false,
                                bottomLeft: false,
                                topLeft: false
                              }}
                              key={pos.key}
                              bounds="parent"
                              style={{
                                padding: "0px",
                                cursor: "all-scroll",
                                zIndex: 1,
                                position: "absolute",
                                borderStyle: "dashed",
                                width: "150px",
                                height: "60px",
                                borderColor: themeColor(),
                                background: "#daebe0",
                                textAlign: "center",
                                justifyContent: "center",
                                borderWidth: "0.2px"
                              }}
                              size={{
                                width: posWidth(pos),
                                height: posHeight(pos)
                              }}
                              lockAspectRatio={pos.Width && 2.5}
                              //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divide by scale
                              //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                              default={{
                                x: !pos.isMobile
                                  ? pos.xPosition / scale
                                  : pos.xPosition * (pos.scale / scale) - 50,

                                y: !pos.isMobile
                                  ? pos.yPosition / scale
                                  : pos.yPosition * (pos.scale / scale)
                              }}
                              onClick={() => {
                                setIsSignPad(true);
                                setSignKey(pos.key);
                              }}
                            >
                              <div style={{ pointerEvents: "none" }}>
                                <img
                                  alt="no img"
                                  onClick={() => {
                                    setIsSignPad(true);
                                    setSignKey(pos.key);
                                  }}
                                  src={pos.SignUrl}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                  }}
                                />
                              </div>
                            </Rnd>
                          ) : (
                            <Rnd
                              data-tut="reactourSecond"
                              enableResizing={{
                                top: false,
                                right: false,
                                bottom: false,
                                left: false,
                                topRight: false,
                                bottomRight: false,
                                bottomLeft: false,
                                topLeft: false
                              }}
                              key={pos.key}
                              bounds="parent"
                              style={{
                                padding: "0px",
                                cursor: "all-scroll",
                                zIndex: 1,
                                position: "absolute",
                                borderStyle: "dashed",
                                width: "150px",
                                height: "60px",
                                borderColor: themeColor(),
                                background: "#c1dee0",
                                textAlign: "center",
                                justifyContent: "center",
                                borderWidth: "0.2px"
                              }}
                              size={{
                                width: posWidth(pos),
                                height: posHeight(pos)
                              }}
                              disableDragging={true}
                              default={{
                                //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divide by scale
                                //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                                x: !pos.isMobile
                                  ? pos.xPosition / scale
                                  : pos.xPosition * (pos.scale / scale) - 50,

                                y: !pos.isMobile
                                  ? pos.yPosition / scale
                                  : pos.yPosition * (pos.scale / scale)
                              }}
                              onClick={() => {
                                setIsSignPad(true);
                                setSignKey(pos.key);
                                setIsStamp(pos.isStamp);
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "black",
                                  fontWeight: "600",
                                  justifyContent: "center",
                                  marginTop: "0px"
                                }}
                              >
                                {pos.isStamp ? "stamp" : "signature"}
                              </div>
                            </Rnd>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              : pdfRequest
              ? signerPos.map((data, key) => {
                  return (
                    <React.Fragment key={key}>
                      {checkSignedSignes(data)}
                    </React.Fragment>
                  );
                })
              : placeholder
              ? signerPos.map((data, ind) => {
                  return (
                    <React.Fragment key={ind}>
                      {data.placeHolder.map((placeData, index) => {
                        return (
                          <React.Fragment key={index}>
                            {placeData.pageNumber === pageNumber &&
                              placeData.pos.map((pos) => {
                                return (
                                  <Rnd
                                    key={pos.key}
                                    bounds="parent"
                                    style={{
                                      padding: "0px",
                                      cursor: "all-scroll",
                                      zIndex: 1,
                                      position: "absolute",
                                      borderStyle: "dashed",
                                      width: "200px",
                                      height: "30px",
                                      borderColor: themeColor(),
                                      background: data.blockColor,
                                      textAlign: "center",
                                      justifyContent: "center",
                                      borderWidth: "0.2px"
                                    }}
                                    onDrag={() =>
                                      handleTabDrag(pos.key, data.signerObjId)
                                    }
                                    size={{
                                      width: pos.Width ? pos.Width : 150,
                                      height: pos.Height ? pos.Height : 60
                                    }}
                                    lockAspectRatio={
                                      pos.Width ? pos.Width / pos.Height : 2.5
                                    }
                                    resizeHandleStyles={{
                                      bottom: { display: "none" },
                                      right: { display: "none" },
                                      bottomRight: { display: "block" }
                                    }}
                                    onDragStop={(event, dragElement) =>
                                      handleStop(
                                        event,
                                        dragElement,
                                        data.signerObjId,
                                        pos.key
                                      )
                                    }
                                    default={{
                                      x: pos.xPosition,
                                      y: pos.yPosition
                                    }}
                                    onResize={(
                                      e,
                                      direction,
                                      ref,
                                      delta,
                                      position
                                    ) => {
                                      handleImageResize(
                                        ref,
                                        pos.key,
                                        data.signerObjId,
                                        position
                                      );
                                    }}
                                  >
                                    <div
                                      onTouchStart={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSign(
                                          pos.key,
                                          data.signerObjId
                                        );
                                      }}
                                      style={{
                                        position: "absolute",
                                        right: 0,
                                        display: "inline-block",
                                        background: themeColor(),
                                        cursor: "pointer",
                                        padding: "0px 10px",
                                        zIndex: 10
                                      }}
                                    >
                                      x
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "black",
                                        fontWeight: "600",

                                        marginTop: "0px"
                                      }}
                                    >
                                      {pos.isStamp ? "stamp" : "signature"}
                                    </div>
                                  </Rnd>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              : xyPostion.map((data, ind) => {
                  return (
                    <React.Fragment key={ind}>
                      {data.pageNumber === pageNumber &&
                        data.pos.map((pos) => {
                          return pos && pos.SignUrl ? (
                            <Rnd
                              lockAspectRatio={
                                pos.Width ? pos.Width / pos.Height : 2.5
                              }
                              bounds="parent"
                              ref={nodeRef}
                              key={pos.key}
                              style={{
                                padding: "0px",
                                cursor: "all-scroll",
                                zIndex: 1,
                                position: "absolute",
                                borderStyle: "dashed",
                                width: "150px",
                                height: "60px",
                                borderColor: themeColor(),
                                background: "#daebe0",
                                textAlign: "center",
                                justifyContent: "center",
                                borderWidth: "0.2px",
                                overflow: "hidden",
                                userSelect: "none"
                              }}
                              size={{
                                width: pos.Width ? pos.Width : 151,
                                height: pos.Height ? pos.Height : 61
                              }}
                              default={{
                                x: pos.xPosition,
                                y: pos.yPosition
                              }}
                              onDrag={() => handleTabDrag(pos.key)}
                              onDragStop={handleStop}
                              onResize={(
                                e,
                                direction,
                                ref,
                                delta,
                                position
                              ) => {
                                handleImageResize(
                                  ref,
                                  pos.key,
                                  direction,
                                  position
                                );
                              }}
                            >
                              {" "}
                              <div
                                onTouchStart={(e) => {
                                  if (!isDragging) {
                                    setTimeout(() => {
                                      e.stopPropagation();
                                      setIsSignPad(true);
                                      setSignKey(pos.key);
                                      setIsStamp(pos.isStamp);
                                    }, 500);
                                  }
                                }}
                              >
                                <div
                                  ref={nodeRef}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSign(pos.key);
                                    setIsStamp(false);
                                  }}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    display: "inline-block",
                                    background: themeColor(),
                                    cursor: "pointer",
                                    padding: "0px 10px"
                                  }}
                                >
                                  x
                                </div>
                                <div style={{ pointerEvents: "none" }}>
                                  <img
                                    alt="signimg"
                                    onClick={(e) => {
                                      setSignKey(pos.key);
                                      setIsSignPad(true);
                                      setIsStamp(pos.isStamp);
                                    }}
                                    src={pos.SignUrl}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                </div>
                              </div>
                            </Rnd>
                          ) : (
                            <>
                              <Rnd
                                allowAnyClick
                                ref={nodeRef}
                                key={pos.key}
                                lockAspectRatio={
                                  pos.Width ? pos.Width / pos.Height : 2.5
                                }
                                bounds="parent"
                                style={{
                                  padding: "0px",
                                  cursor: "all-scroll",
                                  zIndex: 10,
                                  position: "absolute",
                                  borderStyle: "dashed",
                                  width: "150px",
                                  height: "60px",
                                  borderColor: themeColor(),
                                  background: "#daebe0",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  borderWidth: "0.2px",
                                  overflow: "hidden"
                                }}
                                onDrag={(e) => {
                                  handleTabDrag(pos.key, e);
                                }}
                                onDragStop={handleStop}
                                size={{
                                  width: pos.Width ? pos.Width : 150,
                                  height: pos.Height ? pos.Height : 60
                                }}
                                default={{
                                  x: pos.xPosition,
                                  y: pos.yPosition
                                }}
                              >
                                <div
                                  onTouchStart={(e) => {
                                    if (!isDragging) {
                                      setTimeout(() => {
                                        setIsSignPad(true);

                                        setSignKey(pos.key);
                                        setIsStamp(pos.isStamp);
                                      }, 500);
                                    }
                                  }}
                                  className="dragElm"
                                  style={{
                                    padding: "0px",
                                    cursor: "all-scroll",
                                    zIndex: 20,
                                    position: "absolute",
                                    borderStyle: "dashed",
                                    width: "150px",
                                    height: "60px",
                                    borderColor: themeColor(),
                                    background: "#daebe0",
                                    textAlign: "center",
                                    justifyContent: "center",
                                    borderWidth: "0.2px",
                                    overflow: "hidden"
                                  }}
                                >
                                  <div
                                    onTouchStart={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();

                                      handleDeleteSign(pos.key);
                                      setIsStamp(false);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent further event propagation
                                    }}
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      display: "inline-block",
                                      background: themeColor(),
                                      cursor: "pointer",
                                      padding: "0px 10px"
                                    }}
                                  >
                                    x
                                  </div>
                                  <div
                                    cancel=".dragElm"
                                    style={{
                                      fontSize: "12px",
                                      color: themeColor(),
                                      justifyContent: "center",
                                      marginTop: "20px"
                                    }}
                                  >
                                    {pos.isStamp ? "stamp" : "signature"}
                                  </div>
                                </div>
                              </Rnd>
                            </>
                          );
                        })}
                    </React.Fragment>
                  );
                }))}

          {/* this component for render pdf document is in middle of the component */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Document
              onLoadError={(e) => {
                if (recipient) {
                  setPdfLoadFail(true);
                }
              }}
              onLoadSuccess={pageDetails}
              ref={pdfRef}
              file={pdfUrl ? pdfUrl : pdfDetails[0] && pdfDetails[0].URL}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={index}
                  pageNumber={pageNumber}
                  width={window.innerWidth}
                  height={window.innerHeight}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onGetAnnotationsError={(error) => {
                    console.log("annotation error", error);
                  }}
                />
              ))}
            </Document>
          </div>
        </div>
      ) : (
        <RSC
          style={{
            position: "relative",
            boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
            width:
              pdfOriginalWidth > pdfNewWidth ? pdfNewWidth : pdfOriginalWidth,
            height: window.innerHeight - 110 + "px"
          }}
          noScrollY={false}
          noScrollX={pdfNewWidth < pdfOriginalWidth ? false : true}
        >
          <div
            style={{
              border: "0.1px solid #ebe8e8",
              width: pdfOriginalWidth
            }}
            ref={drop}
            id="container"
          >
            <div className="d-flex justify-content-center">
              <Toast
                show={successEmail}
                delay={3000}
                autohide
                className="d-inline-block m-1"
                bg="success"
                style={{ background: "#348545" }}
              >
                <Toast.Body className={"text-white"}>
                  Email sent successful!
                </Toast.Body>
              </Toast>
            </div>
            {pdfLoadFail.status &&
              (recipient
                ? !pdfUrl &&
                  !isAlreadySign.mssg &&
                  xyPostion.length > 0 &&
                  xyPostion.map((data, ind) => {
                    return (
                      <React.Fragment key={ind}>
                        {data.pageNumber === pageNumber &&
                          data.pos.map((pos) => {
                            return pos && pos.SignUrl ? (
                              <Rnd
                                disableDragging={true}
                                enableResizing={{
                                  top: false,
                                  right: false,
                                  bottom: false,
                                  left: false,
                                  topRight: false,
                                  bottomRight: false,
                                  bottomLeft: false,
                                  topLeft: false
                                }}
                                key={pos.key}
                                bounds="parent"
                                style={{
                                  padding: "0px",
                                  cursor: "all-scroll",
                                  zIndex: 1,
                                  position: "absolute",
                                  borderStyle: "dashed",
                                  width: "150px",
                                  height: "60px",
                                  borderColor: themeColor(),
                                  background: "#daebe0",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  borderWidth: "0.2px"
                                }}
                                size={{
                                  width: pos.Width ? pos.Width : 150,
                                  height: pos.Height ? pos.Height : 60
                                }}
                                lockAspectRatio={pos.Width && 2.5}
                                //if pos.isMobile false -- placeholder saved from mobile view then handle position in desktop view to multiply by scale

                                default={{
                                  x: pos.isMobile
                                    ? pos.scale &&
                                      pos.xPosition * pos.scale + 20
                                    : pos.xPosition,
                                  y: pos.isMobile
                                    ? pos.scale && pos.yPosition * pos.scale
                                    : pos.yPosition
                                }}
                                onClick={() => {
                                  setIsSignPad(true);
                                  setSignKey(pos.key);
                                }}
                              >
                                <div style={{ pointerEvents: "none" }}>
                                  <img
                                    alt="no img"
                                    onClick={() => {
                                      setIsSignPad(true);
                                      setSignKey(pos.key);
                                    }}
                                    src={pos.SignUrl}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                </div>
                              </Rnd>
                            ) : (
                              <Rnd
                                data-tut="reactourSecond"
                                enableResizing={{
                                  top: false,
                                  right: false,
                                  bottom: false,
                                  left: false,
                                  topRight: false,
                                  bottomRight: false,
                                  bottomLeft: false,
                                  topLeft: false
                                }}
                                key={pos.key}
                                bounds="parent"
                                style={{
                                  padding: "0px",
                                  cursor: "all-scroll",
                                  zIndex: 1,
                                  position: "absolute",
                                  borderStyle: "dashed",
                                  width: "150px",
                                  height: "60px",
                                  borderColor: themeColor(),
                                  background: "#c1dee0",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  borderWidth: "0.2px"
                                }}
                                size={{
                                  width: pos.Width ? pos.Width : 150,
                                  height: pos.Height ? pos.Height : 60
                                }}
                                disableDragging={true}
                                //if pos.isMobile false -- placeholder saved from mobile view then handle position in desktop view to multiply by scale

                                default={{
                                  x: pos.isMobile
                                    ? pos.scale &&
                                      pos.xPosition * pos.scale + 20
                                    : pos.xPosition,
                                  y: pos.isMobile
                                    ? pos.scale && pos.yPosition * pos.scale
                                    : pos.yPosition
                                }}
                                onClick={() => {
                                  setIsSignPad(true);
                                  setSignKey(pos.key);
                                  setIsStamp(pos.isStamp);
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "black",
                                    fontWeight: "600",
                                    justifyContent: "center",
                                    marginTop: "0px"
                                  }}
                                >
                                  {pos.isStamp ? "stamp" : "signature"}
                                </div>
                              </Rnd>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                : pdfRequest
                ? signerPos.map((data, key) => {
                    return (
                      <React.Fragment key={key}>
                        {checkSignedSignes(data)}
                      </React.Fragment>
                    );
                  })
                : placeholder
                ? signerPos.map((data, ind) => {
                    return (
                      <React.Fragment key={ind}>
                        {data.placeHolder.map((placeData, index) => {
                          return (
                            <React.Fragment key={index}>
                              {placeData.pageNumber === pageNumber &&
                                placeData.pos.map((pos) => {
                                  return (
                                    <Rnd
                                      key={pos.key}
                                      bounds="parent"
                                      style={{
                                        padding: "0px",
                                        cursor: "all-scroll",
                                        zIndex: 1,
                                        position: "absolute",
                                        borderStyle: "dashed",
                                        width: "200px",
                                        height: "30px",
                                        borderColor: themeColor(),
                                        background: data.blockColor,
                                        textAlign: "center",
                                        justifyContent: "center",
                                        borderWidth: "0.2px"
                                      }}
                                      onDrag={() =>
                                        handleTabDrag(pos.key, data.signerObjId)
                                      }
                                      size={{
                                        width: pos.Width ? pos.Width : 150,
                                        height: pos.Height ? pos.Height : 60
                                      }}
                                      lockAspectRatio={
                                        pos.Width ? pos.Width / pos.Height : 2.5
                                      }
                                      resizeHandleStyles={{
                                        bottom: { display: "none" },
                                        right: { display: "none" },
                                        bottomRight: { display: "block" }
                                      }}
                                      onDragStop={(event, dragElement) =>
                                        handleStop(
                                          event,
                                          dragElement,
                                          data.signerObjId,
                                          pos.key
                                        )
                                      }
                                      default={{
                                        x: pos.xPosition,
                                        y: pos.yPosition
                                      }}
                                      onResize={(
                                        e,
                                        direction,
                                        ref,
                                        delta,
                                        position
                                      ) => {
                                        handleImageResize(
                                          ref,
                                          pos.key,
                                          data.signerObjId,
                                          position
                                        );
                                      }}
                                    >
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSign(
                                            pos.key,
                                            data.signerObjId
                                          );
                                        }}
                                        style={{
                                          position: "absolute",
                                          right: 0,
                                          display: "inline-block",
                                          background: themeColor(),
                                          cursor: "pointer",
                                          padding: "0px 10px",
                                          zIndex: 10
                                        }}
                                      >
                                        x
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          color: "black",
                                          fontWeight: "600",

                                          marginTop: "0px"
                                        }}
                                      >
                                        {pos.isStamp ? "stamp" : "signature"}
                                      </div>
                                    </Rnd>
                                  );
                                })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                : xyPostion.map((data, ind) => {
                    return (
                      <React.Fragment key={ind}>
                        {data.pageNumber === pageNumber &&
                          data.pos.map((pos) => {
                            return pos && pos.SignUrl ? (
                              <Rnd
                                ref={nodeRef}
                                key={pos.key}
                                lockAspectRatio={
                                  pos.Width ? pos.Width / pos.Height : 2.5
                                }
                                bounds="parent"
                                style={{
                                  padding: "0px",
                                  cursor: "all-scroll",
                                  zIndex: 1,
                                  position: "absolute",
                                  borderStyle: "dashed",
                                  width: "150px",
                                  height: "60px",
                                  borderColor: themeColor(),
                                  background: "#daebe0",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  borderWidth: "0.2px",
                                  overflow: "hidden"
                                }}
                                onDrag={() => handleTabDrag(pos.key)}
                                size={{
                                  width: pos.Width ? pos.Width : 150,
                                  height: pos.Height ? pos.Height : 60
                                }}
                                onDragStop={handleStop}
                                default={{
                                  x: pos.xPosition,
                                  y: pos.yPosition
                                }}
                                onResize={(
                                  e,
                                  direction,
                                  ref,
                                  delta,
                                  position
                                ) => {
                                  handleImageResize(
                                    ref,
                                    pos.key,
                                    direction,
                                    position
                                  );
                                }}
                                onClick={() => {
                                  if (!isDragging) {
                                    setIsSignPad(true);
                                    setSignKey(pos.key);
                                    setIsStamp(pos.isStamp);
                                  }
                                }}
                              >
                                <div
                                  ref={nodeRef}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSign(pos.key);
                                    setIsStamp(false);
                                  }}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    display: "inline-block",
                                    background: themeColor(),
                                    cursor: "pointer",
                                    padding: "0px 10px"
                                  }}
                                >
                                  x
                                </div>
                                <div style={{ pointerEvents: "none" }}>
                                  <img
                                    alt="signimg"
                                    onClick={(e) => {
                                      setSignKey(pos.key);
                                      setIsSignPad(true);
                                      setIsStamp(pos.isStamp);
                                    }}
                                    src={pos.SignUrl}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                </div>
                              </Rnd>
                            ) : (
                              <Rnd
                                ref={nodeRef}
                                key={pos.key}
                                lockAspectRatio={
                                  pos.Width ? pos.Width / pos.Height : 2.5
                                }
                                bounds="parent"
                                style={{
                                  padding: "0px",
                                  cursor: "all-scroll",
                                  zIndex: 1,
                                  position: "absolute",
                                  borderStyle: "dashed",
                                  width: "150px",
                                  height: "60px",
                                  borderColor: themeColor(),
                                  background: "#daebe0",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  borderWidth: "0.2px",
                                  overflow: "hidden"
                                }}
                                onDrag={(e) => handleTabDrag(pos.key, e)}
                                size={{
                                  width: pos.Width ? pos.Width : 150,
                                  height: pos.Height ? pos.Height : 60
                                }}
                                onDragStop={handleStop}
                                default={{
                                  x: pos.xPosition,
                                  y: pos.yPosition
                                }}
                              >
                                <div
                                  className="dragElm"
                                  ref={nodeRef}
                                  onClick={(e) => {
                                    if (!isDragging) {
                                      e.stopPropagation();
                                      setIsSignPad(true);
                                      setSignKey(pos.key);
                                      setIsStamp(pos.isStamp);
                                    }
                                  }}
                                  style={{
                                    cursor: "all-scroll",
                                    zIndex: 10,
                                    position: "absolute",
                                    borderStyle: "dashed",
                                    width: "150px",
                                    height: "60px",
                                    borderColor: themeColor(),
                                    background: "#daebe0",
                                    textAlign: "center",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderWidth: "0.2px"
                                  }}
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSign(pos.key);
                                      setIsStamp(false);
                                    }}
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      display: "inline-block",
                                      background: themeColor(),
                                      cursor: "pointer",
                                      padding: "0px 10px"
                                    }}
                                  >
                                    x
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: themeColor(),
                                      justifyContent: "center",
                                      marginTop: "20px"
                                    }}
                                  >
                                    {pos.isStamp ? "stamp" : "signature"}
                                  </div>
                                </div>
                              </Rnd>
                            );
                          })}
                      </React.Fragment>
                    );
                  }))}
            {/* this component for render pdf document is in middle of the component */}

            <Document
              onLoadError={(e) => {
                if (recipient) {
                  const load = {
                    status: false,
                    type: "failed"
                  };
                  setPdfLoadFail(load);
                }
              }}
              onLoadSuccess={pageDetails}
              ref={pdfRef}
              file={pdfUrl ? pdfUrl : pdfDetails[0] && pdfDetails[0].URL}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={index}
                  pageNumber={pageNumber}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onGetAnnotationsError={(error) => {
                    console.log("annotation error", error);
                  }}
                />
              ))}
            </Document>
          </div>
        </RSC>
      )}
    </>
  );
}

export default RenderPdf;