import { useState, useEffect } from 'react';

type Size = { width: number; height: number; };

/**
 * useSize
 * @param ref React ref object pointing to a DOM element
 * @returns current size of that element: { width, height }
 */
export function useElSize(ref: React.RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initialize size
    setSize({
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    // Watch for resize
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}