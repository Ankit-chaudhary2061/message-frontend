import { socket } from "./socket";

export const startTyping = (
  conversationId: string,
  receiverId: string
) => {
  socket.emit("typing", {
    conversationId,
    receiverId,
  });
};

export const stopTyping = (
  conversationId: string,
  receiverId: string
) => {
  socket.emit("typing_stop", {
    conversationId,
    receiverId,
  });
};


export const addReaction = (
  messageId: string,
  userId: string,
  reactionUserId: string,
  emoji: string
) => {
  socket.emit("add_reaction", {
    messageId,
    userId,
    reactionUserId,
    emoji,
  });
};