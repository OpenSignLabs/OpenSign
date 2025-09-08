import React from "react";
import { showUpgradeProgress } from "./upgradeProgress";

export function lazyWithRetry(factory) {
  return React.lazy(() =>
    factory().catch((error) => {
      if (
        error &&
        error.message &&
        /Failed to fetch dynamically imported module/.test(error.message)
      ) {
        localStorage.setItem("showUpgradeProgress", "1");
        showUpgradeProgress();
        setTimeout(() => window.location.reload(), 100);
      }
      throw error;
    })
  );
}
