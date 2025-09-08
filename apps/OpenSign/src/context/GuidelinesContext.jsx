import { createContext, useContext, useState, useCallback } from "react";

const GuidelinesContext = createContext();

export const GuidelinesProvider = ({ children }) => {
  const [guideline, setGuideline] = useState({
    show: false,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0
  });

  const showGuidelines = useCallback((show, x, y, width, height) => {
    if (show) {
      setGuideline({
        show: true,
        x1: x,
        x2: x + width - 1.5,
        y1: y,
        y2: y + height - 1
      });
    } else {
      setGuideline((prev) => ({ ...prev, show: false }));
    }
  }, []);

  return (
    <GuidelinesContext.Provider value={{ guideline, showGuidelines }}>
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
