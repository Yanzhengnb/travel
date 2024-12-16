import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  travels: []
};

const travelSlice = createSlice({
  name: "travel",
  initialState,
  reducers: {}
});

export default travelSlice.reducer;