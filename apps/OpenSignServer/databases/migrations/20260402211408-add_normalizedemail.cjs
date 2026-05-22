/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema("_User");
  schema.addString('normalizedEmail');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema("_User");
  schema.deleteField('normalizedEmail');
  return schema.update();
};
