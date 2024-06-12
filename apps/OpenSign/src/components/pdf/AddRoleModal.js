import React from "react";
import ModalUi from "../../primitives/ModalUi";

const AddRoleModal = (props) => {
  return (
    <ModalUi
      title={"Add Role"}
      isOpen={props.isModalRole}
      handleClose={props.handleCloseRoleModal}
    >
      <div className="addusercontainer">
        <form className="flex flex-col" onSubmit={props.handleAddRole}>
          <input
            value={props.roleName}
            onChange={(e) => props.setRoleName(e.target.value)}
            placeholder={
              props.signersdata.length > 0
                ? "User " + (props.signersdata.length + 1)
                : "User 1"
            }
            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs mt-1"
          />
          <p className="text-[gray] text-[11px] mt-[5px] mb-[10px] ml-[10px]">
            e.g: Customer, Hr, Director, Manager, Student, etc...
          </p>
          <div>
            <div className="h-[1px] w-full bg-[#9f9f9f] mb-[10px]"></div>
            <button type="submit" className="op-btn op-btn-primary">
              Add
            </button>
            <button
              onClick={props.handleCloseRoleModal}
              type="button"
              className="op-btn op-btn-secondary ml-2"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </ModalUi>
  );
};

export default AddRoleModal;
