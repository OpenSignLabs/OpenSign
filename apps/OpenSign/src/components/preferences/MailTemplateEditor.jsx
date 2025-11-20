import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import ReactQuill from "react-quill-new";
import "../../styles/quill.css";
import EditorToolbar, { module1, module2, formats } from "../pdf/EditorToolbar";
import Tooltip from "../../primitives/Tooltip";
import Alert from "../../primitives/Alert";
import Loader from "../../primitives/Loader";

const MailTemplateEditor = ({
  info,
  tenantId,
}) => {
  const appName = localStorage.getItem("appname") || "OpenSign™";
  const { t } = useTranslation();
  const editorRef = useRef();
  const editorRefCom = useRef();
  const [requestBody, setRequestBody] = useState("");
  const [requestSubject, setRequestSubject] = useState("");
  const [completionBody, setCompletionBody] = useState("");
  const [completionSubject, setCompletionSubject] = useState("");
  const [isDefaultMail, setIsDefaultMail] = useState({
    requestMail: false,
    completionMail: false
  });
  const [isMailLoader, setIsMailLoader] = useState({
    request: false,
    completion: false
  });
  const [isalert, setIsAlert] = useState({ type: "success", msg: "" });
  const defaultRequestSubject = `{{sender_name}} has requested you to sign {{document_title}}`;
  const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
  const defaultCompletionSubject = `Document {{document_title}} has been signed by all parties`;
  const defaultCompletionBody = `<p>Hi {{sender_name}},</p><br><p>All parties have successfully signed the document {{document_title}}. Kindly download the document from the attachment.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
  const cloudfunction =
        "updatetenant";

  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    info
  ]);

  const handleModifyMail = (mode) => {
    mode === "request"
      ? setIsDefaultMail((p) => ({ ...p, requestMail: !p?.requestMail }))
      : setIsDefaultMail((p) => ({ ...p, completionMail: !p?.completionMail }));
  };
  const fetchSubscription = async () => {
      await tenantEmailTemplate(info);
  };

  const tenantEmailTemplate = async (tenantRes) => {
    if (tenantRes === "user does not exist!") {
      alert(t("user-not-exist"));
    } else if (tenantRes) {
      const updateRes = tenantRes;
      const defaultRequestBody = `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process, please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br>`;
      if (updateRes?.RequestBody) {
        setRequestBody(updateRes?.RequestBody);
        setRequestSubject(updateRes?.RequestSubject);
        setIsDefaultMail((prev) => ({ ...prev, requestMail: false }));
      } else {
        setRequestBody(defaultRequestBody);
        setRequestSubject(defaultRequestSubject);
        setIsDefaultMail((prev) => ({ ...prev, requestMail: true }));
      }
      if (updateRes?.CompletionBody) {
        setCompletionBody(updateRes?.CompletionBody);
        setCompletionSubject(updateRes?.CompletionSubject);
        setIsDefaultMail((prev) => ({ ...prev, completionMail: false }));
      } else {
        setCompletionBody(defaultCompletionBody);
        setCompletionSubject(defaultCompletionSubject);
        setIsDefaultMail((prev) => ({ ...prev, completionMail: true }));
      }
    }
  };
  //function to save completion email template
  const handleSaveCompletionEmail = async (e) => {
    e.preventDefault();
    try {
      const replacedHtmlBody = completionBody.replace(/"/g, "'");
      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const updateTenant = await Parse.Cloud.run(cloudfunction, {
        tenantId: tenantId,
        details: {
          CompletionBody: htmlBody,
          CompletionSubject: completionSubject
        }
      });
      if (updateTenant) {
        const updateRes = JSON.parse(JSON.stringify(updateTenant));
        setCompletionBody(updateRes?.CompletionBody);
        setCompletionSubject(updateRes?.CompletionSubject);
        setIsAlert({ type: "success", msg: t("saved-successfully") });
        setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
      }
    } catch (err) {
      console.error("Error while saving completion email template: ", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    }
  };
  //function to save request email template
  const handleSaveRequestEmail = async (e) => {
    e.preventDefault();
    try {
      const replacedHtmlBody = requestBody.replace(/"/g, "'");
      const htmlBody = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>${replacedHtmlBody}</body></html>`;
      const updateTenant = await Parse.Cloud.run(cloudfunction, {
        tenantId: tenantId,
        details: { RequestBody: htmlBody, RequestSubject: requestSubject }
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
      console.error("Error while saving request email template: ", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      setTimeout(() => setIsAlert({ type: "", msg: "" }), 1500);
    }
  };

  //function to use reset form
  const handleReset = async (request, completion) => {
    let extUser =
      localStorage.getItem("Extand_Class") &&
      JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    handleModifyMail(request);
    if (request && !isDefaultMail?.requestMail) {
      setRequestBody(defaultRequestBody);
      setRequestSubject(defaultRequestSubject);
      setIsMailLoader((p) => ({ ...p, request: true }));
      try {
        await Parse.Cloud.run(cloudfunction, {
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
        console.error("Error while resetting request mail: ", err);
      } finally {
        setIsMailLoader((p) => ({ ...p, request: false }));
      }
    } else if (completion && !isDefaultMail?.completionMail) {
      setCompletionSubject(defaultCompletionSubject);
      setCompletionBody(defaultCompletionBody);
      setIsMailLoader((p) => ({ ...p, completion: true }));
      try {
        await Parse.Cloud.run(cloudfunction, {
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
        console.error("Error while resetting completion mail: ", err);
      } finally {
        setIsMailLoader((p) => ({ ...p, completion: false }));
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
      setCompletionBody(html);
    }
  };
  return (
    <>
      {isalert.msg && <Alert type={isalert.type}>{isalert.msg}</Alert>}
      <div className="flex flex-col mb-4">
        <div className="flex flex-col">
          <h1 className="text-[14px] mb-[0.7rem] font-medium">
            {t("request-email")}
          </h1>
          <div className="relative mt-2 mb-4">
            {isMailLoader.request && (
              <div className="flex z-[100] justify-center items-center absolute w-full h-full rounded-box bg-black/30">
                <Loader />
              </div>
            )}
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
                  onChange={(e) => setRequestSubject(e.target.value)}
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
            {isMailLoader.completion && (
              <div className="flex z-[100] justify-center items-center absolute w-full h-full rounded-box bg-black/30">
                <Loader />
              </div>
            )}
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
                  value={completionSubject}
                  onChange={(e) => setCompletionSubject(e.target.value)}
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
                  placeholder="add body of email"
                  ref={editorRefCom}
                  modules={module2}
                  formats={formats}
                  onChange={handleOnchangeCompletion}
                />
              </div>
              <div className="flex items-center mt-3 gap-2">
                <button
                  disabled={!completionBody || !completionSubject}
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
    </>
  );
};
export default MailTemplateEditor;
