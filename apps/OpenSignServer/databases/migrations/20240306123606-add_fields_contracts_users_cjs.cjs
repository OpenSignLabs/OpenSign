/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  // TODO: set className here
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addBoolean('HeaderDocId');
  schema.addString('Webhook');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  // TODO: set className here
  const className = 'contracts_Users';
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
  schema.addDate('Next_billing_date');
  schema.addBoolean('IsContactEntry');
  schema.addBoolean('ShareWithTeam');
  schema.addPointer('TenantId', 'partners_Tenant');
  schema.addPointer('UserId', '_User');
  schema.addPointer('CreatedBy', '_User');
  schema.addArray('TourStatus');
  schema.setCLP({
    get: {},
    find: {},
    count: {},
    create: { '*': true },
    update: { '*': true },
    delete: {},
    addField: {},
  });

  return schema.update();
};
