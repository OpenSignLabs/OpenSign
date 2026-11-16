import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Parse from "parse";
import EditUser from "./EditUser";

vi.mock("parse", () => ({ default: { Cloud: { run: vi.fn() } } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
vi.mock("../utils", () => ({ withSessionValidation: (fn) => fn }));

const teams = [
  { objectId: "t-all", Name: "All Users" },
  { objectId: "t-sales", Name: "Sales" }
];
const bob = {
  objectId: "ext-bob",
  Name: "Bob Signer",
  Email: "bob@example.com",
  Phone: "+1 555 0100",
  UserRole: "contracts_User",
  TeamIds: [{ objectId: "t-all", Name: "All Users" }]
};

describe("EditUser", () => {
  beforeEach(() => {
    Parse.Cloud.run.mockReset();
    Parse.Cloud.run.mockImplementation(async (fn, params) =>
      fn === "getteams" ? teams : { ...bob, Name: params.name }
    );
  });

  it("shows the email but doesn't let it be changed or sent", async () => {
    const onSaved = vi.fn();
    render(
      <EditUser
        user={bob}
        isSelf={false}
        showAlert={vi.fn()}
        onSaved={onSaved}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue("bob@example.com")).toBeDisabled();

    const name = screen.getByDisplayValue("Bob Signer");
    await userEvent.clear(name);
    await userEvent.type(name, "Bob Builder");
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(Parse.Cloud.run).toHaveBeenCalledWith("updateuserbyadmin", {
      extUserId: "ext-bob",
      name: "Bob Builder",
      phone: "+1 555 0100",
      teams: ["t-all"],
      role: "User"
    });
    const params = Parse.Cloud.run.mock.calls.find(
      (c) => c[0] === "updateuserbyadmin"
    )[1];
    expect(params).not.toHaveProperty("email");
  });

  it("locks the role for the tenant admin and for yourself, and doesn't send it", async () => {
    const admin = { ...bob, objectId: "ext-ada", UserRole: "contracts_Admin" };
    const { unmount } = render(
      <EditUser
        user={admin}
        isSelf={false}
        showAlert={vi.fn()}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("admin-role-locked")).toBeInTheDocument();
    unmount();

    render(
      <EditUser
        user={bob}
        isSelf
        showAlert={vi.fn()}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("own-role-locked")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(Parse.Cloud.run).toHaveBeenCalledWith(
        "updateuserbyadmin",
        expect.not.objectContaining({ role: expect.anything() })
      )
    );
  });
});
