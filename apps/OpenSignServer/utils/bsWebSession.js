// Which web sessions came from "Sign in with BetterSign" (bsidlogin, or
// bsextlogin through the extension), and for which VLAD. Features that need
// the signer's BetterSign identity, such as "Sign on phone"
// (cloud/parsefunction/bsPhoneSign.js), are only for these sessions: a
// recipient who opened the emailed link, or anyone with a session minted
// another way, has no row.
//
// bs_WebSession (master key only): { TokenHash: sha256(session token) hex,
// vlad, UserId, ExpiresAt }. The Parse session itself still has to be valid;
// a row outliving its session (logout) matches nothing.

import crypto from 'node:crypto';
import { accountForVlad } from './bsIdentity.js';

const CLASS = 'bs_WebSession';
// Parse's default session length.
const TTL_MS = 365 * 24 * 60 * 60 * 1000;

const tokenHash = token => crypto.createHash('sha256').update(String(token)).digest('hex');

export async function recordBsIdSession(sessionToken, vlad, userId) {
  const row = new Parse.Object(CLASS);
  row.set('TokenHash', tokenHash(sessionToken));
  row.set('vlad', vlad);
  row.set('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
  row.set('ExpiresAt', new Date(Date.now() + TTL_MS));
  row.setACL(new Parse.ACL());
  await row.save(null, { useMasterKey: true });
  // Sweep expired rows; never blocks or fails the sign-in.
  new Parse.Query(CLASS)
    .lessThan('ExpiresAt', new Date())
    .limit(100)
    .find({ useMasterKey: true })
    .then(rows => rows.length && Parse.Object.destroyAll(rows, { useMasterKey: true }))
    .catch(() => {});
}

// The VLAD behind a cloud function request's session, or null if the session
// didn't come from Sign in with BetterSign or the VLAD is no longer linked to
// this user.
export async function bsIdSessionVlad(request) {
  const user = request.user;
  const token = user?.getSessionToken?.() || request.headers?.['x-parse-session-token'];
  if (!user || !token) return null;
  const row = await new Parse.Query(CLASS)
    .equalTo('TokenHash', tokenHash(token))
    .greaterThan('ExpiresAt', new Date())
    .first({ useMasterKey: true });
  if (!row || row.get('UserId')?.id !== user.id) return null;
  const vlad = row.get('vlad');
  const account = await accountForVlad(vlad);
  return account.user?.id === user.id ? vlad : null;
}
