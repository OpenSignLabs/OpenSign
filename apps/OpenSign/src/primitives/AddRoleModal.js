import React from "react";
import ModalUi from "./ModalUi";

const AddRoleModal = (props) => {
  return (
    <ModalUi
      title={"Add Role"}
      isOpen={props.isModalRole}
      handleClose={props.handleCloseRoleModal}
    >
      <div className="addusercontainer">
        <form
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={props.handleAddRole}
        >
          <input
            value={props.roleName}
            onChange={(e) => props.setRoleName(e.target.value)}
            placeholder={
              props.signersdata.length > 0
                ? "User " + (props.signersdata.length + 1)
                : "User 1"
            }
            className="addUserInput"
          />
          <p
            style={{
              color: "grey",
              fontSize: 11,
              margin: "10px 0 10px 5px"
            }}
          >
            e.g: Hr, Director, Manager, New joinee, Accountant, etc...
          </p>
          <div>
            <div
              style={{
                height: "1px",
                backgroundColor: "#9f9f9f",
                width: "100%",
                marginBottom: "15px"
              }}
            ></div>
            <button
              type="submit"
              style={{
                background: "#00a2b7"
              }}
              className="finishBtn"
            >
              Add
            </button>
            <button
              onClick={props.handleCloseRoleModal}
              type="button"
              className="finishBtn cancelBtn"
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
