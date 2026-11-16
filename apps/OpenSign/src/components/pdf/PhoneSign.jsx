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
import { useTranslation } from "react-i18next";
import ModalUi from "../../primitives/ModalUi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

// Set after Sign in with BetterSign, to that session's token, so any other
// session (the emailed signing link, a later sign-in) doesn't match.
export const BS_SESSION_KEY = "bsSession";

// Login.jsx: remember the session bsidlogin returned, if the server recorded
// it as a BetterSign one.
export function markBetterSignSession(res) {
  if (res?.bettersign && res?.sessionToken) {
    localStorage.setItem(BS_SESSION_KEY, res.sessionToken);
  }
}

export function isBetterSignSession() {
  const marked = localStorage.getItem(BS_SESSION_KEY);
  return !!marked && marked === localStorage.getItem("accesstoken");
}

// Whether to offer "Sign on phone" for a widget: a BetterSign session, a saved
// document, and a signature or initials field.
export function canSignOnPhone(docId, widgetType) {
  return (
    !!docId &&
    ["signature", "initials"].includes(widgetType) &&
    isBetterSignSession()
  );
}

const DELIVERY = ["live", "seen", "pushed", "queued"];
const RETRY_MS = 1500;

export default function PhoneSign({
  isOpen,
  onClose,
  docId,
  fieldKey,
  kind,
  onSigned
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const runRef = useRef(0);

  const fail = (msg) => {
    setBusy(false);
    setIsError(true);
    setStatus(msg);
  };
  const waiting = (delivery) =>
    t(`phone-sign.${DELIVERY.includes(delivery) ? delivery : "queued"}`);

  async function send() {
    const run = ++runRef.current;
    const live = () => run === runRef.current;
    setBusy(true);
    setIsError(false);
    setStatus(t("phone-sign.sending"));
    let requestId;
    let delivery;
    try {
      const res = await Parse.Cloud.run("bsphonesignstart", {
        docId,
        fieldId: String(fieldKey),
        kind: kind === "initials" ? "initials" : "signature"
      });
      requestId = res.requestId;
      delivery = res.delivery;
    } catch (e) {
      if (live()) fail(e?.message || t("phone-sign.send-failed"));
      return;
    }
    while (live()) {
      setStatus(waiting(delivery));
      let res;
      try {
        res = await Parse.Cloud.run("bsphonesignpoll", { requestId, delivery });
      } catch (e) {
        if (!live()) return;
        setStatus(t("phone-sign.retrying"));
        await new Promise((r) => setTimeout(r, RETRY_MS));
        continue;
      }
      if (!live()) return;
      if (res.status === "signed") {
        setBusy(false);
        setStatus(t("phone-sign.signed"));
        onSigned && onSigned(res.image);
        return;
      }
      if (res.status === "denied") return fail(t("phone-sign.denied"));
      if (res.status === "expired") return fail(t("phone-sign.expired"));
      if (res.status === "failed") return fail(t("phone-sign.failed"));
      if (res.delivery) delivery = res.delivery;
      if (res.retry) await new Promise((r) => setTimeout(r, RETRY_MS));
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
      title={t("phone-sign.title")}
      handleClose={close}
      reduceWidth="max-w-[420px]"
    >
      <Box sx={{ px: 2, py: 1.5, color: "text.primary" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          {busy && <CircularProgress size={20} />}
          <Typography
            role="status"
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
            {busy ? t("phone-sign.cancel") : t("phone-sign.close")}
          </Button>
          {isError && (
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={send}
            >
              {t("phone-sign.send-again")}
            </Button>
          )}
        </Box>
      </Box>
    </ModalUi>
  );
}
