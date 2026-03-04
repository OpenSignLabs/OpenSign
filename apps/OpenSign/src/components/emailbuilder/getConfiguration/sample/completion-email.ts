import { TEditorConfiguration } from "../../documents/editor/core";

const getCompletionEmail = (
): TEditorConfiguration => {
  const appName =
    "OpenSign™";

  const logoBlock =
        {
          "block-1709571212684": {
            type: "Image",
            data: {
              style: {
                padding: { top: 24, bottom: 24, right: 24, left: 24 }
              },
              props: {
                width: null,
                height: 50,
                url: "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png",
                alt: "logo",
                linkHref: null,
                contentAlignment: "middle"
              }
            }
          }
        };
  const logoBlockId =
        ["block-1709571212684"];

  return {
    root: {
      type: "EmailLayout",
      data: {
        backdropColor: "#f5f5f5",
        canvasColor: "#FFFFFF",
        canvasWidth: 600,
        textColor: "#242424",
        fontFamily: "MODERN_SANS",
        childrenIds: [
          ...logoBlockId,
          "block-1770633502472",
          "block-1770795667636",
          "block-1770795483071"
        ]
      }
    },
    ...logoBlock,
    "block-1770633502472": {
      type: "Text",
      data: {
        style: {
          color: "#FFFFFF",
          backgroundColor: "#47A3AD",
          fontSize: 20,
          fontWeight: "bold",
          padding: {
            top: 16,
            bottom: 16,
            right: 24,
            left: 24
          }
        },
        props: {
          markdown: false,
          text: "Document signed successfully\n\n"
        }
      }
    },
    "block-1770633797211": {
      type: "Text",
      data: {
        style: {
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 24
          }
        },
        props: {
          text: "Sender"
        }
      }
    },
    "block-1770633813576": {
      type: "Text",
      data: {
        style: {
          color: "#626363",
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 0
          }
        },
        props: {
          text: "{{receiver_email}}"
        }
      }
    },
    "block-1770633912944": {
      type: "Text",
      data: {
        style: {
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 24
          }
        },
        props: {
          text: "Organization"
        }
      }
    },
    "block-1770633915601": {
      type: "Text",
      data: {
        style: {
          color: "#626363",
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 0
          }
        },
        props: {
          text: "{{company_name}}"
        }
      }
    },
    "block-1770633918679": {
      type: "Text",
      data: {
        style: {
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 24
          }
        },
        props: {
          text: "Expires on"
        }
      }
    },
    "block-1770633921948": {
      type: "Text",
      data: {
        style: {
          color: "#626363",
          backgroundColor: null,
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 0
          }
        },
        props: {
          text: "{{expiry_date}}"
        }
      }
    },
    "block-1770633961786": {
      type: "Text",
      data: {
        style: {
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 24
          }
        },
        props: {
          text: "Note"
        }
      }
    },
    "block-1770633964531": {
      type: "Text",
      data: {
        style: {
          color: "#626363",
          fontSize: 15,
          fontWeight: "bold",
          padding: {
            top: 0,
            bottom: 0,
            right: 24,
            left: 0
          }
        },
        props: {
          text: "{{note}}"
        }
      }
    },
    "block-1770795483071": {
      type: "Html",
      data: {
        style: {
          backgroundColor: "#f5f5f5",
          fontSize: 14,
          textAlign: null,
          padding: {
            top: 16,
            bottom: 16,
            right: 24,
            left: 24
          }
        },
        props: {
          contents: `This is an automated email from ${appName}. For any queries regarding this email, please contact the sender <a href="mailto:{{sender_mail}}" target="_blank">{{sender_mail}}</a> directly.`
        }
      }
    },
    "block-1770795667636": {
      type: "Html",
      data: {
        style: {
          fontSize: 14,
          textAlign: null,
          padding: {
            top: 32,
            bottom: 20,
            right: 20,
            left: 20
          }
        },
        props: {
          contents:
            'All parties have successfully signed the document "<b>{{document_title}}</b>". Kindly download the document from the attachment.'
        }
      }
    }
  };
};

export default getCompletionEmail;
