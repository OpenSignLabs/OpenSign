export default function reportJson(id, userId) {
  const currentUserId = userId;

  switch (id) {
    // draft documents report
    case 'ByHuevtCFY':
      return {
        reportName: 'Draft Documents',
        params: {
          Type: null,
          $or: [
            { Signers: null, SignedUrl: null },
            { Signers: { $exists: true }, Placeholders: null },
          ],
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
        },
        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    // Need your sign report
    case '4Hhwbp482K':
      return {
        reportName: 'Need your sign',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
          Placeholders: { $ne: null },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.UserId',
          'AuditTrail',
        ],
      };
    // In progess report
    case '1MwEuxLEkF':
      return {
        reportName: 'In-progress documents',
        params: {
          Type: { $ne: 'Folder' },
          Signers: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
        },
        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    // completed documents report
    case 'kQUoW4hUXz':
      return {
        reportName: 'Completed Documents',
        params: {
          Type: null,
          IsCompleted: true,
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          IsDeclined: { $ne: true },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'TimeToCompleteDays',
        ],
      };

    //  declined documents report
    case 'UPr2Fm5WY3':
      return {
        reportName: 'Declined Documents',
        params: {
          Type: null,
          IsDeclined: true,
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
        },

        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    //  Expired Documents report
    case 'zNqBHXHsYH':
      return {
        reportName: 'Expired Documents',
        params: {
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          Type: { $ne: 'Folder' },
          $and: [
            {
              $or: [
                { Signers: { $ne: null }, SignedUrl: { $ne: null } },
                { Placeholders: { $ne: null } },
              ],
            },
            {
              ExpiryDate: {
                $lt: { __type: 'Date', iso: new Date().toISOString() },
              },
            },
          ],
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
        },
        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    //  Recently sent for signatures report show on dashboard
    case 'd9k3UfYHBc':
      return {
        reportName: 'Recently sent for signatures',
        params: {
          Type: { $ne: 'Folder' },
          Signers: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
        },
        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    //  Recent signature requests report show on dashboard
    case '5Go51Q7T8r':
      return {
        reportName: 'Recent signature requests',
        params: {
          Type: { $ne: 'Folder' },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          ExpiryDate: {
            $gt: { __type: 'Date', iso: new Date().toISOString() },
          },
          Placeholders: { $ne: null },
        },
        keys: [
          'Name',
          'Note',
          'Folder.Name',
          'URL',
          'ExtUserPtr.Name',
          'Signers.Name',
          'Signers.UserId',
          'AuditTrail',
        ],
      };
    // Drafts report show on dashboard
    case 'kC5mfynCi4':
      return {
        reportName: 'Drafts',
        params: {
          Type: null,
          $or: [
            { Signers: null, SignedUrl: null },
            { Signers: { $exists: true }, Placeholders: null },
          ],
          CreatedBy: {
            __type: 'Pointer',
            className: '_User',
            objectId: currentUserId,
          },
        },
        keys: ['Name', 'Note', 'Folder.Name', 'URL', 'ExtUserPtr.Name', 'Signers.Name'],
      };
    // contact book report
    case '5KhaPr482K':
      return {
        reportName: 'Contactbook',
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
    default:
      return null;
  }
}
