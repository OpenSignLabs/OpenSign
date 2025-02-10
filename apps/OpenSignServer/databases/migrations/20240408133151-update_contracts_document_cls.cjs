/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addString('RequestBody');
  schema.addString('RequestSubject');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('RequestBody');
  schema.deleteField('RequestSubject');
  return schema.update();
};
