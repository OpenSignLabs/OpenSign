import { createSlice } from "@reduxjs/toolkit";
const initialState = { isValidSession: true };
const userReducer = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    sessionStatus: (state, action) => {
      state.isValidSession = action.payload;
    }
  }
});

export const { sessionStatus } = userReducer.actions;

export default userReducer.reducer;
