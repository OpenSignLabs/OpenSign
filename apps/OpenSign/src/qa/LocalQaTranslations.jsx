import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { LOCAL_QA_DASHBOARD_ID } from "./localQaIdentity";

export function flattenTranslationValues(value, prefix = "", rows = []) {
  if (typeof value === "string") {
    rows.push({ key: prefix, value });
    return rows;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      flattenTranslationValues(item, `${prefix}[${index}]`, rows)
    );
    return rows;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) =>
      flattenTranslationValues(child, prefix ? `${prefix}.${key}` : key, rows)
    );
  }

  return rows;
}

const LocalQaTranslations = () => {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/locales/en/translation.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the English locale.");
        return response.json();
      })
      .then((translation) => {
        if (!cancelled) setEntries(flattenTranslationValues(translation));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return entries.filter(
      ({ key, value }) =>
        key.toLowerCase().includes(normalizedQuery) ||
        value.toLowerCase().includes(normalizedQuery)
    );
  }, [entries, query]);

  const visibleMatches = matches.slice(0, 100);

  return (
    <section
      aria-labelledby="local-qa-translations-title"
      className="mx-auto w-full max-w-5xl space-y-4 p-3 text-base-content"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            id="local-qa-translations-title"
            className="text-2xl font-semibold"
          >
            Local English translation preview
          </h1>
          <p className="text-sm opacity-70">
            Read-only values from the English locale file. Visual QA only.
          </p>
        </div>
        <Link
          to={`/dashboard/${LOCAL_QA_DASHBOARD_ID}`}
          className="rounded border border-base-300 px-3 py-2 text-sm underline"
        >
          Back to dashboard
        </Link>
      </div>

      <label className="block space-y-1 text-sm font-medium">
        Search by translation key or text
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="For example: resend-mail-help or verification code"
          className="w-full rounded border border-base-300 bg-base-100 px-3 py-2 font-normal"
          aria-label="Search English translation keys and text"
        />
      </label>

      {loadError ? (
        <p role="alert" className="rounded bg-error/10 p-3">
          The English translation file could not be loaded.
        </p>
      ) : !query.trim() ? (
        <p className="rounded bg-base-200 p-3 text-sm">
          Enter a key or phrase to preview its exact English value.
        </p>
      ) : (
        <section aria-live="polite" className="space-y-3">
          <p className="text-sm opacity-70">
            {matches.length === 0
              ? "No matching English translations."
              : `Showing ${visibleMatches.length} of ${matches.length} matching values.`}
          </p>
          <ul className="space-y-2">
            {visibleMatches.map(({ key, value }) => (
              <li
                key={key}
                className="rounded border border-base-300 bg-base-100 p-3"
              >
                <code className="block break-all text-xs opacity-70">
                  {key}
                </code>
                <p className="mt-1 break-words text-sm">{value}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
};

export default LocalQaTranslations;
