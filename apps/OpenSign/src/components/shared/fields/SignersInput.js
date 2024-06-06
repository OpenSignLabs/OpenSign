import React, { useState, useEffect } from "react";
import Select from "react-select";
import AddSigner from "../../AddSigner";
import Modal from "react-modal";
import Parse from "parse";
import Tooltip from "../../../primitives/Tooltip";
function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

/**
 * react-sortable-hoc is depcreated not usable from react 18.x.x
 *  need to replace it with @dnd-kit
 * code changes required
 */

const SignersInput = (props) => {
  Modal.setAppElement("body");
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
        Signers
        {props.required && <span className="text-red-500 text-[13px]">*</span>}
        <span className="absolute ml-1 text-xs z-30">
          <Tooltip
            id={"signer-tooltip"}
            message={
              "Begin typing a contact's name to see suggested signers from your saved contacts or add new ones. Arrange the signing order by adding signers in the desired sequence. Use the '+' button to include signers and the 'x' to remove them. Each signer will receive an email prompt to sign the document in the order listed."
            }
          />
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
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "inherit",
                borderRadius: 10,
                borderColor: "current"
              }),
              option: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "inherit"
              })
            }}
          />
        </div>
        <div
          onClick={() => {
            setIsModel(true);
            openModal();
          }}
          className="cursor-pointer  border-[1px] opinut opinput-bordered min-h-[38px] min-w-[48px] flex justify-center items-center"
        >
          <i className="fas fa-plus"></i>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleModalCloseClick}
          shouldCloseOnOverlayClick={false}
          id="modal1"
          contentLabel="Modal"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              transform: "translate(-50%, -50%)",
              border: "1px transparent",
              padding: 0
            },
            overlay: {
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              zIndex: 50
            }
          }}
        >
          <div className="min-w-full md:min-w-[500px]">
            <div
              className="flex justify-between rounded-t items-center py-[10px] px-[20px] text-white"
              style={{ background: "#32a3ac" }}
            >
              <div className="text-[1.2rem] font-normal">Add Signer</div>
              <button
                onClick={handleModalCloseClick}
                className="text-[1.5rem] cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>

            {isModal && (
              <AddSigner
                valueKey={"objectId"}
                displayKey={"Name"}
                details={handleNewDetails}
                closePopup={handleModalCloseClick}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SignersInput;
