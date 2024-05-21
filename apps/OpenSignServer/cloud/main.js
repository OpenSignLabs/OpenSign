import PDF from './parsefunction/pdf/PDF.min.js';
import sendmailv3 from './parsefunction/sendMailv3.js';
import GoogleSign from './parsefunction/GoogleSign.js';
import ZohoDetails from './parsefunction/ZohoDetails.js';
import usersignup from './parsefunction/usersignup.js';
import FacebookSign from './parsefunction/FacebookSign.js';
import { addUserToGroups } from './parsefunction/AddUserToRole.js';
import { getUserGroups } from './parsefunction/UserGroups.js';
import DocumentAftersave from './parsefunction/DocumentAftersave.js';
import ContactbookAftersave from './parsefunction/ContactBookAftersave.js';
import ContractUsersAftersave from './parsefunction/ContractUsersAftersave.js';
import sendMailOTPv1 from './parsefunction/SendMailOTPv1.js';
import AuthLoginAsMail from './parsefunction/AuthLoginAsMail.js';
import getUserId from './parsefunction/getUserId.js';
import getUserDetails from './parsefunction/getUserDetails.js';
import getDocument from './parsefunction/getDocument.js';
import getDrive from './parsefunction/getDrive.js';
import getReport from './parsefunction/getReport.js';
import generateApiToken from './parsefunction/generateApiToken.js';
import getapitoken from './parsefunction/getapitoken.js';
import TemplateAfterSave from './parsefunction/TemplateAfterSave.js';
import GetTemplate from './parsefunction/GetTemplate.js';
import savewebhook from './parsefunction/saveWebhook.js';
import callWebhook from './parsefunction/callWebhook.js';
import SubscribeFree from './parsefunction/SubscribeFree.js';
import DocumentBeforesave from './parsefunction/DocumentBeforesave.js';
import TemplateBeforeSave from './parsefunction/TemplateBeforesave.js';
import DocumentBeforeFind from './parsefunction/DocumentAfterFind.js';
import TemplateAfterFind from './parsefunction/TemplateAfterFind.js';
import UserAfterFind from './parsefunction/UserAfterFInd.js';
import SignatureAfterFind from './parsefunction/SignatureAfterFind.js';
import getInvoices from './parsefunction/getInvoices.js';
import getPayments from './parsefunction/getPayments.js';
import getSubscriptions from './parsefunction/getSubscriptions.js';
import TenantAterFind from './parsefunction/TenantAfterFind.js';
import saveSubscription from './parsefunction/saveSubscription.js';
import VerifyEmail from './parsefunction/VerifyEmail.js';
import encryptedpdf from './parsefunction/encryptedPdf.js';
import { getSignedUrl } from './parsefunction/getSignedUrl.js';
import createBatchDocs from './parsefunction/createBatchDocs.js';

// This afterSave function triggers after an object is added or updated in the specified class, allowing for post-processing logic.
Parse.Cloud.afterSave('contracts_Document', DocumentAftersave);
Parse.Cloud.afterSave('contracts_Contactbook', ContactbookAftersave);
Parse.Cloud.afterSave('contracts_Users', ContractUsersAftersave);
Parse.Cloud.afterSave('contracts_Template', TemplateAfterSave);

// This beforeSave function triggers before an object is added or updated in the specified class, allowing for validation or modification.
Parse.Cloud.beforeSave('contracts_Document', DocumentBeforesave);
Parse.Cloud.beforeSave('contracts_Template', TemplateBeforeSave);

// This afterFind function triggers after a query retrieves objects from the specified class, allowing for post-processing of the results.
Parse.Cloud.afterFind(Parse.User, UserAfterFind);
Parse.Cloud.afterFind('contracts_Document', DocumentBeforeFind);
Parse.Cloud.afterFind('contracts_Template', TemplateAfterFind);
Parse.Cloud.afterFind('contracts_Signature', SignatureAfterFind);
Parse.Cloud.afterFind('partners_Tenant', TenantAterFind);

// This define function creates a custom Cloud Function that can be called from the client-side, enabling custom business logic on the server.
Parse.Cloud.define('AddUserToRole', addUserToGroups);
Parse.Cloud.define('UserGroups', getUserGroups);
Parse.Cloud.define('signPdf', PDF);
Parse.Cloud.define('sendmailv3', sendmailv3);
Parse.Cloud.define('googlesign', GoogleSign);
Parse.Cloud.define('zohodetails', ZohoDetails);
Parse.Cloud.define('usersignup', usersignup);
Parse.Cloud.define('facebooksign', FacebookSign);
Parse.Cloud.define('SendOTPMailV1', sendMailOTPv1);
Parse.Cloud.define('AuthLoginAsMail', AuthLoginAsMail);
Parse.Cloud.define('getUserId', getUserId);
Parse.Cloud.define('getUserDetails', getUserDetails);
Parse.Cloud.define('getDocument', getDocument);
Parse.Cloud.define('getDrive', getDrive);
Parse.Cloud.define('getReport', getReport);
Parse.Cloud.define('generateapitoken', generateApiToken);
Parse.Cloud.define('getapitoken', getapitoken);
Parse.Cloud.define('getTemplate', GetTemplate);
Parse.Cloud.define('savewebhook', savewebhook);
Parse.Cloud.define('callwebhook', callWebhook);
Parse.Cloud.define('freesubscription', SubscribeFree);
Parse.Cloud.define('getinvoices', getInvoices);
Parse.Cloud.define('getpayments', getPayments);
Parse.Cloud.define('getsubscriptions', getSubscriptions);
Parse.Cloud.define('savesubscription', saveSubscription);
Parse.Cloud.define('verifyemail', VerifyEmail);
Parse.Cloud.define('encryptedpdf', encryptedpdf);
Parse.Cloud.define('getsignedurl', getSignedUrl);
Parse.Cloud.define('batchdocuments', createBatchDocs);
