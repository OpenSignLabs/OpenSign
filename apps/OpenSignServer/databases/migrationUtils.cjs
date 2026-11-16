/**
 * Shared by the BetterSign migrations. Kept outside migrations/, where
 * parse-dbtool would run it as a migration.
 */

// Class-level permissions that leave a class to the master key only.
const MASTER_ONLY = {
  get: {},
  find: {},
  count: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
  protectedFields: {},
};

/**
 * Create the class, or if a request already auto-created it (before the
 * migration ran), lock it down: CLP first, so it's never left public.
 *
 * @param {Parse} Parse
 * @param {string} className
 * @param {(schema: Parse.Schema) => void} addFields
 */
async function ensureMasterOnly(Parse, className, addFields) {
  const schema = new Parse.Schema(className);
  addFields(schema);
  schema.setCLP(MASTER_ONLY);
  try {
    await schema.save();
  } catch (e) {
    const existing = new Parse.Schema(className);
    existing.setCLP(MASTER_ONLY);
    await existing.update();
  }
}

module.exports = { MASTER_ONLY, ensureMasterOnly };
