import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribed, copytoData, openInNewTab } from "../constant/Utils";
import PremiumAlertHeader from "../primitives/PremiumAlertHeader";
import Tooltip from "../primitives/Tooltip";
import Loader from "../primitives/Loader";

function GenerateToken() {
  const navigation = useNavigate();
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [apiToken, SetApiToken] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);

  useEffect(() => {
    fetchToken();
    // eslint-disable-next-line
  }, []);

  const fetchToken = async () => {
    try {
      if (isEnableSubscription) {
        const getIsSubscribe = await checkIsSubscribed();
        setIsSubscribe(getIsSubscribe);
      }

      const url = parseBaseUrl + "functions/getapitoken";
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        sessiontoken: localStorage.getItem("accesstoken")
      };
      const res = await axios.post(url, {}, { headers: headers });
      if (res) {
        SetApiToken(res.data.result.result);
      }

      setIsLoader(false);
    } catch (err) {
      SetApiToken();
      setIsLoader(false);
      console.log("Err", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    setIsModal(false);
    try {
      const url = parseBaseUrl + "functions/generateapitoken";
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        sessiontoken: localStorage.getItem("accesstoken")
      };
      await axios.post(url, {}, { headers: headers }).then((res) => {
        if (res) {
          SetApiToken(res.data.result.token);
          //   localStorage.setItem("apiToken", res.data.result.token);
          setIsGenerate(true);
          setTimeout(() => {
            setIsGenerate(false);
          }, 1500);
          setIsLoader(false);
        } else {
          console.error("Error while generating Token");
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
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset copied state after 1.5 seconds
  };
  const handleModal = () => setIsModal(!isModal);

  return (
    <React.Fragment>
      <Title title={"API Token"} />
      {isGenerate && (
        <Alert type="success">Token generated successfully!</Alert>
      )}
      {copied && <Alert type="success">Copied</Alert>}
      {isErr && <Alert type="danger">Something went wrong!</Alert>}
      {isLoader ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <div className="bg-base-100 text-base-content flex flex-col justify-center shadow rounded">
          {!isEnableSubscription && <PremiumAlertHeader />}
          <h1 className={"ml-4 mt-3 mb-2 font-semibold"}>
            OpenSign™ API{" "}
            <Tooltip
              url={
                "https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
              }
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
            <li className="flex flex-col md:flex-row justify-between items-center border-y-[1px] border-gray-300 break-all py-2">
              <div className="w-full md:w-[70%] flex-col md:flex-row text-xs md:text-[15px] flex items-center gap-x-5 ">
                <span className="">Api Token:</span>{" "}
                <span id="token" className="md:text-end py-2 md:py-0">
                  <span
                    className="cursor-pointer"
                    onClick={() => copytoclipboard(apiToken)}
                  >
                    {apiToken ? apiToken : "_____"}
                  </span>
                  <button
                    className="op-btn op-btn-accent op-btn-outline op-btn-sm ml-2"
                    onClick={() => copytoclipboard(apiToken)}
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                </span>
              </div>
              <button
                onClick={apiToken ? handleModal : handleSubmit}
                className="op-btn op-btn-primary"
              >
                {apiToken ? "Regenerate Token" : "Generate Token"}
              </button>
            </li>
          </ul>
          <div className="flex   items-center justify-center ">
            <button
              type="button"
              onClick={() =>
                openInNewTab(
                  "https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
                )
              }
              className="op-btn op-btn-secondary my-2"
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
                      Sign 100 docs using API. Only 0.15/docs after that.
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
            title={apiToken ? "Regenerate Token" : "Generate Token"}
            handleClose={handleModal}
          >
            <div className="m-[20px]">
              <div className="text-lg font-normal text-base-content">
                Are you sure you want to regenerate token it will expire old
                token?
              </div>
              <hr className="bg-[#ccc] mt-4 " />
              <div className="flex items-center mt-3 gap-2 text-white">
                <button
                  onClick={handleSubmit}
                  className="op-btn op-btn-primary ml-[2px]"
                >
                  Yes
                </button>
                <button
                  onClick={handleModal}
                  className="op-btn op-btn-secondary"
                >
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

export default GenerateToken;
