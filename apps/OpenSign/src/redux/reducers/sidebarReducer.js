import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: { isOpen: true },
  reducers: {
    toggleSidebar: (state, action) => {
      if (typeof action.payload === "undefined") {
        // no payload provided → just toggle
        state.isOpen = !state.isOpen;
      } else {
        // payload provided → use it directly
        state.isOpen = action.payload;
      }
    }
  }
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
