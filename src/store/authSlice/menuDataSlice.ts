import type { Menu } from "@/types/Menu";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type MenuData = {
  menu: Menu | null;
  loading: boolean;
};

const initialState: MenuData = {
  menu: null,
  loading: true,
};

const menuData = createSlice({
  name: "menuData",
  initialState,
  reducers: {
    cacheActiveMenu: (state, action: PayloadAction<Menu>) => {
      state.menu = action.payload;
      state.loading = false;
    },
    markMenuCacheLoading: (state) => {
      state.loading = true;
    },
  },
});

export const {
  cacheActiveMenu: SET_ACTIVE_MENU_CACHE,
  markMenuCacheLoading: SET_MENU_CACHE_LOADING,
} = menuData.actions;

export default menuData.reducer;
