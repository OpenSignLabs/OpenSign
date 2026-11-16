import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Parse from "parse";
import BsIdentities from "./BsIdentities";

vi.mock("parse", () => ({ default: { Cloud: { run: vi.fn() } } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
vi.mock("../constant/Utils", () => ({
  copytoData: vi.fn(),
  openInNewTab: vi.fn()
}));
vi.mock("../utils", () => ({ withSessionValidation: (fn) => fn }));

const BOB = "u-bob";
const linked = {
  id: "row-linked",
  vlad: "8724" + "ab".repeat(40),
  label: "Bob's laptop",
  active: true,
  userId: BOB,
  lastSeenAt: null,
  createdAt: "2026-11-15T00:00:00.000Z"
};
const attempt = {
  id: "row-attempt",
  vlad: "8724" + "cd".repeat(40),
  label: "Sign-in attempt",
  active: false,
  userId: null,
  lastSeenAt: "2026-11-15T10:00:00.000Z",
  createdAt: "2026-11-15T10:00:00.000Z"
};
const accounts = [
  { userId: "u-ada", email: "ada@example.com", name: "Ada" },
  { userId: BOB, email: "bob@example.com", name: "Bob" }
];

function mockServer() {
  Parse.Cloud.run.mockImplementation(async (fn, params) => {
    if (fn === "bsidentitylist") {
      return { identities: [linked, attempt], accounts };
    }
    if (fn === "bsidentitysave") {
      const row = [linked, attempt].find((r) => r.id === params.id);
      return {
        ...row,
        ...("userId" in params ? { userId: params.userId } : {}),
        ...("active" in params ? { active: params.active } : {}),
        ...("label" in params ? { label: params.label } : {})
      };
    }
    return { ok: true };
  });
}

const rowOf = (vladStart) =>
  screen.getByText((t) => t.startsWith(vladStart.slice(0, 12))).closest("tr");

describe("BsIdentities", () => {
  beforeEach(() => {
    Parse.Cloud.run.mockReset();
    mockServer();
  });

  it("shows each identity with its account selected", async () => {
    render(<BsIdentities showAlert={vi.fn()} />);
    await screen.findByText("bs-identities.title");
    await waitFor(() => expect(rowOf(linked.vlad)).toBeTruthy());

    // The linked row shows Bob in its account dropdown (not blank).
    expect(within(rowOf(linked.vlad)).getByRole("combobox")).toHaveTextContent(
      "bob@example.com (Bob)"
    );
    // The attempt is unassigned and its switch can't be turned on yet.
    const attemptRow = rowOf(attempt.vlad);
    expect(within(attemptRow).getByRole("combobox")).toHaveTextContent(
      "bs-identities.unassigned"
    );
    expect(within(attemptRow).getByRole("switch")).toBeDisabled();
  });

  it("links an attempt to an account, then turns it on", async () => {
    const user = userEvent.setup();
    const showAlert = vi.fn();
    render(<BsIdentities showAlert={showAlert} />);
    await waitFor(() => expect(rowOf(attempt.vlad)).toBeTruthy());

    await user.click(within(rowOf(attempt.vlad)).getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "bob@example.com (Bob)" })
    );
    expect(Parse.Cloud.run).toHaveBeenCalledWith("bsidentitysave", {
      id: attempt.id,
      userId: BOB
    });

    const toggle = within(rowOf(attempt.vlad)).getByRole("switch");
    await waitFor(() => expect(toggle).toBeEnabled());
    await user.click(toggle);
    expect(Parse.Cloud.run).toHaveBeenCalledWith("bsidentitysave", {
      id: attempt.id,
      active: true
    });
    expect(showAlert).toHaveBeenCalledWith("success", "bs-identities.saved");
  });

  it("shows the server's message when a save is refused", async () => {
    const showAlert = vi.fn();
    render(<BsIdentities showAlert={showAlert} />);
    await waitFor(() => expect(rowOf(linked.vlad)).toBeTruthy());
    Parse.Cloud.run.mockRejectedValueOnce(
      new Error(
        "This VLAD already has an active link. Turn that one off first."
      )
    );
    await userEvent.click(within(rowOf(linked.vlad)).getByRole("switch"));
    await waitFor(() =>
      expect(showAlert).toHaveBeenCalledWith(
        "danger",
        "This VLAD already has an active link. Turn that one off first.",
        3000
      )
    );
  });
});
