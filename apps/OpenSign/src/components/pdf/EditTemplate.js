import React, {
  useState,
} from "react";
import {
  getFileName
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import SignersInput from "../shared/fields/SignersInput";

const EditTemplate = ({
  template,
  onSuccess,
}) => {
  const { t } = useTranslation();
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
    AllowModifications: template?.AllowModifications || false
  });

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (formData.RedirectUrl && !isValidURL(formData?.RedirectUrl)) {
      alert(t("invalid-redirect-url"));
      return;
    }
    const isChecked = formData.SendinOrder === "true" ? true : false;
    const isTourEnabled = formData?.IsTourEnabled === "false" ? false : true;
    const AutoReminder = formData?.AutomaticReminders || false;
    const IsEnableOTP = formData.IsEnableOTP === "true" ? true : false;
    const allowModify = formData?.AllowModifications || false;
    let reminderDate = {};
    if (AutoReminder) {
      const RemindOnceInEvery = parseInt(formData?.RemindOnceInEvery);
      const ReminderDate = new Date(template?.createdAt);
      ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
      reminderDate = { NextReminderDate: ReminderDate };
    }
    const data = {
      ...formData,
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
    setFormData((obj) => ({ ...obj, NotifyOnSignatures: value }));
  };
  const handleBcc = (data) => {
    if (data && data.length > 0) {
      const trimEmail = data.map((item) => ({
        objectId: item?.value,
        Name: item?.label,
        Email: item?.email
      }));
      setFormData((prev) => ({ ...prev, Bcc: trimEmail }));
    }
  };
  return (
    <div className="max-h-[300px] md:max-h-[400px] overflow-y-scroll p-[10px]">
      <div className="text-base-content">
        <form onSubmit={handleSubmit}>
          <div className="mb-[0.35rem]">
            <label htmlFor="name" className="text-[13px]">
              {t("report-heading.File")}
            </label>
            <div className="op-input op-input-bordered op-input-sm focus:outline-none py-2 font-semibold w-full text-xs">
              {getFileName(template.URL)}
            </div>
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
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
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
                  <p className="p-[5px]">
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
                  </p>
                  <p>{t("istourenabled-help.p3")}</p>
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
            <label
            >
              {t("notify-on-signatures")}
              <a data-tooltip-id="nos-tooltip" className="ml-1">
                <sup>
                  <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                </sup>
              </a>
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
                  "flex items-center gap-2 ml-2 mb-1"
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
                  "flex items-center gap-2 ml-2 mb-1"
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
            />
          </div>
          <div className="text-xs mt-2">
            <label className="block">Redirect Url</label>
            <input
              name="RedirectUrl"
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              value={formData.RedirectUrl}
              onChange={handleStrInput}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
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
  );
};

export default EditTemplate;
