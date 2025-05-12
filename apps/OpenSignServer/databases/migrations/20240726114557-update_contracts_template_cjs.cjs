/**
 *
 * @param {Parse} Parse
 */
const up = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.addString('OriginIp');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
const down = async Parse => {
  const className = 'contracts_Template';
  const schema = new Parse.Schema(className);
  schema.deleteField('OriginIp');
  return schema.update();
};

module.exports = { up, down };
