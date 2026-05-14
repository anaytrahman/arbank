import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./../reducers/authslice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
