// FullScreenButton.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const FullScreenButton = () => {
  const { t } = useTranslation();
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, []);

  const handleFullScreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      requestFullScreen();
    }
  };

  const requestFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return (
    <div className="os-fullscreen-control flex items-center">
      <button
        type="button"
        aria-label={isFullScreen ? t("exit-fullscreen") : t("enter-fullscreen")}
        onClick={toggleFullScreen}
        className="min-h-[44px] min-w-[44px] border-0 bg-transparent p-0 text-sm text-base-content"
      >
        {isFullScreen ? (
          <i className="fa-light fa-compress"></i>
        ) : (
          <i className="fa-light fa-maximize"></i>
        )}
      </button>
    </div>
  );
};

export default FullScreenButton;
