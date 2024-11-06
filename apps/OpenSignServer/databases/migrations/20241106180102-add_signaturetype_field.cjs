/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.addArray('SignatureType');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.addArray('SignatureType');
  await templateSchema.update();

  const extUserSchema = new Parse.Schema('contracts_Users');
  extUserSchema.addArray('SignatureType');
  await extUserSchema.update();

  const tenantSchema = new Parse.Schema('partners_Tenant');
  tenantSchema.addArray('SignatureType');
  return tenantSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.deleteField('SignatureType');
  await docSchema.update();

  const templateSchema = new Parse.Schema('contracts_Template');
  docSchema.deleteField('SignatureType');
  await templateSchema.update();

  const extUserSchema = new Parse.Schema('contracts_Users');
  docSchema.deleteField('SignatureType');
  await extUserSchema.update();

  const tenantSchema = new Parse.Schema('partners_Tenant');
  docSchema.deleteField('SignatureType');
  return tenantSchema.update();
};
