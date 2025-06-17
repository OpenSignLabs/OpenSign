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
      <div className="h-full p-[20px] text-base-content">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Font Size Selector */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">{t("font-size")}:</span>
            <select
              className="ml-[7px] w-[60%] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={
                props.fontSize ||
                props.currWidgetsDetails?.options?.fontSize ||
                12
              }
              onChange={(e) => props.setFontSize(parseInt(e.target.value))}
            >
              {fontsizeArr.map((size, ind) => (
                <option key={ind} className="text-[13px]" value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          {/* Font Color Selector */}
          <div className="flex items-center">
            <span className="whitespace-nowrap">{t("color")}:</span>
            <select
              className="ml-[33px] md:ml-4 w-[65%] md:w-[full] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={
                props.fontColor ||
                props.currWidgetsDetails?.options?.fontColor ||
                "black"
              }
              onChange={(e) => props.setFontColor(e.target.value)}
            >
              {fontColorArr.map((color, ind) => (
                <option key={ind} value={color}>
                  {t(`color-type.${color}`)}
                </option>
              ))}
            </select>
            {/* Color Preview Box */}
            <span
              className="w-5 h-5 ml-2 rounded border border-gray-300"
              style={{
                backgroundColor:
                  props.fontColor ||
                  props.currWidgetsDetails?.options?.fontColor ||
                  "black"
              }}
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
