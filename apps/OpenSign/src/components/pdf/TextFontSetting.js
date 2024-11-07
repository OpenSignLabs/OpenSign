import React from "react";
import ModalUi from "../../primitives/ModalUi";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

function TextFontSetting(props) {
  const { t } = useTranslation();
  return (
    <ModalUi
      headerColor={"#dc3545"}
      isOpen={props.isTextSetting}
      reduceWidth={"max-w-[350px]"}
      title={t("text-field")}
      handleClose={() => props.setIsTextSetting(false)}
    >
      <div className="h-full p-[20px]">
        <div className="flex items-center">
          <span>{t("font-size")} :</span>
          <select
            className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
            value={
              props.fontSize ||
              props.currWidgetsDetails?.options?.fontSize ||
              12
            }
            onChange={(e) => {
              props.setFontSize(parseInt(e.target.value));
            }}
          >
            {fontsizeArr.map((size, ind) => {
              return (
                <option className="text-[13px]" value={size} key={ind}>
                  {size}
                </option>
              );
            })}
          </select>
          <div className="flex flex-row gap-1 items-center ml-4">
            <span>{t("color")}: </span>
            <select
              value={
                props.fontColor ||
                props.currWidgetsDetails?.options?.fontColor ||
                "black"
              }
              onChange={(e) => props.setFontColor(e.target.value)}
              className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
            >
              {fontColorArr.map((color, ind) => {
                return (
                  <option value={color} key={ind}>
                    {t(`color-type.${color}`)}
                  </option>
                );
              })}
            </select>
            <span
              style={{
                background:
                  props.fontColor ||
                  props.currWidgetsDetails?.options?.fontColor
              }}
              className="w-5 h-[19px] ml-1"
            ></span>
          </div>
        </div>

        <div className="h-[1px] bg-[#9f9f9f] w-full mt-[15px] mb-2"></div>
        <button
          onClick={() => props.handleSaveFontSize()}
          type="button"
          className="op-btn op-btn-primary mt-2"
        >
          {t("save")}
        </button>
      </div>
    </ModalUi>
  );
}

export default TextFontSetting;
