import { useEffect, useState } from "react";
import Parse from "parse";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // First, try to get theme from server
        const extUser = JSON.parse(
          localStorage.getItem("Extand_Class") || "[]"
        )?.[0];
        
        let themeValue = null;
        
        // If user is authenticated, fetch theme from database
        if (Parse.User.current()) {
          try {
            const userDetails = await Parse.Cloud.run("getUserDetails");
            themeValue = userDetails?.get?.("Theme") || userDetails?.Theme;
          } catch (e) {
            console.warn("Could not fetch theme from server:", e);
          }
        }
        
        // Fall back to localStorage if no server theme found
        if (!themeValue) {
          themeValue = localStorage.getItem("theme");
        }
        
        const isDarkMode = themeValue === "dark";
        setIsDark(isDarkMode);
        
        if (isDarkMode) {
          document.documentElement.setAttribute("data-theme", "opensigndark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.setAttribute("data-theme", "opensigncss");
          localStorage.setItem("theme", "light");
        }
      } catch (error) {
        console.warn("Error loading theme preference:", error);
        // Fall back to localStorage
        const storedTheme = localStorage.getItem("theme");
        const isDarkMode = storedTheme === "dark";
        setIsDark(isDarkMode);
        if (isDarkMode) {
          document.documentElement.setAttribute("data-theme", "opensigndark");
        } else {
          document.documentElement.setAttribute("data-theme", "opensigncss");
        }
      }
    };

    loadThemePreference();
  }, []);

  const handleChange = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    const themeValue = newTheme ? "dark" : "light";
    
    // Update UI immediately
    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "opensigndark");
    } else {
      document.documentElement.setAttribute("data-theme", "opensigncss");
    }
    
    // Update localStorage
    localStorage.setItem("theme", themeValue);
    
    // Sync with server if user is authenticated
    if (Parse.User.current()) {
      try {
        await Parse.Cloud.run("updatepreferences", {
          Theme: themeValue
        });
        
        // Update the cached user details in localStorage
        const extUser = JSON.parse(localStorage.getItem("Extand_Class") || "[]")?.[0];
        if (extUser && extUser?.objectId) {
          extUser.Theme = themeValue;
          localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
        }
      } catch (error) {
        console.warn("Could not sync theme preference to server:", error);
        // Theme is still saved in localStorage, so user won't lose preference
      }
    }
  };

  return (
    <>
      <input
        id="dark-mode-toggle"
        type="checkbox"
        className="op-toggle checked:[--tglbg:#3368ff] transition-all checked:bg-white"
        checked={isDark}
        onChange={handleChange}
      />
    </>
  );
};

export default ThemeToggle;
