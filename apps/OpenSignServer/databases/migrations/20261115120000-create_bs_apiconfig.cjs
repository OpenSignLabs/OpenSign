/**
 * BetterSign desktop API: bs_ApiConfig, server-wide settings the API
 * generates and keeps (master key only). Today just the receiver VLAD
 * (cloud/customRoute/bsapi/receiverVlad.js) when BS_API_RECEIVER_VLAD isn't set.
 *
 * @param {Parse} Parse
 */

const { ensureMasterOnly } = require('../migrationUtils.cjs');

exports.up = async Parse => {
  await ensureMasterOnly(Parse, 'bs_ApiConfig', s => {
    s.addString('Key');
    s.addString('Value');
  });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('bs_ApiConfig');
  await schema.purge().then(() => schema.delete());
};
