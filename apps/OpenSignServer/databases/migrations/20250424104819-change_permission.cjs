/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const defaultotp = new Parse.Schema('defaultdata_Otp');
  defaultotp.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });
  await defaultotp.update();
  const schema = new Parse.Schema('contracts_Signature');
  schema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: {},
  });
  await schema.update();
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.setCLP({
    get: { '*': true },
    find: { requiresAuthentication: true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: { requiresAuthentication: true },
  });
  await docSchema.update();
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.setCLP({
    get: { '*': true },
    find: {},
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: { requiresAuthentication: true },
  });
  await templateSchema.update();
  const dataFiles = new Parse.Schema('partners_DataFiles');
  dataFiles.setCLP({
    get: {},
    find: {},
    count: {},
    create: { '*': true },
    update: {},
    delete: {},
    addField: { '*': true },
  });
  await dataFiles.update();
  const pTenant = new Parse.Schema('partners_Tenant');
  pTenant.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });
  await pTenant.update();
  const TenantCredits = new Parse.Schema('partners_TenantCredits');
  TenantCredits.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: { '*': true },
  });
  await TenantCredits.update();
  const _user = new Parse.Schema('_User');
  _user.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: {},
  });
  await _user.update();
  const Migrationdb = new Parse.Schema('Migrationdb');
  Migrationdb.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });
  await Migrationdb.update();
  const contactbook = new Parse.Schema('contracts_Contactbook');
  contactbook.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: {},
  });
  return contactbook.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const defaultotp = new Parse.Schema('defaultdata_Otp');
  defaultotp.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await defaultotp.update();
  const schema = new Parse.Schema('contracts_Signature');
  schema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await schema.update();
  const docSchema = new Parse.Schema('contracts_Document');
  docSchema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await docSchema.update();
  const templateSchema = new Parse.Schema('contracts_Template');
  templateSchema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await templateSchema.update();
  const dataFiles = new Parse.Schema('partners_DataFiles');
  dataFiles.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await dataFiles.update();
  const pTenant = new Parse.Schema('partners_Tenant');
  pTenant.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await pTenant.update();
  const TenantCredits = new Parse.Schema('partners_TenantCredits');
  TenantCredits.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await TenantCredits.update();
  const _user = new Parse.Schema('_User');
  _user.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await _user.update();
  const Migrationdb = new Parse.Schema('Migrationdb');
  Migrationdb.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await Migrationdb.update();
  const contactbook = new Parse.Schema('contracts_Contactbook');
  contactbook.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  return contactbook.update();
};
