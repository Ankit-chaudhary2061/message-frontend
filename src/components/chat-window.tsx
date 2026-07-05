import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { fetchConversations, getMessages, sendMessage, setSelectedUser } from "../lib/store/chat/chat-slice";
import {
  addReaction,
  startTyping,
  stopTyping,
} from "../lib/socket/socket-events";
import {isToday, isYesterday, format} from "date-fns";





interface ChatWindowProps {
  selectedUser: string | null;
  isMobile: boolean;
}
const isValidDate = (date: Date) => {
  return date instanceof Date && !isNaN(date.getTime());
};


export const ChatWindow = ({ selectedUser, isMobile }: ChatWindowProps) => {
const dispatch = useAppDispatch(); 
  const {theme}= useAppSelector((state)=> state.theme)
  const {user}= useAppSelector((state)=> state.auth)
  const { selectedUser: chatSelectedUser, messages, conversations, typing ,selectedConversation} = useAppSelector(
    (state) => state.chat
);
const [message, setMessage] = useState("");
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [showFileMenu, setShowFileMenu] = useState(false);
const [filePreview, setFilePreview] = useState<string | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const messageEndRef = useRef<HTMLDivElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

const online = chatSelectedUser?.isOnline;
 const lastSeen = chatSelectedUser?.lastSeen;
const isTyping =
  typing?.conversationId === selectedConversation?._id &&
  typing?.isTyping;
useEffect(() => {
  const loadMessages = async () => {
    if (
      chatSelectedUser &&
      chatSelectedUser._id !== selectedUser &&
      conversations.length > 0
    ) {
      const conversation = conversations.find((coinv) =>
        coinv.participants.some((p) => p._id === selectedUser)
      );

      if (conversation?._id) {
        await dispatch(getMessages(conversation._id));
      }
    }
  };

  loadMessages();
}, [selectedUser, chatSelectedUser, conversations, dispatch]);

useEffect(() => {
  const loadConversations = async () => {
    await dispatch(fetchConversations());
  };

  loadConversations();
}, [dispatch, user?._id]);
const  scrollToBottom =()=>{
  messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
}
useEffect(()=>{
  scrollToBottom();
},[messages])

useEffect(() => {
  if (!message.trim()) return;
  if (!selectedConversation) return;
  if (!chatSelectedUser) return;

    startTyping(
        selectedConversation._id,
        chatSelectedUser._id
    );

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
        stopTyping(
            selectedConversation._id,
            chatSelectedUser._id
        );
    }, 3000);

    return () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };
}, [
    message,
    chatSelectedUser,
    selectedConversation,
]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFile(file);
    setShowFileMenu(false);
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      setFilePreview(URL.createObjectURL(file));
    }
  }
};
const handleSendMessage = async () => {
  if (!chatSelectedUser) return;

  if (!message.trim() && !selectedFile) return;

  try {
    await dispatch(
      sendMessage({
        senderId: user!._id,
        receiverId: chatSelectedUser._id,
        content: message.trim(),
        file: selectedFile ?? undefined,
      })
    );
await dispatch(getMessages(selectedConversation!._id));
    setMessage("");
    setSelectedFile(null);
    setFilePreview(null);

    stopTyping(
      selectedConversation!._id,
      chatSelectedUser._id
    );
  } catch (error) {
    console.error(error);
  }
};


const renderDateSeparator = (date: string) => {
  const messageDate = new Date(date);

  if (!isValidDate(messageDate)) {
    return null;
  }

  if (isToday(messageDate)) {
    return "Today";
  }

  if (isYesterday(messageDate)) {
    return "Yesterday";
  }else{
    return format(messageDate, "MMMM dd, yyyy");
  }
return (

<div className="flex items-center justify-center my-4">
  <span className={`px-4 py-2 rounded-full text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}`}>
    {renderDateSeparator(date)}
  </span>



</div>


)

};

const groupedMessages = Array.isArray(messages)
  ? messages.reduce((acc: Record<string, typeof messages>, message) => {
      if (!message.createdAt) return acc;

      const messageDate = new Date(message.createdAt);

      if (!isValidDate(messageDate)) {
        console.error(`Invalid date for message: ${message._id}`);
        return acc;
      }

      const dateString = format(messageDate, "yyyy-MM-dd");

      if (!acc[dateString]) {
        acc[dateString] = [];
      }

      acc[dateString].push(message);

      return acc;
    }, {} as Record<string, typeof messages>)
  : {};


 const handleReaction = (
  messageId: string,
  emoji: string
) => {
  if (!user || !chatSelectedUser) return;

  addReaction(
    messageId,
    user._id,
    chatSelectedUser._id,
    emoji
  );
};

  return (
    <>
      <div>


        
      </div>
    </>
  );
};

