export default function reportJson(id) {
  // console.log("json ", json);
  const head = ["Sr.No", "Title", "Note", "Folder", "File", "Owner", "Signers"];
  const contactbook = ["Sr.No", "Title", "Email", "Phone"];
  const dashboardReportHead = ["Title", "File", "Owner", "Signers"];

  switch (id) {
    // draft documents report
    case "ByHuevtCFY":
      return {
        reportName: "Draft Documents",
        heading: head,
        actions: [
          {
            btnLabel: "sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl: "draftDocument"
          }
        ],
        helpMsg: "These are documents you have started but have not finalized for sending."
      };
    // Need your sign report
    case "4Hhwbp482K":
      return {
        reportName: "Need your sign",
        heading: head,
        actions: [
          {
            btnLabel: "sign",
            btnColor: "#3ac9d6",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "pdfRequestFiles"
          }
        ],
        helpMsg:
          "This is a list of documents that are waiting for your signature"
      };
    // In progess report
    case "1MwEuxLEkF":
      return {
        reportName: "In-progress documents",
        heading: head,
        actions: [
          {
            btnLabel: "View",
            btnColor: "#3ac9d6",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "pdfRequestFiles"
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
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "draftDocument"
          }
        ],
        helpMsg: "This is a list of documents that have been signed by all parties."
      };
    //  declined documents report
    case "UPr2Fm5WY3":
      return {
        reportName: "Declined Documents",
        heading: head,
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "draftDocument"
          }
        ],
        helpMsg: "This is a list of documents that have been declined by one of the signers."
      };
    //  Expired Documents report
    case "zNqBHXHsYH":
      return {
        reportName: "Expired Documents",
        heading: head,
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "draftDocument"
          }
        ],
        helpMsg: "This is a list of documents that have reached their expiration date."
      };
    //  Recently sent for signatures report show on dashboard
    case "d9k3UfYHBc":
      return {
        reportName: "Recently sent for signatures",
        heading: dashboardReportHead,
        actions: [
          {
            btnLabel: "View",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "pdfRequestFiles"
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
            btnLabel: "Sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-eye",
            redirectUrl: "pdfRequestFiles"
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
            btnLabel: "sign",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl: "draftDocument"
          }
        ]
      };
    // contactbook report
    case "5KhaPr482K":
      return {
        reportName: "Contactbook",
        heading: contactbook,
        actions: [
          {
            btnLabel: "",
            btnColor: "#f55a42",
            textColor: "white",
            btnIcon: "fa-solid fa-trash"
          }
        ],
        form: "ContactBook",
        helpMsg: "This is a list of contacts/signers added by you. These will appear as suggestions when you try to add signers to a new document."
      };
    // template report
    case "6TeaPr321t":
      return {
        reportName: "Templates",
        heading: head,
        actions: [
          {
            btnLabel: "Use",
            btnColor: "#4bd396",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl: "placeHolderSign"
          },
          {
            btnLabel: "Edit",
            btnColor: "#00c9d5",
            textColor: "white",
            btnIcon: "fa fa-plus",
            redirectUrl: "template"
          }
        ],
        helpMsg:
          "This is a list of templates that are available to you for creating documents. You can click the 'use' button to create a new document using a template, modify the document & add signers in the next step."
      };
    default:
      return null;
  }
}
