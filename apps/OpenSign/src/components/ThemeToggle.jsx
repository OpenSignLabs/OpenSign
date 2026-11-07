import { useEffect, useState } from "react";
import Parse from "parse";
import { applyTheme } from "../utils/theme";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "opensigndark");
    } else {
      document.documentElement.setAttribute("data-theme", "opensigncss");
    }
  }, []);

  const handleChange = async () => {
    const newTheme = !isDark;
    const theme = newTheme ? "dark" : "light";
    setIsDark(newTheme);
    applyTheme(theme);
    if (Parse.User.current()) {
      try {
        await Parse.Cloud.run("updatepreferences", { Theme: theme });
      } catch (err) {
        // The theme still applies on this device; it can be saved on the next change.
        console.error("Error saving theme preference: ", err);
      }
    }
  };

  return (
    <>
      <input
        id="dark-mode-toggle"
        type="checkbox"
        className="op-toggle transition-all checked:bg-white"
        checked={isDark}
        onChange={handleChange}
      />
    </>
  );
};

export default ThemeToggle;
