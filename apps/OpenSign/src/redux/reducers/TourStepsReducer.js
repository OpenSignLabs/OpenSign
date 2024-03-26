import { createSlice } from "@reduxjs/toolkit";

const tourStepSlice = createSlice({
  name: "tourStep",
  initialState: [],
  reducers: {
    saveTourSteps: (state, action) => {
      return action.payload;
    },
    removeTourSteps: () => {
      return [];
    }
  }
});

export const { saveTourSteps, removeTourSteps } = tourStepSlice.actions;
export default tourStepSlice.reducer;
