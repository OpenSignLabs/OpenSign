import { useState, useEffect, useMemo, useRef } from "react";
import ModalUi from "./ModalUi";
import Loader from "./Loader";
import { Trans, useTranslation } from "react-i18next";

const DeleteUserModal = ({
  isOpen,
  userEmail,
  deleting = false,
  deleteRes,
  onConfirm,
  handleClose
}) => {
  const { t } = useTranslation();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmEmail("");
      setError(null);
      // small timeout to ensure the modal is mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Adjust matching rule as needed (strict vs case-insensitive)
  const isMatch = useMemo(() => {
    const a = confirmEmail.trim().toLowerCase();
    const b = userEmail.trim().toLowerCase();
    return a.length > 0 && a === b;
  }, [confirmEmail, userEmail]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setError(null);
    if (!isMatch || deleting) return;
    try {
      await onConfirm();
    } catch (err) {
      console.log("err ", err);
      setError(err?.message || t("something-went-wron-mssg"));
    }
  };

  return (
    <ModalUi
      title={t("delete-account")}
      isOpen={isOpen}
      handleClose={() => !deleting && handleClose()}
    >
      {deleting ? (
        <div className="h-[100px] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          {deleteRes ? (
            <div className="h-[100px] flex justify-center items-center text-sm md:text-base">
              {deleteRes}
            </div>
          ) : (
            <form
              className="px-6 mb-3 mt-2 text-base-content text-sm md:text-base"
              onSubmit={(e) => handleSubmit(e)}
            >
              <p className="text-base-content">
                {t("delete-account-que-user")}
              </p>
              <label className="mt-2 mb-0">
                <p className="text-xs text-base-content cursor-text mb-1">
                  <Trans
                    i18nKey={"please-type-to-confirm"}
                    values={{ userEmail }}
                    components={{ 1: <b /> }}
                  />
                </p>
                <input
                  type="text"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value?.trim())}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  aria-invalid={!isMatch && confirmEmail.length > 0}
                  required
                />
                <div className="op-label h-5">
                  {!isMatch && confirmEmail.length > 0 ? (
                    <span className="op-label-text-alt text-error">
                      {t("email-does-not-match")}
                    </span>
                  ) : (
                    <span className="op-label-text-alt">
                      {error ? error : <>&nbsp;</>}
                    </span>
                  )}
                </div>
              </label>

              <div className="mt-1">
                <button
                  type="submit"
                  className="op-btn op-btn-primary w-[100px]"
                  disabled={!isMatch || deleting}
                  aria-disabled={!isMatch || deleting}
                  title={!isMatch ? t("type-exact-email-delete") : t("delete")}
                >
                  {t("delete")}
                </button>
                <button
                  className="op-btn op-btn-secondary ml-2 w-[100px]"
                  onClick={handleClose}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </ModalUi>
  );
};

export default DeleteUserModal;
