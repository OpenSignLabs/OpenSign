import { ALL_ADMIN_ROLES } from '../utils/roles.js';
import CheckAdminExist from '../cloud/parsefunction/CheckAdminExist.js';

describe('CheckAdminExist wiring (#49)', () => {
  it('shares the single ALL_ADMIN_ROLES source', async () => {
    const mod = await import('../cloud/parsefunction/CheckAdminExist.js');
    expect(typeof mod.default).toBe('function');
    expect(ALL_ADMIN_ROLES).toEqual([
      'contracts_Admin',
      'Admin',
      'contracts_OrgAdmin',
      'OrgAdmin'
    ]);
    expect(CheckAdminExist).toBe(mod.default);
  });
});
