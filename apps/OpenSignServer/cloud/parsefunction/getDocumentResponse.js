const documentResponseFields = [
  'objectId',
  'createdAt',
  'updatedAt',
  'Name',
  'Note',
  'Description',
  'URL',
  'SignedUrl',
  'CertificateUrl',
  'ExtUserPtr',
  'CreatedBy',
  'Signers',
  'AuditTrail',
  'Placeholders',
  'DeclineBy',
  'DeclineReason',
  'IsEnableOTP',
  'IsCompleted',
  'IsDeclined',
  'ExpiryDate',
  'SendinOrder',
  'SendInOrderStrict',
  'RedirectUrl',
  'IsTourEnabled',
  'AllowModifications',
  'AllowOfflineSign',
  'QualifiedSignatureConfig',
  'PenColors',
  'FileAdapterId',
  'IsMergeCCToPdf',
  'IsSendMail',
  'NotifyOnSignatures',
  'OriginIp',
  'SignatureType',
  'IsPublic',
  'TimeToCompleteDays',
  'IsSignyourself',
  'SenderName',
  'SenderMail',
  'EmailSenderName',
  'RequestBody',
  'RequestSubject',
  'HideSignerSigningLinks',
  'EideasyQueueId',
  'EideasyQueueSecret',
];

const extUserResponseFields = [
  'objectId',
  'Name',
  'Email',
  'Company',
  'JobTitle',
  'Phone',
  'UserId',
  'SignatureType',
  'QualifiedSignatureConfig',
  'RequestBody',
  'RequestSubject',
  'EmailEditorType',
  'LastEmailCountReset',
  'Timezone',
  'DateFormat',
  'UseNameAsSender',
  'DownloadFilenameFormat',
  'MailBody',
  'MailSubject',
  'active_mail_adapter',
  'TenantId',
];

const tenantResponseFields = [
  'objectId',
  'AllowUserEmailTemplate',
  'AllowUserSmtp',
  'HideLiveChatForSigners',
  'WhiteLabelAppName',
  'active_mail_adapter',
];

const signerResponseFields = [
  'objectId',
  'Name',
  'Email',
  'Phone',
  'Company',
  'JobTitle',
  'UserId',
  'ExtUserPtr',
  'SignerRole',
  'Role',
  'Id',
];

function pickFields(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(
    fields.filter(field => Object.hasOwn(value, field)).map(field => [field, value[field]])
  );
}

function removeAccessCodeSecrets(value) {
  if (Array.isArray(value)) {
    return value.map(removeAccessCodeSecrets);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const hasAccessCode = Boolean(
    value.HasAccessCode || value.AccessCode || value.AccessCodeHash || value.AccessCodeSalt
  );
  const projected = Object.fromEntries(
    Object.entries(value)
      .filter(
        ([field]) =>
          field !== 'AccessCode' && field !== 'AccessCodeHash' && field !== 'AccessCodeSalt'
      )
      .map(([field, item]) => [field, removeAccessCodeSecrets(item)])
  );

  if (hasAccessCode) {
    projected.HasAccessCode = true;
  }

  return projected;
}

export function projectDocumentResponse(document, include = '') {
  const requestedIncludes = new Set(
    String(include)
      .split(',')
      .map(field => field.trim())
      .filter(field => field === 'Bcc' || field === 'Cc')
  );
  const response = pickFields(document, documentResponseFields);

  if (response.ExtUserPtr) {
    response.ExtUserPtr = pickFields(response.ExtUserPtr, extUserResponseFields);
    if (response.ExtUserPtr.TenantId) {
      response.ExtUserPtr.TenantId = pickFields(response.ExtUserPtr.TenantId, tenantResponseFields);
    }
    if (response.ExtUserPtr.UserId) {
      response.ExtUserPtr.UserId = pickFields(response.ExtUserPtr.UserId, ['objectId']);
    }
    if (response.ExtUserPtr.EmailEditorType) {
      response.ExtUserPtr.EmailEditorType = pickFields(response.ExtUserPtr.EmailEditorType, [
        'request',
        'Request',
      ]);
    }
  }

  if (response.CreatedBy) {
    response.CreatedBy = pickFields(response.CreatedBy, ['objectId']);
  }

  if (response.DeclineBy) {
    response.DeclineBy = pickFields(response.DeclineBy, ['email']);
  }

  if (Array.isArray(response.Signers)) {
    response.Signers = response.Signers.map(signer => {
      const projectedSigner = pickFields(signer, signerResponseFields);
      if (projectedSigner.UserId) {
        projectedSigner.UserId = pickFields(projectedSigner.UserId, ['objectId']);
      }
      if (projectedSigner.ExtUserPtr) {
        projectedSigner.ExtUserPtr = pickFields(projectedSigner.ExtUserPtr, ['objectId']);
      }
      return projectedSigner;
    });
  }

  if (Array.isArray(response.AuditTrail)) {
    response.AuditTrail = response.AuditTrail.map(entry => {
      const projectedEntry = pickFields(entry, ['Activity', 'UserPtr', 'ViewedOn', 'SignedOn']);
      if (projectedEntry.UserPtr) {
        projectedEntry.UserPtr = pickFields(projectedEntry.UserPtr, ['objectId']);
      }
      return projectedEntry;
    });
  }

  if (Array.isArray(response.Placeholders)) {
    response.Placeholders = removeAccessCodeSecrets(response.Placeholders);
  }

  for (const field of requestedIncludes) {
    if (Array.isArray(document?.[field])) {
      response[field] = document[field].map(item =>
        pickFields(item, ['objectId', 'Name', 'Email'])
      );
    }
  }

  return response;
}
