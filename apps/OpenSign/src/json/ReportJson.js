export const extraCols = [
  "Note",
  "Time to complete (Days)",
  "Enable Tour",
  "Notify on signatures",
  "Redirect url",
  "Created Date",
  "Updated Date"
];

export default function reportJson(id) {
  const head = ["Title", "Note", "Folder", "File", "Owner", "Signers"];
  const declineHead = ["Title", "Reason", "Folder", "File", "Owner", "Signers"];
  const iphead = ["Title", "Note", "Folder", "File", "Signers", "Sent Date"];
  const contactbook = ["Name", "Email", "Phone", "Company", "JobTitle"];
  const dashboardReportHead = ["Title", "File", "Owner", "Signers"];
  const templateReport = ["Title", "File", "Owner", "Signers"];
  switch (id) {
    // draft documents report
    case "ByHuevtCFY":
      return {
        reportName: "Draft Documents",
        heading: head,
        actions: [
          {
            btnId: "1231",
            hoverLabel: "Edit",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-pen",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "2142",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            redirectUrl: "",
            action: "delete"
          }
        ],
        helpMsg:
          "These are documents you have started but have not finalized for sending."
      };
    // Need your sign report
    case "4Hhwbp482K":
      return {
        reportName: "Need your sign",
        heading: head,
        actions: [
          {
            btnId: "4536",
            btnLabel: "sign",
            hoverLabel: "Sign",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-signature",
            redirectUrl: "draftDocument",
            action: "redirect"
          }
        ],
        helpMsg:
          "This is a list of documents that are waiting for your signature"
      };
    // In progess report
    case "1MwEuxLEkF":
      return {
        reportName: "In-progress documents",
        heading: iphead,
        actions: [
          {
            btnId: "8901",
            hoverLabel: "Share",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-copy",
            redirectUrl: "",
            action: "share"
          },
          {
            btnId: "1588",
            hoverLabel: "View",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-eye",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "2234",
            hoverLabel: "option",
            btnColor: "",
            textColor: "black",
            btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
            action: "option",
            subaction: [
              {
                btnId: "1630",
                btnLabel: "Resend",
                hoverLabel: "Resend",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "resend"
              },
              {
                btnId: "1633",
                btnLabel: "Rename",
                hoverLabel: "Rename",
                btnIcon: "fa-light fa-pen-to-square",
                redirectUrl: "",
                action: "rename"
              },
              {
                btnId: "1688",
                btnLabel: "Revoke",
                hoverLabel: "Revoke",
                btnIcon: "fa-light fa-file-circle-xmark",
                redirectUrl: "",
                action: "revoke"
              },
              {
                btnId: "0630",
                btnLabel: "Save as template",
                hoverLabel: "Save as template",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "saveastemplate"
              },
              {
                btnId: "1488",
                btnLabel: "Delete",
                hoverLabel: "Delete",
                btnIcon: "fa-light fa-trash",
                redirectUrl: "",
                action: "delete"
              }
            ]
          }
        ],
        helpMsg:
          "This is a list of documents you've sent to other parties for signature."
      };
    // completed documents report
    case "kQUoW4hUXz":
      return {
        reportName: "Completed Documents",
        heading: head,
        actions: [
          {
            btnId: "1378",
            hoverLabel: "Edit",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-eye",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "1278",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            restrictBtn: true,
            redirectUrl: "",
            action: "delete"
          },
          {
            btnId: "33534",
            hoverLabel: "option",
            btnColor: "",
            restrictBtn: true,
            textColor: "black",
            btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
            action: "option",
            subaction: [
              {
                btnId: "0930",
                btnLabel: "Save as template",
                hoverLabel: "Save as template",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "saveastemplate"
              },
              {
                btnId: "8440",
                btnLabel: "Fix & resend",
                hoverLabel: "Fix & resend",
                btnIcon: "fa-light fa-paper-plane",
                redirectUrl: "",
                action: "recreatedocument"
              }
            ]
          }
        ],
        helpMsg:
          "This is a list of documents that have been signed by all parties."
      };
    //  declined documents report
    case "UPr2Fm5WY3":
      return {
        reportName: "Declined Documents",
        heading: declineHead,
        actions: [
          {
            btnId: "1458",
            hoverLabel: "View",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-eye",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "1358",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            redirectUrl: "",
            action: "delete"
          },
          {
            btnId: "44534",
            hoverLabel: "option",
            btnColor: "",
            textColor: "black",
            btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
            action: "option",
            subaction: [
              {
                btnId: "0940",
                btnLabel: "Save as template",
                hoverLabel: "Save as template",
                restrictBtn: true,
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "saveastemplate"
              },
              {
                btnId: "8440",
                btnLabel: "Fix & resend",
                hoverLabel: "Fix & resend",
                btnIcon: "fa-light fa-paper-plane",
                redirectUrl: "",
                action: "recreatedocument"
              }
            ]
          }
        ],
        helpMsg:
          "This is a list of documents that have been declined by one of the signers."
      };
    //  Expired Documents report
    case "zNqBHXHsYH":
      return {
        reportName: "Expired Documents",
        heading: head,
        actions: [
          {
            btnId: "1898",
            hoverLabel: "View",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-eye",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "1998",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            redirectUrl: "",
            action: "delete"
          },
          {
            btnId: "3234",
            hoverLabel: "option",
            btnColor: "",
            textColor: "black",
            btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
            action: "option",
            subaction: [
              {
                btnId: "2199",
                btnLabel: "extend-expiry-date",
                hoverLabel: "Extend expiry date",
                btnColor: "op-btn-primary",
                btnIcon: "fa-light fa-hourglass-end",
                redirectUrl: "",
                action: "extendexpiry"
              },
              {
                btnId: "5530",
                btnLabel: "Save as template",
                hoverLabel: "Save as template",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "saveastemplate"
              }
            ]
          }
        ],
        helpMsg:
          "This is a list of documents that have reached their expiration date."
      };
    //  Recently sent for signatures report show on dashboard
    case "d9k3UfYHBc":
      return {
        reportName: "Recently sent for signatures",
        heading: dashboardReportHead,
        actions: [
          {
            btnId: "1999",
            hoverLabel: "Share",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-copy",
            redirectUrl: "",
            action: "share"
          },
          {
            btnId: "1999",
            hoverLabel: "View",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-eye",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "2234",
            hoverLabel: "option",
            btnColor: "",
            textColor: "black",
            btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
            action: "option",
            subaction: [
              {
                btnId: "1631",
                btnLabel: "Resend",
                hoverLabel: "Resend",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "resend"
              },
              {
                btnId: "1633",
                btnLabel: "Rename",
                hoverLabel: "Rename",
                btnIcon: "fa-light fa-pen-to-square",
                redirectUrl: "",
                action: "rename"
              },
              {
                btnId: "6788",
                btnLabel: "Revoke",
                hoverLabel: "Revoke",
                btnIcon: "fa-light fa-file-circle-xmark",
                redirectUrl: "",
                action: "revoke"
              },
              {
                btnId: "7730",
                btnLabel: "Save as template",
                hoverLabel: "Save as template",
                btnIcon: "fa-light fa-envelope",
                redirectUrl: "",
                action: "saveastemplate"
              },
              {
                btnId: "2000",
                btnLabel: "Delete",
                hoverLabel: "Delete",
                btnIcon: "fa-light fa-trash",
                redirectUrl: "",
                action: "delete"
              }
            ]
          }
        ]
      };
    //  Recent signature requests report show on dashboard
    case "5Go51Q7T8r":
      return {
        reportName: "Recent signature requests",
        heading: dashboardReportHead,
        actions: [
          {
            btnId: "2001",
            btnLabel: "sign",
            hoverLabel: "Sign",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-signature",
            redirectUrl: "draftDocument",
            action: "redirect"
          }
        ]
      };
    // Drafts report show on dashboard
    case "kC5mfynCi4":
      return {
        reportName: "Drafts",
        heading: ["Title", "Note", "Folder", "File", "Owner", "Signers"],
        actions: [
          {
            btnId: "2003",
            hoverLabel: "Edit",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-pen",
            redirectUrl: "draftDocument",
            action: "redirect"
          },
          {
            btnId: "2004",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            redirectUrl: "",
            action: "delete"
          }
        ]
      };
    // contactbook report
    case "contacts":
      return {
        reportName: "Contactbook",
        heading: contactbook,
        actions: [
          {
            btnId: "2674",
            hoverLabel: "Edit",
            btnColor: "op-btn-primary",
            btnIcon: "fa-light fa-pen",
            action: "edit"
          },
          {
            btnId: "2204",
            hoverLabel: "Delete",
            btnColor: "op-btn-secondary",
            btnIcon: "fa-light fa-trash",
            action: "delete"
          }
        ],
        helpMsg:
          "This is a list of contacts/signers added by you. These will appear as suggestions when you try to add signers to a new document."
      };
    // template report
    case "6TeaPr321t": {
      const templateAct = [
        {
          btnId: "2234",
          btnLabel: "Use",
          hoverLabel: "Use",
          btnColor: "op-btn-primary",
          btnIcon: "fa-light fa-plus",
          redirectUrl: "placeHolderSign",
          action: "redirect",
          selector: "reactourSecond"
        },
        {
          btnId: "1631",
          btnLabel: "Quick send",
          hoverLabel: "Quick send",
          btnColor: "op-btn-secondary",
          btnIcon: "fa-light fa-envelope",
          redirectUrl: "",
          action: "bulksend",
          selector: "tourbulksend"
        },
        {
          btnId: "2234",
          hoverLabel: "option",
          btnColor: "",
          textColor: "black",
          btnIcon: "fa-light fa-ellipsis-vertical fa-lg",
          action: "option",
          selector: "reactourThird",
          subaction: [
            {
              btnId: "2434",
              btnLabel: "Edit",
              hoverLabel: "Edit",
              btnIcon: "fa-light fa-pen",
              redirectUrl: "template",
              action: "redirect"
            },
            {
              btnId: "1633",
              btnLabel: "Rename",
              hoverLabel: "Rename",
              btnIcon: "fa-light fa-pen-to-square",
              redirectUrl: "",
              action: "rename"
            },
            {
              btnId: "1834",
              btnLabel: "Delete",
              hoverLabel: "Delete",
              btnIcon: "fa-light fa-trash",
              redirectUrl: "",
              action: "delete"
            }
          ]
        }
      ];
      const Extand_Class = localStorage.getItem("Extand_Class");
      const extClass = Extand_Class && JSON.parse(Extand_Class);
      // console.log("extClass ", extClass);
      let templateActions = templateAct;
      if (extClass && extClass.length > 0) {
        if (extClass?.[0]?.UserRole !== "contracts_User") {
          templateActions = templateAct.map((item) => {
            if (item.action === "option") {
              // Make a shallow copy of the item
              const newItem = { ...item };
              //splice method used to add `Share with team` option on second index of list
              newItem.subaction.splice(1, 0, {
                btnId: "1873",
                btnLabel: "Share with team",
                hoverLabel: "Share with team",
                btnIcon: "fa-light fa-user-group",
                redirectUrl: "",
                action: "sharewithteam"
              });
              return newItem;
            }
            return item;
          });
        }
      }

      return {
        reportName: "Templates",
        heading: templateReport,
        actions: templateActions,
        helpMsg:
          "This is a list of templates that are available to you for creating documents. You can click the 'use' button to create a new document using a template, modify the document & add signers in the next step."
      };
    }
    default:
      return null;
  }
}
