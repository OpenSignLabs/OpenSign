import { documentCls, templateCls } from "../constant/const";
export const formJson = {
  //json form for signYourself
  sHAnZphf69: {
    title: "Sign Yourself",
    redirectRoute: "signaturePdf",
    msgVar: "Document",
    Cls: documentCls
  },

  //json form for request signatures
  "8mZzFxbG1z": {
    title: "Request Signatures",
    msgVar: "Document",
    redirectRoute: "placeHolderSign",
    Cls: documentCls,
    signers: true,
    bcc: true
  },
  //json form for template
  template: {
    title: "New Template",
    redirectRoute: "template",
    msgVar: "Template",
    Cls: templateCls,
    bcc: true
  }
};
