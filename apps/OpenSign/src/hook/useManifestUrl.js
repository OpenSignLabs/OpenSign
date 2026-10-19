import { useEffect, useMemo } from "react";

export function useManifestUrl(
  appName,
  logo,
  themeColor = "#000000",
  backgroundColor = "#ffffff"
) {
  const url = useMemo(() => {
    const start_url = window.location.origin || ".";
    const manifest = {
      short_name: appName,
      name: appName,
      start_url: start_url,
      display: "standalone",
      theme_color: themeColor,
      background_color: backgroundColor,
      ...(logo && {
        icons: [
          { src: logo, type: "image/png", sizes: "64x64 32x32 24x24 16x16" },
          { src: logo, type: "image/png", sizes: "192x192" },
          { src: logo, type: "image/png", sizes: "512x512" }
        ]
      })
    };
    const blob = new Blob([JSON.stringify(manifest)], {
      type: "application/json"
    });
    return URL.createObjectURL(blob);
  }, [appName, logo, themeColor, backgroundColor]);

  useEffect(() => {
    // cleanup when unmounting or when url changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
