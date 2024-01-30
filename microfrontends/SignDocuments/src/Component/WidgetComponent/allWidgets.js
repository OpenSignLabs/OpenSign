import React, { useRef, useState } from "react";
import { getWidgetType } from "../../utils/Utils";

function AllWidgets(props) {
  const [backgroundColor, setBackgroundColor] = useState("");
  const timeoutRef = useRef(null);
  const touchStartTimestamp = useRef(0);
  const [selectWidgetType, setSelectWidgetType] = useState("");

  const handleTouchStart = (type) => {
    // Set a timeout for the long press event
    touchStartTimestamp.current = Date.now();

    // Set a timeout for the long press event
    timeoutRef.current = setTimeout(() => {
      // Check if the touch is still ongoing after the long press duration
      if (Date.now() - touchStartTimestamp.current >= 1000) {
        setBackgroundColor("lightblue"); // Change the color after the long press
        setSelectWidgetType(type);
        props.setIsDraggingEnable(true);
        if ("vibrate" in navigator) {
          // Vibrate for 200 milliseconds
          navigator.vibrate(200);
        }
      }
    }, 1000); // Adjust the duration as needed
  };

  const handleTouchMove = () => {
    // If the touch moves (indicating a drag), cancel the long press effect
    clearTimeout(timeoutRef.current);
  };

  const handleTouchEnd = () => {
    // Clear the timeout when the touch ends before the long press duration
    setTimeout(() => {
      props.setIsDraggingEnable(false);
      setBackgroundColor(""); // Change the color after the long press
      setSelectWidgetType("");
    }, 1000);

    clearTimeout(timeoutRef.current);
  };
  return props.updateWidgets.map((item, ind) => {
    return (
      <div key={ind} style={{ marginBottom: "10px" }}>
        <div
          onClick={(e) => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          className="draggable"
          ref={(element) => {
            // if (!props.isMobile) {
            item.ref(element);
            if (element) {
              if (props?.signRef) {
                props.signRef.current = element;
              }
            }
            // }
          }}
          onMouseMove={props?.handleDivClick}
          onMouseDown={() => {
            props?.handleMouseLeave();
          }}
        >
          {item.ref && props.isMobile
            ? getWidgetType(
                item,
                props?.marginLeft,
                handleTouchStart,
                handleTouchEnd,
                handleTouchMove,
                backgroundColor,
                selectWidgetType
              )
            : getWidgetType(item)}
        </div>
      </div>
    );
  });
}

export default AllWidgets;
