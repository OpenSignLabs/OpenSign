import React, { useMemo, useState } from "react";
import { ContentCopyOutlined } from "@mui/icons-material";
import { IconButton, Snackbar, Tooltip } from "@mui/material";

import { useDocument } from "../../documents/editor/EditorContext";
// import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import renderEmailHtml from "./helper/renderEmailHtml";

export default function ShareButton() {
  const document = useDocument();
  // const code = useMemo(
  //   () => renderToStaticMarkup(document, { rootBlockId: "root" }),
  //   [document]
  // );
  const code = useMemo(() => renderEmailHtml(document, "root"), [document]);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    await copyToClipboard(code);
    setMessage("Your current template is copied");
    setTimeout(() => {
      setMessage(null);
    }, 1000);
  };

  async function copyToClipboard(text: string): Promise<boolean> {
    // 1) Try modern Clipboard API
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to legacy approach
    }

    // 2) Fallback: execCommand('copy')
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;

      // Prevent scrolling to bottom on iOS
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);

      return ok;
    } catch {
      return false;
    }
  }

  const onClose = () => {
    setMessage(null);
  };

  return (
    <>
      {/* <IconButton onClick={onClick}>
        <Tooltip title="Share current template">
          <IosShareOutlined fontSize="small" />
        </Tooltip>
      </IconButton> */}
      <IconButton onClick={onClick} sx={{ color: "text.primary" }}>
        <Tooltip title="copy" placement="left-start">
          <ContentCopyOutlined fontSize="small" />
        </Tooltip>
      </IconButton>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={message !== null}
        onClose={onClose}
        message={message}
      />
    </>
  );
}
