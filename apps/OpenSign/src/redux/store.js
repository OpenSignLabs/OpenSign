// import { createStore, applyMiddleware } from "redux";
// import thunk from "redux-thunk";
// import reducers from "./reducers";

// export const store = createStore(reducers, applyMiddleware(thunk));
import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./reducers/infoReducer";
import ShowTenant from "./reducers/ShowTenant";
import TourStepsReducer from "./reducers/TourStepsReducer";
export const store = configureStore({
  reducer: {
    appInfo: infoReducer,
    TourSteps: TourStepsReducer,
    ShowTenant
  }
});
