/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.addBoolean('AllowModifications');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.deleteField('AllowModifications');
  return schema.update();
};
