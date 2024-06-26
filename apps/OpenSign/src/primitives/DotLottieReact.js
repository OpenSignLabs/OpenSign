import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Loader from "./Loader";

const LottieWithLoader = ({
  src = "https://lottie.host/00a72a09-f2d4-493a-9b2d-2843bf067638/Ic7jJ44wLJ.json",
  minLoaderTime = 1000,
  timeout = 10000
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [animationSrc, setAnimationSrc] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasError(true);
    }, timeout);

    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);
        setAnimationSrc(objectURL);
        setTimeout(() => {
          setIsLoaded(true);
        }, minLoaderTime);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setHasError(true);
      });

    return () => clearTimeout(timer);
  }, [src, minLoaderTime, timeout]);

  return (
    <div>
      {!isLoaded && !hasError && (
        <div className="loader">
          {" "}
          <Loader />
        </div>
      )}
      {hasError && <div className="error">Failed to load animation</div>}
      {isLoaded && animationSrc && (
        <DotLottieReact
          src={animationSrc}
          loop
          autoplay
          style={{ display: "block" }}
        />
      )}
    </div>
  );
};

export default LottieWithLoader;
