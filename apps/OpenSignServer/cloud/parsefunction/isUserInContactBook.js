export default async function isUserInContactBook(request) {
  try {
    if (request.user) {
      const email = request.user.get('email');
      const userPtr = { __type: 'Pointer', className: '_User', objectId: request.user?.id };
      const query = new Parse.Query('contracts_Contactbook');
      query.equalTo('CreatedBy', userPtr);
      query.notEqualTo('IsDeleted', true);
      query.equalTo('Email', email);
      const res = await query.first({ sessionToken: request.user.getSessionToken() });
      return res;
    }
  } catch (err) {
    console.log('err', err);
    throw err;
  }
}
