import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  userInfo: {},
  isValidSession: true,
  isLoader: false,
  isTopLoader: false,
  tenantInfo: {},
  alertInfo: { type: "success", msg: "" }
};
const userReducer = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    sessionStatus: (state, action) => {
      state.isValidSession = action.payload;
    },
    setTenantInfo: (state, action) => {
      state.tenantInfo = action.payload;
    },
    setLoader: (state, action) => {
      state.isLoader = action.payload;
    },
    setTopLoader: (state, action) => {
      state.isTopLoader = action.payload;
    },
    setAlertInfo: (state, action) => {
      state.alertInfo = {
        type: action.payload?.type,
        msg: action.payload?.msg
      };
    }
  }
});

export const {
  setUserInfo,
  sessionStatus,
  setTenantInfo,
  setLoader,
  setTopLoader,
  setAlertInfo
} = userReducer.actions;

export default userReducer.reducer;
