import { selectCheckbox } from "../../constant/Utils";

/** Render the inline checkbox group for the current widget. */
export function renderCheckbox(type, context) {
  const {
    props,
    fontSize,
    fontColor,
    selectedCheckbox,
    setSelectedCheckbox,
    canEditInline,
    isReadOnly,
    persistInlineValue
  } = context;
  switch (type) {
    case "checkbox":
      const checkBoxLayout = props.pos.options?.layout || "vertical";
      const isMultipleCheckbox =
        props.pos.options?.values?.length > 0 ? true : false;
      const checkboxSize = parseFloat(fontSize);
      const checkboxGapX = `${checkboxSize * 0.8}px`;
      const checkboxGapY = `${checkboxSize * 0.4}px`;
      const checkBoxWrapperClass = `flex items-start whitespace-pre-wrap ${
        checkBoxLayout === "horizontal"
          ? `flex-row flex-wrap lg:py-[1.6px]`
          : `flex-col`
      }`;

      return (
        <div
          className={checkBoxWrapperClass}
          style={{
            zIndex: props.isSignYourself && "99",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            gap: isMultipleCheckbox
              ? checkBoxLayout === "horizontal"
                ? checkboxGapX
                : checkboxGapY
              : undefined
          }}
        >
          {props.pos.options?.values?.map((data, ind) => {
            const isAuthoring = canEditInline;
            return (
              <div
                key={ind}
                className={
                  isAuthoring ? "" : "select-none-cls pointer-events-none"
                }
              >
                <label
                  htmlFor={`checkbox-${props.pos.key + ind}`}
                  style={{
                    fontSize: fontSize,
                    color: fontColor,
                    gap: `${checkboxSize * 0.2}px`
                  }}
                  className="mb-0 flex items-center"
                >
                  <input
                    id={`checkbox-${props.pos.key + ind}`}
                    style={{
                      width: fontSize,
                      height: fontSize,
                      flexShrink: 0
                    }}
                    className="op-checkbox rounded-[1px]"
                    disabled={props.isNeedSign && isReadOnly}
                    type="checkbox"
                    readOnly={!isAuthoring}
                    checked={
                      isAuthoring
                        ? selectedCheckbox?.includes(ind)
                        : !props?.isPrefillModal
                          ? !!selectCheckbox(ind, selectedCheckbox)
                          : false
                    }
                    onClick={(e) => {
                      if (isAuthoring) e.stopPropagation();
                    }}
                    onChange={(e) => {
                      if (!isAuthoring) return;
                      const isChecked = e.target.checked;
                      let updateSelectedCheckbox = selectedCheckbox
                        ? [...selectedCheckbox]
                        : [];
                      if (isChecked) {
                        const maxRequired =
                          props.pos?.options?.validation?.maxRequiredCount;
                        if (
                          typeof maxRequired === "number" &&
                          maxRequired > 0 &&
                          updateSelectedCheckbox.length >= maxRequired
                        ) {
                          return;
                        }
                        updateSelectedCheckbox.push(ind);
                      } else {
                        updateSelectedCheckbox = updateSelectedCheckbox.filter(
                          (d) => d !== ind
                        );
                      }
                      setSelectedCheckbox(updateSelectedCheckbox);
                      if (props.setXyPosition) {
                        persistInlineValue(
                          updateSelectedCheckbox,
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
                  />
                  {!props.pos.options?.isHideLabel && (
                    <span className="leading-none">{data}</span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      );
  }
}
