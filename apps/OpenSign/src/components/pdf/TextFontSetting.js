import React from "react";
import ModalUi from "../../primitives/ModalUi";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";
import { themeColor } from "../../constant/const";

function TextFontSetting(props) {
  return (
    <ModalUi
      headerColor={"#dc3545"}
      isOpen={props.isTextSetting}
      title={"Text field"}
      handleClose={() => {
        props.setIsTextSetting(false);
      }}
    >
      <div style={{ height: "100%", padding: 20 }}>
        <div className="flex items-center gap-4">
          <span>Font size: </span>
          <select
            className="border-[1px] border-gray-300 px-[5px]"
            value={
              props.fontSize || props.currWidgetsDetails?.options?.fontSize
            }
            onChange={(e) => props.setFontSize(e.target.value)}
          >
            {fontsizeArr.map((size, ind) => {
              return (
                <option style={{ fontSize: "13px" }} value={size} key={ind}>
                  {size}
                </option>
              );
            })}
          </select>
          <div className="flex flex-row gap-1">
            <span>color: </span>
            <select
              value={
                props.fontColor || props.currWidgetsDetails?.options?.fontColor
              }
              onChange={(e) => props.setFontColor(e.target.value)}
              className="border-[1px] border-gray-300 px-[2px] ml-[10px] "
            >
              {fontColorArr.map((color, ind) => {
                return (
                  <option value={color} key={ind}>
                    {color}
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
              className="w-5 h-[19px]"
            ></span>
          </div>
        </div>

        <div className="h-[1px] bg-[#9f9f9f] w-full mt-[15px] mb-[15px]"></div>
        <button
          onClick={() => props.handleSaveFontSize()}
          style={{ background: themeColor }}
          type="button"
          className="finishBtn "
        >
          save
        </button>
      </div>
    </ModalUi>
  );
}

export default TextFontSetting;
