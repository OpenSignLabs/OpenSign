import React, { useState } from "react";
import Parse from "parse";
import Title from "../components/Title";
function Api() {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [editmode, setEditMode] = useState(false);
  const [apiToken, SetApiToken] = useState(localStorage.getItem("apiToken"));
  const [isLoader, setIsLoader] = useState(false);

  Parse.serverURL = parseBaseUrl;
  Parse.initialize(parseAppId);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);

    try {
      await Parse.Cloud.run("generateAppToken").then(
      (res) => {
         if (res) {
            console.log(res.get('token'))
            SetApiToken(res.get('token'));
            localStorage.setItem("apiToken", res.get('token'));
            alert("Token Generated successfully.");
            setEditMode(false);
            setIsLoader(false);
         } else {
            alert("Something went wrong.");
            console.error("Error while generating Token");
            setIsLoader(false);
         }
         console.log(res);
      });
    } catch (error) {
        console.log("err", error);
    }
  };

  return (
    <React.Fragment>
      <Title title={"Api"} />
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
          <ul className="w-full flex flex-col p-2 text-sm">
            <li
              className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                editmode ? "py-1" : "py-2"
              }`}
            >
              <span>Api Token:</span>{" "} 
               <span>{localStorage.getItem("apiToken")}</span>
            </li>
          </ul>
          <div className="flex justify-center pb-4">
            <button
               type="button"
               onClick={handleSubmit}
               className="rounded  bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] px-4 py-2 mr-4"
            >
               Generate Token
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Api;
