import { isRadioSelected, radioButtonWidget } from "../../constant/Utils";

/** Render a radio group when the current widget is a radio button. */
export function renderRadio(type, context) {
  const {
    props,
    fontSize,
    fontColor,
    canEditInline,
    isReadOnly,
    handleRadioCheck,
    persistInlineValue,
    getRadioLabel
  } = context;
  switch (type) {
    case radioButtonWidget:
      const radioLayout = props.pos.options?.layout || "vertical";
      const isOnlyOneBtn = props.pos.options?.values?.length > 0 ? true : false;
      const radioSize = parseFloat(fontSize);
      //Scaled gaps based on radioSize
      const scaledGapX = `${radioSize * 0.8}px`; // horizontal gap between items
      const scaledGapY = `${radioSize * 0.4}px`; // vertical gap between items

      const radioWrapperClass = `flex items-start whitespace-pre-wrap ${
        radioLayout === "horizontal"
          ? `flex-row flex-wrap lg:py-[1.6px]`
          : `flex-col`
      }`;

      return (
        <div
          className={radioWrapperClass}
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            //Scaled gap with condition same as before
            gap: isOnlyOneBtn
              ? radioLayout === "horizontal"
                ? scaledGapX // was gap-x-[10px]
                : scaledGapY // was gap-y-[5px]
              : undefined
          }}
        >
          {props.pos.options?.values.map((data, ind) => (
            <div
              key={ind}
              className={
                canEditInline ? "" : "select-none-cls pointer-events-none"
              }
            >
              <label
                htmlFor={`radio-${props.pos.key + ind}`}
                style={{
                  fontSize: fontSize,
                  color: fontColor,
                  gap: `${radioSize * 0.2}px` //scaled inner gap (was gap-1)
                }}
                className="mb-0 flex items-center" //removed text-xs
              >
                <input
                  readOnly={!canEditInline}
                  id={`radio-${props.pos.key + ind}`}
                  onChange={() => {
                    if (!canEditInline) return;
                    if (props.setXyPosition) {
                      persistInlineValue(
                        data,
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
                  style={{
                    width: fontSize,
                    height: fontSize,
                    flexShrink: 0
                  }}
                  className={`op-radio rounded-full border-black appearance-none bg-white inline-block align-middle relative ${
                    handleRadioCheck(data) ? "checked-radio" : ""
                  }`}
                  type="radio"
                  disabled={props.isNeedSign && isReadOnly}
                  checked={handleRadioCheck(data)}
                />
                {!props.pos.options?.isHideLabel && (
                  <span className="leading-none">
                    {getRadioLabel(data).trim()}
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      );
  }
}
