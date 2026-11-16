// Server-wide values the API generates once and keeps in bs_ApiConfig
// (master key only), so every machine and every restart uses the same one:
// the receiver VLAD (receiverVlad.js) and the relay key (relay.js).

const CONFIG_CLASS = 'bs_ApiConfig';

// The oldest row wins, so two machines creating one at once still agree.
const oldest = key =>
  new Parse.Query(CONFIG_CLASS)
    .equalTo('Key', key)
    .ascending('createdAt')
    .addAscending('objectId')
    .first({ useMasterKey: true });

// The stored value for `key`, creating it with generate() if there is none.
// Returns { value, created }.
export async function storedConfigEntry(key, generate) {
  let row = await oldest(key);
  let created = false;
  if (!row) {
    const fresh = new Parse.Object(CONFIG_CLASS);
    fresh.set('Key', key);
    fresh.set('Value', generate());
    fresh.setACL(new Parse.ACL());
    await fresh.save(null, { useMasterKey: true });
    row = await oldest(key);
    created = true;
  }
  return { value: row.get('Value'), created };
}

export const storedConfigValue = async (key, generate) =>
  (await storedConfigEntry(key, generate)).value;
