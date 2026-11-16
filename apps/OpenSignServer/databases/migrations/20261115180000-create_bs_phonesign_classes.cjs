/**
 * "Sign on phone" (cloud/parsefunction/bsPhoneSign.js), both master key only:
 * bs_WebSession, which web sessions came from Sign in with BetterSign
 * (utils/bsWebSession.js), and bs_PhoneSignRequest, a request pushed to the
 * signer's phone and, once signed, the statement and signature that approved it.
 *
 * @param {Parse} Parse
 */

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

// Create the class, or if a request already auto-created it, lock it down.
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

exports.up = async Parse => {
  await ensureMasterOnly(Parse, 'bs_WebSession', s => {
    s.addString('TokenHash');
    s.addString('vlad');
    s.addPointer('UserId', '_User');
    s.addDate('ExpiresAt');
    s.addIndex('TokenHash_1', { TokenHash: 1 });
  });
  await ensureMasterOnly(Parse, 'bs_PhoneSignRequest', s => {
    s.addString('ReqId');
    s.addPointer('UserId', '_User');
    s.addString('vlad');
    s.addString('DocId');
    s.addString('FieldId');
    s.addString('Kind');
    s.addString('Challenge');
    s.addString('EphSecret');
    s.addString('Status');
    s.addDate('ExpiresAt');
    s.addString('Statement');
    s.addString('Signature');
    s.addString('Image');
    s.addDate('SignedAt');
  });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  for (const className of ['bs_PhoneSignRequest', 'bs_WebSession']) {
    const schema = new Parse.Schema(className);
    await schema.purge().then(() => schema.delete());
  }
};
