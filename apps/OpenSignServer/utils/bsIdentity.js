// VLAD -> OpenSign account, shared by browser sign-in (bsidlogin) and the
// desktop API (/api/v1). Only listed VLADs can sign in, and only to an account
// that already exists: an admin links them, not the user.
//
// Two sources, checked in order:
//   1. the bs_Identity class (master-key only): { vlad, UserId, Label, RevokedAt }.
//      A row with RevokedAt set blocks the VLAD, even if BS_ID_USERS lists it.
//   2. BS_ID_USERS, JSON { "<vladHex>": "<account email>" } (the original list,
//      kept so existing deployments work until their rows are added).

export const VLAD_HEX_RE = /^[0-9a-f]+$/;

// { vladHex (lower case): email (lower case) }
function envUsers() {
  if (!process.env.BS_ID_USERS) return {};
  try {
    const parsed = JSON.parse(process.env.BS_ID_USERS);
    const out = {};
    for (const [vlad, email] of Object.entries(parsed)) {
      out[vlad.toLowerCase()] = String(email).toLowerCase().replace(/\s/g, '');
    }
    return out;
  } catch {
    console.error('bsIdentity: BS_ID_USERS is not valid JSON');
    return {};
  }
}

// Returns { user, email, source } or { reason: 'not_linked' | 'revoked' | 'no_account', email? }.
export async function accountForVlad(vladHex) {
  const vlad = String(vladHex || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) return { reason: 'not_linked' };

  const idQuery = new Parse.Query('bs_Identity');
  idQuery.equalTo('vlad', vlad);
  idQuery.include('UserId');
  const row = await idQuery.first({ useMasterKey: true });
  if (row) {
    if (row.get('RevokedAt')) return { reason: 'revoked' };
    const user = row.get('UserId');
    if (!user) return { reason: 'no_account' };
    return { user, email: user.get('username'), source: 'bs_Identity' };
  }

  const email = envUsers()[vlad];
  if (!email) return { reason: 'not_linked' };
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', email);
  const user = await userQuery.first({ useMasterKey: true });
  if (!user) return { reason: 'no_account', email };
  return { user, email, source: 'BS_ID_USERS' };
}
