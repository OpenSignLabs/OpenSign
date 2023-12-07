import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { useNavigate } from "react-router-dom";
function ModalComponent({ isShow, type, setIsShowEmail }) {
  const navigate = useNavigate();
  return (
    <Modal show={isShow}>
      <ModalHeader className="bg-danger" style={{ color: "white" }}>
        {type === "signersAlert" ? (
          <span>Select signers</span>
        ) : type === "alreadyPlace" ? (
          <span>Already Placed!</span>
        ) : (
          <span>Document Expired!</span>
        )}
      </ModalHeader>

      <Modal.Body>
        {type === "signersAlert" ? (
          <p>Please select signer for add placeholder!</p>
        ) : type === "alreadyPlace" ? (
          <p>Already set placeHolder for this document.</p>
        ) : (
          <p>This Document is no longer available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {type === "signersAlert" ? (
          <button
            onClick={() => {
              setIsShowEmail(false);
            }}
            style={{
              color: "black"
            }}
            type="button"
            className="finishBtn"
          >
            Ok
          </button>
        ) : (
          type === "alreadyPlace" && (
            <button
              onClick={() => {
                navigate(-1);
              }}
              style={{
                color: "black"
              }}
              type="button"
              className="finishBtn"
            >
              Ok
            </button>
          )
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ModalComponent;
