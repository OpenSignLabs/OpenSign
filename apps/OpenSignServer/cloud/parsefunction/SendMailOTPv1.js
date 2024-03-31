import { updateMailCount } from '../../Utils.js';

async function sendMailOTPv1(request) {
  try {
    //--for elearning app side
    let code = Math.floor(1000 + Math.random() * 9000);
    let email = request.params.email;
    var TenantId = request.params.TenantId ? request.params.TenantId : undefined;
    // console.log("In tempSendOTPv2");

    // console.log(JSON.stringify(request));

    if (email) {
      const recipient = request.params.email;
      const otp = request.params.otp;
      const mailsender = process.env.SMTP_ENABLE
        ? process.env.SMTP_USER_EMAIL
        : process.env.MAILGUN_SENDER;
      try {
        await Parse.Cloud.sendEmail({
          from: 'Opensign™' + ' <' + mailsender + '>',
          recipient: recipient,
          subject: 'Your OpenSign™ OTP',
          text: 'This email is a test.',
          html:
            "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for OpenSign™ verification is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>" +
            otp +
            '</p></div> </div> </div></body></html>',
        });
        console.log('OTP sent');
        if (request.params?.extUserId) {
          await updateMailCount(request.params.extUserId);
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
