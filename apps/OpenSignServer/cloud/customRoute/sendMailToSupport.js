import { appName, smtpenable } from '../../Utils.js';

export default async function sendmailtoSupport(userDetails, errorMessage) {
  const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
  // Render a simple HTML form. In production, consider using a templating engine.
  try {
    await Parse.Cloud.sendEmail({
      sender: appName + ' <' + mailsender + '>',
      recipient: 'support@opensignlabs.com',
      subject: `Error while deleting account – ${appName}`,
      text: `Error while deleting account – ${appName}`,
      html: `<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 40px;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      padding: 30px;
    }

    h1 {
      color: #dc3545;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }

    h2 {
      font-size: 20px;
      color: #495057;
      margin-top: 30px;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 10px;
    }

    .details p {
      margin: 10px 0;
      line-height: 1.6;
    }

    .label {
      font-weight: bold;
      color: #212529;
    }

    .value {
      color: #495057;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error: ${errorMessage}</h1>

    <h2>User Details</h2>
    <div class="details">
      <p><span class="label">UserRole:</span> <span class="value">${userDetails?.UserRole}</span></p>
      <p><span class="label">Name:</span> <span class="value">${userDetails?.Name}</span></p>
      <p><span class="label">Email:</span> <span class="value">${userDetails?.Email}</span></p>
      <p><span class="label">UserId:</span> <span class="value">${userDetails?.UserId}</span></p>
      <p><span class="label">ExtUserId:</span> <span class="value">${userDetails?.objectId}</span></p>
      <p><span class="label">TenantId:</span> <span class="value">${userDetails?.TenantId}</span></p>
    </div>
  </div>
</body>
</html>`,
    });
  } catch (err) {
    console.log('err while sending mail to support', err);
  }
}
