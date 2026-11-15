/**
 * BetterSign desktop API (/api/v1): VLAD -> account links, sign-in
 * challenges and access tokens (all three master-key only: a client that
 * could create a bs_Identity row could link its VLAD to any account), and
 * contracts_Document.VladSignatures.
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

// Create the class, or if the API already auto-created it (a request before
// this migration ran), lock it down: CLP first, so it's never left public.
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
  await ensureMasterOnly(Parse, 'bs_Identity', s => {
    s.addString('vlad');
    s.addPointer('UserId', '_User');
    s.addString('Label');
    s.addDate('RevokedAt');
    s.addIndex('vlad_1', { vlad: 1 });
  });
  await ensureMasterOnly(Parse, 'bs_ApiChallenge', s => {
    s.addString('Challenge');
    s.addString('vlad');
    s.addDate('ExpiresAt');
    s.addNumber('Uses');
  });
  await ensureMasterOnly(Parse, 'bs_ApiToken', s => {
    s.addString('TokenHash');
    s.addString('vlad');
    s.addPointer('UserId', '_User');
    s.addString('SessionToken');
    s.addDate('ExpiresAt');
    s.addDate('RevokedAt');
    s.addString('ClientKey');
    s.addString('ReqId');
    s.addString('IpAddress');
    s.addIndex('TokenHash_1', { TokenHash: 1 });
  });

  // Signatures made on the desktop. Non-empty = the PDF is append-only from
  // then on (utils/appendOnlyPdf.js).
  const doc = new Parse.Schema('contracts_Document');
  doc.addArray('VladSignatures');
  await doc.update();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const doc = new Parse.Schema('contracts_Document');
  doc.deleteField('VladSignatures');
  await doc.update();
  for (const className of ['bs_ApiToken', 'bs_ApiChallenge', 'bs_Identity']) {
    const schema = new Parse.Schema(className);
    await schema.purge().then(() => schema.delete());
  }
};
