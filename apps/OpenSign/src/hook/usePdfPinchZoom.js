import { useEffect, useRef } from "react";

export default function usePdfPinchZoom(ref, scale, setScale, setZoomPercent) {
  const initialDistanceRef = useRef(null);
  const startScaleRef = useRef(scale);
  const currentScaleRef = useRef(scale);
  const pinchScaleRef = useRef(null); // stores relative scale during a gesture
  const frameRef = useRef(null);

  // keep a reference to the latest scale value
  useEffect(() => {
    const element = ref.current;
    currentScaleRef.current = scale;
    // once React commits the new scale after a pinch we clear the transform
    if (element && !pinchScaleRef.current) {
      element.style.transform = "";
    }
  }, [scale, ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getDistance = (touches) => {
      const [touch1, touch2] = touches;
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialDistanceRef.current = getDistance(e.touches);
        startScaleRef.current = currentScaleRef.current;
        element.style.transformOrigin = "0 0";
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const pinchScale = newDistance / initialDistanceRef.current;
        const newScale = Math.max(1, startScaleRef.current * pinchScale);
        // store relative scale so it can be applied on top of current width
        pinchScaleRef.current = newScale / startScaleRef.current;

        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(() => {
            element.style.transform = `scale(${pinchScaleRef.current})`;
            frameRef.current = null;
          });
        }
      }
    };

    const handleTouchEnd = () => {
      if (pinchScaleRef.current) {
        let relativeScale = pinchScaleRef.current;
        const inlineTransform = element.style.transform;
        if (inlineTransform && inlineTransform.startsWith("scale(")) {
          const value = parseFloat(inlineTransform.slice(6, -1));
          if (!isNaN(value)) {
            relativeScale = value;
          }
        }
        const finalScale = Math.max(1, startScaleRef.current * relativeScale);
        const percent = parseFloat(((finalScale - 1) * 100).toFixed(2));
        const unchanged =
          Math.abs(finalScale - currentScaleRef.current) < 0.001;

        pinchScaleRef.current = null;
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        if (unchanged) {
          // if scale didn't actually change, reset transform right away
          element.style.transform = "";
        } else {
          // keep transform applied until state update reflects the new scale
          element.style.transform = `scale(${relativeScale})`;
        }

        setScale(finalScale);
        setZoomPercent(percent);

        // ensure refs reflect the latest value before next gesture starts
        currentScaleRef.current = finalScale;
        startScaleRef.current = finalScale;
      }
      initialDistanceRef.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [ref, setScale, setZoomPercent]);
}
