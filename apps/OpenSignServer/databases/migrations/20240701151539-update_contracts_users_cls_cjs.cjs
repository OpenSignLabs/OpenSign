/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  // TODO: set className here
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addString('UserName');
  schema.addString('Tagline');
  schema.addBoolean('SearchIndex');
  // TODO: Set the schema here
  // Example:
  // schema.addString('name').addNumber('cash');

  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  // TODO: set className here
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.deleteField('UserName');
  schema.deleteField('Tagline');
  schema.deleteField('SearchIndex');
  // TODO: Set the schema here
  // Example:
  // schema.deleteField('name').deleteField('cash');

  return schema.update();
};
