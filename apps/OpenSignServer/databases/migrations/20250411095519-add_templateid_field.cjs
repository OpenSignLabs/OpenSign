/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addPointer('TemplateId', 'contracts_Template');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('TemplateId');
  return schema.update();
};
