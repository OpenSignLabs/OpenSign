// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import Parse from "parse";
import ThemeToggle from "./ThemeToggle";

vi.mock("parse", () => ({
  default: { User: { current: vi.fn() }, Cloud: { run: vi.fn() } }
}));

const shownTheme = () => document.documentElement.getAttribute("data-theme");

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(Parse.User.current).mockReturnValue({ id: "user" });
    vi.mocked(Parse.Cloud.run).mockReset().mockResolvedValue({});
  });

  afterEach(cleanup);

  it("saves the chosen theme on the profile of a signed in user", async () => {
    const { container } = render(<ThemeToggle />);
    const toggle = container.querySelector("input");

    fireEvent.click(toggle);

    expect(shownTheme()).toBe("opensigndark");
    expect(localStorage.getItem("theme")).toBe("dark");
    await waitFor(() =>
      expect(Parse.Cloud.run).toHaveBeenCalledWith("updatepreferences", {
        Theme: "dark"
      })
    );

    fireEvent.click(toggle);

    expect(shownTheme()).toBe("opensigncss");
    await waitFor(() =>
      expect(Parse.Cloud.run).toHaveBeenLastCalledWith("updatepreferences", {
        Theme: "light"
      })
    );
  });

  it("does not call the server when nobody is signed in", () => {
    vi.mocked(Parse.User.current).mockReturnValue(null);
    const { container } = render(<ThemeToggle />);

    fireEvent.click(container.querySelector("input"));

    expect(shownTheme()).toBe("opensigndark");
    expect(Parse.Cloud.run).not.toHaveBeenCalled();
  });

  it("keeps the theme on this device when saving fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(Parse.Cloud.run).mockRejectedValue(new Error("offline"));
    const { container } = render(<ThemeToggle />);
    const toggle = container.querySelector("input");

    fireEvent.click(toggle);

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(toggle.checked).toBe(true);
    expect(shownTheme()).toBe("opensigndark");
    expect(localStorage.getItem("theme")).toBe("dark");
    error.mockRestore();
  });
});
