import { logger } from '../../utils/logger.js';
import { getLdapConfig } from '../../utils/ldapConfig.js';
import { authenticateLdap } from '../../utils/ldapAuth.js';

function normalizeEmail(email) {
  return String(email || '')
    .toLowerCase()
    .replace(/\s/g, '');
}

async function findOrCreateTenant(userId) {
  const partnerQuery = new Parse.Query('partners_Tenant');
  partnerQuery.equalTo('IsActive', true);
  let tenant = await partnerQuery.first({ useMasterKey: true });
  if (!tenant) {
    const partnerCls = Parse.Object.extend('partners_Tenant');
    tenant = new partnerCls();
    tenant.set('TenantName', 'Organization');
    tenant.set('IsActive', true);
    if (userId) {
      tenant.set('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      tenant.set('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
    }
    await tenant.save(null, { useMasterKey: true });
  }
  return tenant;
}

export default async function loginUser(request) {
  const username = request.params.email;
  const password = request.params.password;

  if (!username || !password) {
    throw new Parse.Error(Parse.Error.PASSWORD_MISSING, 'username/password is missing.');
  }

  const ldapConfig = getLdapConfig(process.env);

  // 1. LDAP Authentication & Auto-Provisioning (if enabled)
  if (ldapConfig.enabled) {
    try {
      const ldapResult = await authenticateLdap(username, password, ldapConfig);
      if (ldapResult && ldapResult.authenticated) {
        logger.info(`[LDAP] User "${username}" successfully authenticated via LDAP`);

        const attrs = ldapResult.attributes || {};
        let email = attrs[ldapConfig.emailAttr] || attrs.mail || attrs.userPrincipalName || '';
        if (Array.isArray(email)) email = email[0];

        if (!email && username.includes('@')) {
          email = username;
        } else if (!email) {
          const defaultDomain = process.env.LDAP_DEFAULT_DOMAIN || 'ldap.local';
          email = `${username}@${defaultDomain}`;
        }
        email = normalizeEmail(email);

        let displayName =
          attrs[ldapConfig.nameAttr] || attrs.displayName || attrs.cn || attrs.name || '';
        if (Array.isArray(displayName)) displayName = displayName[0];
        if (!displayName) displayName = username;

        let phone = attrs[ldapConfig.phoneAttr] || attrs.telephoneNumber || attrs.mobile || '';
        if (Array.isArray(phone)) phone = phone[0];

        // Lookup existing user by email or username
        const emailQuery = new Parse.Query(Parse.User);
        emailQuery.equalTo('email', email);
        let parseUser = await emailQuery.first({ useMasterKey: true });

        if (!parseUser && username !== email) {
          const usernameQuery = new Parse.Query(Parse.User);
          usernameQuery.equalTo('username', username);
          parseUser = await usernameQuery.first({ useMasterKey: true });
        }

        if (parseUser) {
          // Sync password so Parse authentication succeeds
          parseUser.setPassword(password);
          parseUser.set('emailVerified', true);
          if (displayName && !parseUser.get('name')) {
            parseUser.set('name', displayName);
          }
          await parseUser.save(null, { useMasterKey: true });
        } else {
          // Auto-provision new user from LDAP
          parseUser = new Parse.User();
          parseUser.set('username', email);
          parseUser.set('email', email);
          parseUser.set('name', displayName);
          parseUser.set('password', password);
          parseUser.set('emailVerified', true);
          if (phone) parseUser.set('phone', phone);
          await parseUser.signUp();

          const totalUsers = await new Parse.Query('contracts_Users').count({ useMasterKey: true });
          const role =
            totalUsers === 0 ? 'contracts_Admin' : ldapConfig.defaultRole || 'contracts_User';

          const tenant = await findOrCreateTenant(parseUser.id);

          const extCls = Parse.Object.extend('contracts_Users');
          const extUser = new extCls();
          extUser.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: parseUser.id,
          });
          extUser.set('UserRole', role);
          extUser.set('Email', email);
          extUser.set('Name', displayName);
          if (phone) extUser.set('Phone', phone);
          extUser.set('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: tenant.id,
          });
          await extUser.save(null, { useMasterKey: true });
          logger.info(`[LDAP] Auto-provisioned user "${email}" with role "${role}"`);
        }

        const loginIdentifier = parseUser.get('username') || email;
        const loggedInUser = await Parse.User.logIn(loginIdentifier, password);
        return {
          ...loggedInUser.toJSON(),
        };
      }
    } catch (ldapErr) {
      logger.error(`[LDAP] Error during LDAP login for "${username}": ${ldapErr.message}`);
      if (!ldapConfig.allowFallback) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'LDAP authentication failed.');
      }
    }
  }

  // 2. Standard Parse User login (or fallback)
  try {
    const user = await Parse.User.logIn(username, password);
    if (user) {
      return {
        ...user.toJSON(),
      };
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'user not found.');
    }
  } catch (err) {
    logger.info('err in login user', err);
    throw err;
  }
}
