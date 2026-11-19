import CellsWidget from "./CellsWidget";
import {
  cellsWidget,
  selectCheckbox,
  textInputWidget
} from "../../constant/Utils";
/** Render the field widget types, or return undefined when unmatched. */
export function renderField(type, context) {
  const {
    props,
    fontSize,
    fontColor,
    selectedCheckbox,
    setSelectedCheckbox,
    canEditInline,
    isReadOnly,
    iswidgetEnable,
    widgetValue,
    widgetData,
    textRef,
    inlineError,
    textWidgetStyle,
    formatWidgetName,
    handleInlineTextChange,
    persistInlineValue,
    t,
    setwidgetValue
  } = context;
  switch (type) {
    case textInputWidget:
      return props.isSignYourself || iswidgetEnable || canEditInline ? (
        <textarea
          placeholder={formatWidgetName()}
          ref={textRef}
          rows={50}
          value={widgetValue}
          className={`w-full resize-none overflow-hidden text-base-content item-center outline-none ${isReadOnly ? "select-none" : ""} ${inlineError ? "border-2 border-red-500" : ""}`}
          style={{
            fontSize: fontSize,
            color: fontColor,
            background: isReadOnly ? props.data?.blockColor : "white",
            pointerEvents: canEditInline ? "auto" : "none",
            WebkitTextSecurity: props.pos?.options?.isMasked ? "disc" : "none"
          }}
          name="text"
          readOnly={!canEditInline}
          onClick={(event) => {
            if (canEditInline) event.stopPropagation();
          }}
          onChange={handleInlineTextChange}
          disabled={props.isNeedSign && isReadOnly}
          cols="50"
        />
      ) : (
        <div style={textWidgetStyle} className="select-none-cls">
          <span className="ml-0.5">{formatWidgetName()}</span>
        </div>
      );
    case cellsWidget: {
      const count = props.pos.options?.cellCount || 5;
      const cells = (widgetValue || "").split("");
      const height = "100%";
      const fontSize = props.calculateFont(props.pos.options?.fontSize);
      const fontColor = props.pos.options?.fontColor || "black";
      const handleCellResize = (newCount) => {
        if (props.setCellCount) props.setCellCount(props.pos.key, newCount);
      };
      const isEditable =
        props.isPlaceholder || props.isSignYourself || props.isSelfSign;
      // Signers type in place (#64): keep one character per cell and save the value.
      const canTypeCells = !props.isPlaceholder && canEditInline && !isReadOnly;
      const handleCellChange = (event, index) => {
        const chars = Array.from({ length: count }, (_, i) => cells[i] || " ");
        const typed = event.target.value.slice(-1);
        chars[index] = typed || " ";
        const next = chars.join("").trimEnd();
        setwidgetValue(next);
        if (props.setXyPosition) {
          persistInlineValue(
            next,
            props.pos,
            props.xyPosition,
            props.index,
            props.setXyPosition,
            props.data?.Id || props.uniqueId,
            false,
            null,
            props.pos?.options?.fontSize || 12,
            props.pos?.options?.fontColor || "black",
            null,
            null
          );
        }
        if (typed) {
          event.target.parentElement?.nextElementSibling
            ?.querySelector("input")
            ?.focus();
        }
      };
      return (
        <CellsWidget
          isEnabled={iswidgetEnable}
          count={count}
          height={height}
          value={cells.join("")}
          editable={isEditable || canTypeCells}
          onChange={canTypeCells ? handleCellChange : undefined}
          resizable={props?.isAllowModify}
          fontSize={fontSize}
          fontColor={fontColor}
          hint={formatWidgetName()}
          onCellCountChange={handleCellResize}
        />
      );
    }
    case "dropdown": {
      // Saved values can be arrays; options can be objects with a name.
      const normalizeOption = (option) => {
        if (option == null) return "";
        if (typeof option === "object") {
          return String(option.name ?? option.value ?? "");
        }
        return String(option);
      };
      const dropdownValue = Array.isArray(widgetData)
        ? widgetData.map(normalizeOption).join(", ")
        : normalizeOption(widgetData);
      const selectedValue = Array.isArray(widgetValue)
        ? widgetValue.map(normalizeOption)
        : widgetValue
          ? [normalizeOption(widgetValue)]
          : [];
      if (canEditInline && props.pos?.options?.isMultiSelect) {
        const persist = (next) => {
          setwidgetValue(next);
          if (props.setXyPosition) {
            persistInlineValue(
              next,
              props.pos,
              props.xyPosition,
              props.index,
              props.setXyPosition,
              props.data?.Id || props.uniqueId,
              false,
              null,
              props.pos?.options?.fontSize || 12,
              props.pos?.options?.fontColor || "black",
              null,
              null
            );
          }
        };
        return (
          <div
            className="flex h-full w-full flex-col overflow-auto"
            style={{ fontSize: fontSize, color: fontColor }}
          >
            {(props.pos?.options?.values || []).map((data, ind) => {
              const optionLabel = normalizeOption(data);
              return (
                <label
                  key={ind}
                  className="mb-0 flex items-center"
                  style={{ gap: `${Math.max(fontSize * 0.2, 2)}px` }}
                >
                  <input
                    type="checkbox"
                    className="op-checkbox rounded-[1px]"
                    style={{
                      width: fontSize,
                      height: fontSize,
                      flexShrink: 0
                    }}
                    checked={selectedValue.includes(optionLabel)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedValue, optionLabel]
                        : selectedValue.filter((val) => val !== optionLabel);
                      persist(next);
                    }}
                  />
                  <span className="leading-none">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );
      }
      return canEditInline ? (
        <select
          value={selectedValue.join(", ")}
          onChange={(e) => {
            const val = e.target.value;
            setwidgetValue(val);
            if (props.setXyPosition) {
              persistInlineValue(
                val,
                props.pos,
                props.xyPosition,
                props.index,
                props.setXyPosition,
                props.data?.Id || props.uniqueId,
                false,
                null,
                props.pos?.options?.fontSize || 12,
                props.pos?.options?.fontColor || "black",
                null,
                null
              );
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full text-base-content outline-none bg-transparent"
          style={{ fontSize: fontSize, color: fontColor }}
        >
          <option value="" disabled hidden>
            {t("choose-one")}
          </option>
          {(props.pos?.options?.values || []).map((data, ind) => (
            <option key={ind} value={normalizeOption(data)}>
              {normalizeOption(data)}
            </option>
          ))}
        </select>
      ) : (
        <div
          style={textWidgetStyle}
          className="select-none-cls flex justify-between items-center"
        >
          {dropdownValue || t("choose-one")}
          <i className="fa-light fa-circle-chevron-down mr-1 "></i>
        </div>
      );
    }
  }
}
