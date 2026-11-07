const THEME_ATTRIBUTES = { dark: "opensigndark", light: "opensigncss" };

// `applyTheme` is used to show a theme and remember it on this device
export const applyTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", THEME_ATTRIBUTES[theme]);
};

// `applySavedTheme` is used to show the theme saved on the user's profile. Users
// who never chose a theme have none, so they keep the theme of the current device.
export const applySavedTheme = (theme) => {
  if (theme === "dark" || theme === "light") {
    applyTheme(theme);
  }
};
