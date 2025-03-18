import React, { useEffect, useState, useRef } from "react";
import Title from "../components/Title";
import Alert from "../primitives/Alert";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";
import Tooltip from "../primitives/Tooltip";
import {
  getTenantDetails,
  handleSignatureType,
  signatureTypes,
  usertimezone
} from "../constant/Utils";
import Parse from "parse";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TimezoneSelector from "../components/shared/fields/TimezoneSelector";
import ReactQuill from "react-quill-new";
import "../styles/quill.css";
import EditorToolbar, {
  module1,
  module2,
  formats
} from "../components/pdf/EditorToolbar";

const Preferences = () => {
  const appName = "OpenSign™";
  const { t } = useTranslation();
  const editorRef = useRef();
  const editorRefCom = useRef();
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [requestSubject, setRequestSubject] = useState("");
  const [completionBody, SetCompletionBody] = useState("");
  const [completionsubject, setCompletionSubject] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [defaultCompHtml, setDefaultCompHtml] = useState({});
  const [tenantId, setTenantId] = useState("");
  const [defaultReqHtml, setDefaultReqHtml] = useState({});
  const [isalert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTopLoader, setIsTopLoader] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [isNotifyOnSignatures, setIsNotifyOnSignatures] = useState();
  const [timezone, setTimezone] = useState(usertimezone);
  const [activeTab, setactiveTab] = useState(0);
  const generaltab = { title: t("general"), icon: "fa-light fa-gears" };
  const [tab, setTab] = useState([generaltab]);
  const [sendinOrder, setSendinOrder] = useState(true);
  const [isTourEnabled, setIsTourEnabled] = useState(false);

  useEffect(() => {
    fetchSignType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSignType = async () => {
    setIsTopLoader(true);
    const EmailTab =
      extClass?.[0]?.UserRole === "contracts_Admin"
        ? [{ title: t("email"), icon: "fa-light fa-envelope" }]
        : [];
    const arr = [generaltab, ...EmailTab];
    setTab(arr);
    try {
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const tenantDetails = await getTenantDetails(user?.objectId);
      await tenantEmailTemplate(tenantDetails);
      const signatureType = tenantDetails?.SignatureType || [];
      const tenantSignTypes = signatureType?.filter((x) => x.enabled === true);
      const getUser = await Parse.Cloud.run("getUserDetails");
      if (getUser) {
        const _getUser = JSON.parse(JSON.stringify(getUser));
        const notifyOnSignatures =
          _getUser?.NotifyOnSignatures !== undefined
            ? _getUser?.NotifyOnSignatures
            : true;
        setIsNotifyOnSignatures(notifyOnSignatures);
        setTimezone(_getUser?.Timezone || usertimezone);
        if (tenantSignTypes?.length > 0) {
          const signatureType = _getUser?.SignatureType || signatureTypes;
          const updatedSignatureType = await handleSignatureType(
            tenantSignTypes,
            signatureType
          );
          setSignatureType(updatedSignatureType);
        } else {
          const SignatureType = _getUser?.SignatureType || signatureTypes;
          setSignatureType(SignatureType);
        }
        const sendinorder =
          _getUser?.SendinOrder !== undefined ? _getUser?.SendinOrder : true;
        setSendinOrder(sendinorder);
        const istourenabled =
          _getUser?.IsTourEnabled !== undefined
            ? _getUser?.IsTourEnabled
            : true;
        setIsTourEnabled(istourenabled);
      }
    } catch (err) {
      console.log("err while getting user details", err);
      setErrMsg("Something went wrong");
    } finally {
      setIsTopLoader(false);
    }
  };

  // `handleCheckboxChange` is trigger when user enable/disable checkbox of respective type
  const handleCheckboxChange = (index) => {
    // Create a copy of the signatureType array
    const updatedSignatureType = [...signatureType];
    // Toggle the enabled value for the clicked item
    updatedSignatureType[index].enabled = !updatedSignatureType[index].enabled;
    // Update the state with the modified array
    setSignatureType(updatedSignatureType);
  };

  // `handleSave` is used save updated value signature type
  const handleSave = async () => {
    setIsLoader(true);
    const Timezone = timezone || usertimezone;
    if (
      signatureType.length > 0 ||
      isNotifyOnSignatures !== undefined ||
      Timezone
    ) {
      let params = { Timezone: Timezone };
      if (signatureType.length > 0) {
        const enabledSignTypes = signatureType?.filter((x) => x.enabled);
        const isDefaultSignTypeOnly =
          enabledSignTypes?.length === 1 &&
          enabledSignTypes[0]?.name === "default";
        if (enabledSignTypes.length === 0) {
          setIsAlert({
            type: "danger",
            msg: t("at-least-one-signature-type")
          });
        } else if (isDefaultSignTypeOnly) {
          setIsAlert({
            type: "danger",
            msg: t("expect-default-one-more-signature-type")
          });
        } else {
          params = { ...params, SignatureType: signatureType };
        }
      }
      if (isNotifyOnSignatures !== undefined) {
        params = { ...params, NotifyOnSignatures: isNotifyOnSignatures };
      }
      try {
        params = {
          ...params,
          SendinOrder: sendinOrder,
          IsTourEnabled: isTourEnabled
        };
        const updateRes = await Parse.Cloud.run("updatepreferences", params);
        if (updateRes) {
          setIsAlert({ type: "success", msg: "Saved successfully." });
          let extUser =
            localStorage.getItem("Extand_Class") &&
            JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
          if (extUser && extUser?.objectId) {
            extUser.NotifyOnSignatures = isNotifyOnSignatures;
            extUser.SendinOrder = sendinOrder;
            extUser.IsTourEnabled = isTourEnabled;
            const _extUser = JSON.parse(JSON.stringify(extUser));
            localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
          }
        }
      } catch (err) {
        console.log("Error updating signature type", err);
        setIsAlert({ type: "danger", msg: err.message });
      }

      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      setIsLoader(false);
    }
  };

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setIsNotifyOnSignatures(value);
  };
  const tenantEmailTemplate = async (tenantRes) => {
    if (tenantRes === "user does not exist!") {
      alert("User does not exist");
    } else if (tenantRes) {
      setIsLoader(true);
      const updateRes = tenantRes;
      setTenantId(updateRes?.objectId);
      const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
      if (updateRes?.RequestBody) {
        setRequestBody(updateRes?.RequestBody);
        setRequestSubject(updateRes?.RequestSubject);
      } else {
        setRequestBody(defaultRequestBody);
        setRequestSubject(
          `{{sender_name}} has requested you to sign {{document_title}}`
        );
      }
      setDefaultReqHtml({
        body: defaultRequestBody,
        subject: `{{sender_name}} has requested you to sign {{document_title}}`
      });
      const defaultCompletionBody = `<p>Hi {{sender_name}},</p><br><p>All parties have successfully signed the document {{document_title}}. Kindly download the document from the attachment.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
      if (updateRes?.CompletionBody) {
        SetCompletionBody(updateRes?.CompletionBody);
        setCompletionSubject(updateRes?.CompletionSubject);
      } else {
        SetCompletionBody(defaultCompletionBody);
        setCompletionSubject(
          `Document {{document_title}} has been signed by all parties`
        );
      }
      setDefaultCompHtml({
        body: defaultCompletionBody,
        subject: `Document {{document_title}} has been signed by all parties`
      });
      setIsLoader(false);
    }
  };
  //function to save completion email template
  const handleSaveCompletionEmail = async (e) => {
    e.preventDefault();
    try {
      setIsLoader(true);
      const replacedHtmlBody = completionBody.replace(/"/g, "'");
      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const tenantQuery = new Parse.Query("partners_Tenant");
      const updateTenantObj = await tenantQuery.get(tenantId);
      updateTenantObj.set("CompletionBody", htmlBody);
      updateTenantObj.set("CompletionSubject", completionsubject);
      const res = await updateTenantObj.save();
      if (res) {
        const updateRes = JSON.parse(JSON.stringify(res));
        SetCompletionBody(updateRes?.CompletionBody);
        setCompletionSubject(updateRes?.CompletionSubject);
        setIsAlert({ type: "success", msg: "Saved successfully." });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.log("Err", err);
      setIsAlert({ type: "danger", msg: "Something went wrong." });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    } finally {
      setIsLoader(false);
    }
  };
  //function to save request email template
  const handleSaveRequestEmail = async (e) => {
    e.preventDefault();
    try {
      setIsLoader(true);
      const replacedHtmlBody = requestBody.replace(/"/g, "'");
      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const tenantQuery = new Parse.Query("partners_Tenant");
      const updateTenantObj = await tenantQuery.get(tenantId);
      updateTenantObj.set("RequestBody", htmlBody);
      updateTenantObj.set("RequestSubject", requestSubject);
      const res = await updateTenantObj.save();
      if (res) {
        const updateRes = JSON.parse(JSON.stringify(res));
        setRequestBody(updateRes?.RequestBody);
        setRequestSubject(updateRes?.RequestSubject);
        setIsAlert({ type: "success", msg: "Saved successfully." });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.log("Err", err);
      setIsAlert({ type: "danger", msg: "Something went wrong." });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    } finally {
      setIsLoader(false);
    }
  };

  //function to use reset form
  const handleReset = (request, completion) => {
    if (request) {
      setRequestBody(defaultReqHtml?.body);
      setRequestSubject(defaultReqHtml?.subject);
    } else if (completion) {
      setCompletionSubject(defaultCompHtml?.subject);
      SetCompletionBody(defaultCompHtml?.body);
    }
  };
  //function for handle ontext change and save again text in delta
  const handleOnchangeRequest = () => {
    if (editorRef.current) {
      const html = editorRef.current.editor.root.innerHTML;
      setRequestBody(html);
    }
  };
  const handleOnchangeCompletion = () => {
    if (editorRefCom.current) {
      const html = editorRefCom.current.editor.root.innerHTML;
      SetCompletionBody(html);
    }
  };

  const handleTourInput = () => setIsTourEnabled(!isTourEnabled);
  const handleSendinOrderInput = () => setSendinOrder(!sendinOrder);

  return (
    <React.Fragment>
      <Title title={t("Preferences")} />
      {isalert.msg && <Alert type={isalert.type}>{isalert.msg}</Alert>}
      {isTopLoader ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <>
          {errMsg ? (
            <div className="flex justify-center items-center h-screen">
              {errMsg}
            </div>
          ) : (
            <div className="relative bg-base-100 text-base-content flex flex-col justify-center shadow-md rounded-box mb-3">
              {isLoader && (
                <div className="flex z-[100] justify-center items-center absolute w-full h-full rounded-box bg-black/30">
                  <Loader />
                </div>
              )}
              <h1 className="ml-4 mt-3 mb-2 font-semibold">
                {appName} {t("Preferences")}{" "}
                <span>
                  <Tooltip message={`${appName} ${t("Preferences")}`} />
                </span>
              </h1>
              <div className="flex justify-center items-center mt-2">
                <div
                  role="tablist"
                  className="op-tabs op-tabs-bordered op-tabs-sm md:op-tabs-md"
                >
                  {tab.map((tabData, ind) => (
                    <div
                      onClick={() => setactiveTab(ind)}
                      key={ind}
                      role="tab"
                      className={`${
                        activeTab === ind ? "op-tab-active" : ""
                      } op-tab text-xs md:text-base pb-2 md:pb-0 }`}
                    >
                      <i className={tabData.icon}></i>
                      <span className="ml-1 md:ml-2">{tabData.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center md:justify-start mt-3 md:mt-4 break-all">
                {activeTab === 0 ? (
                  <div className="ml-4 mt-1 mb-2 flex flex-col">
                    <div className="mb-[0.75rem]">
                      <label
                        className="mb-[0.7rem] text-[12px]"
                        htmlFor="signaturetype"
                      >
                        <span className="font-medium text-[14px]">
                          {t("allowed-signature-types")}
                        </span>
                        <a data-tooltip-id="signtypes-tooltip" className="ml-1">
                          <sup>
                            <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                          </sup>
                        </a>
                        <ReactTooltip
                          id="signtypes-tooltip"
                          className="z-[999]"
                        >
                          <div className="max-w-[200px] md:max-w-[450px]">
                            <p className="font-bold">
                              {t("allowed-signature-types")}
                            </p>
                            <p>{t("allowed-signature-types-help.p1")}</p>
                            <p className="p-[5px] ml-2">
                              <ol className="list-disc">
                                <li>
                                  <span className="font-bold">Draw: </span>
                                  <span>
                                    {t("allowed-signature-types-help.l1")}
                                  </span>
                                </li>
                                <li>
                                  <span className="font-bold">Type: </span>
                                  <span>
                                    {t("allowed-signature-types-help.l2")}
                                  </span>
                                </li>
                                <li>
                                  <span className="font-bold">Upload: </span>
                                  <span>
                                    {t("allowed-signature-types-help.l3")}
                                  </span>
                                </li>
                                <li>
                                  <span className="font-bold">Default: </span>
                                  <span>
                                    {t("allowed-signature-types-help.l4")}
                                  </span>
                                </li>
                              </ol>
                            </p>
                          </div>
                        </ReactTooltip>
                      </label>
                      <div className="ml-[7px] flex flex-col md:flex-row gap-[10px] mb-[0.7rem]">
                        {signatureType.map((type, i) => (
                          <div
                            key={i}
                            className="flex flex-row gap-[5px] items-center"
                          >
                            <input
                              className="mr-[2px] op-checkbox op-checkbox-xs"
                              type="checkbox"
                              name="signaturetype"
                              onChange={() => handleCheckboxChange(i)}
                              checked={type.enabled}
                            />
                            <div
                              className="text-[13px] font-medium hover:underline underline-offset-2 cursor-default capitalize"
                              title={`Enabling this allow signers to ${type.name} signature`}
                            >
                              {type?.name === "typed" ? "type" : type?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-[0.75rem]">
                      <label className="mb-[0.7rem] text-[12px]">
                        <span className="text-[14px] font-medium">
                          {t("notify-on-signatures")}
                        </span>
                        <a data-tooltip-id="nos-tooltip" className="ml-1">
                          <sup>
                            <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                          </sup>
                        </a>
                        <ReactTooltip id="nos-tooltip" className="z-[999]">
                          <div className="max-w-[200px] md:max-w-[450px]">
                            <p className="font-bold">
                              {t("notify-on-signatures")}
                            </p>
                            <p>{t("notify-on-signatures-help.p1")}</p>
                            <p>{t("notify-on-signatures-help.note")}</p>
                          </div>
                        </ReactTooltip>
                      </label>
                      <div className="flex flex-col md:flex-row md:gap-4">
                        <div className={"flex items-center gap-2 ml-2 mb-1"}>
                          <input
                            className="mr-[2px] op-radio op-radio-xs"
                            type="radio"
                            onChange={() => handleNotifySignChange(true)}
                            checked={isNotifyOnSignatures === true}
                          />
                          <div className="text-[13px] cursor-default capitalize">
                            {t("yes")}
                          </div>
                        </div>
                        <div className={"flex items-center gap-2 ml-2 mb-1"}>
                          <input
                            className="mr-[2px] op-radio op-radio-xs"
                            type="radio"
                            onChange={() => handleNotifySignChange(false)}
                            checked={isNotifyOnSignatures === false}
                          />
                          <div className="text-[13px] cursor-default capitalize">
                            {t("no")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-[0.75rem]">
                      <TimezoneSelector
                        timezone={timezone}
                        setTimezone={setTimezone}
                      />
                    </div>
                    <div className="mb-[0.75rem] text-[12px]">
                      <label className="block mb-[0.7rem]">
                        <span className="text-[14px] font-medium">
                          {t("send-in-order")}
                        </span>
                        <a
                          data-tooltip-id="sendInOrder-tooltip"
                          className="ml-1"
                        >
                          <sup>
                            <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                          </sup>
                        </a>
                        <ReactTooltip
                          id="sendInOrder-tooltip"
                          className="z-[999]"
                        >
                          <div className="max-w-[200px] md:max-w-[450px]">
                            <p className="font-bold">{t("send-in-order")}</p>
                            <p>{t("send-in-order-help.p1")}</p>
                            <p className="p-[5px]">
                              <ol className="list-disc">
                                <li>
                                  <span className="font-bold">
                                    {t("yes")}:{" "}
                                  </span>
                                  <span>{t("send-in-order-help.p2")}</span>
                                </li>
                                <li>
                                  <span className="font-bold">{t("no")}: </span>
                                  <span>{t("send-in-order-help.p3")}</span>
                                </li>
                              </ol>
                            </p>
                            <p>{t("send-in-order-help.p4")}</p>
                          </div>
                        </ReactTooltip>
                      </label>
                      <div className="flex flex-col md:flex-row md:gap-4">
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={true}
                            className="op-radio op-radio-xs"
                            name="SendinOrder"
                            checked={sendinOrder}
                            onChange={handleSendinOrderInput}
                          />
                          <div className="text-center">{t("yes")}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={false}
                            name="SendinOrder"
                            className="op-radio op-radio-xs"
                            checked={!sendinOrder}
                            onChange={handleSendinOrderInput}
                          />
                          <div className="text-center">{t("no")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-[0.75rem] text-[12px]">
                      <label className="block mb-[0.7rem]">
                        <span className="text-[14px] font-medium">
                          {t("enable-tour")}
                        </span>
                        <a
                          data-tooltip-id="istourenabled-tooltip"
                          className="ml-1"
                        >
                          <sup>
                            <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                          </sup>
                        </a>
                        <ReactTooltip
                          id="istourenabled-tooltip"
                          className="z-[999]"
                        >
                          <div className="max-w-[200px] md:max-w-[450px]">
                            <p className="font-bold">{t("enable-tour")}</p>
                            <p className="p-[5px]">
                              <ol className="list-disc">
                                <li>
                                  <span className="font-bold">
                                    {t("yes")}:{" "}
                                  </span>
                                  <span>{t("istourenabled-help.p1")}</span>
                                </li>
                                <li>
                                  <span className="font-bold">{t("no")}: </span>
                                  <span>{t("istourenabled-help.p2")}</span>
                                </li>
                              </ol>
                            </p>
                            <p>
                              {t("istourenabled-help.p3", {
                                appName: appName
                              })}
                            </p>
                          </div>
                        </ReactTooltip>
                      </label>
                      <div className="flex flex-col md:flex-row md:gap-4">
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={true}
                            className="op-radio op-radio-xs"
                            name="IsTourEnabled"
                            checked={isTourEnabled}
                            onChange={handleTourInput}
                          />
                          <div className="text-center">{t("yes")}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={false}
                            name="IsTourEnabled"
                            className="op-radio op-radio-xs"
                            checked={!isTourEnabled}
                            onChange={handleTourInput}
                          />
                          <div className="text-center">{t("no")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-[0.75rem]">
                      <button
                        className="op-btn op-btn-primary w-[110px]"
                        onClick={handleSave}
                      >
                        {t("save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col mx-4 mb-4">
                    <div className="flex flex-col">
                      <h1 className="text-[14px] mb-[0.7rem] font-medium">
                        {t("request-email")}
                      </h1>
                      <div className="relative mt-2 mb-4">
                        <form
                          onSubmit={handleSaveRequestEmail}
                          className="p-3 border-[1px] border-base-content rounded-box"
                        >
                          <div className="text-lg font-normal">
                            <label className="text-sm">
                              {t("subject")}
                              <Tooltip
                                id={"request-sub-tooltip"}
                                message={`${t(
                                  "variables-use"
                                )}: {{sender_name}} {{document_title}}`}
                              />
                            </label>
                            <input
                              required
                              value={requestSubject}
                              onChange={(e) =>
                                setRequestSubject(e.target.value)
                              }
                              placeholder={`{{sender_name}} ${t(
                                "send-to-sign"
                              )} {{document_title}}`}
                              className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                            />
                          </div>
                          <div className="text-lg font-normal py-2">
                            <label className="text-sm mt-3">
                              {t("body")}
                              <Tooltip
                                id={"request-body-tooltip"}
                                message={`${t(
                                  "variables-use"
                                )}: {{sender_name}} {{document_title}}`}
                              />
                            </label>
                            <EditorToolbar containerId="toolbar1" />
                            <ReactQuill
                              theme="snow"
                              value={requestBody}
                              placeholder="add body of email"
                              // onChangeSelection={handleTextSelection} // Listen for text selection
                              ref={editorRef}
                              modules={module1}
                              formats={formats}
                              onChange={handleOnchangeRequest}
                            />
                          </div>
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              disabled={!requestBody || !requestSubject}
                              className="op-btn op-btn-primary"
                              type="submit"
                            >
                              {t("save")}
                            </button>
                            <button
                              type="button"
                              className="op-btn op-btn-secondary"
                              onClick={() => handleReset("request")}
                            >
                              {t("reset")}
                            </button>
                          </div>
                        </form>
                      </div>
                      <h1 className="text-[14px] mb-[0.7rem] font-medium">
                        {t("completion-email")}
                      </h1>
                      <div className="relative my-2">
                        <form
                          onSubmit={handleSaveCompletionEmail}
                          className="p-3 border-[1px] border-base-content rounded-box"
                        >
                          <div className="text-lg font-normal">
                            <label className="text-sm">
                              {t("subject")}
                              <Tooltip
                                id={"complete-sub-tooltip"}
                                message={`${t(
                                  "variables-use"
                                )}:{{sender_name}} {{document_title}}`}
                              />
                            </label>
                            <input
                              required
                              value={completionsubject}
                              onChange={(e) =>
                                setCompletionSubject(e.target.value)
                              }
                              placeholder={`{{sender_name}}  ${t(
                                "send-to-sign"
                              )} {{document_title}}`}
                              className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                            />
                          </div>
                          <div className="text-lg font-normal py-2">
                            <label className="text-sm mt-3">
                              {t("body")}
                              <Tooltip
                                id={"complete-body-tooltip"}
                                message={`${t(
                                  "variables-use"
                                )}:{{sender_name}} {{document_title}} {{signing_url}}`}
                              />
                            </label>
                            <EditorToolbar containerId="toolbar2" />
                            <ReactQuill
                              theme="snow"
                              value={completionBody}
                              placeholder="add body of email "
                              // onChangeSelection={handleTextSelection} // Listen for text selection
                              ref={editorRefCom}
                              modules={module2}
                              formats={formats}
                              onChange={handleOnchangeCompletion}
                            />
                          </div>
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              disabled={!completionBody || !completionsubject}
                              className="op-btn op-btn-primary"
                              type="submit"
                            >
                              {t("save")}
                            </button>
                            <button
                              type="button"
                              className="op-btn op-btn-secondary"
                              onClick={() => handleReset(null, "completion")}
                            >
                              {t("reset")}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};
export default Preferences;
