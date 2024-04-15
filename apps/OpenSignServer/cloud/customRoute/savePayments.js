export default async function savePayments(request, response) {
  const PaymentId = request.body.data.payment.payment_id;
  const body = request.body;
  const Email = request.body.data.payment.email;
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('Email', Email);
    const extUser = await extUserCls.first({ useMasterKey: true });
    if (extUser) {
      const paymentCls = new Parse.Query('contracts_Payments');
      paymentCls.equalTo('PaymentId', PaymentId);
      const payment = await paymentCls.first({ useMasterKey: true });
      if (payment) {
        const updatePayment = new Parse.Object('contracts_Payments');
        updatePayment.id = payment.id;
        updatePayment.set('PaymentDetails', body);
        await updatePayment.save(null, { useMasterKey: true });
        return response.status(200).json({ status: 'update Payment!' });
      } else {
        const createPayment = new Parse.Object('contracts_Payments');
        createPayment.set('PaymentId', PaymentId);
        createPayment.set('PaymentDetails', body);
        createPayment.set('ExtUserPtr', {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        });
        createPayment.set('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: extUser.get('UserId').id,
        });
        if (extUser?.get('TenantId')?.id) {
          createPayment.set('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: extUser.get('TenantId').id,
          });
        }
        await createPayment.save(null, { useMasterKey: true });
        return response.status(200).json({ status: 'create payments!' });
      }
    } else {
      return response.status(404).json({ status: 'user not found!' });
    }
  } catch (err) {
    console.log('Err in save payment', err);
    return response.status(400).json({ status: 'error:' + err.message });
  }
}
