import { useLayoutEffect, useState } from "react";

export default function useMobilePdfHeight(scrollRef, pageHeight, enabled) {
  const [availableHeight, setAvailableHeight] = useState();

  useLayoutEffect(() => {
    if (!enabled || !scrollRef.current) return undefined;

    const scroller = scrollRef.current;
    const navbar = document.querySelector(".os-mobile-widget-navbar");
    const viewport = window.visualViewport;
    const updateHeight = () => {
      const viewportBottom = viewport
        ? viewport.offsetTop + viewport.height
        : window.innerHeight;
      const bottom = navbar
        ? Math.min(viewportBottom, navbar.getBoundingClientRect().top)
        : viewportBottom;
      // Leave a small gap between the PDF and the fixed widget dock.
      setAvailableHeight(
        Math.max(1, bottom - scroller.getBoundingClientRect().top - 12)
      );
    };

    updateHeight();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeight)
        : null;
    observer?.observe(scroller);
    if (scroller.parentElement) observer?.observe(scroller.parentElement);
    if (navbar) observer?.observe(navbar);
    window.addEventListener("resize", updateHeight);
    window.addEventListener("scroll", updateHeight, { passive: true });
    viewport?.addEventListener("resize", updateHeight);
    viewport?.addEventListener("scroll", updateHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("scroll", updateHeight);
      viewport?.removeEventListener("resize", updateHeight);
      viewport?.removeEventListener("scroll", updateHeight);
    };
  }, [enabled, scrollRef]);

  if (!enabled || availableHeight === undefined) return pageHeight;
  return Math.min(pageHeight ?? availableHeight, availableHeight);
}
