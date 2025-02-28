import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import Alert from "../primitives/Alert";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";
import Tooltip from "../primitives/Tooltip";
import {
  checkIsSubscribed,
  getTenantDetails,
  handleSignatureType,
  signatureTypes
} from "../constant/Utils";
import Parse from "parse";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { isEnableSubscription } from "../constant/const";
import Upgrade from "../primitives/Upgrade";
const Preferences = () => {
  const { t } = useTranslation();
  const [isalert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTopLoader, setIsTopLoader] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [isNotifyOnSignatures, setIsNotifyOnSignatures] = useState();
  const [isSubscribe, setIsSubscribe] = useState(false);
  useEffect(() => {
    fetchSignType();
  }, []);

  const fetchSignType = async () => {
    if (isEnableSubscription) {
      const subscribe = await checkIsSubscribed();
      setIsSubscribe(subscribe.isValid);
    } else {
      setIsSubscribe(true);
    }
    setIsTopLoader(true);
    try {
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const tenantDetails = await getTenantDetails(user?.objectId);
      const signatureType = tenantDetails?.SignatureType || [];
      const tenantSignTypes = signatureType?.filter((x) => x.enabled === true);
      const getUser = await Parse.Cloud.run("getUserDetails");
      if (getUser) {
        const _getUser = JSON.parse(JSON.stringify(getUser));
        const notifyOnSignatures =
          _getUser?.NotifyOnSignatures !== undefined
            ? _getUser?.NotifyOnSignatures
            : "";
        setIsNotifyOnSignatures(notifyOnSignatures);
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
    if (signatureType.length > 0 || isNotifyOnSignatures) {
      let params = {};
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
      if (isNotifyOnSignatures) {
        params = { ...params, NotifyOnSignatures: isNotifyOnSignatures };
      }
      try {
        const updateRes = await Parse.Cloud.run("updatepreferences", params);
        if (updateRes) {
          setIsAlert({ type: "success", msg: "Saved successfully." });
          let extUser =
            localStorage.getItem("Extand_Class") &&
            JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
          if (extUser && extUser?.objectId) {
            extUser.NotifyOnSignatures = isNotifyOnSignatures;
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
                <div className="flex justify-center items-center absolute w-full h-full rounded-box bg-black/30">
                  <Loader />
                </div>
              )}
              <h1 className="ml-4 mt-3 mb-2 font-semibold">
                OpenSign™ {t("Preferences")}{" "}
                <span>
                  <Tooltip
                    message={`OpenSign™ ${t("Preferences")}`}
                    isSubscribe={true}
                  />
                </span>
              </h1>
              <div className="ml-4 mt-1 mb-2 flex flex-col">
                <div className="mb-[0.75rem]">
                  <label
                    htmlFor="signaturetype"
                    className="text-[14px] mb-[0.7rem] font-medium"
                  >
                    {t("allowed-signature-types")}
                    <a data-tooltip-id="signtypes-tooltip" className="ml-1">
                      <sup>
                        <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                      </sup>
                    </a>
                    <ReactTooltip id="signtypes-tooltip" className="z-[999]">
                      <div className="max-w-[200px] md:max-w-[450px] text-[11px]">
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
                              <span className="font-bold">Typed: </span>
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
                  <div className=" ml-[7px] flex flex-col md:flex-row gap-[10px] mb-[0.7rem]">
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
                          {type.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-[0.75rem]">
                  <label
                    className={`${
                      isSubscribe ? "" : "text-gray-300"
                    } text-[14px] mb-[0.7rem] font-medium`}
                  >
                    {t("notify-on-signatures")}
                    <a data-tooltip-id="nos-tooltip" className="ml-1">
                      <sup>
                        <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                      </sup>
                    </a>
                    <ReactTooltip id="nos-tooltip" className="z-[999]">
                      <div className="max-w-[200px] md:max-w-[450px] text-[11px]">
                        <p className="font-bold">{t("notify-on-signatures")}</p>
                        <p>{t("notify-on-signatures-help.p1")}</p>
                        <p>{t("notify-on-signatures-help.note")}</p>
                      </div>
                    </ReactTooltip>
                    {!isSubscribe && isEnableSubscription && <Upgrade />}
                  </label>
                  <div className="flex flex-col md:flex-row md:gap-4">
                    <div
                      className={`${
                        isSubscribe ? "" : "pointer-events-none opacity-50"
                      } flex items-center gap-2 ml-2 mb-1`}
                    >
                      <input
                        className="mr-[2px] op-radio op-radio-xs"
                        type="radio"
                        onChange={() => handleNotifySignChange(true)}
                        checked={isNotifyOnSignatures === true}
                      />
                      <div className="text-[13px] font-medium cursor-default capitalize">
                        {t("yes")}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:gap-4">
                      <div
                        className={`${
                          isSubscribe ? "" : "pointer-events-none opacity-50"
                        } flex items-center gap-2 ml-2 mb-1`}
                      >
                        <input
                          className="mr-[2px] op-radio op-radio-xs"
                          type="radio"
                          onChange={() => handleNotifySignChange(false)}
                          checked={isNotifyOnSignatures === false}
                        />
                        <div className="text-[13px] font-medium cursor-default capitalize">
                          {t("no")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-[0.75rem]">
                  <button
                    className="op-btn op-btn-primary"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};
export default Preferences;
