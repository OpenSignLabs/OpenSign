import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { isEnableSubscription, rejectBtn, submitBtn } from "../constant/const";
import { checkIsSubscribed, openInNewTab } from "../constant/Utils";
import Parse from "parse";
import PremiumAlertHeader from "../primitives/PremiumAlertHeader";
import Tooltip from "../primitives/Tooltip";

function Webhook() {
  const navigation = useNavigate();
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [webhook, setWebhook] = useState();
  const [isLoader, setIsLoader] = useState(true);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWebhook();
    // eslint-disable-next-line
  }, []);

  const fetchWebhook = async () => {
    const email = Parse.User.current().getEmail();
    if (isEnableSubscription) {
      const getIsSubscribe = await checkIsSubscribed();
      setIsSubscribe(getIsSubscribe);
    }
    const params = { email: email };
    try {
      const extRes = await Parse.Cloud.run("getUserDetails", params);
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
        await axios.post(url, params, { headers: headers }).then((res) => {
          if (res.data && res.data.result && res.data.result.Webhook) {
            setWebhook(res.data.result.Webhook);
            setIsGenerate(true);
            setTimeout(() => {
              setIsGenerate(false);
            }, 1500);
            setIsLoader(false);
          } else {
            console.error("Error while generating webhook");
            setIsLoader(false);
            setIsErr(true);
            setTimeout(() => {
              setIsErr(false);
            }, 1500);
          }
        });
      } catch (error) {
        setIsLoader(false);
        setIsErr(true);
        setTimeout(() => {
          setIsErr(false);
        }, 1500);

        console.log("err", error);
      }
    } else {
      setError("The webhook url should always start with https://");
      setTimeout(() => {
        setError("");
      }, 1500);
    }
  };

  const handleModal = () => setIsModal(!isModal);
  return (
    <React.Fragment>
      <Title title={"Webhook"} />
      {isGenerate && <Alert type="success">Webhook added successfully!</Alert>}
      {isErr && <Alert type="danger">Something went wrong!</Alert>}

      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center text-[45px] text-[#3dd3e0]">
          <div className="loader-37"></div>
        </div>
      ) : (
        <div className="bg-base-100 text-base-content flex flex-col justify-center shadow rounded">
          {!isEnableSubscription && <PremiumAlertHeader />}
          <h1 className={"ml-4 mt-3 mb-2 font-semibold"}>
            OpenSign™ Webhook{" "}
            <Tooltip
              url={"https://docs.opensignlabs.com/docs/API-docs/get-webhook"}
              isSubscribe={true}
            />
          </h1>
          <ul
            className={
              isSubscribe || !isEnableSubscription
                ? "w-full flex flex-col p-2 text-sm "
                : "w-full flex flex-col p-2 text-sm opacity-20 pointer-events-none select-none"
            }
          >
            <li
              className={`flex flex-col md:flex-row  justify-between items-center border-y-[1px] border-gray-300 break-all py-2`}
            >
              <div className="w-[70%] flex-col md:flex-row flex items-center gap-5 ">
                <span className="">Webhook:</span>{" "}
                <span id="token" className=" md:text-end cursor-pointer">
                  {webhook ? webhook : "_____"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleModal}
                className="op-btn op-btn-primary "
              >
                {webhook ? "Update Webhook" : "Add Webhook"}
              </button>
            </li>
          </ul>

          <div className="flex   items-center justify-center ">
            <button
              type="button"
              onClick={() =>
                openInNewTab(
                  "https://docs.opensignlabs.com/docs/API-docs/save-update-webhook"
                )
              }
              className="op-btn op-btn-primary my-2"
            >
              View Docs
            </button>
          </div>

          {!isSubscribe && isEnableSubscription && (
            <>
              <h1 className={"ml-4 mt-3 mb-2 font-semibold"}>
                Upgrade to PRO Plan
              </h1>
              <ul className={"w-full flex flex-col p-2 text-sm "}>
                <li
                  className={`flex flex-col md:flex-row justify-between items-center border-y-[1px] border-gray-300 break-all py-2`}
                >
                  <div className="w-[70%] flex-col md:flex-row flex items-center gap-3 ">
                    <span className="">$29.99/month:</span>{" "}
                    <span id="token" className=" md:text-end cursor-pointer">
                      First 100 documents included, then just $0.15 per
                      document.
                    </span>
                  </div>
                  {!isSubscribe && isEnableSubscription && (
                    <button
                      type="button"
                      onClick={() => navigation("/subscription")}
                      className="rounded hover:bg-[#15b4e9] border-[1px] border-[#15b4e9] text-[#15b4e9] hover:text-white px-11 py-2 text-xs md:text-base focus:outline-none"
                    >
                      Upgrade Now
                    </button>
                  )}
                </li>
              </ul>
            </>
          )}
          <ModalUi
            isOpen={isModal}
            title={"Regenerate Token"}
            handleClose={handleModal}
          >
            {error && <Alert type="danger">{error}</Alert>}
            <div className="m-[20px]">
              <div className="text-lg font-normal text-black">
                <label className="text-sm ml-2">Webhook</label>
                <input
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  placeholder="Enter webhook url"
                  className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                />
              </div>
              <hr className="bg-[#ccc] mt-4 " />
              <div className="flex items-center mt-3 gap-2 text-white">
                <button
                  onClick={handleSubmit}
                  className={submitBtn + "ml-[2px]"}
                >
                  Yes
                </button>
                <button onClick={handleModal} className={rejectBtn}>
                  No
                </button>
              </div>
            </div>
          </ModalUi>
        </div>
      )}
    </React.Fragment>
  );
}

export default Webhook;
