import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { themeColor } from "../../utils/ThemeColor/backColor";

function AlertComponent({
  isShow,
  alertMessage,
  setIsAlert,
  isdefaultSign,
  addDefaultSignature,
  headBG
}) {
  return (
    <Modal show={isShow}>
      <ModalHeader
        style={{
          color: "white",
          background: headBG ? themeColor() : "#dc3545"
        }}
      >
        <span>Alert</span>
      </ModalHeader>

      <Modal.Body>
        <span>{alertMessage}</span>
      </Modal.Body>
      <Modal.Footer>
        {isdefaultSign ? (
          <>
            <button
              onClick={() => addDefaultSignature()}
              style={{
                background: themeColor()
              }}
              type="button"
              className="finishBtn"
            >
              Yes
            </button>
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
              Close
            </button>
          </>
        ) : (
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
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default AlertComponent;
