import React, { useState, useRef, useEffect } from "react";
import ModalUi from "../../premitives/ModalUi";
import RecipientList from "../../premitives/RecipientList";
import { useDrag } from "react-dnd";
import AllWidgets from "../WidgetComponent/allWidgets";
import { widgets } from "../../utils/Utils";
import Scrollbar from "react-scrollbars-custom";

function FieldsComponent({
  pdfUrl,
  dragSignature,
  signRef,
  handleDivClick,
  handleMouseLeave,
  isDragSign,
  themeColor,
  dragStamp,
  dragRef,
  isDragStamp,
  dragSignatureSS,
  dragStampSS,
  isDragSignatureSS,
  isSignYourself,
  addPositionOfSignature,
  signersdata,
  isSelectListId,
  setSignerObjId,
  setIsSelectId,
  setContractName,
  isSigners,
  dataTut,
  dataTut2,
  isMailSend,
  handleAddSigner,
  setUniqueId,
  setRoleName,
  handleDeleteUser,
  signerPos,
  handleRoleChange,
  handleOnBlur,
  title,
  setIsDraggingEnable,
  isdraggingEnable
}) {
  const [isSignersModal, setIsSignersModal] = useState(false);

  const [, dropdown] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 5,
      text: "dropdown"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragDropdown: !!monitor.isDragging()
    })
  });
  const [, checkbox] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 6,
      text: "checkbox"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragCheck: !!monitor.isDragging()
    })
  });
  const [, text] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 7,
      text: "text"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragText: !!monitor.isDragging()
    })
  });
  const [, initials] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 8,
      text: "initials"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragInitial: !!monitor.isDragging()
    })
  });
  const [, name] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 9,
      text: "name"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragName: !!monitor.isDragging()
    })
  });
  const [, company] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 10,
      text: "company"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragCompany: !!monitor.isDragging()
    })
  });
  const [, jobTitle] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 11,
      text: "job title"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragJobtitle: !!monitor.isDragging()
    })
  });
  const [, date] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 12,
      text: "date"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragDate: !!monitor.isDragging()
    })
  });
  const [, image] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 13,
      text: "image"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragImage: !!monitor.isDragging()
    })
  });
  const [, email] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 14,
      text: "email"
    },
    canDrag: isdraggingEnable,
    collect: (monitor) => ({
      isDragEmail: !!monitor.isDragging()
    })
  });
  const [, radio] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 14,
      text: "radio"
    },
    collect: (monitor) => ({
      isDragRadio: !!monitor.isDragging()
    })
  });
  const isMobile = window.innerWidth < 767;
  const scrollContainerRef = useRef(null);
  const [widget, setWidget] = useState([]);

  const color = [
    "#93a3db",
    "#e6c3db",
    "#c0e3bc",
    "#bce3db",
    "#b8ccdb",
    "#ceb8db",
    "#ffccff",
    "#99ffcc",
    "#cc99ff",
    "#ffcc99",
    "#66ccff",
    "#ffffcc"
  ];
  const handleModal = () => {
    setIsSignersModal(!isSignersModal);
  };

  useEffect(() => {
    const widgetRef = [
      dragSignature,
      dragStamp,
      dropdown,
      checkbox,
      text,
      initials,
      name,
      company,
      jobTitle,
      date,
      image,
      email,
      radio
    ];
    const getWidgetArray = widgets;
    const newUpdateSigner = getWidgetArray.map((obj, ind) => {
      return { ...obj, ref: widgetRef[ind] };
    });

    setWidget(newUpdateSigner);
  }, []);

  const filterWidgets = widget.filter(
    (data) => data.type !== "dropdown" && data.type !== "radio"
  );
  const updateWidgets = isSignYourself ? filterWidgets : widget;

  return (
    <>
      {isMobile ? (
        !isMailSend && (
          <div
            data-tut={dataTut}
            id="navbar"
            className="stickyfooter"
            style={{ width: window.innerWidth + "px" }}
          >
            {isSigners && (
              <div
                data-tut={dataTut}
                style={{
                  background: isSelectListId
                    ? color[isSelectListId % color.length]
                    : color[0],
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => {
                  // if (signersdata?.length) {
                  handleModal();
                  // }
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    textAlign: "center"
                  }}
                >
                  {title ? title : "Recipient"}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {signersdata[isSelectListId]?.Role && (
                    <div>
                      {signersdata[isSelectListId]?.Name ? (
                        <>
                          :{" "}
                          {signersdata[isSelectListId]?.Name?.length > 12
                            ? `${signersdata[isSelectListId].Name.slice(
                                0,
                                12
                              )}...`
                            : signersdata[isSelectListId]?.Name}
                        </>
                      ) : (
                        <>
                          :{" "}
                          {signersdata[isSelectListId]?.Role?.length > 12
                            ? `${signersdata[isSelectListId].Role.slice(
                                0,
                                12
                              )}...`
                            : signersdata[isSelectListId]?.Role}
                        </>
                      )}
                    </div>
                  )}
                  <div style={{ marginLeft: 6, fontSize: 16 }}>
                    <i className="fa-solid fa-angle-down"></i>
                  </div>
                </span>
              </div>
            )}
            {handleAddSigner && (
              <div
                data-tut="reactourAddbtn"
                style={{
                  margin: "5px 0 5px 0",
                  backgroundColor: themeColor(),
                  color: "white"
                }}
                className="addSignerBtn"
                onClick={() => handleAddSigner()}
              >
                <i className="fa-solid fa-plus"></i>
                <span style={{ marginLeft: 2 }}>Add role</span>
              </div>
            )}

            <div
              ref={scrollContainerRef}
              style={{
                background: "white",
                borderTop: `2px solid ${themeColor()}`
              }}
            >
              <div
                style={{
                  display: "flex",
                  overflowX: "scroll",
                  whiteSpace: "nowrap",
                  padding: "10px"
                }}
              >
                <AllWidgets
                  updateWidgets={updateWidgets}
                  handleDivClick={handleDivClick}
                  handleMouseLeave={handleMouseLeave}
                  signRef={signRef}
                  marginLeft={5}
                  addPositionOfSignature={addPositionOfSignature}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <div data-tut={dataTut} className="signerComponent">
          <div
            style={{
              background: themeColor(),
              padding: "5px"
            }}
          >
            <span className="signedStyle">Fields</span>
          </div>

          <div className="signLayoutContainer1">
            {/* {pdfUrl ? (
              <>
                <button className={signStyle} disabled={true}>
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 20px 0px 20px",
                      color: "#bfbfbf"
                    }}
                  >
                    Signature
                  </span>

                  <img
                    alt="sign img"
                    style={{
                      width: "30px",
                      height: "28px",
                      background: "#d3edeb"
                    }}
                    src={sign}
                  />
                </button>
                <button className={signStyle} disabled={true}>
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 0px 0px 35px",
                      color: "#bfbfbf"
                    }}
                  >
                    Stamp
                  </span>

                  <img
                    alt="stamp img"
                    style={{
                      width: "25px",
                      height: "28px",
                      background: "#d3edeb"
                    }}
                    src={stamp}
                  />
                </button>
              </>
            ) : (
              <>
                <div
                  ref={(element) => {
                    dragSignature(element);
                    if (element) {
                      signRef.current = element;
                    }
                  }}
                  className={signStyle}
                  onMouseMove={handleDivClick}
                  onMouseDown={handleMouseLeave}
                  style={{
                    opacity: isDragSign ? 0.5 : 1,
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 20px 0px 20px",
                      color: "black"
                    }}
                  >
                    Signature
                  </span>
                  <img
                    alt="sign img"
                    style={{
                      width: "30px",
                      height: "28px",
                      background: themeColor(),
                    }}
                    src={sign}
                  />
                  
                </div>
                <div
                  ref={(element) => {
                    dragStamp(element);
                    dragRef.current = element;
                    if (isDragStamp) {
                      
                    }
                  }}
                  className={!pdfUrl ? signStyle : "disableSign"}
                  disabled={pdfUrl && true}
                  onMouseMove={handleDivClick}
                  onMouseDown={handleMouseLeave}
                  style={{
                    opacity: isDragStamp ? 0.5 : 1,
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 0px 0px 35px",
                      color: !pdfUrl ? "black" : "#bfbfbf"
                    }}
                  >
                    Stamp
                  </span>

                  <img
                    alt="stamp img"
                    style={{
                      width: "25px",
                      height: "28px",
                      background: themeColor()
                    }}
                    src={stamp}
                  />
                </div>
              </>
            )} */}
            {/* {updateWidgets.map((item, ind) => {
              return (
                <div
                  key={ind}
                  ref={(element) => {
                    item.ref(element);
                    if (element) {
                      signRef.current = element;
                    }
                  }}
                  className={signStyle}
                  onMouseMove={handleDivClick}
                  onMouseDown={handleMouseLeave}
                  style={{
                    opacity: isDragSign ? 0.5 : 1,
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "5px"
                    }}
                  >
                    <i
                      class="fa-sharp fa-solid fa-grip-vertical"
                      style={{ color: "#908d8d", fontSize: "13px" }}
                    ></i>
                    <span
                      style={{
                        fontWeight: "400",
                        fontSize: "15px",
                        // padding: "3px 20px 0px 20px",
                        color: "black",
                        marginLeft: "5px"
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: themeColor(),
                      padding: "0 5px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <i
                      style={{ color: "white", fontSize: item.iconSize }}
                      className={item.icon}
                    ></i>
                  </div>
                </div>
              );
            })} */}
            <AllWidgets
              updateWidgets={updateWidgets}
              handleDivClick={handleDivClick}
              handleMouseLeave={handleMouseLeave}
              signRef={signRef}
            />
          </div>
        </div>
      )}
      {isSignersModal && (
        <ModalUi
          title={"Recipients"}
          isOpen={isSignersModal}
          handleClose={handleModal}
        >
          {signersdata.length > 0 ? (
            <RecipientList
              signerPos={signerPos}
              signersdata={signersdata}
              isSelectListId={isSelectListId}
              setSignerObjId={setSignerObjId}
              setIsSelectId={setIsSelectId}
              setContractName={setContractName}
              setUniqueId={setUniqueId}
              setRoleName={setRoleName}
              handleDeleteUser={handleDeleteUser}
              handleRoleChange={handleRoleChange}
              handleOnBlur={handleOnBlur}
              handleModal={handleModal}
            />
          ) : (
            <div
              style={{
                padding: 20,
                fontSize: 15,
                fontWeight: "500",
                textAlign: "center"
              }}
            >
              Please add Recipient
            </div>
          )}
        </ModalUi>
      )}
    </>
  );
}

export default FieldsComponent;
