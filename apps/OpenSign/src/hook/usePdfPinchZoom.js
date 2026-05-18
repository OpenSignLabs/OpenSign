import { useEffect, useRef } from "react";

const MIN_SCALE = 1.0;
const MAX_SCALE = 4.0;

// Calculate straight-line distance between two touch points
function getDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate the midpoint (center) between two touch points
function getMidpoint(t1, t2) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2
  };
}

// Clamp a value between min and max bounds
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * usePdfPinchZoom
 *
 * Handles two-finger pinch-to-zoom on the PDF scroll container.
 *
 * Key design decision — flicker-free zooming:
 *   During the gesture, we mutate the transform div's style DIRECTLY via DOM
 *   (zero React re-renders). Only on touchEnd do we call setScale() once,
 *   committing the final value to React state. This eliminates the flicker
 *   that occurs when setScale() fires on every touchmove frame and forces
 *   the entire PDF tree (Document, Pages, Widgets) to re-render mid-gesture.
 *
 * @param {React.RefObject} containerRef  - Ref to the outer scrollable div (scrollRef in RenderPdf)
 * @param {number}          scale         - Current scale value from React state
 * @param {function}        setScale      - React state setter for scale
 * @param {function}        setZoomPercent - React state setter for zoom % display
 */
export default function usePdfPinchZoom(
  containerRef,
  scale,
  setScale,
  setZoomPercent
) {
  // Keep a mutable ref in sync with scale prop so event handlers always
  // read the latest value without being re-registered on every scale change
  const scaleRef = useRef(scale);
  // Stores the pending requestAnimationFrame id (null = none pending)
  const rafRef = useRef(null);

  // Sync scaleRef whenever the scale prop changes from outside (e.g. zoom buttons)
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    // Locate the inner content div that has `transform: scale(...)` applied.
    // We use an explicit data attribute (data-pdf-transform-target) set on that
    // div in RenderPdf.jsx — more reliable than sniffing [style*='transform']
    // which could accidentally match other elements.
    const getTransformTarget = () =>
      el.querySelector("[data-pdf-transform-target]");

    // Mutable pinch state — stored as a plain object (not refs/state) because
    // we only need it inside event handlers; no React re-render required.
    const pinch = {
      active: false, // Whether a two-finger gesture is in progress
      startDist: 0, // Finger distance at gesture start
      startScale: 1, // Scale value at gesture start
      startMid: { x: 0, y: 0 }, // Midpoint between fingers at gesture start (viewport coords)
      startScrollLeft: 0, // Container scrollLeft at gesture start
      startScrollTop: 0, // Container scrollTop at gesture start
      currentScale: 1 // Latest scale reached during the gesture
    };

    // touchstart: record initial finger positions and scroll state
    function onTouchStart(e) {
      // Only activate for exactly two fingers
      if (e.touches.length !== 2) return;

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      pinch.active = true;
      pinch.startDist = getDistance(t1, t2);
      pinch.startScale = scaleRef.current;
      pinch.currentScale = scaleRef.current;
      pinch.startMid = getMidpoint(t1, t2);
      // Snapshot scroll position so we can recompute it proportionally as scale changes
      pinch.startScrollLeft = el.scrollLeft;
      pinch.startScrollTop = el.scrollTop;
    }

    // touchmove: update the DOM transform directly — NO React state updates here
    function onTouchMove(e) {
      if (!pinch.active || e.touches.length !== 2) return;
      // Prevent browser's native scroll/zoom from interfering
      e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      // Derive new scale from how much the finger distance has changed
      const dist = getDistance(t1, t2);
      const ratio = dist / pinch.startDist;
      const newScale = clamp(pinch.startScale * ratio, MIN_SCALE, MAX_SCALE);

      // Skip tiny changes to avoid unnecessary DOM writes and rAF scheduling
      if (Math.abs(newScale - pinch.currentScale) < 0.008) return;
      pinch.currentScale = newScale;

      // Cancel any previously queued frame before scheduling a new one
      // (ensures we only process the most recent touch position per frame)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const transformTarget = getTransformTarget();
        if (!transformTarget) return;

        // ✅ KEY — mutate the DOM directly, bypassing React entirely.
        // This is what prevents flickering: no state update = no re-render
        // of <Document>, <Page> components, or widgets during the gesture.
        transformTarget.style.transform = `scale(${newScale})`;

        // Recompute scroll so the pinch midpoint stays anchored on screen.
        // Formula: new scroll = (old scroll × scaleFactor) + (midpoint offset × (scaleFactor - 1))
        const rect = el.getBoundingClientRect();
        const midRelX = pinch.startMid.x - rect.left;
        const midRelY = pinch.startMid.y - rect.top;
        const scaleFactor = newScale / pinch.startScale;

        el.scrollLeft =
          pinch.startScrollLeft * scaleFactor + midRelX * (scaleFactor - 1);
        el.scrollTop =
          pinch.startScrollTop * scaleFactor + midRelY * (scaleFactor - 1);
      });
    }

    // touchend / touchcancel: commit the final scale to React state exactly once
    function onTouchEnd(e) {
      // If a second finger is still down, the gesture is still active — wait
      if (e.touches.length >= 2) return;
      if (!pinch.active) return;

      pinch.active = false;

      const finalScale = pinch.currentScale;

      // ✅ Single setScale call per gesture — triggers exactly one React re-render
      // to sync props with what the DOM already shows visually. No visible change,
      // no flicker, but state is now correctly updated for the rest of the app.
      if (finalScale !== scaleRef.current) {
        setScale(finalScale);
        if (setZoomPercent) {
          // Display value e.g. 150 for 1.5x zoom
          setZoomPercent(Math.round(finalScale * 100));
        }
      }
    }

    // Attach all listeners. touchmove must be non-passive so e.preventDefault() works.
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Cleanup: remove listeners and cancel any in-flight animation frame on unmount
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, setScale, setZoomPercent]);
}
