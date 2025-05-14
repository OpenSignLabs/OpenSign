import React, { useState, useRef, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import RecipientList from "./RecipientList";
import { useDrag } from "react-dnd";
import WidgetList from "./WidgetList";
import {
  color,
  isMobile,
  radioButtonWidget,
  textInputWidget,
  textWidget,
  widgets
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
function WidgetComponent(props) {
  const { t } = useTranslation();
  const signRef = useRef(null);
  const userInformation = localStorage.getItem("UserInformation");
  const [isSignersModal, setIsSignersModal] = useState(false);
  const [, signature] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 1, text: "signature" }
  });
  const [, stamp] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 2, text: "stamp" }
  });
  const [, dropdown] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 5, text: "dropdown" }
  });
  const [, checkbox] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 6, text: "checkbox" }
  });
  const [, textInput] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 7, text: textInputWidget }
  });
  const [, initials] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 8, text: "initials" }
  });
  const [, name] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 9, text: "name" }
  });
  const [, company] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 10, text: "company" }
  });
  const [, jobTitle] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 11, text: "job title" }
  });
  const [, date] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 12, text: "date" }
  });
  const [, image] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 13, text: "image" }
  });
  const [, email] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 14, text: "email" }
  });
  const [, radioButton] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 15, text: radioButtonWidget }
  });
  const [, text] = useDrag({
    type: "BOX",
    item: { type: "BOX", id: 16, text: textWidget }
  });
  const [widget, setWidget] = useState([]);
  const handleModal = () => {
    setIsSignersModal(!isSignersModal);
  };

  useEffect(() => {
    const widgetRef = [
      signature,
      stamp,
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

  const modifiedWidgets = widget.filter(
    (data) =>
      ![
        "dropdown",
        radioButtonWidget,
        textInputWidget,
        "date",
        "image",
        "checkbox"
      ].includes(data.type)
  );
  const unlogedInUserWidgets = widget.filter(
    (data) =>
      ![
        "dropdown",
        radioButtonWidget,
        textInputWidget,
        "date",
        "image",
        "checkbox",
        "name",
        "email",
        "job title",
        "company"
      ].includes(data.type)
  );
  const filterWidgets = widget.filter(
    (data) =>
      !["dropdown", radioButtonWidget, textInputWidget].includes(data.type)
  );
  const textWidgetData = widget.filter((data) => data.type !== textWidget);
  const updateWidgets = props.isSignYourself
    ? filterWidgets
    : props.isTemplateFlow
      ? textWidgetData
      : props.isAlllowModify
        ? userInformation
          ? modifiedWidgets
          : unlogedInUserWidgets
        : widget;

  const handleSelectRecipient = () => {
    if (
      props.signersdata[props.isSelectListId]?.Email ||
      props.signersdata[props.isSelectListId]?.Role
    ) {
      const userData =
        props.signersdata[props.isSelectListId]?.Name ||
        props.signersdata[props.isSelectListId]?.Role;
      const name =
        userData?.length > 20 ? `${userData.slice(0, 20)}...` : userData;
      return name;
    }
  };

  return (
    <>
      {isMobile ? (
        !props.isMailSend && (
          <div id="navbar" className="fixed z-[99] bottom-0 right-0 w-full">
            {props.isSigners && (
              <div className="w-full mb-[5px] flex justify-center items-center gap-1">
                <div className="w-full ml-[5px]" onClick={() => handleModal()}>
                  <select
                    data-tut="recipientArea"
                    className="w-full op-select op-select-bordered  pointer-events-none"
                    value={handleSelectRecipient()}
                    style={{
                      backgroundColor: props.blockColor
                        ? props.blockColor
                        : color[0]
                    }}
                  >
                    <option value={handleSelectRecipient()}>
                      {handleSelectRecipient()}
                    </option>
                  </select>
                </div>

                <div className="w-[18%]">
                  {props.handleAddSigner ? (
                    <button
                      data-tut="reactourAddbtn"
                      onClick={() => props.handleAddSigner()}
                      className="op-btn op-btn-accent"
                    >
                      <i className="fa-light fa-plus "></i>
                    </button>
                  ) : (
                    props.setIsAddSigner && (
                      <button
                        data-tut="addRecipient"
                        onClick={() => props.setIsAddSigner(true)}
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
              className="bg-base-100 border-[2px] border-t-primary"
            >
              <div className="flex whitespace-nowrap overflow-x-scroll pt-[10px] pb-[5px] pr-[5px]">
                <WidgetList
                  updateWidgets={updateWidgets}
                  handleDivClick={props.handleDivClick}
                  handleMouseLeave={props.handleMouseLeave}
                  signRef={signRef}
                  marginLeft={5}
                  addPositionOfSignature={props.addPositionOfSignature}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <div
          data-tut={props.dataTut}
          className={`${
            props.isMailSend ? "bg-opacity-50 pointer-events-none" : ""
          } hidden md:block h-full bg-base-100`}
        >
          <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
            <span>{t("fields")}</span>
          </div>

          <div className="p-[15px] flex flex-col pt-4" data-tut="addWidgets">
            <WidgetList
              updateWidgets={updateWidgets}
              handleDivClick={props.handleDivClick}
              handleMouseLeave={props.handleMouseLeave}
              signRef={signRef}
            />
          </div>
        </div>
      )}
      {isSignersModal && (
        <ModalUi
          title={props.title ? props.title : t("recipients")}
          isOpen={isSignersModal}
          handleClose={handleModal}
        >
          {props.signersdata.length > 0 ? (
            <div className="max-h-[600px] overflow-auto pb-1">
              <RecipientList
                signerPos={props.signerPos}
                signersdata={props.signersdata}
                isSelectListId={props.isSelectListId}
                setIsSelectId={props.setIsSelectId}
                setUniqueId={props.setUniqueId}
                setRoleName={props.setRoleName}
                handleDeleteUser={props.handleDeleteUser}
                handleRoleChange={props.handleRoleChange}
                handleOnBlur={props.handleOnBlur}
                handleModal={handleModal}
                sendInOrder={props.sendInOrder}
                setSignersData={props.setSignersData}
                setBlockColor={props.setBlockColor}
                uniqueId={props.uniqueId}
                setSignerPos={props.setSignerPos}
              />
            </div>
          ) : (
            <div className=" p-[20px] text-[15px] font-medium text-center">
              {t("please-add")} {props.title ? props.title : t("recipients")}
            </div>
          )}
        </ModalUi>
      )}
    </>
  );
}

export default WidgetComponent;
