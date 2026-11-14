/**
 * One-time codes live in `defaultdata_Otp` (cloud/parsefunction/emailOtp.js).
 * The class was created on the fly with public permissions, so anyone with the
 * app ID could read pending codes. Make it master-key only and drop the old
 * plaintext codes; codes are now stored as `CodeHash`.
 *
 * @param {Parse} Parse
 */
const className = 'defaultdata_Otp';
const masterOnly = {
  get: {},
  find: {},
  count: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
};

exports.up = async Parse => {
  const schema = new Parse.Schema(className);
  schema.setCLP(masterOnly);
  try {
    // If class exists, update it
    await schema.update();
  } catch (e) {
    // Otherwise, create it
    await schema.save();
  }

  // Plaintext codes from before this migration.
  const query = new Parse.Query(className);
  query.exists('OTP');
  const rows = await query.findAll({ useMasterKey: true });
  rows.forEach(row => row.unset('OTP'));
  if (rows.length) await Parse.Object.saveAll(rows, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema(className);
  schema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  try {
    await schema.update();
  } catch (e) {}
};
