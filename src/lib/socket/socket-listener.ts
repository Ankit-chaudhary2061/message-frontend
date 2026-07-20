import { Socket } from "socket.io-client";
import { AppDispatch } from "../store/store";

import {
  addMessage,
  updateMessage,
  deleteMessage,
  updateMessageStatus,
  setTyping,
  setError,updateUserStatus,
  updateReaction,
} from "../store/chat/chat-slice";
import { acceptCall, clearVideoCall, closeCallModal, openCallModal, setCallStatus, setIncomingCall } from "../store/video/video-slice";


export const registerSocketListeners = ( 
  socket: Socket,
  dispatch: AppDispatch
) => {
  /**
   * ==========================
   * New Message
   * ==========================
   */
  socket.on("receive_message", (message) => {
    dispatch(addMessage(message));
  });

  /**
   * ==========================
   * Message Read Receipt
   * ==========================
   */
  socket.on(
    "message_read_receipt",
    ({
      messageId,
      messageStatus,
    }: {
      messageId: string;
      messageStatus: "read";
    }) => {
      dispatch(
        updateMessageStatus({
          messageId,
          status: messageStatus,
        })
      );
    }
  );

  /**
   * ==========================
   * Typing
   * ==========================
   */
  socket.on(
    "typing",
    ({
      conversationId,
      isTyping,
    }: {
      conversationId: string;
      isTyping: boolean;
    }) => {
      dispatch(
        setTyping({
          conversationId,
          isTyping,
        })
      );
    }
  );

  /**
   * ==========================
   * Message Deleted
   * ==========================
   */
  socket.on(
    "messageDeleted",
    ({ messageId }: { messageId: string }) => {
      dispatch(deleteMessage(messageId));
    }
  );

  /**
   * ==========================
   * Message Edited
   * ==========================
   *
   * Add this only if backend emits
   * "message_updated"
   */
  socket.on("message_updated", (message) => {
    dispatch(updateMessage(message));
  });

  /**
   * ==========================
   * Reaction Updated
   * ==========================
   *
   * We'll create a reducer later.
   */
socket.on("reaction_updated", (message) => {
  dispatch(updateReaction(message));
});

  /**
   * ==========================
   * User Online/Offline
   * ==========================
   *
   * We'll create reducers later.
   */
  socket.on(
    "user-status",
    ({
        userId,
        isOnline,
        lastSeen,
    }) => {
        dispatch(
            updateUserStatus({
                userId,
                isOnline,
                lastSeen,
            })
        );
    }
);

// Incoming call
socket.on("incoming_call", (data) => {
  dispatch(setIncomingCall(data));
  dispatch(setCallStatus("incoming"));
  dispatch(openCallModal());
});

// Call accepted
socket.on("call_accepted", (data) => {
  dispatch(acceptCall(data));
  dispatch(setCallStatus("connecting"));
});

// Call rejected
socket.on("call_rejected", () => {
  dispatch(setCallStatus("rejected"));
  dispatch(closeCallModal());
  dispatch(clearVideoCall());
});

// Call failed (user offline, receiver unavailable, etc.)
socket.on("call_failed", ({ reason }) => {
  console.log("Call failed:", reason);

  dispatch(setError(reason));
  dispatch(setCallStatus("failed"));

  setTimeout(() => {
    dispatch(closeCallModal());
    dispatch(clearVideoCall());
  }, 2000);
});

// Call ended
socket.on("call_ended", () => {
  dispatch(setCallStatus("ended"));
  dispatch(closeCallModal());
  dispatch(clearVideoCall());
});
  /**
   * ==========================
   * Errors
   * ==========================
   */

  socket.on("message-error", ({ message }) => {
    dispatch(setError(message));
  });

  socket.on("typing-error", ({ message }) => {
    dispatch(setError(message));
  });

  socket.on("reaction-error", ({ message }) => {
    dispatch(setError(message));
  });

  socket.on("read-receipt-error", ({ message }) => {
    dispatch(setError(message));
  });
};

export const removeSocketListeners = (socket: Socket) => {
  socket.off("receive_message");
  socket.off("message_read_receipt");
  socket.off("typing");
  socket.off("messageDeleted");
  socket.off("message_updated");
  socket.off("reaction_updated");
  socket.off("user-status");
  socket.off("message-error");
  socket.off("typing-error");
  socket.off("reaction-error");
  socket.off("read-receipt-error");
};