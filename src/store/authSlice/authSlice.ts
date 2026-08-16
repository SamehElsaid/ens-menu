import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AuthSessionCache } from "@/types/User";

type AuthState = {
  data: AuthSessionCache | null;
  loading: boolean | string;
  reload: boolean;
};

const initialState: AuthState = {
  data: null,
  loading: false,
  reload: false,
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    cacheAuthoritativeSession: (
      state,
      action: PayloadAction<AuthSessionCache>,
    ) => {
      state.data = action.payload;
      state.loading = "yes";
    },
    clearSessionCache: (state) => {
      state.data = null;
      state.loading = "no";
    },
    requestSessionReload: (state) => {
      state.reload = true;
    },
  },
});

export const {
  cacheAuthoritativeSession: SET_AUTH_SESSION_CACHE,
  clearSessionCache: CLEAR_AUTH_SESSION_CACHE,
  requestSessionReload: REQUEST_AUTH_SESSION_RELOAD,
} = auth.actions;

export default auth.reducer;
