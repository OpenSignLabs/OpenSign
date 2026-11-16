/**
 * bs_Identity: an explicit Active flag (the Users page's on/off switch)
 * replaces RevokedAt, and LastSeenAt records a sign-in attempt by a VLAD with
 * no active link (utils/bsIdentity.js recordSignInAttempt). Existing rows keep
 * their state: Active = no RevokedAt (and an account to point at).
 *
 * @param {Parse} Parse
 */

async function setFields(Parse, fields) {
  const current = await new Parse.Schema('bs_Identity').get();
  const schema = new Parse.Schema('bs_Identity');
  let changed = false;
  for (const [name, type] of Object.entries(fields)) {
    const has = !!current.fields[name];
    if (type && !has) {
      schema.addField(name, type);
      changed = true;
    } else if (!type && has) {
      schema.deleteField(name);
      changed = true;
    }
  }
  if (changed) await schema.update();
}

exports.up = async Parse => {
  await setFields(Parse, { Active: 'Boolean', LastSeenAt: 'Date' });
  const rows = await new Parse.Query('bs_Identity').findAll({ useMasterKey: true });
  for (const row of rows) {
    const active = !row.get('RevokedAt') && !!row.get('UserId');
    row.unset('RevokedAt');
    row.set('Active', active);
    try {
      await row.save(null, { useMasterKey: true });
    } catch (e) {
      // A second active row for the VLAD (the save hook refuses it): the
      // first one stays on, this one goes off for an admin to sort out.
      console.log(`bs_Identity ${row.id}: ${e.message}; leaving it off`);
      row.set('Active', false);
      await row.save(null, { useMasterKey: true });
    }
  }
  await setFields(Parse, { RevokedAt: null });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  await setFields(Parse, { RevokedAt: 'Date' });
  const rows = await new Parse.Query('bs_Identity').findAll({ useMasterKey: true });
  for (const row of rows) {
    if (row.get('Active') === true) continue;
    if (!row.get('UserId')) {
      await row.destroy({ useMasterKey: true });
      continue;
    }
    row.set('RevokedAt', new Date());
    await row.save(null, { useMasterKey: true });
  }
  await setFields(Parse, { Active: null, LastSeenAt: null });
};
