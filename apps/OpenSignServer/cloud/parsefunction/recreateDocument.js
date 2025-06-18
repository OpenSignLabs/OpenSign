export default async function recreateDocument(request) {
  const { docId } = request.params;
  if (!docId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing docId parameter');
  }
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User not aunthenticated');
  }

  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.equalTo('objectId', docId);
    const doc = await docQuery.first({ useMasterKey: true });
    if (!doc) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found');
    }
    if (doc?.get('IsSignyourself')) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Signyourself Document not allowed');
    }
    const _docRes = doc?.toJSON();
    const { objectId, SignedUrl, AuditTrail, ACL, DeclineBy, DeclineReason, ...docRes } = _docRes;
    const createDoc = new Parse.Object('contracts_Document');
    Object.entries(docRes).forEach(([key, value]) => {
      if (key === 'IsDeclined' || key === 'IsCompleted') {
        createDoc.set(key, false);
      } else {
        createDoc.set(key, value);
      }
      // console.log(`${key}: ${value}`);
    });
    const createDocRes = await createDoc.save(null, { useMasterKey: true });
    // console.log('createDocRes', createDocRes);
    const newDoc = JSON.parse(JSON.stringify(createDocRes));
    return { objectId: newDoc.objectId, createdAt: newDoc.createdAt, updatedAt: newDoc.updatedAt };
  } catch (err) {
    console.log('err in recreate document', err);
    throw err;
  }
}
