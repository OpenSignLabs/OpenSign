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
  myStamp: null,
  lastIndex: "",
  scrollTriggerId: "",
  prefillImg: [],
  prefillImgLoad: {},
  typedSignFont: "Fasthand",
  signatureResponse: [],
  isBulkLoader: false
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
    setMyStamp: (state, action) => {
      state.myStamp = action.payload;
    },
    setSignatureRes: (state, action) => {
      const payload = action.payload;
      const { type } = payload;
      const index = state.signatureResponse.findIndex(
        (item) => item.type === type
      );
      if (index !== -1) {
        // 🔁 Update existing object by type
        state.signatureResponse[index] = {
          ...state.signatureResponse[index],
          ...payload
        };
        return;
      }
      // ➕ Add only if less than 2 objects
      if (state.signatureResponse.length < 3) {
        state.signatureResponse.push(payload);
      }
    },
    setBulkLoader: (state, action) => {
      state.isBulkLoader = action.payload;
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
  setTypedSignFont,
  setMyStamp,
  setSignatureRes,
  setBulkLoader
} = widgetSlice.actions;

export default widgetSlice.reducer;
