import { Suspense } from "react";
import { useParams } from "react-router-dom";
import useFederatedComponent from "mf-cra";
import React from "react";
import Title from "../components/Title";
function RemoteApp({ app }) {
  // console.log("app ", app);
  const { Component: RemoteComponent } = useFederatedComponent(app);
  // console.log("RemoteComponent ", RemoteComponent);
  return (
    <>
      <Title title={app.remoteName} />
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
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.33)",
            backgroundColor: "#ffffff",
            width: "100%",
            overflow: "hidden",
            borderRadius: 3,
            minHeight: "70vh"
          }}
        >
          {RemoteComponent && <RemoteComponent />}
        </div>
      </Suspense>
    </>
  );
}
function checkObjectProperties(obj) {
  // Check if all three properties exist in the object
  if (
    obj &&
    obj.remoteName !== undefined &&
    obj.remoteUrl !== undefined &&
    obj.moduleToLoad !== undefined
  ) {
    return true; // All properties are present
  } else {
    return false; // At least one property is missing
  }
}
export default function RemoteAppContainer() {
  const { remoteApp } = useParams();
  // console.log("remoteApp ", remoteApp);

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
  // console.log("obj ", obj);
  const isMf = checkObjectProperties(obj);
  if (isMf) {
    const appToLoad = obj;
    return <RemoteApp app={appToLoad} />;
  } else {
    return <div>App not found</div>;
  }
}
