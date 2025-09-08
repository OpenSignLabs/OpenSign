/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema('contracts_Contactbook');
  schema.addString('Company').addString('JobTitle');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('contracts_Contactbook');
  schema.deleteField('Company').deleteField('JobTitle');
  return schema.update();
};
