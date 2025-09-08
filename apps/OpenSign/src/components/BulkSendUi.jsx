import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SuggestionInput from "./shared/fields/SuggestionInput";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import {
  emailRegex,
} from "../constant/const";
const BulkSendUi = (props) => {
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const formRef = useRef(null);
  const [scrollOnNextUpdate, setScrollOnNextUpdate] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSignatureExist, setIsSignatureExist] = useState();
  const [isDisableBulkSend, setIsDisableBulkSend] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [signers, setSigners] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isPrefillExist, setIsPrefillExist] = useState(false);
  useEffect(() => {
    signatureExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function to check at least one signature field exist
  const signatureExist = async () => {
    const isPrefill = props?.Placeholders.some((x) => x?.Role === "prefill");
    if (isPrefill) {
      setIsPrefillExist(isPrefill);
    }
      setIsDisableBulkSend(false);
      const getPlaceholder = props?.Placeholders;
      const removePrefill = getPlaceholder.filter((x) => x?.Role !== "prefill");
      const checkIsSignatureExistt = removePrefill?.every((placeholderObj) =>
        placeholderObj?.placeHolder?.some((holder) =>
          holder?.pos?.some((posItem) => posItem?.type === "signature")
        )
      );
      setIsSignatureExist(checkIsSignatureExistt);
      setIsLoader(false);
  };
  useEffect(() => {
    if (scrollOnNextUpdate && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
      setScrollOnNextUpdate(false);
    }
  }, [forms, scrollOnNextUpdate]);

  useEffect(() => {
    (() => {
      if (props?.Placeholders?.length > 0) {
        let users = [];
        let emails = [];
        props?.Placeholders?.forEach((element) => {
          const signerEmail = element?.email || element?.signerPtr?.Email;

          // only add when there's a non-empty signerEmail
          if (signerEmail) {
            emails = [...emails, signerEmail];
          }
          if (!element.signerObjId) {
            users = [
              ...users,
              {
                fieldId: element.Id,
                email: "",
                label: element.Role,
                signer: {}
              }
            ];
          }
        });
        setEmails(emails);
        setForms((prevForms) => [...prevForms, { Id: 1, fields: users }]);
        const signer = props.item?.Signers?.filter((x) => x?.objectId);
        setSigners(signer);
      }
    })();
    // eslint-disable-next-line
  }, []);
  const handleInputChange = (index, signer, fieldIndex) => {
    const newForms = [...forms];
    newForms[index].fields[fieldIndex].email = signer?.Email
      ? signer?.Email
      : signer || "";
    newForms[index].fields[fieldIndex].signer = signer?.objectId ? signer : "";
    setForms(newForms);
  };


  const handleRemoveForm = (index) => {
    const updatedForms = forms.filter((_, i) => i !== index);
    setForms(updatedForms);
  };

  function validateEmails(data) {
    for (const item of data) {
      let email = "";
      for (const field of item.fields) {
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
      setIsSubmit(true);
      if (validateEmails(forms)) {
        // Create a copy of Placeholders array from props.item
        let Placeholders = [...props.Placeholders];
        // Initialize an empty array to store updated documents
        let Documents = [];
        // Loop through each form
        forms.forEach((form) => {
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
                  email: field.email,
                  signerObjId: field?.signer?.objectId || "",
                  signerPtr: signer
                };
              }
            }
            // If no matching field is found, keep the placeholder as is
            return placeholder;
          });

          // Push a new document object with updated Placeholders into the Documents array
          if (existSigner?.length > 0) {
            Documents.push({
              ...props.item,
              Placeholders: updatedPlaceholders,
              Signers: signers ? [...signers, ...existSigner] : [...existSigner]
            });
          } else {
            Documents.push({
              ...props.item,
              Placeholders: updatedPlaceholders,
              SignatureType: props.signatureType,
              Signers: signers
            });
          }
        });
        await batchQuery(Documents);
      } else {
        setIsSubmit(false);
      }
  };

  const batchQuery = async (Documents) => {
    const token =
          { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
    const functionsUrl = `${localStorage.getItem(
      "baseUrl"
    )}functions/batchdocuments`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      ...token,
    };
    const params = { Documents: JSON.stringify(Documents) };
    try {
      const res = await axios.post(functionsUrl, params, { headers: headers });
      // console.log("res ", res);
      if (res.data && res.data.result) {
        props.handleClose("success", Documents?.length);
      }
    } catch (err) {
      console.log("Err ", err);
      props.handleClose("error", 0);
    } finally {
      setIsSubmit(false);
    }
  };
  return (
    <>
      {isLoader ? (
        <div className="w-full h-[100px] flex justify-center items-center z-[999]">
          <Loader />
        </div>
      ) : (
        <>
          {isSubmit && (
            <div className="absolute z-[999] h-full w-full flex justify-center items-center bg-black bg-opacity-30">
              <Loader />
            </div>
          )}
          {isPrefillExist ? (
            <div className="text-black p-3 bg-white w-full text-sm md:text-base flex justify-center items-center">
              {t("prefill-bulk-error")}
            </div>
          ) : !isDisableBulkSend ? (
            <>
              {props.Placeholders?.length > 0 ? (
                isSignatureExist ? (
                  <>
                    {props.Placeholders?.some((x) => !x.signerObjId) ? (
                      <>
                        <form onSubmit={handleSubmit}>
                          <div className="min-h-max max-h-[250px] overflow-y-auto">
                            {forms?.map((form, index) => (
                              <div
                                key={form.Id}
                                className="p-3 op-card border-[1px] border-gray-400 mt-3 mx-4 mb-4 bg-base-200 text-base-content grid grid-cols-1 md:grid-cols-2 gap-2 relative"
                              >
                                {form?.fields?.map((field, fieldIndex) => (
                                  <div
                                    className="flex flex-col"
                                    key={field.fieldId}
                                  >
                                    <label className="block text-xs font-semibold">
                                      {field.label}
                                    </label>
                                    <SuggestionInput
                                      required
                                      type="email"
                                      value={field.value}
                                      index={fieldIndex}
                                      onChange={(signer) =>
                                        handleInputChange(
                                          index,
                                          signer,
                                          fieldIndex
                                        )
                                      }
                                    />
                                  </div>
                                ))}
                                {forms?.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveForm(index)}
                                    className="absolute right-3 top-1 text-[red] border-[1px] border-[red] rounded-lg w-[1.7rem] h-[1.7rem]"
                                  >
                                    <i className="fa-light fa-trash"></i>
                                  </button>
                                )}
                                <div ref={formRef}></div>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col mx-4 mb-4 gap-3">
                            <button
                              type="submit"
                              className="op-btn op-btn-accent focus:outline-none"
                            >
                              <i className="fa-light fa-paper-plane"></i>{" "}
                              <span>{t("send")}</span>
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="text-black p-3 bg-white w-full text-sm md:text-base flex justify-center items-center">
                        {t("quick-send-alert-1")}
                      </div>
                    )}
                  </>
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
            </>
          ) : (
            <>
            </>
          )}
        </>
      )}
    </>
  );
};

export default BulkSendUi;
