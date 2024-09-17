/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addBoolean('IsDisableOTP');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addBoolean('IsDisableOTP');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('IsDisableOTP');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('IsDisableOTP');
  return schema.update();
};
