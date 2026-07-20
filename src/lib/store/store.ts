import { configureStore } from "@reduxjs/toolkit";
import authSlice from './auth/auth-slice'
import themeSlice from './themestore/theme-slice'
import uiSlice from './layout/ui-slice'
import chatSlice from "./chat/chat-slice";
import videoSlice from './video/video-slice'
const store = configureStore({
    reducer:{
auth : authSlice,
theme :themeSlice,
layout : uiSlice,
chat:chatSlice,
video : videoSlice
    }
})
export default store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
