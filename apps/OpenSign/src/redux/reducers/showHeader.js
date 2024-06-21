import { createSlice } from "@reduxjs/toolkit";

const showHeaderSlice = createSlice({
  name: "showTenant",
  initialState: "",
  reducers: {
    showHeader: (state, action) => {
      return action.payload;
    }
  }
});

export const { showHeader } = showHeaderSlice.actions;
export default showHeaderSlice.reducer;
