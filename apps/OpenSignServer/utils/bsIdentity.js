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
// account. After that: bump LastSeenAt on its unassigned row, if it has one.
// Never throws; a failure here mustn't change the sign-in answer.
export async function recordSignInAttempt(vladHex) {
  try {
    const vlad = String(vladHex || '').toLowerCase();
    if (!VLAD_HEX_RE.test(vlad)) return;
    const q = new Parse.Query('bs_Identity');
    q.equalTo('vlad', vlad);
    q.limit(10);
    const rows = await q.find({ useMasterKey: true });
    if (rows.some(r => r.get('Active') === true)) return;
    const row = rows.length ? rows.find(r => !r.get('UserId')) : new Parse.Object('bs_Identity');
    if (!row) return;
    if (!row.id) {
      row.set('vlad', vlad);
      row.set('Label', ATTEMPT_LABEL);
      row.set('Active', false);
      row.setACL(new Parse.ACL());
    }
    row.set('LastSeenAt', new Date());
    await row.save(null, { useMasterKey: true });
  } catch (e) {
    console.error('bsIdentity: could not record a sign-in attempt', e?.message || e);
  }
}

// beforeSave for bs_Identity: store vlad as lower-case hex, default Active to
// false, and allow only one active row per VLAD, with an account, so a lookup
// is never a guess.
export async function bsIdentityBeforeSave(request) {
  const row = request.object;
  const vlad = String(row.get('vlad') || '').toLowerCase();
  if (!VLAD_HEX_RE.test(vlad)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'vlad must be lower-case hex.');
  }
  row.set('vlad', vlad);
  if (typeof row.get('Active') !== 'boolean') row.set('Active', false);
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
