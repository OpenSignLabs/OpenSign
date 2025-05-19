/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addString('UserName');
  schema.addString('Tagline');
  schema.addBoolean('SearchIndex');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.deleteField('UserName');
  schema.deleteField('Tagline');
  schema.deleteField('SearchIndex');
  return schema.update();
};
