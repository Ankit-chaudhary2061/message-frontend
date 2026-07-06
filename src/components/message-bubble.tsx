import {
  IMessage,
  IUser,
} from "../lib/store/chat/chat-slice-types";

interface MessageBubbleProps {
  message: IMessage;
  theme: string;
  currentUser: IUser;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
}

const MessageBubble = ({
  message,
  theme,
  currentUser,
  onReact,
  onDelete,
}: MessageBubbleProps) => {
  const isOwnMessage = message.sender._id === currentUser._id;

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
     
        <p>{message.content}</p>

        
      </div>
   
  );
};

export default MessageBubble;