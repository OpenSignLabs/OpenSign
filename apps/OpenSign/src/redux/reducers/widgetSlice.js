// reducers/widgetSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isShowModal: false,
  saveSignCheckbox: {
    isVisible: false,
    signId: ""
  },
  signatureTypes: null,
  defaultSignImg: null,
  myInitial: null,
  lastIndex: ""
};

const widgetSlice = createSlice({
  name: "widget",
  initialState,
  reducers: {
    setIsShowModal: (state, action) => {
      state.isShowModal = action.payload;
    },
    setSaveSignCheckbox: (state, action) => {
      state.saveSignCheckbox = action.payload;
    },
    setSignatureTypes: (state, action) => {
      state.signatureTypes = action.payload;
    },
    setDefaultSignImg: (state, action) => {
      state.defaultSignImg = action.payload;
    },
    setMyInitial: (state, action) => {
      state.myInitial = action.payload;
    },
    setLastIndex: (state, action) => {
      state.lastIndex = action.payload;
    },
    resetWidgetState: () => initialState
  }
});

export const {
  setIsShowModal,
  setSaveSignCheckbox,
  setSignatureTypes,
  setMyInitial,
  resetWidgetState,
  setDefaultSignImg,
  setLastIndex
} = widgetSlice.actions;

export default widgetSlice.reducer;
