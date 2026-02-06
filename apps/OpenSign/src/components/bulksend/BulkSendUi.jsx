import {
  useState,
  useEffect,
  useMemo
} from "react";
import axios from "axios";
import SuggestionInput from "../shared/fields/SuggestionInput";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import {
  emailRegex,
} from "../../constant/const";
import {
  convertPdfArrayBuffer,
  getSignedUrl,
  isBase64,
  getBase64FromUrl,
} from "../../constant/Utils";
import {
  formatCSVDate,
  handleEmbedPrefillToDoc,
  normalizeKey
} from "../../utils";
import RenderWidgets from "./components/RenderWidgets";
import { useDispatch, useSelector } from "react-redux";
import { setBulkLoader } from "../../redux/reducers/widgetSlice";

const EXCLUDED_PREFILL_TYPES = new Set(["image", "draw"]);
const EXCLUDED_WIDGET_TYPES = new Set([
  "image",
  "signature",
  "stamp",
  "initials"
]);
const ALL_EXCLUDED_TYPES = new Set([
  ...EXCLUDED_PREFILL_TYPES,
  ...EXCLUDED_WIDGET_TYPES
]);

const requiredAsteriskCls = (isRequired = false) => {
  return isRequired ? "after:content-['_*'] after:text-red-500" : "";
};
const BulkSendUi = (props) => {
  const { t } = useTranslation();
  const appName =
    "OpenSign™";
  const dispatch = useDispatch();
  const { isBulkLoader } = useSelector((state) => state.widget);
  const [forms, setForms] = useState([]);
  const [isSignatureExist, setIsSignatureExist] = useState();
  const [isLoader, setIsLoader] = useState(false);
  const [signers, setSigners] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isVacantRoles, setIsVacantRoles] = useState(false);
  const [fields, setFields] = useState([]);
  const [headers, setHeaders] = useState([]);

  const tokenHeader = useMemo(() => {
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId")
    };
    return {
      ...headers,
      "X-Parse-Session-Token": localStorage.getItem("accesstoken")
    };
  }, [props?.jwttoken]);

  //  Initialize form state (fields, widgets/responses, emails, headers, forms, signers, allowedForm) from template placeholders with existing values.
  const initializeWidgetsWithValues = async () => {
    if (props?.Placeholders?.length > 0) {
      const roles = props?.Placeholders?.filter((p) => !p.signerObjId) || [];
      const emails = [];
      const users = await Promise.all(
        roles.map(async (role) => {
          const isPrefill = role?.Role?.toLowerCase() === "prefill";
          const uniqueNames = new Set();
          const pages = role?.placeHolder ?? [];
          const widgets = await Promise.all(
            pages.flatMap((page) =>
              page.pos
                .filter((widget) => {
                  const widgetName = widget?.options?.name;
                  if (!widgetName) return false; //|| widget?.options?.isReadOnly
                  // exclude certain widget types for non-prefill
                  if (EXCLUDED_WIDGET_TYPES.has(widget.type) && !isPrefill)
                    return false;
                  // unique by widget name
                  if (uniqueNames.has(widgetName)) return false;
                  uniqueNames.add(widgetName);
                  return true;
                })
                .map(async (widget) => {
                  let response = "";
                  if (ALL_EXCLUDED_TYPES.has(widget.type)) {
                    const url =
                      widget.options?.response ||
                      widget.options?.defaultValue ||
                      "";
                    if (url && !isBase64(url)) {
                      const signedUrl = await getSignedUrl(
                        url,
                        "", // docId
                        props.item.objectId, // templateId
                      );

                      response = await getBase64FromUrl(signedUrl, true);
                    } else {
                      response = "";
                    }
                  } else {
                    if (widget.type === "date") {
                      const value =
                        widget.options?.response ||
                        widget.options?.defaultValue ||
                        "";
                      response = value ? formatCSVDate(widget, value) : "";
                    } else {
                      response =
                        widget.options?.response ||
                        widget.options?.defaultValue ||
                        "";
                    }
                  }
                  const label = `${role.Role}::${widget.options?.name}`;

                  return {
                    ...widget,
                    label: label,
                    response,
                    pageNumber: page.pageNumber
                  };
                })
            )
          );
          const signerEmail =
            normalizeKey(role?.email) || role?.signerPtr?.Email;
          if (signerEmail) emails.push(signerEmail);

          return {
            fieldId: role.Id,
            email: "",
            label: role.Role,
            signer: {},
            widgets: widgets
          };
        })
      );
      setFields(users);
      setEmails(emails);

      // Build headers with required ordering:
      // 1) all role emails first
      // 2) then all widgets
      const emailHeaders = [];
      const widgetHeaders = [];
      for (const role of users) {
        const isPrefill = role?.label?.toLowerCase() === "prefill";

        if (!isPrefill) {
          emailHeaders.push({
            label: `${role.label}::Email`,
            role: role.label,
            type: "role",
            isRequired: true
          });
        }

        for (const widget of role?.widgets ?? []) {
          const isRequired =
            widget?.options?.status === "required" && isPrefill;

          widgetHeaders.push({
            label: widget?.label,
            role: role?.label,
            type: widget?.type,
            isRequired
          });
        }
      }
      setHeaders([...emailHeaders, ...widgetHeaders]);
      setForms((prev) => [...prev, { Id: 1, fields: users }]);
      const signer = props.item?.Signers?.filter((x) => x?.objectId);
      setSigners(signer);
    }
  };

  useEffect(() => {
    signatureExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSignatureAndRoles = (placeholders = []) => {
    const filtered = placeholders.filter((x) => x?.Role !== "prefill");

    const isSignExist = filtered.every((p) =>
      p?.placeHolder?.some((h) => h?.pos?.some((p) => p?.type === "signature"))
    );

    setIsSignatureExist(isSignExist);
    setIsVacantRoles(placeholders.some((x) => !x.signerObjId));
  };

  //function to check at least one signature field exist
  const signatureExist = async () => {
    setIsLoader(true);
    await initializeWidgetsWithValues();
      checkSignatureAndRoles(props?.Placeholders);
      setIsLoader(false);
  };

  const handleInputChange = (formIndex, signer, role) => {
    const newForms = [...forms];
    const email = signer?.Email ? signer?.Email : signer || "";
    const fieldId = newForms[formIndex].fields.findIndex(
      (f) => f.label === role
    );
    newForms[formIndex].fields[fieldId].email = normalizeKey(email);
    newForms[formIndex].fields[fieldId].signer = signer?.objectId ? signer : "";
    setForms(newForms);
  };

  const handleWidgetDetails = (
    value = "",
    formIndex,
    RoleIndex = 0,
    widgetIndex
  ) => {
    const newForms = [...forms];
    newForms[formIndex].fields[RoleIndex].widgets[widgetIndex].response = value;
    setForms(newForms);
  };


  function validateEmails(data) {
    for (const item of data) {
      let email = "";
      const filterFields = item.fields.filter((p) => p.label !== "prefill");
      for (const field of filterFields) {
        if (!emailRegex.test(field.email)) {
          alert(t("invalid-email-found", { email: field.email }));
          return false;
        } else if (email === field.email || emails?.includes(field.email)) {
          alert(t("duplicate-email-found", { email: field.email }));
          return false;
        } else {
          email = field.email;
        }
      }
    }
    return true;
  }

  // `updateWidgetValues` will update responses for all widget types
  const updateWidgetValues = (widgetValues = [], placeholders = []) => {
    if (!widgetValues?.length) return placeholders;
    const responseByName = new Map(
      widgetValues
        .map((w) => [w?.options?.name, w?.response])
        .filter(([name]) => !!name)
    );

    return placeholders.map((ph) => {
      const updatedPages = (ph?.placeHolder ?? []).map((page) => {
        const updatedPos = (page?.pos ?? []).map((widgetDetails) => {
          const name = widgetDetails?.options?.name;
          if (!name || !responseByName.has(name)) return widgetDetails;

          const newResponse = responseByName.get(name);

          return {
            ...widgetDetails,
            options: {
              ...widgetDetails.options,
              // update response; if you DON'T want undefined to overwrite, keep the ?? fallback
              response:
                newResponse ??
                widgetDetails.options?.response ??
                widgetDetails.options?.defaultValue
            }
          };
        });

        return { ...page, pos: updatedPos };
      });

      return { ...ph, placeHolder: updatedPages };
    });
  };

  // `removeWidgetValues` will clear out responses for draw/image/signature/stamp/initials widgets
  const removeWidgetValues = (widgetValues = [], placeholders = []) => {
    if (!widgetValues?.length) return placeholders;
    return placeholders.map((ph) => {
      const updatedPages = (ph?.placeHolder ?? []).map((page) => {
        const updatedPos = (page?.pos ?? []).map((widgetDetails) => {
          const isImageType = ALL_EXCLUDED_TYPES.has(widgetDetails?.type);
          return {
            ...widgetDetails,
            options: {
              ...widgetDetails.options,
              // update response; if you DON'T want undefined to overwrite, keep the ?? fallback
              response: isImageType ? "" : widgetDetails.options?.response,
              defaultValue: isImageType
                ? ""
                : widgetDetails.options?.defaultValue
            }
          };
        });

        return { ...page, pos: updatedPos };
      });

      return { ...ph, placeHolder: updatedPages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
      dispatch(setBulkLoader(true));
      if (!forms.length) {
        alert(t("bulk-send-no-records"));
        dispatch(setBulkLoader(false));
        return;
      }
      if (validateEmails(forms)) {
        // Create a copy of Placeholders array from props.item
        let Placeholders = [...props.Placeholders];
        // Initialize an empty array to store updated documents
        let Documents = [];
        let error = "";
        // Loop through each form
        for (const form of forms) {
          //checking if user enter email which already exist as a signer then add user in a signers array
          let existSigner = [];
          form.fields.map((data) => {
            if (data.signer) {
              existSigner.push(data.signer);
            }
          });
          // Map through the copied Placeholders array to update email values
          const updatedPlaceholders = Placeholders.map((placeholder) => {
            // Find the field in the current form that matches the placeholder Id
            const field = form.fields.find(
              (element) => parseInt(element.fieldId) === placeholder.Id
            );
            // If a matching field is found, update the email value in the placeholder
            const signer = field?.signer?.objectId ? field.signer : "";
            if (field) {
              if (signer) {
                return {
                  ...placeholder,
                  signerObjId: field?.signer?.objectId || "",
                  signerPtr: signer
                };
              } else {
                return {
                  ...placeholder,
                  email: normalizeKey(field.email),
                  signerObjId: field?.signer?.objectId || "",
                  signerPtr: signer
                };
              }
            }
            // If no matching field is found, keep the placeholder as is
            return placeholder;
          });
          const widgetValues = form?.fields?.flatMap((f) => f.widgets);
          const updateWidgetPlaceholder = updateWidgetValues(
            widgetValues,
            updatedPlaceholders
          );
          const url = props.item?.URL || props.item?.SignedUrl;
          let signedUrl = await getSignedUrl(
            url,
            "", //docId
            props.item.objectId, // templateId
          );
          const prefillField = form?.fields?.find((f) => f.label === "prefill");
          const prefills = prefillField?.widgets ?? [];
          if (prefills?.length > 0) {
            const prefillDetails = updateWidgetPlaceholder?.find(
              (x) => x.Role === "prefill"
            );
            const pdfArrayBuffer = await convertPdfArrayBuffer(signedUrl);
            if (pdfArrayBuffer === "Error") {
              error = t("something-went-wrong-mssg");
              dispatch(setBulkLoader(false));
              break;
            }
            signedUrl = await handleEmbedPrefillToDoc(
              prefillDetails,
              1, // scale
              pdfArrayBuffer,
              [], // prefillImg,
              props.item?.ExtUserPtr?.UserId?.objectId // userId
            );
            if (signedUrl?.error) {
              error = signedUrl.error.includes("not compatible")
                ? t("pdf-uncompatible", { appName: appName })
                : signedUrl?.error;
              dispatch(setBulkLoader(false));
              break;
            }
          }
          const placeholders = removeWidgetValues(
            widgetValues,
            updateWidgetPlaceholder
          );
          if (!signedUrl) {
            error = t("something-went-wrong-mssg");
            dispatch(setBulkLoader(false));
            break;
          }
          // Push a new document object with updated Placeholders into the Documents array
          if (existSigner?.length > 0) {
            Documents.push({
              ...props.item,
              URL: signedUrl,
              Placeholders: placeholders,
              Signers: signers ? [...signers, ...existSigner] : [...existSigner]
            });
          } else {
            Documents.push({
              ...props.item,
              URL: signedUrl,
              Placeholders: placeholders,
              SignatureType: props.signatureType,
              Signers: signers
            });
          }
        }
        if (error) {
          alert(error);
        } else {
          await batchQuery(Documents);
        }
      } else {
        dispatch(setBulkLoader(false));
      }
  };

  const batchQuery = async (Documents) => {
    const functionsUrl = `${localStorage.getItem("baseUrl")}functions/batchdocuments`;
    const headers = {
      ...tokenHeader,
    };
    const params = { Documents: JSON.stringify(Documents) };
    try {
      const res = await axios.post(functionsUrl, params, { headers: headers });
      if (res.data && res.data.result) {
        props.handleClose("success", Documents?.length);
      }
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "something went wrong.";
      console.error("Error sending documents:", message);
        props.handleClose("error", 0, message);
    } finally {
      dispatch(setBulkLoader(false));
    }
  };


  if (isLoader) {
    return (
      <div className="w-full h-[100px] flex justify-center items-center z-[999]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* {isBulkLoader && (
        <div className="absolute z-[999] h-full w-full flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )} */}
      {props.Placeholders?.length > 0 ? (
        isSignatureExist ? (
          isVacantRoles ? (
            <>
              <form onSubmit={handleSubmit}>
                <div className="min-h-max max-h-[250px] overflow-auto">
                  {
                      forms?.length > 0 && (
                        <div className="mx-4">
                          <table className="op-table border-collapse w-full">
                            <thead className="text-[13px] text-center">
                              <tr className="border-y-[1px]">
                                {/* Roles + widgets */}
                                {headers?.map((header) => (
                                  <th
                                    key={header.label}
                                    className={`${requiredAsteriskCls(header?.isRequired)} p-2`}
                                  >
                                    {header.label}
                                  </th>
                                ))}
                                {forms?.length > 1 && (
                                  <th className="p-2">{t("action")}</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="text-[12px] text-base-content">
                              {forms.map((form, formIndex) => {
                                const fields = form?.fields ?? [];
                                const emailFields = fields.filter(
                                  (f) => f.label !== "prefill"
                                );
                                const widgets = fields.flatMap(
                                  (f, fieldIndex) =>
                                    (f.widgets ?? []).map(
                                      (widget, widgetIndex) => ({
                                        widget,
                                        fieldIndex, // keep the fieldIndex that produced this widget
                                        widgetIndex
                                      })
                                    )
                                );

                                return (
                                  <tr key={form.Id}>
                                    {/* Email cell (label + SuggestionInput) */}
                                    {emailFields?.map((field, fieldIndex) => (
                                      <td key={field.fieldId} className="p-2">
                                        <div className="flex flex-col min-w-max">
                                          <SuggestionInput
                                            required
                                            type="email"
                                            value={field.email ?? ""}
                                            index={fieldIndex}
                                            onChange={(signer) =>
                                              handleInputChange(
                                                formIndex,
                                                signer,
                                                field.label
                                              )
                                            }
                                          />
                                        </div>
                                      </td>
                                    ))}

                                    {widgets.map(
                                      ({ widget, fieldIndex, widgetIndex }) => (
                                        <td key={widget.key} className="p-2">
                                          <RenderWidgets
                                            widget={widget}
                                            formIndex={formIndex}
                                            prefillIndex={widgetIndex}
                                            handleWidgetDetails={(value) =>
                                              handleWidgetDetails(
                                                value,
                                                formIndex,
                                                fieldIndex,
                                                widgetIndex
                                              )
                                            }
                                          />
                                        </td>
                                      )
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )
                  }
                </div>
                <div className="flex flex-row flex-wrap pb-3 pt-2 px-3 gap-3 justify-center">
                  <button
                    type="submit"
                    className="op-btn op-btn-accent w-[150px] focus:outline-none"
                  >
                    <i className="fa-light fa-paper-plane"></i>
                    <span>{t("send")}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-black p-3 bg-white w-full text-sm md:text-base flex justify-center items-center">
              {t("quick-send-alert-1")}
            </div>
          )
        ) : (
          <div className="text-black p-3 bg-white w-full text-sm md:text-base flex justify-center items-center">
            {t("quick-send-alert-2")}
          </div>
        )
      ) : (
        <div className="text-black p-3 bg-white w-full text-sm md:text-base flex justify-center items-center">
          {t("quick-send-alert-3")}
        </div>
      )}
    </div>
  );
};

export default BulkSendUi;
