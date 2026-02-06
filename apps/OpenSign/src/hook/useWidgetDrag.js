import { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDispatch } from "react-redux";

export const useWidgetDrag = (item) => {
  const [, dragRef, preview] = useDrag({
    type: "BOX",
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // Hide browser default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return { dragRef };
};
