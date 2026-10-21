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
import { getEnv } from "./constant/Utils";
import { appInfo } from "./constant/appinfo";
import "./i18n";
import { ScrollProvider } from "./context/ScrollPdfContext";
import { applyRuntimeFont } from "./constant/brandPresentation";
import { getRuntimeConfig } from "./constant/runtimeConfig";

const startupRuntimeConfig = getRuntimeConfig();
applyRuntimeFont(startupRuntimeConfig);
document.documentElement.setAttribute(
  "data-brand",
  startupRuntimeConfig.brandKey || "opensign"
);


const appId =
  getEnv()?.REACT_APP_APPID ||
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
root.render(
  <Provider store={store}>
    <ScrollProvider>
      <App />
    </ScrollProvider>
  </Provider>
);

hideUpgradeProgress();
localStorage.removeItem("showUpgradeProgress");
