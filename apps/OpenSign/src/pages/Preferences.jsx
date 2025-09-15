import React, { useEffect, useState, useRef } from "react";
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
import ReactQuill from "react-quill-new";
import "../styles/quill.css";
import EditorToolbar, {
  module1,
  module2,
  formats
} from "../components/pdf/EditorToolbar";
import TimezoneSelector from "../components/preferences/TimezoneSelector";
import DateFormatSelector from "../components/preferences/DateFormatSelector";
import FilenameFormatSelector from "../components/preferences/FilenameFormatSelector";

const Preferences = () => {
  const appName =
    "OpenSign™";
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
  const generaltab = {
    name: "general",
    title: t("general"),
    icon: "fa-light fa-gears"
  };
  const [tab, setTab] = useState([generaltab]);
  const [sendinOrder, setSendinOrder] = useState(true);
  const [isTourEnabled, setIsTourEnabled] = useState(false);
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [is12HourTime, setIs12HourTime] = useState(false);
  const [isLTVEnabled, setIsLTVEnabled] = useState(false);
  const [isDefaultMail, setIsDefaultMail] = useState({
    requestMail: false,
    completionMail: false
  });
  const [fileNameFormat, setFileNameFormat] = useState("DOCNAME");

  useEffect(() => {
    fetchSignType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSignType = async () => {
    setIsTopLoader(true);
    const EmailTab =
      extClass?.[0]?.UserRole === "contracts_Admin"
        ? [{ name: "email", title: t("email"), icon: "fa-light fa-envelope" }]
        : [];
    const arr = [
      generaltab,
      ...EmailTab,
    ];
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
        const DateFormat =
          _getUser?.DateFormat !== undefined
            ? _getUser?.DateFormat
            : "MM/DD/YYYY";
        setDateFormat(DateFormat);
        const is12Hr =
          _getUser?.Is12HourTime !== undefined ? _getUser?.Is12HourTime : false;
        setIs12HourTime(is12Hr);
        const isLTVEnabled =
          _getUser?.IsLTVEnabled !== undefined ? _getUser?.IsLTVEnabled : false;
        setIsLTVEnabled(isLTVEnabled);
        const downloadFilenameFormat =
          _getUser?.DownloadFilenameFormat || "DOCNAME";
        setFileNameFormat(downloadFilenameFormat);
      }
    } catch (err) {
      console.log("err while getting user details", err);
      setErrMsg(t("something-went-wrong-mssg"));
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
          setIsLoader(false);
          setTimeout(() => setIsAlert({ type: "success", msg: "" }), 2000);
          return;
        } else if (isDefaultSignTypeOnly) {
          setIsAlert({
            type: "danger",
            msg: t("expect-default-one-signature-type")
          });
          setIsLoader(false);
          setTimeout(() => setIsAlert({ type: "success", msg: "" }), 2000);
          return;
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
          IsTourEnabled: isTourEnabled,
          DateFormat: dateFormat,
          Is12HourTime: is12HourTime,
          IsLTVEnabled: isLTVEnabled,
          DownloadFilenameFormat: fileNameFormat,
        };
        const updateRes = await Parse.Cloud.run("updatepreferences", params);
        if (updateRes) {
          setIsAlert({ type: "success", msg: t("saved-successfully") });
          let extUser =
            localStorage.getItem("Extand_Class") &&
            JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
          if (extUser && extUser?.objectId) {
            extUser.NotifyOnSignatures = isNotifyOnSignatures;
            extUser.SendinOrder = sendinOrder;
            extUser.IsTourEnabled = isTourEnabled;
            extUser.DateFormat = dateFormat;
            extUser.Is12HourTime = is12HourTime;
            extUser.DownloadFilenameFormat = fileNameFormat;
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
      alert(t("user-not-exist"));
    } else if (tenantRes) {
      setIsLoader(true);
      const updateRes = tenantRes;
      setTenantId(updateRes?.objectId);
      const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
      if (updateRes?.RequestBody) {
        setRequestBody(updateRes?.RequestBody);
        setRequestSubject(updateRes?.RequestSubject);
      } else {
        setRequestBody(defaultRequestBody);
        setRequestSubject(
          `{{sender_name}} has requested you to sign {{document_title}}`
        );
        setIsDefaultMail((prev) => ({ ...prev, requestMail: true }));
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
        setIsDefaultMail((prev) => ({ ...prev, completionMail: true }));
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
      const updateTenant = await Parse.Cloud.run("updatetenant", {
        tenantId: tenantId,
        details: {
          CompletionBody: htmlBody,
          CompletionSubject: completionsubject
        }
      });
      if (updateTenant) {
        const updateRes = JSON.parse(JSON.stringify(updateTenant));
        SetCompletionBody(updateRes?.CompletionBody);
        setCompletionSubject(updateRes?.CompletionSubject);
        setIsAlert({ type: "success", msg: t("saved-successfully") });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.log("Err", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
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
      const updateTenant = await Parse.Cloud.run("updatetenant", {
        tenantId: tenantId,
        details: {
          RequestBody: htmlBody,
          RequestSubject: requestSubject
        }
      });
      if (updateTenant) {
        const updateRes = JSON.parse(JSON.stringify(updateTenant));
        setRequestBody(updateRes?.RequestBody);
        setRequestSubject(updateRes?.RequestSubject);
        let extUser =
          localStorage.getItem("Extand_Class") &&
          JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
        if (extUser && extUser?.objectId) {
          extUser.TenantId.RequestBody = updateRes?.RequestBody;
          extUser.TenantId.RequestSubject = updateRes?.RequestSubject;
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
        }
        setIsAlert({ type: "success", msg: t("saved-successfully") });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.log("Err", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    } finally {
      setIsLoader(false);
    }
  };

  //function to use reset form
  const handleReset = async (request, completion) => {
    let extUser =
      localStorage.getItem("Extand_Class") &&
      JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    handleModifyMail(request);
    if (request && !isDefaultMail?.requestMail) {
      setRequestBody(defaultReqHtml?.body);
      setRequestSubject(defaultReqHtml?.subject);
      try {
        await Parse.Cloud.run("updatetenant", {
          tenantId: tenantId,
          details: { RequestBody: "", RequestSubject: "" }
        });
        if (extUser && extUser?.objectId) {
          extUser.TenantId.RequestBody = "";
          extUser.TenantId.RequestSubject = "";
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
        }
      } catch (err) {
        console.log("Err in reseting request mail", err);
      }
    } else if (completion && !isDefaultMail?.completionMail) {
      setCompletionSubject(defaultCompHtml?.subject);
      SetCompletionBody(defaultCompHtml?.body);
      try {
        await Parse.Cloud.run("updatetenant", {
          tenantId: tenantId,
          details: { CompletionBody: "", CompletionSubject: "" }
        });
        if (extUser && extUser?.objectId) {
          extUser.TenantId.CompletionBody = "";
          extUser.TenantId.CompletionSubject = "";
          const _extUser = JSON.parse(JSON.stringify(extUser));
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
        }
      } catch (err) {
        console.log("Err in reseting completion mail", err);
      }
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
  const tabName = (ind) => tab.find((t, i) => i === ind)?.name;
  const handleModifyMail = (mode) => {
    mode === "request"
      ? setIsDefaultMail((p) => ({ ...p, requestMail: !p?.requestMail }))
      : setIsDefaultMail((p) => ({ ...p, completionMail: !p?.completionMail }));
  };
  return (
    <React.Fragment>
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
              <h1 className="ml-4 mt-3 text-lg mb-2 font-semibold text-base-content">
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
                      className={`${activeTab === ind ? "op-tab-active" : ""} op-tab text-xs md:text-base pb-2 md:pb-0 transition-all `}
                      aria-selected={activeTab === ind}
                      aria-controls={`panel-${tabData.title}`}
                    >
                      <i className={tabData.icon}></i>
                      <span className="ml-1 md:ml-2">{tabData.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                id="panel-general"
                className="px-6 pt-4 pb-6"
                aria-labelledby="tab-general"
                role="tabpanel"
              >
                {tabName(activeTab) === "general" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 md:gap-x-8">
                    {/* Left Column - Signature Settings */}
                    <div className="md:col-span-5 flex flex-col">
                      {/* Signature Types Section */}
                      <div className="mb-6">
                        <label
                          className="text-[14px] mb-[0.7rem] font-medium"
                          htmlFor="signaturetype"
                        >
                          {t("allowed-signature-types")}
                          <a
                            data-tooltip-id="signtypes-tooltip"
                            className="ml-1"
                          >
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
                              <div className="p-[5px] ml-2">
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
                              </div>
                            </div>
                          </ReactTooltip>
                        </label>
                        <div className="flex flex-col md:flex-row gap-3 mb-2">
                          {signatureType.map((type, i) => (
                            <div
                              key={i}
                              className="flex flex-row gap-2 items-center"
                            >
                              <input
                                className="op-checkbox op-checkbox-xs"
                                type="checkbox"
                                id={`signature-type-${type.name}`}
                                name="signaturetype"
                                onChange={() => handleCheckboxChange(i)}
                                checked={type.enabled}
                              />
                              <label
                                htmlFor={`signature-type-${type.name}`}
                                className="text-sm font-medium text-base-content hover:underline underline-offset-2 cursor-pointer capitalize mb-0"
                                title={`Enabling this allows signers to ${type.name} signature`}
                              >
                                {type?.name === "typed" ? "type" : type?.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notify on Signatures Section */}
                      <div className="mb-6">
                        <label className="text-[14px] mb-[0.7rem] font-medium">
                          {t("notify-on-signatures")}
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
                        <div className="flex flex-row gap-6">
                          <div
                            className={
                              "flex items-center gap-2"
                            }
                          >
                            <input
                              id="notify-yes"
                              className="op-radio op-radio-xs"
                              type="radio"
                              onChange={() => handleNotifySignChange(true)}
                              checked={isNotifyOnSignatures === true}
                            />
                            <label
                              htmlFor="notify-yes"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("yes")}
                            </label>
                          </div>
                          <div
                            className={
                              "flex items-center gap-2"
                            }
                          >
                            <input
                              id="notify-no"
                              className="op-radio op-radio-xs"
                              type="radio"
                              onChange={() => handleNotifySignChange(false)}
                              checked={isNotifyOnSignatures === false}
                            />
                            <label
                              htmlFor="notify-no"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("no")}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Send in Order Section */}
                      <div className="mb-6">
                        <label className="text-[14px] mb-[0.7rem] font-medium">
                          {t("send-in-order")}
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
                              <div className="p-[5px]">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("yes")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p2")}</span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("no")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p3")}</span>
                                  </li>
                                </ol>
                              </div>
                              <p>{t("send-in-order-help.p4")}</p>
                            </div>
                          </ReactTooltip>
                        </label>
                        <div className="flex flex-row gap-6">
                          <div className="flex items-center gap-2">
                            <input
                              id="order-yes"
                              type="radio"
                              value={true}
                              className="op-radio op-radio-xs"
                              name="SendinOrder"
                              checked={sendinOrder}
                              onChange={handleSendinOrderInput}
                            />
                            <label
                              htmlFor="order-yes"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("yes")}
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="order-no"
                              type="radio"
                              value={false}
                              name="SendinOrder"
                              className="op-radio op-radio-xs"
                              checked={!sendinOrder}
                              onChange={handleSendinOrderInput}
                            />
                            <label
                              htmlFor="order-no"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("no")}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Enable Tour Section */}
                      <div className="mb-6">
                        <label className="text-[14px] mb-[0.7rem] font-medium">
                          {t("enable-tour")}
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
                              <div className="p-[5px]">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("yes")}:{" "}
                                    </span>
                                    <span>{t("istourenabled-help.p1")}</span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("no")}:{" "}
                                    </span>
                                    <span>{t("istourenabled-help.p2")}</span>
                                  </li>
                                </ol>
                              </div>
                              <p>
                                {t("istourenabled-help.p3", {
                                  appName: appName
                                })}
                              </p>
                            </div>
                          </ReactTooltip>
                        </label>
                        <div className="flex flex-row gap-6">
                          <div className="flex items-center gap-2">
                            <input
                              id="tour-yes"
                              type="radio"
                              value={true}
                              className="op-radio op-radio-xs"
                              name="IsTourEnabled"
                              checked={isTourEnabled}
                              onChange={handleTourInput}
                            />
                            <label
                              htmlFor="tour-yes"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("yes")}
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="tour-no"
                              type="radio"
                              value={false}
                              name="IsTourEnabled"
                              className="op-radio op-radio-xs"
                              checked={!isTourEnabled}
                              onChange={handleTourInput}
                            />
                            <label
                              htmlFor="tour-no"
                              className="text-sm text-base-content cursor-pointer mb-0"
                            >
                              {t("no")}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Right Column - Timezone & Date Settings */}
                    <div className="md:col-span-7 flex flex-col">
                      <div className="mb-6">
                        <TimezoneSelector
                          timezone={timezone}
                          setTimezone={setTimezone}
                        />
                      </div>

                      <div className="mb-6">
                        <DateFormatSelector
                          timezone={timezone}
                          dateFormat={dateFormat}
                          is12HourTime={is12HourTime}
                          setIs12HourTime={setIs12HourTime}
                          setDateFormat={setDateFormat}
                        />
                      </div>
                      <div className="mb-6">
                        <FilenameFormatSelector
                          fileNameFormat={fileNameFormat}
                          setFileNameFormat={setFileNameFormat}
                        />
                      </div>
                    </div>
                    {/* Save Button - Full Width */}
                    <div className="md:col-span-12 flex justify-start mt-2">
                      <button
                        className="op-btn op-btn-primary w-[110px]"
                        onClick={handleSave}
                      >
                        {t("save")}
                      </button>
                    </div>
                  </div>
                )}
                {tabName(activeTab) === "email" && (
                  <div className="flex flex-col mb-4">
                    <div className="flex flex-col">
                      <h1 className="text-[14px] mb-[0.7rem] font-medium">
                        {t("request-email")}
                      </h1>
                      <div className="relative mt-2 mb-4">
                        {
                            isDefaultMail?.requestMail && (
                              <div className="absolute backdrop-blur-[2px] flex w-full h-full justify-center items-center bg-black/10 rounded-box select-none z-20">
                                <button
                                  onClick={() => handleModifyMail("request")}
                                  className="op-btn op-btn-primary shadow-lg"
                                >
                                  {t("modify")}
                                </button>
                              </div>
                            )
                        }
                        <form
                          onSubmit={handleSaveRequestEmail}
                          className="p-3 border-[1px] border-base-content rounded-box"
                        >
                          <div className="text-lg font-normal">
                            <label className="text-sm">
                              {t("subject")}{" "}
                              <Tooltip
                                id={"request-sub-tooltip"}
                                message={`${t("variables-use")}: {{sender_name}} {{document_title}}`}
                              />
                            </label>
                            <input
                              required
                              value={requestSubject}
                              onChange={(e) =>
                                setRequestSubject(e.target.value)
                              }
                              placeholder={`{{sender_name}} ${t("send-to-sign")} {{document_title}}`}
                              className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                            />
                          </div>
                          <div className="text-lg font-normal py-2">
                            <label className="text-sm mt-3">
                              {t("body")}{" "}
                              <Tooltip
                                id={"request-body-tooltip"}
                                message={`${t("variables-use")}: {{sender_name}} {{document_title}}`}
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
                        {
                            isDefaultMail?.completionMail && (
                              <div className="absolute backdrop-blur-[2px] flex w-full h-full justify-center items-center bg-black/10 rounded-box select-none z-20">
                                <button
                                  onClick={() => handleModifyMail("completion")}
                                  className="op-btn op-btn-primary shadow-lg"
                                >
                                  {t("modify")}
                                </button>
                              </div>
                            )
                        }
                        <form
                          onSubmit={handleSaveCompletionEmail}
                          className="p-3 border-[1px] border-base-content rounded-box"
                        >
                          <div className="text-lg font-normal">
                            <label className="text-sm">
                              {t("subject")}{" "}
                              <Tooltip
                                id={"complete-sub-tooltip"}
                                message={`${t("variables-use")}:{{sender_name}} {{document_title}}`}
                              />
                            </label>
                            <input
                              required
                              value={completionsubject}
                              onChange={(e) =>
                                setCompletionSubject(e.target.value)
                              }
                              placeholder={`{{sender_name}}  ${t("send-to-sign")} {{document_title}}`}
                              className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                            />
                          </div>
                          <div className="text-lg font-normal py-2">
                            <label className="text-sm mt-3">
                              {t("body")}{" "}
                              <Tooltip
                                id={"complete-body-tooltip"}
                                message={`${t("variables-use")}:{{sender_name}} {{document_title}} {{signing_url}}`}
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
                {tabName(activeTab) === "security" && (
                  <>
                  </>
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
