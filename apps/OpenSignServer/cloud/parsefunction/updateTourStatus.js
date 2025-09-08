export default async function updateTourStatus(request) {
  const tourstatus = request.params.TourStatus;
  const extUserId = request.params.ExtUserId;

  if (request.user) {
    try {
      const updateUser = new Parse.Object('contracts_Users');
      updateUser.id = extUserId;
      updateUser.set('TourStatus', tourstatus);
      const res = await updateUser.save();
      return res;
    } catch (err) {
      console.log('Err ', err);
      const code = err?.code || 400;
      const msg = err?.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
}
