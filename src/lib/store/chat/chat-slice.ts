import { ChatState, IConversation, IMessage, IUser, TypingState } from "./chat-slice-types";
import { Status } from "../../types/global-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import api from "../../http/api";

export interface SendMessagePayload {
  senderId: string;
  receiverId: string;
  content?: string;
  file?: File;
}
const initialState: ChatState = {
    conversations: [],
    messages: [],
    selectedConversation: null,
    selectedUser: null,
    loading: false,
    error: null,
    status: Status.IDLE,
    typing: null,
};

const chatSlice = createSlice({ 
    name: "chat",
    initialState,
   reducers: {
    setStatus(state, action: PayloadAction<Status>) {
        state.status = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
        state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
        state.error = action.payload;
    },

    setConversations(state, action: PayloadAction<IConversation[]>) {
        state.conversations = action.payload;
    },

    setMessages(state, action: PayloadAction<IMessage[]>) {
        state.messages = action.payload;
    },

    setSelectedConversation(
        state,
        action: PayloadAction<IConversation | null>
    ) {
        state.selectedConversation = action.payload;
    },

    setSelectedUser(
        state,
        action: PayloadAction<IUser | null>
    ) {
        state.selectedUser = action.payload;
    },

    setTyping(
        state,
        action: PayloadAction<TypingState | null>
    ) {
        state.typing = action.payload;
    },

    addMessage(state, action: PayloadAction<IMessage>) {
        state.messages.push(action.payload);
    },

    updateMessage(state, action: PayloadAction<IMessage>) {
        const index = state.messages.findIndex(
            (message) => message._id === action.payload._id
        );

        if (index !== -1) {
            state.messages[index] = action.payload;
        }
    },

    deleteMessage(state, action: PayloadAction<string>) {
        state.messages = state.messages.filter(
            (message) => message._id !== action.payload
        );
    },

    updateMessageStatus(
        state,
        action: PayloadAction<{
            messageId: string;
            status: "sent" | "delivered" | "read";
        }>
    ) {
        const message = state.messages.find(
            (m) => m._id === action.payload.messageId
        );

        if (message) {
            message.messageStatus = action.payload.status;
        }
    },
    removeConversation(state, action: PayloadAction<string>) {
  state.conversations = state.conversations.filter(
    c => c._id !== action.payload
  );
},
updateUserStatus(
  state,
  action: PayloadAction<{
    userId: string;
    isOnline: boolean;
    lastSeen: Date | null;
  }>
) {
  state.conversations.forEach((conversation) => {
    conversation.participants.forEach((participant) => {
      if (participant._id === action.payload.userId) {
        participant.isOnline = action.payload.isOnline;
        participant.lastSeen = action.payload.lastSeen;
      }
    });
  });

  if (
    state.selectedUser &&
    state.selectedUser._id === action.payload.userId
  ) {
    state.selectedUser.isOnline = action.payload.isOnline;
    state.selectedUser.lastSeen = action.payload.lastSeen;
  }
},
updateReaction(
  state,
  action: PayloadAction<IMessage>
) {
  const index = state.messages.findIndex(
    (message) => message._id === action.payload._id
  );

  if (index !== -1) {
    state.messages[index] = action.payload;
  }
}
}})

export default chatSlice.reducer;
export const {setStatus, setLoading, setError, setConversations, setMessages, setSelectedConversation, setSelectedUser, setTyping, addMessage, updateMessage, deleteMessage, updateMessageStatus, removeConversation, updateUserStatus, updateReaction} = chatSlice.actions;




export function sendMessage(data: SendMessagePayload) {
  return async function sendMessageThunk(dispatch: AppDispatch) {
    try {
      dispatch(setStatus(Status.LOADING));

      const formData = new FormData();

      formData.append("senderId", data.senderId);
      formData.append("receiverId", data.receiverId);

      if (data.content) {
        formData.append("content", data.content);
      }

      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await api.post(
        "/chat/send-message",
        formData
      );

      dispatch(addMessage(response.data.data));

      dispatch(setStatus(Status.SUCCESS));
    } catch (error: any) {
      dispatch(setStatus(Status.ERROR));

      dispatch(
        setError(
          error.response?.data?.message || "Failed to send message"
        )
      );
    }
  };
}

export function fetchConversations( ){
    return async function fetchConversationsThunk(dispatch:AppDispatch){
        try{

             dispatch(setStatus(Status.LOADING));

      const response = await api.get("/chat/conversations");

      dispatch(setConversations(response.data.data));

      dispatch(setStatus(Status.SUCCESS));
        } catch (error: any) {
            dispatch(setStatus(Status.ERROR));
            dispatch(
                setError(
                    error.response?.data?.message || "Failed to fetch conversations"
                )
            );
        }
    }
}
export function getMessages(conversationId: string) {
  return async function getMessagesThunk(dispatch: AppDispatch) {
    try {
      dispatch(setStatus(Status.LOADING));

      const response = await api.get(
        `/chat/${conversationId}/messages`
      );

      dispatch(setMessages(response.data.data));

      dispatch(setStatus(Status.SUCCESS));
    } catch (error: any) {
      dispatch(setStatus(Status.ERROR));

      dispatch(
        setError(
          error.response?.data?.message ||
          "Failed to fetch messages"
        )
      );
    }
  };
}

export function markMessagesAsRead(messageIds: string[]) {
  return async function markMessagesAsReadThunk(
    dispatch: AppDispatch
  ) {
    try {
      await api.patch("/chat/read", {
        messageId: messageIds,
      });

      messageIds.forEach((id) => {
        dispatch(
          updateMessageStatus({
            messageId: id,
            status: "read",
          })
        );
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export function deleteMessageThunk(messageId: string) {
  return async function (dispatch: AppDispatch) {
    try {
      await api.delete(`/chat/message/${messageId}`);

      dispatch(deleteMessage(messageId));
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message ||
          "Failed to delete message"
        )
      );
    }
  };
}


export function editMessage(
  messageId: string,
  content: string
) {
  return async function (dispatch: AppDispatch) {
    try {
      const response = await api.patch(
        `/chat/message/${messageId}`,
        {
          content,
        }
      );

      dispatch(updateMessage(response.data.data));
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message ||
          "Failed to edit message"
        )
      );
    }
  };
}

export function deleteConversation(
  conversationId: string
) {
  return async function (dispatch: AppDispatch) {
    try {
      await api.delete(`/chat/conversation/${conversationId}`);

      dispatch(removeConversation(conversationId));
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message ||
          "Failed to delete conversation"
        )
      );
    }
  };
}