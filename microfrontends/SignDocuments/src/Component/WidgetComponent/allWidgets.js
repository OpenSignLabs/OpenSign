import React, { useRef, useState } from "react";
import { getWidgetType } from "../../utils/Utils";

function AllWidgets(props) {
  const [backgroundColor, setBackgroundColor] = useState("");
  const timeoutRef = useRef(null);
  const touchStartTimestamp = useRef(0);
  const [selectWidgetType, setSelectWidgetType] = useState("");

  const touchTimeoutRef = useRef(null);
  const [isTouchHold, setIsTouchHold] = useState(false);

  const handleTouchStart = (type) => {
    // Set a timeout for the long press event
    touchStartTimestamp.current = Date.now();

    // Set a timeout for the long press event
    timeoutRef.current = setTimeout(() => {
      // Check if the touch is still ongoing after the long press duration
      if (Date.now() - touchStartTimestamp.current >= 1000) {
        setTimeout(() => {
          props.setIsDraggingEnable(true);
        }, 1000);
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
    // clearTimeout(timeoutRef.current);
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

  // const handleTouchStart = () => {
  //   touchTimeoutRef.current = setTimeout(() => {
  //     setIsTouchHold(true);
  //     setBackgroundColor("lightblue"); // Change the color after the long press
  //           // setSelectWidgetType(type);
  //           props.setIsDraggingEnable(true);
  //           if ("vibrate" in navigator) {
  //             // Vibrate for 200 milliseconds
  //             navigator.vibrate(200);
  //           }
  //     // Start drag operation when touch-and-hold is detected
  //     // props.dragSignature();
  //     // props.dragSignatureSS();

  //     console.log('go here');
  //   }, 1000); // Adjust the duration for touch-and-hold
  // };

  // const handleTouchEnd = () => {
  //   clearTimeout(touchTimeoutRef.current);
  //   setIsTouchHold(false);
  //    props.setIsDraggingEnable(false);
  //     setBackgroundColor(""); // Change the color after the long press
  //     setSelectWidgetType("");
  // };
  // const handleTouchMove = () => {
  //   if (touchTimeoutRef.current) {
  //     clearTimeout(touchTimeoutRef.current);
  //     touchTimeoutRef.current = null;
  //   }
  // };
  return props.updateWidgets.map((item, ind) => {
    return (
      <div key={ind} style={{ marginBottom: "10px" }}>
        <div
          className="widgets"
          onClick={(e) => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => {
            // if (!props.isMobile) {
            item.ref(element);
            if (element) {
              if (props?.signRef) {
                props.signRef.current = element;
              }
            }
            // }
            // props.dragSignature(element);
            // props.dragSignatureSS(element)
            // element && element.addEventListener("touchstart", handleTouchStart);
            // element && element.addEventListener("touchend", handleTouchEnd);
          }}
          // handleTouchMove={handleTouchMove}
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
