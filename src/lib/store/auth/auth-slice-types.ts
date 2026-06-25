import { Status } from "../../types/global-types";

export interface IProfileImage {
  url: string | null;
  public_id: string | null;
}
export interface IMessage {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}

export interface IConversation {
  _id: string;
  participants: string[];

  lastMessage?: IMessage;

  unReadCounts: number;
  lastMessageTime?: Date;
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

  conversation?: IConversation | null;
}
export interface IAuthState {
  user: IUser | null;
  users: IUser[];
  loginStatus: Status;
  usersStatus: Status;
  otpStatus: Status;
  profileStatus: Status;
}