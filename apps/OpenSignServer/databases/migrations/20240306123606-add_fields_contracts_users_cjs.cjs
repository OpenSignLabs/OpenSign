/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addBoolean('HeaderDocId');
  schema.addString('Webhook');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.deleteField('HeaderDocId');
  schema.deleteField('Webhook');
  return schema.update();
};
