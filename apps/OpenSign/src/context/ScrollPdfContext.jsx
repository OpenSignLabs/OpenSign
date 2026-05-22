import { createContext, useContext, useRef } from "react";

const ScrollContext = createContext(null);

export const ScrollProvider = ({ children }) => {
  const scrollRef = useRef(null);

  return (
    <ScrollContext.Provider value={{ scrollRef }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => useContext(ScrollContext);