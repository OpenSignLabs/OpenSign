/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_templateLinks';
  const schema = new Parse.Schema(className);

  schema.addString('Type');
  schema.addPointer('TemplatePtr', 'contracts_Template');
  schema.addArray('Placeholders');

  return schema.save();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_templateLinks';
  const schema = new Parse.Schema(className);
  return schema.purge().then(() => schema.delete());
};
