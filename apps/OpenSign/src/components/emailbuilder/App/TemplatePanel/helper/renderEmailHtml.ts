import {
  renderToStaticMarkup
} from "@usewaypoint/email-builder";
import { TEditorConfiguration } from "../../../documents/editor/core";

function overrideCanvasSize(
  html: string,
  document: TEditorConfiguration,
  rootBlockId: string
) {
  const rootBlock = document[rootBlockId];
  if (!rootBlock || rootBlock.type !== "EmailLayout") {
    return html;
  }

  const data = rootBlock.data as { canvasWidth?: number | null };

  const canvasWidth =
    typeof data?.canvasWidth === "number" && data.canvasWidth > 0
      ? data.canvasWidth
      : 600;

  let updatedHtml = html.replace(
    /max-width:\s*600px/gi,
    `max-width:${canvasWidth}px`
  );

  return updatedHtml;
}

export default function renderEmailHtml(
  document: TEditorConfiguration,
  rootBlockId = "root"
) {
  const html = renderToStaticMarkup(document, { rootBlockId });
  return overrideCanvasSize(html, document, rootBlockId);
}
