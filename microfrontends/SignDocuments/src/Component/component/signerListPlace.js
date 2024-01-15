import React from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import "../../css/signerListPlace.css";
import RecipientList from "../../premitives/RecipientList";

function SignerListPlace(props) {
  return (
    <div>
      <div
        style={{
          background: themeColor(),
          padding: "5px"
        }}
      >
        <span className="signedStyle">
          {props.title ? props.title : "Recipients"}
        </span>
      </div>
      <div className="signerList">
        <RecipientList {...props} />
      </div>
      {props.handleAddSigner && (
        <div
          data-tut="reactourAddbtn"
          className="addSignerBtn"
          onClick={() => props.handleAddSigner()}
        >
          <i className="fa-solid fa-plus"></i>
          <span style={{ marginLeft: 2 }}>Add role</span>
        </div>
      )}
    </div>
  );
}

export default SignerListPlace;
