import React, {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect
} from "react";
import { Document, Page } from "react-pdf";
import {
  defaultWidthHeight,
  generateId,
  getContainerScale,
  handleWidgetResize,
  handleSignYourselfWidgetResize,
  isMobile,
  randomId,
  textInputWidget,
  textWidget,
  pendingButtonZoomScrollRef
} from "../../constant/Utils";
import Placeholder from "./Placeholder";
import Alert from "../../primitives/Alert";
import { useTranslation } from "react-i18next";
import usePdfPinchZoom from "../../hook/usePdfPinchZoom";
import useMobilePdfHeight from "../../hook/useMobilePdfHeight";
import { useDispatch, useSelector } from "react-redux";
import Guidelines from "./Guidelines";
import CanvasGuidelines from "./CanvasGuidelines";
import { useGuidelinesContext } from "../../context/GuidelinesContext";
import { toggleSidebar } from "../../redux/reducers/sidebarReducer";
import DragGuidelinesLayer from "./DragGridLinesLayer";
import { useDrop } from "react-dnd";
import WidgetsDragPreview from "./WidgetsDragPreview";
import { useScroll } from "../../context/ScrollPdfContext";
import useWidgetAreaSelection from "../../hook/useWidgetAreaSelection";

function RenderPdf(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showGuidelines, showCanvasGuidelines } = useGuidelinesContext();
  // Ref to store per-page DOM elements for scroll-based page tracking & scroll
  const pageRefs = useRef({});
  // Ref to defer DnD drops that land on a page different from the current one
  const pendingDropRef = useRef(null);
  // Ref to suppress scroll-handler updates during programmatic scrolling
  const isScrollingToPage = useRef(false);
  // Stores the page number most recently set BY the scroll handler. The
  // page-change effect compares props.pageNumber against this value to detect
  // whether the change came from scrolling (skip programmatic scroll) or from
  // an external action like a thumbnail/chevron click (do programmatic scroll).
  // Using a page-number value instead of a boolean flag avoids a stuck-true
  // scenario: when React bails out of setPageNumber because the value hasn't
  // changed, no re-render fires and a boolean flag would never get reset.
  const lastScrollSetPage = useRef(null);
  // Ref tracking the last detected page – used to narrow the per-scroll scan
  const lastBestPage = useRef(1);
  // Pending requestAnimationFrame id for scroll throttling (null = none pending)
  const scrollRafId = useRef(null);
  const widgetClipboardRef = useRef(null);
  const pasteTargetRef = useRef(null);
  const { scrollRef } = useScroll();
  // Internal count of total pages (set from Document onLoadSuccess)
  const [allPagesCount, setAllPagesCount] = useState(0);
  const isWidgetDrop = useRef(false);
  const [, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => {
      isWidgetDrop.current = true;
      setTimeout(() => {
        isWidgetDrop.current = false;
      }, 600);
      const offset = monitor.getClientOffset();
      // Multi-page: detect target page and swap #container to it
      if (allPagesCount > 1 && offset) {
        let targetPage = props.pageNumber;
        for (let i = 1; i <= allPagesCount; i++) {
          const el = pageRefs.current[i];
          if (el) {
            const rect = el.getBoundingClientRect();
            if (offset.y >= rect.top && offset.y <= rect.bottom) {
              targetPage = i;
              break;
            }
          }
        }
        if (targetPage !== props.pageNumber && props.setPageNumber) {
          // Defer: store drop info, update page, handle in useEffect
          props.setPageNumber(targetPage);
          pendingDropRef.current = {
            item,
            offset: { ...offset },
            targetPage
          };
          showGuidelines(false);
          return;
        }
      }
      props?.addPositionOfSignature(item, monitor);
      showGuidelines(false);
    }
  });

  // Handle deferred DnD drops after pageNumber updates
  useEffect(() => {
    if (pendingDropRef.current) {
      const { item, offset, targetPage } = pendingDropRef.current;
      pendingDropRef.current = null;
      // Swap #container to the target page element so the parent's
      // document.getElementById("container") picks up the correct rect
      const prevContainer = document.getElementById("container");
      const pageEl = pageRefs.current[targetPage];
      if (prevContainer) prevContainer.removeAttribute("id");
      if (pageEl) pageEl.id = "container";
      const mockMonitor = {
        getClientOffset: () => offset,
        getSourceClientOffset: () => offset,
        type: item?.text || "BOX"
      };
      props?.addPositionOfSignature(item, mockMonitor);
      // Restore: remove id from pageEl, React will reconcile on next render
      if (pageEl) pageEl.removeAttribute("id");
      if (prevContainer) prevContainer.id = "container";
      showGuidelines(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageNumber]);

  const [scaledHeight, setScaledHeight] = useState();
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");
  const isLoadRoute = window.location.pathname.startsWith("/load/");
  const scrollTriggerId = useSelector((state) => state.widget.scrollTriggerId);
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const pdfContainerRef = useRef(null);
  const usesFlatWidgetPositions = props.isSignYourself && !props.isSelfSign;
  const widgetAreaSelection = useWidgetAreaSelection({
    enabled: Boolean(
      !isMobile &&
      !props.pdfRequest &&
      !props.pdfDetails?.[0]?.IsCompleted &&
      !props.isDragging &&
      props.handleDeleteWidget &&
      (props.placeholder || props.isSelfSign || props.isSignYourself) &&
      (usesFlatWidgetPositions ? props.setXyPosition : props.setSignerPos)
    ),
    containerRef: pdfContainerRef,
    positions: usesFlatWidgetPositions ? props.xyPosition : props.signerPos,
    setPositions: usesFlatWidgetPositions
      ? props.setXyPosition
      : props.setSignerPos,
    nested: !usesFlatWidgetPositions,
    scale: props.scale || 1,
    clearActiveWidget: props.setCurrWidgetsDetails
  });
  const mobileHeight = useMobilePdfHeight(
    scrollRef,
    scaledHeight,
    isMobile && props.placeholder && !isGuestSigner
  );

  useEffect(() => {
    const canCopyWidgets =
      props.placeholder ||
      props.isSelfSign ||
      (props.isSignYourself && !props.pdfDetails?.[0]?.IsCompleted);
    const widgetPositions = props.isSignYourself
      ? props.xyPosition
      : props.signerPos;
    const setWidgetPositions = props.isSignYourself
      ? props.setXyPosition
      : props.setSignerPos;
    if ((!canCopyWidgets && !props.handleDeleteWidget) || !setWidgetPositions)
      return undefined;

    const isTextInput = (target) => {
      const element = target instanceof Element ? target : null;
      return Boolean(
        element?.closest("input, textarea, select, [contenteditable='true']")
      );
    };

    const findWidget = (key) => {
      for (const signer of widgetPositions || []) {
        if (signer?.placeHolder) {
          for (const page of signer.placeHolder) {
            const widget = (page.pos || []).find((item) => item?.key === key);
            if (widget) {
              return { signer, page, widget };
            }
          }
        } else if (signer?.pos) {
          const widget = signer.pos.find((item) => item?.key === key);
          if (widget) return { page: signer, widget };
        }
      }
      return null;
    };

    const handleWidgetClipboard = (event) => {
      if (event.defaultPrevented || isTextInput(event.target)) return;

      if (event.key === "Delete" && props.handleDeleteWidget) {
        const selectedKey = props.currWidgetsDetails?.key;
        const location = selectedKey && findWidget(selectedKey);
        if (!location) return;

        event.preventDefault();
        props.handleDeleteWidget(
          selectedKey,
          location.signer?.Id || null,
          location.page?.pageNumber || props.currWidgetsDetails?.pageNumber
        );
        props.setCurrWidgetsDetails?.({});
        return;
      }

      if (!canCopyWidgets || !event.ctrlKey) return;

      if (event.key.toLowerCase() === "c") {
        const selectedKey = props.currWidgetsDetails?.key;
        const location = selectedKey && findWidget(selectedKey);
        if (!location) return;
        if (location.widget?.type === "qes") {
          widgetClipboardRef.current = null;
          return;
        }

        event.preventDefault();
        widgetClipboardRef.current = {
          signerId: location.signer?.Id,
          signerObjId: location.signer?.signerObjId,
          widget: location.widget
        };
        return;
      }

      if (event.key.toLowerCase() !== "v" || !widgetClipboardRef.current)
        return;

      event.preventDefault();
      const clipboard = widgetClipboardRef.current;
      if (clipboard.widget?.type === "qes") {
        widgetClipboardRef.current = null;
        return;
      }
      const selectedSignerId =
        props.uniqueId ||
        props.currWidgetsDetails?.signerId ||
        clipboard.signerId;
      const selectedSigner = props.uniqueId
        ? (widgetPositions || []).find((item) => item?.Id === props.uniqueId)
        : null;
      const signer =
        selectedSigner ||
        (widgetPositions || []).find(
          (item) =>
            item?.Id === selectedSignerId ||
            item?.signerObjId === clipboard.signerObjId
        );

      if (signer?.placeHolder) {
        const pages = signer.placeHolder;
        const pasteTarget = pasteTargetRef.current;
        const targetPageNumber =
          pasteTarget?.pageNumber || props.pageNumber || 1;
        const targetPage = pages.find(
          (page) => page.pageNumber === targetPageNumber
        );
        const widgetCount = pages.reduce(
          (count, page) =>
            count +
            (page.pos || []).filter(
              (item) => item?.type === clipboard.widget.type
            ).length,
          0
        );
        const pastedWidget = {
          ...clipboard.widget,
          ...(pasteTarget
            ? {
                xPosition: pasteTarget.xPosition,
                yPosition: pasteTarget.yPosition
              }
            : {}),
          key: randomId(),
          zIndex:
            pages
              .flatMap((page) => page.pos || [])
              .reduce(
                (max, item) => Math.max(max, Number(item?.zIndex) || 0),
                0
              ) + 1,
          options: {
            ...clipboard.widget.options,
            name: `${clipboard.widget.type}-${generateId(6)}-${widgetCount + 1}`
          }
        };
        const updatedPages = targetPage
          ? pages.map((page) =>
              page.pageNumber === targetPageNumber
                ? { ...page, pos: [...(page.pos || []), pastedWidget] }
                : page
            )
          : [...pages, { pageNumber: targetPageNumber, pos: [pastedWidget] }];
        setWidgetPositions(
          widgetPositions.map((item) =>
            item.Id === signer.Id
              ? { ...item, placeHolder: updatedPages }
              : item
          )
        );
        props.setCurrWidgetsDetails?.({
          ...pastedWidget,
          pageNumber: targetPageNumber
        });
        pasteTargetRef.current = null;
        return;
      }

      const pasteTarget = pasteTargetRef.current;
      const targetPageNumber = pasteTarget?.pageNumber || props.pageNumber || 1;
      const targetPage = (widgetPositions || []).find(
        (page) => page.pageNumber === targetPageNumber
      );
      const pastedWidget = {
        ...clipboard.widget,
        ...(pasteTarget
          ? {
              xPosition: pasteTarget.xPosition,
              yPosition: pasteTarget.yPosition
            }
          : {}),
        key: randomId(),
        options: {
          ...clipboard.widget.options,
          name: `${clipboard.widget.type}-${generateId(6)}-1`
        }
      };
      const updatedPages = targetPage
        ? widgetPositions.map((page) =>
            page.pageNumber === targetPageNumber
              ? { ...page, pos: [...(page.pos || []), pastedWidget] }
              : page
          )
        : [
            ...(widgetPositions || []),
            { pageNumber: targetPageNumber, pos: [pastedWidget] }
          ];
      setWidgetPositions(updatedPages);
      props.setCurrWidgetsDetails?.({
        ...pastedWidget,
        pageNumber: targetPageNumber
      });
      pasteTargetRef.current = null;
    };

    window.addEventListener("keydown", handleWidgetClipboard);
    return () => window.removeEventListener("keydown", handleWidgetClipboard);
  }, [
    props.currWidgetsDetails,
    props.handleDeleteWidget,
    props.isSelfSign,
    props.isSignYourself,
    props.pageNumber,
    props.pdfDetails,
    props.placeholder,
    props.setCurrWidgetsDetails,
    props.setSignerPos,
    props.setXyPosition,
    props.signerPos,
    props.uniqueId,
    props.xyPosition
  ]);

  // Refs for drawing Text Input widget — avoids re-rendering the full tree on
  // every pointermove event. Only isDrawing (a boolean) is kept in React state
  // so that the overlay div is mounted/unmounted; coordinates are stored in
  // refs and the overlay style is updated imperatively via drawingOverlayRef.
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef(null);
  const drawEndRef = useRef(null);
  const drawingOverlayRef = useRef(null);
  // Ref flag to suppress the click event that fires after pointerup when a
  // widget was just drawn, preventing the Document onClick from deselecting it.
  const justDrewRef = useRef(false);

  useEffect(() => {
    dispatch(toggleSidebar(false));
    return () => {
      dispatch(toggleSidebar(true));
    };
  }, []);

  // enable pinch to zoom only on actual pdf wrapper
  usePdfPinchZoom(scrollRef, props.scale, props.setScale, props.setZoomPercent);

  //handle auto scroll top when zoom from last page
  useLayoutEffect(() => {
    const el = scrollRef?.current;

    if (!el || !pendingButtonZoomScrollRef.current) return;

    const { newScrollLeft, newScrollTop } = pendingButtonZoomScrollRef.current;

    // Clamp values (important for last page issue)
    const maxScrollTop = el.scrollHeight - el.clientHeight;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    el.scrollTop = Math.min(newScrollTop, maxScrollTop);
    el.scrollLeft = Math.min(newScrollLeft, maxScrollLeft);

    // ✅ Clear after applying (VERY IMPORTANT)
    pendingButtonZoomScrollRef.current = null;
  }, [props.scale]); // 🔥 MUST depend on scale

  // Scroll-based page tracking: determine the most visible page on each scroll.
  // This replaces IntersectionObserver which had stale-closure and stale-ratio
  // bugs that caused pageNumber to get stuck (especially failing to return to
  // page 1 after scrolling away and back).
  useEffect(() => {
    if (allPagesCount <= 1 || !props.setPageNumber) return;
    const scrollerEl = scrollRef.current;
    // Before a mobile viewport height is known, the window is the scroller.
    const mobileNoScroll = isMobile && !isGuestSigner && !mobileHeight;
    if (!mobileNoScroll && !scrollerEl) return;

    const computeCurrentPage = () => {
      if (isScrollingToPage.current) return;
      const viewportTop = mobileNoScroll
        ? 0
        : scrollerEl.getBoundingClientRect().top;
      const viewportBottom = mobileNoScroll
        ? window.innerHeight
        : scrollerEl.getBoundingClientRect().bottom;

      let maxVisible = 0;
      let bestPage = null;

      // Start the scan a couple of pages before the last known page so that
      // fast upward scrolls are still caught, while avoiding a full O(n) walk.
      const startPage = Math.max(1, lastBestPage.current - 2);
      for (let i = startPage; i <= allPagesCount; i++) {
        const el = pageRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Pages entirely below the viewport cannot be the best – stop early.
        if (rect.top > viewportBottom) break;
        const visibleTop = Math.max(rect.top, viewportTop);
        const visibleBottom = Math.min(rect.bottom, viewportBottom);
        const visible = Math.max(0, visibleBottom - visibleTop);
        if (visible > maxVisible) {
          maxVisible = visible;
          bestPage = i;
        }
      }

      // If the primary scan found nothing (e.g. after a programmatic jump to
      // a much earlier page that left lastBestPage stale), fall back to a
      // scan from page 1 up to startPage-1 so no page is missed.
      if (!bestPage && startPage > 1) {
        for (let i = 1; i < startPage; i++) {
          const el = pageRefs.current[i];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top > viewportBottom) break;
          const visibleTop = Math.max(rect.top, viewportTop);
          const visibleBottom = Math.min(rect.bottom, viewportBottom);
          const visible = Math.max(0, visibleBottom - visibleTop);
          if (visible > maxVisible) {
            maxVisible = visible;
            bestPage = i;
          }
        }
      }

      if (bestPage) {
        lastBestPage.current = bestPage;
        // Record the page number scroll is setting so the page-change effect
        // can distinguish this from an external (button/thumbnail) navigation.
        lastScrollSetPage.current = bestPage;
        // React bails out if the value hasn't changed, so no unnecessary
        // re-renders when calling setPageNumber with the same value.
        props.setPageNumber(bestPage);
      }
    };

    // Throttle via rAF: at most one computeCurrentPage per animation frame.
    const handleScroll = () => {
      if (scrollRafId.current !== null) return;
      scrollRafId.current = requestAnimationFrame(() => {
        scrollRafId.current = null;
        computeCurrentPage();
      });
    };

    const scrollTarget = mobileNoScroll ? window : scrollerEl;
    scrollTarget.addEventListener("scroll", handleScroll, {
      passive: true
    });
    // Run once on setup to set the correct initial page
    computeCurrentPage();
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (scrollRafId.current !== null) {
        cancelAnimationFrame(scrollRafId.current);
        scrollRafId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPagesCount, props.pdfLoad, mobileHeight]);

  // Scroll to a specific page when pageNumber changes externally (e.g. thumbnail click)
  const prevPageRef = useRef(props.pageNumber);
  useEffect(() => {
    if (isWidgetDrop?.current === true) {
      prevPageRef.current = props?.pageNumber || 1;
      lastScrollSetPage.current = props?.pageNumber || 1;
      return;
    }
    // Detect whether this page change came from the scroll handler. If the new
    // pageNumber matches what scroll last set, this is a scroll-driven update
    // and we must NOT programmatically scroll (that would set isScrollingToPage
    // and suppress the next ~600 ms of scroll events).
    const wasFromScroll = props.pageNumber === lastScrollSetPage.current;

    // Only programmatically scroll when the page change was triggered by an
    // external action (thumbnail / chevron button) — NOT by the scroll handler
    // itself. Scrolling when the change already came from scrolling would set
    // isScrollingToPage=true and suppress the next ~600ms of scroll events.
    if (
      allPagesCount > 1 &&
      props.pageNumber !== prevPageRef.current &&
      !isScrollingToPage.current &&
      !wasFromScroll
    ) {
      const el = pageRefs.current[props.pageNumber];
      const sb = scrollRef.current;
      if (el && sb) {
        isScrollingToPage.current = true;
        const targetPage = props.pageNumber;
        const targetTop = el.offsetTop;
        smoothScrollTo(targetTop);
        setTimeout(() => {
          isScrollingToPage.current = false;
          // Update lastScrollSetPage to the page we just programmatically
          // scrolled to. Without this, lastScrollSetPage retains whatever page
          // the scroll handler last detected (e.g. page 3 after manual scroll)
          // and future button navigations back to that same page would be
          // incorrectly treated as scroll-driven and silently skipped.
          lastScrollSetPage.current = targetPage;
        }, 600);
      }
    }
    prevPageRef.current = props.pageNumber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageNumber, allPagesCount]);

  // handle signature block width and height according to screen
  const posWidth = (pos, pageNum) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      pageNum || props.pageNumber,
      props.containerWH
    );
    const defaultWidth = defaultWidthHeight(pos.type).width;
    const posWidth = pos.Width ? pos.Width : defaultWidth;
    return posWidth * containerScale;
  };
  const posHeight = (pos, pageNum) => {
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      pageNum || props.pageNumber,
      props.containerWH
    );
    const posHeight = pos.Height || defaultWidthHeight(pos.type).height;
    return posHeight * containerScale;
  };

  // `smoothScrollTo` is used to provide smooth scrolling while focus on widget
  const smoothScrollTo = (targetY, duration = 500) => {
    const sb = scrollRef.current;
    if (!sb) return;

    // On non-guest mobile the outer div has full content height (no overflow).
    // In that case the window is the effective scroll container, so we must
    // use window.scrollTo to actually move the viewport.
    const isContainerScrollable = sb.scrollHeight > sb.clientHeight;
    const start = isContainerScrollable ? sb.scrollTop : window.scrollY;
    // For window scroll, targetY is a div-relative offset; convert to absolute.
    const absoluteTarget = isContainerScrollable
      ? targetY
      : sb.getBoundingClientRect().top + window.scrollY + targetY;
    const change = absoluteTarget - start;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeInOutQuad
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const scrollPos = start + change * ease;
      if (isContainerScrollable) {
        sb.scrollTo(sb.scrollLeft, scrollPos);
      } else {
        window.scrollTo(0, scrollPos);
      }
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // `scrollToTarget` is used to focus on widget and scroll to top
  const scrollToTarget = useCallback(() => {
    // Get the scrollbar container ref
    const sb = scrollRef.current;
    // If there's no content element or no widget details, bail out
    if (!sb || !props.currWidgetsDetails) return;
    if (props?.scale > 1) return;
    // Use the widget's own page number when available; fall back to the
    // globally active page. Using props.pageNumber alone is wrong for
    // multi-page PDFs because the user may have scrolled to a different
    // page since the widget was placed.
    const widgetPage = props.currWidgetsDetails?.pageNumber ?? props.pageNumber;
    // The absolute Y position (relative to the document) where we want to scroll
    const yPosition = props?.currWidgetsDetails?.yPosition || 0;
    const containerScale = getContainerScale(
      props.pdfOriginalWH,
      widgetPage,
      props.containerWH
    );

    const targetTop = yPosition * containerScale;

    // Account for the header height + a little extra padding
    // Different header height if user is a guest signer
    const headerOffset = isGuestSigner ? 10 : 79;

    // In multi-page, add the page container's offset to the scroll position
    const pageEl = pageRefs.current[widgetPage];
    const pageOffset = pageEl ? pageEl.offsetTop : 0;
    const positionTop = pageOffset + targetTop - headerOffset;

    const pageIndex = widgetPage > 0 ? widgetPage - 1 : 0;
    const ogH = props.pdfOriginalWH[pageIndex]?.height;
    // Compare yPosition (PDF units) against ogH (also PDF units) to detect
    // widgets in the bottom quarter of the page. Using targetTop (pixels) vs
    // ogH (PDF units) would mix unit systems and produce incorrect results at
    // certain zoom levels.
    const isNearBottom = yPosition > ogH * 0.75;
    if (isNearBottom && !isGuestSigner) {
      smoothScrollTo(positionTop - 70);
    } else if (!isNearBottom && !isGuestSigner) {
      smoothScrollTo(positionTop - 80);
    } else {
      smoothScrollTo(positionTop);
    }

    // Highlight only the target widget; reset others to default border
    document.querySelectorAll(".signYourselfBlock").forEach((w) => {
      w.style.border =
        w.id === String(scrollTriggerId)
          ? "1.5px solid red" // active widget in red
          : "1.5px solid #007bff"; // others in blue
    });
  }, [
    scrollTriggerId,
    props.currWidgetsDetails?.yPosition,
    props.isShowModal,
    props.pdfOriginalWH,
    props.pageNumber
  ]);

  useLayoutEffect(() => {
    // Whenever scrollTriggerId changes, fire off the scroll in the next rAF
    // to ensure the DOM has painted/layout is stable before scrolling
    if (scrollTriggerId) {
      scrollToTarget();
    }
    // scrollToTarget is intentionally omitted: we only scroll once when
    // scrollTriggerId changes. Including it causes a cascade where pageNumber
    // updates during the animation re-trigger the scroll, sending the PDF all
    // the way to the last page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTriggerId]);

  // calculate render height of pdf in mobile view
  const handlePageLoadSuccess = (page) => {
    if (isMobile) {
      const containerWidth = props.divRef.current.offsetWidth; // Get container width
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width; // Scale to fit container width
      const scaleHeight = viewport.height * scale;
      requestAnimationFrame(() => {
        const renderedPage = props.divRef.current?.querySelector(
          '[data-page-number="1"] .react-pdf__Page'
        );
        setScaledHeight(
          renderedPage?.getBoundingClientRect().height || scaleHeight
        );
      });
    }
  };

  const canDrawTextWidget =
    (props.placeholder || props.isSignYourself || props.isSelfSign) &&
    !props.pdfDetails?.[0]?.IsCompleted &&
    !(props.isCompleted === true || props.isCompleted?.isCertificate) &&
    !props.currWidgetsDetails?.key &&
    !props.isDragging;

  const handlePointerDown = (e) => {
    if (!canDrawTextWidget) {
      return;
    }

    // Disable drawing on mobile/touch devices to avoid conflicts with pinch-to-zoom
    if (isMobile || e.pointerType !== "mouse") {
      return;
    }

    // Don't draw if clicking on an existing widget
    if (e.target.closest(".signYourselfBlock")) {
      return;
    }

    // For multi-page: detect which page the pointer is on
    const pageContainer = e.target.closest("[data-page-number]");
    const drawPageNum = pageContainer
      ? parseInt(pageContainer.dataset.pageNumber, 10)
      : props.pageNumber;

    // Use outer container for overlay coordinates (overlay is in outer container)
    const outerRect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - outerRect.left;
    const y = e.clientY - outerRect.top;

    // Also store page-relative coordinates for widget creation
    const pageRect = pageContainer
      ? pageContainer.getBoundingClientRect()
      : outerRect;
    const pageX = e.clientX - pageRect.left;
    const pageY = e.clientY - pageRect.top;

    isDrawingRef.current = true;
    drawStartRef.current = { x, y, pageX, pageY, pageNum: drawPageNum };
    drawEndRef.current = { x, y, pageX, pageY };
    setIsDrawing(true); // single setState to mount the overlay div
  };

  //`handlePointerMove` function is used to draw text widget on pdf
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !drawStartRef.current) {
      return;
    }

    //get x and y position according to dra on pdf
    const outerRect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - outerRect.left;
    const y = e.clientY - outerRect.top;

    // Page-relative coordinates for widget creation
    const pageContainer = pageRefs.current[drawStartRef.current.pageNum];
    const pageRect = pageContainer
      ? pageContainer.getBoundingClientRect()
      : outerRect;
    const pageX = e.clientX - pageRect.left;
    const pageY = e.clientY - pageRect.top;

    drawEndRef.current = { x, y, pageX, pageY };

    // Update the overlay position directly via DOM — no setState, no re-render
    if (drawingOverlayRef.current) {
      //calculae x and y according to scale or zooom pdf
      const x_scaled = x / props?.scale;
      const y_scaled = y / props?.scale;
      const startX_scaled = drawStartRef.current.x / props?.scale;
      const startY_scaled = drawStartRef.current.y / props?.scale;

      const width = Math.abs(x_scaled - startX_scaled);
      const height = Math.abs(y_scaled - startY_scaled);
      const rectX = Math.min(startX_scaled, x_scaled);
      const rectY = Math.min(startY_scaled, y_scaled);

      const s = drawingOverlayRef.current.style;
      s.left = `${rectX}px`;
      s.top = `${rectY}px`;
      s.width = `${width}px`;
      s.height = `${height}px`;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawingRef.current || !drawStartRef.current || !drawEndRef.current) {
      isDrawingRef.current = false;
      drawStartRef.current = null;
      drawEndRef.current = null;
      setIsDrawing(false);
      return;
    }

    // Use page-relative coordinates for widget dimensions and position
    const pageWidth = Math.abs(
      drawEndRef.current.pageX - drawStartRef.current.pageX
    );
    const pageHeight = Math.abs(
      drawEndRef.current.pageY - drawStartRef.current.pageY
    );

    // Only create widget if the drawn area is large enough (minimum 30x20 pixels)
    if (pageWidth > 30 && pageHeight > 20) {
      const drawPageNum = drawStartRef.current.pageNum;
      const containerScale = getContainerScale(
        props.pdfOriginalWH,
        drawPageNum,
        props.containerWH
      );

      const rectX = Math.min(
        drawStartRef.current.pageX,
        drawEndRef.current.pageX
      );
      const rectY = Math.min(
        drawStartRef.current.pageY,
        drawEndRef.current.pageY
      );

      // Convert pixel coordinates to PDF coordinates
      const xPosition = rectX / (containerScale * props.scale);
      const yPosition = rectY / (containerScale * props.scale);
      const widgetWidth = pageWidth / (containerScale * props.scale);
      const widgetHeight = pageHeight / (containerScale * props.scale);

      // Create a text widget at the drawn position.
      if (props.addPositionOfSignature) {
        // If drawing on a different page, update pageNumber first
        if (drawPageNum !== props.pageNumber && props.setPageNumber) {
          props.setPageNumber(drawPageNum);
        }
        const type =
          props.isSignYourself ||
          props.isSelfSign ||
          props?.roleName === "prefill"
            ? textWidget
            : textInputWidget;
        const textInputItem = { text: type, type: "BOX" };

        const monitor = {
          type: type,
          getClientOffset: () => ({ x: rectX, y: rectY }),
          getSourceClientOffset: () => ({ x: rectX, y: rectY })
        };

        props.addPositionOfSignature(textInputItem, monitor, {
          pageNumber: drawPageNum,
          customPosition: {
            xPosition,
            yPosition,
            width: widgetWidth,
            height: widgetHeight
          }
        });
        // Mark that a widget was just drawn so the subsequent click event
        // does not deselect it via the Document onClick handler.
        justDrewRef.current = true;
      }
    }

    // Reset drawing state
    isDrawingRef.current = false;
    drawStartRef.current = null;
    drawEndRef.current = null;
    setIsDrawing(false); // single setState to unmount the overlay div
  };

  // Helper: render widgets for a specific page number.
  // Creates per-page bound posWidth/posHeight so getContainerScale uses the
  // correct page, and filters widget data by that page.
  const renderWidgetsForPage = (pageNum) => {
    if (
      props.pdfLoad === false ||
      !props.containerWH?.width ||
      !props.pdfOriginalWH?.length
    )
      return null;

    const pagePosWidth = (pos) => posWidth(pos, pageNum);
    const pagePosHeight = (pos) => posHeight(pos, pageNum);
    const pageCalcFont = (pos) => {
      const w = pagePosWidth(pos);
      const h = pagePosHeight(pos);
      if (h === w || h < w) return `${h / 5}px`;
      else if (w < h) return `${w / 10}px`;
    };

    if (props.pdfRequest || props.isSelfSign) {
      // request sign, guest sign,
      return props.signerPos?.map((data, key) => {
        let checkSign = props.signedSigners
          ? props.signedSigners.filter(
              (sign) =>
                sign?.Id === data?.Id || sign?.objectId === data?.signerObjId
            )
          : [];
        return (
          checkSign.length === 0 &&
          data?.placeHolder?.map((placeData, plKey) => (
            <React.Fragment key={`${key}-${plKey}`}>
              {placeData.pageNumber === pageNum &&
                placeData.pos.map(
                  (pos, ind) =>
                    pos && (
                      <React.Fragment key={ind}>
                        <Placeholder
                          pos={pos}
                          isAreaSelected={widgetAreaSelection.isSelected(
                            pos.key,
                            data.Id,
                            pageNum
                          )}
                          handleWidgetResize={handleWidgetResize}
                          index={pageNum}
                          xyPosition={props.signerPos}
                          setXyPosition={props.setSignerPos}
                          data={data}
                          setIsResize={props.setIsResize}
                          isShowBorder={props.isSelfSign}
                          isAlllowModify={props.isAlllowModify}
                          signerObjId={props.signerObjectId}
                          isShowDropdown={true}
                          isNeedSign={props.pdfRequest}
                          isSelfSign={true}
                          isSignYourself={false}
                          posWidth={pagePosWidth}
                          posHeight={pagePosHeight}
                          isDragging={props.isDragging}
                          pdfDetails={props.pdfDetails}
                          unSignedWidgetId={props.unSignedWidgetId}
                          setCurrWidgetsDetails={props.setCurrWidgetsDetails}
                          uniqueId={props.uniqueId}
                          scale={props.scale}
                          containerWH={props.containerWH}
                          pdfOriginalWH={props.pdfOriginalWH}
                          pageNumber={pageNum}
                          ispublicTemplate={props.ispublicTemplate}
                          handleUserDetails={props.handleUserDetails}
                          isResize={props.isResize}
                          handleTabDrag={props.handleTabDrag}
                          handleStop={props.handleStop}
                          setUniqueId={props.setUniqueId}
                          setIsSelectId={props.setIsSelectId}
                          handleDeleteWidget={props.handleDeleteWidget}
                          setIsPageCopy={props.setIsPageCopy}
                          handleTextSettingModal={props.handleTextSettingModal}
                          handleCellSettingModal={props.handleCellSettingModal}
                          setIsCheckbox={props.setIsCheckbox}
                          isFreeResize={props.isSelfSign ? true : false}
                          isOpenSignPad={true}
                          assignedWidgetId={props.assignedWidgetId}
                          setCellCount={props.setCellCount}
                          setFontSize={props.setFontSize}
                          fontSize={props.fontSize}
                          fontColor={props.fontColor}
                          setFontColor={props.setFontColor}
                          setIsReqSignTourDisabled={
                            props.setIsReqSignTourDisabled
                          }
                          calculateFontsize={pageCalcFont}
                          currWidgetsDetails={props?.currWidgetsDetails}
                          handleNameModal={props?.handleNameModal}
                          widgetPageNum={placeData.pageNumber}
                          handleClosePrefillTour={props?.handleClosePrefillTour}
                          closeWidgetTour={props?.closeWidgetTour}
                        />
                      </React.Fragment>
                    )
                )}
            </React.Fragment>
          ))
        );
      });
    } else if (props.placeholder) {
      // placeholdersign document, draft document, create template, draft template
      return props.signerPos?.map((data, ind) => (
        <React.Fragment key={ind}>
          {data?.placeHolder &&
            data?.placeHolder.map((placeData, index) => (
              <React.Fragment key={index}>
                {placeData.pageNumber === pageNum &&
                  placeData.pos.map((pos) => (
                    <React.Fragment key={pos.key}>
                      <Placeholder
                        pos={pos}
                        isAreaSelected={widgetAreaSelection.isSelected(
                          pos.key,
                          data.Id,
                          pageNum
                        )}
                        setIsPageCopy={props.setIsPageCopy}
                        handleDeleteWidget={props.handleDeleteWidget}
                        handleTabDrag={props.handleTabDrag}
                        handleStop={props.handleStop}
                        handleWidgetResize={handleWidgetResize}
                        index={pageNum}
                        xyPosition={props.signerPos}
                        setXyPosition={props.setSignerPos}
                        data={data}
                        setIsResize={props.setIsResize}
                        setShowDropdown={props.setShowDropdown}
                        isShowBorder={true}
                        isPlaceholder={true}
                        setUniqueId={props.setUniqueId}
                        handleLinkUser={props.handleLinkUser}
                        isSignYourself={false}
                        posWidth={pagePosWidth}
                        posHeight={pagePosHeight}
                        isDragging={props.isDragging}
                        setIsValidate={props.setIsValidate}
                        setIsRadio={props.setIsRadio}
                        setIsCheckbox={props.setIsCheckbox}
                        setCurrWidgetsDetails={props.setCurrWidgetsDetails}
                        handleNameModal={props.handleNameModal}
                        uniqueId={props.uniqueId}
                        handleTextSettingModal={props.handleTextSettingModal}
                        handleCellSettingModal={props.handleCellSettingModal}
                        scale={props.scale}
                        containerWH={props.containerWH}
                        pdfOriginalWH={props.pdfOriginalWH}
                        pageNumber={pageNum}
                        setIsSelectId={props.setIsSelectId}
                        fontSize={props.fontSize}
                        setFontSize={props.setFontSize}
                        setCellCount={props.setCellCount}
                        fontColor={props.fontColor}
                        setFontColor={props.setFontColor}
                        isResize={props.isResize}
                        unSignedWidgetId={props.unSignedWidgetId}
                        isFreeResize={true}
                        calculateFontsize={pageCalcFont}
                        currWidgetsDetails={props?.currWidgetsDetails}
                        setRoleName={props?.setRoleName}
                        pdfDetails={props.pdfDetails}
                        setIsReqSignTourDisabled={
                          props.setIsReqSignTourDisabled
                        }
                        widgetPageNum={placeData.pageNumber}
                        closeWidgetTour={props?.closeWidgetTour}
                        handleClosePrefillTour={props?.handleClosePrefillTour}
                      />
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
        </React.Fragment>
      ));
    } else if (!props.pdfDetails?.[0]?.IsCompleted) {
      // signyourself flow
      return props.xyPosition?.map((data, ind) => (
        <React.Fragment key={ind}>
          {data.pageNumber === pageNum &&
            data.pos.map(
              (pos, id) =>
                pos && (
                  <Placeholder
                    key={id}
                    pos={pos}
                    isAreaSelected={widgetAreaSelection.isSelected(
                      pos.key,
                      undefined,
                      pageNum
                    )}
                    setIsPageCopy={props.setIsPageCopy}
                    handleDeleteWidget={props.handleDeleteWidget}
                    handleTabDrag={props.handleTabDrag}
                    handleStop={props.handleStop}
                    handleWidgetResize={handleSignYourselfWidgetResize}
                    index={ind}
                    xyPosition={props.xyPosition}
                    setXyPosition={props.setXyPosition}
                    containerWH={props.containerWH}
                    isShowBorder={true}
                    isSignYourself={true}
                    posWidth={pagePosWidth}
                    posHeight={pagePosHeight}
                    isDragging={props.isDragging}
                    setIsCheckbox={props.setIsCheckbox}
                    setCurrWidgetsDetails={props.setCurrWidgetsDetails}
                    handleTextSettingModal={props.handleTextSettingModal}
                    handleCellSettingModal={props.handleCellSettingModal}
                    scale={props.scale}
                    pdfOriginalWH={props.pdfOriginalWH}
                    pageNumber={pageNum}
                    fontSize={props.fontSize}
                    setFontSize={props.setFontSize}
                    fontColor={props.fontColor}
                    setFontColor={props.setFontColor}
                    isResize={props.isResize}
                    setIsResize={props.setIsResize}
                    isFreeResize={true}
                    isOpenSignPad={true}
                    calculateFontsize={pageCalcFont}
                    currWidgetsDetails={props?.currWidgetsDetails}
                    setIsReqSignTourDisabled={props.setIsReqSignTourDisabled}
                    unSignedWidgetId={props.unSignedWidgetId}
                    handleNameModal={props.handleNameModal}
                    widgetPageNum={data.pageNumber}
                    handleClosePrefillTour={props?.handleClosePrefillTour}
                    closeWidgetTour={props?.closeWidgetTour}
                  />
                )
            )}
        </React.Fragment>
      ));
    }
    return null;
  };

  const pdfDataBase64 = `data:application/pdf;base64,${props.pdfBase64Url}`;

  const totalPages = allPagesCount || 1;

  return (
    <>
      {props.successEmail && (
        <Alert type={"success"}>{t("success-email-alert")}</Alert>
      )}
      <div
        ref={scrollRef}
        className={isLoadRoute ? "os-pdf-load-route" : undefined}
        style={{
          position: "relative",
          boxShadow: isLoadRoute
            ? "none"
            : isGuestSigner
              ? "0 0 0 2px var(--os-stage)"
              : "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
          height: isMobile
            ? isLoadRoute
              ? scaledHeight
              : isGuestSigner
                ? window.innerHeight - 49
                : mobileHeight
            : `${window.innerHeight}px`,
          zIndex: 0,
          overflowY: "auto",
          overflowX: props.scale === 1 ? "hidden" : "auto",
          touchAction: isMobile ? "pan-x pan-y" : undefined
        }}
      >
        {/* ✅ Spacer — expands to real scaled dimensions so scrollbars work */}
        <div
          style={
            isMobile
              ? {
                  width: props.containerWH?.width * props.scale,
                  minHeight: "100%",
                  position: "relative"
                }
              : undefined
          }
        >
          <div
            data-tut={isMobile ? "reactourForth" : undefined}
            className={
              isMobile
                ? `${isGuestSigner ? "30px" : ""} border-[0.1px] border-[#ebe8e8] relative`
                : "relative"
            }
            data-pdf-transform-target
            style={{
              cursor: canDrawTextWidget ? "crosshair" : "default",
              // ✅ top left so content expands into spacer — scroll handles horizontal
              width: props.containerWH?.width,
              transform: `scale(${props?.scale || 1})`, // ✅ both platforms
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0
            }}
            ref={(node) => {
              pdfContainerRef.current = node;
              drop && drop(node);
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            {...widgetAreaSelection.handlers}
            onPointerLeave={() => {
              if (isDrawing) {
                handlePointerUp();
              }
            }}
          >
            <Document
              error={<p className="mx-2">{t("failed-to-load-refresh-page")}</p>}
              onLoadError={(e) => {
                console.log("PDF load error", e);
                props.setPdfLoad(false);
              }}
              loading={t("loading-doc")}
              onLoadSuccess={(pdf) => {
                setAllPagesCount(pdf.numPages);
                props.setPdfLoad(true);
                props.pageDetails(pdf);
              }}
              onClick={(e) => {
                if (justDrewRef.current) {
                  justDrewRef.current = false;
                  return;
                }
                // Don't deselect when clicking on a widget — widgets are now
                // inside per-page containers within <Document>, so their click
                // events bubble here. Without this guard the widget's own
                // setCurrWidgetsDetails(pos) is immediately overwritten by {}.
                if (e.target.closest(".signYourselfBlock")) return;
                const pageContainer = e.target.closest("[data-page-number]");
                if (pageContainer) {
                  const pageNumber = Number(pageContainer.dataset.pageNumber);
                  const pageRect = pageContainer.getBoundingClientRect();
                  const containerScale = getContainerScale(
                    props.pdfOriginalWH,
                    pageNumber,
                    props.containerWH
                  );
                  pasteTargetRef.current = {
                    pageNumber,
                    xPosition:
                      (e.clientX - pageRect.left) /
                      (containerScale * (props.scale || 1)),
                    yPosition:
                      (e.clientY - pageRect.top) /
                      (containerScale * (props.scale || 1))
                  };
                }
                props.setCurrWidgetsDetails && props.setCurrWidgetsDetails({});
                showGuidelines(false);
                showCanvasGuidelines(false);
              }}
              file={pdfDataBase64}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <div
                    key={pageNum}
                    ref={(el) => {
                      pageRefs.current[pageNum] = el;
                    }}
                    data-page-number={pageNum}
                    id={pageNum === props.pageNumber ? "container" : undefined}
                    className="relative"
                    style={
                      pageNum < totalPages
                        ? { marginBottom: "14px" }
                        : undefined
                    }
                  >
                    {renderWidgetsForPage(pageNum)}
                    <Page
                      key={`page_${pageNum}`}
                      onLoadSuccess={
                        pageNum === 1 ? handlePageLoadSuccess : undefined
                      }
                      width={props.containerWH.width}
                      scale={1}
                      className={
                        isMobile ? "select-none touch-callout-none" : "-z-[1]"
                      }
                      pageNumber={pageNum}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      onGetAnnotationsError={(error) => {
                        console.log("annotation error", error);
                      }}
                    />
                    {/* Guidelines are mounted on every page. Each page
                      registers its own guideline refs. showGuidelines()
                      targets the correct page via direct DOM manipulation
                      to avoid React re-renders. */}
                    <Guidelines pageNumber={pageNum} />
                  </div>
                )
              )}
            </Document>
            {/* Extra space below the last page so that widgets near the
              bottom can be scrolled above the signing modal */}
            {scrollTriggerId && (
              <div style={{ height: "70vh", pointerEvents: "none" }} />
            )}
            <DragGuidelinesLayer
              showCanvasGuidelines={showCanvasGuidelines}
              canvasContainerRef={pdfContainerRef}
              posWidth={posWidth}
              posHeight={posHeight}
              isSignYourself={props.signerPos?.length > 0 ? true : false}
              scale={props.scale}
              currWidgetsDetails={props?.currWidgetsDetails}
              pageNumber={props.pageNumber}
              containerWH={props.containerWH}
              pdfOriginalWH={props.pdfOriginalWH}
            />
            <CanvasGuidelines />
            <WidgetsDragPreview
              posWidth={posWidth}
              posHeight={posHeight}
              isSignYourself={props.signerPos?.length > 0 ? true : false}
              uniqueId={props?.uniqueId}
              data={props?.signerPos?.find((x) => x.Id === props?.uniqueId)}
              isNeedSign={props?.pdfRequest}
              pdfOriginalWH={props.pdfOriginalWH}
              pageNumber={props.pageNumber}
              containerWH={props.containerWH}
              scale={props?.scale}
              canvasContainerRef={scrollRef}
            />
            <div
              ref={widgetAreaSelection.overlayRef}
              data-widget-selection-area
              style={{
                display: "none",
                position: "absolute",
                border: "1px solid #9ca3af",
                backgroundColor: "rgba(156, 163, 175, 0.2)",
                pointerEvents: "none",
                zIndex: 9999
              }}
            />
            {widgetAreaSelection.selection && (
              <button
                type="button"
                data-widget-selection-delete
                aria-label={`${t("delete")} (${widgetAreaSelection.selection.widgets.length})`}
                className="op-btn op-btn-xs op-btn-error"
                style={{
                  position: "absolute",
                  left: widgetAreaSelection.selection.left,
                  top: Math.max(0, widgetAreaSelection.selection.top - 28),
                  zIndex: 10000
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={widgetAreaSelection.deleteSelection}
              >
                <i
                  className="fa-light fa-trash-can text-xm"
                  aria-hidden="true"
                />
                ({widgetAreaSelection.selection.widgets.length})
              </button>
            )}
            {/* Drawing rectangle overlay for Text Input widget */}
            {isDrawing && (
              <div
                ref={drawingOverlayRef}
                style={{
                  position: "absolute",
                  left: "0px",
                  top: "0px",
                  width: "0px",
                  height: "0px",
                  border: "2px dashed #007bff",
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                  pointerEvents: "none",
                  zIndex: 9999
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RenderPdf;
