import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import AddContact from "../../../primitives/AddContact";
import Tooltip from "../../../primitives/Tooltip";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { findContact } from "../../../constant/Utils";
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
  const [selected, setSelected] = useState([]);
  const [isModal, setIsModel] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    // to provide initial data for selected list items in Bcc for edit template
    if (props?.initialData && props?.initialData?.length > 0) {
      const trimEmail = props?.initialData.map((item) => ({
        value: item?.objectId,
        label: item?.Name,
        email: item?.Email
      }));
      setSelected(trimEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions?.length > 0) {
      const trimEmail = selectedOptions.map((item) => ({
        ...item,
        label: item?.label?.split("<")?.shift()
      }));
      setSelected(trimEmail);
    } else {
      setSelected(selectedOptions);
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
  };

  useEffect(() => {
    if (props.isReset && props.isReset === true) {
      setSelected([]);
    }
  }, [props.isReset]);

  useEffect(() => {
    if (selected && selected.length) {
      let newData = [];
      selected.forEach((x) => {
        if (props?.isCaptureAllData) {
          newData.push(x);
        } else {
          newData.push(x.value);
        }
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
    const user = {
      value: data["objectId"],
      label: data["Name"],
      email: data?.Email
    };
    setState([...state, user]);
    if (selected.length > 0) {
      setSelected([...selected, user]);
    } else {
      setSelected([user]);
    }
  };
  const loadOptions = async (inputValue) => {
    try {
      const contactRes = await findContact(
        inputValue,
      );
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        //compareArrays is a function where compare between two array (total signersList and document signers list)
        //and filter signers from total signer's list which already present in document's signers list
        const compareArrays = (res, signerObj) => {
          return res.filter(
            (item1) =>
              !signerObj.find((item2) => item2.objectId === item1.objectId)
          );
        };

        //get update signer's List if signersdata is present
        const updateSignersList =
          props?.signersData && compareArrays(res, props?.signersData);

        const result = updateSignersList ? updateSignersList : res;
        setState(result);
        return await result.map((item) => ({
          label: item.Name + "<" + item.Email + ">",
          value: item.objectId,
          email: item.Email,
          isChecked: true
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  return (
    <div className="text-xs mt-2 ">
      <label className="block relative">
        {props.label ? props.label : t("signers")}
        {props.required && <span className="text-red-500 text-[13px]">*</span>}
        <span
          className={`z-[${props?.helptextZindex ? props.helptextZindex : 30}] absolute ml-1 text-xs`}
        >
          <Tooltip
            id={`${props.label ? props.label : "signers"}-tooltip`}
            message={props.helpText ? props.helpText : t("signers-help")}
          />
        </span>
      </label>
      <div className="flex gap-x-[5px]">
        <div className="w-full z-40">
          <AsyncSelect
            onSortEnd={onSortEnd}
            distance={4}
            isMulti
            cacheOptions
            defaultOptions
            options={state || []}
            value={selected}
            onChange={onChange}
            closeMenuOnSelect={false}
            required={props.required}
            loadingMessage={() => t("loading")}
            noOptionsMessage={() => t("contact-not-found")}
            loadOptions={loadOptions}
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
            {t("add-contact")}
          </h3>
          <button
            onClick={handleModalCloseClick}
            className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2"
          >
            ✕
          </button>
          {isModal && (
            <AddContact
              isDisableTitle
              isAddYourSelfCheckbox={props?.isAddYourSelfCheckbox}
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
