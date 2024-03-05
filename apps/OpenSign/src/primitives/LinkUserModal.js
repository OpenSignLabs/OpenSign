import React from "react";
import SelectSigners from "./SelectSigners";
import AddUser from "./AddUser";
import ModalUi from "./ModalUi";

const LinkUserModal = (props) => {
  return (
    <ModalUi
      title={"Add/Choose Signer"}
      isOpen={props.isAddUser[props.uniqueId]}
      handleClose={props.closePopup}
    >
      <SelectSigners
        details={props.handleAddUser}
        closePopup={props.closePopup}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          margin: "0 30%",
          color: "#808080"
        }}
      >
        <span
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#ccc"
          }}
        ></span>
        <span>or</span>
        <span
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#ccc"
          }}
        ></span>
      </div>
      <AddUser details={props.handleAddUser} closePopup={props.closePopup} />
    </ModalUi>
  );
};

export default LinkUserModal;
