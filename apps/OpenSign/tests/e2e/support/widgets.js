let keyCounter = 1000;

const SIZES = {
  "text input": { Width: 150, Height: 19 },
  text: { Width: 150, Height: 19 },
  signature: { Width: 150, Height: 60 },
  initials: { Width: 50, Height: 50 },
  stamp: { Width: 150, Height: 60 },
  image: { Width: 70, Height: 70 },
  checkbox: { Width: 15, Height: 19 },
  "radio button": { Width: 5, Height: 10 },
  dropdown: { Width: 120, Height: 22 },
  date: { Width: 100, Height: 20 },
  cells: { Width: 112, Height: 22 }
};

/**
 * Build one widget position as the editor stores it.
 * @param {string} type Widget type, for example "text input" or "radio button".
 * @param {{x: number, y: number, options: object}} spec Position and options.
 * @returns {object} Widget position.
 */
export const widget = (type, { x, y, options }) => ({
  xPosition: x,
  yPosition: y,
  isStamp: false,
  key: ++keyCounter,
  scale: 1.64,
  zIndex: keyCounter,
  type,
  options: { status: "required", ...options },
  ...SIZES[type]
});

/**
 * Build a text input widget.
 * @param {string} name Widget name, also its placeholder.
 * @param {number} y Vertical position.
 * @param {object} [extra] Extra options, for example a default value.
 * @returns {object} Widget position.
 */
export const textInput = (name, y, extra = {}) =>
  widget("text input", {
    x: 180,
    y,
    options: { name, isReadOnly: false, hint: "", defaultValue: "", validation: {}, fontSize: 12, fontColor: "black", ...extra }
  });

/**
 * Build a signature widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const signature = (name, y) => widget("signature", { x: 430, y, options: { name } });

/**
 * Build a radio button group.
 * @param {string} name Widget name.
 * @param {string[]} values Option labels.
 * @param {number} y Vertical position.
 * @param {object} [extra] Extra options, for example a default value.
 * @returns {object} Widget position.
 */
export const radio = (name, values, y, extra = {}) => {
  const w = widget("radio button", { x: 60, y, options: { name, values, isReadOnly: false, ...extra } });
  return { ...w, Width: 120, Height: 24 * values.length };
};

/**
 * Build a checkbox group.
 * @param {string} name Widget name.
 * @param {string[]} values Option labels.
 * @param {number} y Vertical position.
 * @param {object} [extra] Extra options.
 * @returns {object} Widget position.
 */
export const checkbox = (name, values, y, extra = {}) => {
  const w = widget("checkbox", { x: 300, y, options: { name, values, isReadOnly: false, isHideLabel: false, ...extra } });
  return { ...w, Width: 120, Height: 24 * values.length };
};

/**
 * Build a dropdown.
 * @param {string} name Widget name.
 * @param {string[]} values Option labels.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const dropdown = (name, values, y) =>
  widget("dropdown", { x: 440, y, options: { name, values, isReadOnly: false } });

/**
 * Build a date widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const dateWidget = (name, y) =>
  widget("date", { x: 440, y, options: { name, response: "", isReadOnly: false, validation: { format: "MM/dd/yyyy", type: "date-format" } } });

/**
 * Build a cells (one character per cell) widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const cells = (name, y) =>
  widget("cells", { x: 60, y, options: { name, cellCount: 5, defaultValue: "", validation: { type: "", pattern: "" }, isReadOnly: false } });

/**
 * Build an initials widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const initials = (name, y) => widget("initials", { x: 300, y, options: { name } });

/**
 * Build an image widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const image = (name, y) => widget("image", { x: 60, y, options: { name } });

/**
 * Build a stamp widget.
 * @param {string} name Widget name.
 * @param {number} y Vertical position.
 * @returns {object} Widget position.
 */
export const stamp = (name, y) => widget("stamp", { x: 300, y, options: { name } });

/**
 * Build the plain text widget the owner fills in the prefill role.
 * @param {string} name Widget name, shown as the label in the prefill modal.
 * @param {number} y Vertical position.
 * @param {object} [extra] Extra options, for example a saved response.
 * @returns {object} Widget position.
 */
export const prefillText = (name, y, extra = {}) =>
  widget("text", { x: 180, y, options: { name, fontSize: 12, fontColor: "black", ...extra } });
