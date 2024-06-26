import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Loader from "./Loader";

const LottieWithLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [animationSrc, setAnimationSrc] = useState(null);
  const src =
    "https://lottie.host/00a72a09-f2d4-493a-9b2d-2843bf067638/Ic7jJ44wLJ.json";
  useEffect(() => {
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
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("faild to load animation of send request:", error);
        setHasError(true);
      });
  }, [src]);

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
