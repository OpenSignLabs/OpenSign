export function resolveLoginIllustrationUrl(value, fallback) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return fallback;

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? candidate : fallback;
  } catch {
    return fallback;
  }
}
