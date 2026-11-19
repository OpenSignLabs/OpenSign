import { getLdapConfig } from '../utils/ldapConfig.js';
import { escapeLdapFilter } from '../utils/ldapAuth.js';

describe('getLdapConfig', () => {
  it('is disabled by default when LDAP_ENABLED is unset', () => {
    const config = getLdapConfig({});
    expect(config.enabled).toBe(false);
  });

  it('is disabled when LDAP_ENABLED is false', () => {
    const config = getLdapConfig({ LDAP_ENABLED: 'false' });
    expect(config.enabled).toBe(false);
  });

  it('parses valid LDAP configuration with default values', () => {
    const config = getLdapConfig({
      LDAP_ENABLED: 'true',
    });
    expect(config.enabled).toBe(true);
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(389);
    expect(config.url).toBe('ldap://localhost:389');
    expect(config.emailAttr).toBe('mail');
    expect(config.nameAttr).toBe('displayName');
    expect(config.phoneAttr).toBe('telephoneNumber');
    expect(config.startTls).toBe(false);
    expect(config.rejectUnauthorized).toBe(true);
    expect(config.allowFallback).toBe(true);
  });

  it('respects custom host, port and LDAPS protocol', () => {
    const config = getLdapConfig({
      LDAP_ENABLED: 'true',
      LDAP_HOST: 'directory.corp.internal',
      LDAP_PORT: '636',
    });
    expect(config.enabled).toBe(true);
    expect(config.host).toBe('directory.corp.internal');
    expect(config.port).toBe(636);
    expect(config.url).toBe('ldaps://directory.corp.internal:636');
  });

  it('prefers explicit LDAP_URL if provided', () => {
    const config = getLdapConfig({
      LDAP_ENABLED: 'true',
      LDAP_URL: 'ldaps://custom.example.com:10636',
    });
    expect(config.url).toBe('ldaps://custom.example.com:10636');
  });

  it('reads bind credentials and search parameters', () => {
    const config = getLdapConfig({
      LDAP_ENABLED: 'true',
      LDAP_BIND_DN: 'cn=admin,dc=example,dc=org',
      LDAP_BIND_PASSWORD: 'secretpassword',
      LDAP_SEARCH_BASE: 'ou=users,dc=example,dc=org',
      LDAP_USER_FILTER: '(&(objectClass=inetOrgPerson)(uid={{username}}))',
      LDAP_EMAIL_ATTR: 'userPrincipalName',
      LDAP_NAME_ATTR: 'cn',
      LDAP_STARTTLS: 'true',
      LDAP_TLS_REJECT_UNAUTHORIZED: 'false',
      LDAP_ALLOW_LOCAL_FALLBACK: 'false',
    });
    expect(config.bindDn).toBe('cn=admin,dc=example,dc=org');
    expect(config.bindPassword).toBe('secretpassword');
    expect(config.searchBase).toBe('ou=users,dc=example,dc=org');
    expect(config.searchFilter).toBe('(&(objectClass=inetOrgPerson)(uid={{username}}))');
    expect(config.emailAttr).toBe('userPrincipalName');
    expect(config.nameAttr).toBe('cn');
    expect(config.startTls).toBe(true);
    expect(config.rejectUnauthorized).toBe(false);
    expect(config.allowFallback).toBe(false);
  });
});

describe('escapeLdapFilter', () => {
  it('escapes special characters to prevent LDAP injection', () => {
    expect(escapeLdapFilter('admin*')).toBe('admin\\2a');
    expect(escapeLdapFilter('user(test)')).toBe('user\\28test\\29');
    expect(escapeLdapFilter('domain\\user')).toBe('domain\\5cuser');
    expect(escapeLdapFilter('null\0byte')).toBe('null\\00byte');
  });

  it('leaves safe alphanumeric strings unchanged', () => {
    expect(escapeLdapFilter('johndoe')).toBe('johndoe');
    expect(escapeLdapFilter('john.doe@example.com')).toBe('john.doe@example.com');
  });

  it('handles non-string values gracefully', () => {
    expect(escapeLdapFilter(null)).toBe('');
    expect(escapeLdapFilter(undefined)).toBe('');
  });
});
