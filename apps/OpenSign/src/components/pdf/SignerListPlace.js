import React from "react";
import { themeColor } from "../../constant/const";
import RecipientList from "./RecipientList";

function SignerListPlace(props) {
  return (
    <div>
      <div
        style={{
          background: themeColor,
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
          className="p-[10px] my-[2px] flex flex-row items-center justify-center border-[1px] border-[#47a3ad] hover:bg-[#47a3ad] text-[#47a3ad]  hover:text-white cursor-pointer"
          onClick={() => props.handleAddSigner()}
          style={{
            opacity: props.isMailSend && "0.5",
            pointerEvents: props.isMailSend && "none"
          }}
        >
          <i className="fa-solid fa-plus"></i>
          <span style={{ marginLeft: 2 }}>Add role</span>
        </div>
      )}
    </div>
  );
}

export default SignerListPlace;
