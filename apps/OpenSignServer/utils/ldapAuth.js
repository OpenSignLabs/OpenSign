import { Client } from 'ldapts';
import { logger } from './logger.js';
import { getLdapConfig } from './ldapConfig.js';

/**
 * Escapes characters with special meaning in LDAP search filters (RFC 4515).
 * Prevents LDAP injection vulnerabilities.
 * @param {string} input
 * @returns {string}
 */
export function escapeLdapFilter(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\x00/g, '\\00');
}

/**
 * Authenticates user credentials against the configured LDAP server.
 * Returns user directory attributes on success, or null on failure.
 *
 * @param {string} usernameOrEmail
 * @param {string} password
 * @param {object} [customConfig]
 * @returns {Promise<{ authenticated: boolean, dn: string, attributes: object } | null>}
 */
export async function authenticateLdap(usernameOrEmail, password, customConfig = null) {
  const config = customConfig || getLdapConfig(process.env);
  if (!config.enabled) {
    return null;
  }

  if (!usernameOrEmail || !password) {
    return null;
  }

  const clientOptions = {
    url: config.url,
    timeout: 10000,
    connectTimeout: 5000,
  };

  if (config.url.startsWith('ldaps://') || config.startTls) {
    clientOptions.tlsOptions = {
      rejectUnauthorized: config.rejectUnauthorized,
    };
  }

  const client = new Client(clientOptions);

  try {
    if (config.startTls) {
      await client.startTLS(clientOptions.tlsOptions || {});
    }

    let userDn = null;
    let userAttributes = {};

    // 1. Search for user entry if searchBase is configured
    if (config.searchBase) {
      if (config.bindDn) {
        await client.bind(config.bindDn, config.bindPassword);
      }

      const safeInput = escapeLdapFilter(usernameOrEmail);
      const filter = config.searchFilter
        .replace(/{{username}}/g, safeInput)
        .replace(/{{input}}/g, safeInput);

      const searchResult = await client.search(config.searchBase, {
        filter,
        scope: 'sub',
        attributes: [
          config.emailAttr,
          config.nameAttr,
          config.phoneAttr,
          'mail',
          'displayName',
          'cn',
          'name',
          'givenName',
          'sn',
          'telephoneNumber',
          'mobile',
          'userPrincipalName',
          'uid',
          'sAMAccountName',
        ],
      });

      const entries = searchResult?.searchEntries || [];
      if (!entries.length) {
        logger.warn(`[LDAP] User not found for filter: ${filter}`);
        return null;
      }

      userDn = entries[0].dn;
      userAttributes = entries[0];
    } else if (config.userDnTemplate) {
      userDn = config.userDnTemplate.replace(/{{username}}/g, escapeLdapFilter(usernameOrEmail));
    } else if (usernameOrEmail.includes('=')) {
      userDn = usernameOrEmail;
    }

    if (!userDn) {
      logger.warn(`[LDAP] Could not resolve DN for user: ${usernameOrEmail}`);
      return null;
    }

    // 2. Bind with user DN and password to verify credentials
    const userClient = new Client(clientOptions);
    try {
      if (config.startTls) {
        await userClient.startTLS(clientOptions.tlsOptions || {});
      }
      await userClient.bind(userDn, password);
      return {
        authenticated: true,
        dn: userDn,
        attributes: userAttributes,
      };
    } finally {
      await userClient.unbind().catch(() => {});
    }
  } catch (error) {
    logger.error(`[LDAP] Authentication error for ${usernameOrEmail}: ${error.message}`);
    return null;
  } finally {
    await client.unbind().catch(() => {});
  }
}
