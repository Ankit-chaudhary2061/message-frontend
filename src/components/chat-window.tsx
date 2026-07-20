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
import { FaArrowLeft, FaEllipsisV, FaFile, FaImage, FaLock, FaPaperclip, FaPaperPlane, FaSmile, FaTimes, FaVideo } from "react-icons/fa";
import { IConversation } from "../lib/store/chat/chat-slice-types";
import MessageBubble from "./message-bubble";
import { deleteMessageThunk } from "../lib/store/chat/chat-slice";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { FiSend } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import VideoCallManager from "./video-call-manager";
import { socket } from "../lib/socket/socket";
import { initiateCall } from "../lib/store/video/video-slice";



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
const [isSending, setIsSending] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const messageEndRef = useRef<HTMLDivElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const fileMenuRef = useRef<HTMLDivElement>(null);
const emojiPicker = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      emojiPicker.current &&
      !emojiPicker.current.contains(event.target as Node)
    ) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
}, []);
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

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  let file = e.target.files?.[0];

  if (!file) return;

  // Convert HEIC/HEIF to JPEG
 if (
  file.type === "image/heic" ||
  file.type === "image/heif" ||
  file.name.toLowerCase().endsWith(".heic") ||
  file.name.toLowerCase().endsWith(".heif")
) {
  try {
    const { default: heic2any } = await import("heic2any");

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    file = new File(
      [convertedBlob as Blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      {
        type: "image/jpeg",
      }
    );
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    return;
  }
}
console.log("Name:", file.name);
console.log("Type:", file.type);
console.log("Size:", file.size);
  setSelectedFile(file);

  if (
    file.type.startsWith("image/") ||
    file.type.startsWith("video/")
  ) {
  const previewUrl = URL.createObjectURL(file);
console.log("Preview URL:", previewUrl);

setFilePreview(previewUrl);
  }

  setShowFileMenu(false);
  e.target.value = "";
};
const handleSendMessage = async () => {
  setIsSending(true);
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

    setMessage("");
    setSelectedFile(null);
    setFilePreview(null);

   if (selectedConversation && chatSelectedUser) {
  stopTyping(
    selectedConversation._id,
    chatSelectedUser._id
  );
}
  } catch (error) {
    console.error(error);
     setIsSending(false);
  }
};
const handleVideoCall = () => {
  if (chatSelectedUser && online) {
    dispatch(
      initiateCall(
        chatSelectedUser._id,
        chatSelectedUser.username ?? "Unknown user",
        chatSelectedUser.profileImage?.url ?? "",
        "video"
      )
    );
  } else {
    alert("User is offline");
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

          <button className="hover:text-green-500 transition" onClick={handleVideoCall}>
            <FaEllipsisV className="h-5 w-5 text-green-500 hover:text-green-600" />
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
{filePreview && (
  <div className="relative p-2 flex justify-center border-b border-gray-200 dark:border-gray-700">
    <div className="relative">
      {selectedFile?.type.startsWith("video/") ? (
        <video
          src={filePreview}
          controls
          className="max-h-[320px] max-w-full object-contain rounded-lg"
        />
      ) : (
        <Image
          src={filePreview}
          alt="file-preview"
          width={320}
          height={320}
          className="max-h-60 w-auto object-contain rounded-lg shadow-lg"
        />
      )}

      {/* Loader */}
      {isSending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>

    <button
      onClick={() => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
        setSelectedFile(null);
      }}
      disabled={isSending}
      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md disabled:opacity-50"
    >
      <FaTimes className="h-4 w-4" />
    </button>
  </div>
)}

      {/* Message Input */}
      <div className={`p-4 ${theme === 'dark' ? "bg-[#303430]" : "bg-white" } flex items-center space-x-2 relative`}>
        <button  className=" focus:outline-none" 
        onClick={()=> setShowEmojiPicker(!showEmojiPicker)}
        >

<FaSmile 
className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : "text-gray-500"}`}

/>

        </button>
        {/* Input */}
        {
  showEmojiPicker && (
    <div
      ref={emojiPicker}
      className="absolute left-0 bottom-14 z-50"
    >
      <EmojiPicker
  theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
  onEmojiClick={(emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }}
/>
    </div>
  )
}

<div className="relative">
  <button
  className="focus:outline-none"
  onClick={()=> setShowFileMenu(!showFileMenu)}
  >
<FaPaperclip className={`h-6 w-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mt-2`}/>


  </button>
{showFileMenu && (

  <div className={`absolute bottom-full left-0 mb-2 ${theme === 'dark' ? "bg-gray-700" : "bg-white"} rounded-lg shadow-lg`}>
<input type="file"
ref={fileInputRef}
onChange={handleFileChange}
accept="image/*,video/*,.pdf,.doc,.docx"
className="hidden"

/>
<button 
onClick={() =>fileInputRef.current?.click()}
className={`flex items-center px-4 py-2 w-full transition-colors hover:bg-gray-100 ${theme === 'dark' ? "hover:bg-gray-500" :"bg-gray-100"}`}
>

  <FaImage className="mr-2"/> Image/video
</button>
<button 
onClick={() =>fileInputRef.current?.click()}
className={`flex items-center px-4 py-2 w-full transition-colors hover:bg-gray-100 ${theme === 'dark' ? "hover:bg-gray-500" :"bg-gray-100"}`}
>

  <FaFile className="mr-2"/> documents
</button>
  </div>
)

}
     

</div>

<input
type="text"
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleSendMessage();
  }
}}
placeholder="Type a Message"
className={`flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
/>

<button onClick={handleSendMessage}
className="focus:outline-none"
>
<FaPaperPlane className="h-6 w-6 text-green-500"/>
</button>
      </div>
    </div>

<VideoCallManager socket={socket}/>

  </>
);
};

 