import { useDragLayer } from "react-dnd";
import {
  defaultWidthHeight,
  getContainerScale,
  handleBackground,
  radioButtonWidget
} from "../../constant/Utils";

export default function WidgetsDragPreview(props) {
  // 🎯 useDragLayer is used to track drag state globally (without attaching to a specific draggable item)
  const { widgetType, isDragging, currentOffset } = useDragLayer((monitor) => ({
    widgetType: monitor.getItem(), // 📦 current dragged item data
    isDragging: monitor.isDragging(), // 🟢 whether dragging is active
    currentOffset: monitor.getSourceClientOffset() // 📍 current cursor position
  }));

  // 📌 Default options for checkbox/radio preview
  const options = [{ name: "Option-1" }, { name: "Option-2" }];
  // ❌ Do not render preview if drag is not active or position data is missing
  // isDragging → ensures preview is shown ONLY while user is actively dragging
  // currentOffset → provides current mouse position; without it we can't place the preview correctly
  if (!isDragging || !currentOffset) return null;

  // 📍 Extract current cursor position
  const { x, y } = currentOffset;

  // 📐 Get scale of PDF container (helps map coordinates correctly)
  const containerScale = getContainerScale(
    props.pdfOriginalWH,
    props.pageNumber,
    props.containerWH
  );

  // 📏 Calculate scaled height & width based on widget type
  const height = defaultWidthHeight(widgetType?.text)?.height * containerScale;
  const width = defaultWidthHeight(widgetType?.text)?.width * containerScale;

  // 📦 Widget dimensions adjusted relative to PDF scale and zoom
  const widget = {
    type: widgetType?.text,
    Width: width / (containerScale * props?.scale),
    Height: height / (containerScale * props?.scale)
  };

  // 🔤 Font size calculator (currently static but can be dynamic later)
  const calculateFont = () => {
    const fontSize = 12;
    return fontSize;
  };

  // ✅ KEY FIX: Get the scroll container's bounding rect so the preview
  // renders at the same visual position as the real widget drop target.
  // Without this, the preview uses raw viewport coords while the PDF
  // canvas is offset by the container's scroll position.
  const scrollEl = props.canvasContainerRef?.current;

  // 📦 Get container position relative to viewport
  const containerRect = scrollEl?.getBoundingClientRect?.() ?? {
    left: 0,
    top: 0
  };

  // 📜 Get scroll offsets (important when container is scrolled)
  const scrollLeft = scrollEl?.scrollLeft ?? 0;
  const scrollTop = scrollEl?.scrollTop ?? 0;

  // 🔄 Convert viewport coordinates → PDF coordinate system
  const scale = props.scale || 1;

  // 🎯 Adjust X coordinate based on container offset, scroll, and zoom
  const adjustedX = (x - containerRect.left + scrollLeft) / scale;

  // 🎯 Adjust Y coordinate based on container offset, scroll, and zoom
  const adjustedY = (y - containerRect.top + scrollTop) / scale;

  return (
    // 🧱 Full-screen overlay layer for drag preview (non-interactive)
    // pointer-events-none ensures it doesn't block mouse interactions
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div
        style={{
          position: "absolute", // 📍 Positioned relative to overlay
          transform: `translate(${adjustedX}px, ${adjustedY}px)` // 🚀 Move preview to correct position
        }}
      >
        {/* 🔘 Render checkbox/radio preview */}
        {widgetType.text === "checkbox" ||
        widgetType.text === radioButtonWidget ? (
          <div
            id="checkbox&radio-preview"
            style={{
              // 🎨 Dynamic background depending on state (signing / assigned user etc.)
              background: handleBackground(
                props?.data,
                props?.isNeedSign,
                props?.uniqueId
              )
            }}
            className="border-red-600 rounded-[2px] border-[1px]"
          >
            {/* 🔁 Render options list */}
            {options.map((x, id) => (
              <div key={id}>
                <label
                  style={{ fontSize: calculateFont(), color: "black" }}
                  className="mb-0 flex items-center gap-1"
                >
                  <input
                    // 📏 Input size based on font
                    style={{ width: calculateFont(), height: calculateFont() }}
                    className={`${
                      widgetType.text === "checkbox"
                        ? "op-checkbox"
                        : "op-radio rounded-full border-black appearance-none bg-white inline-block align-middle relative"
                    } rounded-[1px]`}
                    type={widgetType.text === "checkbox" ? "checkbox" : "radio"}
                  />
                  {/* 🏷️ Option label */}
                  <span>{x?.name}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          // 🧾 Render generic widget preview (text, signature, etc.)
          <div
            style={{
              width: props?.posWidth(widget), // 📏 dynamic width
              height: props?.posHeight(widget), // 📏 dynamic height
              background: handleBackground(
                props?.data,
                props?.isNeedSign,
                props?.uniqueId
              )
            }}
            className="border-red-600 rounded-[2px] border-[1px] flex items-center justify-center"
          >
            {/* 🏷️ Widget type label */}
            <span className="text-center text-[10px] font-medium">
              {widgetType?.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
