const STATUS = {
  CREATED: 'CREATED',
  CHECKED: 'CHECKED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DOWNLOADED: 'DOWNLOADED',
  OTPSENT: 'OTPSENT',
  OTPAUTHENTICATED: 'OTPAUTHENTICATED',
  EMAILSENT: 'EMAILSENT',
  EMAILNOTSENT: 'EMAILNOTSENT',
  SIGNED: 'SIGNED',
  TERMSACCEPTED: 'TERMSACCEPTED',
  SMS_LINK_SENT: 'SMS_LINK_SENT',
  SMS_LINK_NOT_SENT: 'SMS_LINK_NOT_SENT',
};

const ENVIRONMENT = {
  DEVELOPMENT: 'development',
};

const USER_ROLE = {
  INSURED: 'Insured',
  AGENT: 'Agent',
};

// Timezone abbreviations mapping
const TIMEZONE_ABBREVIATIONS = {
  UTC: 'UTC',
  'Asia/Kolkata': 'IST',

  // United States Time Zones (with DST handling)
  'America/New_York': 'EST', // Eastern Standard Time
  'America/Detroit': 'EST',
  'America/Indianapolis': 'EST',
  'America/Kentucky/Louisville': 'EST',
  'America/Kentucky/Monticello': 'EST',

  'America/Chicago': 'CST', // Central Standard Time
  'America/Winnipeg': 'CST',
  'America/Mexico_City': 'CST',

  'America/Denver': 'MST', // Mountain Standard Time
  'America/Phoenix': 'MST', // Arizona doesn't observe DST

  'America/Los_Angeles': 'PST', // Pacific Standard Time
  'America/Vancouver': 'PST',

  'America/Anchorage': 'AKST', // Alaska Standard Time
  'Pacific/Honolulu': 'HST', // Hawaii Standard Time (no DST)

  // European Time Zones
  'Europe/London': 'GMT',
  'Europe/Paris': 'CET',
  'Europe/Berlin': 'CET',

  // Australian Time Zones
  'Australia/Sydney': 'AEST',
  'Australia/Melbourne': 'AEST',
  'Australia/Brisbane': 'AEST',
  'Australia/Adelaide': 'ACST',
  'Australia/Perth': 'AWST',
};

const STRINGS = {
  DOCUMENT: {
    DOWNLOADED: 'Document completed',
    SIGNED: `Document signed by '$user' at IP address '$ipAddress' using browser '$browserDetails'`,
  },
  OTP: {
    SENT: `OTP sent to the user $phoneNo at IP address '$ipAddress'`,
    AUTHENTICATED: `OTP authenticated by the user $phoneNo at IP address '$ipAddress'`,
  },
  EMAIL: {
    SENT: `Email '$subject' sent to '$recipient' for Signing at IP address '$ipAddress'`,
    NEXT_SIGNER: {
      SUBJECT: `Action Required: Please E-Sign Your Section for Policy #$policyNumber`,
      BODY: `<p>Hi {{name}},</p>
    
    <p>The e-signature process for Policy #<span style="font-weight: bold;">{{policyNumber}}</span> has been initiated, and the first signer has completed their portion.</p>
    <p>It is now your turn to review and sign the remaining documents. To proceed, please click the secure link below:</p>

    <p>🔗 <a href="{{url}}">Access the Document</a></p>
    
    <p>If you have any questions or need assistance, feel free to contact our team at <a href="mailto:https://www.opensignlabs.com/contact-us">OpenSign</a>.</p>
    <p>Thank you for your prompt attention.</p>
    <p>Best regards,<br>
    <span style="font-weight: bold;">OpenSign Underwriting Team</span></p>`,
    },
    SIGNED: {
      SUBJECT: 'Your Signed Document is {{subjectMsg}}',
      INSURED: {
        SUBJECT_MSG: 'Now Available',
        INTRODUCTION: 'The e-signing process for your document',
        INTRODUCTION_2: '. Your signed document is now ready for download',
        AVAILABILITY: 'To access it',
        DOWNLOAD: 'Signed Document',
        ASSISTANCE: 'need assistance, feel free to contact your agent or our support team',
      },
      AGENT: {
        SUBJECT_MSG: 'Ready for Download',
        INTRODUCTION: 'The document associated with your recent e-signature request',
        INTRODUCTION_2: ' and is now available for download',
        AVAILABILITY: 'To access your signed document',
        DOWNLOAD: 'Document',
        ASSISTANCE: 'require further assistance, feel free to contact our team',
      },
      BODY: `<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body style="background-color:#f5f5f5; padding:20px; font-family:system-ui, sans-serif;">
  <div style="max-width:600px; margin:auto; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:20px;">
    
    <p>Hello,</p>

    <p>{{introMsg}} has been successfully completed{{introMsg_2}}.</p>

    <p>{{availabilityMsg}}, please click the secure link below:</p>

    <p>🔗 <a href="{{downloadLink}}">[Download {{downloadMsg}}]</a></p>

    <div style="background-color:#f8f9fa; border-left:4px solid #d46b0f; padding:12px; margin:15px 0;">
      <p style="margin:0; font-weight:bold;">Note about Adobe Acrobat Reader:</p>
      <p style="margin:8px 0 0 0;">After completing your signing process, if viewing your document in Adobe Acrobat Reader, you may see the following warnings:</p>
      <ul style="margin:8px 0; padding-left:20px;">
        <li>At least one signature has problems</li>
        <li>Signer's identity is unknown because it has not been included in your list of trusted certificates...</li>
      </ul>
      <p style="margin:8px 0 0 0;">You can avoid these warnings by adding our Cert to your Trusted Cert List in Adobe. This is not required and the warning does not affect the validity of your electronic signature.</p>
    </div>

    <p>If you have any questions or {{assistanceMsg}}.</p>
    
    <p>Best regards,<br>
    <span style="font-weight: bold;">OpenSign Underwriting Team</span></p>
    
  </div>
</body>
</html>`,
    },
  },
  TERMS: {
    ACCEPTED: `Terms and conditions accepted by '$userEmail' at IP address '$ipAddress'`,
  },
  SIGNING_SMS_LINK: {
    SENT: `Signing link successfully sent via SMS to '$recipient'`,
    NOT_SENT: `Failed to send the signing link via SMS to '$recipient'`,
  },
  SIGNING_SMS_MSG: `Hi,\nOpenSign has requested you to review and e-sign $url.`,
  STATUS,
  STATUS_TEXT: 'status',
  ENVIRONMENT,
  TIMEZONE_ABBREVIATIONS,
  USER_ROLE,
};

export { STRINGS };
