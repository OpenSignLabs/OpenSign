/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const userschema = new Parse.Schema('_User');
  userschema.addString('name');
  return userschema.update(null, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const userschema = new Parse.Schema('_User');
  userschema.deleteField('name');
  return userschema.update(null, { useMasterKey: true });
};
