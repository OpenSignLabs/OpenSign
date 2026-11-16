/**
 * VLAD -> account links now live only in bs_Identity (utils/bsIdentity.js).
 * Move the links that were in the BS_ID_USERS env var (fly.toml) into it, so
 * nobody loses sign-in when the var goes. A VLAD that already has a row
 * (on or off) is left alone, as is one whose account doesn't exist.
 *
 * The repo is public, so the built-in link names its account by the SHA-256 of
 * the email (lower case), matched against usernames, not by the email itself.
 *
 * @param {Parse} Parse
 */

const crypto = require('node:crypto');

const LABEL = 'Moved from BS_ID_USERS';
const SHA256_HEX_RE = /^[0-9a-f]{64}$/;
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

// fly.toml's BS_ID_USERS when it was removed: VLAD -> SHA-256 of the email.
const LINKS = {
  '8724b92483a6c006e9020061736d01000000010d0260047f7f7f7f017f6000017f0236020477616363155f636865636b5f707265696d6167655f76616c756500000477616363105f636865636b5f7369676e61747572650000030201010503010001071b020e6d6f76655f65766572795f7a69670002066d656d6f727902000a43014100412241224100410d100045044041000f0b41c4004122410d410e100045044041000f0b410d410e411b4107100145044041000f0b4100410d411b410710010f0b0b8101050041000b0d2f6b6579732f7072696d61727900410d0b0e2f6b6579732f7265636f7665727900411b0b072f656e7472792f0041220b221e2077a58fd6229b6ab20d2b23b373bbc28b49722627513f9044db83f1e29932ec4b0041c4000b221e201652d50f0f229f0bb6083f90b69b94e89bc6ccec314459ce2d6d7fd6429be3440029046e616d65012203000e636865636b5f707265696d6167650109636865636b5f73696702046d61696e01004042236b9e182148f78ef8bb8aea192267274eb3fc0ca128519fb5f6e6a83edc50cedc3bc33d86d31e74e72139cef720ee60ea9677c8b71d5933d13e3aec1fc':
    'c1f3ecab0cdd3f3d24d2a1cb00d10a5f166307efc0cccc5785f1e0ef822772ef',
};

// A deployment that still sets BS_ID_USERS (e.g. as a secret) gets its links
// moved too. Its values may be emails or their SHA-256.
function envLinks() {
  try {
    return JSON.parse(process.env.BS_ID_USERS || '{}');
  } catch {
    console.error('BS_ID_USERS is not valid JSON; not moving it');
    return {};
  }
}

// The account an entry names: by username, or by the SHA-256 of the username.
async function accountFor(Parse, value, byHash) {
  if (!SHA256_HEX_RE.test(value)) {
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('username', value);
    return userQuery.first({ useMasterKey: true });
  }
  if (!byHash.users) {
    const all = await new Parse.Query(Parse.User).findAll({ useMasterKey: true });
    byHash.users = new Map(all.map(u => [sha256(String(u.get('username') || '')), u]));
  }
  return byHash.users.get(value);
}

exports.up = async Parse => {
  const links = { ...LINKS, ...envLinks() };
  const byHash = {};
  for (const [vladHex, rawEmail] of Object.entries(links)) {
    const vlad = vladHex.toLowerCase();
    const email = String(rawEmail).toLowerCase().replace(/\s/g, '');

    const existing = new Parse.Query('bs_Identity');
    existing.equalTo('vlad', vlad);
    if (await existing.first({ useMasterKey: true })) continue;

    const user = await accountFor(Parse, email, byHash);
    if (!user) {
      const who = SHA256_HEX_RE.test(email) ? `sha256 ${email.slice(0, 12)}…` : email;
      console.log(`bs_Identity: no account ${who}; not linking ${vlad.slice(0, 16)}…`);
      continue;
    }

    const row = new Parse.Object('bs_Identity');
    row.set('vlad', vlad);
    row.set('UserId', user);
    row.set('Label', LABEL);
    row.set('Active', true);
    row.setACL(new Parse.ACL());
    await row.save(null, { useMasterKey: true });
  }
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const q = new Parse.Query('bs_Identity');
  q.equalTo('Label', LABEL);
  const rows = await q.findAll({ useMasterKey: true });
  if (rows.length) await Parse.Object.destroyAll(rows, { useMasterKey: true });
};
