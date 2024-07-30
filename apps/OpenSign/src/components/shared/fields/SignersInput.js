import React, { useState, useEffect } from "react";
import Select from "react-select";
import AddSigner from "../../AddSigner";
import Parse from "parse";
import Tooltip from "../../../primitives/Tooltip";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

const AddSignerModal = ({ isOpen, children }) => {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="op-modal op-modal-open">
      <div className="op-modal-box p-0 min-w-[90%] md:min-w-[500px] max-h-90 overflow-y-auto hide-scrollbar text-sm">
        {children}
      </div>
    </div>,
    document.body
  );
};

/**
 * react-sortable-hoc is depcreated not usable from react 18.x.x
 *  need to replace it with @dnd-kit
 * code changes required
 */

const SignersInput = (props) => {
  const { t } = useTranslation();
  const [state, setState] = useState(undefined);
  // const [editFormData, setEditFormData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isModal, setIsModel] = useState(false);
  const onChange = (selectedOptions) => setSelected(selectedOptions);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
  };

  const GetSelectListData = async () => {
    try {
      const currentUser = Parse.User.current();
      const contactbook = new Parse.Query("contracts_Contactbook");
      contactbook.equalTo(
        "CreatedBy",
        Parse.User.createWithoutData(currentUser.id)
      );
      contactbook.notEqualTo("IsDeleted", true);
      const contactRes = await contactbook.find();
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        let list = [];

        // let _selected = [];
        res.forEach((x) => {
          let obj = {
            label: x.Name,
            value: x.objectId,
            isChecked: true
          };

          list.push(obj);
        });
        setState(list);
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  useEffect(() => {
    GetSelectListData();
  }, []);
  useEffect(() => {
    if (props.isReset && props.isReset === true) {
      setSelected([]);
    }
  }, [props.isReset]);

  useEffect(() => {
    if (selected && selected.length) {
      let newData = [];
      selected.forEach((x) => {
        newData.push(x.value);
      });
      if (props.onChange) {
        props.onChange(newData);
      }
    }

    // eslint-disable-next-line
  }, [selected]);

  const handleModalCloseClick = () => {
    setIsModel(false);
    setModalIsOpen(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  // `handleNewDetails` is used to set just save from quick form to selected option in dropdown
  const handleNewDetails = (data) => {
    setState([...state, data]);
    if (selected.length > 0) {
      setSelected([...selected, data]);
    } else {
      setSelected([data]);
    }
  };

  return (
    <div className="text-xs mt-2 ">
      <label className="block relative">
        {t("Signers")}
        {props.required && <span className="text-red-500 text-[13px]">*</span>}
        <span className="absolute ml-1 text-xs z-30">
          <Tooltip id={"signer-tooltip"} message={t("signers-help")} />
        </span>
      </label>
      <div className="flex gap-x-[5px]">
        <div className="w-full">
          <Select
            onSortEnd={onSortEnd}
            distance={4}
            isMulti
            options={state || []}
            value={selected}
            onChange={onChange}
            closeMenuOnSelect={false}
            required={props.required}
            noOptionsMessage={() => t("contact-not-found")}
            unstyled
            classNames={{
              control: () =>
                "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]",
              valueContainer: () =>
                "flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]",
              multiValue: () => "op-badge op-badge-primary h-full text-[11px]",
              multiValueLabel: () => "mb-[2px]",
              menu: () =>
                "mt-1 shadow-md rounded-lg bg-base-200 text-base-content",
              menuList: () => "shadow-md rounded-lg overflow-hidden",
              option: () =>
                "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2",
              noOptionsMessage: () => "p-2 bg-base-200 rounded-lg m-1 p-2"
            }}
          />
        </div>
        <div
          onClick={() => {
            setIsModel(true);
            openModal();
          }}
          className="cursor-pointer op-input op-input-bordered focus:outline-none hover:border-base-content max-h-[38px] min-w-[48px] flex justify-center items-center"
        >
          <i className="fa-light fa-plus"></i>
        </div>
        <AddSignerModal isOpen={modalIsOpen}>
          <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
            {t("add-signer")}
          </h3>
          <button
            onClick={handleModalCloseClick}
            className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2"
          >
            ✕
          </button>
          {isModal && (
            <AddSigner
              valueKey={"objectId"}
              displayKey={"Name"}
              details={handleNewDetails}
              closePopup={handleModalCloseClick}
            />
          )}
        </AddSignerModal>
      </div>
    </div>
  );
};

export default SignersInput;
