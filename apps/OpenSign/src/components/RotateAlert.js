import React from "react";
import ModalUi from "../primitives/ModalUi";
import { useTranslation } from "react-i18next";

function RotateAlert(props) {
  const { t } = useTranslation();
  return (
    <ModalUi
      isOpen={props.isRotate}
      title={t("Rotation-alert")}
      handleClose={() => props.setIsRotate({ status: false, degree: 0 })}
    >
      {" "}
      <div className="p-[20px] h-full">
        <p>{t("rotate-alert-mssg")}</p>
        <div className="h-[1px]  w-full my-[15px] bg-[#9f9f9f]"></div>
        <div className="flex gap-1">
          <button
            onClick={() => props.setIsRotate({ status: false, degree: 0 })}
            type="button"
            className="op-btn op-btn-ghost shadow-md"
          >
            {t("no")}
          </button>
          <button
            onClick={() => props.handleRemoveWidgets()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {t("yes")}
          </button>
        </div>
      </div>
    </ModalUi>
  );
}

export default RotateAlert;
