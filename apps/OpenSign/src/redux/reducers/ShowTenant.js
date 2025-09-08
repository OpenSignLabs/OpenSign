import { createSlice } from "@reduxjs/toolkit";

const showTenantSlice = createSlice({
  name: "showTenant",
  initialState: "",
  reducers: {
    showTenant: (state, action) => {
      return action.payload;
    }
  }
});

export const { showTenant } = showTenantSlice.actions;
export default showTenantSlice.reducer;
