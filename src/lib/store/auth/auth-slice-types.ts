import { Status } from "../../types/global-types";

export interface IProfileImage {
  url: string | null;
  public_id: string | null;
}

export interface IUser {
  _id: string;

  phoneNumber: string | null;
  phoneSuffix: string | null;

  username: string | null;
  email: string | null;

  profileImage: IProfileImage;

  about: string | null;

  lastSeen: Date | null;

  isOnline: boolean;
  isVerified: boolean;
  agreed: boolean;
  isAuthenticated: boolean;

  createdAt: Date;
  updatedAt: Date;
}
export interface IAuthState {
  user: IUser | null;

  loginStatus: Status;
  otpStatus: Status;
  profileStatus: Status;
}