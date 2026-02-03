import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type UserProfile = {
  email?: string;
  [key: string]: unknown;
};

type AuthState = {
  data: UserProfile | null;
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
    SET_ACTIVE_USER: (state, action: PayloadAction<UserProfile>) => {
      state.data = action.payload;
      state.loading = "yes";
    },
    REMOVE_USER: (state) => {
      state.data = null;
      state.loading = "no";
    },
    RELOAD_USER: (state) => {
      state.reload = true;
    },
  },
});

export const { SET_ACTIVE_USER, REMOVE_USER, RELOAD_USER } = auth.actions;

export default auth.reducer;
