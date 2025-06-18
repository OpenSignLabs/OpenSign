import React, { useState, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import { fontsizeArr, fontColorArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

export default function CellsSettingModal({
  isOpen,
  handleClose,
  defaultData,
  handleSave
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [cellCount, setCellCount] = useState(5);
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState("black");

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.options?.name || "Cells");
      setCellCount(defaultData.options?.cellCount || 5);
      setFontSize(defaultData.options?.fontSize || 12);
      setFontColor(defaultData.options?.fontColor || "black");
    }
  }, [defaultData]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSave &&
      handleSave({
        name,
        cellCount: parseInt(cellCount, 10),
        fontSize,
        fontColor
      });
  };

  return (
    <ModalUi isOpen={isOpen} handleClose={handleClose} title={t("widget-info")}> 
      <form onSubmit={onSubmit} className="p-[20px] text-base-content flex flex-col gap-3">
        <div>
          <label htmlFor="name" className="text-[13px]">
            {t("name")} <span className="text-[red]">*</span>
          </label>
          <input
            required
            name="name"
            className="op-input op-input-bordered op-input-sm w-full text-xs focus:outline-none hover:border-base-content"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cellCount" className="text-[13px]">
            {t("cell-count")}
          </label>
          <input
            type="number"
            min="1"
            name="cellCount"
            className="op-input op-input-bordered op-input-sm w-full text-xs focus:outline-none hover:border-base-content"
            value={cellCount}
            onChange={(e) => setCellCount(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">{t("font-size")}: </span>
            <select
              className="ml-[7px] w-[60%] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            >
              {fontsizeArr.map((size, ind) => (
                <option className="text-[13px]" value={size} key={ind}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <span>{t("color")}: </span>
            <select
              className="ml-[33px] md:ml-4 w-[65%] md:w-full op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            >
              {fontColorArr.map((color, ind) => (
                <option value={color} key={ind}>
                  {t(`color-type.${color}`)}
                </option>
              ))}
            </select>
            <span className="w-5 h-[19px] ml-1" style={{ background: fontColor }} />
          </div>
        </div>
        <div className="h-[1px] w-full bg-[#b7b3b3] my-[16px]"></div>
        <button type="submit" className="op-btn op-btn-primary">
          {t("save")}
        </button>
      </form>
    </ModalUi>
  );
}
