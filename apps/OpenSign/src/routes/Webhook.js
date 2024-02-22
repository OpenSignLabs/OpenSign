import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { rejectBtn, submitBtn } from "../constant/const";
import { openInNewTab } from "../constant/Utils";
import Parse from "parse";

function Webhook() {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [webhook, setWebhook] = useState();
  const [isLoader, setIsLoader] = useState(true);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [isModal, setIsModal] = useState(false);

  useEffect(() => {
    fetchWebhook();
    // eslint-disable-next-line
  }, []);

  const fetchWebhook = async () => {
    const email = Parse.User.current().getEmail();
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
  };

  const handleModal = () => setIsModal(!isModal);
  return (
    <React.Fragment>
      <Title title={"Webhook"} />
      {isGenerate && <Alert type="success">Webhook added successfully!</Alert>}
      {isErr && <Alert type="danger">Something went wrong!</Alert>}
      {isLoader ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <div className="bg-white flex flex-col justify-center shadow rounded">
          <h1 className="ml-4 mt-3 mb-2 font-semibold">Webhook</h1>
          <ul className="w-full flex flex-col  p-2 text-sm">
            <li
              className={`flex justify-between items-center border-y-[1px] border-gray-300 break-all py-2`}
            >
              <span className="w-[40%]">Webhook:</span>{" "}
              <span id="token" className="w-[60%] md:text-end cursor-pointer">
                {webhook && webhook}
              </span>
            </li>
          </ul>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 pb-4">
            <button
              type="button"
              onClick={handleModal}
              className="rounded hover:bg-[#15b4e9] border-[1px] border-[#15b4e9] text-[#15b4e9] hover:text-white px-4 py-2 text-xs md:text-base focus:outline-none"
            >
              {webhook ? "Update Webhook" : "Add Webhook"}
            </button>
            <button
              type="button"
              onClick={() =>
                openInNewTab(
                  "https://docs.opensignlabs.com/docs/API-docs/save-update-webhook"
                )
              }
              className="rounded hover:bg-[#15b4e9] border-[1px] border-[#15b4e9] text-[#15b4e9] hover:text-white px-11 py-2 text-xs md:text-base focus:outline-none"
            >
              View Docs
            </button>
          </div>

          <ModalUi
            isOpen={isModal}
            title={"Regenerate Token"}
            handleClose={handleModal}
          >
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
