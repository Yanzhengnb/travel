import { configureStore } from "@reduxjs/toolkit";
import travelReducer from "./travel/reducer";

const store = configureStore({
  reducer: {
    travel: travelReducer
  }
});

export default store;