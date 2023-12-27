/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);

  schema.addString('Name');
  schema.addString('URL');
  schema.addString('Note');
  schema.addString('Description');
  schema.addArray('Signers');
  schema.addBoolean('IsArchive');
  schema.addArray('Placeholders');
  schema.addPointer('Folder', 'contracts_Template');
  schema.addString('Type');
  schema.addPointer('CreatedBy', '_User');
  schema.addPointer('ExtUserPtr', 'contracts_Users');
  schema.addBoolean('EnablePhoneOTP')
  schema.addBoolean('EnableEmailOTP')
  schema.addBoolean('SendinOrder')
  schema.addBoolean('SentToOthers')
  schema.addBoolean('AutomaticReminders')



  return schema.save();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};