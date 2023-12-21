import React from "react";
import SelectSigners from "../../premitives/SelectSigners";
import AddUser from "../../premitives/AddUser";
import ModalUi from "../../premitives/ModalUi";

const LinkUserModal = (props) => {
  return (
    <ModalUi title={"Add/Choose Signer"} isOpen={props.isAddUser[props.uniqueId]} handleClose={props.closePopup}>
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
    </ModalUi>
  );
};

export default LinkUserModal;
