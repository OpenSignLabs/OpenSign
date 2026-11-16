// Server-wide values the API generates once and keeps in bs_ApiConfig
// (master key only), so every machine and every restart uses the same one:
// the receiver VLAD (receiverVlad.js) and the relay key (relay.js).
//
// A unique index on Key makes the first insert win: a machine whose insert
// loses reads the winner's value. ("Oldest row wins" alone isn't enough: a
// machine can return its own row before another inserts one that sorts
// earlier, by clock skew between machines or a tie.)

const CONFIG_CLASS = 'bs_ApiConfig';

let uniquePending = null;

// Once per process. If the class already holds duplicate keys (from before
// the index), the index can't be built; fall back to the oldest row.
function ensureUniqueKey() {
  uniquePending ??= Parse.Server.database.adapter
    .ensureUniqueness(CONFIG_CLASS, { fields: { Key: { type: 'String' } } }, ['Key'])
    .catch(e => {
      console.log(JSON.stringify({ event: 'bsapi_config_not_unique', error: e.message }));
    });
  return uniquePending;
}

// The oldest row wins if there is ever more than one.
const oldest = key =>
  new Parse.Query(CONFIG_CLASS)
    .equalTo('Key', key)
    .ascending('createdAt')
    .addAscending('objectId')
    .first({ useMasterKey: true });

// The stored value for `key`, creating it with generate() if there is none.
// Returns { value, created } (created: this call's value is the one stored).
export async function storedConfigEntry(key, generate) {
  await ensureUniqueKey();
  let row = await oldest(key);
  if (row) return { value: row.get('Value'), created: false };
  const fresh = new Parse.Object(CONFIG_CLASS);
  fresh.set('Key', key);
  fresh.set('Value', generate());
  fresh.setACL(new Parse.ACL());
  try {
    await fresh.save(null, { useMasterKey: true });
  } catch (e) {
    // Another machine stored one first.
    if (e.code !== Parse.Error.DUPLICATE_VALUE) throw e;
  }
  row = await oldest(key);
  return { value: row.get('Value'), created: row.id === fresh.id };
}

export const storedConfigValue = async (key, generate) =>
  (await storedConfigEntry(key, generate)).value;
