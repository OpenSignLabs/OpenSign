import React, { useEffect, useState } from "react";
import Parse from "parse";
import ReactDOM from "react-dom/client";
import PdfRequestFiles from "../pages/PdfRequestFiles";
import { pdfjs } from "react-pdf";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import "../index.css";
import "./i18n";
import { isPublicStaging } from "../constant/const";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// Wrapper component to manage props
const PublicScriptFileWrapper = ({ initialProps }) => {
  const [props, setProps] = useState(initialProps);

  // Make the setProps function globally accessible
  useEffect(() => {
    window.updatePublicTemplateProps = setProps;

    return () => {
      window.updatePublicTemplateProps = undefined;
    };
  }, []);

  return <PdfRequestFiles {...props} />;
};

const appId = isPublicStaging ? "opensign" : "legadranaxn";
//"opensign"

const serverUrl = isPublicStaging
  ? "https://staging-app.opensignlabs.com/api/app"
  : "https://app.opensignlabs.com/api/app";
//  "https://staging-app.opensignlabs.com/api/app"

localStorage.setItem("baseUrl", `${serverUrl}/`);
localStorage.setItem("parseAppId", appId);
Parse.initialize(appId);
Parse.serverURL = serverUrl;
// Create a new div element and append it to the body
const scriptComponent = document.createElement("div");
scriptComponent.id = "script-component";
document.body.appendChild(scriptComponent);
const link = document.createElement("link");
link.href = "https://cdn.opensignlabs.com/fonts.css";
link.rel = "stylesheet";
document.head.appendChild(link);

//add the Tailwind CSS file
const tailwindCssLink = document.createElement("link");
tailwindCssLink.href =
  "https://app.opensignlabs.com/static/js/public-template.bundle.css"; // css bundle file
tailwindCssLink.rel = "stylesheet";
document.head.appendChild(tailwindCssLink);
// Create a root and render the wrapper component with initial props
const root = ReactDOM.createRoot(document.getElementById("script-component"));
root.render(
  <div data-theme="opensigncss">
    <Provider store={store}>
      <PublicScriptFileWrapper initialProps={{ text: "templateId" }} />
    </Provider>
  </div>
);
