// This server's receiver VLAD: the receiver_vlad every signed message names
// (statement.js buildSignedMessage).
//
// BS_API_RECEIVER_VLAD wins when it's set. Otherwise we use one generated
// once and kept in bs_ApiConfig (master key only), so every machine and every
// restart uses the same value; a challenge from one machine has to verify on
// another. The first request loads it into process.env.BS_API_RECEIVER_VLAD.
//
// A generated value is "random", not a real identity: the 0x1207 VLAD sigil
// (varint 8724) and 32 random bytes. Nobody resolves or decodes it; it only
// has to be the same bytes on both sides of a signature, and unique to this
// server. Set BS_API_RECEIVER_VLAD to a real VLAD if OpenSign ever gets one.

import crypto from 'node:crypto';

const CONFIG_CLASS = 'bs_ApiConfig';
const KEY = 'receiverVlad';

export const randomVlad = () => '8724' + crypto.randomBytes(32).toString('hex');

let pending = null;

// Make sure process.env.BS_API_RECEIVER_VLAD is set. An explicit value is
// left alone even if it's malformed (config() then reports not_configured,
// rather than us silently replacing what an operator set).
export async function ensureReceiverVlad() {
  if ((process.env.BS_API_RECEIVER_VLAD || '').trim()) return;
  pending ??= loadOrCreate().finally(() => (pending = null));
  await pending;
}

// The oldest row wins, so two machines creating one at once still agree.
const oldest = () =>
  new Parse.Query(CONFIG_CLASS)
    .equalTo('Key', KEY)
    .ascending('createdAt')
    .addAscending('objectId')
    .first({ useMasterKey: true });

async function loadOrCreate() {
  let row = await oldest();
  if (!row) {
    const created = new Parse.Object(CONFIG_CLASS);
    created.set('Key', KEY);
    created.set('Value', randomVlad());
    created.setACL(new Parse.ACL());
    await created.save(null, { useMasterKey: true });
    row = await oldest();
    console.log(JSON.stringify({ event: 'bsapi_receiver_vlad_created', vlad: row.get('Value') }));
  }
  process.env.BS_API_RECEIVER_VLAD = row.get('Value');
}
