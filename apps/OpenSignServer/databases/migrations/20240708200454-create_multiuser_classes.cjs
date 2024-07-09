/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const teamschema = new Parse.Schema('contracts_Teams');
  teamschema.addString('Name');
  teamschema.addBoolean('IsActive', { defaultValue: true });
  teamschema.addPointer('ParentId', 'contracts_Teams');
  teamschema.addPointer('OrganizationId', 'contracts_Organizations');
  teamschema.addArray('Ancestors');
  await teamschema.save();

  const orgSchema = new Parse.Schema('contracts_Organizations');
  orgSchema.addString('Name');
  orgSchema.addBoolean('IsActive', { defaultValue: true });
  orgSchema.addPointer('TenantId', 'partners_Tenant');
  orgSchema.addPointer('CreatedBy', '_User');
  orgSchema.addPointer('ExtUserId', 'contracts_Users');
  await orgSchema.save();

  const schema = new Parse.Schema('contracts_Users');
  schema.addBoolean('IsDisabled', { defaultValue: false });
  schema.addPointer('OrganizationId', 'contracts_Organizations');
  schema.addArray('TeamIds');
  await schema.update();

  const templateschema = new Parse.Schema('contracts_Template');
  templateschema.addArray('SharedWith');
  return templateschema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const teamschema = new Parse.Schema('contracts_Teams');
  await teamschema.purge().then(() => teamschema.delete());

  const orgSchema = new Parse.Schema('contracts_Organizations');
  await orgSchema.purge().then(() => orgSchema.delete());

  const schema = new Parse.Schema('contracts_Users');
  schema.deleteField('IsDisabled');
  schema.deleteField('OrganizationId');
  schema.deleteField('TeamIds');
  await schema.update();

  const templateschema = new Parse.Schema('contracts_Template');
  templateschema.deleteField('SharedWith');
  return templateschema.update();
};
