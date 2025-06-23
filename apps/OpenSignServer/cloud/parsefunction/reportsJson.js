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
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
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
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
          Placeholders: { $ne: null },
          Signers: {
            $inQuery: {
              where: {
                UserId: {
                  __type: 'Pointer',
                  className: '_User',
                  objectId: currentUserId,
                },
              },
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
          'ExtUserPtr.active_mail_adapter',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Signers.UserId',
          'AuditTrail',
          'Placeholders',
          'SignedUrl',
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
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'ExtUserPtr.active_mail_adapter',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'AuditTrail',
          'AuditTrail.UserPtr',
          'ExpiryDate',
          'SendMail',
          'Placeholders',
          'SignedUrl',
        ],
      };
    // completed documents report
    case 'kQUoW4hUXz':
      return {
        reportName: 'Completed Documents',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: true,
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          IsDeclined: { $ne: true },
          IsArchive: { $ne: true },
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
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
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
          ExpiryDate: {
            $lt: { __type: 'Date', iso: new Date().toISOString() },
          },
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
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
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
        },
        keys: [
          'Name',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'ExtUserPtr.active_mail_adapter',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'AuditTrail',
          'AuditTrail.UserPtr',
          'ExpiryDate',
          'Placeholders',
          'SignedUrl',
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
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
          Placeholders: { $ne: null },
          Signers: {
            $inQuery: {
              where: {
                UserId: {
                  __type: 'Pointer',
                  className: '_User',
                  objectId: currentUserId,
                },
              },
              className: 'contracts_Contactbook',
            },
          },
        },
        keys: [
          'Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.Email',
          'ExtUserPtr.active_mail_adapter',
          'Signers.Name',
          'Signers.UserId',
          'AuditTrail',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'SignedUrl',
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
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
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
        ],
      };
    // contact book report
    case '5KhaPr482K':
      return {
        reportName: 'Contactbook',
        reportClass: 'contracts_Contactbook',
        params: {
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          IsDeleted: { $ne: true },
        },
        keys: ['Name', 'Email', 'Phone'],
      };
    // Templates report
    case '6TeaPr321t':
      return {
        reportName: 'Templates',
        reportClass: 'contracts_Template',
        params: {
          Type: { $ne: 'Folder' },
          IsArchive: { $ne: true },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'ExtUserPtr.active_mail_adapter',
          'Signers.Name',
          'Signers.Email',
          'Signers.Phone',
          'Placeholders',
          'IsPublic',
          'SharedWith.Name',
          'SendinOrder',
        ],
      };
    default:
      return null;
  }
}
