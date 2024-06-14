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
      <div className="op-divider text-base-content mx-[25%] my-1">or</div>
      <AddContact details={props.handleAddUser} closePopup={props.closePopup} />
    </ModalUi>
  );
};

export default LinkUserModal;
