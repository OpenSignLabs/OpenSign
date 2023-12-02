import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";

function GenerateToken() {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [apiToken, SetApiToken] = useState("");
  const [isLoader, setIsLoader] = useState(true);
  const [copied, setCopied] = useState(false);

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
          alert("Token generated successfully!");
          setIsLoader(false);
        } else {
          alert("Something went wrong!");
          console.error("Error while generating Token");
          setIsLoader(false);
        }
      });
    } catch (error) {
      setIsLoader(false);
      alert("Something went wrong!");
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
  return (
    <React.Fragment>
      <Title title={"token"} />
      {copied && (
        <div className={`alert alert-success alertBox`} role="alert">
          Copied
        </div>
      )}
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
          <ul className="w-full flex flex-col  p-2 text-sm">
            <li
              className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all py-2`}
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
            <li
              className={`flex justify-between items-center border-y-[1px] border-gray-300 break-all py-2`}
            >
              <span className="w-[40%]">Application Id:</span>{" "}
              <span
                className="w-[60%] md:text-end cursor-pointer"
                onClick={() => copytoclipboard(localStorage.getItem("AppID12"))}
              >
                {localStorage.getItem("AppID12")}
              </span>
            </li>
          </ul>
          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded hover:bg-[#15b4e9] border-[1px] border-[#15b4e9] text-[#15b4e9] hover:text-white px-4 py-2 text-xs md:text-base"
            >
              {apiToken ? "Regenerate Token" : "Generate Token"}
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default GenerateToken;
