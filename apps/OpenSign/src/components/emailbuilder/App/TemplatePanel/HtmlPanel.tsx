import React, { useMemo } from "react";

// import { renderToStaticMarkup } from "@usewaypoint/email-builder";

import { useDocument } from "../../documents/editor/EditorContext";

import HighlightedCodePanel from "./helper/HighlightedCodePanel";
import renderEmailHtml from "./helper/renderEmailHtml";

export default function HtmlPanel() {
  const document = useDocument();
  // const code = useMemo(
  //   () => renderToStaticMarkup(document, { rootBlockId: "root" }),
  //   [document]
  // );
  const code = useMemo(() => renderEmailHtml(document, "root"), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
