/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const teamSchema = new Parse.Schema('contracts_Teams');
  teamSchema.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });
  await teamSchema.update();

  const orgSchema = new Parse.Schema('contracts_Organizations');
  orgSchema.setCLP({
    get: {},
    find: {},
    count: {},
    create: {},
    update: {},
    delete: {},
    addField: {},
  });

  return orgSchema.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const teamSchema = new Parse.Schema('contracts_Teams');
  teamSchema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });
  await teamSchema.update();

  const orgSchema = new Parse.Schema('contracts_Organizations');
  orgSchema.setCLP({
    get: { '*': true },
    find: { '*': true },
    count: { '*': true },
    create: { '*': true },
    update: { '*': true },
    delete: { '*': true },
    addField: { '*': true },
  });

  return orgSchema.update();
};
