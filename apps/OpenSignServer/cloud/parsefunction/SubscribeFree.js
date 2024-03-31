export default async function SubscribeFree(request) {
  const userId = request.params.userId;
  const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
  try {
    const extQuery = new Parse.Query('contracts_Users');
    extQuery.equalTo('UserId', userPtr);
    const extUser = await extQuery.first({ useMasterKey: true });
    if (extUser) {
      if (extUser?.get('Plan')?.plan_code === 'freeplan') {
        return { status: 'success', result: 'already subscribed!' };
      } else if (extUser?.get('Next_billing_date') < new Date()) {
        try {
          const extUpdate = new Parse.Object('contracts_Users');
          extUpdate.id = extUser.id;
          extUpdate.set('Plan', { plan_code: 'freeplan' });
          await extUpdate.save(null, { useMasterKey: true });
          return { status: 'success', result: 'subscribed!' };
        } catch (err) {
          console.log('err ', err);
          return { status: 'error', result: err.message };
        }
      } else {
        try {
          const extUpdate = new Parse.Object('contracts_Users');
          extUpdate.id = extUser.id;
          extUpdate.set('Plan', { plan_code: 'freeplan' });
          await extUpdate.save(null, { useMasterKey: true });
          return { status: 'success', result: 'subscribed!' };
        } catch (err) {
          console.log('err ', err);
          return { status: 'error', result: err.message };
        }
      }
    } else {
      return { status: 'error', result: 'User not found!' };
    }
  } catch (err) {
    console.log('err ', err);
    return { status: 'error', result: err.message };
  }
}
