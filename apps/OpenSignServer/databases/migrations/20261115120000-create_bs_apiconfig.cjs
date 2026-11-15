/**
 * BetterSign desktop API: bs_ApiConfig, server-wide settings the API
 * generates and keeps (master key only). Today just the receiver VLAD
 * (cloud/customRoute/bsapi/receiverVlad.js) when BS_API_RECEIVER_VLAD isn't set.
 *
 * @param {Parse} Parse
 */

const MASTER_ONLY = {
  get: {},
  find: {},
  count: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
  protectedFields: {},
};

exports.up = async Parse => {
  const schema = new Parse.Schema('bs_ApiConfig');
  schema.addString('Key');
  schema.addString('Value');
  schema.setCLP(MASTER_ONLY);
  try {
    await schema.save();
  } catch (e) {
    // Auto-created by a request before this ran: lock it down.
    const existing = new Parse.Schema('bs_ApiConfig');
    existing.setCLP(MASTER_ONLY);
    await existing.update();
  }
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('bs_ApiConfig');
  await schema.purge().then(() => schema.delete());
};
