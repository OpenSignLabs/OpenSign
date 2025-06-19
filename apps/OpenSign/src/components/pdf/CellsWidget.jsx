import { useState, useEffect, useRef } from "react";

const Cell = ({
  isEnabled,
  count,
  h,
  value,
  editable,
  onChange,
  onKeyDown,
  onBlur,
  inputRef,
  index,
  fontSize,
  fontColor,
  hint
}) => (
  <div
    className={`${isEnabled ? "bg-white border-gray-400" : "select-none-cls pointer-events-none border-gray-500"} flex items-center justify-center border-[1px]`}
    style={{ flex: `0 0 ${100 / count}%`, height: h }}
  >
    <input
      disabled={!isEnabled}
      maxLength={1}
      value={value}
      readOnly={!editable}
      ref={inputRef}
      onChange={editable ? (e) => onChange && onChange(e, index) : undefined}
      onKeyDown={editable ? (e) => onKeyDown && onKeyDown(e, index) : undefined}
      // trigger validation when leaving a cell
      onBlur={editable ? (e) => onBlur && onBlur(e, index) : undefined}
      className={`${isEnabled ? "placeholder-gray-300" : "placeholder-gray-500"} w-full text-center focus:outline-none bg-transparent`}
      placeholder={hint}
      style={{ fontFamily: "Arial, sans-serif", fontSize, color: fontColor }}
    />
  </div>
);

export default function CellsWidget({
  isEnabled,
  count = 8,
  height = 40,
  value = "",
  editable = false,
  onChange,
  onKeyDown,
  onBlur,
  onCellCountChange,
  inputRefs,
  resizable = false,
  fontSize = "12px",
  fontColor = "black",
  hint = ""
}) {
  const [cellCount, setCellCount] = useState(count);

  // keep internal state in sync with prop updates
  useEffect(() => setCellCount(count), [count]);

  const startX = useRef(0);
  const startCount = useRef(cellCount);

  const capture = (downEv, onMove, onUp = () => {}) => {
    const id = downEv.pointerId;
    const move = (ev) => id === ev.pointerId && onMove(ev);
    const up = (ev) => {
      if (id !== ev.pointerId) return;
      onUp(ev);
      downEv.target.releasePointerCapture(id);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    downEv.target.setPointerCapture(id);
  };

  const onTopHandlePointerDown = (ev) => {
    // Prevent triggering the widget drag logic
    ev.stopPropagation();
    ev.preventDefault();
    startX.current = ev.clientX;
    startCount.current = cellCount;
    capture(ev, (moveEv) => {
      const dx = moveEv.clientX - startX.current;
      const delta = Math.floor(-dx / 5);
      let newCount = Math.max(1, startCount.current + delta);
      if (newCount !== cellCount) {
        setCellCount(newCount);
        onCellCountChange?.(newCount);
      }
    });
  };

  const cells = Array.from({ length: cellCount }).map((_, i) => value[i] || "");
  const hints = Array.from({ length: cellCount }).map((_, i) => hint[i] || "");

  return (
    <div
      className="relative flex w-full h-full overflow-visible"
      style={{ height }}
    >
      {resizable && (
        <div
          className="cell-size-handle absolute left-1/2 -translate-x-1/2 -bottom-4 rotate-180 cursor-ew-resize touch-none"
          onPointerDown={onTopHandlePointerDown}
        >
          <svg
            className="w-4 h-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      {cells.map((val, i) => (
        <Cell
          key={i}
          isEnabled={isEnabled}
          count={cellCount}
          h={height}
          value={val}
          editable={editable}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          inputRef={inputRefs ? (el) => (inputRefs.current[i] = el) : undefined}
          index={i}
          fontSize={fontSize}
          fontColor={fontColor}
          hint={hints[i]}
        />
      ))}
    </div>
  );
}
