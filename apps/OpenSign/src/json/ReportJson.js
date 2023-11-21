export default function reportJson(id) {
  // console.log("json ", json);

  switch (id) {
    // draft documents report
    case "ByHuevtCFY":
      return {
        reportName: "Draft Documents",
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
    //  declined documents report
    case "UPr2Fm5WY3":
      return {
        reportName: "Declined Documents",
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
