import { useDragLayer } from "react-dnd";
import { defaultWidthHeight } from "../../constant/Utils";
import { useEffect, useRef } from "react";

function DragGuideLinesLayer(props) {
  const { showGuidelines } = props;
  const prevDragState = useRef({ isDragging: false, x: 0, y: 0 });
  const { isDraggingWidgets, offset, itemType } = useDragLayer((monitor) => ({
    isDraggingWidgets: monitor.isDragging(),
    offset: monitor.getClientOffset(),
    itemType: monitor.getItem()
  }));
  useEffect(() => {
    if (!offset) return;
    //getting container by id
    const container = document.getElementById("container");
    if (!container) return;
    if (itemType?.text) {
      // Calculate the position of the dragged element relative to the container
      // Get the container's bounding rectangle (position and size in the viewport)
      const containerRect = container.getBoundingClientRect();

      // Compute the X and Y coordinates of the dragged item inside the container
      // by subtracting the container's top-left offset from the current drag offset
      const x = offset.x - containerRect.left;
      const y = offset.y - containerRect.top;

      //  Check if there’s any change in the dragging state or the dragged element’s position
      // Compare the current drag state with the previously stored one
      const hasStateChanged =
        prevDragState.current.isDragging !== isDraggingWidgets || // Drag started or stopped
        prevDragState.current.x !== x || // X position changed
        prevDragState.current.y !== y; // Y position changed

      if (hasStateChanged) {
        //  Update the previous drag state with the latest values
        prevDragState.current = { isDragging: isDraggingWidgets, x, y };

        if (isDraggingWidgets) {
          //  Adjust the current drag coordinates relative to the initial widgets button position
          const getXPosition = props?.signBtnPosition?.[0]
            ? x - props.signBtnPosition[0].xPos
            : x;
          const getYPosition = props?.signBtnPosition?.[0]
            ? y - props.signBtnPosition[0].yPos
            : y;

          //  Get the default width and height of the dragged checkbox/radio widget type
          const el = document.getElementById("checkbox&radio-preview");
          let rect;
          if (el) {
            rect = el.getBoundingClientRect();
          }
          const widget = {
            type: itemType?.text,
            width: defaultWidthHeight(itemType?.text).width,
            height: defaultWidthHeight(itemType?.text).height
          };

          const getWidth =
            rect?.width || props?.posWidth(widget, props?.isSignYourself);
          const getHeight =
            rect?.height || props?.posHeight(widget, props?.isSignYourself);

          //  Display the alignment guidelines based on the current drag position and widget size
          showGuidelines(true, getXPosition, getYPosition, getWidth, getHeight);
        } else {
          //  Hide guidelines when dragging stops
          showGuidelines(false);
        }
      }
    }
  }, [isDraggingWidgets, offset, itemType, showGuidelines]);
}

export default DragGuideLinesLayer;
