import React, { useState, useEffect } from "react";
import ModalUi from "../primitives/ModalUi";
import { useTranslation } from "react-i18next";

const ColumnSelector = ({
  isOpen,
  allColumns = [],
  visibleColumns = [],
  columnLabels = {},
  defaultColumns = [],
  onApply,
  onClose
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(visibleColumns);
  const [names, setNames] = useState(columnLabels);

  useEffect(() => {
    setSelected(visibleColumns);
    setNames(columnLabels);
  }, [visibleColumns, columnLabels]);

  const handleChange = (col) => {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleApply = () => {
    onApply && onApply(selected, names);
    onClose && onClose();
  };

  return (
    <ModalUi isOpen={isOpen} title={t("select-columns")} handleClose={onClose}>
      <div className="p-[20px] flex flex-col gap-2">
        {allColumns.map((col, i) => (
          <div key={col} className="flex justify-between items-center gap-2">
            <span className="flex justify-center items-center h-full">
              <input
                id={col + "_" + i}
                type="checkbox"
                checked={selected.includes(col)}
                onChange={() => handleChange(col)}
                className="mb-0"
              />
              <span className="whitespace-nowrap ml-1">
                {t(`report-heading.${col}`, { defaultValue: col })}
              </span>
            </span>
          </div>
        ))}
        <div className="flex justify-start mt-2">
          <button onClick={handleApply} className="op-btn op-btn-primary">
            {t("apply")}
          </button>
        </div>
      </div>
    </ModalUi>
  );
};

export default ColumnSelector;
