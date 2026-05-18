import { createContext, useContext, useRef, useCallback, useMemo } from "react";

const GuidelinesContext = createContext();

export const GuidelinesProvider = ({ children }) => {
  // Per-page refs: { [pageNum]: { top, bottom, left, right } }
  // Each page mounts its own <Guidelines> and registers its DOM elements here.
  // This avoids React state updates (and the resulting re-renders of the entire
  // component tree) on every drag/resize pixel movement.
  const guideRefs = useRef({});
  // Track which page's guidelines are currently visible so we can hide them
  const activePageRef = useRef(null);

  // Canvas-level refs: single set of guideline DOM elements that live in the
  // main scroll container (not inside any page div). Used by DragGridLinesLayer
  // when dragging widgets from the side panel so gridlines seamlessly span
  // across page boundaries and perfectly track the drag preview.
  const canvasGuideRefs = useRef({});

  // Per-page guidelines – used by Placeholder for on-page widget drag/resize
  const showGuidelines = useCallback(
    (show, x, y, width, height, targetPage) => {
      if (!show) {
        // Explicitly hiding: hide whatever is active
        if (
          activePageRef.current != null &&
          guideRefs.current[activePageRef.current]
        ) {
          const prev = guideRefs.current[activePageRef.current];
          if (prev.top) prev.top.style.display = "none";
          if (prev.bottom) prev.bottom.style.display = "none";
          if (prev.left) prev.left.style.display = "none";
          if (prev.right) prev.right.style.display = "none";
        }
        activePageRef.current = null;
        return;
      }

      // Check if target page's refs are available before hiding old ones.
      // This prevents guidelines from disappearing when the target page
      // can't be resolved (e.g. cursor between pages during drag-from-panel).
      const refs = guideRefs.current[targetPage];
      if (!refs || !refs.top || !refs.bottom || !refs.left || !refs.right)
        return;

      // Hide the previously active page's guidelines when switching pages
      if (
        activePageRef.current != null &&
        activePageRef.current !== targetPage &&
        guideRefs.current[activePageRef.current]
      ) {
        const prev = guideRefs.current[activePageRef.current];
        if (prev.top) prev.top.style.display = "none";
        if (prev.bottom) prev.bottom.style.display = "none";
        if (prev.left) prev.left.style.display = "none";
        if (prev.right) prev.right.style.display = "none";
      }

      refs.top.style.display = "";
      refs.bottom.style.display = "";
      refs.left.style.display = "";
      refs.right.style.display = "";
      refs.top.style.top = `${y}px`;
      refs.bottom.style.top = `${y + height - 1}px`;
      refs.left.style.left = `${x}px`;
      refs.right.style.left = `${x + width - 1.5}px`;

      activePageRef.current = targetPage;
    },
    []
  );

  // Canvas-level guidelines – used by DragGridLinesLayer for panel drags.
  // These live outside page divs so they seamlessly span page boundaries.
  const showCanvasGuidelines = useCallback((show, x, y, width, height) => {
    const refs = canvasGuideRefs.current;
    if (!refs.top || !refs.bottom || !refs.left || !refs.right) return;

    if (!show) {
      refs.top.style.display = "none";
      refs.bottom.style.display = "none";
      refs.left.style.display = "none";
      refs.right.style.display = "none";
      return;
    }

    refs.top.style.display = "";
    refs.bottom.style.display = "";
    refs.left.style.display = "";
    refs.right.style.display = "";
    refs.top.style.top = `${y}px`;
    refs.bottom.style.top = `${y + height - 1}px`;
    refs.left.style.left = `${x}px`;
    refs.right.style.left = `${x + width - 1.5}px`;
  }, []);

  // Memoize the context value so it never changes, preventing consumer re-renders
  const value = useMemo(
    () => ({
      guideRefs,
      showGuidelines,
      canvasGuideRefs,
      showCanvasGuidelines
    }),
    [showGuidelines, showCanvasGuidelines]
  );

  return (
    <GuidelinesContext.Provider value={value}>
      {children}
    </GuidelinesContext.Provider>
  );
};

export const useGuidelinesContext = () => {
  const context = useContext(GuidelinesContext);
  if (!context) {
    throw new Error(
      "useGuidelinesContext must be used within a GuidelinesProvider"
    );
  }
  return context;
};
