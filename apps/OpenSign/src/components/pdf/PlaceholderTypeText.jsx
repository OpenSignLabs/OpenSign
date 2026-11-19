import { textWidget } from "../../constant/Utils";
import { UI_FONT } from "../../constant/fonts";

const textWidgetCls =
  "w-full h-full md:min-w-full md:min-h-full z-[999] text-[12px] overflow-hidden resize-none outline-none text-base-content item-center whitespace-pre-wrap";

function renderInlineText(context, cols) {
  const {
    canEditInline,
    iswidgetEnable,
    textWidgetStyle,
    formatWidgetName,
    widgetValue,
    textWidgetCls,
    isReadOnly,
    inlineError,
    fontSize,
    fontColor,
    props,
    handleInlineTextChange
  } = context;
  if (!canEditInline && !iswidgetEnable) {
    return (
      <div style={textWidgetStyle} className="select-none-cls">
        <span className="ml-0.5">{formatWidgetName()}</span>
      </div>
    );
  }
  return (
    <textarea
      placeholder={formatWidgetName()}
      rows={1}
      value={widgetValue ?? ""}
      className={`${textWidgetCls} ${isReadOnly ? "select-none" : ""} ${inlineError ? "border-2 border-red-500" : ""}`}
      style={{
        fontSize,
        color: fontColor,
        background: isReadOnly ? props.data?.blockColor : "white",
        pointerEvents: canEditInline ? "auto" : "none",
        WebkitTextSecurity: props.pos?.options?.isMasked ? "disc" : "none"
      }}
      cols={cols}
      readOnly={!canEditInline}
      disabled={props.isNeedSign && isReadOnly}
      onClick={(event) => {
        if (canEditInline) event.stopPropagation();
      }}
      onChange={handleInlineTextChange}
    />
  );
}

/** Render text-like fields and fixed-height text inputs. */
export function renderText(type, context) {
  const {
    props,
    fontSize,
    fontColor,
    canEditInline,
    isReadOnly,
    iswidgetEnable,
    widgetValue,
    textRef,
    inlineError,
    textWidgetStyle,
    setwidgetValue,
    persistInlineValue,
    formatWidgetName,
    handleInlineTextChange,
    t
  } = context;
  switch (type) {
    case "name":
      return renderInlineText(context, "50");
    case "company":
      return renderInlineText(context, "50");
    case "job title":
      return renderInlineText(context, "50");
    case "email":
      return renderInlineText(context, "1");
    case textWidget:
      return (
        <textarea
          name="text"
          ref={textRef}
          readOnly={!canEditInline}
          placeholder={t("widgets-name.text")}
          rows={50}
          cols={50}
          value={widgetValue}
          style={{
            fontFamily: UI_FONT,
            fontSize: fontSize,
            color: fontColor,
            background: "white",
            pointerEvents: canEditInline ? "auto" : "none",
            WebkitTextSecurity: props.pos?.options?.isMasked ? "disc" : "none"
          }}
          className={`w-full resize-none overflow-hidden text-base-content item-center outline-none ${inlineError ? "border-2 border-red-500" : ""}`}
          onClick={(e) => {
            if (canEditInline) e.stopPropagation();
          }}
          onChange={(e) => {
            if (canEditInline) {
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
            }
          }}
        />
      );
    case textWidget:
      return (
        <textarea
          name="text"
          ref={textRef}
          readOnly
          placeholder={t("widgets-name.text")}
          rows={50}
          cols={50}
          defaultValue={widgetValue}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: fontSize,
            color: fontColor,
            background: "white"
          }}
          className="w-full resize-none overflow-hidden text-base-content item-center outline-none"
        />
      );

    case textWidget:
      return (
        <textarea
          name="text"
          ref={textRef}
          readOnly={!canEditInline}
          placeholder={t("widgets-name.text")}
          rows={50}
          cols={50}
          value={widgetValue}
          style={{
            fontFamily: UI_FONT,
            fontSize: fontSize,
            color: fontColor,
            background: "white",
            pointerEvents: canEditInline ? "auto" : "none",
            WebkitTextSecurity: props.pos?.options?.isMasked ? "disc" : "none"
          }}
          className={`w-full resize-none overflow-hidden text-base-content item-center outline-none ${inlineError ? "border-2 border-red-500" : ""}`}
          onClick={(e) => {
            if (canEditInline) e.stopPropagation();
          }}
          onChange={(e) => {
            if (canEditInline) {
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
            }
          }}
        />
      );
    case textWidget:
      return (
        <textarea
          name="text"
          ref={textRef}
          readOnly
          placeholder={t("widgets-name.text")}
          rows={50}
          cols={50}
          defaultValue={widgetValue}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: fontSize,
            color: fontColor,
            background: "white"
          }}
          className="w-full resize-none overflow-hidden text-base-content item-center outline-none"
        />
      );
  }
}
