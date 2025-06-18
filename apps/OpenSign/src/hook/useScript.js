import { useEffect } from "react";

/**`useScript` hook is generated script for google sign in button */
export const useScript = (url, onload) => {
  useEffect(() => {
    const script = document.createElement("script");
    //add url parameter to the script src, for load and it will remove after load in return
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = onload;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [url, onload]);
};
