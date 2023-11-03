import useFederatedComponent from "mf-cra";
import React, { Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MicroappModal = () => {
  const { remoteApp } = useParams();

  useEffect(() => {
    return () => localStorage.removeItem("rowlevel");
  }, []);
  let paramString = remoteApp;
  let queryString = new URLSearchParams(paramString);
  let obj = {};
  for (const [key, value] of queryString.entries()) {
    // console.log("value ", key + ":" + value);

    if (key === "remoteUrl") {
      const url = window.location.origin + "/mfbuild/remoteEntry.js";
      // console.log("atob(value) ", atob(value))
      obj = { ...obj, [key]: url };
    } else {
      if (key === "moduleToLoad") {
        obj = { ...obj, [key]: "./" + value };
      } else {
        obj = { ...obj, [key]: value };
      }
    }
  }
  // console.log("app ", remoteApp);
  const { Component: RemoteComponent } = useFederatedComponent(obj);
  const navigate = useNavigate();
  // console.log("RemoteComponent ", RemoteComponent);
  return (
    <div className="w-full h-full flex items-center justify-center ">
      {/* <!-- Modal Container --> */}
      <div className="bg-white rounded-lg shadow-lg w-full">
        {/* <!-- Modal Header --> */}
        <div className="flex w-full items-center border-b-2 mb-2 p-2">
          <button
            className="focus:outline-none bg-blue-500 text-white text-sm shadow px-2.5 py-1 rounded"
            id="closeModal"
            onClick={(e) => {
              e.preventDefault();
              //   setIsModal(false);
              navigate(-1);
            }}
          >
            Back
          </button>
          {localStorage.getItem("domain") && (
            <p className="flex-1 w-full text-sm md:text-base text-black text-center">
              {localStorage.getItem("domain") === "contracts" ? "Document" : ""}
            </p>
          )}
        </div>
        {/* <!-- Modal Body --> */}
        <div className="w-full">
          <Suspense
            fallback={
              <div style={{ height: "300px" }}>
                <div
                  style={{
                    marginLeft: "45%",
                    marginTop: "150px",
                    fontSize: "45px",
                    color: "#3dd3e0"
                  }}
                  className="loader-37"
                ></div>
              </div>
            }
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                width: "100%",
                overflow: "hidden",
                minHeight: "50vh"
              }}
            >
              {RemoteComponent && <RemoteComponent />}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default MicroappModal;
