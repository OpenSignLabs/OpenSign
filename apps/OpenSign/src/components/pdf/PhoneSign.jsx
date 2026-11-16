// PhoneSign: "Sign on phone" with BetterSign.
//
// Only for someone who signed in with BetterSign (isBetterSignSession): the
// server knows their identity from that sign-in, so there is nothing to type.
// Opening the modal sends the field to their BetterSign app over the app's own
// connection to the BetterSign relay; if the app isn't open, the relay wakes
// the phone with a push notification. They approve it there and the image
// their app returns is applied to the field.
//
// Server side: apps/OpenSignServer/cloud/parsefunction/bsPhoneSign.js
//   bsphonesignstart { docId, fieldId, kind } -> { requestId, delivery }
//   bsphonesignpoll  { requestId, delivery }  -> { status, delivery?, image? }

import { useEffect, useRef, useState } from "react";
import Parse from "parse";
import ModalUi from "../../primitives/ModalUi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

// Set by Login.jsx after Sign in with BetterSign, to that session's token, so
// any other session (the emailed signing link, a later sign-in) doesn't match.
export const BS_SESSION_KEY = "bsSession";

export function isBetterSignSession() {
  const marked = localStorage.getItem(BS_SESSION_KEY);
  return !!marked && marked === localStorage.getItem("accesstoken");
}

const WAITING = {
  live: "Sent to your BetterSign app. Approve it there.",
  seen: "Your BetterSign app is showing the request. Approve it there.",
  pushed: "Notification sent to your phone. Open it to approve.",
  queued: "Waiting for your phone. Open the BetterSign app to approve."
};

export default function PhoneSign({
  isOpen,
  onClose,
  docId,
  fieldKey,
  kind,
  onSigned
}) {
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const runRef = useRef(0);

  const fail = (msg) => {
    setBusy(false);
    setIsError(true);
    setStatus(msg);
  };

  async function send() {
    const run = ++runRef.current;
    const live = () => run === runRef.current;
    setBusy(true);
    setIsError(false);
    setStatus("Sending to your BetterSign app…");
    let requestId;
    let delivery;
    try {
      const res = await Parse.Cloud.run("bsphonesignstart", {
        docId,
        fieldId: fieldKey,
        kind: kind === "initials" ? "initials" : "signature"
      });
      requestId = res.requestId;
      delivery = res.delivery;
    } catch (e) {
      if (live())
        fail(e?.message || "Couldn't send the request to your phone.");
      return;
    }
    while (live()) {
      setStatus(WAITING[delivery] || WAITING.queued);
      let res;
      try {
        res = await Parse.Cloud.run("bsphonesignpoll", { requestId, delivery });
      } catch (e) {
        if (!live()) return;
        setStatus("Connection lost, retrying…");
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      if (!live()) return;
      if (res.status === "signed") {
        setBusy(false);
        setStatus("Signed");
        onSigned && onSigned(res.image);
        return;
      }
      if (res.status === "denied")
        return fail("You declined the request on your phone.");
      if (res.status === "expired")
        return fail("The request expired. Send it again.");
      if (res.status === "failed") {
        return fail(res.message || "Your phone's answer couldn't be verified.");
      }
      if (res.delivery) delivery = res.delivery;
      if (res.retry) await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Send as soon as the modal opens; stop waiting when it closes.
  useEffect(() => {
    if (isOpen) send();
    return () => {
      runRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function close() {
    runRef.current++;
    setBusy(false);
    setStatus("");
    setIsError(false);
    onClose && onClose();
  }

  if (!isOpen) return null;

  return (
    <ModalUi
      isOpen={isOpen}
      title="Sign on phone (BetterSign)"
      handleClose={close}
      reduceWidth="max-w-[420px]"
    >
      <Box sx={{ px: 2, py: 1.5, color: "text.primary" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          {busy && <CircularProgress size={20} />}
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: isError ? "error.main" : "text.primary"
            }}
          >
            {status}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button type="button" variant="text" size="small" onClick={close}>
            {busy ? "Cancel" : "Close"}
          </Button>
          {isError && (
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={send}
            >
              Send again
            </Button>
          )}
        </Box>
      </Box>
    </ModalUi>
  );
}
