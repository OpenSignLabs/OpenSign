import React from "react";
import SelectSigners from "../components/shared/fields/SelectSigners";
import AddContact from "./AddContact";
import ModalUi from "./ModalUi";

const LinkUserModal = (props) => {
  return (
    <ModalUi
      title={"Add/Choose Signer"}
      isOpen={
        props?.isAddSigner ||
        (props?.isAddUser && props?.isAddUser[props?.uniqueId])
      }
      handleClose={props.closePopup}
    >
      <SelectSigners
        details={props.handleAddUser}
        closePopup={props.closePopup}
        signersData={props?.signersData}
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
      <AddContact details={props.handleAddUser} closePopup={props.closePopup} />
    </ModalUi>
  );
};

export default LinkUserModal;
