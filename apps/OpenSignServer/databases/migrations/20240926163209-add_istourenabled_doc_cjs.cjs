/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addBoolean('IsTourEnabled');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addBoolean('IsTourEnabled');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('IsTourEnabled');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('IsTourEnabled');
  return schema.update();
};
