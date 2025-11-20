import { useDragLayer } from "react-dnd";
import {
  defaultWidthHeight,
  getContainerScale,
  handleBackground,
  radioButtonWidget
} from "../../constant/Utils";

export default function WidgetsDragPreview(props) {
  const { widgetType, isDragging, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      widgetType: monitor.getItem(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset()
    })
  );
  const options = [{ name: "Option-1" }, { name: "Option-2" }];
  if (!isDragging) return null;

  if (!initialOffset || !currentOffset) return null;

  const { x, y } = currentOffset;
  const getWidgetDetails = defaultWidthHeight(widgetType?.text);
  const widget = {
    type: widgetType?.text,
    width: getWidgetDetails?.width,
    height: getWidgetDetails?.height
  };
  const calculateFont = () => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      props.pageNumber,
      props.containerWH
    );
    const fontSize = 12 * containerScale * props.scale;
    return fontSize;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div
        className="absolute"
        style={{
          transform: `translate(${x}px, ${y}px)`
        }}
      >
        {widgetType.text === "checkbox" ||
        widgetType.text === radioButtonWidget ? (
          <div
            id="checkbox&radio-preview"
            style={{
              background: handleBackground(
                props?.data,
                props?.isNeedSign,
                props?.uniqueId
              )
            }}
            className="border-red-600 rounded-[2px] border-[1px]"
          >
            {options.map((x, id) => {
              return (
                <div key={id}>
                  <label
                    style={{ fontSize: calculateFont(), color: "black" }}
                    className={`mb-0 flex items-center gap-1`}
                  >
                    <input
                      style={{
                        width: calculateFont(),
                        height: calculateFont()
                      }}
                      className={`${widgetType.text === "checkbox" ? "op-checkbox" : "op-radio rounded-full border-black appearance-none bg-white inline-block align-middle relative"} rounded-[1px]`}
                      type={
                        widgetType.text === "checkbox" ? "checkbox" : "radio"
                      }
                    />
                    <span>{x?.name}</span>
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              width: props?.posWidth(widget, props?.isSignYourself),
              height: props?.posHeight(widget, props?.isSignYourself),
              background: handleBackground(
                props?.data,
                props?.isNeedSign,
                props?.uniqueId
              )
            }}
            className="border-red-600 rounded-[2px] border-[1px] flex items-center justify-center"
          >
            <span className="text-center text-[10px] font-medium">
              {widgetType?.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
