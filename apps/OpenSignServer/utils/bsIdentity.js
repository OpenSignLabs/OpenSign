// VLAD -> OpenSign account, shared by browser sign-in (bsidlogin) and the
// desktop API (/api/v1). Only listed VLADs can sign in, and only to an account
// that already exists: an admin links them, not the user.
//
// Two sources, checked in order:
//   1. the bs_Identity class (master-key only): { vlad, UserId, Label, RevokedAt }.
//      The VLAD's active row (no RevokedAt) wins. With only revoked rows the
//      VLAD is blocked, even if BS_ID_USERS lists it. bsIdentityBeforeSave
//      keeps it to one active row per VLAD; if there are ever more, nobody
//      signs in until an admin fixes it.
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

// Returns { user, email, source } or
// { reason: 'not_linked' | 'revoked' | 'ambiguous' | 'no_account', email? }.
export async function accountForVlad(vladHex) {
  const vlad = String(vladHex || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) return { reason: 'not_linked' };

  const idQuery = new Parse.Query('bs_Identity');
  idQuery.equalTo('vlad', vlad);
  idQuery.include('UserId');
  idQuery.limit(10);
  const rows = await idQuery.find({ useMasterKey: true });
  if (rows.length) {
    const active = rows.filter(r => !r.get('RevokedAt'));
    if (active.length === 0) return { reason: 'revoked' };
    if (active.length > 1) {
      console.error(`bsIdentity: ${active.length} active bs_Identity rows for one VLAD`);
      return { reason: 'ambiguous' };
    }
    const user = active[0].get('UserId');
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

// beforeSave for bs_Identity: store vlad as lower-case hex, and allow only one
// active (unrevoked) row per VLAD, so a lookup is never a guess.
export async function bsIdentityBeforeSave(request) {
  const row = request.object;
  const vlad = String(row.get('vlad') || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'vlad must be lower-case hex.');
  }
  row.set('vlad', vlad);
  if (row.get('RevokedAt')) return;
  const q = new Parse.Query('bs_Identity');
  q.equalTo('vlad', vlad);
  q.doesNotExist('RevokedAt');
  if (row.id) q.notEqualTo('objectId', row.id);
  if (await q.first({ useMasterKey: true })) {
    throw new Parse.Error(
      Parse.Error.DUPLICATE_VALUE,
      'This VLAD already has an active link. Revoke it first.'
    );
  }
}
