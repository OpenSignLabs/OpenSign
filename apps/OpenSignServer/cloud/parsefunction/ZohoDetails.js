import axios from 'axios';

/**
 * ZohoDetails function
 * @param hostedpagesId Id must be in String
 * @returns response {phone, name, email, nextBillingDate, company, plan, customer_id, subscription_id}
 */

export default async function ZohoDetails(request) {
  // Define the URL
  const url = 'https://accounts.zoho.in/oauth/v2/token';

  // Convert the data to x-www-form-urlencoded format
  const formData = new URLSearchParams();
  formData.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN);
  formData.append('client_id', process.env.ZOHO_CLIENT_ID);
  formData.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
  formData.append('redirect_uri', process.env.ZOHO_REDIRECT_URI);
  formData.append('grant_type', 'refresh_token');

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  // Make the POST request using Axios
  const res = await axios.post(url, formData, { headers });
  //   console.log("Access Token:", res.data);
  if (res.data.access_token) {
    const hostedpages = request.params.hostedpagesId;
    const userData = await axios.get(
      'https://www.zohoapis.in/billing/v1/hostedpages/' + hostedpages,
      {
        headers: {
          Authorization: 'Zoho-oauthtoken ' + res.data.access_token,
          'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_BILLING_ORG_ID,
        },
      }
    );

    const first_name = userData.data.data.subscription.contactpersons[0].first_name || '';
    const last_name = userData.data.data.subscription.contactpersons[0].last_name || '';
    const company_name =
      (userData.data.data.subscription.customer &&
        userData.data.data.subscription.customer.company_name) ||
      '';
    const jobTitle =
      (userData.data.data.subscription.customer &&
        userData.data.data.subscription.customer.cd_job_title) ||
      '';
    const resData = {
      phone: userData.data.data.subscription.contactpersons[0]?.mobile || '',
      name: first_name + ' ' + last_name,
      email: userData.data.data.subscription.contactpersons[0].email,
      nextBillingDate: userData.data.data.subscription.next_billing_at,
      company: company_name,
      plan: userData.data.data.subscription.plan,
      customer_id: userData.data.data.subscription.customer_id,
      subscription_id: userData.data.data.subscription.subscription_id,
      jobTitle: jobTitle,
      subscription: userData.data,
    };
    return resData;
  }
}
