import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createSigningLink } from "../../utils/documentAccess";

export default function SecureSignerLink({ docId, recipientId, email }) {
  const { t } = useTranslation();
  const [link, setLink] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    createSigningLink(docId, recipientId, email)
      .then((value) => {
        if (!cancelled) setLink(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [docId, recipientId, email]);
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <span>{email}</span>
      {failed ? (
        <span role="alert">{t("document-unavailable", { defaultValue: "Link unavailable" })}</span>
      ) : (
        <button
          type="button"
          disabled={!link}
          className="op-btn op-btn-sm"
          onClick={() => navigator.clipboard.writeText(link)}
        >
          {t("copy-link")}
        </button>
      )}
    </div>
  );
}
