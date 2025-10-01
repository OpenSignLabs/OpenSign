import { useMemo, useState } from "react";
import ModalUi from "./ModalUi";
import { useTranslation } from "react-i18next";

/**
 * PasswordResetModal
 * - Validates password rules (length >= 8, upper, lower, digit, special)
 * - Buttons: Submit, Autogenerate (12 chars), Copy (Font Awesome icon only)
 * - `Autogenerate` fills a valid 12-char password but remains editable
 * - `Copy` copies the current password to clipboard
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (password: string) => Promise<void> | void
 */
export default function PasswordResetModal({
  userId,
  isOpen,
  onClose,
  onSubmit,
  showAlert
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validation helpers
  const rules = useMemo(
    () => ({
      hasUpper: /[A-Z]/,
      hasLower: /[a-z]/,
      hasDigit: /\d/,
      // Richer special set including common keyboard symbols
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
      minLen: 8
    }),
    []
  );

  const checks = useMemo(() => {
    return {
      lenOK: password.length >= rules.minLen,
      upperLowerDigitOK:
        rules.hasUpper.test(password) &&
        rules.hasLower.test(password) &&
        rules.hasDigit.test(password),
      specialOK: rules.hasSpecial.test(password)
    };
  }, [password, rules]);

  // Always-present condition list with per-condition status
  const conditions = useMemo(
    () => [
      {
        key: "len",
        ok: checks.lenOK,
        text: "password-length"
      },
      {
        key: "uld",
        ok: checks.upperLowerDigitOK,
        text: "password-case"
      },
      {
        key: "spec",
        ok: checks.specialOK,
        text: "password-special-case"
      }
    ],
    [checks]
  );

  const allValid = conditions.every((c) => c.ok) && password.length > 0;

  // Autogenerate a valid random password (12 chars)
  const handleAutogen = () => {
    const length = 12;
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // omit ambiguous I/O
    const lower = "abcdefghijkmnopqrstuvwxyz"; // omit ambiguous l
    const digits = "23456789"; // omit 0/1
    const special = "!@#$%^&*()-_=+[]{};:,.?";
    const all = upper + lower + digits + special;

    function pick(str) {
      return str[Math.floor(Math.random() * str.length)];
    }
    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    let pwd = [pick(upper), pick(lower), pick(digits), pick(special)];
    while (pwd.length < length) pwd.push(pick(all));
    pwd = shuffle(pwd).join("");

    setPassword(pwd);
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      showAlert("success", t("copied"), 1200);
      setCopied(true);
      setTimeout(() => setCopied(false, 1200));
    } catch (e) {
      console.error("Clipboard error", e);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!allValid) return; // guard
    try {
      setSubmitting(true);
      await onSubmit?.(userId, password);
      setSubmitting(false);
      onClose?.();
      setPassword("");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <>
      <ModalUi
        isOpen={isOpen}
        title={t("reset-password")}
        handleClose={() => {
          setPassword("");
          onClose?.();
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-3 pt-[15px] p-[20px]">
          <p className="text-sm text-base-content/60">
            {t("enter-strong-password")}
          </p>
          <label className="op-form-control w-full">
            <div className="op-label">
              <span className="op-label-text">{t("new-password")}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                placeholder="Enter password or click Autogenerate"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="op-btn op-btn-square op-btn-sm"
                onClick={handleCopy}
                title={copied ? "Copied" : "Copy"}
                aria-label="Copy password"
                disabled={!password}
              >
                <i
                  className={`fa-regular fa-copy ${copied ? "opacity-70" : ""}`}
                ></i>
              </button>
            </div>
          </label>

          {/* When everything is valid, show just a right tick */}
          <ul className="mt-1 ml-2">
            {conditions.map((c) => (
              <li
                key={c.key}
                className={`${c.ok ? "text-success" : "text-error"} text-[12px] leading-snug`}
              >
                {c.ok ? "✓" : "✗"} {t(c.text)}
              </li>
            ))}
          </ul>

          <div className="pt-2 flex flex-row gap-x-2">
            <button
              type="submit"
              className="op-btn op-btn-primary"
              disabled={!allValid || submitting}
            >
              {t("submit")}
            </button>
            <button type="button" className="op-btn" onClick={handleAutogen}>
              {t("autogenerate")}
            </button>
            <button
              type="button"
              className="op-btn op-btn-ghost"
              onClick={() => {
                setPassword("");
                onClose?.();
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </ModalUi>
    </>
  );
}
