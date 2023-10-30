export const formJson = (id) => {
  let formData;
  //json form for signYourself
  if (id === "sHAnZphf69") {
    formData = {
      jsonSchema: {
        title: "Sign Yourself",
        description: "",
        type: "object",
        required: ["URL", "Name"],
        properties: {
          URL: {
            type: "string",
            title: "Select Document",
            filetypes: [],
            maxfilesizeKB: "5000",
            uploadtype: "regular",
            helpbody: "",
            helplink: ""
          },
          Name: {
            type: "string",
            title: "Title",
            maxLength: 50
          },
          Description: {
            type: "string",
            title: "Description",
            maxLength: 500
          },
          Folder: {
            title: "Folder",
            parent: null,
            data: {
              ClassName: "contracts_Document",
              FolderNameField: "Name",
              FolderTypeField: "Type",
              FolderTypeValue: "Folder",
              FolderDescription: "Description",
              ParentFolderField: "Folder",
              FormId: "YjIB7W7Xs6",
              Query: 'where={"Folder":{"$exists":false},"Type":"Folder"}'
            }
          },
          ExtUserPtr: {
            data: {
              valueKey: "objectId",
              isPointer: true
            }
          }
        }
      },
      uiSchema: {
        URL: {
          "ui:field": "FileUpload"
        },
        Description: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 2
          }
        },
        Note: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 2
          }
        },
        Folder: {
          "ui:field": "FolderComponent"
        },
        ExtUserPtr: {
          "ui:field": "HiddenField"
        }
      },
      userSchema: {},
      rules: null,
      noValidate: false,
      liveValidate: false,
      isRegisterForm: false,
      help: { htmlbody: "" },
      description: "",
      class: "contracts_Document",
      buttons: {
        add: {
          resetText: "Reset",
          submitText: "Submit"
        },
        edit: { submitText: "Update", cancelText: "Cancel" }
      },
      formACL: {
        "#currentUser#": { read: true, write: true },
        "*": { read: true, write: true }
      },
      redirect_id:
        "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/signaturePdf",
      success_message: "Success!",
      success_redirect: "Microapp",
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };

    return formData;
  }
  //json form for request signature
  else if (id === "8mZzFxbG1z") {
    formData = {
      jsonSchema: {
        title: "New Document",
        description: "",
        type: "object",
        required: ["URL", "Name", "Note", "TimeToCompleteDays", "Signers"],
        properties: {
          URL: {
            type: "string",
            title: "Select Document",
            filetypes: [],
            maxfilesizeKB: "5000",
            uploadtype: "regular",
            helpbody: "",
            helplink: ""
          },
          Name: {
            type: "string",
            title: "Title",
            maxLength: 100
          },
          Description: {
            type: "string",
            title: "Description",
            maxLength: 500
          },
          Signers: {
            type: "array",
            title: "Signers",
            isSortable: false,
            selectAll: false,
            selectedData: null,
            data: {
              class: "contracts_Contactbook",
              displayKey: "Name",
              valueKey: "objectId",
              query: "keys=Name",
              isPointer: true,
              helpbody: "",
              helplink: "",
              quickAddFormId: "qUGywSWd8e"
            }
          },
          Note: {
            type: "string",
            title: "Note",
            default: "Please review and sign this document",
            maxLength: 500
          },
          Folder: {
            title: "Folder",
            data: {
              ClassName: "contracts_Document",
              FolderNameField: "Name",
              FolderTypeField: "Type",
              FolderTypeValue: "Folder",
              FolderDescription: "Description",
              ParentFolderField: "Folder",
              FormId: "YjIB7W7Xs6",
              Query: 'where={"Folder":{"$exists":false},"Type":"Folder"}'
            }
          },
          TimeToCompleteDays: {
            type: "number",
            title: "Time To Complete (Days)",
            default: 15,
            maxLength: 5000
          },
          ExtUserPtr: {
            data: {
              valueKey: "objectId",
              isPointer: true
            }
          }
        }
      },
      uiSchema: {
        URL: {
          "ui:field": "FileUpload"
        },
        Description: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 2
          }
        },
        Note: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 2
          }
        },
        Signers: {
          "ui:field": "MultiSelectField"
        },
        Folder: {
          "ui:field": "FolderComponent"
        },
        TimeToCompleteDays: {
          "ui:placeholder": "No. of days",
          "ui:widget": "updown"
        },
        ExtUserPtr: {
          "ui:field": "HiddenField"
        }
      },
      userSchema: {},
      rules: null,
      noValidate: false,
      liveValidate: false,
      isRegisterForm: false,
      help: { htmlbody: "" },
      description: "",
      class: "contracts_Document",
      buttons: {
        add: {
          resetText: "Reset",
          submitText: "Submit"
        },
        edit: { submitText: "Update", cancelText: "Cancel" }
      },
      formACL: {
        "#currentUser#": { read: true, write: true },
        "*": { read: true, write: true }
      },
      redirect_id:
        "remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/placeHolderSign",
      success_message: "Success!",
      success_redirect: "Microapp",
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };

    return formData;
  }
  //json form for create new folder
  else if (id === "YjIB7W7Xs6") {
    formData = {
      jsonSchema: {
        title: "New Folder",
        description: "",
        type: "object",
        required: ["Name"],
        properties: {
          Name: {
            type: "string",
            title: "Name",
            maxLength: 50
          },
          Type: {
            type: "string",
            data: {
              valueKey: "Type",
              isPointer: false
            },
            default: "Folder"
          },
          Folder: {
            title: "Parent Folder",
            data: {
              class: "contracts_Document",
              displayKey: "Name",
              valueKey: "objectId",
              query: 'where={"Type":"Folder"}&keys=Name',
              isPointer: true,
              savePointerClass: "",
              helpbody: "",
              helplink: ""
            }
          }
        }
      },
      uiSchema: {
        Type: {
          "ui:field": "HiddenField"
        },
        Folder: {
          "ui:field": "Level1Dropdown"
        }
      },
      userSchema: {},
      rules: null,
      noValidate: false,
      liveValidate: false,
      isRegisterForm: false,
      help: { htmlbody: "" },
      description: "",
      class: "contracts_Document",
      buttons: {
        add: {
          resetText: "Reset",
          submitText: "Submit"
        },
        edit: { submitText: "Update", cancelText: "Cancel" }
      },
      formACL: {
        "#currentUser#": { read: true, write: true },
        "*": { read: true, write: true }
      },
      redirect_id: "",
      success_message: "Success!",
      success_redirect: "",
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };
    return formData;
  }
  //json form for add signers
  else if (id === "fICciRuUcB") {
    formData = {
      jsonSchema: {
        title: "Add Signer",
        description: "",
        type: "object",
        required: ["Name", "Email", "Phone", "Company"],
        properties: {
          Name: {
            type: "string",
            title: "Name",
            maxLength: 50
          },
          Email: {
            type: "string",
            title: "Email",
            maxLength: 50
          },
          Phone: {
            type: "string",
            title: "Phone",
            maxLength: 50
          },
          Company: {
            type: "string",
            title: "Company",
            maxLength: 50
          },
          JobTitle: {
            type: "string",
            title: "JobTitle",
            maxLength: 50
          },
          IsContactEntry: {
            type: "boolean",
            data: {
              valueKey: "IsContactEntry",
              isPointer: false
            },
            default: true
          }
        }
      },
      uiSchema: {
        Email: {
          "ui:widget": "email"
        },
        IsContactEntry: {
          "ui:field": "HiddenField"
        }
      },
      userSchema: {
        email: "$Email",
        name: "$Name",
        password: "$Phone",
        phone: "$Phone",
        role: "contracts_User",
        username: "$Email"
      },
      rules: null,
      noValidate: false,
      liveValidate: false,
      isRegisterForm: true,
      help: {},
      description: "",
      class: "contracts_Users",
      buttons: {
        add: {
          resetText: "Reset",
          submitText: "Submit"
        },
        edit: { submitText: "Update", cancelText: "Cancel" }
      },
      formACL: {
        "#currentUser#": { read: true, write: true },
        "*": { read: true, write: true }
      },
      redirect_id: "",
      success_message: "Success!",
      success_redirect: "",
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };
    return formData;
  }
  //json form for add users
  else if (id === "lM0xRnM3iE") {
    formData = {
      jsonSchema: {
        title: "Add User",
        description: "",
        type: "object",
        required: ["Name", "Email", "Phone", "JobTitle"],
        properties: {
          Name: {
            type: "string",
            title: "Name",
            maxLength: 50
          },
          Email: {
            type: "string",
            title: "Email",
            maxLength: 50
          },
          Phone: {
            type: "string",
            title: "Phone",
            maxLength: 50
          },
          JobTitle: {
            type: "string",
            title: "Job Title",
            maxLength: 50
          },
          Company: {
            type: "string",
            title: "Company",
            maxLength: 50
          }
        }
      },
      uiSchema: {
        Email: {
          "ui:widget": "email"
        },
        Phone: {
          "ui:options": {
            inputType: "tel"
          }
        }
      },
      userSchema: {
        email: "$Email",
        name: "$Name",
        password: "$Phone",
        phone: "$Phone",
        role: "contracts_User",
        username: "$Email"
      },
      rules: null,
      noValidate: false,
      liveValidate: false,
      isRegisterForm: true,
      help: {},
      description: "",
      class: "contracts_Users",
      buttons: {
        add: {
          resetText: "Reset",
          submitText: "Submit"
        },
        edit: { submitText: "Update", cancelText: "Cancel" }
      },
      formACL: {
        "#currentUser#": { read: true, write: true },
        "*": { read: true, write: true }
      },
      redirect_id: "",
      success_message: "Success!",
      success_redirect: "",
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };
    return formData;
  } else if (id === "qUGywSWd8e") {
    formData = {
      jsonSchema: {
        title: "Add Contact",
        description: "",
        type: "object",
        required: ["Name", "Email", "Phone"],
        properties: {
          Name: {
            type: "string",
            title: "Name",
            maxLength: 50
          },
          Email: {
            type: "string",
            title: "Email",
            maxLength: 50
          },
          Phone: {
            type: "string",
            title: "Phone",
            maxLength: 50
          }
        }
      },
      uiSchema: {
        Email: {
          "ui:widget": "email"
        },
        Phone: {
          "ui:options": {
            inputType: "tel"
          }
        }
      },
      userSchema: {
        name: "$Name",
        username: "$Email",
        email: "$Email",
        password: "$Phone",
        phone: "$Phone",
        role: "contracts_Guest"
      },
      restrict_form_entry: {
        enable_captcha: false,
        allow_one_entry_per_ip_address: false,
        allow_one_entry_per_user: false,
        enable_geo_fence: false
      },
      restrict_form_access: {
        entryCount: ""
      },
      help: {},
      email_template: {
        from: "",
        to: "",
        subject: "",
        message: ""
      },
      buttons: {
        add: {
          submitText: "Submit",
          resetText: "Reset"
        },
        edit: {
          submitText: "Update",
          cancelText: "Cancel"
        }
      },
      appId: {
        __type: "Pointer",
        className: "w_appinfo",
        objectId: "aIPmIvMzGM"
      },
      formACL: {
        "*": {
          read: true,
          write: true
        },
        "#currentUser#": {
          read: true,
          write: true
        }
      },
      class: "contracts_Contactbook",
      description: "",
      success_message: "Success!",
      form_permission: "private",
      success_redirect: "",
      redirect_id: "",
      isRegisterForm: true,
      liveValidate: false,
      noValidate: false,
      validFunction:
        "ZnVuY3Rpb24gdmFsaWRhdGUoZm9ybURhdGEsIGVycm9ycykgeyBpZiAoZm9ybURhdGEucGFzczEgIT09IGZvcm1EYXRhLnBhc3MyKSB7IGVycm9ycy5wYXNzMi5hZGRFcnJvcignUGFzc3dvcmRzIGRvbid0IG1hdGNoJyk7IH0gcmV0dXJuIGVycm9yczsgfQ=="
    };
    return formData;
  }
};
