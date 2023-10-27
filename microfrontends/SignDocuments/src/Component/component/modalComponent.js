import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";

function ModalComponent({ isShow, type }) {
  return (
    <Modal show={isShow}>
      <ModalHeader className="bg-danger" style={{ color: "white" }}>
        {type === "pdfFail" ? (
          <span>Failed to load pdf!</span>
        ) : (
          <span>Document Expired!</span>
        )}
      </ModalHeader>

      <Modal.Body>
      {type === "pdfFail" ? (
         <p>Something went wrong failed to load pdf file!</p>
        ) : (
          <p>This Document is no longer available.</p>
        )}
       
      </Modal.Body>
    </Modal>
  );
}

export default ModalComponent;
