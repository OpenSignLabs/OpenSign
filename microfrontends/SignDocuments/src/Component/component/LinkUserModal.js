import React from "react";
import Modal from "react-bootstrap/Modal";
import SelectSigners from "./SelectSigners";
import AddUser from "./AddUser";

const LinkUserModal = (props) => {
  return (
    <Modal show={props.isAddUser[props.uniqueId]}>
      <Modal.Header
        className={"bg-info"}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span style={{ color: "white" }}>Add/Choose Signer</span>
        <span
          style={{ color: "white", cursor: "pointer" }}
          onClick={() => props.closePopup()}
        >
          X
        </span>
      </Modal.Header>
      <Modal.Body>
        <SelectSigners
          details={props.handleAddUser}
          closePopup={props.closePopup}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "grey"
            }}
          ></span>
          <span>OR</span>
          <span
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "grey"
            }}
          ></span>
        </div>
        <AddUser details={props.handleAddUser} closePopup={props.closePopup} />
      </Modal.Body>
    </Modal>
  );
};

export default LinkUserModal;
