import { useDragLayer } from "react-dnd";
import { defaultWidthHeight, getContainerScale } from "../../constant/Utils";
import { useEffect, useRef } from "react";

function DragGuideLinesLayer(props) {
  const { showCanvasGuidelines, canvasContainerRef } = props;
  const prevDragState = useRef({ isDragging: false, x: 0, y: 0 });

  const { isDraggingWidget, sourceOffset, itemType } = useDragLayer(
    (monitor) => ({
      isDraggingWidget: monitor.isDragging(),
      // Use getSourceClientOffset - this gives the top-left position of the
      // drag source, which exactly matches WidgetsDragPreview's position.
      sourceOffset: monitor.getSourceClientOffset(),
      itemType: monitor.getItem()
    })
  );

  useEffect(() => {
    //  Hide guidelines when dragging stops
    if (!isDraggingWidget) {
      showCanvasGuidelines(false);
      return;
    }
    if (!sourceOffset || !itemType?.text) return;

    // Get the canvas container to calculate position relative to the full
    // document canvas (which spans all pages).
    const canvasContainer = canvasContainerRef?.current;
    if (!canvasContainer) return;

    const scale = props.scale || 1; // ✅ get scale
    const containerRect = canvasContainer.getBoundingClientRect();

    // ✅ Divide by scale so guidelines live in the same coordinate space
    // as the absolute-positioned CanvasGuidelines divs inside the scaled canvas.
    // Without this, at 1.5x zoom a viewport pixel maps to 1/1.5 canvas pixels,
    // so the guideline lines appear further right/down than the drag preview.
    const x = (sourceOffset.x - containerRect.left) / scale;
    const y = (sourceOffset.y - containerRect.top) / scale;

    //  Check if there's any change in position
    const hasStateChanged =
      prevDragState.current.isDragging !== isDraggingWidget ||
      prevDragState.current.x !== x ||
      prevDragState.current.y !== y;

    if (hasStateChanged) {
      prevDragState.current = { isDragging: isDraggingWidget, x, y };
      //  Get the default width and height of the dragged checkbox/radio widget type
      const el = document.getElementById("checkbox&radio-preview");
      let rect;
      if (el) {
        rect = el.getBoundingClientRect();
      }
      const containerScale = getContainerScale(
        props.pdfOriginalWH,
        props.pageNumber,
        props.containerWH
      );
      const height =
        defaultWidthHeight(itemType?.text)?.height * containerScale;
      const width = defaultWidthHeight(itemType?.text)?.width * containerScale;
      const widget = {
        type: itemType?.text,
        Width: width / (containerScale * props?.scale),
        Height: height / (containerScale * props?.scale)
      };

      // ✅ rect dimensions also need to be divided by scale because
      // getBoundingClientRect() returns scaled (viewport) pixel sizes,
      // but posWidth/posHeight return unscaled canvas sizes.
      const getWidth = rect?.width
        ? rect.width / scale
        : props?.posWidth(widget);
      const getHeight = rect?.height
        ? rect.height / scale
        : props?.posHeight(widget);

      //  Display the alignment guidelines based on the current drag position and widget size

      showCanvasGuidelines(true, x, y, getWidth, getHeight);
    }
  }, [
    isDraggingWidget,
    sourceOffset,
    itemType,
    showCanvasGuidelines,
    props.scale
  ]);
}

export default DragGuideLinesLayer;
