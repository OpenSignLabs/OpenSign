import { combineReducers } from "redux";
import infoReducer from "./infoReducer";
import ShowTenant from "./ShowTenant";
import TourStepsReducer from "./TourStepsReducer";
import showHeader from "./showHeader";

export default combineReducers({
  appInfo: infoReducer,
  TourSteps: TourStepsReducer,
  ShowTenant,
  showHeader
});
