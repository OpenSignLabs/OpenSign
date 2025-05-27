import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./reducers/infoReducer";
import ShowTenant from "./reducers/ShowTenant";
import TourStepsReducer from "./reducers/TourStepsReducer";
import showHeader from "./reducers/showHeader";
import widgetReducer from "./reducers/widgetSlice";

export const store = configureStore({
  reducer: {
    appInfo: infoReducer,
    TourSteps: TourStepsReducer,
    ShowTenant,
    showHeader,
    widget: widgetReducer
  }
});
