import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/dark-theme-improvements.css";
import App from "./App";
import { showUpgradeProgress, hideUpgradeProgress } from "./utils";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Parse from "parse";
import "./polyfills";
import { serverUrl_fn } from "./constant/appinfo";
import { appInfo } from "./constant/appinfo";
import "./i18n";
import { ScrollProvider } from "./context/ScrollPdfContext";
import { applyRuntimeFont } from "./constant/brandPresentation";
import { getRuntimeConfig } from "./constant/runtimeConfig";
import {
  getLocalQaUser,
  initializeLocalQaIdentity,
  LOCAL_QA_APP_ID
} from "./qa/localQaIdentity";

if (
  import.meta.env.DEV &&
  import.meta.env.MODE === "local-qa" &&
  window.__OPENSIGN_LOCAL_QA_STORAGE_READY__ !== true
) {
  document.getElementById("root").textContent =
    "Local QA mode could not establish isolated browser storage. Restart it on localhost with the qa:local script.";
  throw new Error(
    "Local QA mode requires isolated session-backed browser storage."
  );
}

const localQaIdentityActive = initializeLocalQaIdentity();
const startupRuntimeConfig = getRuntimeConfig();
applyRuntimeFont(startupRuntimeConfig);
document.documentElement.setAttribute(
  "data-brand",
  startupRuntimeConfig.brandKey || "opensign"
);


const appId =
  (localQaIdentityActive ? LOCAL_QA_APP_ID : null) ||
  import.meta.env.VITE_APPID ||
  process.env.REACT_APP_APPID ||
  "opensign";
const serverUrl = serverUrl_fn();
Parse.initialize(appId);
Parse.serverURL = serverUrl;

if (localStorage.getItem("showUpgradeProgress")) {
  showUpgradeProgress();
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "opensigndark");
} else {
  document.documentElement.setAttribute("data-theme", "opensigncss");
}


const root = ReactDOM.createRoot(document.getElementById("root"));
const renderApp = () =>
  root.render(
    <Provider store={store}>
      <ScrollProvider>
        <App />
      </ScrollProvider>
    </Provider>
  );

if (localQaIdentityActive) {
  Parse.User.hydrate(getLocalQaUser())
    .then(renderApp)
    .catch((error) => {
      console.error("Unable to initialize the local QA identity:", error);
      renderApp();
    });
} else {
  renderApp();
}

hideUpgradeProgress();
localStorage.removeItem("showUpgradeProgress");
