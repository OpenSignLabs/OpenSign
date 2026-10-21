import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

const CellsInput = forwardRef(function CellsInput(props, ref) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <input
        ref={ref}
        type="text"
        placeholder={props?.hint || t("widgets-name.text")}
        value={props?.cellsValue ?? ""}  
        onChange={(e) => props?.handleCellsInput(e)}
        className={`${props?.textInputcls} pr-4`}
        onBlur={props?.handleValidation || props?.handleValidation}
        maxLength={props?.count}
      />
    </div>
  );
});

export default CellsInput;
