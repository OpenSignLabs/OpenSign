export default function reportJson(id, userId) {
  const currentUserId = userId;

  switch (id) {
    // draft documents report
    case 'ByHuevtCFY':
      return {
        reportName: 'Draft Documents',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          SignedUrl: { $exists: false },
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'IsSignyourself',
          'TemplateId',
        ],
      };
    // Need your sign report
    case '4Hhwbp482K':
      return {
        reportName: 'Need your sign',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          SignedUrl: { $ne: null },
          ExpiryDate: { $gt: { __type: 'Date', iso: new Date().toISOString() } },
          Placeholders: { $ne: null },
          Signers: {
            $inQuery: {
              where: { UserId: { __type: 'Pointer', className: '_User', objectId: currentUserId } },
              className: 'contracts_Contactbook',
            },
          },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Signers.UserId',
          'AuditTrail',
          'Placeholders',
          'SignedUrl',
          'TemplateId',
          'ExpiryDate',
        ],
      };
    // In progess report
    case '1MwEuxLEkF':
      return {
        reportName: 'In-progress documents',
        params: {
          Type: { $ne: 'Folder' },
          SignedUrl: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
          ExpiryDate: { $gt: { __type: 'Date', iso: new Date().toISOString() } },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'AuditTrail',
          'AuditTrail.UserPtr',
          'ExpiryDate',
          'SendMail',
          'Placeholders',
          'SignedUrl',
          'TemplateId',
          'RequestBody',
          'RequestSubject',
          'ExtUserPtr.TenantId.RequestBody',
          'ExtUserPtr.TenantId.RequestSubject',
        ],
      };
    // completed documents report
    case 'kQUoW4hUXz':
      return {
        reportName: 'Completed Documents',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: true,
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          // CreatedBy: {
          //   __type: 'Pointer',
          //   className: '_User',
          //   objectId: currentUserId,
          // },
          $or: [
            // Condition 1: If `CreatedBy` exists, no need for `Signers` filter
            { CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId } },
            // Condition 2: If `CreatedBy` does not exist, apply the `Signers` filter
            {
              Signers: {
                $inQuery: {
                  where: {
                    UserId: { __type: 'Pointer', className: '_User', objectId: currentUserId },
                  },
                  className: 'contracts_Contactbook',
                },
              },
            },
          ],
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'SignedUrl',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'TimeToCompleteDays',
          'Placeholders',
          'IsSignyourself',
          'IsCompleted',
          'TemplateId',
        ],
      };
    //  declined documents report
    case 'UPr2Fm5WY3':
      return {
        reportName: 'Declined Documents',
        params: {
          Type: null,
          IsArchive: { $ne: true },
          IsDeclined: true,
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'DeclineReason',
          'SignedUrl',
          'TemplateId',
        ],
      };
    //  Expired Documents report
    case 'zNqBHXHsYH':
      return {
        reportName: 'Expired Documents',
        params: {
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          Type: { $ne: 'Folder' },
          SignedUrl: { $ne: null },
          ExpiryDate: { $lt: { __type: 'Date', iso: new Date().toISOString() } },
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'SignedUrl',
          'TemplateId',
          'ExpiryDate',
        ],
      };
    //  Recently sent for signatures report show on dashboard
    case 'd9k3UfYHBc':
      return {
        reportName: 'Recently sent for signatures',
        params: {
          Type: { $ne: 'Folder' },
          SignedUrl: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
          ExpiryDate: { $gt: { __type: 'Date', iso: new Date().toISOString() } },
        },
        keys: [
          'Name',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'AuditTrail',
          'AuditTrail.UserPtr',
          'ExpiryDate',
          'Placeholders',
          'SignedUrl',
          'TemplateId',
          'RequestBody',
          'RequestSubject',
          'ExtUserPtr.TenantId.RequestBody',
          'ExtUserPtr.TenantId.RequestSubject',
        ],
      };
    //  Recent signature requests report show on dashboard
    case '5Go51Q7T8r':
      return {
        reportName: 'Recent signature requests',
        params: {
          Type: { $ne: 'Folder' },
          SignedUrl: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          ExpiryDate: { $gt: { __type: 'Date', iso: new Date().toISOString() } },
          Placeholders: { $ne: null },
          Signers: {
            $inQuery: {
              where: { UserId: { __type: 'Pointer', className: '_User', objectId: currentUserId } },
              className: 'contracts_Contactbook',
            },
          },
        },
        keys: [
          'Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'Signers.Name',
          'Signers.UserId',
          'AuditTrail',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'SignedUrl',
          'TemplateId',
          'ExpiryDate',
        ],
      };
    // Drafts report show on dashboard
    case 'kC5mfynCi4':
      return {
        reportName: 'Drafts',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
          SignedUrl: { $exists: false },
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'TemplateId',
        ],
      };
    // contact book report
    case 'contacts':
      return {
        reportName: 'Contactbook',
        reportClass: 'contracts_Contactbook',
        params: {
          CreatedBy: { __type: 'Pointer', className: '_User', objectId: currentUserId },
          IsDeleted: { $ne: true },
        },
        keys: ['Name', 'Email', 'Phone'],
      };
    // Templates report
    case '6TeaPr321t':
      return {
        reportName: 'Templates',
        reportClass: 'contracts_Template',
        params: { Type: { $ne: 'Folder' }, IsArchive: { $ne: true } },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'IsPublic',
          'SharedWith.Name',
          'SendinOrder',
          'SignatureType',
          'NotifyOnSignatures',
        ],
      };
    default:
      return null;
  }
}
