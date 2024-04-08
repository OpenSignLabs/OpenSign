export default async function saveInvoice(request, response) {
  const InvoiceId = request.body.data.invoice.invoice_id;
  const body = request.body;
  const customerId = request.body.data.customer_id;
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('Customer_id', customerId);
    const extUser = await extUserCls.first({ useMasterKey: true });
    const invoiceCls = new Parse.Query('contracts_Invoices');
    invoiceCls.equalTo('InvoiceId', InvoiceId);
    const invoice = await invoiceCls.first({ useMasterKey: true });
    if (invoice) {
      const updateInvoice = new Parse.Object('contracts_Invoices');
      updateInvoice.id = invoice.id;
      updateInvoice.set('InvoiceDetails', body);
      await updateInvoice.save(null, { useMasterKey: true });
      return response.status(200).json({ status: 'update invoice!' });
    } else {
      const createInvoice = new Parse.Object('contracts_Invoices');
      createInvoice.set('InvoiceId', InvoiceId);
      createInvoice.set('InvoiceDetails', body);
      createInvoice.set('ExtUserPtr', {
        __type: 'Pointer',
        className: 'contracts_Users',
        objectId: extUser.id,
      });
      createInvoice.set('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: extUser.get('UserId').id,
      });
      await createInvoice.save(null, { useMasterKey: true });
      return response.status(200).json({ status: 'create invoice!' });
    }
  } catch (err) {
    console.log('Err in save invoice', err);
    return response.status(400).json({ status: 'error:' + err.message });
  }
}
