import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { deleteMessage, fetchConversations, getMessages, sendMessage, setSelectedConversation, setSelectedUser } from "../lib/store/chat/chat-slice";
import {
  addReaction,
  startTyping,
  stopTyping,
} from "../lib/socket/socket-events";
import {isToday, isYesterday, format} from "date-fns";
import Image from "next/image";
import wp from "../../src/images/wp.png"
import { FaArrowLeft, FaEllipsisV, FaLock, FaVideo } from "react-icons/fa";
import { IConversation } from "../lib/store/chat/chat-slice-types";
import MessageBubble from "./message-bubble";
import { deleteMessageThunk } from "../lib/store/chat/chat-slice";



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
);console.log("Initial chatSelectedUser:", chatSelectedUser);
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

  let dateLabel = "";
  if (isToday(messageDate)) {
    dateLabel = "Today";
  } else if (isYesterday(messageDate)) {
    dateLabel = "Yesterday";
  } else {
    dateLabel = format(messageDate, "MMMM dd, yyyy");
  }

  return (
    <div className="flex items-center justify-center my-4">
      <span className={`px-4 py-2 rounded-full text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}`}>
        {dateLabel}
      </span>
    </div>
  );
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

const handleConversationClick = (conversation: IConversation) => {
  dispatch(setSelectedConversation(conversation));

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== user!._id
  );

  dispatch(setSelectedUser(otherUser || null));

  dispatch(getMessages(conversation._id));
};
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
console.log("chatSelectedUser", chatSelectedUser);
if (!chatSelectedUser) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center mx-auto h-screen text-center">
      <div className="max-w-md">
        <Image
          src={wp}
          alt="WhatsApp"
          className="w-full h-auto"
        />

        <h2
          className={`text-3xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Select a conversation to start chatting
        </h2>

        <p
          className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Choose a contact from the list.
        </p>

        <p
          className={`text-sm mt-8 flex items-center justify-center gap-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <FaLock className="w-4 h-4" />
          Your personal messages are end-to-end encrypted.
        </p>
      </div>
    </div>
  );
}

return (
  <>
    <div className="flex-1 h-screen w-full flex flex-col">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === "dark"
            ? "bg-[#202c33] border-gray-700 text-white"
            : "bg-[rgb(239,242,245)] border-gray-300 text-gray-900"
        }`}
      >
        {/* Left Side */}
        <div className="flex items-center">
          <button
            onClick={() => dispatch(setSelectedUser(null))}
            className="mr-3 focus:outline-none"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>

          <Image
  src={chatSelectedUser.profileImage?.url || "/default-avatar.png"}
  alt={chatSelectedUser.username || "User"}
  width={40}
      height={40}
      className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-700"
/>
          <div className="ml-3">
            <h2 className="font-semibold text-base">
              {chatSelectedUser.username}
            </h2>

            <p
              className={`text-sm ${
                theme === "dark"
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {isTyping
                ? "Typing..."
                : online
                ? "Online"
                : lastSeen
                ? `Last seen ${format(
                    new Date(lastSeen),
                    "hh:mm a"
                  )}`
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <button className="hover:text-green-500 transition">
            <FaVideo className="h-5 w-5" />
          </button>

          <button className="hover:text-green-500 transition">
            <FaEllipsisV className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
     <div
  className={`flex-1 p-4 overflow-y-auto ${
    theme === "dark"
      ? "bg-[#191b1a]"
      : "bg-[rgb(241,236,229)]"
  }`}
>
{Object.entries(groupedMessages).map(([date, msgs]) => (
  <React.Fragment key={date}>
    {renderDateSeparator(date)}

    {msgs.map((msg) => (
      <MessageBubble
  key={msg._id}
  message={msg}
  theme={theme}
  currentUser={user!}
  onReact={handleReaction}
  onDelete={(id) => dispatch(deleteMessageThunk(id))}
/>
    ))}
  </React.Fragment>
))}
<div ref={messageEndRef}/>
</div>

      {/* Message Input */}
      <div>
        {/* Input */}
      </div>
    </div>
  </>
);
};

 