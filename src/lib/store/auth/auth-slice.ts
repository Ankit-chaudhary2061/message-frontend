import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../types/global-types";
import {  IAuthState, IUser } from "./auth-slice-types";
import api from "../../http/api";
import { AppDispatch } from "../store";
import { toast } from "react-toastify";
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
  users: [],
  loginStatus: Status.IDLE,
  usersStatus: Status.IDLE,
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
    setUsers: (state, action: PayloadAction<IUser[]>) => {
  state.users = action.payload;
},

setUsersStatus: (state, action: PayloadAction<Status>) => {
  state.usersStatus = action.payload;
},
  },
});
export default authSlice.reducer;

export const { setUser, setLoginStatus, setOtpStatus, setProfileStatus, setUsers ,setUsersStatus } = authSlice.actions;

export function loginUser(data: SendOtpPayload) {
  return async function loginUserThunk(dispatch: AppDispatch) {
    try {
      dispatch(setLoginStatus(Status.LOADING));

      const response = await api.post("/auth/send-otp", data);

      dispatch(setLoginStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
  console.log("ERROR:", error);
  console.log("RESPONSE:", error?.response);
  console.log("DATA:", error?.response?.data);

  toast.error(
    error?.response?.data?.message ||
    error?.message ||
    "Failed to send OTP"
  );
}
  };
}
export function verifyOtp(data: VerifyOtpPayload) {
  return async function verifyOtpThunk(dispatch: AppDispatch) {
    try {
      dispatch(setOtpStatus(Status.LOADING));

      console.log("VERIFY PAYLOAD:", data);

      const response = await api.post("/auth/verify-otp", data);

      dispatch(setUser(response.data.user));
      dispatch(setOtpStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setOtpStatus(Status.ERROR));

      console.log("VERIFY ERROR:", error);
      console.log("VERIFY RESPONSE:", error?.response);
      console.log("VERIFY DATA:", error?.response?.data);

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed"
      );
    }
  };
}
export function updateProfile(formData: FormData) {
  return async function updateProfileThunk(dispatch: AppDispatch) {
    try {
      dispatch(setProfileStatus(Status.LOADING));

      const response = await api.patch(
        "/auth/update-profile",
        formData
      );

      dispatch(setUser(response.data.user));
      dispatch(setProfileStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setProfileStatus(Status.ERROR));

      console.log("PROFILE ERROR:", error?.response?.data || error);

      throw error;
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
      await api.post("/auth/resend-phone-otp", data);
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

      const response = await api.get("/auth/check-auth");

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

      const response = await api.post("/auth/logout");

      dispatch(setUser(null));
      dispatch(setLoginStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setLoginStatus(Status.ERROR));
      throw error.response?.data || error;
    }
  };
}
export function getAllUsers() {
  return async function getAllUsersThunk(
    dispatch: AppDispatch
  ) {
    try {
      dispatch(setUsersStatus(Status.LOADING));

      const response = await api.get("/auth/users");

      console.log(response.data);

      dispatch(setUsers(response.data.data));

      dispatch(setUsersStatus(Status.SUCCESS));

      return response.data;
    } catch (error: any) {
      dispatch(setUsersStatus(Status.ERROR));
      throw error;
    }
  };
}
