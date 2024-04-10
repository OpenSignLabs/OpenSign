import axios from 'axios';
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
export default async function getInvoices(request) {
  const limit = request.params.limit || 100;
  const skip = request.params.skip || 0;
  const extUserId = request.params.extUserId;
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const invoiceCls = new Parse.Query('contracts_Invoices');
      invoiceCls.equalTo('ExtUserPtr', {
        __type: 'Pointer',
        className: 'contracts_User',
        objectId: extUserId,
      });
      invoiceCls.limit(limit);
      invoiceCls.skip(skip);
      invoiceCls.descending('createdAt');
      const invoices = await invoiceCls.find({ useMasterKey: true });
      if (invoices?.length > 0) {
        const _invoices = JSON.parse(JSON.stringify(invoices));
        return { status: 'success', result: _invoices };
      } else {
        return { status: 'success', result: [] };
      }
    } else {
      return { status: 'error', result: 'Invalid session token!' };
    }
  } catch (err) {
    console.log('Err in get invoices', err.message);
    return { status: 'error', result: err.message };
  }
}
