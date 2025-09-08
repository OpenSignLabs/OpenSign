import { appName, smtpenable } from '../../Utils.js';

export const errHtml = err => {
  return `<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8" /><title>Reset Password</title></head>
  <body><h1 style="color:#1a5fa0; margin-bottom:16px;">${err}</h1></body></html>`;
};
const sendDeleteUserMail = async req => {
  const app = req.params.app || appName;
  if (!req.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing userId parameter.');
    }

    const userPointer = { __type: 'Pointer', className: '_User', objectId: userId };

    const createdByPointer = { __type: 'Pointer', className: '_User', objectId: req.user.id };

    const userCondition = new Parse.Query('contracts_Users');
    userCondition.equalTo('UserId', userPointer);

    const userAndCreatorCondition = new Parse.Query('contracts_Users');
    userAndCreatorCondition.equalTo('UserId', userPointer);
    userAndCreatorCondition.equalTo('CreatedBy', createdByPointer);

    const mainQuery = Parse.Query.or(userCondition, userAndCreatorCondition);

    const result = await mainQuery.first({ useMasterKey: true });
    const username = result.get('Email')?.toLowerCase()?.replace(/\s/g, '');
    const name = result?.get('Name') ? `<b>${result?.get('Name')}</b>` : '';
    const isAdmin = result?.get('UserRole') === 'contracts_Admin';
    if (!isAdmin) {
      throw new Parse.Error(
        Parse.Error.SCRIPT_FAILED,
        'This action is not permitted. Kindly contact your administrator to request account deletion.'
      );
    }

    const serverUrl = process.env?.SERVER_URL?.replace(/\/app\/?$/, '/');
    const deleteUrl = `${serverUrl}delete-account/${userId}`;
    const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
    // Render a simple HTML form. In production, consider using a templating engine.

    await Parse.Cloud.sendEmail({
      sender: app + ' <' + mailsender + '>',
      recipient: username,
      subject: `Account Deletion Request for ${username} – ${app}`,
      text: `Account Deletion Request for ${username} – ${app}`,
      html: `<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Account Deletion Request - ${app}</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4; color:#333;">
    <div
        style="max-width:600px; margin:50px auto; padding:30px; background-color:#ffffff; border:1px solid #e0e0e0; border-radius:8px;">
        <h2 style="color:#d9534f;">Request to Delete Your Account</h2>
        <p style="font-size:16px; line-height:1.5;">
            Hello ${name},
        </p>
        <p style="font-size:16px; line-height:1.5;">
            We have received a request to permanently delete your <b>${app}</b> account associated with <b>${username}</b>.
        </p>
        <p style="font-size:16px; line-height:1.5;">
            If you did not make this request, please ignore this email. Otherwise, click the button below to proceed
            with the deletion.
        </p>
        <p style="text-align:center; margin:30px 0;">
            <a href="${deleteUrl}"
                style="background-color:#d9534f; color:#ffffff; padding:12px 24px; border-radius:5px; text-decoration:none; font-size:16px;">
                Confirm Account Deletion
            </a>
        </p>
        <p style="font-size:16px; line-height:1.5;">
            If the button above doesn't work, please copy and open the following link with your browser.
        </p> 
        <p style="font-size:16px; text-align:center; margin:0px 0px 30px 0px;">
          <a href="${deleteUrl}">${deleteUrl}</a>
        </p>
        <p style="font-size:14px; color:#777;">
            Note: This action is irreversible and all your data will be permanently removed from our systems.
        </p>
        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
        <p style="font-size:12px; color:#999;">
            If you have any questions or need assistance, please contact our support team.
        </p>
        <p style="font-size:12px; color:#999;">
            &copy; ${new Date().getFullYear()} ${app}. All rights reserved.
        </p>
    </div>
</body>
</html>`,
    });
    return 'mail sent.';
  } catch (err) {
    console.log('Err in sending delete user email ', err);
    throw new Parse.Error(Parse.Error.SCRIPT_FAILED, err.message);
  }
};
export default sendDeleteUserMail;
