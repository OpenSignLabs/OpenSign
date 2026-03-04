import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import juice from "juice";
import { Trans, useTranslation } from "react-i18next";

const EmailBodyEditor = ({
  value,
  onChange,
  smallscreen = false,
  bodyName,
  isReset = false,
  isTemplateLoaded
}) => {
  const { t } = useTranslation();
  const [inputHtml, setInputHtml] = useState("");
  const [cleanPreview, setCleanPreview] = useState("");

  useEffect(() => {
    initProcessContent();
  }, [isTemplateLoaded]);

  useEffect(() => {
    if (isReset) {
      initProcessContent(value);
    }
  }, [isReset]);

  const initProcessContent = () => {
    // 1. Sanitize immediately to strip scripts/malicious tags
    const sanitized = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true }, // Ensures basic HTML structure
      ADD_ATTR: ["target"] // Allow links to open in new tabs
    });

    // 2. Inline CSS for email compatibility
    // Note: Juice is fast, but for huge files, you might debounce this
    try {
      const inlined = juice(sanitized);
      setInputHtml(inlined);
      onChange?.(inlined);
      setCleanPreview(inlined);
    } catch (err) {
      onChange?.(sanitized);
      setInputHtml(sanitized); // Fallback if juice fails
      setCleanPreview(sanitized);
    }
  };

  const processContent = (value) => {
    // 1. Sanitize immediately to strip scripts/malicious tags
    const sanitized = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true }, // Ensures basic HTML structure
      ADD_ATTR: ["target"] // Allow links to open in new tabs
    });

    // 2. Inline CSS for email compatibility
    // Note: Juice is fast, but for huge files, you might debounce this
    try {
      const inlined = juice(sanitized);
      setCleanPreview(inlined);
      onChange?.(inlined);
    } catch (err) {
      setCleanPreview(sanitized); // Fallback if juice fails
      onChange?.(sanitized);
    }
  };
  const handleChange = (e) => {
    const value = e.target.value;
    setInputHtml(value);
    processContent(value);
  };

  const screen = smallscreen ? "flex-col" : "flex-col md:flex-row ";
  const template =
    bodyName === "request"
      ? "#sample/requestemail"
      : bodyName === "completion"
        ? "#sample/completionemail"
        : "#";
  return (
    <>
      <p className="text-sm ">
        <Trans i18nKey={"open-email-builder"}>
          {"You can create email template using "}
          <a
            href={`/emailbuilder${template}`}
            target="_blank"
            referrerPolicy="no-referrer"
            className="op-link op-link-primary font-medium"
          >
            email builder
          </a>
          {" platform and copy html code."}
        </Trans>
      </p>
      <div className={`flex ${screen} gap-5`}>
        {/* Editor Pane */}
        <div className="flex flex-1 flex-col mt-2">
          <label>{t("paste-html-here")}:</label>
          <div className="flex-1 mt-1 p-3 text-xs op-textarea op-textarea-bordered min-h-[70vh]">
            <textarea
              className="w-full min-h-[70vh] focus:outline-none"
              value={inputHtml}
              onChange={(e) => handleChange(e)}
              placeholder="<html><body><h1>Hello!</h1></body></html>"
            />
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="flex flex-1 flex-col mt-2">
          <label>{t("preview")}</label>
          <div className="flex-1 mt-1 bg-white border-[1px] op-textarea border-[#ccc] min-h-[70vh]">
            {cleanPreview && (
              <iframe
                title="Safe Preview"
                srcDoc={cleanPreview}
                // SECURITY: sandbox prevents scripts from running even if they slip through
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="w-full min-h-[70vh]"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailBodyEditor;
