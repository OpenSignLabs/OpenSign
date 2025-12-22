/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.addArray('PenColors');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addArray('PenColors');
  await templateSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.deleteField('PenColors');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.deleteField('PenColors');
  await templateSchema.update();
};
