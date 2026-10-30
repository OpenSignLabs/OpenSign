import { useCallback, useReducer } from "react";

function widgets(value, nested) {
  return value.flatMap((signer, signerIndex) =>
    (nested ? signer.placeHolder || [] : [signer]).flatMap((page, pageIndex) =>
      (page.pos || []).map((widget, index) => ({
        id: JSON.stringify([
          nested ? signer.Id : null,
          page.pageNumber,
          widget.key
        ]),
        signer,
        signerIndex,
        page,
        pageIndex: nested ? pageIndex : signerIndex,
        widget,
        index
      }))
    )
  );
}

function difference(before, after, nested) {
  const previous = widgets(before, nested);
  const next = widgets(after, nested);
  const previousIds = new Set(previous.map((entry) => entry.id));
  const nextIds = new Set(next.map((entry) => entry.id));
  const nextById = new Map(next.map((entry) => [entry.id, entry]));
  return {
    removed: previous.filter((entry) => !nextIds.has(entry.id)),
    added: next.filter((entry) => !previousIds.has(entry.id)),
    moved: previous.flatMap((entry) => {
      const updated = nextById.get(entry.id);
      if (
        !updated ||
        (entry.widget.xPosition === updated.widget.xPosition &&
          entry.widget.yPosition === updated.widget.yPosition)
      )
        return [];
      return [
        {
          id: entry.id,
          from: {
            xPosition: entry.widget.xPosition,
            yPosition: entry.widget.yPosition
          },
          to: {
            xPosition: updated.widget.xPosition,
            yPosition: updated.widget.yPosition
          }
        }
      ];
    })
  };
}

function applyChange(value, remove, restore, moved, nested) {
  const removeIds = new Set(remove.map((entry) => entry.id));
  const filterPages = (pages, signerId) =>
    pages
      .map((page) => ({
        ...page,
        pos: (page.pos || []).filter(
          (widget) =>
            !removeIds.has(
              JSON.stringify([signerId, page.pageNumber, widget.key])
            )
        )
      }))
      .filter((page) => page.pos.length > 0);
  let result = nested
    ? value
        .map((signer) => {
          if (!signer.placeHolder) return signer;
          const pages = filterPages(signer.placeHolder, signer.Id);
          if (pages.length) return { ...signer, placeHolder: pages };
          const metadata = { ...signer };
          delete metadata.placeHolder;
          return metadata;
        })
        .filter(
          (signer) => signer.Role !== "prefill" || signer.placeHolder?.length
        )
    : filterPages(value, null);

  for (const entry of restore) {
    let pages = result;
    let signerIndex;
    if (nested) {
      signerIndex = result.findIndex((signer) => signer.Id === entry.signer.Id);
      if (signerIndex === -1) {
        result.splice(entry.signerIndex, 0, {
          ...entry.signer,
          placeHolder: []
        });
        signerIndex = result.findIndex(
          (signer) => signer.Id === entry.signer.Id
        );
      }
      pages = [...(result[signerIndex].placeHolder || [])];
    }
    let pageIndex = pages.findIndex(
      (page) => page.pageNumber === entry.page.pageNumber
    );
    if (pageIndex === -1) {
      pages.splice(entry.pageIndex, 0, { ...entry.page, pos: [] });
      pageIndex = pages.findIndex(
        (page) => page.pageNumber === entry.page.pageNumber
      );
    }
    const pos = [...pages[pageIndex].pos];
    pos.splice(entry.index, 0, entry.widget);
    pages[pageIndex] = { ...pages[pageIndex], pos };
    if (nested) {
      result[signerIndex] = { ...result[signerIndex], placeHolder: pages };
    }
  }
  const positions = new Map(moved.map(({ id, position }) => [id, position]));
  const updatePage = (page, signerId) => ({
    ...page,
    pos: (page.pos || []).map((widget) => {
      const position = positions.get(
        JSON.stringify([signerId, page.pageNumber, widget.key])
      );
      return position ? { ...widget, ...position } : widget;
    })
  });
  return nested
    ? result.map((signer) =>
        signer.placeHolder
          ? {
              ...signer,
              placeHolder: signer.placeHolder.map((page) =>
                updatePage(page, signer.Id)
              )
            }
          : signer
      )
    : result.map((page) => updatePage(page, null));
}

function reducer(state, action) {
  if (action.type === "clear") {
    return { ...state, past: [], future: [] };
  }
  if (action.type === "update") {
    const value =
      typeof action.update === "function"
        ? action.update(state.value)
        : action.update;
    const change = difference(state.value, value, state.nested);
    const signerIds = (items) =>
      JSON.stringify(
        items
          .filter((signer) => signer.Role !== "prefill")
          .map((signer) => signer.Id)
          .sort()
      );
    if (
      !action.record &&
      state.nested &&
      signerIds(state.value) !== signerIds(value)
    ) {
      return { ...state, value, past: [], future: [] };
    }
    if (
      !change.added.length &&
      !change.removed.length &&
      !change.moved.length
    ) {
      return { ...state, value };
    }
    return {
      ...state,
      value,
      past: action.record ? [...state.past, change] : [],
      future: []
    };
  }
  const undo = action.type === "undo";
  const source = undo ? state.past : state.future;
  if (!source.length) return state;
  const change = source[source.length - 1];
  const remove = undo ? change.added : change.removed;
  const restore = undo ? change.removed : change.added;
  const moved = change.moved.map(({ id, from, to }) => ({
    id,
    position: undo ? from : to
  }));
  const current = new Map(
    widgets(state.value, state.nested).map((entry) => [entry.id, entry])
  );
  // Keep edits made after insertion when that widget is subsequently redone.
  const refreshed = {
    added: change.added.map((entry) => current.get(entry.id) || entry),
    removed: change.removed.map((entry) => current.get(entry.id) || entry),
    moved: change.moved
  };
  return {
    ...state,
    value: applyChange(state.value, remove, restore, moved, state.nested),
    past: undo ? state.past.slice(0, -1) : [...state.past, refreshed],
    future: undo ? [...state.future, refreshed] : state.future.slice(0, -1)
  };
}

export default function useWidgetHistory(nested = true) {
  const [state, dispatch] = useReducer(reducer, {
    value: [],
    nested,
    past: [],
    future: []
  });
  const setValue = useCallback(
    (update) => dispatch({ type: "update", update, record: false }),
    []
  );
  const recordUpdate = useCallback(
    (update) => dispatch({ type: "update", update, record: true }),
    []
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  return [
    state.value,
    setValue,
    recordUpdate,
    {
      undo,
      redo,
      clear,
      canUndo: !!state.past.length,
      canRedo: !!state.future.length
    }
  ];
}
