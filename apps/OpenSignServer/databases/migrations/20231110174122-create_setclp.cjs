/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  // TODO: set className here
  const className = 'Contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addString('Name');
  schema.addString('Phone');
  schema.addString('JobTitle');
  schema.addString('Email');
  schema.addString('Company');
  schema.addString('UserRole');
  schema.addObject('Plan');
  schema.addString('Customer_id');
  schema.addString('Subscription_id');
  schema.addString('Next_billing_date');
  schema.addBoolean('IsContactEntry');
  schema.addBoolean('ShareWithTeam');
  schema.addPointer('TenantId', "partners_Tenant")
  schema.addPointer('UserId', "_User")
  schema.addPointer("CreatedBy", "_User")
  schema.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });

  return schema.save();


  // const config = new Config(process.env.APP_ID, process.env.PARSE_MOUNT);
  // const schema = await config.database.loadSchema();
  // await schema.setPermissions('myclass', {
  //   get: { requiresAuthentication: true },
  //   find: { requiresAuthentication: true },
  //   count: { requiresAuthentication: true },
  //   create: { requiresAuthentication: true },
  //   update: { requiresAuthentication: true },
  //   delete: { requiresAuthentication: true },
  //   addField: {},
  // });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  // TODO: set className here
  const className = 'Contracts_Users';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
