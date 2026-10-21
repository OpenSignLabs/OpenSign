const QUOTA_ERROR_MESSAGES = [
  "insufficient credit",
  "exhausted",
  "quota reached",
  "free document creation quota",
  "assigned api credits"
];

export function getErrorMessage(error, seen = new Set()) {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object" || seen.has(error)) return "";

  seen.add(error);
  const candidates = [
    error?.response?.data?.error,
    error?.response?.data?.message,
    error?.response?.data?.result?.error,
    error?.response?.data?.result?.message,
    error?.error,
    error?.message,
    error?.response?.data
  ];

  for (const candidate of candidates) {
    const message = getErrorMessage(candidate, seen);
    if (message) return message;
  }

  return "";
}

export function isCreditQuotaError(error) {
  const isQuotaStatus =
    error?.status === 429 ||
    error?.code === 429 ||
    error?.response?.status === 429;
  if (isQuotaStatus) return true;

  const normalizedMessage = getErrorMessage(error).toLowerCase();
  return QUOTA_ERROR_MESSAGES.some((fragment) =>
    normalizedMessage.includes(fragment)
  );
}
