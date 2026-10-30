import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "radix-ui";

export default function WidgetHistoryControls({ history, asMenuItems = false }) {
  const { t } = useTranslation();
  const { undo, redo, canUndo, canRedo } = history;
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isRedoShortcut =
        (key === "z" && event.shiftKey) || key === "y";
      const isUndoShortcut = key === "z" && !event.shiftKey;
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        !(event.ctrlKey || event.metaKey) ||
        (!isUndoShortcut && !isRedoShortcut) ||
        (event.target instanceof Element &&
          event.target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], dialog'
          )) ||
        document.querySelector('[role="dialog"], dialog[open], .op-modal')
      ) {
        return;
      }
      if (isRedoShortcut ? canRedo : canUndo) {
        event.preventDefault();
        isRedoShortcut ? redo() : undo();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  if (asMenuItems) {
    return (
      <>
        <DropdownMenu.Item
          className="DropdownMenuItem"
          disabled={!canUndo}
          onSelect={undo}
        >
          <div className="flex flex-row">
            <i
              className="fa-light fa-arrow-turn-left text-gray-500 2xl:text-[30px] mr-[3px]"
              aria-hidden="true"
            ></i>
            <span className="font-[500]">{t("undo")}</span>
          </div>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="DropdownMenuItem"
          disabled={!canRedo}
          onSelect={redo}
        >
          <div className="flex flex-row">
            <i
              className="fa-light fa-arrow-turn-right text-gray-500 2xl:text-[30px] mr-[3px]"
              aria-hidden="true"
            ></i>
            <span className="font-[500]">{t("redo")}</span>
          </div>
        </DropdownMenu.Item>
      </>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="op-btn op-btn-ghost op-btn-sm min-h-[44px] min-w-[44px] disabled:opacity-40"
        aria-label={t("undo-widget")}
        title={t("undo-widget")}
        disabled={!canUndo}
        onClick={undo}
      >
        <i className="fa-light fa-arrow-turn-left" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="op-btn op-btn-ghost op-btn-sm min-h-[44px] min-w-[44px] disabled:opacity-40"
        aria-label={t("redo-widget")}
        title={t("redo-widget")}
        disabled={!canRedo}
        onClick={redo}
      >
        <i className="fa-light fa-arrow-turn-right" aria-hidden="true" />
      </button>
    </div>
  );
}
