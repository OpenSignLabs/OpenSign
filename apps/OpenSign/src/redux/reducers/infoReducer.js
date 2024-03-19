import { createSlice } from "@reduxjs/toolkit";
import { appInfo } from "../../constant/appinfo";

const infoSlice = createSlice({
  name: "info",
  initialState: {},
  reducers: {
    fetchAppInfo: () => {
      localStorage.setItem("_appName", appInfo.appname);
      localStorage.setItem("_app_objectId", appInfo.objectId);
      localStorage.setItem("baseUrl", `${appInfo.baseUrl}/`);
      localStorage.setItem("parseAppId", appInfo.appId);
      localStorage.setItem("appLogo", appInfo.applogo);
      localStorage.setItem("appVersion", appInfo.version);
      localStorage.removeItem("userSettings");
      localStorage.setItem("userSettings", JSON.stringify(appInfo.settings));
      localStorage.setItem("appTitle", appInfo.appTitle);
      localStorage.setItem("fev_Icon", appInfo.fev_Icon);
      return appInfo;
    }
  }
});
export const { fetchAppInfo } = infoSlice.actions;
export default infoSlice.reducer;
