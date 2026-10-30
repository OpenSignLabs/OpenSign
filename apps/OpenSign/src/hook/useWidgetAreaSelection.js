import { useCallback, useEffect, useRef, useState } from "react";
import { handleDeleteWidget } from "../constant/Utils";

const isEditing = (target) =>
  target instanceof Element &&
  target.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], dialog'
  );

export default function useWidgetAreaSelection({
  enabled,
  containerRef,
  positions,
  setPositions,
  nested,
  scale,
  clearActiveWidget
}) {
  const overlayRef = useRef(null);
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [selection, setSelection] = useState(null);

  const clearSelection = useCallback(() => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture?.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId);
    }
    if (overlayRef.current) overlayRef.current.style.display = "none";
    setSelection(null);
  }, []);

  useEffect(() => {
    clearSelection();
  }, [positions, enabled, scale, clearSelection]);

  const deleteSelection = useCallback(() => {
    if (!enabled || !selection?.widgets.length) return;
    // Apply the entire deletion in one update so history/autosave sees one action.
    setPositions((current) => {
      if (nested) {
        return selection.widgets.reduce(
          (updated, entry) =>
            handleDeleteWidget(
              entry.key,
              entry.signerId,
              entry.pageNumber,
              updated
            ),
          current
        );
      }
      return current
        .map((page) => ({
          ...page,
          pos: page.pos.filter(
            (widget) =>
              !selection.widgets.some(
                (entry) =>
                  entry.pageNumber === page.pageNumber &&
                  entry.key === widget.key
              )
          )
        }))
        .filter((page) => page.pos.length > 0);
    });
    clearActiveWidget?.({});
    clearSelection();
  }, [
    enabled,
    selection,
    nested,
    setPositions,
    clearActiveWidget,
    clearSelection
  ]);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        isEditing(event.target) ||
        document.querySelector('[role="dialog"], dialog[open], .op-modal')
      )
        return;
      if (event.key === "Escape") clearSelection();
      if (event.key === "Delete" && selection?.widgets.length) {
        event.preventDefault();
        deleteSelection();
      }
    };
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", clearSelection);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", clearSelection);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [enabled, selection, deleteSelection, clearSelection, containerRef]);

  const updateRectangle = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return null;
    const container = containerRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(container.width, event.clientX - container.left)
    );
    const y = Math.max(
      0,
      Math.min(container.height, event.clientY - container.top)
    );
    const bounds = {
      left: Math.min(gesture.x, x),
      top: Math.min(gesture.y, y),
      width: Math.abs(x - gesture.x),
      height: Math.abs(y - gesture.y)
    };
    if (overlayRef.current) {
      Object.assign(overlayRef.current.style, {
        display: "block",
        left: `${bounds.left / scale}px`,
        top: `${bounds.top / scale}px`,
        width: `${bounds.width / scale}px`,
        height: `${bounds.height / scale}px`
      });
    }
    return { bounds, container };
  };

  const onPointerDownCapture = (event) => {
    if (!enabled || event.target.closest("[data-widget-selection-delete]"))
      return;
    suppressClickRef.current = false;
    clearSelection();
    if (
      !event.ctrlKey ||
      event.button !== 0 ||
      event.pointerType !== "mouse" ||
      isEditing(event.target) ||
      !event.target.closest("[data-page-number]") ||
      document.querySelector('[role="dialog"], dialog[open], .op-modal')
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    clearActiveWidget?.({});
    const container = containerRef.current.getBoundingClientRect();
    gestureRef.current = {
      x: event.clientX - container.left,
      y: event.clientY - container.top,
      pointerId: event.pointerId,
      target: event.currentTarget
    };
    suppressClickRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateRectangle(event);
  };

  const onPointerMoveCapture = (event) => {
    if (!gestureRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    updateRectangle(event);
  };

  const onPointerUpCapture = (event) => {
    const rectangle = updateRectangle(event);
    if (!rectangle) return;
    event.preventDefault();
    event.stopPropagation();
    const { bounds, container } = rectangle;
    const widgets = [];
    if (bounds.width >= 3 && bounds.height >= 3) {
      for (const element of containerRef.current.querySelectorAll(
        "[data-widget-key]"
      )) {
        const rect = element.getBoundingClientRect();
        if (
          rect.width <= 0 ||
          rect.height <= 0 ||
          rect.right <= container.left + bounds.left ||
          rect.left >= container.left + bounds.left + bounds.width ||
          rect.bottom <= container.top + bounds.top ||
          rect.top >= container.top + bounds.top + bounds.height
        )
          continue;
        const pageNumber = Number(
          element.closest("[data-page-number]").dataset.pageNumber
        );
        for (const signer of positions || []) {
          if (nested && String(signer.Id) !== element.dataset.widgetSignerId)
            continue;
          const page = (nested ? signer.placeHolder || [] : [signer]).find(
            (entry) => entry.pageNumber === pageNumber
          );
          const widget = page?.pos.find(
            (entry) => String(entry.key) === element.dataset.widgetKey
          );
          if (widget)
            widgets.push({ key: widget.key, signerId: signer.Id, pageNumber });
        }
      }
    }
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId);
    }
    if (widgets.length) {
      setSelection({
        widgets,
        left: bounds.left / scale,
        top: bounds.top / scale
      });
    } else {
      clearSelection();
    }
  };

  return {
    overlayRef,
    selection,
    clearSelection,
    deleteSelection,
    isSelected: (key, signerId, pageNumber) =>
      Boolean(
        selection?.widgets.some(
          (entry) =>
            entry.key === key &&
            entry.signerId === signerId &&
            entry.pageNumber === pageNumber
        )
      ),
    handlers: {
      onPointerDownCapture,
      onPointerMoveCapture,
      onPointerUpCapture,
      onPointerCancelCapture: clearSelection,
      onLostPointerCapture: () => {
        if (gestureRef.current) clearSelection();
      },
      onClickCapture: (event) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
      onMouseDownCapture: (event) => {
        if (gestureRef.current) event.stopPropagation();
      }
    }
  };
}
