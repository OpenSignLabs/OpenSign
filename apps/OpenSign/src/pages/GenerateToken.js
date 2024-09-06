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
import { useTranslation } from "react-i18next";
import Parse from "parse";

function GenerateToken() {
  const origin = window.location.origin;
  const { t } = useTranslation();
  const parseBaseUrl = localStorage.getItem("baseUrl");
  const parseAppId = localStorage.getItem("parseAppId");
  const [apiToken, SetApiToken] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [isModal, setIsModal] = useState({
    generateapi: false,
    buyapis: false,
    unauthorized: false
  });
  const [isSubscribe, setIsSubscribe] = useState({
    plan: "",
    isValid: false,
    adminId: "",
    adminName: "",
    adminEmail: ""
  });
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTour, setIsTour] = useState(false);
  const [amount, setAmount] = useState({
    quantity: 500,
    priceperapi: 0.15,
    allowedcredits: 0,
    addoncredits: 0,
    totalcredits: 0,
    price: (75.0).toFixed(2)
  });
  const [isFormLoader, setIsFormLoader] = useState(false);
  const [apitestToken, setApiTestToken] = useState("");
  const quantityList = [500, 1000, 5000, 50000];
  useEffect(() => {
    fetchToken();
    // eslint-disable-next-line
  }, []);
  const tourSteps = [
    {
      selector: '[data-tut="apisubscribe"]',
      content: t("tour-mssg.generate-token")
    }
  ];
  const fetchToken = async () => {
    try {
      if (isEnableSubscription) {
        const subscribe = await checkIsSubscribed();
        setIsSubscribe(subscribe);
      }
      const url = parseBaseUrl + "functions/getapitoken";
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        sessiontoken: localStorage.getItem("accesstoken")
      };
      const res = await axios.post(url, {}, { headers: headers });
      if (res) {
        const resCredits = await Parse.Cloud.run("allowedcredits");
        const allowedcredits = resCredits?.allowedcredits || 0;
        const addoncredits = resCredits?.addoncredits || 0;
        const totalcredits = allowedcredits + addoncredits;
        setAmount((obj) => ({
          ...obj,
          allowedcredits: allowedcredits,
          addoncredits: addoncredits,
          totalcredits: totalcredits
        }));
        SetApiToken(res?.data?.result?.result);
      }
      try {
        const body = { email: Parse?.User?.current()?.getEmail() || "" };
        const testurl = "https://sandbox.opensignlabs.com/api/gettesttoken";
        const testRes = await axios.post(testurl, body);
        setApiTestToken(testRes.data?.token);
      } catch (err) {
        console.log("err in fetch test token", err);
      }
    } catch (err) {
      SetApiToken();
      console.log("Err", err);
    } finally {
      setIsLoader(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubscribe?.plan === "freeplan" && isEnableSubscription) {
      setIsTour(true);
    } else {
      setIsLoader(true);
      setIsModal((obj) => ({ ...obj, generateapi: false }));
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
          setIsAlert({ type: "success", msg: t("token-generated") });
        } else {
          console.error("Error while generating Token");
          setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
        }
      } catch (error) {
        setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
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
    setIsAlert({ type: "success", msg: t("copied") });
    setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500); // Reset copied state after 1.5 seconds
  };
  const handleModal = () => {
    if (isSubscribe?.plan === "freeplan" && isEnableSubscription) {
      setIsTour(true);
    } else {
      setIsModal((obj) => ({ ...obj, generateapi: !obj.generateapi }));
    }
  };

  const handleBuyAPIsModal = () => {
    if (isSubscribe?.plan === "freeplan" && isEnableSubscription) {
      setIsTour(true);
    } else {
      const extUser =
        localStorage.getItem("Extand_Class") &&
        JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      if (isSubscribe?.adminId && extUser?.objectId === isSubscribe?.adminId) {
        setIsModal((obj) => ({ ...obj, buyapis: !obj.buyapis }));
      } else {
        setIsSubscribe((obj) => ({
          ...obj,
          adminName: extUser?.CreatedBy?.name,
          adminEmail: extUser?.CreatedBy?.email
        }));
        setIsModal((obj) => ({ ...obj, unauthorized: !obj.unauthorized }));
      }
    }
  };
  const handleCloseModal = () => {
    setIsModal({ generateapi: false, buyapis: false, unauthorized: false });
  };
  const handlePricePerAPIs = (e) => {
    const quantity = e.target?.value;
    const price =
      quantity > 0
        ? (Math.round(quantity * amount.priceperapi * 100) / 100).toFixed(2)
        : (Math.round(500 * amount.priceperapi * 100) / 100).toFixed(2);
    setAmount((prev) => ({ ...prev, quantity: quantity, price: price }));
  };
  const handleAddOnApiSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFormLoader(true);
    try {
      const resAddon = await Parse.Cloud.run("buycredits", {
        credits: amount.quantity
      });
      if (resAddon) {
        const _resAddon = JSON.parse(JSON.stringify(resAddon));
        if (_resAddon.status === "success") {
          setAmount((obj) => ({
            ...obj,
            quantity: 500,
            priceperapi: 0.15,
            price: (75.0).toFixed(2),
            totalcredits: obj?.totalcredits + _resAddon.addon,
            addoncredits: obj?.addoncredits + _resAddon.addon
          }));
        }
      }
      setIsModal((obj) => ({ ...obj, buyapis: false }));
    } catch (err) {
      console.log("Err in buy addon", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
    } finally {
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 2000);
      setIsFormLoader(false);
    }
  };

  const handleGenerateTestToken = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    // setIsModal((obj) => ({ ...obj, generateapi: false }));
    try {
      const url = "https://sandbox.opensignlabs.com/api/generatetesttoken";
      const headers = {
        "Content-Type": "application/json",
        token: apitestToken || "1"
      };
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const body = {
        name: extUser?.Name,
        email: extUser?.Email,
        phone: extUser?.Phone,
        company: extUser?.Company,
        jobTitle: extUser?.JobTitle
      };
      const res = await axios.post(url, body, { headers: headers });
      if (res) {
        setApiTestToken(res.data?.token);
        setIsAlert({ type: "success", msg: t("token-generated") });
      } else {
        console.error("Error while generating Token");
        setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      }
    } catch (error) {
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
      console.log("while generating Token", error);
    } finally {
      setIsLoader(false);
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
    }
  };
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
              OpenSign™ {t("API")}{" "}
              <Tooltip
                url="https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
                isSubscribe={true}
              />
            </h1>
            <ul className="w-full flex flex-col p-2 text-sm">
              <li className="flex flex-col md:flex-row justify-between items-center border-t-[1px] border-gray-300 break-all py-2">
                <div className="w-full md:w-[70%] flex-col md:flex-row text-xs md:text-[15px] flex items-center gap-x-5">
                  <span className="ml-1">
                    <span className="font-medium">API Test Token : </span>
                    <span className="text-xs">
                      <Tooltip message={t("help-test-token")} />
                    </span>
                  </span>
                  <span id="token" className="md:text-end py-2 md:py-0">
                    <span
                      className="cursor-pointer"
                      onClick={() => copytoclipboard(apitestToken)}
                    >
                      {apitestToken ? apitestToken : "_____"}
                    </span>
                    <button
                      className="op-btn op-btn-accent op-btn-outline op-btn-sm ml-2 cursor-pointer"
                      onClick={() => copytoclipboard(apitestToken)}
                    >
                      <i className="fa-light fa-copy"></i>
                    </button>
                  </span>
                </div>
                <button
                  onClick={handleGenerateTestToken}
                  className="op-btn op-btn-primary w-[210px] md:w-auto"
                >
                  {apitestToken
                    ? t("regenerate-test-token")
                    : t("generate-test-token")}
                </button>
              </li>
              <li className="flex flex-col md:flex-row justify-between items-center border-y-[1px] border-gray-300 break-all py-2">
                <div className="w-full md:w-[70%] flex-col md:flex-row text-xs md:text-[15px] flex items-center gap-x-5">
                  <span className="ml-1">
                    <span className="font-medium">{t("api-token")} : </span>
                    <span className="text-xs">
                      <Tooltip message={t("help-api-token", { origin })} />
                    </span>
                  </span>
                  <span
                    id="token"
                    className={`${
                      isSubscribe?.plan === "freeplan"
                        ? "bg-white/20 pointer-events-none select-none"
                        : ""
                    } md:text-end py-2 md:py-0`}
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => copytoclipboard(apiToken)}
                    >
                      {isSubscribe?.plan !== "freeplan" && apiToken
                        ? apiToken
                        : "_____"}
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
                  className="op-btn op-btn-primary w-[210px] md:w-auto"
                >
                  {apiToken ? t("regenerate-token") : t("generate-token")}
                </button>
              </li>
              <div className="text-xs md:text-[15px] my-3 w-full md:w-[70%] flex-col md:flex-row flex items-center gap-x-5">
                <span className="font-medium">
                  {t("remaining-credits")}{" "}
                  <span className="text-xs">
                    <Tooltip
                      message={t("remaining-credits-help", {
                        allowedcredits: amount?.allowedcredits || 0,
                        addoncredits: amount?.addoncredits || 0
                      })}
                    />
                  </span>
                </span>
                <span className="md:text-end py-2 md:py-0">
                  {amount.totalcredits}
                </span>
              </div>
              <hr />
            </ul>
            <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-1">
              <button
                type="button"
                onClick={() =>
                  openInNewTab(
                    "https://docs.opensignlabs.com/docs/API-docs/opensign-api-v-1"
                  )
                }
                className="op-btn op-btn-secondary mt-2 md:mb-3 px-8 w-[210px] md:w-auto"
              >
                {t("view-docs")}
              </button>
              <button
                type="button"
                onClick={() => handleBuyAPIsModal()}
                className="op-btn op-btn-accent mt-2 mb-3 px-8 w-[210px] md:w-auto"
              >
                {t("buy-credits")}
              </button>
            </div>
            <ModalUi
              isOpen={isModal.generateapi}
              title={apiToken ? t("regenerate-token") : t("generate-token")}
              handleClose={handleModal}
            >
              <div className="m-[20px]">
                <div className="text-lg font-normal text-base-content">
                  {t("generate-token-alert")}
                </div>
                <hr className="bg-[#ccc] mt-4" />
                <div className="flex items-center mt-3 gap-2 text-white">
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
            {/* buy APIs */}
            <ModalUi
              isOpen={isModal.buyapis}
              title={"Buy Credits"}
              handleClose={handleCloseModal}
            >
              {isFormLoader && (
                <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
                  <Loader />
                </div>
              )}
              <form onSubmit={handleAddOnApiSubmit} className="p-3">
                <div className="mb-3 flex justify-between">
                  <label
                    htmlFor="quantity"
                    className="block text-xs text-gray-700 font-semibold"
                  >
                    {t("quantity-of-credits")}
                    <span className="text-[red] text-[13px]"> *</span>
                  </label>
                  <select
                    value={amount.quantity}
                    onChange={(e) => handlePricePerAPIs(e)}
                    name="quantity"
                    className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-1/4 text-xs"
                    required
                  >
                    {quantityList.length > 0 &&
                      quantityList.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-3 flex justify-between">
                  <label className="block text-xs text-gray-700 font-semibold">
                    {t("Price")} (1 * {amount.priceperapi})
                  </label>
                  <div className="w-1/4 flex justify-center items-center text-sm">
                    USD {amount.price}
                  </div>
                </div>
                <hr className="text-base-content mb-3" />
                <button className="op-btn op-btn-primary w-full mt-2">
                  {t("Proceed")}
                </button>
              </form>
            </ModalUi>
            <ModalUi
              isOpen={isModal.unauthorized}
              title={"Unauthorized"}
              handleClose={handleCloseModal}
            >
              <div className="m-8 flex justify-center text-center items-center font-medium break-all">
                {t("unauthorized-modal", {
                  adminName: isSubscribe?.adminName,
                  adminEmail: isSubscribe?.adminEmail
                })}
              </div>
            </ModalUi>
          </div>
          {isEnableSubscription && isSubscribe?.plan === "freeplan" && (
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
