import React, { useState, useEffect } from "react";
import "../../styles/AddUser.css";
import { checkIsSubscribed, getFileName } from "../../constant/Utils";
import PremiumAlertHeader from "../../primitives/PremiumAlertHeader";
import Upgrade from "../../primitives/Upgrade";
import { isEnableSubscription } from "../../constant/const";
// import SelectFolder from "../../premitives/SelectFolder";

const EditTemplate = ({ template, onSuccess }) => {
  // const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
  const [formData, setFormData] = useState({
    Name: template?.Name || "",
    Note: template?.Note || "",
    Description: template?.Description || "",
    SendinOrder: template?.SendinOrder ? `${template?.SendinOrder}` : "false",
    AutomaticReminders: template?.AutomaticReminders || false,
    RemindOnceInEvery: template?.RemindOnceInEvery || 5
  });
  const [isSubscribe, setIsSubscribe] = useState(false);
  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchSubscription = async () => {
    if (isEnableSubscription) {
      const getIsSubscribe = await checkIsSubscribed();
      setIsSubscribe(getIsSubscribe);
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
    const AutoReminder = formData?.AutomaticReminders || false;

    let reminderDate = {};
    if (AutoReminder) {
      const RemindOnceInEvery = parseInt(formData?.RemindOnceInEvery);
      const ReminderDate = new Date(template?.createdAt);
      ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
      reminderDate = { NextReminderDate: ReminderDate };
    }
    const data = { ...formData, SendinOrder: isChecked, ...reminderDate };
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
      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" style={{ fontSize: 13 }}>
              File
            </label>
            <div
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: "700"
              }}
            >
              {getFileName(template.URL)}
            </div>
          </div>
          <div className="form-section">
            <label htmlFor="name" style={{ fontSize: 13 }}>
              Name
              <span style={{ color: "red", fontSize: 13 }}> *</span>
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={(e) => handleStrInput(e)}
              required
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label htmlFor="Note" style={{ fontSize: 13 }}>
              Note
            </label>
            <input
              type="text"
              name="Note"
              id="Note"
              value={formData.Note}
              onChange={(e) => handleStrInput(e)}
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label htmlFor="Description" style={{ fontSize: 13 }}>
              Description
            </label>
            <input
              type="text"
              name="Description"
              id="Description"
              value={formData.Description}
              onChange={(e) => handleStrInput(e)}
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label style={{ fontSize: 13 }}>Send In Order</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
                marginBottom: 5
              }}
            >
              <input
                type="radio"
                value={"true"}
                name="SendinOrder"
                checked={formData.SendinOrder === "true"}
                onChange={handleStrInput}
              />
              <div style={{ fontSize: 12 }}>Yes</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
                marginBottom: 5
              }}
            >
              <input
                type="radio"
                value={"false"}
                name="SendinOrder"
                checked={formData.SendinOrder === "false"}
                onChange={handleStrInput}
              />
              <div style={{ fontSize: 12 }}>No</div>
            </div>
          </div>
          <div className="text-xs mt-2">
            {!isEnableSubscription && (
              <PremiumAlertHeader
                message={
                  "Disable Auto reminder is free in beta, this feature will incur a fee later."
                }
              />
            )}
            <span
              className={
                isSubscribe || !isEnableSubscription
                  ? "font-semibold"
                  : "font-semibold text-gray-300"
              }
            >
              Auto reminder{"  "}
              {!isSubscribe && isEnableSubscription && <Upgrade />}
            </span>
            <label
              className={`${
                isSubscribe || !isEnableSubscription
                  ? "cursor-pointer "
                  : "pointer-events-none opacity-50"
              } relative block items-center mb-0`}
            >
              <input
                checked={formData.AutomaticReminders}
                onChange={handleAutoReminder}
                type="checkbox"
                value=""
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-black peer-checked:bg-blue-600 mt-2"></div>
            </label>
          </div>
          {isSubscribe && formData?.AutomaticReminders === true && (
            <div className="text-xs mt-2">
              <label className="block">
                Remind once in every (Days)
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                type="number"
                value={formData.RemindOnceInEvery}
                name="RemindOnceInEvery"
                className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                onChange={handleStrInput}
                required
              />
            </div>
          )}
          {/* <SelectFolder onSuccess={handleFolder} folderCls={"contracts_Template"} /> */}
          <div className="buttoncontainer">
            <button type="submit" className="submitbutton">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplate;
