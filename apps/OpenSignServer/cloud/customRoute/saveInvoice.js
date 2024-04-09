export default async function saveInvoice(request, response) {
  const InvoiceId = request.body.data.invoice.invoice_id;
  const body = request.body;
  const Email = request.body.data.invoice.email;

  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('Email', Email);
    const extUser = await extUserCls.first({ useMasterKey: true });
    if (extUser) {
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
    } else {
      return response.status(404).json({ status: 'user not found!' });
    }
  } catch (err) {
    console.log('Err in save invoice', err);
    return response.status(400).json({ status: 'error:' + err.message });
  }
}
