/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
    // TODO: set className here
    const className = 'contracts_Document';
    const schema = new Parse.Schema(className);
    schema.addBoolean('IsArchive');
    return schema.update();
  };
  
  /**
   *
   * @param {Parse} Parse
   */
  exports.down = async Parse => {
    // TODO: set className here
    const className = 'contracts_Document';
    const schema = new Parse.Schema(className);
    schema.deleteField('IsArchive');
    return schema.update();
  };