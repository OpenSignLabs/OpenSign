/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  // TODO: set className here
  const className = 'partners_Tenant';
  const schema = new Parse.Schema(className);
  schema.addString('Logo');
  schema.addString('Domain');
  return schema.update();

  // TODO: Set the schema here
  // Example:
  // schema.addString('name').addNumber('cash');
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  // TODO: set className here
  const className = 'partners_Tenant';
  const schema = new Parse.Schema(className);
  schema.deleteField('Logo');
  schema.deleteField('Domain');
  return schema.update();
  // TODO: Set the schema here
  // Example:
  // schema.deleteField('name').deleteField('cash');
};
