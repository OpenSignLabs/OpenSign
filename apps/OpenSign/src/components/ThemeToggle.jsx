import { useEffect, useState } from "react";

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

  const handleChange = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "opensigndark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "opensigncss");
      localStorage.setItem("theme", "light");
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
