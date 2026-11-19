/**
 * LDAP configuration loader for OpenSign Server.
 * Reads environment variables and returns a structured LDAP configuration object.
 */
export function getLdapConfig(env = process.env) {
  const isEnabled = env.LDAP_ENABLED === 'true' || env.LDAP_ENABLED === true;
  if (!isEnabled) {
    return { enabled: false };
  }

  const port = parseInt(env.LDAP_PORT || '389', 10);
  const protocol = env.LDAP_PROTOCOL || (port === 636 ? 'ldaps' : 'ldap');
  const host = env.LDAP_HOST || 'localhost';
  const url = env.LDAP_URL || `${protocol}://${host}:${port}`;

  const bindDn = env.LDAP_BIND_DN || '';
  const bindPassword = env.LDAP_BIND_PASSWORD || '';
  const searchBase = env.LDAP_SEARCH_BASE || '';
  const userDnTemplate = env.LDAP_USER_DN_TEMPLATE || '';
  const searchFilter =
    env.LDAP_USER_FILTER ||
    env.LDAP_SEARCH_FILTER ||
    '(|(uid={{username}})(mail={{username}})(sAMAccountName={{username}})(userPrincipalName={{username}}))';

  const emailAttr = env.LDAP_EMAIL_ATTR || env.LDAP_EMAIL_ATTRIBUTE || 'mail';
  const nameAttr = env.LDAP_NAME_ATTR || env.LDAP_NAME_ATTRIBUTE || 'displayName';
  const phoneAttr = env.LDAP_PHONE_ATTR || env.LDAP_PHONE_ATTRIBUTE || 'telephoneNumber';

  const startTls = env.LDAP_STARTTLS === 'true' || env.LDAP_STARTTLS === true;
  const rejectUnauthorized = env.LDAP_TLS_REJECT_UNAUTHORIZED !== 'false';
  const allowFallback = env.LDAP_ALLOW_LOCAL_FALLBACK !== 'false';
  const defaultRole = env.LDAP_DEFAULT_ROLE || 'contracts_User';

  return {
    enabled: true,
    url,
    host,
    port,
    bindDn,
    bindPassword,
    searchBase,
    userDnTemplate,
    searchFilter,
    emailAttr,
    nameAttr,
    phoneAttr,
    startTls,
    rejectUnauthorized,
    allowFallback,
    defaultRole,
  };
}
