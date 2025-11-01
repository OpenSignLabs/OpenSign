export default async function getSignature(request) {
  const { userId } = request.params;
  if (!userId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing userId parameter.');
  }
  if (userId !== request.user?.id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Cannot save signature for the current user.');
  }
  try {
    const query = new Parse.Query('contracts_Signature');
    query.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    const result = await query.first({ useMasterKey: true });
    return result;
  } catch (err) {
    console.error('Error fetching signature:', err);
    throw err;
  }
}
