/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema('partners_DataFiles');
  schema.addPointer('UserId', '_User');
  return schema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('partners_DataFiles');
  schema.deleteField('UserId');
  return schema.update();
};
