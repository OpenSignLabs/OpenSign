import React, { useState, useEffect } from "react";
import { checkIsSubscribed, getFileName } from "../../constant/Utils";
import Upgrade from "../../primitives/Upgrade";
import { isEnableSubscription } from "../../constant/const";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";

// import SelectFolder from "../../premitives/SelectFolder";

const EditTemplate = ({ template, onSuccess }) => {
  const { t } = useTranslation();
  // const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
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
      : "false"
  });
  const [isSubscribe, setIsSubscribe] = useState(false);
  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchSubscription = async () => {
    if (isEnableSubscription) {
      const subscribe = await checkIsSubscribed();
      setIsSubscribe(subscribe.isValid);
    }
  };
  const handleStrInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // const handleFolder = (data) => {
  //   console.log("handleFolder ", data)
  //   setFolder(data);
  // };

  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isChecked = formData.SendinOrder === "true" ? true : false;
    const isTourEnabled = formData?.IsTourEnabled === "false" ? false : true;
    const AutoReminder = formData?.AutomaticReminders || false;
    const IsEnableOTP = formData.IsEnableOTP === "true" ? true : false;
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
      ...reminderDate
    };
    onSuccess(data);
  };
  const handleAutoReminder = () => {
    setFormData((prev) => ({
      ...prev,
      AutomaticReminders: !formData.AutomaticReminders
    }));
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
              {t("name")}
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
          {isEnableSubscription && (
            <div className="text-xs mt-2">
              <span
                className={
                  isSubscribe ? "font-semibold" : "font-semibold text-gray-300"
                }
              >
                {t("auto-reminder")}
                {"  "}
                {!isSubscribe && isEnableSubscription && <Upgrade />}
              </span>
              <label
                className={`${
                  isSubscribe
                    ? "cursor-pointer "
                    : "pointer-events-none opacity-50"
                } relative block items-center mb-0`}
              >
                <input
                  checked={formData.AutomaticReminders}
                  onChange={handleAutoReminder}
                  type="checkbox"
                  className="op-toggle transition-all checked:[--tglbg:#3368ff] checked:bg-white mt-2"
                />
              </label>
            </div>
          )}
          {isSubscribe && formData?.AutomaticReminders === true && (
            <div className="text-xs mt-2">
              <label className="block">
                {t("remind-once")}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                type="number"
                value={formData.RemindOnceInEvery}
                name="RemindOnceInEvery"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                onChange={handleStrInput}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
          )}
          {isEnableSubscription && (
            <div className="text-xs mt-2">
              <label className="block">
                <span className={isSubscribe ? "" : " text-gray-300"}>
                  {t("isenable-otp")}{" "}
                  <a data-tooltip-id="isenableotp-tooltip" className="ml-1">
                    <sup>
                      <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                    </sup>
                  </a>{" "}
                  {!isSubscribe && isEnableSubscription && <Upgrade />}
                </span>
                <Tooltip id="isenableotp-tooltip" className="z-50">
                  <div className="max-w-[200px] md:max-w-[450px]">
                    <p className="font-bold">{t("isenable-otp")}</p>
                    <p>{t("isenable-otp-help.p1")}</p>
                    <p className="p-[5px]">
                      <ol className="list-disc">
                        <li>
                          <span className="font-bold">{t("yes")}: </span>
                          <span>{t("isenable-otp-help.p2")}</span>
                        </li>
                        <li>
                          <span className="font-bold">{t("no")}: </span>
                          <span>{t("isenable-otp-help.p3")}</span>
                        </li>
                      </ol>
                    </p>
                    <p>{t("isenable-otp-help.p4")}</p>
                  </div>
                </Tooltip>
              </label>
              <div
                className={`${
                  isSubscribe ? "" : "pointer-events-none opacity-50"
                } flex items-center gap-2 ml-2 mb-1 `}
              >
                <input
                  type="radio"
                  value={"true"}
                  className="op-radio op-radio-xs"
                  name="IsEnableOTP"
                  checked={formData.IsEnableOTP === "true"}
                  onChange={handleStrInput}
                />
                <div className="text-center">{t("yes")}</div>
              </div>
              <div
                className={`${
                  isSubscribe ? "" : "pointer-events-none opacity-50"
                } flex items-center gap-2 ml-2 mb-1 `}
              >
                <input
                  type="radio"
                  value={"false"}
                  name="IsEnableOTP"
                  className="op-radio op-radio-xs"
                  checked={formData.IsEnableOTP === "false"}
                  onChange={handleStrInput}
                />
                <div className="text-center">{t("no")}</div>
              </div>
            </div>
          )}

          <div className="text-xs mt-2">
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
            <div className={`  flex items-center gap-2 ml-2 mb-1 `}>
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
            <div className={` flex items-center gap-2 ml-2 mb-1 `}>
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
