
import React from "react";
import RSC from "react-scrollbars-custom";
import { Rnd } from "react-rnd";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { Document, Page, pdfjs } from "react-pdf";
import BorderResize from "./borderResize";
import {
  addZIndex,
  handleImageResize,
  handleSignYourselfImageResize
} from "../../utils/Utils";
import EmailToast from "./emailToast";

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
  pdfLoadFail,
  setSignerPos,
  setXyPostion,
  index,
  containerWH,
  setIsResize,
  setZIndex
}) {
  const isMobile = window.innerWidth < 767;
  const newWidth = containerWH.width;
  const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  // handle signature block width and height according to screen
  const posWidth = (pos) => {
    let width;
    if (isMobile) {
      if (!pos.isMobile) {
        if (pos.IsResize) {
          width = pos.Width ? pos.Width : 150;
          return width;
        } else {
          width = (pos.Width || 150) / scale;
          return width;
        }
      } else {
        width = pos.Width ? pos.Width : 150;
        return width;
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          width = pos.Width ? pos.Width : 150;
          return width;
        } else {
          width = (pos.Width || 150) * pos.scale;
          return width;
        }
      } else {
        width = pos.Width ? pos.Width : 150;
        return width;
      }
    }
  };
  const posHeight = (pos) => {
    let height;
    if (isMobile) {
      if (!pos.isMobile) {
        if (pos.IsResize) {
          height = pos.Height ? pos.Height : 60;
          return height;
        } else {
          height = (pos.Height || 60) / scale;
          return height;
        }
      } else {
        height = pos.Height ? pos.Height : 60;
        return height;
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          height = pos.Height ? pos.Height : 60;
          return height;
        } else {
          height = (pos.Height || 60) * pos.scale;
          return height;
        }
      } else {
        height = pos.Height ? pos.Height : 60;
        return height;
      }
    }
  };

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
          return pos.xPosition / scale;
        }
        //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
        else {
          return pos.xPosition * (pos.scale / scale);
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

        if (pos.isMobile) {
          return pos.scale && pos.xPosition * pos.scale;
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
          return pos.scale && pos.yPosition * pos.scale;
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
                return (
                  pos && (
                    <React.Fragment key={pos.key}>
                      <Rnd
                        disableDragging={true}
                        enableResizing={{
                          top: false,
                          right: false,
                          bottom: false,
                          left: false,
                          topRight: false,
                          bottomRight:
                            data.signerObjId === signerObjectId && true,
                          bottomLeft: false,
                          topLeft: false
                        }}
                        bounds="parent"
                        style={{
                          cursor:
                            data.signerObjId === signerObjectId
                              ? "pointer"
                              : "not-allowed",
                          borderColor: themeColor(),
                          background: data.blockColor,
                          zIndex: "1"
                        }}
                        className="placeholderBlock"
                        size={{
                          width: posWidth(pos),
                          height: posHeight(pos)
                        }}
                        onResize={(e, direction, ref, delta, position) => {
                          handleImageResize(
                            ref,
                            pos.key,
                            data.signerObjId,
                            position,
                            signerPos,
                            pageNumber,
                            setSignerPos,
                            pdfOriginalWidth,
                            containerWH,
                            true
                          );
                        }}
                        lockAspectRatio={
                          pos.Width ? pos.Width / pos.Height : 2.5
                        }
                        default={{
                          x: xPos(pos),
                          y: yPos(pos)
                        }}
                        onClick={() => {
                          if (data.signerObjId === signerObjectId) {
                            setIsSignPad(true);
                            setSignKey(pos.key);
                            setIsStamp(pos.isStamp);
                          }
                        }}
                      >
                        <div style={{ pointerEvents: "none" }}>
                          {data.signerObjId === signerObjectId && (
                            <BorderResize />
                          )}
                          {pos.SignUrl ? (
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
                          ) : (
                            pdfDetails[0].Signers.map((signerData, key) => {
                              return (
                                signerData.objectId === data.signerObjId && (
                                  <div
                                    key={key}
                                    style={{
                                      fontSize: "12px",
                                      color: "black",
                                      fontWeight: "600",

                                      marginTop: "0px"
                                    }}
                                  >
                                    {signerData.Name}
                                  </div>
                                )
                              );
                            })
                          )}
                        </div>
                      </Rnd>
                    </React.Fragment>
                  )
                );
              })}
          </React.Fragment>
        );
      })
    );
  };

  //handled x-position in mobile view saved from big screen or small screen
  const xPos = (pos) => {
    //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
    if (!pos.isMobile) {
      return pos.xPosition / scale;
    } else {
      return pos.xPosition * (pos.scale / scale);
    }
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
          <EmailToast isShow={successEmail} />
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
                          return (
                            pos && (
                              <Rnd
                                data-tut="reactourSecond"
                                disableDragging={true}
                                enableResizing={{
                                  top: false,
                                  right: false,
                                  bottom: false,
                                  left: false,
                                  topRight: false,
                                  bottomRight: true,
                                  bottomLeft: false,
                                  topLeft: false
                                }}
                                key={pos.key}
                                bounds="parent"
                                style={{
                                  cursor: "all-scroll",
                                  borderColor: themeColor(),
                                  zIndex: "1"
                                }}
                                className="placeholderBlock"
                                onResize={(
                                  e,
                                  direction,
                                  ref,
                                  delta,
                                  position
                                ) => {
                                  handleSignYourselfImageResize(
                                    ref,
                                    pos.key,
                                    direction,
                                    position,
                                    xyPostion,
                                    index,
                                    setXyPostion,
                                    pdfOriginalWidth,
                                    containerWH
                                  );
                                }}
                                size={{
                                  width: posWidth(pos),
                                  height: posHeight(pos)
                                }}
                                lockAspectRatio={
                                  pos.Width ? pos.Width / pos.Height : 2.5
                                }
                                //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divide by scale
                                //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                                default={{
                                  x: xPos(pos),
                                  y: !pos.isMobile
                                    ? pos.yPosition / scale
                                    : pos.yPosition * (pos.scale / scale)
                                }}
                                onClick={() => {
                                  setIsSignPad(true);
                                  setSignKey(pos.key);
                                  setIsStamp(false);
                                }}
                              >
                                <BorderResize />
                                {pos.SignUrl ? (
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
                                ) : (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "black",

                                      justifyContent: "center",
                                      marginTop: "0px"
                                    }}
                                  >
                                    {pos.isStamp ? "stamp" : "signature"}
                                  </div>
                                )}
                              </Rnd>
                            )
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
                                        enableResizing={{
                                          top: false,
                                          right: false,
                                          bottom: false,
                                          left: false,
                                          topRight: false,
                                          bottomRight: true,
                                          bottomLeft: false,
                                          topLeft: false
                                        }}
                                        key={pos.key}
                                        bounds="parent"
                                        style={{
                                          cursor: "all-scroll",
                                          borderColor: themeColor(),
                                          background: data.blockColor,
                                          zIndex: pos.zIndex
                                        }}
                                        className="placeholderBlock"
                                        onDrag={() => handleTabDrag(pos.key)}
                                        size={{
                                          width: posWidth(pos),
                                          height: posHeight(pos)
                                        }}
                                        // size={{
                                        //   width: pos.Width ? pos.Width : 150,
                                        //   height: pos.Height ? pos.Height : 60
                                        // }}
                                        lockAspectRatio={
                                          pos.Width
                                            ? pos.Width / pos.Height
                                            : 2.5
                                        }
                                        onDragStop={(event, dragElement) =>
                                          handleStop(
                                            event,
                                            dragElement,
                                            data.Id,
                                            pos.key
                                          )
                                          // data.signerObjId,
                                        }
                                        default={{
                                          x: xPos(pos),
                                          y: !pos.isMobile
                                            ? pos.yPosition / scale
                                            : pos.yPosition * (pos.scale / scale)
                                        }}
                                        // default={{
                                        //   x: pos.xPosition,
                                        //   y: pos.yPosition
                                        // }}
                                        onResizeStart={() => {
                                          setIsResize(true);
                                        }}
                                        onResizeStop={() => {
                                          setIsResize && setIsResize(false);
                                        }}
                                        onResize={(
                                          e,
                                          direction,
                                          ref,
                                          delta,
                                          position
                                        ) => {
                                          e.stopPropagation();
                                          handleImageResize(
                                            ref,
                                            pos.key,
                                            data.signerObjId,
                                            position,
                                            signerPos,
                                            pageNumber,
                                            setSignerPos,
                                            pdfOriginalWidth,
                                            containerWH,
                                            false
                                          );
                                        }}
                                      >
                                        <div
                                          onTouchEnd={() => {
                                            const dataNewPlace = addZIndex(
                                              signerPos,
                                              pos.key,
                                              setZIndex
                                            );
                                            setSignerPos((prevState) => {
                                              const newState = [...prevState];
                                              newState.splice(
                                                0,
                                                signerPos.length,
                                                ...dataNewPlace
                                              );
                                              return newState;
                                            });
                                          }}
                                          style={{
                                            cursor: "all-scroll",
                                            borderColor: themeColor(),
                                            background: data.blockColor,
                                            zIndex: pos.zIndex,
                                            height: pos.Height
                                              ? pos.Height
                                              : 60,
                                            width: pos.Width ? pos.Width : 150
                                          }}
                                        >
                                          <BorderResize />

                                          <div
                                            onTouchStart={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSign(
                                                pos.key,
                                                data.Id
                                              );
                                              // data.signerObjId
                                            }}
                                            style={{
                                              background: themeColor()
                                            }}
                                            className="placeholdCloseBtn"
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
                                            {pos.isStamp
                                              ? "stamp"
                                              : "signature"}
                                          </div>
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
                              return (
                                pos && (
                                  <Rnd
                                    allowAnyClick
                                    enableResizing={{
                                      top: false,
                                      right: false,
                                      bottom: false,
                                      left: false,
                                      topRight: false,
                                      bottomRight: true,
                                      bottomLeft: false,
                                      topLeft: false
                                    }}
                                    lockAspectRatio={
                                      pos.Width ? pos.Width / pos.Height : 2.5
                                    }
                                    className="placeholderBlock"
                                    bounds="parent"
                                    ref={nodeRef}
                                    key={pos.key}
                                    style={{
                                      cursor: "all-scroll",
                                      borderColor: themeColor(),
                                      zIndex: "1"
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
                                      handleSignYourselfImageResize(
                                        ref,
                                        pos.key,
                                        direction,
                                        position,
                                        xyPostion,
                                        index,
                                        setXyPostion,
                                        pdfOriginalWidth,
                                        containerWH
                                      );
                                    }}
                                  >
                                    {" "}
                                    <div
                                      onTouchEnd={(e) => {
                                        if (!isDragging) {
                                          setTimeout(() => {
                                            e.stopPropagation();
                                            setIsSignPad(true);
                                            setSignKey(pos.key);
                                            setIsStamp(pos.isStamp);
                                          }, 500);
                                        }
                                      }}
                                      style={{
                                        height: "100%"
                                      }}
                                    >
                                      <BorderResize />
                                      <div
                                        ref={nodeRef}
                                        onTouchStart={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSign(pos.key);
                                          setIsStamp(false);
                                        }}
                                        style={{
                                          background: themeColor()
                                        }}
                                        className="placeholdCloseBtn"
                                      >
                                        x
                                      </div>
                                      {pos.SignUrl ? (
                                        <img
                                          alt="signimg"
                                          src={pos.SignUrl}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                          }}
                                        />
                                      ) : (
                                        <div
                                          cancel=".dragElm"
                                          style={{
                                            fontSize: "12px",
                                            color: themeColor(),
                                            justifyContent: "center"
                                          }}
                                        >
                                          {pos.isStamp ? "stamp" : "signature"}
                                        </div>
                                      )}
                                    </div>
                                  </Rnd>
                                )
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
              file={
                pdfUrl
                  ? pdfUrl
                  : pdfDetails[0] && pdfDetails[0].SignedUrl
                    ? pdfDetails[0].SignedUrl
                    : pdfDetails[0].URL
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={index}
                  pageNumber={pageNumber}
                  width={containerWH.width}
                  height={containerWH.height}
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
            <EmailToast isShow={successEmail} />
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
                            return (
                              pos && (
                                <Rnd
                                  data-tut="reactourSecond"
                                  disableDragging={true}
                                  enableResizing={{
                                    top: false,
                                    right: false,
                                    bottom: false,
                                    left: false,
                                    topRight: false,
                                    bottomRight: true,
                                    bottomLeft: false,
                                    topLeft: false
                                  }}
                                  onResize={(
                                    e,
                                    direction,
                                    ref,
                                    delta,
                                    position
                                  ) => {
                                    handleSignYourselfImageResize(
                                      ref,
                                      pos.key,
                                      direction,
                                      position,
                                      xyPostion,
                                      index,
                                      setXyPostion,
                                      pdfOriginalWidth,
                                      containerWH
                                    );
                                  }}
                                  key={pos.key}
                                  bounds="parent"
                                  style={{
                                    cursor: "all-scroll",
                                    borderColor: themeColor(),
                                    zIndex: "1"
                                  }}
                                  className="placeholderBlock"
                                  size={{
                                    width: posWidth(pos),
                                    height: posHeight(pos)
                                  }}
                                  lockAspectRatio={
                                    pos.Width ? pos.Width / pos.Height : 2.5
                                  }
                                  //if pos.isMobile false -- placeholder saved from mobile view then handle position in desktop view to multiply by scale

                                  default={{
                                    x: pos.isMobile
                                      ? pos.scale && pos.xPosition * pos.scale
                                      : pos.xPosition,
                                    y: pos.isMobile
                                      ? pos.scale && pos.yPosition * pos.scale
                                      : pos.yPosition
                                  }}
                                  onClick={() => {
                                    setIsSignPad(true);
                                    setSignKey(pos.key);
                                    setIsStamp(false);
                                  }}
                                >
                                  <div style={{ pointerEvents: "none" }}>
                                    <BorderResize />
                                    {pos.SignUrl ? (
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
                                    ) : (
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
                                    )}
                                  </div>
                                </Rnd>
                              )
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
                                          onClick={() => {
                                            const dataNewPlace = addZIndex(
                                              signerPos,
                                              pos.key,
                                              setZIndex
                                            );
                                            setSignerPos((prevState) => {
                                              const newState = [...prevState];
                                              newState.splice(
                                                0,
                                                signerPos.length,
                                                ...dataNewPlace
                                              );
                                              return newState;
                                            });
                                          }}
                                          key={pos.key}
                                          enableResizing={{
                                            top: false,
                                            right: false,
                                            bottom: false,
                                            left: false,
                                            topRight: false,
                                            bottomRight: true,
                                            bottomLeft: false,
                                            topLeft: false
                                          }}
                                          bounds="parent"
                                          style={{
                                            cursor: "all-scroll",
                                            background: data.blockColor,
                                            borderColor: themeColor(),
                                            zIndex:  pos.zIndex ? pos.zIndex : "1"
                                          }}
                                          className="placeholderBlock"
                                          onDrag={() => handleTabDrag(pos.key)}
                                          size={{
                                            width: pos.Width ? pos.Width : 150,
                                            height: pos.Height ? pos.Height : 60
                                          }}
                                          lockAspectRatio={
                                            pos.Width
                                              ? pos.Width / pos.Height
                                              : 2.5
                                          }
                                          onDragStop={(event, dragElement) =>
                                            handleStop(
                                              event,
                                              dragElement,
                                              data.Id,
                                              pos.key
                                            )
                                              // data.signerObjId,
                                          }
                                          default={{
                                            x: pos.xPosition,
                                            y: pos.yPosition
                                          }}
                                          onResizeStart={() => {
                                            setIsResize(true);
                                          }}
                                          onResizeStop={() => {
                                            setIsResize && setIsResize(false);
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
                                              position,
                                              signerPos,
                                              pageNumber,
                                              setSignerPos,
                                              pdfOriginalWidth,
                                              containerWH,
                                              false
                                            );
                                          }}
                                        >
                                          <BorderResize />
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSign(
                                                pos.key,
                                                data.Id
                                              );
                                              // data.signerObjId
                                            }}
                                            style={{
                                              background: themeColor()
                                            }}
                                            className="placeholdCloseBtn"
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
                                            {pos.isStamp
                                              ? "stamp"
                                              : "signature"}
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
                                return (
                                  pos && (
                                    <Rnd
                                      ref={nodeRef}
                                      key={pos.key}
                                      lockAspectRatio={
                                        pos.Width ? pos.Width / pos.Height : 2.5
                                      }
                                      enableResizing={{
                                        top: false,
                                        right: false,
                                        bottom: false,
                                        left: false,
                                        topRight: false,
                                        bottomRight: true,
                                        bottomLeft: false,
                                        topLeft: false
                                      }}
                                      bounds="parent"
                                      style={{
                                        borderColor: themeColor(),
                                        cursor: "all-scroll",
                                        zIndex: "1"
                                      }}
                                      className="placeholderBlock"
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
                                        handleSignYourselfImageResize(
                                          ref,
                                          pos.key,
                                          direction,
                                          position,
                                          xyPostion,
                                          index,
                                          setXyPostion,
                                          pdfOriginalWidth,
                                          containerWH
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
                                      <BorderResize />

                                      <span
                                        ref={nodeRef}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSign(pos.key);
                                          setIsStamp(false);
                                        }}
                                        style={{
                                          background: themeColor()
                                        }}
                                        className="placeholdCloseBtn"
                                      >
                                        x
                                      </span>

                                      {pos.SignUrl ? (
                                        <div style={{ pointerEvents: "none" }}>
                                          <img
                                            alt="signimg"
                                            src={pos.SignUrl}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain"
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            color: themeColor(),
                                            justifyContent: "center"
                                          }}
                                        >
                                          {pos.isStamp ? "stamp" : "signature"}
                                        </div>
                                      )}
                                    </Rnd>
                                  )
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
              file={
                pdfUrl
                  ? pdfUrl
                  : pdfDetails[0] && pdfDetails[0].SignedUrl
                    ? pdfDetails[0].SignedUrl
                    : pdfDetails[0].URL
              }
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
