import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

const PageScrollContainer = ({ children }) => {
  const { pathname } = useLocation();
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    // Reset before paint, not after a lazy page finishes loading.
    scrollRef.current.scrollTop = 0;
    scrollRef.current.scrollLeft = 0;
  }, [pathname]);

  return (
    <main
      id="renderList"
      ref={scrollRef}
      className="os-page-scroll flex-1 min-w-0 min-h-0 overflow-auto"
    >
      {children}
    </main>
  );
};

export default PageScrollContainer;
