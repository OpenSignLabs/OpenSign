async function SendMailv1(request) {
  console.log('in SendMailv1');

  try {
    const recipient = request.params.email;
    const otp = request.params.otp;
    const res = await Parse.Cloud.sendEmail({
      from: 'Test user' + ' <' + process.env.MAILGUN_SENDER + '>',
      recipient: recipient,
      subject: 'your otp',
      text: 'This email is a test.',
      html:
        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for LegaDaft verification .</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>" +
        otp +
        '</p></div> </div> </div></body></html>',
      // "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body style='text-align: center;'><div style='display:flex;flex-direction:column;justify-content:center;align-item:center;margin:40px'>  <p style='font-weight: bolder; font-size: large;'>Hello,</p> <span>Your OTP for LegaDaft verification . </span> <p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px'>76984</p><span>Thank You!</span> </div> </body></html>"
    });
    console.log('Res');
    console.log(res);
    return otp;
  } catch (err) {
    console.log('err in SendMailv1');
    console.log(err);
    return err;
  }
}
export default SendMailv1;
