// VLAD -> OpenSign account, shared by browser sign-in (bsidlogin) and the
// desktop API (/api/v1). Only linked VLADs can sign in, and only to an account
// that already exists: an admin links them (Users page), not the user.
//
// Links live in the bs_Identity class (master-key only):
// { vlad, UserId, Label, Active, LastSeenAt }. The VLAD's active row
// (Active === true) gives the account; with no active row the VLAD is
// blocked. bsIdentityBeforeSave keeps it to one active row per VLAD, and an
// active row must have an account; if there are ever more, nobody signs in
// until an admin fixes it.
//
// A verified VLAD that tries to sign in without an active link is recorded as
// an inactive row with no account (recordSignInAttempt), so an admin can find
// it on the Users page and link it.

export const VLAD_HEX_RE = /^[0-9a-f]+$/;
export const ATTEMPT_LABEL = 'Sign-in attempt';

// Returns { user, email, source } or
// { reason: 'not_linked' | 'inactive' | 'ambiguous' | 'no_account' }.
export async function accountForVlad(vladHex) {
  const vlad = String(vladHex || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) return { reason: 'not_linked' };

  const idQuery = new Parse.Query('bs_Identity');
  idQuery.equalTo('vlad', vlad);
  idQuery.include('UserId');
  idQuery.limit(10);
  const rows = await idQuery.find({ useMasterKey: true });
  if (!rows.length) return { reason: 'not_linked' };
  const active = rows.filter(r => r.get('Active') === true);
  if (active.length === 0) return { reason: 'inactive' };
  if (active.length > 1) {
    console.error(`bsIdentity: ${active.length} active bs_Identity rows for one VLAD`);
    return { reason: 'ambiguous' };
  }
  const user = active[0].get('UserId');
  if (!user) return { reason: 'no_account' };
  return { user, email: user.get('username'), source: 'bs_Identity' };
}

// A VLAD whose owner proved it (bs-id's id_token, or the verifier) tried to
// sign in and has no active link. First time: add an inactive row with no
// account. After that: bump LastSeenAt on its unassigned row, or else on its
// newest row (a link that's turned off), so admins see it's still trying.
// Never throws; a failure here mustn't change the sign-in answer.
export async function recordSignInAttempt(vladHex) {
  try {
    const vlad = String(vladHex || '').toLowerCase();
    if (!VLAD_HEX_RE.test(vlad)) return;
    const q = new Parse.Query('bs_Identity');
    q.equalTo('vlad', vlad);
    q.descending('createdAt');
    q.limit(10);
    const rows = await q.find({ useMasterKey: true });
    if (rows.some(r => r.get('Active') === true)) return;
    const row = rows.find(r => !r.get('UserId')) || rows[0];
    if (row) {
      row.set('LastSeenAt', new Date());
      await row.save(null, { useMasterKey: true });
      return;
    }
    const created = new Parse.Object('bs_Identity');
    created.set('vlad', vlad);
    created.set('Label', ATTEMPT_LABEL);
    created.set('Active', false);
    created.set('LastSeenAt', new Date());
    created.setACL(new Parse.ACL());
    await created.save(null, { useMasterKey: true });
    await dropDuplicateAttempts(vlad);
  } catch (e) {
    console.error('bsIdentity: could not record a sign-in attempt', e?.message || e);
  }
}

// Two first attempts at once can each add a row. Keep the oldest unassigned
// row and delete the rest; every racer picks the same one.
async function dropDuplicateAttempts(vlad) {
  const q = new Parse.Query('bs_Identity');
  q.equalTo('vlad', vlad);
  q.doesNotExist('UserId');
  q.equalTo('Active', false);
  q.ascending('createdAt');
  q.addAscending('objectId');
  q.limit(10);
  const rows = await q.find({ useMasterKey: true });
  if (rows.length > 1) {
    await Parse.Object.destroyAll(rows.slice(1), { useMasterKey: true }).catch(() => {});
  }
}

// beforeSave for bs_Identity: store vlad as lower-case hex, default Active to
// false on a new row (an update that doesn't send Active leaves it alone), and
// allow only one active row per VLAD, with an account, so a lookup is never a
// guess.
export async function bsIdentityBeforeSave(request) {
  const row = request.object;
  const vlad = String(row.get('vlad') || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'vlad must be lower-case hex.');
  }
  row.set('vlad', vlad);
  if (!request.original && typeof row.get('Active') !== 'boolean') row.set('Active', false);
  if (!row.get('Active')) return;
  if (!row.get('UserId')) {
    throw new Parse.Error(
      Parse.Error.VALIDATION_ERROR,
      'Choose an account before turning this link on.'
    );
  }
  const q = new Parse.Query('bs_Identity');
  q.equalTo('vlad', vlad);
  q.equalTo('Active', true);
  if (row.id) q.notEqualTo('objectId', row.id);
  if (await q.first({ useMasterKey: true })) {
    throw new Parse.Error(
      Parse.Error.DUPLICATE_VALUE,
      'This VLAD already has an active link. Turn that one off first.'
    );
  }
}
