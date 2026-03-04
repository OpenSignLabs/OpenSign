import {
  useState,
  useEffect,
  useMemo
} from "react";
import axios from "axios";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import {
  emailRegex,
} from "../../constant/const";
import {
  getSignedUrl,
  isBase64,
  getBase64FromUrl,
  generateId,
} from "../../constant/Utils";
import {
  handleEmbedPrefillToDoc,
  isWidgetResponseCompatible,
  formatCSVDate,
  normalizeKey,
  loadPdfOnce,
} from "../../utils";
import { useDispatch, useSelector } from "react-redux";
import {
  setBulkLoader,
} from "../../redux/reducers/widgetSlice";
import Table from "./components/Table";
import PrefillWidgets from "./components/PrefillWidgets";
import WizardHeader from "./components/WizardHeader";
import ResponseTab from "./components/ResponseTab";
import { steps } from "../../json/BulkSendSteps";

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
  const [prefillWidgets, setPrefillWidgets] = useState([]);
  const [step, setStep] = useState(0);
  const [stepsList, setStepsList] = useState(steps(t));
  const [stepKey, setStepKey] = useState(steps(t)?.[0]?.key || "");
  const [message, setMessage] = useState({ status: "", message: "" });

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
        roles?.map(async (role) => {
          const isPrefill = role.Role?.toLowerCase() === "prefill";
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
                  if (widget?.options?.formula) return false;
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
                    options: { ...widget.options, response: response },
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
      const prefills = users.find((r) => r?.label?.toLowerCase() === "prefill");
      const signers = users.filter(
        (r) => r?.label?.toLowerCase() !== "prefill"
      );
      setFields(signers);
      if (prefills && prefills?.widgets?.length) {
        setPrefillWidgets(prefills?.widgets);
      } else {
        setStepsList((s) => s.filter((step) => step.key !== "prefill"));
        setStepKey("recipients");
        setStep(0);
      }
      setEmails(emails);

      // Build headers with required ordering:
      // 1) all role emails first
      // 2) then all widgets
      const emailHeaders = [];
      const widgetHeaders = [];
      for (const role of signers) {
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
      setForms((prev) => [...prev, { Id: generateId(8), fields: signers }]);
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

    const isSignExist =
      filtered?.length > 0 &&
      filtered.every((p) =>
        p?.placeHolder?.some((h) =>
          h?.pos?.some((x) => x?.type === "signature")
        )
      );
    setIsSignatureExist(isSignExist);
    setIsVacantRoles(filtered?.some((x) => !x.signerObjId));
  };

  //function to check at least one signature field exist
  const signatureExist = async () => {
    setIsLoader(true);
    await initializeWidgetsWithValues();
      checkSignatureAndRoles(props?.Placeholders);
      setIsLoader(false);
  };

  const handleInputChange = (formIndex, signer, role) => {
    setForms((prev) => {
      const next = [...prev];
      const form = next[formIndex];
      if (!form) return prev;

      const fields = [...(form.fields ?? [])];
      const fieldId = fields.findIndex((f) => f.label === role);
      if (fieldId < 0) return prev;

      const email = signer?.Email ? signer.Email : signer || "";

      fields[fieldId] = {
        ...fields[fieldId],
        email: normalizeKey(email),
        signer: signer?.objectId ? signer : ""
      };

      next[formIndex] = { ...form, fields };
      return next;
    });
  };

  const handleWidgetDetails = (
    value = "",
    formIndex,
    roleIndex = 0,
    widgetIndex
  ) => {
    setForms((prev) => {
      const next = [...prev];
      const form = next[formIndex];
      if (!form) return prev;

      const fields = [...(form.fields ?? [])];
      const field = fields[roleIndex];
      if (!field) return prev;

      const widgets = [...(field.widgets ?? [])];
      const w = widgets[widgetIndex];
      if (!w) return prev;

      widgets[widgetIndex] = {
        ...w,
        options: { ...w?.options, response: value },
        response: value
      };
      fields[roleIndex] = { ...field, widgets };
      next[formIndex] = { ...form, fields };

      return next;
    });
  };


  function validateEmails(data) {
    for (const [rowIndex, item] of data.entries()) {
      let email = "";
      const rowNumber = rowIndex + 1;
      const filterFields = item?.fields || [];
      for (const field of filterFields) {
        // skip prefill
        if (field?.label === "prefill") continue;
        const params = { email: field.email, row: rowNumber };
        if (!field.email) {
          alert(t("email-not-found-in-row", { ...params }));
          return false;
        } else if (!emailRegex.test(field.email)) {
          alert(t("invalid-email-found-in-row", { ...params }));
          return false;
        } else if (email === field.email || emails?.includes(field.email)) {
          alert(t("duplicate-email-found-in-row", { ...params }));
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

          const newResponse = responseByName?.get(name) || "";
          const isValidResponse = isWidgetResponseCompatible(
            widgetDetails,
            newResponse
          );

          if (!isValidResponse) return widgetDetails;

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

        let pdfUrl = props.item?.URL || props.item?.SignedUrl;
        const prefillExist = Placeholders?.some(
          (data) => data.Role === "prefill"
        );
        if (prefillExist) {
          const updatedPrefills = updateWidgetValues(
            prefillWidgets,
            Placeholders
          );
          const prefillDetails = updatedPrefills?.find(
            (data) => data.Role === "prefill"
          );
          const pdfSignedUrl = await getSignedUrl(
            pdfUrl,
            "", //docId
            props.item.objectId, // templateId
          );
          const pdfArrayBuffer = await loadPdfOnce(pdfSignedUrl);
          if (pdfArrayBuffer === "Error") {
            const error = t("something-went-wrong-mssg");
            alert(error);
            dispatch(setBulkLoader(false));
            return;
          }
          pdfUrl = await handleEmbedPrefillToDoc(
            prefillDetails,
            1, // scale
            pdfArrayBuffer,
            [], // prefillImg,
            props.item?.ExtUserPtr?.UserId?.objectId // userId
          );

          if (pdfUrl?.error) {
            const error = pdfUrl?.error?.includes("not compatible")
              ? t("pdf-uncompatible", { appName: appName })
              : pdfUrl?.error;
            alert(error);
            dispatch(setBulkLoader(false));
            return;
          }
        }

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
          let signedUrl = pdfUrl;
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
        setStep((s) => Math.min(2, s + 1));
        setStepKey("response");
        setMessage({
          status: "success",
          message: "Documents sent successfully."
        });
        // props.handleClose("success", Documents?.length);
      }
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "something went wrong.";
      console.error("Error sending documents:", message);
        setMessage({ status: "failed", message });
        // props.handleClose("error", 0, message);
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
      {props.Placeholders?.length > 0 ? (
        isSignatureExist ? (
          isVacantRoles ? (
            <>
              <div className="border-t mt-3" />
              {/* Wizard header */}
              <div className="px-6 py-3">
                <WizardHeader
                  steps={stepsList}
                  step={step}
                  // onStepClick={(i) => i <= step && setStep(i)}
                />
              </div>

              {stepKey === "prefill" && (
                <PrefillWidgets
                  prefills={prefillWidgets}
                  setPrefills={setPrefillWidgets}
                  onNext={() => {
                    setStep((s) => Math.min(2, s + 1));
                    setStepKey("recipients");
                  }}
                />
              )}
              {stepKey === "recipients" && (
                <>
                  <form onSubmit={handleSubmit}>
                    <div className="min-h-max max-h-[250px] overflow-auto">
                      {
                          forms?.length > 0 && (
                            <div className="mx-4">
                              <Table
                                headers={headers}
                                rowData={forms}
                                handleInputChange={handleInputChange}
                                handleWidgetDetails={handleWidgetDetails}
                              />
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
              )}
              {stepKey === "response" && (
                <ResponseTab
                  prefillCount={prefillWidgets?.length}
                  documentCount={forms?.length}
                  message={message}
                />
              )}
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
