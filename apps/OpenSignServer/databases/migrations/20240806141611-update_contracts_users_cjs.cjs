/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addString('Language');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.deleteField('Language');
  return schema.update();
};
