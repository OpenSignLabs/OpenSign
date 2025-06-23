import {
  appName,
  getTimestampInTimezone,
  insertDocumentHistoryRecord,
  smtpenable,
  transporter,
  updateMailCount,
} from '../../Utils.js';
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';
import { SmsClient } from '@azure/communication-sms';
import { STRINGS } from '../../constants/strings.js';
import geoip from 'geoip-lite';

const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;
const client = new EmailClient(connectionString);
const smsClient = new SmsClient(connectionString);
async function getDocument(docId) {
  try {
    const query = new Parse.Query('contracts_Document');
    query.equalTo('objectId', docId);
    query.include('ExtUserPtr');
    query.include('CreatedBy');
    query.include('Signers');
    query.include('AuditTrail.UserPtr');
    query.include('Placeholders');
    query.include('DocUniqueId');
    query.include('OpenSignAuthToken');
    query.notEqualTo('IsArchive', true);
    const res = await query.first({ useMasterKey: true });
    const _res = res.toJSON();
    // return _res?.ExtUserPtr?.objectId;
    return _res;
  } catch (err) {
    console.log('err ', err);
  }
}
async function sendMailOTPv1(request) {
  try {
    //--for elearning app side
    const code = Math.floor(100000 + Math.random() * 900000);
    const ip = request.headers['x-real-ip'];
    const geo = geoip.lookup(
      process.env.NODE_ENV === STRINGS.ENVIRONMENT.DEVELOPMENT ? process.env.TEST_IP : ip
    );
    let email = request.params.email;
    const receiverPhoneNo = request.params.phoneNo;
    console.log('\n---receiverPhoneNo----', receiverPhoneNo);
    var TenantId = request.params.TenantId ? request.params.TenantId : undefined;

    if (email) {
      const recipient = request.params.email;
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
      try {
        // await Parse.Cloud.sendEmail({
        //   from: appName + ' <' + mailsender + '>',
        //   recipient: recipient,
        //   subject: `Your ${appName} OTP`,
        //   text: 'This email is a test.',
        //   html:
        //     `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for ${appName} verification is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>` +
        //     code +
        //     '</p></div> </div> </div></body></html>',
        // });
        // const mailOptions = {
        //   from: appName + ' <' + mailsender + '>', // Sender address
        //   to: recipient, // List of recipients
        //   subject: `Your ${appName} OTP`, // Subject line
        //   text: 'This email is a test.', // Plain text body
        //   html:
        //     `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for ${appName} verification is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>` +
        //     code +
        //     '</p></div> </div> </div></body></html>',
        // };
        const emailMessage = {
          senderAddress: process.env.AZURE_EMAIL_SENDER,
          content: {
            subject: `Your ${appName} OTP`,
            plainText: 'OTP',
            html:
              `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for ${appName} verification is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>` +
              code +
              '</p></div> </div> </div></body></html>',
          },
          recipients: {
            to: [{ address: recipient }],
          },
        };
        async function main() {
          return await smsClient
            .send({
              from: process.env.AZURE_SMS_SENDER_PHONENO,
              to: [`+1${receiverPhoneNo}`],
              message: `Your OTP for ${appName} verification is: ${code}`,
            })
            .then(smsRes => {
              console.log('\n----smsRes---', smsRes);
              return true;
            })
            .catch(otpErr => {
              console.log('\n----otpSendErr---', otpErr);
              return false;
            });
        }
        // if (!receiverPhoneNo || !(await main())) {
        //   return false;
        // }

        // const poller = await client.beginSend(emailMessage);
        // const emailResponse = await poller.pollUntilDone();
        // console.log('\n-----emailResponse------', emailResponse);
        // if (emailResponse.status === KnownEmailSendStatus.Succeeded) {
        //   console.log('Email sent successfully!');
        // } else {
        //   console.error(`Failed to send email: ${emailResponse.error}`);
        // }
        // await transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //     return console.log(error);
        //   }
        //   console.log('Message sent: %s', info.messageId);
        // });
        const docRes = await getDocument(request.params?.docId);
        await insertDocumentHistoryRecord(
          docRes?.DocUniqueId,
          STRINGS.STATUS.OTPSENT,
          STRINGS.OTP.SENT.replace('$phoneNo', receiverPhoneNo).replace('$ipAddress', ip),
          request,
          ip,
          docRes?.OpenSignAuthToken,
          getTimestampInTimezone(geo.timezone)
        );

        console.log('OTP sent', code);
        if (request.params?.docId) {
          const res = await getDocument(request.params?.docId);
          if (res && res.extUserId) {
            // updateMailCount(extUserId);
          }
        }
      } catch (err) {
        console.log('error in send OTP mail', err);
      }
      const tempOtp = new Parse.Query('defaultdata_Otp');
      tempOtp.equalTo('Email', email);
      const resultOTP = await tempOtp.first({ useMasterKey: true });
      // console.log('resultOTP', resultOTP);
      if (resultOTP !== undefined) {
        const updateOtpQuery = new Parse.Query('defaultdata_Otp');
        const updateOtp = await updateOtpQuery.get(resultOTP.id, {
          useMasterKey: true,
        });
        updateOtp.set('OTP', code);
        updateOtp.save(null, { useMasterKey: true });
        //   console.log("update otp Res in tempSendOtp ", updateRes);
      } else {
        const otpClass = Parse.Object.extend('defaultdata_Otp');
        const newOtpQuery = new otpClass();
        newOtpQuery.set('OTP', code);
        newOtpQuery.set('Email', email);
        newOtpQuery.set('TenantId', TenantId);
        await newOtpQuery.save(null, { useMasterKey: true });
        //   console.log("new otp Res in tempSendOtp ", newRes);
      }
      return 'Otp send';
    } else {
      return 'Please Enter valid email';
    }
  } catch (err) {
    console.log('err in sendMailOTPv1');
    console.log(err);
    return err;
  }
}
export default sendMailOTPv1;
