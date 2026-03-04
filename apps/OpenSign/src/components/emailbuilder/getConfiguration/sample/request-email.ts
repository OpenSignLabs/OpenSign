import { TEditorConfiguration } from "../../documents/editor/core";

const getRequestEmail = (
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
          "block-1770633643816",
          "block-1770633750385",
          "block-1770633994542",
          "block-1770795931867"
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
          text: "Digital Signature Request"
        }
      }
    },
    "block-1770633643816": {
      type: "Html",
      data: {
        style: {
          fontSize: 14,
          textAlign: null,
          padding: {
            top: 20,
            bottom: 20,
            right: 20,
            left: 20
          }
        },
        props: {
          contents:
            "{{sender_name}} has requested you to review and sign <b>{{document_title}}</b>."
        }
      }
    },
    "block-1770633750385": {
      type: "ColumnsContainer",
      data: {
        style: {
          padding: {
            top: 20,
            bottom: 32,
            right: 20,
            left: 4
          }
        },
        props: {
          fixedWidths: [128, null, null],
          columnsCount: 2,
          columnsGap: 0,
          contentAlignment: "top",
          columns: [
            {
              childrenIds: [
                "block-1770633797211",
                "block-1770633912944",
                "block-1770633918679",
                "block-1770633961786"
              ]
            },
            {
              childrenIds: [
                "block-1770633813576",
                "block-1770633915601",
                "block-1770633921948",
                "block-1770633964531"
              ]
            },
            {
              childrenIds: []
            }
          ]
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
          text: "{{sender_mail}}"
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
    "block-1770633994542": {
      type: "Button",
      data: {
        style: {
          fontSize: 14,
          textAlign: "left",
          padding: {
            top: 12,
            bottom: 20,
            right: 12,
            left: 52
          }
        },
        props: {
          buttonBackgroundColor: "#D46B0f",
          buttonStyle: "rectangle",
          fullWidth: false,
          size: "medium",
          text: "Sign Here",
          url: "{{signing_url}}"
        }
      }
    },
    "block-1770795931867": {
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
    }
  };
};
export default getRequestEmail;
