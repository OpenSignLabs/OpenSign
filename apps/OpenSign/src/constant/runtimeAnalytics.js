export function initializeRuntimeAnalytics(
  analytics,
  {
    tagManager,
    documentObject = document,
    windowObject = window,
    legacyGtmId = ""
  } = {}
) {
  const stateKey = "__opensignRuntimeAnalyticsState";
  const state = windowObject[stateKey] || {
    gtmIds: [],
    googleTagIds: [],
    gtagInitialized: false
  };
  windowObject[stateKey] = state;
  const gtmId = analytics.gtmId || legacyGtmId;
  if (gtmId && tagManager && !state.gtmIds.includes(gtmId)) {
    tagManager.initialize({ gtmId });
    state.gtmIds.push(gtmId);
  }

  if (!analytics.googleTagIds.length) return;

  const scriptId = "deployment-google-tag";
  if (!documentObject.getElementById(scriptId)) {
    const script = documentObject.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      analytics.googleTagIds[0]
    )}`;
    documentObject.head.appendChild(script);
  }

  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag =
    windowObject.gtag ||
    function gtag() {
      windowObject.dataLayer.push(arguments);
    };
  if (!state.gtagInitialized) {
    windowObject.gtag("js", new Date());
    state.gtagInitialized = true;
  }
  analytics.googleTagIds.forEach((tagId) => {
    if (!state.googleTagIds.includes(tagId)) {
      windowObject.gtag("config", tagId);
      state.googleTagIds.push(tagId);
    }
  });
}
