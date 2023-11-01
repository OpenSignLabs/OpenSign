import Parse from "parse";
export default function reportJson(id) {
  const currentUserId = Parse.User.current().id;
  // console.log("userId", currentUserId)

  switch (id) {
    // draft documents report
    case "ByHuevtCFY":
      return {
        reportName: "Draft Documents",
        className: "contracts_Document",
        params: {
          Type: null,
          $or: [
            { Signers: null, SignedUrl: null },
            { Signers: { $exists: true }, Placeholders: null }
          ],
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument"
          }
        ]
      };
    // Need your sign report
    case "4Hhwbp482K":
      return {
        reportName: "Need your sign",
        className: "contracts_Document",
        params: {
          Type: { $ne: "Folder" },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          ExpiryDate: {
            $gt: { __type: "Date", iso: new Date().toISOString() }
          },
          $and: [
            {
              "AuditTrail.UserPtr": {
                $ne: {
                  __type: "Pointer",
                  className: "contracts_Users",
                  objectId: "CkpaR0F6mj"
                }
              }
            },
            { "AuditTrail.Activity": { $ne: "Signed" } }
          ],
          Placeholders: { $ne: null },
          Signers: {
            $in: [
              {
                __type: "Pointer",
                className: "contracts_Users",
                objectId: "CkpaR0F6mj"
              }
            ]
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "sign",
            btnColor: "#3ac9d6",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/pdfRequestFiles"
          }
        ]
      };
    // In progess report
    case "1MwEuxLEkF":
      return {
        reportName: "In-progress documents",
        className: "contracts_Document",
        params: {
          Type: { $ne: "Folder" },
          Signers: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          },
          ExpiryDate: {
            $gt: { __type: "Date", iso: new Date().toISOString() }
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "View",
            btnColor: "#3ac9d6",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/pdfRequestFiles"
          }
        ]
      };
    // completed documents report
    case "kQUoW4hUXz":
      return {
        reportName: "Completed Documents",
        className: "contracts_Document",
        params: {
          Type: null,
          IsCompleted: true,
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          },
          $or: [{ IsDeclined: null }, { IsDeclined: false }]
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name",
          "TimeToCompleteDays"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument"
          }
        ]
      };
    // OpenSignDrive™ documents Drafts
    case "VRFDmUmw5B":
      return {
        reportName: "OpenSignDrive™ Drafts",
        className: "contracts_Document",
        params: {
          Type: "AIDoc",
          $or: [
            { Signers: null, SignedUrl: null },
            { Signers: { $exists: true }, Placeholders: null }
          ],
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "edit",
            btnColor: "#3ac9d6",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9MZWdhR2VuaWUtTWljcm9hcHBWMi9yZW1vdGVFbnRyeS5qcw==&moduleToLoad=AppRoutes&remoteName=legageniemicroapp/legagenie"
          }
        ]
      };
    //  declined documents report
    case "UPr2Fm5WY3":
      return {
        reportName: "Declined Documents",
        className: "contracts_Document",
        params: { Type: null, IsDeclined: true },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument"
          }
        ]
      };
    //  Expired Documents report
    case "zNqBHXHsYH":
      return {
        reportName: "Expired Documents",
        className: "contracts_Document",
        params: {
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          Type: { $ne: "Folder" },
          $and: [
            {
              $or: [
                { Signers: { $ne: null }, SignedUrl: { $ne: null } },
                { Placeholders: { $ne: null } }
              ]
            },
            {
              ExpiryDate: {
                $lt: { __type: "Date", iso: new Date().toISOString() }
              }
            }
          ],
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument"
          }
        ]
      };
    //  Recently sent for signatures report show on dashboard
    case "d9k3UfYHBc":
      return {
        reportName: "Recently sent for signatures",
        className: "contracts_Document",
        params: {
          Type: { $ne: "Folder" },
          Signers: { $ne: null },
          Placeholders: { $ne: null },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          },
          ExpiryDate: {
            $gt: { __type: "Date", iso: new Date().toISOString() }
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/pdfRequestFiles"
          }
        ]
      };
    //  Recent signature requests report show on dashboard
    case "5Go51Q7T8r":
      return {
        reportName: "Recent signature requests",
        className: "contracts_Document",
        params: {
          Type: { $ne: "Folder" },
          IsCompleted: { $ne: true },
          IsDeclined: { $ne: true },
          ExpiryDate: {
            $gt: { __type: "Date", iso: new Date().toISOString() }
          },
          $and: [
            {
              "AuditTrail.UserPtr": {
                $ne: {
                  __type: "Pointer",
                  className: "contracts_Users",
                  objectId: "CkpaR0F6mj"
                }
              }
            },
            { "AuditTrail.Activity": { $ne: "Signed" } }
          ],
          Placeholders: { $ne: null },
          Signers: {
            $in: [
              {
                __type: "Pointer",
                className: "contracts_Users",
                objectId: "CkpaR0F6mj"
              }
            ]
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "Sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/pdfRequestFiles"
          }
        ]
      };
    // Drafts report show on dashboard
    case "kC5mfynCi4":
      return {
        reportName: "Drafts",
        className: "contracts_Document",
        params: {
          Type: null,
          $or: [
            { Signers: null, SignedUrl: null },
            { Signers: { $exists: true }, Placeholders: null }
          ],
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: currentUserId
          }
        },
        keys: [
          "Name",
          "Note",
          "Folder.Name",
          "URL",
          "ExtUserPtr.Name",
          "Signers.Name"
        ],
        orderBy: "-updatedAt",
        actions: [
          {
            btnLabel: "sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl:
              "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument"
          }
        ]
      };
    default:
      return null;
  }
}
