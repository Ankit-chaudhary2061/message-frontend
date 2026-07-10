import { Status } from "../../types/global-types";

export interface IProfileImage {
  url: string | null;
  public_id: string | null;
}

export interface IUser {
  _id: string;

  username: string | null;
  email: string | null;

  phoneNumber: string | null;
  phoneSuffix: string | null;

  profileImage: IProfileImage;

  about: string | null;

  lastSeen: Date | null;

  isOnline: boolean;
  isVerified: boolean;
  isAuthenticated: boolean;
  agreed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// export interface IReaction {
//   user: Pick<IUser, "_id" | "username" | "profileImage">;
//   emoji: string;
// }
export interface IReaction {
  user: IUser;
  emoji: string;
}

export interface IMessage {
  _id: string;

  conversationId: string;
conversation:IConversation,
  sender: IUser;
  receiver: IUser;

  content: string;

  imageOrVideoUrl?: string;

  contentType: "text" | "image" | "video";

  messageStatus: "sent" | "delivered" | "read";

  reactions: IReaction[];

  isEdited: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;

  participants: IUser[];

  lastMessage: IMessage;

  lastMessageTime: string;

  unreadCounts: number;

  createdAt: string;
  updatedAt: string;
}

export interface TypingState {
  conversationId: string;
  isTyping: boolean;
}

export interface ChatState {
    conversations: IConversation[];
    messages: IMessage[];

    selectedConversation: IConversation | null;
    selectedUser: IUser | null;

    loading: boolean;
    error: string | null;

    typing: TypingState | null;
    status: Status;
}