import axios from 'axios';
import { cloudServerUrl, serverAppId } from '../../Utils.js';
const appId = serverAppId;
const masterkey = process.env.MASTER_KEY;
export default async function createBatchContact(req) {
  if (!req?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (!req.params?.contacts) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameter.');
  }
  const contactData = JSON.parse(req.params.contacts);
  if (contactData?.length > 0) {
    try {
      const requests = contactData.map(x => {
        return {
          method: 'POST',
          path: '/app/classes/contracts_Contactbook',
          body: {
            UserRole: 'contracts_Guest',
            TenantId: { __type: 'Pointer', className: 'partners_Tenant', objectId: x.TenantId },
            CreatedBy: { __type: 'Pointer', className: '_User', objectId: req.user.id },
            Name: x.Name?.trim(),
            Email: x.Email?.toLowerCase()?.replace(/\s/g, ''),
            Company: x?.Company?.trim(),
            JobTitle: x?.JobTitle?.trim(),
            IsDeleted: false,
            IsImported: true,
            ...(x?.Phone ? { Phone: `${x?.Phone}` } : {}),
            ACL: { [req.user.id]: { read: true, write: true } },
          },
        };
      });
      const parseConfig = {
        baseURL: cloudServerUrl,
        headers: {
          'X-Parse-Application-Id': appId,
          'X-Parse-Master-Key': masterkey,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post('batch', { requests: requests }, parseConfig);
      // Handle the batch query response
      // console.info('createbatchcontact ', response.data);
      const successCount = response?.data?.filter(item => item.success).length;
      const failedCount = requests.length - successCount;
      console.log(
        `createbatchcontact query response: success: ${successCount}, failed: ${failedCount}`
      );
      return { success: successCount, failed: failedCount };
    } catch (err) {
      console.log('err while create batch contact', err);
      throw new Parse.Error(400, 'Something went wrong, please try again later');
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_CONTENT_LENGTH, 'Please provide parameter');
  }
}
