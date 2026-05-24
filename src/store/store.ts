import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice/authSlice";
import menuDataReducer from "./authSlice/menuDataSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    menuData: menuDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
