/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.addBoolean('SendInOrderStrict');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addBoolean('SendInOrderStrict');
  await templateSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.deleteField('SendInOrderStrict');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('SendInOrderStrict');
  await templateSchema.update();
};
