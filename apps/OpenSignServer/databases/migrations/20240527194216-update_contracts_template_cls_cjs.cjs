/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.addArray('PublicRole');
  schema.addBoolean('IsPublic');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.deleteField('PublicRole');
  schema.deleteField('IsPublic');
  return schema.update();
};
