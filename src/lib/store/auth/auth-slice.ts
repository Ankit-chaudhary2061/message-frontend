import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../types/global-types";
import { IAuthState, IUser } from "./auth-slice-types";
import api from "../../http/api";
import { AppDispatch } from "../store";
export interface SendOtpPayload {
  email?: string;
  phoneNumber?: string;
  phoneSuffix?: string;
}
interface VerifyOtpPayload {
  email?: string;
  emailOtp?: string;
  phoneNumber?: string;
  phoneSuffix?: string;
  otp?: string;
}
const initialState: IAuthState = {
  user: null,
  loginStatus: Status.IDLE,
  otpStatus: Status.IDLE,
  profileStatus: Status.IDLE,
};
export interface UpdateProfileData {
  username: string;
  about: string;
  agreed: boolean;
  profileImage: File | null;
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state: IAuthState, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
    },
    setLoginStatus: (state: IAuthState, action: PayloadAction<Status>) => {
      state.loginStatus = action.payload;
    },
    setOtpStatus: (state: IAuthState, action: PayloadAction<Status>) => {
      state.otpStatus = action.payload;
    },
    setProfileStatus: (state: IAuthState, action: PayloadAction<Status>) => {
      state.profileStatus = action.payload;
    },
  },
});
export default authSlice.reducer;

export const { setUser, setLoginStatus, setOtpStatus, setProfileStatus } = authSlice.actions;

export function loginUser(data: SendOtpPayload) {
  return async function loginUserThunk(dispatch: AppDispatch) {
    try {
      dispatch(setLoginStatus(Status.LOADING));

      const response = await api.post("/send-otp", data);

      dispatch(setLoginStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setLoginStatus(Status.ERROR));
      throw error.response?.data || error;
    }
  };
}
export function verifyOtp(data: VerifyOtpPayload) {
  return async function verifyOtpThunk(dispatch: AppDispatch) {
    try {
      dispatch(setOtpStatus(Status.LOADING));

      const response = await api.post("/verify-otp", data);

      dispatch(setUser(response.data.user));
      dispatch(setOtpStatus(Status.SUCCESS));



      return response.data;
    } catch (error: any) {
      dispatch(setOtpStatus(Status.ERROR));
      throw error.response?.data || error;
    }
  };
}

export function updateProfile(formData:FormData) {
  return async function updateProfileThunk(dispatch: AppDispatch) {
    try {
      dispatch(setProfileStatus(Status.LOADING));

      const response = await api.put("/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // update redux user instantly
      dispatch(setUser(response.data.user));

      dispatch(setProfileStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setProfileStatus(Status.ERROR));
      throw error.response?.data || error;
    }
  };
}
export function resendOtp(email:string){
  return async function resendOtpThunk(dispatch :AppDispatch){
   try {
   await api.post("/resend-otp", { email })
} catch (error) {
   console.error("Resend OTP failed", error)
}
  }
}
export function resendPhoneOtp(data: SendOtpPayload) {
  return async function resendPhoneOtpThunk(dispatch: AppDispatch) {
    try {
      await api.post("/resend-phone-otp", data);
    } catch (error: any) {
      console.error("Phone OTP resend failed", error);
      throw error.response?.data || error;
    }
  };
}


export function checkAuth() {
  return async function checkAuthThunk(dispatch: AppDispatch) {
    try {
      dispatch(setLoginStatus(Status.LOADING));

      const response = await api.get("/check-auth");

      dispatch(setUser(response.data.user));
      dispatch(setLoginStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setUser(null));
      dispatch(setLoginStatus(Status.ERROR));

      throw error.response?.data || error;
    }
  };
}

export function logOut() {
  return async function logOutThunk(dispatch: AppDispatch) {
    try {
      dispatch(setLoginStatus(Status.LOADING));

      const response = await api.post("/logout");

      dispatch(setUser(null));
      dispatch(setLoginStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setLoginStatus(Status.ERROR));
      throw error.response?.data || error;
    }
  };
}

