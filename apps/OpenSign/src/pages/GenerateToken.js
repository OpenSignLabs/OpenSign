import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribed, copytoData, openInNewTab } from "../constant/Utils";
import Tooltip from "../primitives/Tooltip";
import Loader from "../primitives/Loader";
import SubscribeCard from "../primitives/SubscribeCard";
import Tour from "reactour";
const tourSteps = [
  {
    selector: '[data-tut="apisubscribe"]',
    content: "Upgrade now to generate API token"
  }
];

function GenerateToken() {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [apiToken, SetApiToken] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTour, setIsTour] = useState(false);
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
        SetApiToken(res.data?.result?.result);
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
    if (!isSubscribe && isEnableSubscription) {
      setIsTour(true);
    } else {
      setIsLoader(true);
      setIsModal(false);
      try {
        const url = parseBaseUrl + "functions/generateapitoken";
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          sessiontoken: localStorage.getItem("accesstoken")
        };
        const res = await axios.post(url, {}, { headers: headers });
        if (res) {
          SetApiToken(res.data.result.token);
          setIsAlert({ type: "success", msg: "Token generated successfully." });
        } else {
          console.error("Error while generating Token");
          setIsAlert({ type: "danger", msg: "Something went wrong." });
        }
      } catch (error) {
        setIsAlert({ type: "danger", msg: "Something went wrong." });
        console.log("while generating Token", error);
      } finally {
        setIsLoader(false);
        setTimeout(() => {
          setIsAlert({ type: "success", msg: "" });
        }, 1500);
      }
    }
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    setIsAlert({ type: "success", msg: "Copied" });
    setTimeout(() => {
      setIsAlert({ type: "success", msg: "" });
    }, 1500); // Reset copied state after 1.5 seconds
  };
  const handleModal = () => setIsModal(!isModal);

  return (
    <React.Fragment>
      <Title title={"API Token"} />
      {isAlert.msg && <Alert type={isAlert.type}>{isAlert.msg}</Alert>}
      {isLoader ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <>
          <div className="bg-base-100 text-base-content flex flex-col justify-center shadow-md rounded-box mb-3">
            <h1 className={"ml-4 mt-3 mb-2 font-semibold"}>
              OpenSign™ API{" "}
              <Tooltip
                url={
                  "https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
                }
                isSubscribe={true}
              />
            </h1>
            <ul className="w-full flex flex-col p-2 text-sm">
              <li className="flex flex-col md:flex-row justify-between items-center border-y-[1px] border-gray-300 break-all py-2">
                <div className="w-full md:w-[70%] flex-col md:flex-row text-xs md:text-[15px] flex items-center gap-x-5">
                  <span className="ml-1">API Token:</span>{" "}
                  <span
                    id="token"
                    className={`${
                      isSubscribe
                        ? ""
                        : "bg-white/20 pointer-events-none select-none"
                    } md:text-end py-2 md:py-0`}
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => copytoclipboard(apiToken)}
                    >
                      {apiToken ? apiToken : "_____"}
                    </span>
                    <button
                      className="op-btn op-btn-accent op-btn-outline op-btn-sm ml-2 cursor-pointer"
                      onClick={() => copytoclipboard(apiToken)}
                    >
                      <i className="fa-light fa-copy"></i>
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
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  openInNewTab(
                    "https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
                  )
                }
                className="op-btn op-btn-secondary mt-2 mb-3 px-8"
              >
                View Docs
              </button>
            </div>
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
                <hr className="bg-[#ccc] mt-4" />
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
          {!isSubscribe && isEnableSubscription && (
            <div data-tut="apisubscribe">
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

export default GenerateToken;
