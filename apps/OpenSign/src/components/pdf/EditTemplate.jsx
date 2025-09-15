import {
  useState,
  useRef,
} from "react";
import {
  base64ToArrayBuffer,
  convertBase64ToFile,
  generatePdfName,
  getFileName
} from "../../constant/Utils";
import {
  maxDescriptionLength,
  maxNoteLength,
  maxTitleLength
} from "../../constant/const";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import SignersInput from "../shared/fields/SignersInput";
import { PDFDocument } from "pdf-lib";
import ModalUi from "../../primitives/ModalUi";
import { SaveFileSize } from "../../constant/saveFileSize";

const EditTemplate = ({
  title,
  handleClose,
  pdfbase64,
  template,
  onSuccess,
  setPdfArrayBuffer,
  setPdfBase64Url,
  isAddYourSelfCheckbox,
}) => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const inputFileRef = useRef(null);
  const [formData, setFormData] = useState({
    Name: template?.Name || "",
    Note: template?.Note || "",
    Description: template?.Description || "",
    SendinOrder: template?.SendinOrder ? `${template?.SendinOrder}` : "false",
    AutomaticReminders: template?.AutomaticReminders || false,
    RemindOnceInEvery: template?.RemindOnceInEvery || 5,
    IsEnableOTP: template?.IsEnableOTP ? `${template?.IsEnableOTP}` : "false",
    IsTourEnabled: template?.IsTourEnabled
      ? `${template?.IsTourEnabled}`
      : "false",
    NotifyOnSignatures:
      template?.NotifyOnSignatures !== undefined
        ? template?.NotifyOnSignatures
        : false,
    Bcc: template?.Bcc,
    RedirectUrl: template?.RedirectUrl || "",
    AllowModifications: template?.AllowModifications || false,
    TimeToCompleteDays: template?.TimeToCompleteDays || 15,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadPdf, setUploadPdf] = useState({
    name: "",
    base64: "",
    url: ""
  });
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type === "application/pdf") {
      handleReplaceFileValdition(file);
      // You can handle the file here
    } else {
      alert(t("only-pdf-allowed"));
      if (inputFileRef.current) inputFileRef.current.value = "";
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // `isValidURL` is used to check valid webhook url
  function isValidURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
      return false;
    }
  }

  const handleStrInput = (e) => {
    setIsUpdate(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const getPdfMetadataHash = async (pdfBytes) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const metaString = pages
      .map((page, index) => {
        const { width, height } = page.getSize();
        return `${index + 1}:${Math.round(width)}x${Math.round(height)}`;
      })
      .join("|");
    const encoder = new TextEncoder();
    const data = encoder.encode(metaString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleReplaceFileValdition(file);
  };
  const handleReplaceFileValdition = async (file) => {
    try {
      const basePdfBytes = base64ToArrayBuffer(pdfbase64);
      const expectedHash = await getPdfMetadataHash(basePdfBytes);
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const uploadedPdfBytes = event.target.result;
        const uploadedHash = await getPdfMetadataHash(uploadedPdfBytes);

        if (expectedHash === uploadedHash) {
          const arrayBuffer = uploadedPdfBytes;
          const uint8Array = new Uint8Array(arrayBuffer);
          const binaryString = Array.from(uint8Array)
            .map((b) => String.fromCharCode(b))
            .join("");
          const base64 = btoa(binaryString);
          const pdfName = generatePdfName(16);
          setIsUpdate(true);
          setUploadPdf((prev) => ({ ...prev, name: pdfName, base64: base64 }));
          // alert("✅ PDFs match (based on page number, width, height)");
        } else {
          alert("❌ PDF do NOT match based on page number, width, height");
          if (inputFileRef.current) inputFileRef.current.value = "";
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      alert("Error: " + err.message);
      if (inputFileRef.current) inputFileRef.current.value = "";
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (formData.RedirectUrl && !isValidURL(formData?.RedirectUrl)) {
      alert(t("invalid-redirect-url"));
      return;
    }
    if (formData?.Name?.length > maxTitleLength) {
      alert(t("title-length-alert"));
      return;
    }
    if (formData?.Note?.length > maxNoteLength) {
      alert(t("note-length-alert"));
      return;
    }
    if (formData?.Description?.length > maxDescriptionLength) {
      alert(t("description-length-alert"));
      return;
    }
    let pdfUrl;
    if (uploadPdf?.base64) {
      pdfUrl = await convertBase64ToFile(
        uploadPdf.name,
        uploadPdf.base64,
      );
      setUploadPdf((prev) => ({ ...prev, url: pdfUrl }));
      const pdfBuffer = base64ToArrayBuffer(uploadPdf.base64);
      setPdfArrayBuffer && setPdfArrayBuffer(pdfBuffer);
      setPdfBase64Url && setPdfBase64Url(uploadPdf.base64);
      const tenantId =
        localStorage.getItem("TenantId") ||
        template?.ExtUserPtr?.TenantId?.objectId;
      const buffer = atob(uploadPdf.base64);
      const userId = template?.ExtUserPtr?.UserId?.objectId;
      SaveFileSize(buffer.length, pdfUrl, tenantId, userId);
    }
    const isChecked = formData.SendinOrder === "true" ? true : false;
    const isTourEnabled = formData?.IsTourEnabled === "false" ? false : true;
    const AutoReminder = formData?.AutomaticReminders || false;
    const IsEnableOTP = formData.IsEnableOTP === "true" ? true : false;
    const allowModify = formData?.AllowModifications || false;
    let reminderDate = {};
    const remindOnceInEvery = formData?.RemindOnceInEvery;
    const TimeToCompleteDays = parseInt(formData?.TimeToCompleteDays);
    const reminderCount = TimeToCompleteDays / remindOnceInEvery;
    if (AutoReminder && reminderCount > 15) {
      alert(t("only-15-reminder-allowed"));
      return;
    }
    if (AutoReminder) {
      const RemindOnceInEvery = parseInt(formData?.RemindOnceInEvery);
      const ReminderDate = new Date(template?.createdAt);
      ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
      reminderDate = { NextReminderDate: ReminderDate };
    }
    const data = {
      ...formData,
      ...(pdfUrl ? { URL: pdfUrl } : {}),
      SendinOrder: isChecked,
      IsEnableOTP: IsEnableOTP,
      IsTourEnabled: isTourEnabled,
      AllowModifications: allowModify,
      ...reminderDate
    };
    onSuccess(data);
  };

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setIsUpdate(true);
    setFormData((obj) => ({ ...obj, NotifyOnSignatures: value }));
  };
  const handleBcc = (data) => {
    if (data && data.length > 0) {
      const trimEmail = data.map((item) => ({
        objectId: item?.value,
        Name: item?.label,
        Email: item?.email
      }));
      setIsUpdate(true);
      setFormData((prev) => ({ ...prev, Bcc: trimEmail }));
    }
  };

  const handleEditTemplateClose = () => {
    if (isUpdate) {
      setShowConfirm(true);
    } else {
      handleClose();
    }
  };
  const discardChanges = () => {
    setShowConfirm(false);
    handleClose();
  };

  return (
    <ModalUi
      isOpen
      title={isUpdate ? `${title} (unsaved)` : title}
      handleClose={handleEditTemplateClose}
    >
      <ModalUi isOpen={showConfirm} showClose={false}>
        <div className="p-[20px]">
          <p className="text-base font-normal text-base-content py-[5px] md:py-[6px] px-[5px]">
            {t("unsaved-changes-discard-them?")}
          </p>
          <div className="flex items-center mt-2.5 gap-2 md:gap-3 text-white">
            <button
              className="op-btn op-btn-primary px-6"
              onClick={discardChanges}
            >
              {t("yes-discard")}
            </button>
            <button
              className="op-btn op-btn-secondary px-4 md:px-6"
              onClick={() => setShowConfirm(false)}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </ModalUi>
      <div className="max-h-[300px] md:max-h-[400px] overflow-y-scroll p-[10px]">
        <div className="text-base-content">
          <form onSubmit={handleSubmit}>
            <div className="mb-[0.35rem]">
              <label htmlFor="name" className="text-[13px]">
                {t("report-heading.File")}
              </label>
              <div
                className="border-[1.5px] border-dashed border-gray-300 rounded-lg px-4 py-6 text-center text-gray-500 bg-white cursor-pointer hover:border-base-content transition"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => inputFileRef?.current?.click()}
              >
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer text-center mb-0"
                >
                  {t("browse-or-drag-to-replace-existing-file")}
                </label>
              </div>
              <input
                ref={inputFileRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => handleFileInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
              {uploadPdf?.name && (
                <div
                  onClick={() => inputFileRef?.current?.click()}
                  className="mt-2 cursor-pointer op-input op-input-bordered op-input-sm focus:outline-none py-2 font-semibold w-full text-xs"
                >
                  selected:{" "}
                  {uploadPdf?.url
                    ? `${uploadPdf?.name}.pdf`
                    : getFileName(template.URL)}
                </div>
              )}
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="name" className="text-[13px]">
                {t("Title")}
                <span className="text-[13px] text-[red]"> *</span>
              </label>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={(e) => handleStrInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              />
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="Note" className="text-[13px]">
                {t("report-heading.Note")}
              </label>
              <input
                type="text"
                name="Note"
                id="Note"
                value={formData.Note}
                onChange={(e) => handleStrInput(e)}
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              />
            </div>
            <div className="mb-[0.35rem]">
              <label htmlFor="Description" className="text-[13px]">
                {t("description")}
              </label>
              <input
                type="text"
                name="Description"
                id="Description"
                value={formData.Description}
                onChange={(e) => handleStrInput(e)}
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              />
            </div>
            <div className="mb-[0.35rem]">
              <label className="text-[13px]">{t("send-in-order")}</label>
              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex items-center gap-[8px] ml-[8px] mb-[5px]">
                  <input
                    type="radio"
                    value={"true"}
                    className="op-radio op-radio-xs"
                    name="SendinOrder"
                    checked={formData.SendinOrder === "true"}
                    onChange={handleStrInput}
                  />
                  <div className="text-[12px]">{t("yes")}</div>
                </div>
                <div className="flex items-center gap-[8px] ml-[8px] mb-[5px]">
                  <input
                    type="radio"
                    value={"false"}
                    name="SendinOrder"
                    className="op-radio op-radio-xs"
                    checked={formData.SendinOrder === "false"}
                    onChange={handleStrInput}
                  />
                  <div className="text-[12px]">{t("no")}</div>
                </div>
              </div>
            </div>
            <div className="text-xs mt-3">
              <label className="block">
                <span>
                  {t("enable-tour")}
                  <a data-tooltip-id="istourenabled-tooltip" className="ml-1">
                    <sup>
                      <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                    </sup>
                  </a>{" "}
                </span>
                <Tooltip id="istourenabled-tooltip" className="z-50">
                  <div className="max-w-[200px] md:max-w-[450px]">
                    <p className="font-bold">{t("enable-tour")}</p>
                    <div className="p-[5px]">
                      <ol className="list-disc">
                        <li>
                          <span className="font-bold">{t("yes")}: </span>
                          <span>{t("istourenabled-help.p1")}</span>
                        </li>
                        <li>
                          <span className="font-bold">{t("no")}: </span>
                          <span>{t("istourenabled-help.p2")}</span>
                        </li>
                      </ol>
                    </div>
                    <p>{t("istourenabled-help.p3", { appName: appName })}</p>
                  </div>
                </Tooltip>
              </label>
              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex items-center gap-2 ml-2 mb-1">
                  <input
                    type="radio"
                    value={"true"}
                    className="op-radio op-radio-xs"
                    name="IsTourEnabled"
                    checked={formData.IsTourEnabled === "true"}
                    onChange={handleStrInput}
                  />
                  <div className="text-center">{t("yes")}</div>
                </div>
                <div className="flex items-center gap-2 ml-2 mb-1">
                  <input
                    type="radio"
                    value={"false"}
                    name="IsTourEnabled"
                    className="op-radio op-radio-xs"
                    checked={formData.IsTourEnabled === "false"}
                    onChange={handleStrInput}
                  />
                  <div className="text-center">{t("no")}</div>
                </div>
              </div>
            </div>
            <div className="text-xs mt-3">
              <label>
                {t("notify-on-signatures")}
                <a data-tooltip-id="nos-tooltip" className="ml-1">
                  <sup>
                    <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                  </sup>
                </a>{" "}
                <Tooltip id="nos-tooltip" className="z-[999]">
                  <div className="max-w-[200px] md:max-w-[450px] text-[11px]">
                    <p className="font-bold">{t("notify-on-signatures")}</p>
                    <p>{t("notify-on-signatures-help.p1")}</p>
                    <p>{t("notify-on-signatures-help.note")}</p>
                  </div>
                </Tooltip>
              </label>
              <div className="flex flex-col md:flex-row md:gap-4">
                <div
                  className={
                    `flex items-center gap-2 ml-2 mb-1`
                  }
                >
                  <input
                    className="mr-[2px] op-radio op-radio-xs"
                    type="radio"
                    onChange={() => handleNotifySignChange(true)}
                    checked={formData.NotifyOnSignatures === true}
                  />
                  <div className="text-center">{t("yes")}</div>
                </div>
                <div
                  className={
                    `flex items-center gap-2 ml-2 mb-1`
                  }
                >
                  <input
                    className="mr-[2px] op-radio op-radio-xs"
                    type="radio"
                    onChange={() => handleNotifySignChange(false)}
                    checked={formData.NotifyOnSignatures === false}
                  />
                  <div className="text-center">{t("no")}</div>
                </div>
              </div>
            </div>
            <div className="text-xs mt-3">
              <SignersInput
                label={t("Bcc")}
                initialData={template?.Bcc}
                onChange={handleBcc}
                helptextZindex={50}
                helpText={t("bcc-help")}
                isCaptureAllData
                isAddYourSelfCheckbox={isAddYourSelfCheckbox}
              />
            </div>
            <div className="text-xs mt-2">
              <label className="block">{t("redirect-url")}</label>
              <input
                name="RedirectUrl"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                value={formData.RedirectUrl}
                onChange={handleStrInput}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div className="text-xs mt-2">
              <label className="block">
                {t("time-to-complete")}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                type="number"
                name="TimeToCompleteDays"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                value={formData.TimeToCompleteDays}
                onChange={(e) => handleStrInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="mt-[1rem] flex justify-start">
              <button type="submit" className="op-btn op-btn-primary">
                {t("submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalUi>
  );
};

export default EditTemplate;
