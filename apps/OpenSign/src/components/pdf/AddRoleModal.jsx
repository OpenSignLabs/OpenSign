import React from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";

const AddRoleModal = (props) => {
  const { t } = useTranslation();
  return (
    <ModalUi
      title={t("add-role")}
      isOpen={props.isModalRole}
      handleClose={props.handleCloseRoleModal}
    >
      <div className="text-base-content h-full py-[10px] px-[20px]">
        <form className="flex flex-col" onSubmit={props.handleAddRole}>
          <input
            value={props.roleName}
            onChange={(e) => props.setRoleName(e.target.value)}
            placeholder={
              props.signersdata.length > 0
                ? "Role " + (props.signersdata.length + 1)
                : "Role 1"
            }
            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs mt-1"
          />
          <p className="text-[gray] text-[11px] mt-[5px] mb-[10px] ml-[10px]">
            {t("role-ex")}..
          </p>
          <div>
            <div className="h-[1px] w-full bg-[#9f9f9f] mb-[10px]"></div>
            <button type="submit" className="op-btn op-btn-primary">
              {t("add")}
            </button>
            <button
              onClick={props.handleCloseRoleModal}
              type="button"
              className="op-btn op-btn-ghost text-base-content ml-2"
            >
              {t("close")}
            </button>
          </div>
        </form>
      </div>
    </ModalUi>
  );
};

export default AddRoleModal;
