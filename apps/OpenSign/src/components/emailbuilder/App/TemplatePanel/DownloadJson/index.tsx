import React, { useMemo } from "react";

import { FileDownloadOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import { useDocument } from "../../../documents/editor/EditorContext";
// import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import renderEmailHtml from "../helper/renderEmailHtml";

export default function DownloadJson() {
  const doc = useDocument();
  // const code = useMemo(
  //   () => renderToStaticMarkup(doc, { rootBlockId: "root" }),
  //   [doc]
  // );

  const code = useMemo(() => renderEmailHtml(doc, "root"), [doc]);

  const href = useMemo(() => {
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    return url;
  }, [doc]);
  return (
    <Tooltip title="Download html of template in txt file">
      <IconButton href={href} download="emailTemplate.txt">
        <FileDownloadOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
