import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import Alert from "../primitives/Alert";
import ModalUi from "../primitives/ModalUi";
import { rejectBtn, submitBtn } from "../constant/const";
import { openInNewTab } from "../constant/Utils";

function GenerateToken() {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [apiToken, SetApiToken] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [isModal, setIsModal] = useState(false);

  useEffect(() => {
    fetchToken();
    // eslint-disable-next-line
  }, []);

  const fetchToken = async () => {
    try {
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
    navigator.clipboard.writeText(text);
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
          <h1 className="ml-4 mt-3 mb-2 font-semibold">API Token</h1>
          <ul className="w-full flex flex-col p-2 text-sm">
            <li
              className={`flex justify-between items-center border-y-[1px] border-gray-300 break-all py-2`}
            >
              <span className="w-[40%]">Api Token:</span>{" "}
              <span
                id="token"
                className="w-[60%] md:text-end cursor-pointer"
                onClick={() => copytoclipboard(apiToken)}
              >
                {apiToken && apiToken}
              </span>
            </li>
          </ul>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 pb-4">
            <button
              type="button"
              onClick={apiToken ? handleModal : handleSubmit}
              className="rounded hover:bg-[#15b4e9] border-[1px] border-[#15b4e9] text-[#15b4e9] hover:text-white px-4 py-2 text-xs md:text-base focus:outline-none"
            >
              {apiToken ? "Regenerate Token" : "Generate Token"}
            </button>
            <button
              type="button"
              onClick={() => openInNewTab("https://docs.opensignlabs.com")}
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
                Are you sure you want to regenerate token it will expire old
                token?
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

export default GenerateToken;
