import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./reducers/infoReducer";
import ShowTenant from "./reducers/ShowTenant";
import TourStepsReducer from "./reducers/TourStepsReducer";
export const store = configureStore({
  reducer: {
    appInfo: infoReducer,
    TourSteps: TourStepsReducer,
    ShowTenant
  },
  devTools: process.env.NODE_ENV !== "production"
});
