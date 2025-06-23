import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { db } from './config/db.js';
import { STRINGS } from './constants/strings.js';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import geoip from 'geoip-lite';
import { SmsClient } from '@azure/communication-sms';
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { toZonedTime, format } from 'date-fns-tz';

dotenv.config();

const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;
const smsClient = new SmsClient(connectionString);
const emailClient = new EmailClient(connectionString);
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

export const cloudServerUrl = 'http://localhost:8080/app';
export const appName = process.env.APP_NAME || 'OpenSign™';
export function customAPIurl() {
  const url = new URL(cloudServerUrl);
  return url.pathname === '/api/app' ? url.origin + '/api' : url.origin;
}

export const color = [
  '#93a3db',
  '#e6c3db',
  '#c0e3bc',
  '#bce3db',
  '#b8ccdb',
  '#ceb8db',
  '#ffccff',
  '#99ffcc',
  '#cc99ff',
  '#ffcc99',
  '#66ccff',
  '#ffffcc',
];

export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }
  const result = { subject: replacedSubject, body: replacedBody };
  return result;
}

export const saveFileUsage = async (size, fileUrl, userId) => {
  //checking server url and save file's size
  try {
    if (userId) {
      const tenantQuery = new Parse.Query('partners_Tenant');
      tenantQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const tenant = await tenantQuery.first();
      if (tenant) {
        const tenantPtr = { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id };
        try {
          const tenantCredits = new Parse.Query('partners_TenantCredits');
          tenantCredits.equalTo('PartnersTenant', tenantPtr);
          const res = await tenantCredits.first({ useMasterKey: true });
          if (res) {
            const response = JSON.parse(JSON.stringify(res));
            const usedStorage = response?.usedStorage ? response.usedStorage + size : size;
            const updateCredit = new Parse.Object('partners_TenantCredits');
            updateCredit.id = res.id;
            updateCredit.set('usedStorage', usedStorage);
            await updateCredit.save(null, { useMasterKey: true });
          } else {
            const newCredit = new Parse.Object('partners_TenantCredits');
            newCredit.set('usedStorage', size);
            newCredit.set('PartnersTenant', tenantPtr);
            await newCredit.save(null, { useMasterKey: true });
          }
        } catch (err) {
          console.log('err in save usage', err);
        }
        saveDataFile(size, fileUrl, tenantPtr);
      }
    }
  } catch (err) {
    console.log('err in fetch tenant Id', err);
  }
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, fileUrl, tenantPtr) => {
  try {
    const newDataFiles = new Parse.Object('partners_DataFiles');
    newDataFiles.set('FileUrl', fileUrl);
    newDataFiles.set('FileSize', size);
    newDataFiles.set('TenantPtr', tenantPtr);
    await newDataFiles.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('error in save usage ', err);
  }
};

export const updateMailCount = async (extUserId, plan, monthchange) => {
  // Update count in contracts_Users class
  const query = new Parse.Query('contracts_Users');
  query.equalTo('objectId', extUserId);

  try {
    const contractUser = await query.first({ useMasterKey: true });
    if (contractUser) {
      contractUser.increment('EmailCount', 1);
      if (plan === 'freeplan') {
        if (monthchange) {
          contractUser.set('LastEmailCountReset', new Date());
          contractUser.set('MonthlyFreeEmails', 1);
        } else {
          if (contractUser?.get('MonthlyFreeEmails')) {
            contractUser.increment('MonthlyFreeEmails', 1);
            if (contractUser?.get('LastEmailCountReset')) {
              contractUser.set('LastEmailCountReset', new Date());
            }
          } else {
            contractUser.set('MonthlyFreeEmails', 1);
            contractUser.set('LastEmailCountReset', new Date());
          }
        }
      }
      await contractUser.save(null, { useMasterKey: true });
    }
  } catch (error) {
    console.log('Error updating EmailCount in contracts_Users: ' + error.message);
  }
};

export function formatWidgetOptions(type, options) {
  const status = options?.required === true ? 'required' : 'optional' || 'required';
  const defaultValue = options?.default || '';
  const values = options?.values || [];
  switch (type) {
    case 'signature':
      return { name: 'signature', status: 'required' };
    case 'stamp':
      return { status: status, name: 'stamp' };
    case 'initials':
      return { status: status, name: options.name || 'initials' };
    case 'image':
      return { status: status, name: options.name || 'image' };
    case 'email':
      return { status: status, name: options.name || 'email', validation: { type: 'email' } };
    case 'name':
      return { status: status, name: options.name || 'name' };
    case 'job title':
      return { status: status, name: options.name || 'job title' };
    case 'company':
      return { status: status, name: options.name || 'company' };
    case 'date': {
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      let yyyy = today.getFullYear();
      // today = dd + '-' + mm + '-' + yyyy;
      today = mm + '-' + dd + '-' + yyyy;
      let dateFormat = options?.format;
      dateFormat = dateFormat.replace(/m/g, 'M');

      return {
        status: status,
        name: options.name || 'date',
        response: defaultValue || today,
        validation: { format: dateFormat || 'dd-MM-yyyy', type: 'date-format' },
      };
    }
    case 'textbox':
      return {
        status: status,
        name: 'textbox',
        defaultValue: defaultValue,
        hint: options.hint,
        validation: { type: 'regex', pattern: options?.regularexpression || '/^[a-zA-Z0-9s]+$/' },
      };
    case 'checkbox': {
      const arr = options?.values;
      let selectedvalues = [];
      for (const obj of options.selectedvalues) {
        const index = arr.indexOf(obj);
        selectedvalues.push(index);
      }
      return {
        status: status,
        name: options.name || 'checkbox',
        values: values,
        isReadOnly: options?.readonly || false,
        isHideLabel: options?.hidelabel || false,
        validation: {
          minRequiredCount: options?.validation?.minselections || 0,
          maxRequiredCount: options?.validation?.maxselections || 0,
        },
        defaultValue: selectedvalues || [],
      };
    }
    case 'radio button': {
      return {
        status: status,
        name: options.name || 'radio',
        values: values,
        isReadOnly: options?.readonly || false,
        isHideLabel: options?.hidelabel || false,
        defaultValue: defaultValue,
      };
    }
    case 'dropdown':
      return {
        status: status,
        name: options.name || 'dropdown',
        values: values,
        defaultValue: defaultValue,
      };
    default:
      break;
  }
}

export function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  const file = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
  const removedot = file.replace(/\.(?=.*\.)/g, '');
  return removedot.replace(/[^a-zA-Z0-9._-]/g, '');
}

export const useLocal = process.env.USE_LOCAL ? process.env.USE_LOCAL.toLowerCase() : 'false';
export const smtpsecure = process.env.SMTP_PORT && process.env.SMTP_PORT !== '465' ? false : true;
export const smtpenable =
  process.env.SMTP_ENABLE && process.env.SMTP_ENABLE.toLowerCase() === 'true' ? true : false;

export const planCredits = {
  'pro-weekly': 100,
  'pro-yearly': 240,
  'professional-monthly': 100,
  'professional-yearly': 240,
  'team-weekly': 100,
  'team-yearly': 500,
  'teams-monthly': 100,
  'teams-yearly': 500,
};

// Create a transporter
export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'karen0@ethereal.email',
    pass: '3kQgxUfVJcWHvQ1mSZ',
  },
});

const insertDocumentHistory = async (
  docId,
  actionType,
  actionBy,
  details,
  timestamp = null,
  createdAtUTC = null
) => {
  if (!docId || !actionType) {
    throw new Error('Missing required parameters: docId, actionType');
  }

  // Use createdAt if provided, otherwise use NOW()
  const query = `
    INSERT INTO document_history (docId, actionType, performedBy, details, createdAt, updatedAt, timestamp)
    VALUES (?, ?, ?, ?, ${createdAtUTC ? '?' : 'NOW()'}, NOW(), ${timestamp ? '?' : 'NOW()'})
  `;

  try {
    const params = [docId, actionType, actionBy, details];
    if (createdAtUTC) {
      params.push(createdAtUTC);
    }
    if (timestamp) {
      params.push(timestamp);
    }

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 1) {
      return `document_history record inserted successfully for Document ID: ${docId}`;
    } else {
      throw new Error('Failed to insert record.');
    }
  } catch (error) {
    console.error('Error inserting document history:', error);
    throw error;
  }
};

const getClientIP = (req, ip) => {
  // First check for the forwarded IP in case of proxy
  const forwardedIp = req.headers['x-forwarded-for'];
  if (forwardedIp) {
    // If there are multiple IPs in the x-forwarded-for header, get the first one
    return forwardedIp.split(',')[0];
  }

  if (ip) {
    return ip;
  }

  // Fall back to req.ip (standard in Express)
  if (req.ip) {
    return req.ip;
  }

  // As a last fallback, use req.connection.remoteAddress (for older versions of Express or if not behind a proxy)
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  // If none of the above, return 'IP not found'
  return 'IP not found';
};

// Function to verify and extract email from the token
const getEmailFromToken = token => {
  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if email exists in the decoded token
    if (decoded && decoded.email) {
      return { email: decoded.email, isValid: true };
    } else {
      return { email: null, isValid: false }; // Email not found in token
    }
  } catch (error) {
    return { email: null, isValid: false }; // Token verification failed
  }
};

// Function to get token from the headers and validate the format
const getTokenFromHeaders = req => {
  const authHeader = req.headers['authorization']; // Get the Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7); // Remove "Bearer " and extract the token

    // Check if token is not empty
    if (!token) {
      return { token: null, isValid: false };
    }
    return { token, isValid: true };
  }

  return { token: null, isValid: false }; // No valid header found
};

// Function to get email from the request headers
const getEmailFromRequestHeaders = token => {
  // const { token, isValid } = getTokenFromHeaders(req);  // Get token and validity status

  // if (isValid) {
  const { email, isValid: emailValid } = getEmailFromToken(token); // Extract email and validity status
  if (emailValid) {
    return { email, isValid: true }; // Email is valid
  } else {
    return { email: null, isValid: false }; // Invalid token, unable to extract email
  }
  // } else {
  //   return { email: null, isValid: false };  // Authorization header missing or improperly formatted
  // }
};

const getEmail = token => {
  const { email, isValid } = getEmailFromRequestHeaders(token);

  if (isValid) {
    console.log('Email:', email); // Use email if valid
    return email;
  } else {
    console.log('Invalid token, unable to extract email.');
    return false;
  }
};

export const insertDocumentHistoryRecord = async (
  docId,
  actionType,
  details,
  req,
  ip,
  authToken,
  createdAt,
  createdAtUTC
) => {
  try {
    // Get the IP address
    const clientIP = getClientIP(req, ip);
    const isCheckedStatus = actionType === STRINGS.STATUS.CHECKED ? STRINGS.STATUS_TEXT : '';
    const email = (authToken && getEmail(authToken)) || '';

    // Create details message
    const message = `Document${
      isCheckedStatus ? ` ${isCheckedStatus}` : ''
    } ${actionType.toLowerCase()} by '${email}' at IP address '${clientIP}'`;

    // Insert document history record
    const recordDetails = JSON.stringify({ message: details || message });

    const result = await insertDocumentHistory(
      docId,
      actionType,
      email,
      recordDetails,
      createdAt,
      createdAtUTC
    );
    console.log(result);

    return result;
  } catch (error) {
    console.error('Error inserting document history:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export const getDocumentHistory = async (docId, userTimezone, userIP) => {
  try {
    // Check if docId is provided
    if (!docId) {
      throw new Error('Document ID is required');
    }
    const geo = geoip.lookup(
      process.env.NODE_ENV === STRINGS.ENVIRONMENT.DEVELOPMENT ? process.env.TEST_IP : userIP
    );

    // Create a database connection
    const connection = await db.getConnection();

    try {
      // Query the database for document history records
      const query = `
        SELECT 
          actionType,
          details,
          DATE_FORMAT(timestamp, '%Y-%m-%dT%H:%i:%s') AS timestamp,
          DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
        FROM document_history
        WHERE docId = ?
        ORDER BY createdAt;`;

      const [rows] = await connection.query(query, [docId]);
      const formattedRows = rows.map(row => {
        const timezoneAbbr = getTimestampInTimezone(geo.timezone, true, null, true);
        return {
          ...row,
          timestamp: `${row.timestamp} ${timezoneAbbr}`,
          createdAt: row.createdAt,
        };
      });

      // Return the rows retrieved
      return formattedRows;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching document history:', error);
    throw error;
  }
};

export const azureOptions = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  container: process.env.AZURE_CONTAINER_NAME,
  accessKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  baseUrl: process.env.AZURE_BASEURL,
  directAccess: true,
};

export function convertUtcToSpecificTimezone(
  utcTimestamp,
  specificTimezone = null,
  showTimestampWithoutOffset = false
) {
  try {
    const utcDate = new Date(utcTimestamp);
    if (isNaN(utcDate.getTime())) {
      throw new Error('Invalid UTC timestamp provided.');
    }

    // UTC format (removed milliseconds)
    const utcFormatted = utcDate.toISOString().replace('Z', '').slice(0, 19);

    // IST timezone (no DST for IST)
    const ISTOffset = 5 * 60 + 30; // 5 hours 30 minutes in minutes
    const istDate = new Date(utcDate.getTime() + ISTOffset * 60000);

    // Remove milliseconds from IST format
    const istFormatted = istDate.toISOString().replace('Z', '').slice(0, 19);

    // US timezones with their IANA identifiers (including DST)
    const usTimezones = {
      EST: 'America/New_York', // Standard Time
      EDT: 'America/New_York', // Daylight Saving Time
      CST: 'America/Chicago', // Standard Time
      CDT: 'America/Chicago', // Daylight Saving Time
      MST: 'America/Denver', // Standard Time
      MDT: 'America/Denver', // Daylight Saving Time
      PST: 'America/Los_Angeles', // Standard Time
      PDT: 'America/Los_Angeles', // Daylight Saving Time
      AKST: 'America/Anchorage', // Standard Time
      AKDT: 'America/Anchorage', // Daylight Saving Time
      HST: 'Pacific/Honolulu', // Hawaii does not observe DST
    };

    // Format a date in the provided timezone
    const formatDateInTimezone = (date, timeZone) => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(date);
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      const hour = parts.find(p => p.type === 'hour').value;
      const minute = parts.find(p => p.type === 'minute').value;
      const second = parts.find(p => p.type === 'second').value;

      // If we're showing timestamp without offset, we omit the "T"
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    };

    // Convert a timezone offset (like "GMT+5:30") to minutes
    const convertOffsetToMinutes = offset => {
      const match = offset.match(/GMT([+-]\d{1,2}):?(\d{2})/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return hours * 60 + minutes;
      }
      return null;
    };

    // Convert to all U.S. timezones (including DST)
    const usTimezoneConversions = {};
    for (const [abbr, tz] of Object.entries(usTimezones)) {
      usTimezoneConversions[abbr] = `${formatDateInTimezone(utcDate, tz)} (${abbr})`;
    }

    // Convert to other GMT timezones like "GMT+5:30", "GMT-03:00"
    const gmtOffsets = {};
    for (let i = -12; i <= 14; i++) {
      const offsetStr = `GMT${i >= 0 ? '+' : ''}${i}:00`; // e.g., GMT+1:00, GMT-5:00
      gmtOffsets[offsetStr] = `${formatDateInTimezone(
        utcDate,
        `Etc/GMT${i < 0 ? '+' : '-'}${Math.abs(i)}`
      )} (${offsetStr})`;
    }

    // If a specific timezone is provided
    if (specificTimezone) {
      if (usTimezones[specificTimezone]) {
        // Handle US Timezones
        const timezoneAbbr = specificTimezone;
        const timezoneFormatted = formatDateInTimezone(utcDate, usTimezones[specificTimezone]);
        return showTimestampWithoutOffset
          ? `${timezoneFormatted}`
          : `${timezoneFormatted} (${timezoneAbbr})`;
      } else if (specificTimezone === 'IST') {
        // Handle IST
        return showTimestampWithoutOffset ? `${istFormatted}` : `${istFormatted} (IST)`;
      } else if (/GMT[+-]\d{1,2}:\d{2}/.test(specificTimezone)) {
        // Handle GMT offset values like GMT+5:30, GMT-6:00
        const offsetInMinutes = convertOffsetToMinutes(specificTimezone);
        if (offsetInMinutes !== null) {
          const offsetDate = new Date(utcDate.getTime() + offsetInMinutes * 60000);
          return showTimestampWithoutOffset
            ? `${offsetDate.toISOString().replace('Z', '').slice(0, 19)}`
            : `${offsetDate.toISOString().replace('Z', '').slice(0, 19)} (${specificTimezone})`;
        } else {
          return showTimestampWithoutOffset ? `${utcFormatted}` : `${utcFormatted} (UTC)`;
        }
      } else {
        // Handle invalid timezones or offset
        return showTimestampWithoutOffset ? `${utcFormatted}` : `${utcFormatted} (UTC)`;
      }
    }

    // If no specific timezone is provided, return an object with all timezones
    const formattedResult = {
      UTC: `${utcFormatted} (UTC)`,
      IST: `${istFormatted} (IST)`,
      ...usTimezoneConversions,
      ...gmtOffsets,
    };

    // If showTimestampWithoutOffset is true, return only the timestamp without the offset
    if (showTimestampWithoutOffset) {
      Object.keys(formattedResult).forEach(key => {
        formattedResult[key] =
          formattedResult[key].split(' ')[0] + ' ' + formattedResult[key].split(' ')[1].slice(0, 8); // Get date and time only (HH:mm:ss)
      });
    }

    return formattedResult;
  } catch (error) {
    console.error(error.message);
    return `Error: Invalid input - UTC Timestamp: ${utcTimestamp}`;
  }
}

/**
 * Converts the current timestamp to the specified timezone.
 * @param {string} timezone - The IANA timezone string (e.g., "Asia/Kolkata").
 * @returns {string} - The timestamp in the format "YYYY-MM-DDTHH:mm:ss".
 */
export function getTimestampInTimezone(
  timezone = null,
  showAbbreviation = false,
  utcTimestamp = null,
  returnAbbreviation = false,
  useUSFormat = false
) {
  let dt;

  if (utcTimestamp) {
    dt = DateTime.fromISO(utcTimestamp, { zone: 'utc' }); // Parse the given UTC timestamp
  } else {
    dt = DateTime.utc(); // Default to current UTC time
  }

  if (!timezone) {
    if (useUSFormat) {
      return dt.toFormat(`MM/dd/yyyy`);
    }
    return returnAbbreviation
      ? 'UTC'
      : dt.toFormat(`yyyy-MM-dd'T'HH:mm:ss${showAbbreviation ? " 'UTC'" : ''}`);
  }

  try {
    const convertedDt = dt.setZone(timezone);

    if (!convertedDt.isValid) {
      throw new Error('Invalid timezone');
    }

    // Get abbreviation or fallback to numeric offset
    const abbreviation =
      DateTime.now().setZone(timezone).offsetNameShort || convertedDt.toFormat('ZZZ');

    if (returnAbbreviation) {
      return abbreviation;
    }

    if (useUSFormat) {
      return convertedDt.toFormat(`MM/dd/yyyy`);
    }

    return convertedDt.toFormat(
      `yyyy-MM-dd'T'HH:mm:ss${showAbbreviation ? ` '${abbreviation}'` : ''}`
    );
  } catch (error) {
    console.error('Invalid timezone provided:', timezone);
    if (useUSFormat) {
      return dt.toFormat(`MM/dd/yyyy`);
    }
    return returnAbbreviation
      ? 'UTC'
      : dt.toFormat(`yyyy-MM-dd'T'HH:mm:ss${showAbbreviation ? " 'UTC'" : ''}`);
  }
}

export const updateSignerStatus = async (signerEmail, signerStatus, docId, docSignedAt) => {
  try {
    const updateQuery = `UPDATE signers SET signerStatus = ?, docSignedAt = ? WHERE signerEmail = ? AND docId = ?`;
    const [updateResult] = await db.execute(updateQuery, [
      signerStatus,
      docSignedAt,
      signerEmail,
      docId,
    ]);

    const isUpdated = updateResult.affectedRows > 0;

    return {
      success: isUpdated,
      message: isUpdated
        ? 'Signer status updated successfully.'
        : 'No record found for the given email.',
    };
  } catch (error) {
    console.error('Error updating signer status:', error);
    return {
      success: false,
      message: 'Failed to update signer status.',
      error,
    };
  }
};

export const sendSMS = async (receiverPhoneNo, msg) => {
  return await smsClient
    .send({
      from: process.env.AZURE_SMS_SENDER_PHONENO,
      to: [`+1${receiverPhoneNo}`],
      message: msg,
    })
    .then(smsRes => {
      console.log('\n----smsRes---', smsRes);
      return true;
    })
    .catch(otpErr => {
      console.log('\n----otpSendErr---', otpErr);
      return false;
    });
};

export const notifyNextSigner = async docId => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      'SELECT policyNumber, signurl, agentName, agentEmail FROM policies WHERE docId = ?',
      [docId]
    );

    if (!rows.length) {
      console.log('No policy found for this docId.');
      return;
    }
    const { signurl, agentEmail, policyNumber, agentName } = rows[0];
    const recipients = signurl;
    const match = recipients.find(r => r.email === agentEmail?.toLowerCase());
    if (!match) {
      console.log('Email not found in recipients.');
      return;
    }

    const url = match.url;

    const message = {
      senderAddress: process.env.AZURE_EMAIL_SENDER,
      content: {
        subject: STRINGS.EMAIL.NEXT_SIGNER.SUBJECT.replace('$policyNumber', policyNumber),
        plainText: STRINGS.EMAIL.NEXT_SIGNER.BODY.replace('{{url}}', url)
          .replace('{{name}}', agentName)
          .replace('{{policyNumber}}', policyNumber),
        html: STRINGS.EMAIL.NEXT_SIGNER.BODY.replace('{{url}}', url)
          .replace('{{name}}', agentName)
          .replace('{{policyNumber}}', policyNumber),
      },
      recipients: {
        to: [{ address: agentEmail }],
      },
    };

    // const response = await emailClient.send(message);
    const poller = await emailClient.beginSend(message);
    const emailResponse = await poller.pollUntilDone();
    console.log('\n-----emailResponse------', emailResponse);
    if (emailResponse.status === KnownEmailSendStatus.Succeeded) {
      console.log(`Email sent successfully to ${agentEmail}`);
    } else {
      console.error(`Failed to send email: ${emailResponse.error}`);
    }
  } catch (error) {
    console.error('Error while sending email:', error);
  } finally {
    connection.release();
  }
};

const containerName = azureOptions.container;
const generateSasUrl = async blobName => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const expiresOn = new Date(new Date().valueOf() + 2 * 24 * 60 * 60 * 1000); // valid for 2 days

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'), // read-only
      expiresOn,
      protocol: SASProtocol.Https,
    },
    blobServiceClient.credential // NOTE: this works only if we have used StorageSharedKeyCredential
  ).toString();

  return `${blobClient.url}?${sasToken}`;
};

export const notifySignersOfSignedDoc = async docId => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      'SELECT insuredEmail, insuredName, agentName, agentEmail, signedDocName FROM policies WHERE docId = ?',
      [docId]
    );

    if (!rows || rows.length === 0) {
      console.error('No policy found with the provided docId');
      return;
    }

    const { insuredEmail, agentEmail, signedDocName } = rows[0];
    const recipients = [{ email: insuredEmail, role: STRINGS.USER_ROLE.INSURED }];
    if (agentEmail) {
      recipients.push({ email: agentEmail, role: STRINGS.USER_ROLE.AGENT });
    }

    const downloadLink = await generateSasUrl(signedDocName);
    const buildEmailContent = (recipient, downloadLink) => {
      const isInsured = recipient.role === STRINGS.USER_ROLE.INSURED;
      const { INSURED, AGENT } = STRINGS.EMAIL.SIGNED;
      const roleMessages = isInsured ? INSURED : AGENT;

      // Pre-compile all replacements
      const replacements = {
        '{{downloadLink}}': downloadLink,
        '{{introMsg}}': roleMessages.INTRODUCTION,
        '{{introMsg_2}}': roleMessages.INTRODUCTION_2,
        '{{availabilityMsg}}': roleMessages.AVAILABILITY,
        '{{downloadMsg}}': roleMessages.DOWNLOAD,
        '{{assistanceMsg}}': roleMessages.ASSISTANCE,
      };

      // Single-pass replacement
      const html = Object.entries(replacements).reduce(
        (content, [key, value]) => content.replace(key, value),
        STRINGS.EMAIL.SIGNED.BODY
      );

      return {
        senderAddress: process.env.AZURE_EMAIL_SENDER,
        content: {
          subject: STRINGS.EMAIL.SIGNED.SUBJECT.replace('{{subjectMsg}}', roleMessages.SUBJECT_MSG),
          html,
        },
        recipients: {
          to: [{ address: recipient.email }],
        },
      };
    };

    const messages = recipients.map(recipient => buildEmailContent(recipient, downloadLink));

    for (const msg of messages) {
      const poller = await emailClient.beginSend(msg);
      const emailResponse = await poller.pollUntilDone();
      if (emailResponse.status === KnownEmailSendStatus.Succeeded) {
        console.log(`Email sent successfully to ${msg.recipients.to[0].address}`);
      } else {
        console.error('Failed to send email:', emailResponse.error);
      }
    }
  } catch (err) {
    console.error('Error notifying signers:', err);
  } finally {
    connection.release();
  }
};

/**
 * Convert UTC timestamp to any timezone with DST support
 * @param {string} utcTimestamp - UTC timestamp in 'YYYY-MM-DD HH:mm:ss' format
 * @param {string} timezone - IANA timezone (e.g., 'Asia/Kolkata')
 * @returns {string} Formatted local time in 'YYYY-MM-DD HH:mm:ss' format
 */
export const convertUTCToTimezone = (utcTimestamp, timezone = 'Asia/Kolkata') => {
  try {
    // Properly parse the UTC timestamp (add 'Z' to indicate UTC)
    const isoString = `${utcTimestamp.replace(' ', 'T')}Z`;
    const date = new Date(isoString);

    // Validate date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid UTC timestamp');
    }

    // Convert to target timezone
    const zonedTime = toZonedTime(date, timezone);

    // Format as string
    return format(zonedTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: timezone });
  } catch (error) {
    console.error('Timezone conversion error:', error.message);
    return utcTimestamp;
  }
};

export const formatISOToTraditional = isoString => {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    console.error('Invalid ISO date string');
    return isoString; // Return original if invalid
  }

  // Extract components
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
