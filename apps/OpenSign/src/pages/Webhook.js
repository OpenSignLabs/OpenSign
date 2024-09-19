import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribed, openInNewTab } from "../constant/Utils";
import Parse from "parse";
import Tooltip from "../primitives/Tooltip";
import Loader from "../primitives/Loader";
import SubscribeCard from "../primitives/SubscribeCard";
import Tour from "reactour";
import { useTranslation } from "react-i18next";

function Webhook() {
  const { t } = useTranslation();
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [webhook, setWebhook] = useState();
  const [isLoader, setIsLoader] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState({ plan: "", isValid: true });
  const [error, setError] = useState("");
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTour, setIsTour] = useState(false);
  useEffect(() => {
    fetchWebhook();
    // eslint-disable-next-line
  }, []);
  const tourSteps = [
    {
      selector: '[data-tut="webhooksubscribe"]',
      content: t("tour-mssg.webhook-1")
    }
  ];
  const fetchWebhook = async () => {
    if (isEnableSubscription) {
      const subscribe = await checkIsSubscribed();
      setIsSubscribe(subscribe);
    }
    try {
      const extRes = await Parse.Cloud.run("getUserDetails");
      if (extRes) {
        setWebhook(extRes.get("Webhook"));
      }
      setIsLoader(false);
    } catch (err) {
      setWebhook();
      setIsLoader(false);
      console.log("Err", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (webhook && webhook.startsWith("https://")) {
      setIsLoader(true);
      setIsModal(false);
      try {
        const params = { url: webhook };
        const url = parseBaseUrl + "functions/savewebhook";
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          sessiontoken: localStorage.getItem("accesstoken")
        };
        const res = await axios.post(url, params, { headers: headers });
        if (res.data && res.data.result && res.data.result.Webhook) {
          setWebhook(res.data.result.Webhook);
          setIsAlert({ type: "success", msg: t("webhook-added") });
        } else {
          console.error("Error while generating webhook");
          setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
        }
      } catch (error) {
        setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
        console.log("err while generating webhook", error);
      } finally {
        setIsLoader(false);
        setTimeout(() => {
          setIsAlert({ type: "success", msg: "" });
        }, 1500);
      }
    } else {
      setError("The webhook url should always start with https://");
      setTimeout(() => {
        setError("");
      }, 1500);
    }
  };

  const handleModal = () => {
    if (!isSubscribe?.isValid && isEnableSubscription) {
      setIsTour(true);
    } else {
      setIsModal(!isModal);
    }
  };
  return (
    <React.Fragment>
      <Title title={"Webhook"} />
      {isAlert.msg && <Alert type={isAlert.type}>{isAlert.msg}</Alert>}
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          <div className="bg-base-100 text-base-content flex flex-col justify-center shadow-md rounded-box mb-3">
            <h1 className={"ml-4 mt-3 mb-2 font-semibold"}>
              OpenSign™ {t("webhook")}{" "}
              <Tooltip
                url={"https://docs.opensignlabs.com/docs/API-docs/get-webhook"}
                isSubscribe={true}
              />
            </h1>
            <ul className={"w-full flex flex-col p-2 text-sm"}>
              <li className="flex flex-col md:flex-row justify-between items-center border-y-[1px] border-gray-300 break-all py-2">
                <div className="w-[70%] flex-col md:flex-row flex items-center gap-5">
                  <span className="">{t("webhook")}:</span>{" "}
                  <span id="token" className=" md:text-end cursor-pointer">
                    {webhook ? webhook : "_____"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleModal}
                  className="op-btn op-btn-primary"
                >
                  {webhook ? t("update-webhook") : t("add-webhook")}
                </button>
              </li>
            </ul>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  openInNewTab(
                    "https://docs.opensignlabs.com/docs/API-docs/save-update-webhook"
                  )
                }
                className="op-btn op-btn-secondary mt-2 mb-3 px-7"
              >
                {t("view-docs")}
              </button>
            </div>
            <ModalUi
              isOpen={isModal}
              title={t("add-webhook")}
              handleClose={handleModal}
            >
              {error && <Alert type="danger">{error}</Alert>}
              <div className="m-[20px]">
                <div className="text-lg font-normal text-base-content">
                  <label className="text-sm ml-2">{t("webhook")}</label>
                  <input
                    value={webhook}
                    onChange={(e) => setWebhook(e.target.value)}
                    placeholder="Enter webhook url"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  />
                </div>
                <hr className="bg-[#ccc] mt-3" />
                <div className="flex items-center mt-3 gap-2">
                  <button
                    onClick={handleSubmit}
                    className="op-btn op-btn-primary ml-[2px]"
                  >
                    {t("yes")}
                  </button>
                  <button
                    onClick={handleModal}
                    className="op-btn op-btn-secondary"
                  >
                    {t("no")}
                  </button>
                </div>
              </div>
            </ModalUi>
          </div>
          {isEnableSubscription && !isSubscribe?.isValid && (
            <div data-tut="webhooksubscribe">
              <SubscribeCard />
            </div>
          )}
        </>
      )}
      <Tour
        onRequestClose={() => setIsTour(false)}
        steps={tourSteps}
        isOpen={isTour}
        closeWithMask={false}
        disableKeyboardNavigation={["esc"]}
        scrollOffset={-100}
        rounded={5}
      />
    </React.Fragment>
  );
}

export default Webhook;
