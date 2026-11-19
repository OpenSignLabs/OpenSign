// @vitest-environment node
import { describe, it, expect } from "vitest";
globalThis.window = globalThis.window || {
  RUNTIME_ENV: {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "" }
};
const utils = await import("./linkedFields");
describe("linked fields", () => {
  it("preserves the state reference when linked values already match", () => {
    expect(utils.updateLinkedFields).toBeTypeOf("function");
    const state = [
      {
        pos: [
          { key: "a", options: { name: "name", response: "A" } },
          { key: "b", options: { name: "name", response: "A" } }
        ]
      }
    ];
    expect(
      utils.updateLinkedFields(state, {
        key: "a",
        name: "name",
        value: "A",
        index: 0
      })
    ).toBe(state);
  });
  it("updates matching siblings without changing unrelated widgets", () => {
    const sibling = { key: "b", options: { name: "name", response: "old" } };
    const other = { key: "c", options: { name: "other", response: "old" } };
    const state = [{ pos: [sibling, other] }];
    const updated = utils.updateLinkedFields(state, {
      key: "a",
      name: "name",
      value: "new",
      index: 0
    });
    expect(updated[0].pos[0].options.response).toBe("new");
    expect(updated[0].pos[1]).toBe(other);
    expect(sibling.options.response).toBe("old");
  });
  it("updates all pages of the current signer without changing other signers", () => {
    const widget = (key, response) => ({
      key,
      options: { name: "name", response }
    });
    const state = [
      {
        Id: "one",
        signerPtr: {},
        placeHolder: [
          { pos: [widget("a", "new")] },
          { pos: [widget("b", "old")] }
        ]
      },
      { Id: "two", signerPtr: {}, placeHolder: [{ pos: [widget("c", "old")] }] }
    ];
    const next = utils.updateLinkedFields(state, {
      key: "a",
      name: "name",
      value: "new",
      signerId: "one"
    });
    expect(next[0].placeHolder[1].pos[0].options.response).toBe("new");
    expect(next[1]).toBe(state[1]);
    expect(next[0].placeHolder[0]).toBe(state[0].placeHolder[0]);
  });
  it("recognizes equal array values without rebuilding state", () => {
    const state = [
      { pos: [{ key: "b", options: { name: "choices", response: [0, 2] } }] }
    ];
    expect(
      utils.updateLinkedFields(state, {
        key: "a",
        name: "choices",
        value: [0, 2]
      })
    ).toBe(state);
  });
  it("copies the saved initials and their rendering metadata to matching initials only", () => {
    const source = {
      key: "initial-1", type: "initials", SignUrl: "data:image/png;base64,abc",
      signatureType: "type", typeSignature: "AD", typeFont: "Fasthand",
      options: { name: "initials", response: "data:image/png;base64,abc" }
    };
    const sibling = { key: "initial-2", type: "initials", Width: 32, options: { name: "initials" } };
    const unrelated = { key: "text", type: "text", options: { name: "initials" } };
    const state = [{ Id: "one", signerPtr: {}, placeHolder: [{ pos: [source] }, { pos: [sibling, unrelated] }] }];
    const next = utils.updateLinkedInitials(state, { source, signerId: "one" });
    const copied = next[0].placeHolder[1].pos[0];
    expect(copied.SignUrl).toBe(source.SignUrl);
    expect(copied.options.response).toBe(source.options.response);
    expect(copied.signatureType).toBe("type");
    expect(copied.typeSignature).toBe("AD");
    expect(copied.typeFont).toBe("Fasthand");
    expect(copied.Width).toBe(32);
    expect(next[0].placeHolder[1].pos[1]).toBe(unrelated);
  });
  it("keeps an unchanged sibling object when saving an inline value", async () => {
    const { onChangeInput } = await import("../constant/Utils");
    const sibling = { key: "b", type: "text input", options: { name: "shared", response: "A", defaultValue: "" } };
    let state = [{ pageNumber: 1, pos: [
      { key: "a", type: "text input", options: { name: "shared", response: "old", defaultValue: "" } },
      sibling
    ] }];
    onChangeInput("A", state[0].pos[0], state, 0, (update) => {
      state = typeof update === "function" ? update(state) : update;
    });
    expect(state[0].pos[1]).toBe(sibling);
  });
});
