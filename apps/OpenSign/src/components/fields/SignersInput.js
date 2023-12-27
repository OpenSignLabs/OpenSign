import React, { useState, useEffect } from "react";
import Select from "react-select";
import AppendFormInForm from "../AppendFormInForm";
import Modal from "react-modal";
import Parse from "parse";
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
  const [selected, setSelected] = React.useState([]);
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
      <label className="block">
        Signers
        {props.required && <span className="text-red-500 text-[13px]">*</span>}
      </label>
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ flexWrap: "wrap", width: "100%" }}>
          <Select
            onSortEnd={onSortEnd}
            distance={4}
            isMulti
            options={state || []}
            value={selected}
            onChange={onChange}
            closeMenuOnSelect={false}
          />
        </div>
        <div
          onClick={() => {
            setIsModel(true);
            openModal();
          }}
          style={{
            cursor: "pointer",
            borderRadius: 4,
            border: "1px solid #ccc",
            minHeight: 38,
            minWidth: 48,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
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
              type="button"
              className="flex justify-between items-center p-3 border-b-[1px] border-gray-300"
            >
              <div className=" text-black text-xl font-semibold pl-3">
                Add Signer
              </div>
              <button onClick={handleModalCloseClick}>
                <i
                  style={{ fontSize: 25 }}
                  className="fa fa-times-circle"
                  aria-hidden="true"
                ></i>
              </button>
            </div>

            {isModal && (
              <AppendFormInForm
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
