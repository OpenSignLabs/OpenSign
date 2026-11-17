import { color } from "./UtilsPart01.js";
import { widgets } from "./UtilsPart02.js";

export const darkenColor = (color, factor) => {
  // Remove '#' from the color code and parse it to get RGB values
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken the color by reducing each RGB component
  const darkerR = Math.floor(r * (1 - factor));
  const darkerG = Math.floor(g * (1 - factor));
  const darkerB = Math.floor(b * (1 - factor));

  // Convert the darkened RGB components back to hex
  return `#${((darkerR << 16) | (darkerG << 8) | darkerB)
    .toString(16)
    .padStart(6, "0")}`;
};

export const addZIndex = (signerPos, key, setZIndex) => {
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      return {
        ...item,
        placeHolder: addZIndex(item.placeHolder, key, setZIndex)
      };
    } else if (item.pos && item.pos.length > 0) {
      // If there is no nested array, add the new field
      return {
        ...item,
        pos: addZIndex(item.pos, key, setZIndex)
        // Adjust this line to add the desired field
      };
    } else {
      if (item.key === key) {
        setZIndex(item.zIndex);
        return {
          ...item,
          zIndex: item.zIndex ? item.zIndex + 1 : 1
        };
      } else {
        return { ...item };
      }
    }
  });
};

export const reuseUnchangedWidgets = (previous, updated) =>
  updated.map((page, pageIndex) => {
    const oldPage = previous[pageIndex];
    if (!oldPage?.pos || !page?.pos || oldPage.pos.length !== page.pos.length)
      return page;
    const pos = page.pos.map((widget, index) => {
      const old = oldPage.pos[index];
      if (!old || old.key !== widget.key) return widget;
      const same = (a, b) => {
        const keys = Object.keys(a || {});
        return (
          keys.length === Object.keys(b || {}).length &&
          keys.every((key) => Object.is(a[key], b[key]))
        );
      };
      const { options: oldOptions, ...oldFields } = old;
      const { options, ...fields } = widget;
      return same(oldFields, fields) && same(oldOptions, options)
        ? old
        : widget;
    });
    return { ...page, pos };
  });

export const nextPendingWidget = (pages, currentKey) => {
  const widgets = (pages || []).flatMap((page) =>
    (page.pos || []).map((widget) => ({ widget, pageNumber: page.pageNumber }))
  );
  const current = widgets.findIndex(({ widget }) => widget.key === currentKey);
  const hasValue = (value) =>
    Array.isArray(value)
      ? value.length > 0
      : typeof value === "string"
        ? value.trim().length > 0
        : value != null;
  for (let offset = 1; offset <= widgets.length; offset++) {
    const candidate = widgets[(current + offset) % widgets.length];
    const widget = candidate.widget;
    if (
      widget.key === currentKey ||
      widget.options?.isReadOnly ||
      widget.SignUrl ||
      hasValue(widget.options?.response) ||
      hasValue(widget.options?.defaultValue)
    )
      continue;
    return candidate;
  }
  return null;
};
