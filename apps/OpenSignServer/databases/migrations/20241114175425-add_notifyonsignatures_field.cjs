/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.addBoolean('NotifyOnSignatures');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addBoolean('NotifyOnSignatures');
  await templateSchema.update();

  const extUserSchema = new Parse.Schema('contracts_Users');
  extUserSchema.addBoolean('NotifyOnSignatures');
  return extUserSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.deleteField('NotifyOnSignatures');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('NotifyOnSignatures');
  await templateSchema.update();

  const extUserSchema = new Parse.Schema('contracts_Users');
  docSchema.deleteField('NotifyOnSignatures');
  return extUserSchema.update();
};
