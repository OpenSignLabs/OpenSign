import { useTranslation } from "react-i18next";

function ResponseTab({
  prefillCount = 0,
  documentCount = 0,
  message = { status: "", message: "" }
}) {
  const { t } = useTranslation();
  const { status, message: msg } = message;
  return (
    <div className="rounded-box border p-4 m-3 md:m-6 ">
      <div className="font-medium">{t("summary")}</div>
      <ul className="mt-2 list-disc pl-5 text-base-content/80">
        <li>
          {t("prefill-fields")}: {prefillCount}
        </li>
        <li>
          {t("documents")}: {documentCount}
        </li>
        <li>
          {t("status")}: {status}
        </li>
        {msg && (
          <li>
            {t("message")}: {msg}
          </li>
        )}
      </ul>
    </div>
  );
}

export default ResponseTab;
