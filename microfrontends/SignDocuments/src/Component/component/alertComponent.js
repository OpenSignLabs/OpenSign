import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";

function AlertComponent({ isShow, alertMessage, setIsAlert }) {
  return (
    <Modal show={isShow}>
      <ModalHeader className="bg-danger" style={{ color: "white" }}>
        <span>Alert</span>
      </ModalHeader>

      <Modal.Body>
        <span>{alertMessage}</span>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={() => {
            setIsAlert({
              isShow: false,
              alertMessage: ""
            });
          }}
          style={{
            color: "black"
          }}
          type="button"
          className="finishBtn"
        >
          Ok
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default AlertComponent;
