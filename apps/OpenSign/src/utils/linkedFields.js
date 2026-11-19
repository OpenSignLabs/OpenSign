const sameValue = (a, b) =>
  Object.is(a, b) ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((item, i) => Object.is(item, b[i])));

// Update only siblings belonging to the same signer, across all their pages.
export function updateLinkedFields(state, { key, name, value, signerId }) {
  if (!name || !Array.isArray(state)) return state;
  let changed = false;
  const updatePage = (page) => {
    let pageChanged = false;
    const pos = (page.pos || []).map((widget) => {
      if (
        widget.key === key ||
        widget.options?.name !== name ||
        sameValue(widget.options?.response, value)
      )
        return widget;
      changed = pageChanged = true;
      return { ...widget, options: { ...widget.options, response: value } };
    });
    return pageChanged ? { ...page, pos } : page;
  };
  const nested = state.some(
    (item) => item.signerPtr || item.Role === "prefill"
  );
  const result = nested
    ? state.map((signer) => {
        if (signer.Id !== signerId || !signer.placeHolder) return signer;
        const pages = signer.placeHolder.map(updatePage);
        return pages.some((page, i) => page !== signer.placeHolder[i])
          ? { ...signer, placeHolder: pages }
          : signer;
      })
    : state.map(updatePage);
  return changed ? result : state;
}

// Initials need their image metadata as well as their response for rendering.
export function updateLinkedInitials(state, { source, signerId }) {
  if (source?.type !== "initials" || !source.options?.name) return state;
  const fields = ["SignUrl", "ImageType", "signatureType", "typeSignature", "typeFont", "fontColor"];
  let changed = false;
  const updatePage = (page) => {
    let pageChanged = false;
    const pos = (page.pos || []).map((widget) => {
      if (widget.key === source.key || widget.type !== "initials" || widget.options?.name !== source.options.name) return widget;
      const same = sameValue(widget.options?.response, source.options.response) && fields.every((field) =>
        Object.hasOwn(widget, field) === Object.hasOwn(source, field) && Object.is(widget[field], source[field]));
      if (same) return widget;
      const next = { ...widget, options: { ...widget.options, response: source.options.response } };
      for (const field of fields) {
        if (Object.hasOwn(source, field)) next[field] = source[field];
        else delete next[field];
      }
      changed = pageChanged = true;
      return next;
    });
    return pageChanged ? { ...page, pos } : page;
  };
  const nested = state.some((item) => item.signerPtr || item.Role === "prefill");
  const next = nested ? state.map((signer) => {
    if (signer.Id !== signerId || !signer.placeHolder) return signer;
    const pages = signer.placeHolder.map(updatePage);
    return pages.some((page, index) => page !== signer.placeHolder[index]) ? { ...signer, placeHolder: pages } : signer;
  }) : state.map(updatePage);
  return changed ? next : state;
}
