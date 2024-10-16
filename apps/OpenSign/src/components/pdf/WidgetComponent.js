import React, { useState, useRef, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import RecipientList from "./RecipientList";
import { useDrag } from "react-dnd";
import WidgetList from "./WidgetList";
import {
  color,
  radioButtonWidget,
  textInputWidget,
  textWidget,
  widgets
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
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
  setIsSelectId,
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
  setSignersData,
  sendInOrder,
  isTemplateFlow,
  setBlockColor,
  setIsAddSigner,
  uniqueId
}) {
  const { t } = useTranslation();
  const [isSignersModal, setIsSignersModal] = useState(false);
  const [, dropdown] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 5, text: "dropdown" },
    collect: (monitor) => ({
      isDragDropdown: !!monitor.isDragging()
    })
  });
  const [, checkbox] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 6, text: "checkbox" },
    collect: (monitor) => ({ isDragCheck: !!monitor.isDragging() })
  });
  const [, textInput] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 7, text: textInputWidget },
    collect: (monitor) => ({ isDragTextInput: !!monitor.isDragging() })
  });
  const [, initials] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 8, text: "initials" },
    collect: (monitor) => ({ isDragInitial: !!monitor.isDragging() })
  });
  const [, name] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 9, text: "name" },
    collect: (monitor) => ({ isDragName: !!monitor.isDragging() })
  });
  const [, company] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 10, text: "company" },
    collect: (monitor) => ({ isDragCompany: !!monitor.isDragging() })
  });
  const [, jobTitle] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 11, text: "job title" },
    collect: (monitor) => ({ isDragJobtitle: !!monitor.isDragging() })
  });
  const [, date] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 12, text: "date" },
    collect: (monitor) => ({ isDragDate: !!monitor.isDragging() })
  });
  const [, image] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 13, text: "image" },
    collect: (monitor) => ({ isDragImage: !!monitor.isDragging() })
  });
  const [, email] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 14, text: "email" },
    collect: (monitor) => ({ isDragEmail: !!monitor.isDragging() })
  });
  const [, radioButton] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 15, text: radioButtonWidget },
    collect: (monitor) => ({ isDragRadiotton: !!monitor.isDragging() })
  });
  const [, text] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 16, text: textWidget },
    collect: (monitor) => ({ isDragText: !!monitor.isDragging() })
  });
  const isMobile = window.innerWidth < 767;
  const scrollContainerRef = useRef(null);
  const [widget, setWidget] = useState([]);
  const handleModal = () => {
    setIsSignersModal(!isSignersModal);
  };

  useEffect(() => {
    const widgetRef = [
      dragSignature,
      dragStamp,
      initials,
      name,
      jobTitle,
      company,
      date,
      text,
      textInput,
      checkbox,
      dropdown,
      radioButton,
      image,
      email
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
      data.type !== "dropdown" &&
      data.type !== radioButtonWidget &&
      data.type !== textInputWidget
  );
  const textWidgetData = widget.filter((data) => data.type !== textWidget);
  const updateWidgets = isSignYourself
    ? filterWidgets
    : isTemplateFlow
      ? textWidgetData
      : widget;

  const handleSelectRecipient = () => {
    if (
      signersdata[isSelectListId]?.Email ||
      signersdata[isSelectListId]?.Role
    ) {
      const userData =
        signersdata[isSelectListId]?.Name || signersdata[isSelectListId]?.Role;
      const name =
        userData?.length > 20 ? `${userData.slice(0, 20)}...` : userData;
      return name;
    }
  };
  return (
    <>
      {isMobile ? (
        !isMailSend && (
          <div id="navbar" className="fixed z-[99] bottom-0 right-0 w-full">
            {isSigners && (
              <div className="w-full mb-[5px] flex justify-center items-center gap-1">
                <div className="w-full ml-[5px]" onClick={() => handleModal()}>
                  <select
                    data-tut="recipientArea"
                    className="w-full op-select op-select-bordered  pointer-events-none"
                    value={handleSelectRecipient()}
                    style={{
                      backgroundColor: isSelectListId
                        ? color[isSelectListId % color.length]
                        : color[0]
                    }}
                  >
                    <option value={handleSelectRecipient()}>
                      {handleSelectRecipient()}
                    </option>
                  </select>
                </div>

                <div className="w-[18%]">
                  {handleAddSigner ? (
                    <button
                      data-tut="reactourAddbtn"
                      onClick={() => handleAddSigner()}
                      className="op-btn op-btn-accent"
                    >
                      <i className="fa-light fa-plus "></i>
                    </button>
                  ) : (
                    setIsAddSigner && (
                      <button
                        data-tut="addRecipient"
                        onClick={() => setIsAddSigner(true)}
                        className="op-btn op-btn-accent"
                      >
                        <i className="fa-light fa-plus"></i>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div
              data-tut="addWidgets"
              ref={scrollContainerRef}
              className="bg-base-100 border-[2px] border-t-primary"
            >
              <div className="flex whitespace-nowrap overflow-x-scroll pt-[10px] pb-[5px] pr-[5px]">
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
        <div
          data-tut={dataTut}
          className={`${
            isMailSend ? "bg-opacity-50 pointer-events-none" : ""
          } hidden md:block h-full bg-base-100`}
        >
          <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
            <span>{t("fields")}</span>
          </div>

          <div
            className="p-[15px] flex flex-col pt-4 2xl:m-5"
            data-tut="addWidgets"
          >
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
          title={title ? title : t("recipients")}
          isOpen={isSignersModal}
          handleClose={handleModal}
        >
          {signersdata.length > 0 ? (
            <div className="max-h-[600px] overflow-auto pb-1">
              <RecipientList
                signerPos={signerPos}
                signersdata={signersdata}
                isSelectListId={isSelectListId}
                setIsSelectId={setIsSelectId}
                setUniqueId={setUniqueId}
                setRoleName={setRoleName}
                handleDeleteUser={handleDeleteUser}
                handleRoleChange={handleRoleChange}
                handleOnBlur={handleOnBlur}
                handleModal={handleModal}
                sendInOrder={sendInOrder}
                setSignersData={setSignersData}
                setBlockColor={setBlockColor}
                uniqueId={uniqueId}
              />
            </div>
          ) : (
            <div className=" p-[20px] text-[15px] font-medium text-center">
              {t("please-add")} {title ? title : t("recipients")}
            </div>
          )}
        </ModalUi>
      )}
    </>
  );
}

export default WidgetComponent;
