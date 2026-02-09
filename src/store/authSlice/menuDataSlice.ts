import { Menu } from "@/types/Menu";
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
        SET_ACTIVE_USER: (state, action: PayloadAction<Menu>) => {
            state.menu = action.payload;
            state.loading = false;
        },
        SET_LOADING: (state) => {
            state.loading = true;
        },
    },
});

export const { SET_ACTIVE_USER, SET_LOADING } = menuData.actions;

export default menuData.reducer;
