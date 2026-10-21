import { useState } from "react";
import RecipientList from "./RecipientList";
// import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

function SignerListPlace(props) {
  const { t } = useTranslation();
  const handleAddRecipient = () => {
    props?.setIsAddSigner(true);
    props.setIsTour && props.setIsTour(false);
  };

  return (
    <div>
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        <span className="relative">
          {props.title ? props.title : "Recipients"}
          <button
            type="button"
            aria-label={`${props.title || t("recipients")} ${t("more")}`}
            className="min-h-[44px] min-w-[44px] align-middle"
            onClick={() => props.setIsTour && props.setIsTour(true)}
          >
            <i
              className="ml-1 cursor-pointer fa-light fa-question rounded-full border-[1px] border-base-content text-[11px] py-[1px] px-[3px]"
              aria-hidden="true"
            ></i>
          </button>
        </span>
      </div>
      <div className="overflow-auto hide-scrollbar max-h-[180px]">
        <RecipientList
          {...props}
        />
      </div>
      <div className="mx-1">
        {props.handleAddSigner ? (
          <button
            type="button"
            data-tut="reactourAddbtn"
            disabled={props?.isMailSend}
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            onClick={() => props.handleAddSigner()}
          >
            <i className="fa-light fa-plus"></i> {t("add-role")}
          </button>
        ) : (
          <button
            type="button"
            data-tut="addRecipient"
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            disabled={props?.isMailSend}
            onClick={handleAddRecipient}
          >
            <i className="fa-light fa-plus"></i> {t("add-recipients")}
          </button>
        )}
      </div>
    </div>
  );
}

export default SignerListPlace;
