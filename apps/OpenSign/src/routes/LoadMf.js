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
            height: "100%",
            minHeight: "100vh"
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

  const obj = {
    remoteUrl: window.location.origin + "/mfbuild/remoteEntry.js",
    moduleToLoad: "./AppRoutes",
    remoteName: remoteApp
  };
  // console.log("obj ", obj);
  const isMf = checkObjectProperties(obj);
  if (isMf) {
    const appToLoad = obj;
    return <RemoteApp app={appToLoad} />;
  } else {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white rounded">
        <div className="text-center">
          <h1 className="text-[60px] lg:text-[120px] font-semibold text-black">
            404
          </h1>
          <p className="text-[30px] lg:text-[50px] text-black">
            Page Not Found
          </p>
        </div>
      </div>
    );
  }
}
