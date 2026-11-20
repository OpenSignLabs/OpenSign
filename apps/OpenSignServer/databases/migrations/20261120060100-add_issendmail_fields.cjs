/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const documentSchema = new Parse.Schema('contracts_Document');
  const current = await documentSchema.get();
  const existingField = current.fields?.IsSendMail;
  if (existingField) {
    if (existingField.type !== 'Boolean') {
      throw new Error('contracts_Document.IsSendMail must be a Boolean field.');
    }
    return;
  }
  documentSchema.addBoolean('IsSendMail');
  return documentSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const documentSchema = new Parse.Schema('contracts_Document');
  documentSchema.deleteField('IsSendMail');
  return documentSchema.update();
};
