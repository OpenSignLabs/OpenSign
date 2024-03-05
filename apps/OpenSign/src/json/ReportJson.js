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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        form: "ContactBook"
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
        ]
      };
    default:
      return null;
  }
}
