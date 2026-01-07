import React, { useEffect, useState } from "react";
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
import TimezoneSelector from "../components/preferences/TimezoneSelector";
import DateFormatSelector from "../components/preferences/DateFormatSelector";
import FilenameFormatSelector from "../components/preferences/FilenameFormatSelector";
import axios from "axios";
import { withSessionValidation } from "../utils";
import { WidgetsTab, EmailTab } from "../components/preferences/tabs";
import {
  setUserInfo,
  setTenantInfo,
  setLoader,
  setTopLoader,
  setAlertInfo
} from "../redux/reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";

const Preferences = () => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoader, isTopLoader, alertInfo } = useSelector(
    (state) => state.user
  );
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
  const [fileNameFormat, setFileNameFormat] = useState("DOCNAME");

  useEffect(() => {
    fetchSignType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAlert = (type, msg) => {
    dispatch(setAlertInfo({ type, msg }));
    setTimeout(() => {
      dispatch(setAlertInfo({ type: "success", msg: "" }));
    }, 2000);
  };

  const fetchSignType = withSessionValidation(async () => {
    dispatch(setTopLoader(true));
    const EmailTab = [
      { name: "email", title: t("email"), icon: "fa-light fa-envelope" }
    ];

    const arr = [
      generaltab,
      { name: "widgets", title: t("widgets"), icon: "fa-light fa-list" },
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
      dispatch(setTenantInfo(tenantDetails));
      const signatureType = tenantDetails?.SignatureType || [];
      const tenantSignTypes = signatureType?.filter((x) => x.enabled === true);
      const extUser = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getUserDetails`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      const getUser = extUser?.data?.result;
      if (!getUser) {
        setErrMsg(t("something-went-wrong-mssg"));
        return;
      }
      const _getUser = JSON.parse(JSON.stringify(getUser));
      dispatch(setUserInfo(_getUser));
      setIsNotifyOnSignatures(
        _getUser?.NotifyOnSignatures !== undefined
          ? _getUser?.NotifyOnSignatures
          : true
      );
      setTimezone(_getUser?.Timezone || usertimezone);
      if (tenantSignTypes?.length > 0) {
        const signatureType = _getUser?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          signatureType
        );
        setSignatureType(updatedSignatureType);
      } else {
        setSignatureType(_getUser?.SignatureType || signatureTypes);
      }
      setSendinOrder(
        _getUser?.SendinOrder !== undefined ? _getUser?.SendinOrder : true
      );
      setIsTourEnabled(
        _getUser?.IsTourEnabled !== undefined ? _getUser?.IsTourEnabled : true
      );
      setDateFormat(
        _getUser?.DateFormat !== undefined ? _getUser?.DateFormat : "MM/DD/YYYY"
      );
      setIs12HourTime(
        _getUser?.Is12HourTime !== undefined ? _getUser?.Is12HourTime : false
      );
      setIsLTVEnabled(
        _getUser?.IsLTVEnabled !== undefined ? _getUser?.IsLTVEnabled : false
      );
      const downloadFilenameFormat =
        _getUser?.DownloadFilenameFormat || "DOCNAME";
      setFileNameFormat(downloadFilenameFormat);
    } catch (err) {
      console.error("Error while getting user details: ", err);
      setErrMsg(t("something-went-wrong-mssg"));
    } finally {
      dispatch(setTopLoader(false));
    }
  });

  // `handleCheckboxChange` is trigger when user enable/disable checkbox of respective type
  const handleCheckboxChange = (index) => {
    // // Create a copy of the signatureType array
    // const updatedSignatureType = [...signatureType];
    // // Toggle the enabled value for the clicked item
    // updatedSignatureType[index].enabled = !updatedSignatureType[index].enabled;
    // // Update the state with the modified array
    // setSignatureType(updatedSignatureType);

    setSignatureType((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // `handleSave` is used save updated value signature type
  const handleSave = withSessionValidation(async () => {
    dispatch(setLoader(true));
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
          showAlert("danger", t("at-least-one-signature-type"));
          dispatch(setLoader(false));
          return;
        } else if (isDefaultSignTypeOnly) {
          showAlert("danger", t("expect-default-one-signature-type"));
          dispatch(setLoader(false));
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
          showAlert("success", t("saved-successfully"));
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
        console.error("Error updating signature type: ", err);
        showAlert("danger", err.message);
      }
      dispatch(setLoader(false));
    }
  });

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setIsNotifyOnSignatures(value);
  };


  const handleTourInput = () => setIsTourEnabled(!isTourEnabled);
  const handleSendinOrderInput = () => setSendinOrder(!sendinOrder);
  const tabName = (ind) => tab.find((t, i) => i === ind)?.name;

  return (
    <React.Fragment>
      {alertInfo.msg && <Alert type={alertInfo.type}>{alertInfo.msg}</Alert>}
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
                      className={` op-tab text-xs md:text-base pb-2 md:pb-0 transition-all`}
                      aria-selected={activeTab === ind}
                      aria-controls={`panel-${tabData.title}`}
                    >
                      <i className={tabData.icon}></i>
                      <span
                        className={`${activeTab === ind ? "block" : "hidden"} md:block ml-1`}
                        title={tabData?.title}
                      >
                        {tabData.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                id={`panel-${activeTab}`}
                className="px-6 pt-4 pb-6"
                aria-labelledby={`tab-${activeTab}`}
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
                                    <span className="font-bold">
                                      {t("draw")}:{" "}
                                    </span>
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
                                    <span className="font-bold">
                                      {t("upload")}:{" "}
                                    </span>
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
                {tabName(activeTab) === "widgets" && <WidgetsTab />}
                {tabName(activeTab) === "email" && <EmailTab />}
              </div>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};
export default Preferences;
