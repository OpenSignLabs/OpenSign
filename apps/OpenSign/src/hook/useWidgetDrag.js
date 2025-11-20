import { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useGuidelinesContext } from "../context/GuidelinesContext";

export const useWidgetDrag = (item) => {
  const { showGuidelines } = useGuidelinesContext();
  const [, dragRef, preview] = useDrag({
    type: "BOX",
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: () => {
      showGuidelines(false);
    }
  });

  // Hide browser default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return { dragRef };
};
