import { configureStore } from "@reduxjs/toolkit";
import authSlice from './auth/auth-slice'
import themeSlice from './themestore/theme-slice'
const store = configureStore({
    reducer:{
auth : authSlice,
theme :themeSlice
    }
})
export default store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
