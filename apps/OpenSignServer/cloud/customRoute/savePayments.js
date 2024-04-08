export default async function savePayments(request, response) {
  const PaymentId = request.body.data.payment.payment_id;
  const body = request.body;
  const customerId = request.body.data.payment.customer_id;
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('Customer_id', customerId);
    const extUser = await extUserCls.first({ useMasterKey: true });
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
      await createPayment.save(null, { useMasterKey: true });
      return response.status(200).json({ status: 'create payments!' });
    }
  } catch (err) {
    console.log('Err in save payment', err);
    return response.status(400).json({ status: 'error:' + err.message });
  }
}
