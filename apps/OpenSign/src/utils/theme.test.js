// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { applySavedTheme, applyTheme } from "./theme";

const shownTheme = () => document.documentElement.getAttribute("data-theme");

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("shows and remembers the dark theme", () => {
    applyTheme("dark");

    expect(shownTheme()).toBe("opensigndark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("shows and remembers the light theme", () => {
    applyTheme("light");

    expect(shownTheme()).toBe("opensigncss");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("applies the theme saved on the profile over the device theme", () => {
    applyTheme("light");

    applySavedTheme("dark");

    expect(shownTheme()).toBe("opensigndark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it.each([undefined, null, "", "constructor", "solarized"])(
    "keeps the device theme when the saved theme is %s",
    (saved) => {
      applyTheme("dark");

      applySavedTheme(saved);

      expect(shownTheme()).toBe("opensigndark");
      expect(localStorage.getItem("theme")).toBe("dark");
    }
  );
});
