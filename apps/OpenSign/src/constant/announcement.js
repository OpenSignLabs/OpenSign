export function resolveAnnouncementTranslation(announcement, language) {
  const translations = announcement?.translations;
  if (!translations || typeof translations !== "object") return null;

  const normalizedLanguage = String(language || "")
    .trim()
    .toLowerCase();
  const normalizedTranslations = Object.fromEntries(
    Object.entries(translations).map(([locale, value]) => [
      locale.toLowerCase(),
      value
    ])
  );
  const baseLanguage = normalizedLanguage.split("-")[0];

  return (
    normalizedTranslations[normalizedLanguage] ||
    normalizedTranslations[baseLanguage] ||
    normalizedTranslations.en ||
    Object.values(normalizedTranslations)[0] ||
    null
  );
}
