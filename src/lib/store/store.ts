import { configureStore } from "@reduxjs/toolkit";
import authSlice from './auth/auth-slice'
import themeSlice from './themestore/theme-slice'
import uiSlice from './layout/ui-slice'
import chatSlice from "./chat/chat-slice";
const store = configureStore({
    reducer:{
auth : authSlice,
theme :themeSlice,
layout : uiSlice,
chat:chatSlice
    }
})
export default store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
