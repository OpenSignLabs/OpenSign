import DatePicker from "react-datepicker";
import moment from "moment";
import { changeDateToMomentFormat } from "../../constant/Utils";

/** Render the date field and its viewport-aware calendar. */
export function renderDate(type, context) {
  const {
    props,
    fontSize,
    fontColor,
    canEditInline,
    iswidgetEnable,
    isReadOnly,
    date,
    defaultData,
    response,
    textWidgetStyle,
    persistInlineValue,
    selectWidgetCls
  } = context;
  switch (type) {
    case "date": {
      const dateFormat =
        props?.selectDate?.format ||
        props.pos?.options?.validation?.format ||
        "MM/dd/yyyy";
      const momentFormat = changeDateToMomentFormat(dateFormat);
      const savedDate =
        props.pos?.options?.response ||
        (defaultData !== "today" ? defaultData : "");
      const savedMoment = savedDate
        ? moment(savedDate, momentFormat, true)
        : null;
      if (
        canEditInline &&
        (iswidgetEnable || props?.data?.Role === "prefill")
      ) {
        return (
          <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
            <DatePicker
              selected={
                savedMoment && savedMoment.isValid()
                  ? savedMoment.toDate()
                  : null
              }
              onChange={(value) => {
                const text = value ? moment(value).format(momentFormat) : "";
                if (!props.setXyPosition) return;
                persistInlineValue(
                  text,
                  props.pos,
                  props.xyPosition,
                  props.index,
                  props.setXyPosition,
                  props.data?.Id || props.uniqueId,
                  false,
                  dateFormat,
                  props.pos?.options?.fontSize || 12,
                  props.pos?.options?.fontColor || "black",
                  null,
                  null
                );
              }}
              dateFormat={momentFormat}
              popperPlacement="bottom-end"
              portalId="datepicker-portal-root"
              popperProps={{ strategy: "fixed" }}
              customInput={
                <input
                  style={{ fontSize: fontSize, color: fontColor }}
                  className="h-full w-full cursor-pointer bg-transparent outline-none"
                  readOnly
                />
              }
            />
          </div>
        );
      }
      return iswidgetEnable || props?.data?.Role === "prefill" ? (
        <div className={`${selectWidgetCls} outline-[#007bff]`}>
          <span
            style={{ fontSize: fontSize, color: fontColor }}
            className={`${isReadOnly ? `select-none opacity-25` : ``} ${selectWidgetCls} overflow-hidden`}
          >
            {date}
            <i className="fa-light fa-calendar text-[10px] ml-[5px]"></i>
          </span>
        </div>
      ) : (
        <div
          style={textWidgetStyle}
          className="select-none-cls overflow-hidden"
        >
          <span>
            {(defaultData !== "today" && defaultData) ||
              (response !== "today" && response) ||
              props?.selectDate?.format ||
              props.pos?.options?.validation?.format ||
              "MM/dd/yyyy"}
          </span>
        </div>
      );
    }
  }
}
