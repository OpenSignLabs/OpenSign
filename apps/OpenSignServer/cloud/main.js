import PDF from './parsefunction/pdf/PDF.min.js';
import sendmail from './parsefunction/sendMail.js';
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
import SendMailv1 from './parsefunction/SendMailv1.js';
import AuthLoginAsMail from './parsefunction/AuthLoginAsMail.js';
import getUserId from './parsefunction/getUserId.js';
import getUserDetails from './parsefunction/getUserDetails.js';
import getDocument from './parsefunction/getDocument.js';
import getDrive from './parsefunction/getDrive.js';
import getReport from './parsefunction/getReport.js';
import generateAppToken from './parsefunction/generateAppToken.js';
import v1 from './parsefunction/v1.js';

Parse.Cloud.define('AddUserToRole', addUserToGroups);
Parse.Cloud.define('UserGroups', getUserGroups);
Parse.Cloud.define('signPdf', PDF);
Parse.Cloud.define('sendmailv3', sendmail);
Parse.Cloud.define('googlesign', GoogleSign);
Parse.Cloud.define('zohodetails', ZohoDetails);
Parse.Cloud.define('usersignup', usersignup);
Parse.Cloud.define('facebooksign', FacebookSign);
Parse.Cloud.afterSave('contracts_Document', DocumentAftersave);
Parse.Cloud.afterSave('contracts_Contactbook', ContactbookAftersave);
Parse.Cloud.afterSave('contracts_Users', ContractUsersAftersave);
Parse.Cloud.define('SendOTPMailV1', sendMailOTPv1);
Parse.Cloud.define('sendmail', SendMailv1);
Parse.Cloud.define('AuthLoginAsMail', AuthLoginAsMail);
Parse.Cloud.define('getUserId', getUserId);
Parse.Cloud.define('getUserDetails', getUserDetails);
Parse.Cloud.define('getDocument', getDocument);
Parse.Cloud.define('getDrive', getDrive)
Parse.Cloud.define('getReport', getReport)
Parse.Cloud.define('generateAppToken', generateAppToken)
Parse.Cloud.define('v1', v1)