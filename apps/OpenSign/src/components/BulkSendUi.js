import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SuggestionInput from "./shared/fields/SuggestionInput";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import { emailRegex, isEnableSubscription } from "../constant/const";
import { fetchSubscription } from "../constant/Utils";
import { useNavigate } from "react-router-dom";
const BulkSendUi = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState(2);
  const formRef = useRef(null);
  const [scrollOnNextUpdate, setScrollOnNextUpdate] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [allowedForm, setAllowedForm] = useState(0);
  const [isSignatureExist, setIsSignatureExist] = useState();
  const [isBulkAvailable, setIsBulkAvailable] = useState(false);
  const quantityList = [500, 1000, 5000, 50000];
  const [amount, setAmount] = useState({
    price: (75.0).toFixed(2),
    quantity: 500,
    priceperbulksend: 0.15,
    totalcredits: 0
  });
  const [isQuotaReached, setIsQuotaReached] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [admin, setAdmin] = useState({
    objectId: "",
    email: "",
    isAdmin: true
  });
  const allowedSigners = 50;
  useEffect(() => {
    signatureExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function to check atleast one signature field exist
  const signatureExist = async () => {
    if (isEnableSubscription) {
      setIsLoader(true);
      try {
        const subscription = await fetchSubscription();
        const extUser =
          localStorage.getItem("Extand_Class") &&
          JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
        if (
          subscription?.adminId &&
          extUser?.objectId === subscription?.adminId
        ) {
          setAdmin((obj) => ({
            ...obj,
            objectId: subscription?.adminId,
            isAdmin: true
          }));
        } else {
          setAdmin((obj) => ({
            ...obj,
            isAdmin: false,
            email: extUser?.TenantId?.EmailAddress
          }));
        }
        setAdmin((obj) => ({ ...obj, objectId: subscription?.adminId }));
        if (subscription?.plan === "freeplan") {
          setIsFreePlan(true);
        }
        const token = props.jwttoken
          ? { jwttoken: props.jwttoken }
          : { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
        const axiosres = await axios.post(
          `${localStorage.getItem("baseUrl")}functions/allowedcredits`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              ...token
            }
          }
        );
        const resCredits = axiosres.data && axiosres.data.result;
        if (resCredits) {
          const allowedcredits = resCredits?.allowedcredits || 0;
          const addoncredits = resCredits?.addoncredits || 0;
          const totalcredits = allowedcredits + addoncredits;
          if (totalcredits > 0) {
            if (subscription?.plan !== "freeplan") {
              setIsBulkAvailable(true);
            }
          }
          setAmount((obj) => ({ ...obj, totalcredits: totalcredits }));
        }
        const getPlaceholder = props?.Placeholders;
        const checkIsSignatureExistt = getPlaceholder?.every((placeholderObj) =>
          placeholderObj?.placeHolder?.some((holder) =>
            holder?.pos?.some((posItem) => posItem?.type === "signature")
          )
        );
        setIsSignatureExist(checkIsSignatureExistt);
        setIsLoader(false);
      } catch (err) {
        setIsLoader(false);
        alert(t("something-went-wrong-mssg"));
        console.log("Err", err);
      }
    } else {
      setIsBulkAvailable(true);
      setAdmin((obj) => ({ ...obj, isAdmin: true }));
      const getPlaceholder = props?.Placeholders;
      const checkIsSignatureExistt = getPlaceholder?.every((placeholderObj) =>
        placeholderObj?.placeHolder?.some((holder) =>
          holder?.pos?.some((posItem) => posItem?.type === "signature")
        )
      );
      setIsSignatureExist(checkIsSignatureExistt);
      setIsLoader(false);
    }
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
        props?.Placeholders?.forEach((element) => {
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
        setForms((prevForms) => [...prevForms, { Id: 1, fields: users }]);
        const totalForms = Math.floor(allowedSigners / users?.length);
        setAllowedForm(totalForms);
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

  const handleAddForm = (e) => {
    e.preventDefault();
    // Check if the quick send limit has been reached
    if (isEnableSubscription && forms.length >= amount.totalcredits) {
      setIsQuotaReached(true);
    } else {
      if (forms?.length < allowedForm) {
        if (props?.Placeholders.length > 0) {
          let newForm = [];
          props?.Placeholders?.forEach((element) => {
            if (!element.signerObjId) {
              newForm = [
                ...newForm,
                {
                  fieldId: element.Id,
                  email: "",
                  label: element.Role,
                  signer: {}
                }
              ];
            }
          });
          setForms([...forms, { Id: formId, fields: newForm }]);
        }
        setFormId(formId + 1);
        setScrollOnNextUpdate(true);
      } else {
        // If the limit has been reached, throw an error with the appropriate message
        alert(t("quick-send-alert-4"));
      }
    }
  };

  const handleRemoveForm = (index) => {
    const updatedForms = forms.filter((_, i) => i !== index);
    setForms(updatedForms);
  };

  function validateEmails(data) {
    for (const item of data) {
      for (const field of item.fields) {
        if (!emailRegex.test(field.email)) {
          alert(`Invalid email found: ${field.email}`);
          return false;
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
            Signers: props.item.Signers
              ? [...props.item.Signers, ...existSigner]
              : [...existSigner]
          });
        } else {
          Documents.push({
            ...props.item,
            Placeholders: updatedPlaceholders,
            SignatureType: props.signatureType
          });
        }
      });
      await batchQuery(Documents);
    } else {
      setIsSubmit(false);
    }
  };

  const batchQuery = async (Documents) => {
    const token = props.jwttoken
      ? { jwttoken: props.jwttoken }
      : { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
    const functionsUrl = `${localStorage.getItem(
      "baseUrl"
    )}functions/batchdocuments`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      ...token
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
  const handleAddOnQuickSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmit(true);
    try {
      const resAddon = await Parse.Cloud.run("buycredits", {
        credits: amount.quantity
      });
      if (resAddon) {
        const _resAddon = JSON.parse(JSON.stringify(resAddon));
        if (_resAddon.status === "success") {
          setIsBulkAvailable(true);
          handleCloseQuotaReached();
          setAmount((obj) => ({
            ...obj,
            quantity: 500,
            priceperbulksend: 0.15,
            price: (75.0).toFixed(2),
            totalcredits: obj?.totalcredits + _resAddon.addon
          }));
        }
      }
    } catch (err) {
      console.log("Err in buy addon", err);
      alert(t("something-went-wrong-mssg"));
    } finally {
      setIsSubmit(false);
    }
  };
  const handlePricePerQuick = async (e) => {
    const quantity = e.target?.value;
    const price =
      quantity > 0
        ? (Math.round(quantity * amount.priceperbulksend * 100) / 100).toFixed(
            2
          )
        : 500 * amount.priceperbulksend;
    setAmount((prev) => ({ ...prev, quantity: quantity, price: price }));
  };
  const handleCloseQuotaReached = () => {
    setIsQuotaReached(false);
  };
  const handleNavigation = () => {
    navigate("/subscription");
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
          {isBulkAvailable ? (
            <>
              {props.Placeholders?.length > 0 ? (
                isSignatureExist ? (
                  <>
                    {props.Placeholders?.some((x) => !x.signerObjId) ? (
                      <div>
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
                                    <label>{field.label}</label>
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
                                      jwttoken={props?.jwttoken}
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
                            {isEnableSubscription && (
                              <button
                                onClick={handleAddForm}
                                className="op-btn op-btn-primary focus:outline-none"
                              >
                                <i className="fa-light fa-plus"></i>{" "}
                                <span>{t("add-new")}</span>
                              </button>
                            )}
                            <button
                              type="submit"
                              className="op-btn op-btn-accent focus:outline-none"
                            >
                              <i className="fa-light fa-paper-plane"></i>{" "}
                              <span>{t("send")}</span>
                            </button>
                          </div>
                        </form>
                        <ModalUi
                          isOpen={isQuotaReached}
                          handleClose={() => handleCloseQuotaReached()}
                        >
                          <div className="p-4 flex justify-center items-center flex-col gap-y-3">
                            <p className="text-center text-base-content">
                              {t("quota-err-quicksend")}
                            </p>
                            <button
                              onClick={() => setIsBulkAvailable(false)}
                              className=" op-btn op-btn-primary w-[200px]"
                            >
                              {t("buy-credits")}
                            </button>
                          </div>
                        </ModalUi>
                      </div>
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
              {isFreePlan ? (
                <div className="w-full h-[130px] flex flex-col justify-center items-center text-center p-4">
                  <p className="text-base font-medium mb-2.5">
                    {t("bulk-send-subcription-alert")}
                  </p>
                  <button
                    onClick={() => handleNavigation()}
                    className="op-btn op-btn-primary"
                  >
                    {t("upgrade-now")}
                  </button>
                </div>
              ) : (
                <>
                  {admin?.isAdmin ? (
                    <form onSubmit={handleAddOnQuickSubmit} className="p-3">
                      <p className="flex justify-center text-center mx-2 mb-3 text-base op-text-accent font-medium">
                        {t("additional-credits")}
                      </p>
                      <div className="mb-3 flex justify-between">
                        <label
                          htmlFor="quantity"
                          className="block text-xs text-gray-700 font-semibold"
                        >
                          {t("quantity-of-credits")}
                          <span className="text-[red] text-[13px]">*</span>
                        </label>
                        <select
                          value={amount.quantity}
                          onChange={(e) => handlePricePerQuick(e)}
                          name="quantity"
                          className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-1/4 text-xs"
                          required
                        >
                          {quantityList.length > 0 &&
                            quantityList.map((x) => (
                              <option key={x} value={x}>
                                {x}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="mb-3 flex justify-between">
                        <label className="block text-xs text-gray-700 font-semibold">
                          {t("Price")} (1 * {amount.priceperbulksend})
                        </label>
                        <div className="w-1/4 flex justify-center items-center text-sm">
                          USD {amount.price}
                        </div>
                      </div>
                      <hr className="text-base-content mb-3" />
                      <button className="op-btn op-btn-primary w-full mt-2">
                        {t("Proceed")}
                      </button>
                    </form>
                  ) : (
                    <div className="mx-8 mt-4 mb-8 flex justify-center text-center items-center font-medium break-all">
                      {t("unauthorized-modal", { adminEmail: admin?.email })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default BulkSendUi;
