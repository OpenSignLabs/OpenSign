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
  lastIndex: "",
  scrollTriggerId: "",
  prefillImg: [],
  prefillImgLoad: {},
  typedSignFont: "Fasthand"
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
    setScrollTriggerId: (state, action) => {
      state.scrollTriggerId = action.payload;
    },
    setTypedSignFont: (state, action) => {
      state.typedSignFont = action.payload;
    },
    setPrefillImg: (state, action) => {
      const existingIndex = state.prefillImg.findIndex(
        (img) => img.id === action.payload.id
      );
      if (existingIndex !== -1) {
        // Replace the existing object with updated URL
        state.prefillImg[existingIndex] = {
          ...state.prefillImg[existingIndex],
          ...action.payload
        };
      } else {
        // Add new object
        state.prefillImg.push(action.payload);
      }
    },
    setPrefillImgLoad: (state, action) => {
      state.prefillImgLoad = action.payload;
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
  setLastIndex,
  setScrollTriggerId,
  setPrefillImg,
  setPrefillImgLoad,
  setTypedSignFont
} = widgetSlice.actions;

export default widgetSlice.reducer;
