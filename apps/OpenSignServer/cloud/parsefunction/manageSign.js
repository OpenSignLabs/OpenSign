export default async function manageSign(request) {
  const { signature, userId, initials, id, title } = request.params;

  if (!userId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing userId parameter.');
  }
  if (userId !== request.user?.id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Cannot save signature for the current user.');
  }
  const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
  try {
    const signatureCls = new Parse.Object('contracts_Signature');
    if (id) {
      signatureCls.id = id;
    }
    signatureCls.set('Initials', initials ? initials : '');
    signatureCls.set('ImageURL', signature ? signature : '');
    signatureCls.set('SignatureName', title ? title : '');
    if (userPtr) {
      signatureCls.set('UserId', userPtr);
    }
    const signRes = await signatureCls.save(null, { useMasterKey: true });
    return signRes;
  } catch (err) {
    console.error('Error saving signature:', err);
    throw err;
  }
}
