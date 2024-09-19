/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addBoolean('IsEnableOTP');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.addBoolean('IsEnableOTP');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('IsEnableOTP');
  await templateSchema.update();

  const className = 'contracts_Document';
  const schema = new Parse.Schema(className);
  schema.deleteField('IsEnableOTP');
  return schema.update();
};
