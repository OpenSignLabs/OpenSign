export default async function getDocument(request) {
  const docId = request.params.docId;
  const userId = request.params.userId;
  if (docId && userId) {
    try {
      const query = new Parse.Query('contracts_Document');
      query.equalTo('objectId', docId);
      query.equalTo('ACL', new Parse.ACL(userId));
      query.include('ExtUserPtr');
      query.include('CreatedBy');
      query.include('Signers');
      query.include('AuditTrail.UserPtr');
      query.include('Placeholders');
      const res = await query.first({ useMasterKey: true });
      return res;
    } catch (err) {
      console.log('err', err);
      return err;
    }
  } else {
    return { error: 'Please pass required parameters!' };
  }
}
