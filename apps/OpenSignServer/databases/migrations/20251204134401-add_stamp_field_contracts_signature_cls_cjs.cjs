/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema('contracts_Signature');
  schema.addString('Stamp');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('contracts_Signature');
  schema.deleteField('Stamp');
  return schema.update();
};
