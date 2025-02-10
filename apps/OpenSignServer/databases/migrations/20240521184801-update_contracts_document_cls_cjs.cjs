/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addBoolean('SendMail');
  schema.addBoolean('SendCompletionMail');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('SendMail');
  schema.deleteField('SendCompletionMail');
  return schema.update();
};
