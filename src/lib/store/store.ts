import { configureStore } from "@reduxjs/toolkit";
import authSlice from './auth/auth-slice'
import themeSlice from './themestore/theme-slice'
import uiSlice from './layout/ui-slice'
const store = configureStore({
    reducer:{
auth : authSlice,
theme :themeSlice,
layout : uiSlice
    }
})
export default store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
