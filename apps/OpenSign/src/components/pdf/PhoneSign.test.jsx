import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Parse from "parse";
import PhoneSign, {
  BS_SESSION_KEY,
  canSignOnPhone,
  isBetterSignSession,
  markBetterSignSession
} from "./PhoneSign";

vi.mock("parse", () => ({ default: { Cloud: { run: vi.fn() } } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
vi.mock("../../primitives/ModalUi", () => ({
  default: ({ isOpen, title, children }) =>
    isOpen ? (
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null
}));

// Newer Node versions define their own localStorage global, which is empty
// unless Node is started with a storage file and shadows jsdom's. Use an
// in-memory one.
function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear()
  };
}
vi.stubGlobal("localStorage", memoryStorage());

const run = Parse.Cloud.run;
// The server long-polls; answer after a moment, as it would.
const later = (value, ms = 5) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

beforeEach(() => {
  localStorage.clear();
  run.mockReset();
});
afterEach(() => localStorage.clear());

describe("BetterSign session marker", () => {
  it("is a BetterSign session only while the marked session is current", () => {
    expect(isBetterSignSession()).toBe(false);
    markBetterSignSession({ bettersign: true, sessionToken: "r:abc" });
    localStorage.setItem("accesstoken", "r:abc");
    expect(isBetterSignSession()).toBe(true);
    // e.g. the emailed signing link signed someone else in
    localStorage.setItem("accesstoken", "r:guest");
    expect(isBetterSignSession()).toBe(false);
  });

  it("isn't marked when the server didn't record the session", () => {
    markBetterSignSession({ bettersign: false, sessionToken: "r:abc" });
    localStorage.setItem("accesstoken", "r:abc");
    expect(localStorage.getItem(BS_SESSION_KEY)).toBeNull();
    expect(isBetterSignSession()).toBe(false);
  });

  it("is gone after logout clears storage", () => {
    markBetterSignSession({ bettersign: true, sessionToken: "r:abc" });
    localStorage.setItem("accesstoken", "r:abc");
    localStorage.clear();
    expect(isBetterSignSession()).toBe(false);
  });
});

describe("canSignOnPhone", () => {
  beforeEach(() => {
    markBetterSignSession({ bettersign: true, sessionToken: "r:abc" });
    localStorage.setItem("accesstoken", "r:abc");
  });

  it("is offered for signature and initials on a saved document", () => {
    expect(canSignOnPhone("doc1", "signature")).toBe(true);
    expect(canSignOnPhone("doc1", "initials")).toBe(true);
  });

  it("isn't offered without a document, for other widgets, or another session", () => {
    expect(canSignOnPhone(undefined, "signature")).toBe(false);
    expect(canSignOnPhone("doc1", "date")).toBe(false);
    localStorage.setItem("accesstoken", "r:guest");
    expect(canSignOnPhone("doc1", "signature")).toBe(false);
  });
});

describe("PhoneSign", () => {
  const open = (props = {}) =>
    render(
      <PhoneSign
        isOpen
        docId="doc1"
        fieldKey={12345678}
        kind="initials"
        onClose={vi.fn()}
        onSigned={vi.fn()}
        {...props}
      />
    );

  it("sends on open, follows delivery, and applies the approved image", async () => {
    const onSigned = vi.fn();
    run.mockImplementation((fn, params) => {
      if (fn === "bsphonesignstart")
        return later({ requestId: "R1", delivery: "pushed" });
      return params.delivery === "pushed"
        ? later({ status: "pending", delivery: "seen" })
        : later({ status: "signed", image: "data:image/png;base64,AA" });
    });
    open({ onSigned });

    await waitFor(() =>
      expect(onSigned).toHaveBeenCalledWith("data:image/png;base64,AA")
    );
    // Widget keys are numbers; the server gets text.
    expect(run).toHaveBeenNthCalledWith(1, "bsphonesignstart", {
      docId: "doc1",
      fieldId: "12345678",
      kind: "initials"
    });
    // The delivery the last poll reported goes back on the next one.
    expect(run).toHaveBeenNthCalledWith(2, "bsphonesignpoll", {
      requestId: "R1",
      delivery: "pushed"
    });
    expect(run).toHaveBeenNthCalledWith(3, "bsphonesignpoll", {
      requestId: "R1",
      delivery: "seen"
    });
    expect(screen.getByRole("status")).toHaveTextContent("phone-sign.signed");
  });

  it("shows the server's message when sending fails, and can send again", async () => {
    run.mockRejectedValueOnce(
      new Error("Your BetterSign app hasn't connected yet.")
    );
    open();
    await screen.findByText("Your BetterSign app hasn't connected yet.");

    run.mockImplementation((fn) =>
      fn === "bsphonesignstart"
        ? later({ requestId: "R2", delivery: "live" })
        : later({ status: "denied" })
    );
    fireEvent.click(screen.getByText("phone-sign.send-again"));
    await screen.findByText("phone-sign.denied");
    expect(run).toHaveBeenCalledWith("bsphonesignpoll", {
      requestId: "R2",
      delivery: "live"
    });
  });

  it.each([
    ["expired", "phone-sign.expired"],
    ["failed", "phone-sign.failed"]
  ])("reports %s", async (status, text) => {
    run.mockImplementation((fn) =>
      fn === "bsphonesignstart"
        ? later({ requestId: "R3", delivery: "queued" })
        : later({ status })
    );
    open();
    await screen.findByText(text);
    expect(screen.getByText("phone-sign.send-again")).toBeInTheDocument();
  });

  it("retries after a lost connection", async () => {
    const onSigned = vi.fn();
    let polls = 0;
    run.mockImplementation((fn) => {
      if (fn === "bsphonesignstart")
        return later({ requestId: "R4", delivery: "pushed" });
      polls += 1;
      return polls === 1
        ? Promise.reject(new Error("network"))
        : later({ status: "signed", image: "img" });
    });
    open({ onSigned });
    await screen.findByText("phone-sign.retrying");
    await waitFor(() => expect(onSigned).toHaveBeenCalledWith("img"), {
      timeout: 3000
    });
  });

  it("stops waiting when cancelled", async () => {
    const onClose = vi.fn();
    run.mockImplementation((fn) =>
      fn === "bsphonesignstart"
        ? later({ requestId: "R5", delivery: "pushed" })
        : later({ status: "pending", delivery: "pushed" }, 20)
    );
    open({ onClose });
    await screen.findByText("phone-sign.pushed");
    fireEvent.click(screen.getByText("phone-sign.cancel"));
    expect(onClose).toHaveBeenCalled();
    const calls = run.mock.calls.length;
    await new Promise((r) => setTimeout(r, 100));
    // At most the poll already in flight; nothing after it.
    expect(run.mock.calls.length).toBeLessThanOrEqual(calls + 1);
  });
});
