/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema('contracts_Subscriptions');
  schema.addNumber('CreditAlertLevel');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('contracts_Subscriptions');
  schema.deleteField('CreditAlertLevel');
  return schema.update();
};
