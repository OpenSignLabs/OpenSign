import React from "react";
import RSC from "react-scrollbars-custom";
import { Document, Page, pdfjs } from "react-pdf";

import {
  addZIndex,
  defaultWidthHeight,
  handleImageResize,
  handleSignYourselfImageResize
} from "../../utils/Utils";
import EmailToast from "./emailToast";
import PlaceholderBorder from "./placeholderBorder";
import Placeholder from "../WidgetComponent/placeholder";

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
  setZIndex,
  handleLinkUser,
  setUniqueId,
  signersdata,
  setIsPageCopy,
  setSignerObjId,
  setShowDropdown
}) {
  const isMobile = window.innerWidth < 767;
  const newWidth = containerWH.width;
  const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  // handle signature block width and height according to screen
  const posWidth = (pos, signYourself) => {
    const defaultWidth = defaultWidthHeight(pos.type).width;
    const posWidth = pos.Width ? pos.Width : defaultWidth;
    let width;
    if (signYourself) {
      width = posWidth;
      return width;
    } else {
      if (isMobile) {
        if (!pos.isMobile) {
          if (pos.IsResize) {
            width = posWidth ? posWidth : defaultWidth;
            return width;
          } else {
            width = (posWidth || defaultWidth) / scale;

            return width;
          }
        } else {
          width = posWidth;
          return width;
        }
      } else {
        if (pos.isMobile) {
          if (pos.IsResize) {
            width = posWidth ? posWidth : defaultWidth;
            return width;
          } else {
            width = (posWidth || defaultWidth) * pos.scale;
            return width;
          }
        } else {
          width = posWidth ? posWidth : defaultWidth;
          return width;
        }
      }
    }
  };
  const posHeight = (pos, signYourself) => {
    let height;
    const posHeight = pos.Height;
    const defaultHeight = defaultWidthHeight(pos.type).height;

    if (signYourself) {
      height = posHeight ? posHeight : defaultHeight;

      return height;
    } else {
      if (isMobile) {
        if (!pos.isMobile) {
          if (pos.IsResize) {
            height = posHeight ? posHeight : defaultHeight;
            return height;
          } else {
            height = (posHeight || defaultHeight) / scale;

            return height;
          }
        } else {
          height = posHeight ? posHeight : defaultHeight;
          return height;
        }
      } else {
        if (pos.isMobile) {
          if (pos.IsResize) {
            height = posHeight ? posHeight : defaultHeight;
            return height;
          } else {
            height = (posHeight || defaultHeight) * pos.scale;
            return height;
          }
        } else {
          height = posHeight ? posHeight : defaultHeight;
          return height;
        }
      }
    }
  };

  const xPos = (pos, signYourself) => {
    const resizePos = pos.xPosition;
    if (signYourself) {
      return resizePos;
    } else {
      //checking both condition mobile and desktop view
      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (!pos.isMobile) {
          return resizePos / scale;
        }
        //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
        else {
          return resizePos * (pos.scale / scale);
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

        if (pos.isMobile) {
          return pos.scale && resizePos * pos.scale;
        }
        //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
        else {
          return resizePos;
        }
      }
    }
  };
  const yPos = (pos, signYourself) => {
    const resizePos = pos.yPosition;
    if (signYourself) {
      return resizePos;
    } else {
      //checking both condition mobile and desktop view
      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (!pos.isMobile) {
          return resizePos / scale;
        }
        //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
        else {
          return resizePos * (pos.scale / scale);
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

        if (pos.isMobile) {
          return pos.scale && resizePos * pos.scale;
        }
        //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
        else {
          return resizePos;
        }
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
    const handleAllUserName = () => {
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
      });
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
                      {/* <Rnd
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
                          background: data.blockColor,
                          borderColor: themeColor(),
                          borderStyle: "dashed",
                          borderWidth: "0.1px",
                          zIndex: "1"
                        }}
                        className="signYourselfBlock"
                        size={{
                          width: posWidth(pos),
                          height: posHeight(pos)
                        }}
                        onClick={() => {
                          if (data.signerObjId === signerObjectId) {
                            setIsSignPad(true);
                            setSignKey(pos.key);
                            setIsStamp(pos.isStamp);
                          }
                        }}
                        onResize={(e, direction, ref, delta, position) => {
                          e.stopPropagation();
                          handleImageResize(
                            ref,
                            pos.key,
                            data.Id,
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
                      </Rnd> */}
                      <Placeholder
                        pos={pos}
                        setSignKey={setSignKey}
                        setIsSignPad={setIsSignPad}
                        setIsStamp={setIsStamp}
                        handleSignYourselfImageResize={handleImageResize}
                        index={pageNumber}
                        xyPostion={signerPos}
                        setXyPostion={setSignerPos}
                        data={data}
                        setIsResize={setIsResize}
                        isShowBorder={false}
                        signerObjId={signerObjectId}
                        isShowDropdown={true}
                        isNeedSign={true}
                        isSignYourself={false}
                        xPos={xPos}
                        yPos={yPos}
                        posWidth={posWidth}
                        posHeight={posHeight}
                        handleUserName={handleAllUserName}
                        isDragging={false}
                        pdfDetails={pdfDetails}
                      />
                    </React.Fragment>
                  )
                );
              })}
          </React.Fragment>
        );
      })
    );
  };

  const handleUserName = (Id, Role) => {
    if (Id) {
      const checkSign = signersdata.find((sign) => sign.Id === Id);
      if (checkSign?.Name) {
        return (
          <>
            <div style={{ color: "black", fontSize: 11 }}>
              {checkSign?.Name}
            </div>
            <div style={{ color: "black", fontSize: 11 }}> {`(${Role})`} </div>
          </>
        );
      } else {
        return <div style={{ color: "black", fontSize: 11 }}> {Role} </div>;
      }
    } else {
      return <div style={{ color: "black", fontSize: 11 }}> {Role} </div>;
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
            // recipient
            //   ? !pdfUrl &&
            //     !isAlreadySign.mssg &&
            //     xyPostion.length > 0 &&
            //     xyPostion.map((data, ind) => {
            //       return (
            //         <React.Fragment key={ind}>
            //           {data.pageNumber === pageNumber &&
            //             data.pos.map((pos) => {
            //               return (
            //                 pos && (
            //                   // <Rnd
            //                   //   data-tut="reactourSecond"
            //                   //   disableDragging={true}
            //                   //   enableResizing={{
            //                   //     top: false,
            //                   //     right: false,
            //                   //     bottom: false,
            //                   //     left: false,
            //                   //     topRight: false,
            //                   //     bottomRight: true,
            //                   //     bottomLeft: false,
            //                   //     topLeft: false
            //                   //   }}
            //                   //   key={pos.key}
            //                   //   bounds="parent"
            //                   //   style={{
            //                   //     cursor: "all-scroll",
            //                   //     borderColor: themeColor(),
            //                   //     borderStyle: "dashed",
            //                   //     borderWidth: "0.1px",
            //                   //     zIndex: "1",
            //                   //     background: data.blockColor
            //                   //       ? data.blockColor
            //                   //       : "#daebe0"
            //                   //   }}
            //                   //   className="signYourselfBlock"
            //                   //   onResize={(
            //                   //     e,
            //                   //     direction,
            //                   //     ref,
            //                   //     delta,
            //                   //     position
            //                   //   ) => {
            //                   //     handleSignYourselfImageResize(
            //                   //       ref,
            //                   //       pos.key,
            //                   //       xyPostion,
            //                   //       index,
            //                   //       setXyPostion
            //                   //     );
            //                   //   }}
            //                   //   size={{
            //                   //     width: posWidth(pos),
            //                   //     height: posHeight(pos)
            //                   //   }}
            //                   //   lockAspectRatio={
            //                   //     pos.Width ? pos.Width / pos.Height : 2.5
            //                   //   }
            //                   //   //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divide by scale
            //                   //   //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            //                   //   default={{
            //                   //     x: xPos(pos),
            //                   //     y: yPos(pos)
            //                   //   }}
            //                   //   onClick={() => {
            //                   //     setIsSignPad(true);
            //                   //     setSignKey(pos.key);
            //                   //     setIsStamp(
            //                   //       pos?.isStamp ? pos.isStamp : false
            //                   //     );
            //                   //   }}
            //                   // >
            //                   //   <BorderResize />
            //                   //   {pos.SignUrl ? (
            //                   //     <img
            //                   //       alt="no img"
            //                   //       onClick={() => {
            //                   //         setIsSignPad(true);
            //                   //         setSignKey(pos.key);
            //                   //       }}
            //                   //       src={pos.SignUrl}
            //                   //       style={{
            //                   //         width: "100%",
            //                   //         height: "100%",
            //                   //         objectFit: "contain"
            //                   //       }}
            //                   //     />
            //                   //   ) : (
            //                   //     <div
            //                   //       style={{
            //                   //         fontSize: "10px",
            //                   //         color: "black",

            //                   //         justifyContent: "center",
            //                   //         marginTop: "0px"
            //                   //       }}
            //                   //     >
            //                   //       <div>{pos.type}</div>

            //                   //       {handleUserName(
            //                   //         data.signerObjId,
            //                   //         data.Role
            //                   //       )}
            //                   //     </div>
            //                   //   )}
            //                   // </Rnd>
            //                   <Placeholder
            //                     pos={pos}
            //                     setSignKey={setSignKey}
            //                     setIsStamp={setIsStamp}
            //                     handleSignYourselfImageResize={
            //                       handleSignYourselfImageResize
            //                     }
            //                     index={index}
            //                     xyPostion={xyPostion}
            //                     setXyPostion={setXyPostion}
            //                     pdfOriginalWidth={pdfOriginalWidth}
            //                     containerWH={containerWH}
            //                     setIsSignPad={setIsSignPad}
            //                     isShowDropdown={true}
            //                     isRecipient={true}
            //                     isSignYourself={false}
            //                     xPos={xPos}
            //                     yPos={yPos}
            //                     posWidth={posWidth}
            //                     posHeight={posHeight}
            //                   />
            //                 )
            //               );
            //             })}
            //         </React.Fragment>
            //       );
            //     })
            //   :
            (pdfRequest
              ? signerPos.map((data, key) => {
                  return (
                    <React.Fragment key={key}>
                      {checkSignedSignes(data)}
                    </React.Fragment>
                  );
                })
              : placeholder // placeholder mobile
                ? signerPos.map((data, ind) => {
                    return (
                      <React.Fragment key={ind}>
                        {data.placeHolder.map((placeData, index) => {
                          return (
                            <React.Fragment key={index}>
                              {placeData.pageNumber === pageNumber &&
                                placeData.pos.map((pos) => {
                                  return (
                                    // <Rnd
                                    //   bounds="parent"
                                    //   enableResizing={{
                                    //     top: false,
                                    //     right: false,
                                    //     bottom: false,
                                    //     left: false,
                                    //     topRight: false,
                                    //     bottomRight: true,
                                    //     bottomLeft: false,
                                    //     topLeft: false
                                    //   }}
                                    //   key={pos.key}
                                    //   style={{
                                    //     cursor: "all-scroll",
                                    //     background: data.blockColor,
                                    //     borderColor: data.bac,
                                    //     zIndex: pos.zIndex
                                    //   }}
                                    //   className="signYourselfBlock"
                                    //   onDrag={() => handleTabDrag(pos.key)}
                                    //   size={{
                                    //     width: posWidth(pos),
                                    //     height: posHeight(pos)
                                    //   }}
                                    //   // size={{
                                    //   //   width: pos.Width ? pos.Width : 150,
                                    //   //   height: pos.Height ? pos.Height : 60
                                    //   // }}
                                    //   lockAspectRatio={
                                    //     pos.Width ? pos.Width / pos.Height : 2.5
                                    //   }
                                    //   onDragStop={
                                    //     (event, dragElement) =>
                                    //       handleStop(
                                    //         event,
                                    //         dragElement,
                                    //         data.Id,
                                    //         pos.key
                                    //       )
                                    //     // data.signerObjId,
                                    //   }
                                    //   // default={{
                                    //   //   x: pos.xPosition,
                                    //   //   y: pos.yPosition
                                    //   // }}
                                    //   default={{
                                    //     x: xPos(pos),
                                    //     y: yPos(pos)
                                    //   }}
                                    //   onResizeStart={() => {
                                    //     setIsResize(true);
                                    //   }}
                                    //   onResizeStop={() => {
                                    //     setIsResize && setIsResize(false);
                                    //   }}
                                    //   onResize={(
                                    //     e,
                                    //     direction,
                                    //     ref,
                                    //     delta,
                                    //     position
                                    //   ) => {
                                    //     handleImageResize(
                                    //       ref,
                                    //       pos.key,
                                    //       data.Id,
                                    //       position,
                                    //       signerPos,
                                    //       pageNumber,
                                    //       setSignerPos,
                                    //       pdfOriginalWidth,
                                    //       containerWH,
                                    //       true
                                    //     );
                                    //   }}
                                    // >
                                    //   <BorderResize right={-12} top={-11} />
                                    //   <PlaceholderBorder
                                    //     pos={pos}
                                    //     posWidth={posWidth}
                                    //     posHeight={posHeight}
                                    //   />
                                    //   <div
                                    //     onClick={(e) => {
                                    //       if (!isDragging) {
                                    //         handleLinkUser(data.Id);
                                    //         setUniqueId(data.Id);
                                    //       }
                                    //     }}
                                    //     onTouchEnd={() => {
                                    //       if (!isDragging) {
                                    //         handleLinkUser(data.Id);
                                    //         setUniqueId(data.Id);
                                    //       }
                                    //       const dataNewPlace = addZIndex(
                                    //         signerPos,
                                    //         pos.key,
                                    //         setZIndex
                                    //       );
                                    //       setSignerPos((prevState) => {
                                    //         const newState = [...prevState];
                                    //         newState.splice(
                                    //           0,
                                    //           signerPos.length,
                                    //           ...dataNewPlace
                                    //         );
                                    //         return newState;
                                    //       });
                                    //     }}
                                    //   >
                                    //     <i
                                    //       data-tut="reactourLinkUser"
                                    //       className="fa-regular fa-user signUserIcon"
                                    //       onTouchEnd={(e) => {
                                    //         e.stopPropagation();
                                    //         handleLinkUser(data.Id);
                                    //         setUniqueId(data.Id);
                                    //       }}
                                    //       onClick={(e) => {
                                    //         e.stopPropagation();
                                    //         handleLinkUser(data.Id);
                                    //         setUniqueId(data.Id);
                                    //       }}
                                    //       style={{
                                    //         color: "#188ae2"
                                    //       }}
                                    //     ></i>
                                    //     <i
                                    //       className="fa-regular fa-copy signCopy"
                                    //       onTouchEnd={(e) => {
                                    //         e.stopPropagation();
                                    //         setIsPageCopy(true);
                                    //         setSignKey(pos.key);
                                    //         setSignerObjId(data.signerObjId);
                                    //         setUniqueId(data.Id);
                                    //       }}
                                    //       onClick={(e) => {
                                    //         e.stopPropagation();
                                    //         setIsPageCopy(true);
                                    //         setSignKey(pos.key);
                                    //         setSignerObjId(data.signerObjId);
                                    //         setUniqueId(data.Id);
                                    //       }}
                                    //       style={{
                                    //         color: "#188ae2"
                                    //       }}
                                    //     ></i>
                                    //     <i
                                    //       className="fa-regular fa-circle-xmark signCloseBtn"
                                    //       onTouchEnd={(e) => {
                                    //         e.stopPropagation();
                                    //         handleDeleteSign(pos.key, data.Id);
                                    //       }}
                                    //       onClick={(e) => {
                                    //         e.stopPropagation();
                                    //         handleDeleteSign(pos.key, data.Id);
                                    //         // data.signerObjId
                                    //       }}
                                    //       style={{
                                    //         color: "#188ae2"
                                    //       }}
                                    //     ></i>

                                    //     <div
                                    //       style={{
                                    //         fontSize: "10px",
                                    //         color: "black",
                                    //         fontWeight: "500",
                                    //         marginTop: "0px"
                                    //       }}
                                    //     >
                                    //       <div>{pos.type}</div>
                                    //       {handleUserName(
                                    //         data.signerObjId,
                                    //         data.Role
                                    //       )}{" "}
                                    //     </div>
                                    //   </div>
                                    // </Rnd>
                                    <React.Fragment key={pos.key}>
                                      <Placeholder
                                        pos={pos}
                                        setIsPageCopy={setIsPageCopy}
                                        setSignKey={setSignKey}
                                        handleDeleteSign={handleDeleteSign}
                                        setIsStamp={setIsStamp}
                                        handleTabDrag={handleTabDrag}
                                        handleStop={handleStop}
                                        handleSignYourselfImageResize={
                                          handleImageResize
                                        }
                                        index={pageNumber}
                                        xyPostion={signerPos}
                                        setXyPostion={setSignerPos}
                                        setSignerObjId={setSignerObjId}
                                        data={data}
                                        setIsResize={setIsResize}
                                        setShowDropdown={setShowDropdown}
                                        isShowBorder={true}
                                        isPlaceholder={true}
                                        setUniqueId={setUniqueId}
                                        handleLinkUser={handleLinkUser}
                                        handleUserName={handleUserName}
                                        isSignYourself={false}
                                        xPos={xPos}
                                        yPos={yPos}
                                        posWidth={posWidth}
                                        posHeight={posHeight}
                                        isDragging={isDragging}
                                      />
                                    </React.Fragment>
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
                                // <Rnd
                                //   allowAnyClick
                                //   enableResizing={{
                                //     top: false,
                                //     right: false,
                                //     bottom: false,
                                //     left: false,
                                //     topRight: false,
                                //     bottomRight: true,
                                //     bottomLeft: false,
                                //     topLeft: false
                                //   }}
                                //   lockAspectRatio={
                                //     pos.Width ? pos.Width / pos.Height : 2.5
                                //   }
                                //   bounds="parent"
                                //   ref={nodeRef}
                                //   key={pos.key}
                                //   className="signYourselfBlock"
                                //   style={{
                                //     border: "1px solid red",
                                //     cursor: "all-scroll",
                                //     zIndex: "1",
                                //     background: "#daebe0"
                                //   }}
                                //   size={{
                                //     width: posWidth(pos, true),
                                //     height: posHeight(pos, true)
                                //   }}
                                //   default={{
                                //     x: xPos(pos, true),
                                //     y: yPos(pos, true)
                                //   }}
                                //   onDrag={() => handleTabDrag(pos.key)}
                                //   onDragStop={handleStop}
                                //   onResize={(
                                //     e,
                                //     direction,
                                //     ref,
                                //     delta,
                                //     position
                                //   ) => {
                                //     handleSignYourselfImageResize(
                                //       ref,
                                //       pos.key,
                                //       xyPostion,
                                //       index,
                                //       setXyPostion
                                //     );
                                //   }}
                                // >
                                //   <BorderResize right={-12} top={-11} />
                                //   <PlaceholderBorder
                                //     pos={pos}
                                //     posWidth={posWidth}
                                //     isSignYourself={true}
                                //     posHeight={posHeight}
                                //   />
                                //   <div
                                //     style={{
                                //       left: xPos(pos, true),
                                //       top: yPos(pos, true),
                                //       width: posWidth(pos, true),
                                //       height: posHeight(pos, true),
                                //       zIndex: "10"
                                //     }}
                                //     onTouchEnd={(e) => {
                                //       if (!isDragging && isMobile) {
                                //         setTimeout(() => {
                                //           e.stopPropagation();
                                //           setIsSignPad(true);
                                //           setSignKey(pos.key);
                                //           setIsStamp(pos.isStamp);
                                //         }, 500);
                                //       }
                                //     }}
                                //   >
                                //     <i
                                //       className="fa-regular fa-copy signCopy"
                                //       onTouchEnd={(e) => {
                                //         e.stopPropagation();
                                //         setIsPageCopy(true);
                                //         setSignKey(pos.key);
                                //       }}
                                //       style={{
                                //         color: "#188ae2"
                                //       }}
                                //     ></i>
                                //     <i
                                //       className="fa-regular fa-circle-xmark signCloseBtn"
                                //       onTouchEnd={(e) => {
                                //         e.stopPropagation();
                                //         if (data) {
                                //           handleDeleteSign(
                                //             pos.key,
                                //             data.signerObjId
                                //           );
                                //         } else {
                                //           handleDeleteSign(pos.key);
                                //           setIsStamp(false);
                                //         }
                                //       }}
                                //       style={{
                                //         color: "#188ae2"
                                //       }}
                                //     ></i>

                                //     {pos.SignUrl ? (
                                //       <div style={{ pointerEvents: "none" }}>
                                //         <img
                                //           alt="signimg"
                                //           src={pos.SignUrl}
                                //           style={{
                                //             width: "100%",
                                //             height: "100%",
                                //             objectFit: "contain"
                                //           }}
                                //         />
                                //       </div>
                                //     ) : (
                                //       <div
                                //         style={{
                                //           fontSize: "10px",
                                //           color: "black",
                                //           justifyContent: "center"
                                //         }}
                                //       >
                                //         {pos.isStamp ? "stamp" : "signature"}
                                //       </div>
                                //     )}
                                //   </div>
                                // </Rnd>
                                <Placeholder
                                  pos={pos}
                                  setIsPageCopy={setIsPageCopy}
                                  setSignKey={setSignKey}
                                  handleDeleteSign={handleDeleteSign}
                                  setIsStamp={setIsStamp}
                                  handleTabDrag={handleTabDrag}
                                  handleStop={handleStop}
                                  handleSignYourselfImageResize={
                                    handleSignYourselfImageResize
                                  }
                                  index={index}
                                  xyPostion={xyPostion}
                                  setXyPostion={setXyPostion}
                                  pdfOriginalWidth={pdfOriginalWidth}
                                  containerWH={containerWH}
                                  setIsSignPad={setIsSignPad}
                                  isShowBorder={true}
                                  isSignYourself={true}
                                  xPos={xPos}
                                  yPos={yPos}
                                  posWidth={posWidth}
                                  posHeight={posHeight}
                                  pdfDetails={pdfDetails[0]}
                                  isDragging={isDragging}
                                />
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
                setPdfLoadFail(true);
              }}
              loading={"Loading Document.."}
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
              (pdfRequest
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
                                      // <Rnd
                                      //   onClick={() => {
                                      // if (!isDragging) {
                                      //   handleLinkUser(data.Id);
                                      //   setUniqueId(data.Id);
                                      // }
                                      //     const dataNewPlace = addZIndex(
                                      //       signerPos,
                                      //       pos.key,
                                      //       setZIndex
                                      //     );
                                      //     setSignerPos((prevState) => {
                                      //       const newState = [...prevState];
                                      //       newState.splice(
                                      //         0,
                                      //         signerPos.length,
                                      //         ...dataNewPlace
                                      //       );
                                      //       return newState;
                                      //     });
                                      //   }}
                                      //   key={pos.key}
                                      //   enableResizing={{
                                      //     top: false,
                                      //     right: false,
                                      //     bottom: false,
                                      //     left: false,
                                      //     topRight: false,
                                      //     bottomRight: true,
                                      //     bottomLeft: false,
                                      //     topLeft: false
                                      //   }}
                                      //   bounds="parent"
                                      //   style={{
                                      //     cursor: "all-scroll",
                                      //     background: data.blockColor,
                                      //     zIndex: pos.zIndex
                                      //   }}
                                      //   className="signYourselfBlock"
                                      //   onDrag={() => handleTabDrag(pos.key)}
                                      //   size={{
                                      //     width: posWidth(pos),
                                      //     height: posHeight(pos)
                                      //   }}
                                      //   lockAspectRatio={
                                      //     pos.Width
                                      //       ? pos.Width / pos.Height
                                      //       : 2.5
                                      //   }
                                      //   onDragStop={
                                      //     (event, dragElement) =>
                                      //       handleStop(
                                      //         event,
                                      //         dragElement,
                                      //         data.Id,
                                      //         pos.key
                                      //       )
                                      //     // data.signerObjId,
                                      //   }
                                      //   // default={{
                                      //   //   x: pos.xPosition,
                                      //   //   y: pos.yPosition
                                      //   // }}
                                      //   default={{
                                      //     x: xPos(pos),
                                      //     y: yPos(pos)
                                      //   }}
                                      //   onResizeStart={() => {
                                      //     setIsResize(true);
                                      //   }}
                                      //   onResizeStop={() => {
                                      //     setIsResize && setIsResize(false);
                                      //   }}
                                      //   onResize={(
                                      //     e,
                                      //     direction,
                                      //     ref,
                                      //     delta,
                                      //     position
                                      //   ) => {
                                      //     e.stopPropagation();
                                      //     handleImageResize(
                                      //       ref,
                                      //       pos.key,
                                      //       data.Id, //data.signerObjId,
                                      //       position,
                                      //       signerPos,
                                      //       pageNumber,
                                      //       setSignerPos,
                                      //       pdfOriginalWidth,
                                      //       containerWH,
                                      //       false
                                      //     );
                                      //   }}
                                      // >
                                      //   <BorderResize right={-12} top={-11} />
                                      //   <PlaceholderBorder
                                      //     pos={pos}
                                      //     posWidth={posWidth}
                                      //     posHeight={posHeight}
                                      //   />
                                      //   <div>
                                      //     <i
                                      //       data-tut="reactourLinkUser"
                                      //       className="fa-regular fa-user signUserIcon"
                                      //       onClick={(e) => {
                                      //         e.stopPropagation();
                                      //         handleLinkUser(data.Id);
                                      //         setUniqueId(data.Id);
                                      //       }}
                                      //       style={{
                                      //         color: "#188ae2"
                                      //       }}
                                      //     ></i>
                                      //     <i
                                      //       className="fa-regular fa-copy signCopy"
                                      //       onClick={(e) => {
                                      //         e.stopPropagation();
                                      //         setIsPageCopy(true);
                                      //         setSignKey(pos.key);
                                      //         setUniqueId(data.Id);
                                      //         setSignerObjId(
                                      //           data.signerObjId
                                      //         );
                                      //       }}
                                      //       style={{
                                      //         color: "#188ae2"
                                      //       }}
                                      //     ></i>
                                      //     <i
                                      //       className="fa-regular fa-circle-xmark signCloseBtn"
                                      //       onClick={(e) => {
                                      //         e.stopPropagation();
                                      //         handleDeleteSign(
                                      //           pos.key,
                                      //           data.Id
                                      //         );
                                      //         // data.signerObjId
                                      //       }}
                                      //       style={{
                                      //         color: "#188ae2"
                                      //       }}
                                      //     ></i>

                                      //     <div
                                      //       style={{
                                      //         fontSize: "10px",
                                      //         color: "black",
                                      //         justifyContent: "center"
                                      //       }}
                                      //     >
                                      //       {pos.isStamp ? (
                                      //         <div>stamp</div>
                                      //       ) : (
                                      //         <div>signature</div>
                                      //       )}
                                      //       {handleUserName(
                                      //         data.signerObjId,
                                      //         data.Role
                                      //       )}
                                      //     </div>
                                      //   </div>
                                      // </Rnd>
                                      <React.Fragment key={pos.key}>
                                        <Placeholder
                                          pos={pos}
                                          setIsPageCopy={setIsPageCopy}
                                          setSignKey={setSignKey}
                                          handleDeleteSign={handleDeleteSign}
                                          setIsStamp={setIsStamp}
                                          handleTabDrag={handleTabDrag}
                                          handleStop={handleStop}
                                          handleSignYourselfImageResize={
                                            handleImageResize
                                          }
                                          index={pageNumber}
                                          xyPostion={signerPos}
                                          setXyPostion={setSignerPos}
                                          setSignerObjId={setSignerObjId}
                                          data={data}
                                          setIsResize={setIsResize}
                                          setShowDropdown={setShowDropdown}
                                          isShowBorder={true}
                                          isPlaceholder={true}
                                          setUniqueId={setUniqueId}
                                          handleLinkUser={handleLinkUser}
                                          handleUserName={handleUserName}
                                          isSignYourself={false}
                                          xPos={xPos}
                                          yPos={yPos}
                                          posWidth={posWidth}
                                          posHeight={posHeight}
                                          isDragging={isDragging}
                                        />
                                      </React.Fragment>
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
                                  //   <Rnd
                                  //   ref={nodeRef}
                                  //   key={pos.key}
                                  //   lockAspectRatio={
                                  //     pos.Width ? pos.Width / pos.Height : 2.5
                                  //   }
                                  //   enableResizing={{
                                  //     top: false,
                                  //     right: false,
                                  //     bottom: false,
                                  //     left: false,
                                  //     topRight: false,
                                  //     bottomRight: true,
                                  //     bottomLeft: false,
                                  //     topLeft: false
                                  //   }}
                                  //   bounds="parent"
                                  //   className="signYourselfBlock"
                                  //   style={{
                                  //     border: "1px solid red",
                                  //     cursor: "all-scroll",
                                  //     zIndex: "1",
                                  //     background: "#daebe0"
                                  //   }}
                                  //   onDrag={() => handleTabDrag(pos.key)}
                                  //   size={{
                                  //     width: pos.Width ? pos.Width : 150,
                                  //     height: pos.Height ? pos.Height : 60
                                  //   }}
                                  //   onDragStop={handleStop}
                                  //   default={{
                                  //     x: pos.xPosition,
                                  //     y: pos.yPosition
                                  //   }}
                                  //   onClick={() => {
                                  //     if (!isDragging) {
                                  //       setIsSignPad(true);
                                  //       setSignKey(pos.key);
                                  //       setIsStamp(pos.isStamp);
                                  //     }
                                  //   }}
                                  //   onResize={(
                                  //     e,
                                  //     direction,
                                  //     ref,
                                  //     delta,
                                  //     position
                                  //   ) => {
                                  //     e.stopPropagation();
                                  //     handleSignYourselfImageResize(
                                  //       ref,
                                  //       pos.key,
                                  //       xyPostion,
                                  //       index,
                                  //       setXyPostion
                                  //     );
                                  //   }}
                                  // >
                                  //   <BorderResize right={-12} top={-11} />
                                  //   <PlaceholderBorder
                                  //     pos={pos}
                                  //     posWidth={posWidth}
                                  //     posHeight={posHeight}
                                  //   />
                                  //   <PlaceholderDesign pos={pos} />
                                  // </Rnd>
                                  <React.Fragment key={pos.key}>
                                    <Placeholder
                                      pos={pos}
                                      setIsPageCopy={setIsPageCopy}
                                      setSignKey={setSignKey}
                                      handleDeleteSign={handleDeleteSign}
                                      setIsStamp={setIsStamp}
                                      handleTabDrag={handleTabDrag}
                                      handleStop={(event, dragElement) =>
                                        handleStop(event, dragElement, pos.type)
                                      }
                                      handleSignYourselfImageResize={
                                        handleSignYourselfImageResize
                                      }
                                      index={index}
                                      xyPostion={xyPostion}
                                      setXyPostion={setXyPostion}
                                      pdfOriginalWidth={pdfOriginalWidth}
                                      containerWH={containerWH}
                                      setIsSignPad={setIsSignPad}
                                      isShowBorder={true}
                                      isSignYourself={true}
                                      xPos={xPos}
                                      yPos={yPos}
                                      posWidth={posWidth}
                                      posHeight={posHeight}
                                      pdfDetails={pdfDetails[0]}
                                      isDragging={isDragging}
                                    />
                                  </React.Fragment>
                                )
                              );
                            })}
                        </React.Fragment>
                      );
                    }))}

            {/* this component for render pdf document is in middle of the component */}
            <Document
              onLoadError={(e) => {
                const load = {
                  status: false,
                  type: "failed"
                };
                setPdfLoadFail(load);
              }}
              loading={"Loading Document.."}
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
