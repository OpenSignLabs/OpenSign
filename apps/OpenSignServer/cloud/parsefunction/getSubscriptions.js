export default async function getSubscription(request) {
  const limit = request.params.limit || 100;
  const skip = request.params.skip || 0;
  const extUserId = request.params.extUserId;
  try {
    const subscriptionCls = new Parse.Query('contracts_Subscriptions');
    subscriptionCls.equalTo('ExtUserPtr', {
      __type: 'Pointer',
      className: 'contracts_User',
      objectId: extUserId,
    });
    subscriptionCls.limit(limit);
    subscriptionCls.skip(skip);
    subscriptionCls.descending('createdAt');
    const subcripitions = await subscriptionCls.find({ useMasterKey: true });
    if (subcripitions?.length > 0) {
      const _subcripitions = JSON.parse(JSON.stringify(subcripitions));
      return { status: 'success', result: _subcripitions };
    } else {
      return { status: 'success', result: [] };
    }
  } catch (err) {
    console.log('Err in get subscription', err.message);
    return { status: 'error', result: err.message };
  }
}
