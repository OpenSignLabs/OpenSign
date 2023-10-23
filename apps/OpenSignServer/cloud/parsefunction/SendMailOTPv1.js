async function sendMailOTPv1(request) {
  try {
    //--for elearning app side
    let code = Math.floor(1000 + Math.random() * 9000);
    let email = request.params.email;
    var TenantId = request.params.TenantId ? request.params.TenantId : undefined;
    // console.log("In tempSendOTPv2");

    // console.log(JSON.stringify(request));

    if (email) {
      axios({
        method: 'POST',
        url: serverUrl + '/functions/sendmail',
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': process.env.APP_ID,
        },
        params: {
          otp: code,
          email: email,
          TenantId: TenantId,
        },
      }).then(
        function (httpResponse) {},
        function (httpResponse) {
          console.error('sms Request failed with response code ' + httpResponse.status);
          return Promise.reject('sms Request failed with response code ' + httpResponse.status);
        }
      );

      const tempOtp = new Parse.Query('defaultdata_Otp');
      tempOtp.equalTo('Email', email);
      const resultOTP = await tempOtp.first({ useMasterKey: true });
      console.log('resultOTP', resultOTP);
      if (resultOTP !== undefined) {
        const updateOtpQuery = new Parse.Query('defaultdata_Otp');
        const updateOtp = await updateOtpQuery.get(resultOTP.id, {
          useMasterKey: true,
        });
        updateOtp.set('OTP', code);
        const updateRes = updateOtp.save(null, { useMasterKey: true });
        //   console.log("update otp Res in tempSendOtp ", updateRes);
      } else {
        const otpClass = Parse.Object.extend('defaultdata_Otp');
        const newOtpQuery = new otpClass();
        newOtpQuery.set('OTP', code);
        newOtpQuery.set('Email', email);
        newOtpQuery.set('TenantId', TenantId);
        const newRes = await newOtpQuery.save(null, { useMasterKey: true });
        //   console.log("new otp Res in tempSendOtp ", newRes);
      }
      return 'Otp send';
    } else {
      return Promise.reject('Please Enter valid email');
    }
  } catch (err) {
    console.log('err in sendMailOTPv1');
    console.log(err);
    return Promise.reject(err);
  }
}
export default sendMailOTPv1;
