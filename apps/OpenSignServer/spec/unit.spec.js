import { stripHtml } from '../Utils.js';
import {
  ADMIN_ROLES,
  ORG_ADMIN_ROLES,
  ALL_ADMIN_ROLES,
  isAdminRole,
  isOrgAdminRole,
} from '../utils/roles.js';

// Pure helpers only: these run without a Parse Server or a database.
describe('stripHtml', () => {
  it('returns an empty string for an empty body', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });

  it('keeps the text content of a simple body', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('turns line breaks into newlines', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('<p>a</p><p>b</p>')).toBe('a\nb');
  });

  it('decodes the entities used in the templates', () => {
    expect(stripHtml('a&nbsp;b &amp; c &lt;d&gt;')).toBe('a b & c <d>');
  });

  it('drops style and script blocks entirely', () => {
    expect(stripHtml('<style>.a{color:red}</style><p>keep</p>')).toBe('keep');
    expect(stripHtml('<script>alert(1)</script><p>keep</p>')).toBe('keep');
  });

  it('collapses more than two consecutive newlines', () => {
    expect(stripHtml('<p>a</p><p></p><p></p><p>b</p>')).toBe('a\n\nb');
  });
});

describe('admin roles', () => {
  it('accepts every documented admin role', () => {
    expect(isAdminRole('contracts_Admin')).toBe(true);
    expect(isAdminRole('Admin')).toBe(true);
    expect(isAdminRole('contracts_OrgAdmin')).toBe(true);
    expect(isAdminRole('OrgAdmin')).toBe(true);
  });

  it('rejects a regular user and a missing role', () => {
    expect(isAdminRole('contracts_User')).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole('')).toBe(false);
  });

  it('separates the organization admin from the plain admin', () => {
    expect(isOrgAdminRole('contracts_OrgAdmin')).toBe(true);
    expect(isOrgAdminRole('OrgAdmin')).toBe(true);
    expect(isOrgAdminRole('contracts_Admin')).toBe(false);
  });

  it('keeps the legacy names in the lists used by the queries', () => {
    expect(ADMIN_ROLES).toContain('contracts_Admin');
    expect(ORG_ADMIN_ROLES).toContain('contracts_OrgAdmin');
    expect(ALL_ADMIN_ROLES.length).toBe(
      ADMIN_ROLES.length + ORG_ADMIN_ROLES.length
    );
  });
});
