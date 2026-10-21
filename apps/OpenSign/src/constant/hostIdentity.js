export const OPEN_SIGN_FIRST_PARTY_ORIGINS = Object.freeze([
  "https://app.opensignlabs.com",
  "https://eu-app.opensignlabs.com",
  "https://sandbox.opensignlabs.com",
  "https://staging-app.opensignlabs.com"
]);

export const RESERVED_FIRST_PARTY_ORIGINS = Object.freeze([
  ...OPEN_SIGN_FIRST_PARTY_ORIGINS,
  "https://app.qiksign.com",
  "https://eu-app.qiksign.com"
]);

const isLocalDevelopmentOrigin = (origin, includeLocalhost) => {
  if (!includeLocalhost) return false;
  try {
    const url = new URL(origin);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

export function isOpenSignFirstPartyOrigin(origin, includeLocalhost = false) {
  return (
    OPEN_SIGN_FIRST_PARTY_ORIGINS.includes(origin) ||
    isLocalDevelopmentOrigin(origin, includeLocalhost)
  );
}

export function isReservedFirstPartyOrigin(origin, includeLocalhost = false) {
  return (
    RESERVED_FIRST_PARTY_ORIGINS.includes(origin) ||
    isLocalDevelopmentOrigin(origin, includeLocalhost)
  );
}
