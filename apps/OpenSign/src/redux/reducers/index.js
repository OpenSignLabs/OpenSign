import { combineReducers } from "redux";
import infoReducer from "./infoReducer";
import loginReducer from "./loginReducer";
import ShowTenant from "./ShowTenant";
import TourStepsReducer from "./TourStepsReducer";

export default combineReducers({
  appInfo: infoReducer,
  login: loginReducer,
  ShowTenant,
  TourSteps: TourStepsReducer
});
