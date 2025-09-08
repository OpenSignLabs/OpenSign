import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./reducers/infoReducer";
import ShowTenant from "./reducers/ShowTenant";
import TourStepsReducer from "./reducers/TourStepsReducer";
import widgetReducer from "./reducers/widgetSlice";
import sidebarReducer from "./reducers/sidebarReducer";

export const store = configureStore({
  reducer: {
    appInfo: infoReducer,
    TourSteps: TourStepsReducer,
    ShowTenant,
    widget: widgetReducer,
    sidebar: sidebarReducer
  }
});
