import React from "react";
import RecipientList from "./RecipientList";
import { Tooltip } from "react-tooltip";

function SignerListPlace(props) {
  return (
    <div>
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        <span>
          {props.title ? props.title : "Recipients"}
          <span className="absolute text-xs z-[30] mt-1 ml-0.5">
            {props?.title === "Roles" && (
              <>
                <a data-tooltip-id="my-tooltip">
                  <sup>
                    <i className="fa-light fa-question rounded-full border-[1.5px] border-base-content text-[11px] py-[1px] px-[3px]"></i>
                  </sup>
                </a>
                <Tooltip id="my-tooltip" className="z-[100]">
                  <div className="max-w-[450px] 2xl:max-w-[500px] 2xl:text-[20px] p-[1px]">
                    <p className="font-bold pb-[1px]">
                      What are template roles?
                    </p>
                    <p>
                      Begin by specifying each role needed for the completion of
                      the document. Think about the parties involved in the
                      signing process and what their responsibilities are.
                      Common roles include HR for internal documents, Customer
                      for agreements or Vendor for business agreements.{" "}
                    </p>
                    <p className="font-bold">
                      Why pre-attach users to some roles?
                    </p>
                    <p>
                      For roles that consistently involve the same individual
                      (e.g., the CEO&apos;s signature on employee offer
                      letters), you can pre-attach a user to a role within the
                      template. This step is optional but recommended for
                      efficiency and consistency across documents.
                    </p>
                    <p className="font-bold">
                      When do i specify the user attached to each role?
                    </p>
                    <p>
                      When you create a document from your template, you&apos;ll
                      be prompted to attach users to each defined role. If a
                      role already has a user attached, this will be pre-filled,
                      but you can modify it as needed before sending out the
                      document.
                    </p>
                  </div>
                </Tooltip>
              </>
            )}
          </span>
        </span>
      </div>
      <div className="overflow-auto hide-scrollbar max-h-[180px]">
        <RecipientList {...props} />
      </div>
      <div className="mx-1">
        {props.handleAddSigner ? (
          <div
            role="button"
            data-tut="reactourAddbtn"
            disabled={props?.isMailSend ? true : false}
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            onClick={() => props.handleAddSigner()}
          >
            <i className="fa-light fa-plus"></i> Add role
          </div>
        ) : (
          <div
            role="button"
            data-tut="reactourAddbtn"
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            disabled={props?.isMailSend ? true : false}
            onClick={() => props.setIsAddSigner(true)}
          >
            <i className="fa-light fa-plus"></i> Add recipients
          </div>
        )}
      </div>
    </div>
  );
}

export default SignerListPlace;
