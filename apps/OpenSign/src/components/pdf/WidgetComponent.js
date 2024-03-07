import React, { useState, useRef, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import RecipientList from "./RecipientList";
import { useDrag } from "react-dnd";
import WidgetList from "./WidgetList";
import { widgets } from "../../constant/Utils";
import { themeColor } from "../../constant/const";
function WidgetComponent({
  dragSignature,
  signRef,
  handleDivClick,
  handleMouseLeave,
  dragStamp,
  isSignYourself,
  addPositionOfSignature,
  signersdata,
  isSelectListId,
  setSignerObjId,
  setIsSelectId,
  setContractName,
  isSigners,
  dataTut,
  isMailSend,
  handleAddSigner,
  setUniqueId,
  setRoleName,
  handleDeleteUser,
  signerPos,
  handleRoleChange,
  handleOnBlur,
  title,

  isTemplateFlow
}) {
  const [isSignersModal, setIsSignersModal] = useState(false);

  const [, dropdown] = useDrag({
    type: "BOX",
    item: {
      type: "BOX",
      id: 5,
      text: "dropdown"
    },

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
    collect: (monitor) => ({
      isDragEmail: !!monitor.isDragging()
    })
  });
  const [, radio] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 15,
      text: "radio"
    },
    collect: (monitor) => ({
      isDragRadio: !!monitor.isDragging()
    })
  });
  const [, label] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 16,
      text: "label"
    },
    collect: (monitor) => ({
      isDragLabel: !!monitor.isDragging()
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
      initials,
      label,
      text,
      checkbox,
      dropdown,
      radio,
      image,
      date,
      name,
      email,
      company,
      jobTitle
    ];
    const getWidgetArray = widgets;
    const newUpdateSigner = getWidgetArray.map((obj, ind) => {
      return { ...obj, ref: widgetRef[ind] };
    });

    setWidget(newUpdateSigner);
    // eslint-disable-next-line
  }, []);

  const filterWidgets = widget.filter(
    (data) =>
      data.type !== "dropdown" && data.type !== "radio" && data.type !== "label"
  );
  const labelWidget = widget.filter((data) => data.type !== "label");
  const updateWidgets = isSignYourself
    ? filterWidgets
    : isTemplateFlow
      ? labelWidget
      : widget;

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
                  backgroundColor: themeColor,
                  color: "white"
                }}
                className="p-[10px] my-[2px] flex flex-row items-center justify-center border-[1px] border-[#47a3ad] hover:bg-[#47a3ad] text-[#47a3ad] hover:text-white cursor-pointer"
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
                borderTop: `2px solid ${themeColor}`
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
                <WidgetList
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
              background: themeColor,
              padding: "5px"
            }}
          >
            <span className="signedStyle">Fields</span>
          </div>

          <div className="signLayoutContainer1">
            <WidgetList
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
          title={"Roles"}
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
              Please add a role
            </div>
          )}
        </ModalUi>
      )}
    </>
  );
}

export default WidgetComponent;
