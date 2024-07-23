/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const userschema = new Parse.Schema('_User');
  userschema.addString('Name').addString('phone').addString('ProfilePic');
  const index = { phone: 1 };
  userschema.addIndex('phone_1', index);
  await userschema.update(null, { useMasterKey: true });

  const contactbook = new Parse.Schema('contracts_Contactbook');
  contactbook
    .addString('UserRole')
    .addPointer('TenantId', 'partners_Tenant')
    .addPointer('UserId', '_User')
    .addArray('TourStatus')
    .addString('Name')
    .addString('Phone')
    .addString('Email')
    .addPointer('CreatedBy', '_User')
    .addPointer('ExtUserPtr', 'contracts_Users')
    .addBoolean('IsDeleted', false);
  await contactbook.save(null, { useMasterKey: true });

  const extUsers = new Parse.Schema('contracts_Users');
  extUsers
    .addString('UserRole')
    .addPointer('TenantId', 'partners_Tenant')
    .addPointer('UserId', '_User')
    .addArray('TourStatus')
    .addString('Name')
    .addString('Phone')
    .addString('Email')
    .addString('JobTitle')
    .addBoolean('IsContactEntry', false)
    .addString('Company')
    .addBoolean('HeaderDocId')
    .addPointer('CreatedBy', '_User')
    .addString('Webhook')
    .addBoolean('ShareWithTeam', false)
    .setCLP({
      get: {},
      find: {},
      count: {},
      create: { '*': true },
      update: { '*': true },
      delete: {},
      addField: {},
    });
  await extUsers.save(null, { useMasterKey: true });

  const doc = new Parse.Schema('contracts_Document');
  doc
    .addString('Name')
    .addString('URL')
    .addString('Note')
    .addBoolean('EnableEmailOTP')
    .addArray('Signers')
    .addString('Type')
    .addString('Description')
    .addPointer('ExtUserPtr', 'contracts_Users')
    .addString('SignedUrl')
    .addArray('AuditTrail')
    .addArray('Placeholders')
    .addPointer('Folder', 'contracts_Document')
    .addPointer('CreatedBy', '_User')
    .addDate('ExpiryDate')
    .addBoolean('SendinOrder', false)
    .addBoolean('AutomaticReminders', false)
    .addBoolean('IsCompleted', false)
    .addBoolean('IsDeclined', false)
    .addNumber('RemindOnceInEvery', 5)
    .addNumber('TimeToCompleteDays', 15)
    .addBoolean('SentToOthers', false) // check once
    .addBoolean('EnablePhoneOTP', false)
    .addDate('AgreementValidUntil')
    .addArray('Recipients')
    .addArray('Clauses')
    .addArray('AgreementDelta');
  await doc.save(null, { useMasterKey: true });

  const signature = new Parse.Schema('contracts_Signature');
  signature
    .addString('SignatureName')
    .addString('SignText')
    .addString('ImageURL')
    .addString('SignTextFont')
    .addString('InitialsText')
    .addString('InitialsFont')
    .addString('Initials')
    .addPointer('UserId', '_User');
  await signature.save(null, { useMasterKey: true });

  const partners_DataFiles = new Parse.Schema('partners_DataFiles');
  partners_DataFiles
    .addNumber('FileSize')
    .addString('FileUrl')
    .addPointer('TenantPtr', 'partners_Tenant');
  await partners_DataFiles.save(null, { useMasterKey: true });

  const partners_Tenant = new Parse.Schema('partners_Tenant');
  partners_Tenant
    .addPointer('UserId', '_User')
    .addString('ContactNumber')
    .addBoolean('IsActive', true)
    .addString('TenantName')
    .addString('EmailAddress')
    .addPointer('CreatedBy', '_User')
    .addString('Domain')
    .addString('Logo');
  await partners_Tenant.save(null, { useMasterKey: true });

  const partners_TenantCredits = new Parse.Schema('partners_TenantCredits');
  partners_TenantCredits.addPointer('PartnersTenant', 'partners_Tenant').addNumber('usedStorage');
  return partners_TenantCredits.save(null, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const userschema = new Parse.Schema('_User');
  userschema.deleteField('Name').deleteField('phone').deleteField('ProfilePic');
  const index = { phone: 1 };
  userschema.deleteIndex('phone_1', index);
  await userschema.update(null, { useMasterKey: true });

  const contactbook = new Parse.Schema('contracts_Contactbook');
  await contactbook.purge().then(() => contactbook.delete());

  const extUsers = new Parse.Schema('contracts_Users');
  await extUsers.purge().then(() => extUsers.delete());

  const doc = new Parse.Schema('contracts_Document');
  await doc.purge().then(() => doc.delete());

  const signature = new Parse.Schema('contracts_Signature');
  await signature.purge().then(() => signature.delete());

  const partners_DataFiles = new Parse.Schema('partners_DataFiles');
  await partners_DataFiles.purge().then(() => partners_DataFiles.delete());

  const partners_Tenant = new Parse.Schema('partners_Tenant');
  await partners_Tenant.purge().then(() => partners_Tenant.delete());

  const partners_TenantCredits = new Parse.Schema('partners_TenantCredits');
  return partners_TenantCredits.purge().then(() => partners_TenantCredits.delete());
};
