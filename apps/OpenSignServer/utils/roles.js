// Single source of truth for the role values the server accepts.
// The legacy `contracts_*` names are still present in existing databases.
export const ADMIN_ROLES = ['contracts_Admin', 'Admin'];
export const ORG_ADMIN_ROLES = ['contracts_OrgAdmin', 'OrgAdmin'];
export const ALL_ADMIN_ROLES = [...ADMIN_ROLES, ...ORG_ADMIN_ROLES];

export const isAdminRole = role => ALL_ADMIN_ROLES.includes(role);
export const isOrgAdminRole = role => ORG_ADMIN_ROLES.includes(role);
